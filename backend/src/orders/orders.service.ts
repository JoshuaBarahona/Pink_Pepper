import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { Categoria, EstadoPedido, Rol } from '../generated/prisma/enums.js';
import type {
  Pedido,
  Prisma,
  Usuario,
  categoria,
  detalle_pedido,
  producto,
} from '../generated/prisma/client.js';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface.js';
import { CreateOrderDto } from './dto/create-order.dto.js';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto.js';
import { QueryOrdersDto } from './dto/query-orders.dto.js';

export const MAX_ACTIVE_ORDERS_PER_COURIER = 2;

export const ORDER_INCLUDE = {
  Usuario_Pedido_id_clienteToUsuario: true,
  Usuario_Pedido_id_repartidorToUsuario: true,
  detalle_pedido: {
    include: {
      producto: {
        include: {
          categoria: true,
        },
      },
    },
  },
} as const;

type DetalleConProducto = detalle_pedido & {
  producto: producto & {
    categoria: categoria;
  };
};

export type PedidoCompleto = Pedido & {
  Usuario_Pedido_id_clienteToUsuario: Usuario | null;
  Usuario_Pedido_id_repartidorToUsuario: Usuario | null;
  detalle_pedido: DetalleConProducto[];
};

export interface OrderUserSummary {
  id_usuario: number;
  primer_nombre: string;
  segundo_nombre: string;
  primer_apellido: string;
  segundo_apellido: string;
  correo: string;
  telefono: string;
}

export interface OrderDeliveryLocation {
  direccion: string;
  referencia: string;
  notas_cliente: string;
  maps_url: string;
}

export interface OrderItemResponse {
  id_detalle: number;
  id_producto: number;
  nombre_producto: string;
  categoria: Categoria;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
}

export interface OrderResponse {
  id_pedido: number;
  id_cliente: number;
  id_repartidor: number;
  fecha_creacion: Date;
  fecha_entrega: Date;
  direccion: string;
  referencia: string;
  notas_cliente: string;
  ubicacion_entrega: OrderDeliveryLocation;
  metodo_pago: string;
  comprobante: string;
  costo_envio: number;
  total: number;
  estado_pedido: EstadoPedido;
  motivo_cancelacion: string;
  cliente: OrderUserSummary | null;
  repartidor: OrderUserSummary | null;
  detalles: OrderItemResponse[];
}

