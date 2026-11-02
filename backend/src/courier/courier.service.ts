import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { EstadoPedido, Rol } from '../generated/prisma/enums.js';
import type { Prisma } from '../generated/prisma/client.js';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface.js';
import {
  MAX_ACTIVE_ORDERS_PER_COURIER,
  ORDER_INCLUDE,
  type OrderDeliveryLocation,
  type OrderItemResponse,
  type PedidoCompleto,
} from '../orders/orders.service.js';
import { QueryCourierOrdersDto } from './dto/query-courier-orders.dto.js';

export interface CourierCustomerInfo {
  id_usuario: number;
  nombre_completo: string;
  primer_nombre: string;
  segundo_nombre: string;
  primer_apellido: string;
  segundo_apellido: string;
  telefono: string;
  correo: string;
}

export interface CourierOrderResponse {
  id_pedido: number;
  id_repartidor: number;
  estado_pedido: EstadoPedido;
  fecha_creacion: Date;
  fecha_entrega: Date;
  direccion: string;
  referencia: string;
  notas_cliente: string;
  ubicacion_entrega: OrderDeliveryLocation;
  metodo_pago: string;
  costo_envio: number;
  total: number;
  cliente: CourierCustomerInfo | null;
  detalles: OrderItemResponse[];
}

export interface CourierCapacityResponse {
  id_repartidor: number;
  pedidos_activos: number;
  maximo_permitido: number;
  cupos_disponibles: number;
  disponible_para_nuevos_pedidos: boolean;
  pedidos: CourierOrderResponse[];
}

const COURIER_ALLOWED_TARGETS = new Set<EstadoPedido>([
  EstadoPedido.EN_CAMINO,
  EstadoPedido.ENTREGADO,
]);

@Injectable()
export class CourierService {
  constructor(private readonly prisma: PrismaService) {}

  async findAssignedOrders(
    courierId: number,
    query: QueryCourierOrdersDto = {},
  ): Promise<CourierOrderResponse[]> {
    const where: Prisma.PedidoWhereInput = {
      id_repartidor: courierId,
    };

    if (query.estado !== undefined) {
      where.estado_pedido = query.estado;
    } else if (!query.includeDelivered) {
      where.estado_pedido = {
        not: EstadoPedido.ENTREGADO,
      };
    }

    const pedidos = await this.prisma.pedido.findMany({
      where,
      include: ORDER_INCLUDE,
      orderBy: {
        fecha_creacion: 'asc',
      },
    });

    return pedidos.map((item) => this.formatCourierOrder(item));
  }

  async getCapacitySummary(
    courierId: number,
  ): Promise<CourierCapacityResponse> {
    const pedidosActivos = await this.findAssignedOrders(courierId, {
      includeDelivered: false,
    });

    const cantidadActivos = pedidosActivos.length;
    const cuposDisponibles = Math.max(
      0,
      MAX_ACTIVE_ORDERS_PER_COURIER - cantidadActivos,
    );

    return {
      id_repartidor: courierId,
      pedidos_activos: cantidadActivos,
      maximo_permitido: MAX_ACTIVE_ORDERS_PER_COURIER,
      cupos_disponibles: cuposDisponibles,
      disponible_para_nuevos_pedidos:
        cantidadActivos < MAX_ACTIVE_ORDERS_PER_COURIER,
      pedidos: pedidosActivos,
    };
  }

  async findOneAssignedOrder(
    orderId: number,
    user: JwtPayload,
  ): Promise<CourierOrderResponse> {
    const pedido = await this.prisma.pedido.findUnique({
      where: { id_pedido: orderId },
      include: ORDER_INCLUDE,
    });

    if (!pedido) {
      throw new NotFoundException(`Pedido con ID ${orderId} no encontrado.`);
    }

    if (user.rol !== Rol.ADMIN && pedido.id_repartidor !== user.sub) {
      throw new ForbiddenException(
        'Este pedido no se encuentra asignado a tu cuenta de repartidor.',
      );
    }

    return this.formatCourierOrder(pedido);
  }

