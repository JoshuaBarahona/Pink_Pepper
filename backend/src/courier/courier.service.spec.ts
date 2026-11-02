import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Categoria, EstadoPedido, Rol } from '../generated/prisma/enums.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CourierService } from './courier.service.js';

describe('CourierService', () => {
  let service: CourierService;

  const mockPrismaService = {
    pedido: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  const courierUser = {
    sub: 30,
    correo: 'repartidor@pinkpepper.com',
    rol: Rol.REPARTIDOR,
  };

  const buildMockCourierPedido = (
    overrides: Partial<Record<string, unknown>> = {},
  ) => ({
    id_pedido: 201,
    id_cliente: 10,
    id_repartidor: 30,
    fecha_creacion: new Date('2026-11-01T19:00:00Z'),
    fecha_entrega: new Date('2026-11-01T19:00:00Z'),
    direccion: 'Villa Fontana, de la Rotonda El Güegüense 1 c. arriba',
    referencia: 'Edificio blanco, apto 3B',
    notas_cliente: 'Llamar al llegar',
    metodo_pago: 'EFECTIVO',
    comprobante: '',
    costo_envio: 60,
    total: 420,
    estado_pedido: EstadoPedido.LISTO_PARA_REPARTIDOR,
    motivo_cancelacion: '',
    Usuario_Pedido_id_clienteToUsuario: {
      id_usuario: 10,
      primer_nombre: 'Carlos',
      segundo_nombre: '',
      primer_apellido: 'Mendoza',
      segundo_apellido: '',
      correo: 'carlos@email.com',
      telefono: '8712-5634',
      password: 'hashed-password',
    },
    Usuario_Pedido_id_repartidorToUsuario: null,
    detalle_pedido: [
      {
        id_detalle: 1,
        id_pedido: 201,
        id_producto: 3,
        cantidad: 1,
        precio_unitario: 360,
        subtotal: 360,
        producto: {
          id_producto: 3,
          id_categoria: 1,
          nombre: 'Groovie Burger',
          descripcion: 'Doble carne',
          imagen_url: '',
          precio: 360,
          estado: true,
          fecha_registro: new Date(),
          categoria: {
            id_categoria: 1,
            nombre_categoria: Categoria.HAMBURGUESAS,
          },
        },
      },
    ],
    ...overrides,
  });

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CourierService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<CourierService>(CourierService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return assigned active orders including delivery location and Google Maps URL', async () => {
    mockPrismaService.pedido.findMany.mockResolvedValue([
      buildMockCourierPedido(),
    ]);

    const result = await service.findAssignedOrders(30);

    expect(mockPrismaService.pedido.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          id_repartidor: 30,
          estado_pedido: { not: EstadoPedido.ENTREGADO },
        },
        orderBy: { fecha_creacion: 'asc' },
      }),
    );
    expect(result).toHaveLength(1);
    expect(result[0].ubicacion_entrega).toEqual({
      direccion: 'Villa Fontana, de la Rotonda El Güegüense 1 c. arriba',
      referencia: 'Edificio blanco, apto 3B',
      notas_cliente: 'Llamar al llegar',
      maps_url: expect.stringContaining(
        'https://www.google.com/maps/search/',
      ) as string,
    });
    expect(result[0].cliente).not.toHaveProperty('password');
  });

  it('should transition LISTO_PARA_REPARTIDOR -> EN_CAMINO -> ENTREGADO', async () => {
    mockPrismaService.pedido.findUnique.mockResolvedValueOnce({
      id_pedido: 201,
      id_repartidor: 30,
      estado_pedido: EstadoPedido.LISTO_PARA_REPARTIDOR,
    });
    mockPrismaService.pedido.update.mockResolvedValueOnce(
      buildMockCourierPedido({ estado_pedido: EstadoPedido.EN_CAMINO }),
    );

    const enCamino = await service.updateDeliveryStatus(
      201,
      EstadoPedido.EN_CAMINO,
      courierUser,
    );
    expect(enCamino.estado_pedido).toBe(EstadoPedido.EN_CAMINO);

    mockPrismaService.pedido.findUnique.mockResolvedValueOnce({
      id_pedido: 201,
      id_repartidor: 30,
      estado_pedido: EstadoPedido.EN_CAMINO,
    });
    mockPrismaService.pedido.update.mockResolvedValueOnce(
      buildMockCourierPedido({ estado_pedido: EstadoPedido.ENTREGADO }),
    );

    const entregado = await service.updateDeliveryStatus(
      201,
      EstadoPedido.ENTREGADO,
      courierUser,
    );
    expect(entregado.estado_pedido).toBe(EstadoPedido.ENTREGADO);
    expect(mockPrismaService.pedido.update).toHaveBeenLastCalledWith(
      expect.objectContaining({
        where: { id_pedido: 201 },
        data: expect.objectContaining({
          estado_pedido: EstadoPedido.ENTREGADO,
          fecha_entrega: expect.any(Date) as Date,
        }) as unknown,
      }),
    );
  });

  it('should forbid a courier from updating an order assigned to another courier', async () => {
    mockPrismaService.pedido.findUnique.mockResolvedValue({
      id_pedido: 201,
      id_repartidor: 99,
      estado_pedido: EstadoPedido.EN_CAMINO,
    });

    await expect(
      service.updateDeliveryStatus(201, EstadoPedido.ENTREGADO, courierUser),
    ).rejects.toThrow(ForbiddenException);
  });

  it('should prevent marking an order EN_CAMINO or ENTREGADO while still in kitchen', async () => {
    mockPrismaService.pedido.findUnique.mockResolvedValue({
      id_pedido: 201,
      id_repartidor: 30,
      estado_pedido: EstadoPedido.EN_PREPARACION,
    });

    await expect(
      service.updateDeliveryStatus(201, EstadoPedido.ENTREGADO, courierUser),
    ).rejects.toThrow(BadRequestException);
  });
});
