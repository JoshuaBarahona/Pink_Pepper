import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateAddressDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  nombre_direccion!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  direccion!: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  referencia?: string;

  @IsOptional()
  @IsBoolean()
  es_principal?: boolean;
}
