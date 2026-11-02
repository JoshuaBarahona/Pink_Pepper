import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Categoria, EstadoPedido, Rol } from '../generated/prisma/enums.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { OrdersService } from './orders.service.js';

describe('OrdersService', () => {
  let service: OrdersService;

  const mockPrismaService = {
    $transaction: jest.fn(),
    usuario: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    producto: {
      findMany: jest.fn(),
    },
    pedido: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  const buildMockPedido = (
    overrides: Partial<Record<string, unknown>> = {},
  ) => ({
    id_pedido: 101,
    id_cliente: 10,
    id_repartidor: 30,
    fecha_creacion: new Date('2026-11-01T18:00:00Z'),
    fecha_entrega: new Date('2026-11-01T18:00:00Z'),
    direccion: 'Altamira casa #14',
    referencia: 'Portón negro',
    notas_cliente: 'Sin cebolla',
    metodo_pago: 'EFECTIVO',
    comprobante: '',
    costo_envio: 50,
    total: 590,
    estado_pedido: EstadoPedido.RECIBIDO,
    motivo_cancelacion: '',
    Usuario_Pedido_id_clienteToUsuario: {
      id_usuario: 10,
      primer_nombre: 'María',
      segundo_nombre: 'Fernanda',
      primer_apellido: 'López',
      segundo_apellido: '',
      correo: 'maria@email.com',
      telefono: '8845-2210',
      password: 'secret-hashed-password',
    },
    Usuario_Pedido_id_repartidorToUsuario: {
      id_usuario: 30,
      primer_nombre: 'Luis',
      segundo_nombre: '',
      primer_apellido: 'Gómez',
      segundo_apellido: '',
      correo: 'luis.repartidor@pinkpepper.com',
      telefono: '8777-1111',
      password: 'secret-driver-password',
    },
    detalle_pedido: [
      {
        id_detalle: 1,
        id_pedido: 101,
        id_producto: 1,
        cantidad: 2,
        precio_unitario: 270,
        subtotal: 540,
        producto: {
          id_producto: 1,
          id_categoria: 1,
          nombre: 'Hamburguesa clásica',
          descripcion: 'Clásica',
          imagen_url: '',
          precio: 270,
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
    mockPrismaService.$transaction.mockImplementation(
      (callback: (tx: typeof mockPrismaService) => Promise<unknown>) =>
        callback(mockPrismaService),
    );

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create an order with default status RECIBIDO and auto-assign the courier with fewer active orders (< 2)', async () => {
    mockPrismaService.usuario.findUnique.mockResolvedValue({
      id_usuario: 10,
      estado: true,
    });
    mockPrismaService.producto.findMany.mockResolvedValue([
      {
        id_producto: 1,
        nombre: 'Hamburguesa clásica',
        precio: 270,
        estado: true,
      },
    ]);
    mockPrismaService.usuario.findMany.mockResolvedValue([
      {
        id_usuario: 29,
        Pedido_Pedido_id_repartidorToUsuario: [
          { id_pedido: 90 },
          { id_pedido: 91 },
        ],
      },
      {
        id_usuario: 30,
        Pedido_Pedido_id_repartidorToUsuario: [{ id_pedido: 92 }],
      },
      {
        id_usuario: 31,
        Pedido_Pedido_id_repartidorToUsuario: [],
      },
    ]);
    mockPrismaService.pedido.create.mockResolvedValue(
      buildMockPedido({ id_repartidor: 31 }),
    );

    const result = await service.create(10, {
      items: [{ id_producto: 1, cantidad: 2 }],
      direccion: 'Altamira casa #14',
      referencia: 'Portón negro',
      notas_cliente: 'Sin cebolla',
      metodo_pago: 'EFECTIVO',
      costo_envio: 50,
    });

    expect(mockPrismaService.pedido.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          id_cliente: 10,
          id_repartidor: 31,
          estado_pedido: EstadoPedido.RECIBIDO,
          total: 590,
        }) as unknown,
      }),
    );
    expect(result.estado_pedido).toBe(EstadoPedido.RECIBIDO);
    expect(result.id_repartidor).toBe(31);
    expect(result.ubicacion_entrega.direccion).toBe('Altamira casa #14');
    expect(result.cliente).not.toHaveProperty('password');
    expect(result.repartidor).not.toHaveProperty('password');
  });

  it('should throw ConflictException when all couriers already have 2 non-delivered orders', async () => {
    mockPrismaService.usuario.findUnique.mockResolvedValue({
      id_usuario: 10,
      estado: true,
    });
    mockPrismaService.producto.findMany.mockResolvedValue([
      {
        id_producto: 1,
        nombre: 'Hamburguesa clásica',
        precio: 270,
        estado: true,
      },
    ]);
    mockPrismaService.usuario.findMany.mockResolvedValue([
      {
        id_usuario: 30,
        Pedido_Pedido_id_repartidorToUsuario: [
          { id_pedido: 90 },
          { id_pedido: 91 },
        ],
      },
    ]);

    await expect(
      service.create(10, {
        items: [{ id_producto: 1, cantidad: 1 }],
        direccion: 'Altamira casa #14',
        metodo_pago: 'EFECTIVO',
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('should return only the authenticated user orders on findMyOrders', async () => {
    mockPrismaService.pedido.findMany.mockResolvedValue([buildMockPedido()]);

    const result = await service.findMyOrders(10);

    expect(mockPrismaService.pedido.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id_cliente: 10 },
        orderBy: { fecha_creacion: 'asc' },
      }),
    );
    expect(result).toHaveLength(1);
  });

  it('should prevent a CLIENTE from viewing another user order', async () => {
    mockPrismaService.pedido.findUnique.mockResolvedValue(
      buildMockPedido({ id_cliente: 99 }),
    );

    await expect(
      service.findOne(101, {
        sub: 10,
        correo: 'maria@email.com',
        rol: Rol.CLIENTE,
      }),
    ).rejects.toThrow(ForbiddenException);
  });

  it('should list all orders chronologically for GERENTE', async () => {
    mockPrismaService.pedido.findMany.mockResolvedValue([buildMockPedido()]);

    await service.findAllChronological();

    expect(mockPrismaService.pedido.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {},
        orderBy: { fecha_creacion: 'asc' },
      }),
    );
  });

  it('should list only non-completed orders chronologically for COCINA', async () => {
    mockPrismaService.pedido.findMany.mockResolvedValue([buildMockPedido()]);

    await service.findKitchenPending();

    expect(mockPrismaService.pedido.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          estado_pedido: { not: EstadoPedido.ENTREGADO },
        },
        orderBy: { fecha_creacion: 'asc' },
      }),
    );
  });

  it('should allow COCINA to transition RECIBIDO -> EN_PREPARACION -> LISTO_PARA_REPARTIDOR', async () => {
    const kitchenUser = {
      sub: 20,
      correo: 'cocina@pinkpepper.com',
      rol: Rol.COCINA,
    };

    mockPrismaService.pedido.findUnique.mockResolvedValueOnce({
      id_pedido: 101,
      estado_pedido: EstadoPedido.RECIBIDO,
    });
    mockPrismaService.pedido.update.mockResolvedValueOnce(
      buildMockPedido({ estado_pedido: EstadoPedido.EN_PREPARACION }),
    );

    const step1 = await service.updateStatus(
      101,
      { estado_pedido: EstadoPedido.EN_PREPARACION },
      kitchenUser,
    );
    expect(step1.estado_pedido).toBe(EstadoPedido.EN_PREPARACION);

    mockPrismaService.pedido.findUnique.mockResolvedValueOnce({
      id_pedido: 101,
      estado_pedido: EstadoPedido.EN_PREPARACION,
    });
    mockPrismaService.pedido.update.mockResolvedValueOnce(
      buildMockPedido({ estado_pedido: EstadoPedido.LISTO_PARA_REPARTIDOR }),
    );

    const step2 = await service.updateStatus(
      101,
      { estado_pedido: EstadoPedido.LISTO_PARA_REPARTIDOR },
      kitchenUser,
    );
    expect(step2.estado_pedido).toBe(EstadoPedido.LISTO_PARA_REPARTIDOR);
  });

  it('should forbid COCINA from setting ENTREGADO or skipping EN_PREPARACION', async () => {
    const kitchenUser = {
      sub: 20,
      correo: 'cocina@pinkpepper.com',
      rol: Rol.COCINA,
    };

    mockPrismaService.pedido.findUnique.mockResolvedValue({
      id_pedido: 101,
      estado_pedido: EstadoPedido.RECIBIDO,
    });

    await expect(
      service.updateStatus(
        101,
        { estado_pedido: EstadoPedido.ENTREGADO },
        kitchenUser,
      ),
    ).rejects.toThrow(ForbiddenException);

    await expect(
      service.updateStatus(
        101,
        { estado_pedido: EstadoPedido.LISTO_PARA_REPARTIDOR },
        kitchenUser,
      ),
    ).rejects.toThrow(BadRequestException);
  });
});
