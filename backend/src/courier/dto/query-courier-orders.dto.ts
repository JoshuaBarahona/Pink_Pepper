import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsEnum, IsOptional } from 'class-validator';
import { EstadoPedido } from '../../generated/prisma/enums.js';

const normalizeEstadoPedido = ({ value }: { value: unknown }): unknown =>
  typeof value === 'string'
    ? value.trim().toUpperCase().replace(/\s+/g, '_')
    : value;

const parseOptionalBoolean = ({ value }: { value: unknown }): unknown => {
  if (value === 'true' || value === true) return true;
  if (value === 'false' || value === false) return false;
  return value;
};

export class QueryCourierOrdersDto {
  @ApiPropertyOptional({
    description: 'Filtrar pedidos asignados por estado específico',
    enum: EstadoPedido,
    example: EstadoPedido.LISTO_PARA_REPARTIDOR,
  })
  @IsOptional()
  @Transform(normalizeEstadoPedido)
  @IsEnum(EstadoPedido, {
    message:
      'El filtro de estado debe ser RECIBIDO, EN_PREPARACION, LISTO_PARA_REPARTIDOR, EN_CAMINO o ENTREGADO.',
  })
  estado?: EstadoPedido;

  @ApiPropertyOptional({
    description:
      'Si es true, incluye también los pedidos ya entregados en el listado',
    example: false,
  })
  @IsOptional()
  @Transform(parseOptionalBoolean)
  @IsBoolean({
    message: 'El parámetro includeDelivered debe ser booleano (true o false).',
  })
  includeDelivered?: boolean;
}
