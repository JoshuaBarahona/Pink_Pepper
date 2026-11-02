import { EstadoPedido } from '../../generated/prisma/enums.js';

export interface DashboardPeriod {
  desde: Date;
  hasta: Date;
  dias: number;
}

export interface OrdersMetricSummary {
  total_historicos: number;
  ultima_semana: number;
  entregados_ultima_semana: number;
  activos_actualmente: number;
  por_estado_ultima_semana: Record<EstadoPedido, number>;
}

export interface CourierAverageTimeItem {
  id_repartidor: number;
  nombre_completo: string;
  entregas_completadas: number;
  tiempo_promedio_minutos: number;
}

export interface CouriersTimeMetricSummary {
  promedio_general_minutos: number;
  total_entregas_evaluadas: number;
  por_repartidor: CourierAverageTimeItem[];
}

export interface DailyEarningsItem {
  fecha: string;
  dia: string;
  pedidos_entregados: number;
  ganancias: number;
}

export interface WeeklyEarningsMetricSummary {
  ganancias_totales: number;
  subtotal_productos: number;
  total_envios: number;
  monto_pedidos_en_proceso: number;
  ticket_promedio: number;
  ganancias_semana_anterior: number;
  variacion_porcentual: number | null;
  desglose_diario: DailyEarningsItem[];
}

export interface DashboardMetricsResponse {
  periodo: DashboardPeriod;
  pedidos_hechos: OrdersMetricSummary;
  tiempo_promedio_repartidores: CouriersTimeMetricSummary;
  ganancias_ultima_semana: WeeklyEarningsMetricSummary;
}
