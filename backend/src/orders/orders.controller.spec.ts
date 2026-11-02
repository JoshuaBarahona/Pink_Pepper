import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { ROLES_KEY } from '../auth/decorators/roles.decorator.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Rol } from '../generated/prisma/enums.js';
import { OrdersController } from './orders.controller.js';
import { OrdersService } from './orders.service.js';

describe('OrdersController', () => {
  let controller: OrdersController;
  let reflector: Reflector;

  const mockOrdersService = {
    create: jest.fn(),
    findForUserRole: jest.fn(),
    findMyOrders: jest.fn(),
    findAllChronological: jest.fn(),
    findKitchenPending: jest.fn(),
    findOne: jest.fn(),
    updateStatus: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [
        { provide: OrdersService, useValue: mockOrdersService },
        { provide: JwtService, useValue: { verifyAsync: jest.fn() } },
        JwtAuthGuard,
        RolesGuard,
        Reflector,
      ],
    }).compile();

    controller = module.get<OrdersController>(OrdersController);
    reflector = module.get<Reflector>(Reflector);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should not expose delete or general edit endpoints on OrdersController', () => {
    expect('remove' in OrdersController.prototype).toBe(false);
    expect('delete' in OrdersController.prototype).toBe(false);
    expect('update' in OrdersController.prototype).toBe(false);
  });

  it('should restrict manager and kitchen endpoints to the expected roles', () => {
    const allDescriptor = Object.getOwnPropertyDescriptor(
      OrdersController.prototype,
      'findAllChronological',
    );
    expect(
      reflector.get<Rol[]>(
        ROLES_KEY,
        allDescriptor?.value as (...args: unknown[]) => unknown,
      ),
    ).toEqual([Rol.GERENTE, Rol.ADMIN]);

    const kitchenMethods: (keyof OrdersController)[] = [
      'findKitchenPending',
      'updateStatus',
    ];

    for (const methodName of kitchenMethods) {
      const descriptor = Object.getOwnPropertyDescriptor(
        OrdersController.prototype,
        methodName,
      );
      expect(
        reflector.get<Rol[]>(
          ROLES_KEY,
          descriptor?.value as (...args: unknown[]) => unknown,
        ),
      ).toEqual([Rol.COCINA, Rol.ADMIN]);
    }
  });
});
