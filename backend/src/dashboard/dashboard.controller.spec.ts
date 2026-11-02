import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { ROLES_KEY } from '../auth/decorators/roles.decorator.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Rol } from '../generated/prisma/enums.js';
import { DashboardController } from './dashboard.controller.js';
import { DashboardService } from './dashboard.service.js';

describe('DashboardController', () => {
  let controller: DashboardController;
  let reflector: Reflector;
  let rolesGuard: RolesGuard;

  const mockDashboardService = {
    getDashboardMetrics: jest.fn(),
    getOrdersMetrics: jest.fn(),
    getCouriersAverageTime: jest.fn(),
    getWeeklyEarnings: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [DashboardController],
      providers: [
        { provide: DashboardService, useValue: mockDashboardService },
        { provide: JwtService, useValue: { verifyAsync: jest.fn() } },
        JwtAuthGuard,
        RolesGuard,
        Reflector,
      ],
    }).compile();

    controller = module.get<DashboardController>(DashboardController);
    reflector = module.get<Reflector>(Reflector);
    rolesGuard = module.get<RolesGuard>(RolesGuard);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should allow access ONLY to GERENTE role and reject ADMIN, CLIENTE, COCINA and REPARTIDOR', () => {
    const roles = reflector.get<Rol[]>(ROLES_KEY, DashboardController);
    expect(roles).toEqual([Rol.GERENTE]);

    const descriptor = Object.getOwnPropertyDescriptor(
      DashboardController.prototype,
      'getDashboardMetrics',
    );

    const buildContext = (rol: Rol): ExecutionContext =>
      ({
        getHandler: () => descriptor?.value as (...args: unknown[]) => unknown,
        getClass: () => DashboardController,
        switchToHttp: () => ({
          getRequest: () => ({
            user: { sub: 1, correo: 'test@pinkpepper.com', rol },
          }),
        }),
      }) as unknown as ExecutionContext;

    expect(rolesGuard.canActivate(buildContext(Rol.GERENTE))).toBe(true);

    const forbiddenRoles: Rol[] = [
      Rol.ADMIN,
      Rol.CLIENTE,
      Rol.COCINA,
      Rol.REPARTIDOR,
    ];

    for (const rol of forbiddenRoles) {
      expect(() => rolesGuard.canActivate(buildContext(rol))).toThrow(
        ForbiddenException,
      );
    }
  });
});
