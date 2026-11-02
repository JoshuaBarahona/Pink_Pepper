import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { ROLES_KEY } from '../auth/decorators/roles.decorator.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Rol } from '../generated/prisma/enums.js';
import { AdminController } from './admin.controller.js';
import { AdminService } from './admin.service.js';

describe('AdminController', () => {
  let controller: AdminController;
  let reflector: Reflector;
  let rolesGuard: RolesGuard;

  const mockAdminService = {
    findEmployees: jest.fn(),
    findAllUsers: jest.fn(),
    findOneUser: jest.fn(),
    createUser: jest.fn(),
    updateUser: jest.fn(),
    changeUserRole: jest.fn(),
    changeUserStatus: jest.fn(),
    deactivateUser: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminController],
      providers: [
        { provide: AdminService, useValue: mockAdminService },
        { provide: JwtService, useValue: { verifyAsync: jest.fn() } },
        JwtAuthGuard,
        RolesGuard,
        Reflector,
      ],
    }).compile();

    controller = module.get<AdminController>(AdminController);
    reflector = module.get<Reflector>(Reflector);
    rolesGuard = module.get<RolesGuard>(RolesGuard);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should restrict AdminController exclusively to ADMIN role', () => {
    const roles = reflector.get<Rol[]>(ROLES_KEY, AdminController);
    expect(roles).toEqual([Rol.ADMIN]);

    const descriptor = Object.getOwnPropertyDescriptor(
      AdminController.prototype,
      'findEmployees',
    );

    const buildContext = (rol: Rol): ExecutionContext =>
      ({
        getHandler: () => descriptor?.value as (...args: unknown[]) => unknown,
        getClass: () => AdminController,
        switchToHttp: () => ({
          getRequest: () => ({
            user: { sub: 1, correo: 'admin@pinkpepper.com', rol },
          }),
        }),
      }) as unknown as ExecutionContext;

    expect(rolesGuard.canActivate(buildContext(Rol.ADMIN))).toBe(true);

    const nonAdminRoles: Rol[] = [
      Rol.GERENTE,
      Rol.CLIENTE,
      Rol.COCINA,
      Rol.REPARTIDOR,
    ];

    for (const rol of nonAdminRoles) {
      expect(() => rolesGuard.canActivate(buildContext(rol))).toThrow(
        ForbiddenException,
      );
    }
  });
});
