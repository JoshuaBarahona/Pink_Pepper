import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum, IsOptional } from 'class-validator';
import { EstadoPedido } from '../../generated/prisma/enums.js';

const normalizeEstadoPedido = ({ value }: { value: unknown }): unknown =>
  typeof value === 'string'
    ? value.trim().toUpperCase().replace(/\s+/g, '_')
    : value;

export class QueryOrdersDto {
  @ApiPropertyOptional({
    description: 'Filtrar pedidos por estado específico',
    enum: EstadoPedido,
    example: EstadoPedido.RECIBIDO,
  })
  @IsOptional()
  @Transform(normalizeEstadoPedido)
  @IsEnum(EstadoPedido, {
    message:
      'El filtro de estado debe ser RECIBIDO, EN_PREPARACION, LISTO_PARA_REPARTIDOR, EN_CAMINO o ENTREGADO.',
  })
  estado?: EstadoPedido;
}
