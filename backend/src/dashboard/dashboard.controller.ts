import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Rol } from '../generated/prisma/enums.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { DashboardService } from './dashboard.service.js';

@ApiTags('Dashboard')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Token JWT ausente o inválido.' })
@ApiForbiddenResponse({
  description: 'Acceso exclusivo para usuarios con rol GERENTE.',
})
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Rol.GERENTE)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  @ApiOperation({
    summary: 'Obtener consolidado completo de métricas del dashboard (GERENTE)',
    description:
      'Devuelve pedidos realizados, tiempo promedio de entrega de repartidores y ganancias de los últimos 7 días.',
  })
  @ApiOkResponse({
    description: 'Resumen completo de métricas gerenciales.',
  })
  getDashboardMetrics() {
    return this.dashboardService.getDashboardMetrics();
  }

  @Get('orders')
  @ApiOperation({
    summary: 'Obtener métricas de pedidos realizados (GERENTE)',
    description:
      'Incluye total histórico, total en la última semana y desglose por EstadoPedido.',
  })
  @ApiOkResponse({ description: 'Métricas de pedidos realizados.' })
  getOrdersMetrics() {
    return this.dashboardService.getOrdersMetrics();
  }

  @Get('couriers')
  @ApiOperation({
    summary: 'Obtener tiempo promedio de entrega de los repartidores (GERENTE)',
    description:
      'Calcula el promedio global y el desglose individual por repartidor en minutos.',
  })
  @ApiOkResponse({
    description: 'Tiempos promedio de entrega y carga activa por repartidor.',
  })
  getCouriersAverageTime() {
    return this.dashboardService.getCouriersAverageTime();
  }

  @Get('earnings')
  @ApiOperation({
    summary: 'Obtener ganancias de la última semana día por día (GERENTE)',
    description:
      'Suma ingresos de los últimos 7 días con serie diaria para gráficas.',
  })
  @ApiOkResponse({
    description: 'Ingresos semanales totales, entregados y desglose por día.',
  })
  getWeeklyEarnings() {
    return this.dashboardService.getWeeklyEarnings();
  }
}
