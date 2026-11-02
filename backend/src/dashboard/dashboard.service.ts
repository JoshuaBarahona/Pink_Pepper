import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { EstadoPedido, Rol } from '../generated/prisma/enums.js';
import {
  OrdersMetricSummary,
  CourierAverageTimeItem,
  CouriersTimeMetricSummary,
  DailyEarningsItem,
  WeeklyEarningsMetricSummary,
  DashboardMetricsResponse,
} from './dto/dashboardSummary.dto.js';

const MS_PER_MINUTE = 60_000;
const MS_PER_DAY = 24 * 60 * 60 * 1000;
const DAYS_IN_WEEK = 7;

const DAY_NAMES_ES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboardMetrics(): Promise<DashboardMetricsResponse> {
    const { desde, hasta, inicioSemanaAnterior } = this.getWeeklyWindow();

    const [
      totalHistoricos,
      activosActualmente,
      pedidosCreadosSemana,
      pedidosEntregadosSemana,
      pedidosEntregadosSemanaAnterior,
      repartidores,
    ] = await Promise.all([
      this.prisma.pedido.count(),
      this.prisma.pedido.count({
        where: {
          estado_pedido: { not: EstadoPedido.ENTREGADO },
        },
      }),
      this.prisma.pedido.findMany({
        where: {
          fecha_creacion: {
            gte: desde,
            lte: hasta,
          },
        },
        select: {
          id_pedido: true,
          estado_pedido: true,
          total: true,
        },
      }),
      this.prisma.pedido.findMany({
        where: {
          estado_pedido: EstadoPedido.ENTREGADO,
          fecha_entrega: {
            gte: desde,
            lte: hasta,
          },
        },
        select: {
          id_pedido: true,
          id_repartidor: true,
          fecha_creacion: true,
          fecha_entrega: true,
          costo_envio: true,
          total: true,
        },
      }),
      this.prisma.pedido.findMany({
        where: {
          estado_pedido: EstadoPedido.ENTREGADO,
          fecha_entrega: {
            gte: inicioSemanaAnterior,
            lt: desde,
          },
        },
        select: {
          total: true,
        },
      }),
      this.prisma.usuario.findMany({
        where: {
          rol_: {
            nombre_rol: Rol.REPARTIDOR,
          },
        },
        select: {
          id_usuario: true,
          primer_nombre: true,
          segundo_nombre: true,
          primer_apellido: true,
          segundo_apellido: true,
        },
        orderBy: {
          id_usuario: 'asc',
        },
      }),
    ]);

    const porEstado: Record<EstadoPedido, number> = {
      [EstadoPedido.RECIBIDO]: 0,
      [EstadoPedido.EN_PREPARACION]: 0,
      [EstadoPedido.LISTO_PARA_REPARTIDOR]: 0,
      [EstadoPedido.EN_CAMINO]: 0,
      [EstadoPedido.ENTREGADO]: 0,
    };

    let montoEnProceso = 0;
    for (const ped of pedidosCreadosSemana) {
      porEstado[ped.estado_pedido] += 1;
      if (ped.estado_pedido !== EstadoPedido.ENTREGADO) {
        montoEnProceso += Number(ped.total);
      }
    }

    const pedidosHechos: OrdersMetricSummary = {
      total_historicos: totalHistoricos,
      ultima_semana: pedidosCreadosSemana.length,
      entregados_ultima_semana: pedidosEntregadosSemana.length,
      activos_actualmente: activosActualmente,
      por_estado_ultima_semana: porEstado,
    };

    // Cálculo de tiempos promedio de entrega (en minutos)
    const tiemposPorRepartidor = new Map<number, number[]>();
    let sumaMinutosGlobal = 0;

    for (const entrega of pedidosEntregadosSemana) {
      const duracionMin = Math.max(
        0,
        (entrega.fecha_entrega.getTime() - entrega.fecha_creacion.getTime()) /
          MS_PER_MINUTE,
      );
      sumaMinutosGlobal += duracionMin;

      const listaActual = tiemposPorRepartidor.get(entrega.id_repartidor) ?? [];
      listaActual.push(duracionMin);
      tiemposPorRepartidor.set(entrega.id_repartidor, listaActual);
    }

    const totalEntregasEvaluadas = pedidosEntregadosSemana.length;
    const promedioGeneralMinutos =
      totalEntregasEvaluadas > 0
        ? Number((sumaMinutosGlobal / totalEntregasEvaluadas).toFixed(2))
        : 0;

    const detallePorRepartidor: CourierAverageTimeItem[] = repartidores.map(
      (rep) => {
        const tiempos = tiemposPorRepartidor.get(rep.id_usuario) ?? [];
        const sumaRep = tiempos.reduce((acc, val) => acc + val, 0);
        const promedioRep =
          tiempos.length > 0
            ? Number((sumaRep / tiempos.length).toFixed(2))
            : 0;

        const nombreCompleto = [
          rep.primer_nombre,
          rep.segundo_nombre,
          rep.primer_apellido,
          rep.segundo_apellido,
        ]
          .filter(Boolean)
          .join(' ');

        return {
          id_repartidor: rep.id_usuario,
          nombre_completo: nombreCompleto,
          entregas_completadas: tiempos.length,
          tiempo_promedio_minutos: promedioRep,
        };
      },
    );

    const tiempoPromedioRepartidores: CouriersTimeMetricSummary = {
      promedio_general_minutos: promedioGeneralMinutos,
      total_entregas_evaluadas: totalEntregasEvaluadas,
      por_repartidor: detallePorRepartidor,
    };

    // Cálculo de ganancias en la última semana
    let gananciasTotales = 0;
    let totalEnvios = 0;

    const mapaDiario = new Map<
      string,
      { dia: string; pedidos_entregados: number; ganancias: number }
    >();

    for (let i = DAYS_IN_WEEK - 1; i >= 0; i -= 1) {
      const fechaDia = new Date(hasta.getTime() - i * MS_PER_DAY);
      const claveFecha = this.toDateKey(fechaDia);
      mapaDiario.set(claveFecha, {
        dia: DAY_NAMES_ES[fechaDia.getUTCDay()],
        pedidos_entregados: 0,
        ganancias: 0,
      });
    }

    for (const entrega of pedidosEntregadosSemana) {
      const montoTotal = Number(entrega.total);
      const montoEnvio = Number(entrega.costo_envio);
      gananciasTotales += montoTotal;
      totalEnvios += montoEnvio;

      const claveFecha = this.toDateKey(entrega.fecha_entrega);
      const registroDia = mapaDiario.get(claveFecha);
      if (registroDia) {
        registroDia.pedidos_entregados += 1;
        registroDia.ganancias = Number(
          (registroDia.ganancias + montoTotal).toFixed(2),
        );
      }
    }

    gananciasTotales = Number(gananciasTotales.toFixed(2));
    totalEnvios = Number(totalEnvios.toFixed(2));
    const subtotalProductos = Number(
      (gananciasTotales - totalEnvios).toFixed(2),
    );
    const ticketPromedio =
      totalEntregasEvaluadas > 0
        ? Number((gananciasTotales / totalEntregasEvaluadas).toFixed(2))
        : 0;

    const gananciasSemanaAnterior = Number(
      pedidosEntregadosSemanaAnterior
        .reduce((acc, item) => acc + Number(item.total), 0)
        .toFixed(2),
    );

    const variacionPorcentual =
      gananciasSemanaAnterior > 0
        ? Number(
            (
              ((gananciasTotales - gananciasSemanaAnterior) /
                gananciasSemanaAnterior) *
              100
            ).toFixed(2),
          )
        : null;

    const desgloseDiario: DailyEarningsItem[] = Array.from(
      mapaDiario.entries(),
    ).map(([fecha, datos]) => ({
      fecha,
      dia: datos.dia,
      pedidos_entregados: datos.pedidos_entregados,
      ganancias: datos.ganancias,
    }));

    const gananciasUltimaSemana: WeeklyEarningsMetricSummary = {
      ganancias_totales: gananciasTotales,
      subtotal_productos: subtotalProductos,
      total_envios: totalEnvios,
      monto_pedidos_en_proceso: Number(montoEnProceso.toFixed(2)),
      ticket_promedio: ticketPromedio,
      ganancias_semana_anterior: gananciasSemanaAnterior,
      variacion_porcentual: variacionPorcentual,
      desglose_diario: desgloseDiario,
    };

    return {
      periodo: {
        desde,
        hasta,
        dias: DAYS_IN_WEEK,
      },
      pedidos_hechos: pedidosHechos,
      tiempo_promedio_repartidores: tiempoPromedioRepartidores,
      ganancias_ultima_semana: gananciasUltimaSemana,
    };
  }

  async getOrdersMetrics(): Promise<OrdersMetricSummary> {
    const metrics = await this.getDashboardMetrics();
    return metrics.pedidos_hechos;
  }

  async getCouriersAverageTime(): Promise<CouriersTimeMetricSummary> {
    const metrics = await this.getDashboardMetrics();
    return metrics.tiempo_promedio_repartidores;
  }

  async getWeeklyEarnings(): Promise<WeeklyEarningsMetricSummary> {
    const metrics = await this.getDashboardMetrics();
    return metrics.ganancias_ultima_semana;
  }

  private getWeeklyWindow(): {
    desde: Date;
    hasta: Date;
    inicioSemanaAnterior: Date;
  } {
    const hasta = new Date();
    const desde = new Date(hasta.getTime() - DAYS_IN_WEEK * MS_PER_DAY);
    const inicioSemanaAnterior = new Date(
      desde.getTime() - DAYS_IN_WEEK * MS_PER_DAY,
    );

    return { desde, hasta, inicioSemanaAnterior };
  }

  private toDateKey(date: Date): string {
    return date.toISOString().slice(0, 10);
  }
}
