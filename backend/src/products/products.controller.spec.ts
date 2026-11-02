import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { ROLES_KEY } from '../auth/decorators/roles.decorator.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Rol } from '../generated/prisma/enums.js';
import { ProductsController } from './products.controller.js';
import { ProductsService } from './products.service.js';

describe('ProductsController', () => {
  let controller: ProductsController;
  let reflector: Reflector;

  const mockProductsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findAllForManagement: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    restore: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        { provide: ProductsService, useValue: mockProductsService },
        { provide: JwtService, useValue: { verifyAsync: jest.fn() } },
        JwtAuthGuard,
        RolesGuard,
        Reflector,
      ],
    }).compile();

    controller = module.get<ProductsController>(ProductsController);
    reflector = module.get<Reflector>(Reflector);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should restrict write and management endpoints to GERENTE and ADMIN roles', () => {
    const protectedMethodNames: (keyof ProductsController)[] = [
      'create',
      'update',
      'restore',
      'remove',
      'findAllForManagement',
    ];

    for (const methodName of protectedMethodNames) {
      const descriptor = Object.getOwnPropertyDescriptor(
        ProductsController.prototype,
        methodName,
      );
      expect(descriptor?.value).toBeDefined();
      const roles = reflector.get<Rol[]>(
        ROLES_KEY,
        descriptor?.value as (...args: unknown[]) => unknown,
      );
      expect(roles).toEqual([Rol.GERENTE, Rol.ADMIN]);
    }
  });
});
