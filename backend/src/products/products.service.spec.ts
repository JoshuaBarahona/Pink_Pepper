import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Categoria } from '../generated/prisma/enums.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { ProductsService } from './products.service.js';

describe('ProductsService', () => {
  let service: ProductsService;

  const mockPrismaService = {
    producto: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    categoria: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a product and resolve its category', async () => {
    const now = new Date();
    mockPrismaService.producto.findFirst.mockResolvedValue(null);
    mockPrismaService.categoria.findFirst.mockResolvedValue({
      id_categoria: 1,
      nombre_categoria: Categoria.HAMBURGUESAS,
    });
    mockPrismaService.producto.create.mockImplementation(
      ({ data }: { data: Record<string, unknown> }) =>
        Promise.resolve({
          id_producto: 5,
          ...data,
          fecha_registro: now,
          categoria: {
            id_categoria: 1,
            nombre_categoria: Categoria.HAMBURGUESAS,
          },
        }),
    );

    const result = await service.create({
      nombre: 'Groovie Burger',
      descripcion: 'Doble carne con queso cheddar',
      precio: 360,
      categoria: Categoria.HAMBURGUESAS,
    });

    expect(result.id_producto).toBe(5);
    expect(result.nombre).toBe('Groovie Burger');
    expect(result.categoria).toBe(Categoria.HAMBURGUESAS);
    expect(result.precio).toBe(360);
    expect(result.estado).toBe(true);
  });

  it('should throw ConflictException when creating a duplicate product name', async () => {
    mockPrismaService.producto.findFirst.mockResolvedValue({ id_producto: 1 });

    await expect(
      service.create({
        nombre: 'Groovie Burger',
        precio: 360,
        categoria: Categoria.HAMBURGUESAS,
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('should list only active products by default', async () => {
    mockPrismaService.producto.findMany.mockResolvedValue([
      {
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
    ]);

    const result = await service.findAll();

    expect(mockPrismaService.producto.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { estado: true },
      }),
    );
    expect(result).toHaveLength(1);
    expect(result[0].estado).toBe(true);
  });

  it('should soft-delete a product by setting estado to false without deleting the DB record', async () => {
    const existing = {
      id_producto: 3,
      id_categoria: 2,
      nombre: 'Alitas BBQ',
      descripcion: 'Alitas en salsa BBQ',
      imagen_url: '',
      precio: 250,
      estado: true,
      fecha_registro: new Date(),
    };

    mockPrismaService.producto.findUnique.mockResolvedValue(existing);
    mockPrismaService.producto.update.mockResolvedValue({
      ...existing,
      estado: false,
      categoria: {
        id_categoria: 2,
        nombre_categoria: Categoria.POLLO,
      },
    });

    const result = await service.remove(3);

    expect(mockPrismaService.producto.delete).not.toHaveBeenCalled();
    expect(mockPrismaService.producto.update).toHaveBeenCalledWith({
      where: { id_producto: 3 },
      data: { estado: false },
      include: { categoria: true },
    });
    expect(result.estado).toBe(false);
  });

  it('should throw NotFoundException when removing a non-existent product', async () => {
    mockPrismaService.producto.findUnique.mockResolvedValue(null);

    await expect(service.remove(999)).rejects.toThrow(NotFoundException);
  });
});
