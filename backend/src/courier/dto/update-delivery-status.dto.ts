import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsIn } from 'class-validator';
import { EstadoPedido } from '../../generated/prisma/enums.js';

const normalizeEstadoPedido = ({ value }: { value: unknown }): unknown =>
  typeof value === 'string'
    ? value.trim().toUpperCase().replace(/\s+/g, '_')
    : value;

export class UpdateDeliveryStatusDto {
  @ApiProperty({
    description:
      'Nuevo estado de entrega permitido para el repartidor (EN_CAMINO o ENTREGADO)',
    enum: [EstadoPedido.EN_CAMINO, EstadoPedido.ENTREGADO],
    example: EstadoPedido.EN_CAMINO,
  })
  @Transform(normalizeEstadoPedido)
  @IsIn([EstadoPedido.EN_CAMINO, EstadoPedido.ENTREGADO], {
    message:
      'El repartidor solo puede actualizar el estado del pedido a EN_CAMINO o ENTREGADO.',
  })
  estado_pedido: EstadoPedido;
}
