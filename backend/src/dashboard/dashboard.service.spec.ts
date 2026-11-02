import { Test, TestingModule } from '@nestjs/testing';
import { EstadoPedido } from '../generated/prisma/enums.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { DashboardService } from './dashboard.service.js';

describe('DashboardService', () => {
  let service: DashboardService;

  const mockPrismaService = {
    pedido: {
      count: jest.fn(),
      findMany: jest.fn(),
    },
    usuario: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should calculate orders made, courier average delivery time, and weekly earnings', async () => {
    const now = new Date();
    const t1Start = new Date(now.getTime() - 2 * 60 * 60 * 1000);
    const t1End = new Date(t1Start.getTime() + 20 * 60_000); // 20 min

    const t2Start = new Date(now.getTime() - 4 * 60 * 60 * 1000);
    const t2End = new Date(t2Start.getTime() + 30 * 60_000); // 30 min

    mockPrismaService.pedido.count
      .mockResolvedValueOnce(50) // total_historicos
      .mockResolvedValueOnce(3); // activos_actualmente

    // pedidosCreadosSemana
    mockPrismaService.pedido.findMany
      .mockResolvedValueOnce([
        {
          id_pedido: 1,
          estado_pedido: EstadoPedido.ENTREGADO,
          total: 500,
        },
        {
          id_pedido: 2,
          estado_pedido: EstadoPedido.ENTREGADO,
          total: 300,
        },
        {
          id_pedido: 3,
          estado_pedido: EstadoPedido.EN_PREPARACION,
          total: 250,
        },
      ])
      // pedidosEntregadosSemana
      .mockResolvedValueOnce([
        {
          id_pedido: 1,
          id_repartidor: 30,
          fecha_creacion: t1Start,
          fecha_entrega: t1End,
          costo_envio: 50,
          total: 500,
        },
        {
          id_pedido: 2,
          id_repartidor: 31,
          fecha_creacion: t2Start,
          fecha_entrega: t2End,
          costo_envio: 40,
          total: 300,
        },
      ])
      // pedidosEntregadosSemanaAnterior
      .mockResolvedValueOnce([{ total: 400 }]);

    mockPrismaService.usuario.findMany.mockResolvedValue([
      {
        id_usuario: 30,
        primer_nombre: 'Roberto',
        segundo_nombre: '',
        primer_apellido: 'Salgado',
        segundo_apellido: '',
      },
      {
        id_usuario: 31,
        primer_nombre: 'Daniela',
        segundo_nombre: '',
        primer_apellido: 'Pérez',
        segundo_apellido: '',
      },
      {
        id_usuario: 32,
        primer_nombre: 'Javier',
        segundo_nombre: '',
        primer_apellido: 'Obando',
        segundo_apellido: '',
      },
    ]);

    const result = await service.getDashboardMetrics();

    // 1. Pedidos hechos
    expect(result.pedidos_hechos).toEqual({
      total_historicos: 50,
      ultima_semana: 3,
      entregados_ultima_semana: 2,
      activos_actualmente: 3,
      por_estado_ultima_semana: {
        [EstadoPedido.RECIBIDO]: 0,
        [EstadoPedido.EN_PREPARACION]: 1,
        [EstadoPedido.LISTO_PARA_REPARTIDOR]: 0,
        [EstadoPedido.EN_CAMINO]: 0,
        [EstadoPedido.ENTREGADO]: 2,
      },
    });

    // 2. Tiempo promedio de los repartidores: (20 + 30) / 2 = 25 min
    expect(result.tiempo_promedio_repartidores.promedio_general_minutos).toBe(
      25,
    );
    expect(result.tiempo_promedio_repartidores.por_repartidor).toEqual([
      {
        id_repartidor: 30,
        nombre_completo: 'Roberto Salgado',
        entregas_completadas: 1,
        tiempo_promedio_minutos: 20,
      },
      {
        id_repartidor: 31,
        nombre_completo: 'Daniela Pérez',
        entregas_completadas: 1,
        tiempo_promedio_minutos: 30,
      },
      {
        id_repartidor: 32,
        nombre_completo: 'Javier Obando',
        entregas_completadas: 0,
        tiempo_promedio_minutos: 0,
      },
    ]);

    // 3. Ganancias en la última semana: 500 + 300 = 800
    expect(result.ganancias_ultima_semana.ganancias_totales).toBe(800);
    expect(result.ganancias_ultima_semana.total_envios).toBe(90);
    expect(result.ganancias_ultima_semana.subtotal_productos).toBe(710);
    expect(result.ganancias_ultima_semana.monto_pedidos_en_proceso).toBe(250);
    expect(result.ganancias_ultima_semana.ticket_promedio).toBe(400);
    expect(result.ganancias_ultima_semana.ganancias_semana_anterior).toBe(400);
    expect(result.ganancias_ultima_semana.variacion_porcentual).toBe(100);
    expect(result.ganancias_ultima_semana.desglose_diario).toHaveLength(7);
  });
});
