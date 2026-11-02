import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiServiceUnavailableResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Rol } from '../generated/prisma/enums.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface.js';
import { OrdersService } from './orders.service.js';
import { CreateOrderDto } from './dto/create-order.dto.js';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto.js';
import { QueryOrdersDto } from './dto/query-orders.dto.js';

@ApiTags('Orders')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Token JWT ausente o inválido.' })
@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({
    summary: 'Crear un nuevo pedido',
    description:
      'Crea un pedido en estado RECIBIDO y asigna automáticamente un repartidor disponible con menos de 2 pedidos activos.',
  })
  @ApiCreatedResponse({
    description: 'Pedido creado exitosamente con repartidor asignado.',
  })
  @ApiBadRequestResponse({
    description: 'Productos inexistentes/inactivos o datos inválidos.',
  })
  @ApiServiceUnavailableResponse({
    description:
      'No hay repartidores disponibles con menos de 2 pedidos activos.',
  })
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateOrderDto) {
    return this.ordersService.create(user.sub, dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar pedidos según el rol del usuario autenticado',
    description:
      'CLIENTE ve sus propios pedidos; GERENTE y ADMIN ven todos en orden cronológico; COCINA ve pendientes de cocina; REPARTIDOR ve los asignados.',
  })
  @ApiOkResponse({
    description: 'Lista de pedidos correspondiente al rol del usuario.',
  })
  findAllByRole(
    @CurrentUser() user: JwtPayload,
    @Query() query: QueryOrdersDto,
  ) {
    return this.ordersService.findForUserRole(user, query);
  }

  @Get('my-orders')
  @ApiOperation({
    summary: 'Listar los pedidos creados por el usuario autenticado',
  })
  @ApiOkResponse({
    description: 'Historial de pedidos creados por el cliente actual.',
  })
  findMyOrders(
    @CurrentUser() user: JwtPayload,
    @Query() query: QueryOrdersDto,
  ) {
    return this.ordersService.findMyOrders(user.sub, query);
  }

  @UseGuards(RolesGuard)
  @Roles(Rol.GERENTE, Rol.ADMIN)
  @Get('all')
  @ApiOperation({
    summary: 'Listar todos los pedidos en orden cronológico (GERENTE y ADMIN)',
  })
  @ApiOkResponse({
    description: 'Listado cronológico completo de pedidos.',
  })
  @ApiForbiddenResponse({
    description: 'Se requiere rol GERENTE o ADMIN.',
  })
  findAllChronological(@Query() query: QueryOrdersDto) {
    return this.ordersService.findAllChronological(query);
  }

  @UseGuards(RolesGuard)
  @Roles(Rol.COCINA, Rol.ADMIN)
  @Get('kitchen')
  @ApiOperation({
    summary: 'Listar pedidos pendientes para cocina (COCINA y ADMIN)',
    description:
      'Devuelve los pedidos que aún no están completados (RECIBIDO y EN_PREPARACION por defecto).',
  })
  @ApiOkResponse({
    description: 'Cola de pedidos activos para cocina.',
  })
  @ApiForbiddenResponse({
    description: 'Se requiere rol COCINA o ADMIN.',
  })
  findKitchenPending(@Query() query: QueryOrdersDto) {
    return this.ordersService.findKitchenPending(query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtener el detalle de un pedido por ID',
    description:
      'Valida permisos: el cliente propietario, el repartidor asignado o personal autorizado pueden consultarlo.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID numérico del pedido',
  })
  @ApiOkResponse({ description: 'Detalle completo del pedido.' })
  @ApiForbiddenResponse({
    description: 'No tienes permiso para ver este pedido.',
  })
  @ApiNotFoundResponse({ description: 'Pedido no encontrado.' })
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.ordersService.findOne(id, user);
  }

  @UseGuards(RolesGuard)
  @Roles(Rol.COCINA, Rol.ADMIN)
  @Patch(':id/status')
  @ApiOperation({
    summary: 'Actualizar estado de preparación en cocina (COCINA y ADMIN)',
    description:
      'El rol COCINA solo puede cambiar de RECIBIDO a EN_PREPARACION y de EN_PREPARACION a LISTO_PARA_REPARTIDOR.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID numérico del pedido',
  })
  @ApiOkResponse({ description: 'Estado del pedido actualizado.' })
  @ApiBadRequestResponse({
    description: 'Transición de estado no permitida.',
  })
  @ApiForbiddenResponse({
    description: 'Se requiere rol COCINA o ADMIN.',
  })
  @ApiNotFoundResponse({ description: 'Pedido no encontrado.' })
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateOrderStatusDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.ordersService.updateStatus(id, dto, user);
  }
}
