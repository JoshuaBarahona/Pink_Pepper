import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { ROLES_KEY } from '../auth/decorators/roles.decorator.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Rol } from '../generated/prisma/enums.js';
import { CourierController } from './courier.controller.js';
import { CourierService } from './courier.service.js';

describe('CourierController', () => {
  let controller: CourierController;
  let reflector: Reflector;

  const mockCourierService = {
    findAssignedOrders: jest.fn(),
    getCapacitySummary: jest.fn(),
    findOneAssignedOrder: jest.fn(),
    updateDeliveryStatus: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CourierController],
      providers: [
        { provide: CourierService, useValue: mockCourierService },
        { provide: JwtService, useValue: { verifyAsync: jest.fn() } },
        JwtAuthGuard,
        RolesGuard,
        Reflector,
      ],
    }).compile();

    controller = module.get<CourierController>(CourierController);
    reflector = module.get<Reflector>(Reflector);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should restrict CourierController to REPARTIDOR and ADMIN roles', () => {
    const roles = reflector.get<Rol[]>(ROLES_KEY, CourierController);
    expect(roles).toEqual([Rol.REPARTIDOR, Rol.ADMIN]);
  });
});
