import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { EstadoPedido, Rol } from '../generated/prisma/enums.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface.js';
import { CourierService } from './courier.service.js';
import { UpdateDeliveryStatusDto } from './dto/update-delivery-status.dto.js';
import { QueryCourierOrdersDto } from './dto/query-courier-orders.dto.js';

@ApiTags('Courier')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Token JWT ausente o inválido.' })
@ApiForbiddenResponse({
  description: 'Se requiere rol REPARTIDOR o ADMIN.',
})
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Rol.REPARTIDOR, Rol.ADMIN)
@Controller('courier')
export class CourierController {
  constructor(private readonly courierService: CourierService) {}

  @Get('orders')
  @ApiOperation({
    summary: 'Listar los pedidos asignados al repartidor autenticado',
    description:
      'Incluye en cada pedido el bloque ubicacion_entrega (dirección, referencia, notas y teléfono del cliente). Por defecto devuelve solo pedidos activos (no ENTREGADO).',
  })
  @ApiOkResponse({
    description: 'Lista de entregas asignadas con ubicación de entrega.',
  })
  findAssignedOrders(
    @CurrentUser() user: JwtPayload,
    @Query() query: QueryCourierOrdersDto,
  ) {
    return this.courierService.findAssignedOrders(user.sub, query);
  }

  @Get('capacity')
  @ApiOperation({
    summary: 'Consultar cupo activo del repartidor (máximo 2 pedidos activos)',
  })
  @ApiOkResponse({
    description:
      'Resumen con pedidos_activos, maximo_pedidos_activos (2), cupos_disponibles y disponible.',
  })
  getCapacitySummary(@CurrentUser() user: JwtPayload) {
    return this.courierService.getCapacitySummary(user.sub);
  }

  @Get('orders/:id')
  @ApiOperation({
    summary: 'Obtener detalle y ubicación de entrega de un pedido asignado',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID numérico del pedido asignado',
  })
  @ApiOkResponse({
    description: 'Detalle del pedido y datos de ubicación de entrega.',
  })
  @ApiNotFoundResponse({ description: 'Pedido no encontrado.' })
  findOneAssignedOrder(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.courierService.findOneAssignedOrder(id, user);
  }

  @Patch('orders/:id/status')
  @ApiOperation({
    summary:
      'Actualizar el estado de entrega de un pedido (EN_CAMINO o ENTREGADO)',
    description:
      'Permite pasar de LISTO_PARA_REPARTIDOR a EN_CAMINO o ENTREGADO, y de EN_CAMINO a ENTREGADO.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID numérico del pedido',
  })
  @ApiOkResponse({
    description: 'Estado de entrega actualizado exitosamente.',
  })
  @ApiBadRequestResponse({
    description:
      'El pedido aún no está listo en cocina o la transición no es válida.',
  })
  @ApiNotFoundResponse({ description: 'Pedido no encontrado.' })
  updateDeliveryStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateDeliveryStatusDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.courierService.updateDeliveryStatus(
      id,
      dto.estado_pedido,
      user,
    );
  }

  @Patch('orders/:id/en-camino')
  @ApiOperation({
    summary: 'Marcar pedido asignado como EN_CAMINO',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID numérico del pedido',
  })
  @ApiOkResponse({ description: 'Pedido marcado como EN_CAMINO.' })
  @ApiBadRequestResponse({
    description: 'El pedido debe estar LISTO_PARA_REPARTIDOR.',
  })
  @ApiNotFoundResponse({ description: 'Pedido no encontrado.' })
  markEnCamino(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.courierService.updateDeliveryStatus(
      id,
      EstadoPedido.EN_CAMINO,
      user,
    );
  }

  @Patch('orders/:id/entregado')
  @ApiOperation({
    summary: 'Marcar pedido asignado como ENTREGADO y liberar cupo',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID numérico del pedido',
  })
  @ApiOkResponse({
    description: 'Pedido marcado como ENTREGADO con fecha_entrega actualizada.',
  })
  @ApiBadRequestResponse({
    description:
      'El pedido debe estar LISTO_PARA_REPARTIDOR o EN_CAMINO para marcarse como ENTREGADO.',
  })
  @ApiNotFoundResponse({ description: 'Pedido no encontrado.' })
  markDelivered(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.courierService.updateDeliveryStatus(
      id,
      EstadoPedido.ENTREGADO,
      user,
    );
  }
}
