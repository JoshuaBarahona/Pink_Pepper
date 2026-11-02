import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { Rol } from '../generated/prisma/enums.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { AuthService } from './auth.service.js';

describe('AuthService', () => {
  let service: AuthService;

  const mockPrismaService = {
    usuario: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    rol_: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
  };

  const mockJwtService = {
    signAsync: jest.fn().mockResolvedValue('mock-jwt-token'),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should register a new user and return a JWT token', async () => {
    mockPrismaService.usuario.findFirst.mockResolvedValue(null);
    mockPrismaService.rol_.findFirst.mockResolvedValue({
      id_rol: 1,
      nombre_rol: Rol.CLIENTE,
    });

    const now = new Date();
    mockPrismaService.usuario.create.mockImplementation(
      ({ data }: { data: Record<string, unknown> }) =>
        Promise.resolve({
          id_usuario: 10,
          ...data,
          rol_: { id_rol: 1, nombre_rol: Rol.CLIENTE },
          fecha_registro: now,
        }),
    );

    const result = await service.register({
      primer_nombre: 'Joshua',
      primer_apellido: 'Barahona',
      correo: 'joshua@email.com',
      password: 'Password!123',
    });

    expect(result.access_token).toBe('mock-jwt-token');
    expect(result.usuario.correo).toBe('joshua@email.com');
    expect(result.usuario.rol).toBe(Rol.CLIENTE);
    expect(result.usuario).not.toHaveProperty('password');
  });

  it('should throw ConflictException if email already exists', async () => {
    mockPrismaService.usuario.findFirst.mockResolvedValue({ id_usuario: 1 });

    await expect(
      service.register({
        primer_nombre: 'Joshua',
        primer_apellido: 'Barahona',
        correo: 'joshua@email.com',
        password: 'Password!123',
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('should login an existing user with valid password', async () => {
    const hashedPassword = await bcrypt.hash('Password!123', 4);
    mockPrismaService.usuario.findFirst.mockResolvedValue({
      id_usuario: 10,
      id_rol: 1,
      primer_nombre: 'Joshua',
      segundo_nombre: '',
      primer_apellido: 'Barahona',
      segundo_apellido: '',
      correo: 'joshua@email.com',
      password: hashedPassword,
      telefono: '8888-8888',
      estado: true,
      fecha_registro: new Date(),
      rol_: { id_rol: 1, nombre_rol: Rol.CLIENTE },
    });

    const result = await service.login({
      correo: 'joshua@email.com',
      password: 'Password!123',
    });

    expect(result.access_token).toBe('mock-jwt-token');
    expect(result.usuario.id_usuario).toBe(10);
  });

  it('should throw UnauthorizedException on invalid password', async () => {
    const hashedPassword = await bcrypt.hash('Password!123', 4);
    mockPrismaService.usuario.findFirst.mockResolvedValue({
      id_usuario: 10,
      correo: 'joshua@email.com',
      password: hashedPassword,
      estado: true,
      rol_: { id_rol: 1, nombre_rol: Rol.CLIENTE },
    });

    await expect(
      service.login({
        correo: 'joshua@email.com',
        password: 'WrongPassword!',
      }),
    ).rejects.toThrow(UnauthorizedException);
  });
});
