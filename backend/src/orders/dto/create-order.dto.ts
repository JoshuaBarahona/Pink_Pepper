import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

const trimCollapse = ({ value }: { value: unknown }): unknown =>
  typeof value === 'string' ? value.trim().replace(/\s+/g, ' ') : value;

const trimString = ({ value }: { value: unknown }): unknown =>
  typeof value === 'string' ? value.trim() : value;

export class CreateOrderItemDto {
  @ApiProperty({
    description: 'Identificador numérico del producto activo en el menú',
    example: 1,
    minimum: 1,
  })
  @Type(() => Number)
  @IsInt({ message: 'El id_producto debe ser un número entero.' })
  @Min(1, { message: 'El id_producto debe ser mayor a cero.' })
  id_producto: number;

  @ApiProperty({
    description: 'Cantidad de unidades solicitadas del producto',
    example: 2,
    minimum: 1,
  })
  @Type(() => Number)
  @IsInt({ message: 'La cantidad debe ser un número entero.' })
  @Min(1, { message: 'La cantidad mínima por producto es 1.' })
  cantidad: number;
}

export class CreateOrderDto {
  @ApiProperty({
    description: 'Lista de productos y cantidades que integran el pedido',
    type: () => [CreateOrderItemDto],
  })
  @IsArray({ message: 'Debes enviar la lista de productos del pedido.' })
  @ArrayMinSize(1, { message: 'El pedido debe contener al menos un producto.' })
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];

  @ApiProperty({
    description: 'Dirección exacta de entrega para el repartidor',
    example: 'Col. Escalón, Calle La Mascota #214, San Salvador',
  })
  @Transform(trimCollapse)
  @IsString({ message: 'La dirección de entrega debe ser texto.' })
  @IsNotEmpty({ message: 'La dirección de entrega es obligatoria.' })
  direccion: string;

  @ApiPropertyOptional({
    description: 'Punto de referencia cercano para facilitar la entrega',
    example: 'Portón gris frente al parque',
  })
  @IsOptional()
  @Transform(trimCollapse)
  @IsString({ message: 'La referencia debe ser texto.' })
  referencia?: string;

  @ApiPropertyOptional({
    description: 'Instrucciones especiales para cocina o entrega',
    example: 'Una hamburguesa sin cebolla, por favor',
  })
  @IsOptional()
  @Transform(trimCollapse)
  @IsString({ message: 'Las notas del cliente deben ser texto.' })
  notas_cliente?: string;

  @ApiProperty({
    description: 'Método de pago elegido por el cliente',
    example: 'TARJETA',
  })
  @Transform(trimCollapse)
  @IsString({ message: 'El método de pago debe ser texto.' })
  @IsNotEmpty({ message: 'El método de pago es obligatorio.' })
  metodo_pago: string;

  @ApiPropertyOptional({
    description: 'Código o URL del comprobante de pago (si aplica)',
    example: 'TX-PP-2026-0001',
  })
  @IsOptional()
  @Transform(trimString)
  @IsString({ message: 'El comprobante debe ser texto.' })
  comprobante?: string;

  @ApiPropertyOptional({
    description: 'Costo de envío aplicable a la orden (por defecto 0)',
    example: 2.5,
    minimum: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'El costo de envío debe ser un número válido.' },
  )
  @Min(0, { message: 'El costo de envío no puede ser negativo.' })
  costo_envio?: number;
}
