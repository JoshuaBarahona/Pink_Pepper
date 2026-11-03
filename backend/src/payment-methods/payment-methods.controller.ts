import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { PaymentMethodsService } from './payment-methods.service.js';
import { CreatePaymentMethodDto } from './dto/create-payment-method.dto.js';
import { UpdatePaymentMethodDto } from './dto/update-payment-method.dto.js';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';

@ApiTags('Payment Methods')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('payment-methods')
export class PaymentMethodsController {
  constructor(
    private readonly paymentMethodsService: PaymentMethodsService,
  ) {}

  // Consultar las tarjetas del usuario autenticado
  @Get()
  @ApiOperation({ summary: 'Consultar mis métodos de pago' })
  findAll(@CurrentUser('sub') userId: number) {
    return this.paymentMethodsService.findAll(userId);
  }

  // Registrar una nueva tarjeta
  @Post()
  @ApiOperation({ summary: 'Registrar una tarjeta' })
  create(
    @CurrentUser('sub') userId: number,
    @Body() dto: CreatePaymentMethodDto,
  ) {
    return this.paymentMethodsService.create(userId, dto);
  }

  // Actualizar una tarjeta
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una tarjeta' })
  update(
    @CurrentUser('sub') userId: number,
    @Param('id', ParseIntPipe) paymentMethodId: number,
    @Body() dto: UpdatePaymentMethodDto,
  ) {
    return this.paymentMethodsService.update(
      userId,
      paymentMethodId,
      dto,
    );
  }

  // Eliminar una tarjeta
  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una tarjeta' })
  remove(
    @CurrentUser('sub') userId: number,
    @Param('id', ParseIntPipe) paymentMethodId: number,
  ) {
    return this.paymentMethodsService.remove(userId, paymentMethodId);
  }

  // Establecer una tarjeta como principal
  @Patch(':id/default')
  @ApiOperation({ summary: 'Establecer tarjeta principal' })
  setDefault(
    @CurrentUser('sub') userId: number,
    @Param('id', ParseIntPipe) paymentMethodId: number,
  ) {
    return this.paymentMethodsService.setDefault(
      userId,
      paymentMethodId,
    );
  }
}