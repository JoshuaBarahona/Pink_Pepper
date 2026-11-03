import {
  IsEmail,
  IsString,
  MaxLength,
  ValidateIf,
} from 'class-validator';

export class UpdateProfileDto {
  @ValidateIf((_object, value) => value !== undefined)
  @IsString()
  @MaxLength(20)
  primer_nombre?: string;

  @ValidateIf((_object, value) => value !== undefined)
  @IsString()
  @MaxLength(20)
  segundo_nombre?: string;

  @ValidateIf((_object, value) => value !== undefined)
  @IsString()
  @MaxLength(20)
  primer_apellido?: string;

  @ValidateIf((_object, value) => value !== undefined)
  @IsString()
  @MaxLength(20)
  segundo_apellido?: string;

  @ValidateIf((_object, value) => value !== undefined)
  @IsEmail()
  @MaxLength(50)
  correo?: string;

  @ValidateIf((_object, value) => value !== undefined)
  @IsString()
  @MaxLength(20)
  telefono?: string;
}