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

import { AddressesService } from './addresses.service.js';
import { CreateAddressDto } from './dto/create-address.dto.js';
import { UpdateAddressDto } from './dto/update-address.dto.js';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';

@ApiTags('Addresses')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('addresses')
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  // Consultar las direcciones del usuario autenticado
  @Get()
  @ApiOperation({ summary: 'Consultar mis direcciones' })
  findAll(@CurrentUser('sub') userId: number) {
    return this.addressesService.findAll(userId);
  }

  // Registrar una nueva dirección
  @Post()
  @ApiOperation({ summary: 'Registrar una dirección' })
  create(
    @CurrentUser('sub') userId: number,
    @Body() dto: CreateAddressDto,
  ) {
    return this.addressesService.create(userId, dto);
  }

  // Actualizar una dirección
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una dirección' })
  update(
    @CurrentUser('sub') userId: number,
    @Param('id', ParseIntPipe) addressId: number,
    @Body() dto: UpdateAddressDto,
  ) {
    return this.addressesService.update(userId, addressId, dto);
  }

  // Eliminar una dirección
  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una dirección' })
  remove(
    @CurrentUser('sub') userId: number,
    @Param('id', ParseIntPipe) addressId: number,
  ) {
    return this.addressesService.remove(userId, addressId);
  }

  // Establecer una dirección como principal
  @Patch(':id/default')
  @ApiOperation({ summary: 'Establecer dirección principal' })
  setDefault(
    @CurrentUser('sub') userId: number,
    @Param('id', ParseIntPipe) addressId: number,
  ) {
    return this.addressesService.setDefault(userId, addressId);
  }
}