const KITCHEN_ALLOWED_TARGETS = new Set<EstadoPedido>([
  EstadoPedido.EN_PREPARACION,
  EstadoPedido.LISTO_PARA_REPARTIDOR,
]);

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: number, dto: CreateOrderDto): Promise<OrderResponse> {
    const cliente = await this.prisma.usuario.findUnique({
      where: { id_usuario: userId },
    });

    if (!cliente) {
      throw new NotFoundException('Usuario cliente no encontrado.');
    }

    if (!cliente.estado) {
      throw new ForbiddenException('Esta cuenta se encuentra deshabilitada.');
    }

    const uniqueProductIds = [
      ...new Set(dto.items.map((item) => item.id_producto)),
    ];

    const productos = await this.prisma.producto.findMany({
      where: {
        id_producto: { in: uniqueProductIds },
      },
    });

    const productMap = new Map<number, producto>(
      productos.map((prod) => [prod.id_producto, prod]),
    );

    for (const productId of uniqueProductIds) {
      const prod = productMap.get(productId);
      if (!prod) {
        throw new NotFoundException(
          `El producto con ID ${productId} no existe.`,
        );
      }
      if (!prod.estado) {
        throw new BadRequestException(
          `El producto "${prod.nombre}" no se encuentra disponible actualmente.`,
        );
      }
    }

    let itemsTotal = 0;
    const detallesData = dto.items.map((item) => {
      const prod = productMap.get(item.id_producto)!;
      const precioUnitario = Number(prod.precio);
      const subtotal = Number((precioUnitario * item.cantidad).toFixed(2));
      itemsTotal += subtotal;

      return {
        id_producto: item.id_producto,
        cantidad: item.cantidad,
        precio_unitario: precioUnitario,
        subtotal,
      };
    });

    const costoEnvio = dto.costo_envio ?? 0;
    const total = Number((itemsTotal + costoEnvio).toFixed(2));

    const nuevoPedido = await this.prisma.$transaction(async (tx) => {
      const idRepartidor = await this.selectAvailableCourierId(tx);
      const now = new Date();

      return tx.pedido.create({
        data: {
          id_cliente: userId,
          id_repartidor: idRepartidor,
          fecha_creacion: now,
          fecha_entrega: now,
          direccion: dto.direccion,
          referencia: dto.referencia ?? '',
          notas_cliente: dto.notas_cliente ?? '',
          metodo_pago: dto.metodo_pago,
          comprobante: dto.comprobante ?? '',
          costo_envio: costoEnvio,
          total,
          estado_pedido: EstadoPedido.RECIBIDO,
          motivo_cancelacion: '',
          detalle_pedido: {
            create: detallesData,
          },
        },
        include: ORDER_INCLUDE,
      });
    });

    return this.formatOrder(nuevoPedido);
  }

  async findForUserRole(
    user: JwtPayload,
    query: QueryOrdersDto = {},
  ): Promise<OrderResponse[]> {
    if (user.rol === Rol.GERENTE || user.rol === Rol.ADMIN) {
      return this.findAllChronological(query);
    }

    if (user.rol === Rol.COCINA) {
      return this.findKitchenPending(query);
    }

    if (user.rol === Rol.REPARTIDOR) {
      return this.findCourierOrders(user.sub, query);
    }

    return this.findMyOrders(user.sub, query);
  }

  async findMyOrders(
    userId: number,
    query: QueryOrdersDto = {},
  ): Promise<OrderResponse[]> {
    const where: Prisma.PedidoWhereInput = {
      id_cliente: userId,
    };

    if (query.estado !== undefined) {
      where.estado_pedido = query.estado;
    }

    const pedidos = await this.prisma.pedido.findMany({
      where,
      include: ORDER_INCLUDE,
      orderBy: {
        fecha_creacion: 'asc',
      },
    });

    return pedidos.map((item) => this.formatOrder(item));
  }

  async findCourierOrders(
    courierId: number,
    query: QueryOrdersDto = {},
  ): Promise<OrderResponse[]> {
    const where: Prisma.PedidoWhereInput = {
      id_repartidor: courierId,
      estado_pedido:
        query.estado !== undefined
          ? query.estado
          : { not: EstadoPedido.ENTREGADO },
    };

    const pedidos = await this.prisma.pedido.findMany({
      where,
      include: ORDER_INCLUDE,
      orderBy: {
        fecha_creacion: 'asc',
      },
    });

    return pedidos.map((item) => this.formatOrder(item));
  }

  async findAllChronological(
    query: QueryOrdersDto = {},
  ): Promise<OrderResponse[]> {
    const where: Prisma.PedidoWhereInput = {};

    if (query.estado !== undefined) {
      where.estado_pedido = query.estado;
    }

    const pedidos = await this.prisma.pedido.findMany({
      where,
      include: ORDER_INCLUDE,
      orderBy: {
        fecha_creacion: 'asc',
      },
    });

    return pedidos.map((item) => this.formatOrder(item));
  }

  async findKitchenPending(
    query: QueryOrdersDto = {},
  ): Promise<OrderResponse[]> {
    if (query.estado === EstadoPedido.ENTREGADO) {
      throw new BadRequestException(
        'El área de cocina solo puede consultar pedidos que no estén completados.',
      );
    }

    const where: Prisma.PedidoWhereInput = {
      estado_pedido:
        query.estado !== undefined
          ? query.estado
          : { not: EstadoPedido.ENTREGADO },
    };

    const pedidos = await this.prisma.pedido.findMany({
      where,
      include: ORDER_INCLUDE,
      orderBy: {
        fecha_creacion: 'asc',
      },
    });

    return pedidos.map((item) => this.formatOrder(item));
  }

  async findOne(id: number, user: JwtPayload): Promise<OrderResponse> {
    const pedido = await this.prisma.pedido.findUnique({
      where: { id_pedido: id },
      include: ORDER_INCLUDE,
    });

    if (!pedido) {
      throw new NotFoundException(`Pedido con ID ${id} no encontrado.`);
    }

    if (user.rol === Rol.GERENTE || user.rol === Rol.ADMIN) {
      return this.formatOrder(pedido);
    }

    if (user.rol === Rol.COCINA) {
      if (pedido.estado_pedido === EstadoPedido.ENTREGADO) {
        throw new ForbiddenException(
          'El área de cocina solo puede visualizar pedidos que no estén completados.',
        );
      }
      return this.formatOrder(pedido);
    }

    if (user.rol === Rol.REPARTIDOR) {
      if (pedido.id_repartidor !== user.sub) {
        throw new ForbiddenException(
          'Este pedido no se encuentra asignado a tu cuenta de repartidor.',
        );
      }
      return this.formatOrder(pedido);
    }

    if (pedido.id_cliente !== user.sub) {
      throw new ForbiddenException(
        'No tienes permiso para visualizar un pedido de otro usuario.',
      );
    }

    return this.formatOrder(pedido);
  }

  async updateStatus(
    id: number,
    dto: UpdateOrderStatusDto,
    user: JwtPayload,
  ): Promise<OrderResponse> {
    const pedido = await this.prisma.pedido.findUnique({
      where: { id_pedido: id },
    });

    if (!pedido) {
      throw new NotFoundException(`Pedido con ID ${id} no encontrado.`);
    }

    const nextStatus = dto.estado_pedido;
    const currentStatus = pedido.estado_pedido;

    if (user.rol === Rol.COCINA && !KITCHEN_ALLOWED_TARGETS.has(nextStatus)) {
      throw new ForbiddenException(
        'Cocina solo puede cambiar el estado a EN_PREPARACION o LISTO_PARA_REPARTIDOR.',
      );
    }

    this.validateTransition(currentStatus, nextStatus, user.rol);

    const data: Prisma.PedidoUncheckedUpdateInput = {
      estado_pedido: nextStatus,
    };

    if (nextStatus === EstadoPedido.ENTREGADO) {
      data.fecha_entrega = new Date();
    }

    const actualizado = await this.prisma.pedido.update({
      where: { id_pedido: id },
      data,
      include: ORDER_INCLUDE,
    });

    return this.formatOrder(actualizado);
  }

  /**
   * Selecciona un repartidor activo que tenga menos de 2 pedidos activos
   * (es decir, pedidos cuyo estado no sea ENTREGADO), priorizando al que tenga menor carga.
   */
  private async selectAvailableCourierId(
    tx: Prisma.TransactionClient,
  ): Promise<number> {
    const repartidores = await tx.usuario.findMany({
      where: {
        estado: true,
        rol_: {
          nombre_rol: Rol.REPARTIDOR,
        },
      },
      include: {
        Pedido_Pedido_id_repartidorToUsuario: {
          where: {
            estado_pedido: {
              not: EstadoPedido.ENTREGADO,
            },
          },
          select: {
            id_pedido: true,
          },
        },
      },
      orderBy: {
        id_usuario: 'asc',
      },
    });

    if (repartidores.length === 0) {
      throw new ConflictException(
        'No hay repartidores activos registrados para asignar el pedido.',
      );
    }

    const disponibles = repartidores
      .filter(
        (rep) =>
          rep.Pedido_Pedido_id_repartidorToUsuario.length <
          MAX_ACTIVE_ORDERS_PER_COURIER,
      )
      .sort(
        (a, b) =>
          a.Pedido_Pedido_id_repartidorToUsuario.length -
          b.Pedido_Pedido_id_repartidorToUsuario.length,
      );

    if (disponibles.length === 0) {
      throw new ConflictException(
        `No hay repartidores disponibles en este momento (máximo ${MAX_ACTIVE_ORDERS_PER_COURIER} pedidos activos por repartidor).`,
      );
    }

    return disponibles[0].id_usuario;
  }

  private validateTransition(
    current: EstadoPedido,
    next: EstadoPedido,
    rol: Rol,
  ): void {
    if (current === EstadoPedido.ENTREGADO) {
      throw new BadRequestException(
        'El pedido ya fue entregado y no puede cambiar de estado.',
      );
    }

    if (current === EstadoPedido.RECIBIDO) {
      if (next !== EstadoPedido.EN_PREPARACION) {
        throw new BadRequestException(
          'Un pedido en estado RECIBIDO solo puede pasar a EN_PREPARACION.',
        );
      }
      return;
    }

    if (current === EstadoPedido.EN_PREPARACION) {
      if (next !== EstadoPedido.LISTO_PARA_REPARTIDOR) {
        throw new BadRequestException(
          'Un pedido EN_PREPARACION solo puede pasar a LISTO_PARA_REPARTIDOR.',
        );
      }
      return;
    }

    if (current === EstadoPedido.LISTO_PARA_REPARTIDOR) {
      if (rol === Rol.COCINA) {
        throw new ForbiddenException(
          'El pedido ya está LISTO_PARA_REPARTIDOR; cocina no puede avanzar más su estado.',
        );
      }
      if (next !== EstadoPedido.EN_CAMINO && next !== EstadoPedido.ENTREGADO) {
        throw new BadRequestException(
          'Un pedido LISTO_PARA_REPARTIDOR solo puede pasar a EN_CAMINO o ENTREGADO.',
        );
      }
      return;
    }

    if (current === EstadoPedido.EN_CAMINO) {
      if (rol === Rol.COCINA) {
        throw new ForbiddenException(
          'El pedido ya está EN_CAMINO; cocina no puede modificar su estado.',
        );
      }
      if (next !== EstadoPedido.ENTREGADO) {
        throw new BadRequestException(
          'Un pedido EN_CAMINO solo puede pasar a ENTREGADO.',
        );
      }
    }
  }

  private sanitizeUser(usuario: Usuario | null): OrderUserSummary | null {
    if (!usuario) return null;

    return {
      id_usuario: usuario.id_usuario,
      primer_nombre: usuario.primer_nombre,
      segundo_nombre: usuario.segundo_nombre,
      primer_apellido: usuario.primer_apellido,
      segundo_apellido: usuario.segundo_apellido,
      correo: usuario.correo,
      telefono: usuario.telefono,
    };
  }

  formatOrder(pedido: PedidoCompleto): OrderResponse {
    const direccion = pedido.direccion;
    const mapsUrl = direccion
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(direccion)}`
      : '';

    return {
      id_pedido: pedido.id_pedido,
      id_cliente: pedido.id_cliente,
      id_repartidor: pedido.id_repartidor,
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
      comprobante: pedido.comprobante,
      costo_envio: Number(pedido.costo_envio),
      total: Number(pedido.total),
      estado_pedido: pedido.estado_pedido,
      motivo_cancelacion: pedido.motivo_cancelacion,
      cliente: this.sanitizeUser(pedido.Usuario_Pedido_id_clienteToUsuario),
      repartidor: this.sanitizeUser(
        pedido.Usuario_Pedido_id_repartidorToUsuario,
      ),
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
