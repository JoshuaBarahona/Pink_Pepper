import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum } from 'class-validator';
import { EstadoPedido } from '../../generated/prisma/enums.js';

const normalizeEstadoPedido = ({ value }: { value: unknown }): unknown =>
  typeof value === 'string'
    ? value.trim().toUpperCase().replace(/\s+/g, '_')
    : value;

export class UpdateOrderStatusDto {
  @ApiProperty({
    description:
      'Nuevo estado del pedido (COCINA solo puede avanzar de RECIBIDO -> EN_PREPARACION -> LISTO_PARA_REPARTIDOR)',
    enum: EstadoPedido,
    example: EstadoPedido.EN_PREPARACION,
  })
  @Transform(normalizeEstadoPedido)
  @IsEnum(EstadoPedido, {
    message:
      'El estado del pedido debe ser RECIBIDO, EN_PREPARACION, LISTO_PARA_REPARTIDOR, EN_CAMINO o ENTREGADO.',
  })
  estado_pedido!: EstadoPedido;
}
