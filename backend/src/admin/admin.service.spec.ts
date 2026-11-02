import { BadRequestException, ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Rol } from '../generated/prisma/enums.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { AdminService } from './admin.service.js';
import { EMPLOYEE_ROLES } from './dto/query-users.dto.js';

describe('AdminService', () => {
  let service: AdminService;

  const mockPrismaService = {
    usuario: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    rol_: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
  };

  const buildMockUsuario = (
    overrides: Partial<Record<string, unknown>> = {},
  ) => ({
    id_usuario: 15,
    id_rol: 2,
    primer_nombre: 'Daniela',
    segundo_nombre: '',
    primer_apellido: 'Pérez',
    segundo_apellido: '',
    correo: 'daniela@pinkpepper.com',
    password: 'hashed-secret-password',
    telefono: '8888-1234',
    estado: true,
    fecha_registro: new Date('2026-11-01T12:00:00Z'),
    rol_: {
      id_rol: 2,
      nombre_rol: Rol.REPARTIDOR,
    },
    ...overrides,
  });

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should list only employees (COCINA, REPARTIDOR, GERENTE) without exposing passwords', async () => {
    mockPrismaService.usuario.findMany.mockResolvedValue([
      buildMockUsuario({
        id_usuario: 11,
        rol_: { id_rol: 3, nombre_rol: Rol.COCINA },
      }),
      buildMockUsuario({
        id_usuario: 15,
        rol_: { id_rol: 2, nombre_rol: Rol.REPARTIDOR },
      }),
      buildMockUsuario({
        id_usuario: 18,
        rol_: { id_rol: 4, nombre_rol: Rol.GERENTE },
      }),
    ]);

    const result = await service.findEmployees();

    expect(mockPrismaService.usuario.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          rol_: {
            nombre_rol: { in: EMPLOYEE_ROLES },
          },
        },
        orderBy: { id_usuario: 'asc' },
      }),
    );
    expect(result).toHaveLength(3);
    expect(result.map((u) => u.rol)).toEqual([
      Rol.COCINA,
      Rol.REPARTIDOR,
      Rol.GERENTE,
    ]);
    expect(result[0]).not.toHaveProperty('password');
  });

  it('should change a user role and prevent an admin from demoting themselves', async () => {
    mockPrismaService.usuario.findUnique.mockResolvedValue(buildMockUsuario());
    mockPrismaService.rol_.findFirst.mockResolvedValue({
      id_rol: 4,
      nombre_rol: Rol.GERENTE,
    });
    mockPrismaService.usuario.update.mockResolvedValue(
      buildMockUsuario({
        id_rol: 4,
        rol_: { id_rol: 4, nombre_rol: Rol.GERENTE },
      }),
    );

    const updated = await service.changeUserRole(
      15,
      { rol: Rol.GERENTE },
      1, // admin id
    );

    expect(updated.rol).toBe(Rol.GERENTE);

    mockPrismaService.usuario.findUnique.mockResolvedValue(
      buildMockUsuario({
        id_usuario: 1,
        rol_: { id_rol: 5, nombre_rol: Rol.ADMIN },
      }),
    );

    await expect(
      service.changeUserRole(1, { rol: Rol.CLIENTE }, 1),
    ).rejects.toThrow(BadRequestException);
  });

  it('should soft-deactivate a user by setting estado to false without deleting the DB record', async () => {
    mockPrismaService.usuario.findUnique.mockResolvedValue(buildMockUsuario());
    mockPrismaService.usuario.update.mockResolvedValue(
      buildMockUsuario({ estado: false }),
    );

    const deactivated = await service.deactivateUser(15, 1);

    expect(mockPrismaService.usuario.delete).not.toHaveBeenCalled();
    expect(mockPrismaService.usuario.update).toHaveBeenCalledWith({
      where: { id_usuario: 15 },
      data: { estado: false },
      include: { rol_: true },
    });
    expect(deactivated.estado).toBe(false);
  });

  it('should prevent an admin from deactivating their own account', async () => {
    mockPrismaService.usuario.findUnique.mockResolvedValue(
      buildMockUsuario({ id_usuario: 1 }),
    );

    await expect(service.deactivateUser(1, 1)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('should throw ConflictException when creating a user with an existing email', async () => {
    mockPrismaService.usuario.findFirst.mockResolvedValue(buildMockUsuario());

    await expect(
      service.createUser({
        primer_nombre: 'Ana',
        primer_apellido: 'Ruiz',
        correo: 'daniela@pinkpepper.com',
        password: 'Password!123',
        rol: Rol.COCINA,
      }),
    ).rejects.toThrow(ConflictException);
  });
});