  async updateDeliveryStatus(
    orderId: number,
    nextStatus: EstadoPedido,
    user: JwtPayload,
  ): Promise<CourierOrderResponse> {
    if (!COURIER_ALLOWED_TARGETS.has(nextStatus)) {
      throw new ForbiddenException(
        'El repartidor solo puede cambiar el estado del pedido a EN_CAMINO o ENTREGADO.',
      );
    }

    const pedido = await this.prisma.pedido.findUnique({
      where: { id_pedido: orderId },
    });

    if (!pedido) {
      throw new NotFoundException(`Pedido con ID ${orderId} no encontrado.`);
    }

    if (user.rol !== Rol.ADMIN && pedido.id_repartidor !== user.sub) {
      throw new ForbiddenException(
        'No tienes permiso para modificar un pedido asignado a otro repartidor.',
      );
    }

    this.validateCourierTransition(pedido.estado_pedido, nextStatus);

    const data: Prisma.PedidoUncheckedUpdateInput = {
      estado_pedido: nextStatus,
    };

    if (nextStatus === EstadoPedido.ENTREGADO) {
      data.fecha_entrega = new Date();
    }

    const actualizado = await this.prisma.pedido.update({
      where: { id_pedido: orderId },
      data,
      include: ORDER_INCLUDE,
    });

    return this.formatCourierOrder(actualizado);
  }

  private validateCourierTransition(
    current: EstadoPedido,
    next: EstadoPedido,
  ): void {
    if (current === EstadoPedido.ENTREGADO) {
      throw new BadRequestException(
        'Este pedido ya fue marcado como ENTREGADO.',
      );
    }

    if (
      current === EstadoPedido.RECIBIDO ||
      current === EstadoPedido.EN_PREPARACION
    ) {
      throw new BadRequestException(
        'El pedido aún se encuentra en cocina; debe estar LISTO_PARA_REPARTIDOR antes de salir a entrega o entregarse.',
      );
    }

    if (next === EstadoPedido.EN_CAMINO) {
      if (current === EstadoPedido.EN_CAMINO) {
        throw new BadRequestException('El pedido ya se encuentra EN_CAMINO.');
      }
      if (current !== EstadoPedido.LISTO_PARA_REPARTIDOR) {
        throw new BadRequestException(
          'Solo un pedido LISTO_PARA_REPARTIDOR puede pasar a EN_CAMINO.',
        );
      }
      return;
    }

    if (next === EstadoPedido.ENTREGADO) {
      if (
        current !== EstadoPedido.EN_CAMINO &&
        current !== EstadoPedido.LISTO_PARA_REPARTIDOR
      ) {
        throw new BadRequestException(
          'El pedido debe estar LISTO_PARA_REPARTIDOR o EN_CAMINO para marcarse como ENTREGADO.',
        );
      }
    }
  }

  private formatCourierOrder(pedido: PedidoCompleto): CourierOrderResponse {
    const clienteRaw = pedido.Usuario_Pedido_id_clienteToUsuario;
    const nombreCompleto = clienteRaw
      ? [
          clienteRaw.primer_nombre,
          clienteRaw.segundo_nombre,
          clienteRaw.primer_apellido,
          clienteRaw.segundo_apellido,
        ]
          .filter(Boolean)
          .join(' ')
      : '';

    const direccion = pedido.direccion;
    const mapsUrl = direccion
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(direccion)}`
      : '';

    return {
      id_pedido: pedido.id_pedido,
      id_repartidor: pedido.id_repartidor,
      estado_pedido: pedido.estado_pedido,
      fecha_creacion: pedido.fecha_creacion,
      fecha_entrega: pedido.fecha_entrega,
      direccion,
      referencia: pedido.referencia,
      notas_cliente: pedido.notas_cliente,
      ubicacion_entrega: {
        direccion,
        referencia: pedido.referencia,
        notas_cliente: pedido.notas_cliente,
        maps_url: mapsUrl,
      },
      metodo_pago: pedido.metodo_pago,
      costo_envio: Number(pedido.costo_envio),
      total: Number(pedido.total),
      cliente: clienteRaw
        ? {
            id_usuario: clienteRaw.id_usuario,
            nombre_completo: nombreCompleto,
            primer_nombre: clienteRaw.primer_nombre,
            segundo_nombre: clienteRaw.segundo_nombre,
            primer_apellido: clienteRaw.primer_apellido,
            segundo_apellido: clienteRaw.segundo_apellido,
            telefono: clienteRaw.telefono,
            correo: clienteRaw.correo,
          }
        : null,
      detalles: pedido.detalle_pedido.map((det) => ({
        id_detalle: det.id_detalle,
        id_producto: det.id_producto,
        nombre_producto: det.producto.nombre,
        categoria: det.producto.categoria.nombre_categoria,
        cantidad: det.cantidad,
        precio_unitario: Number(det.precio_unitario),
        subtotal: Number(det.subtotal),
      })),
    };
  }
}
