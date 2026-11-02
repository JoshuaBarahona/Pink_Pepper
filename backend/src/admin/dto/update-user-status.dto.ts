import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class UpdateUserStatusDto {
  @ApiProperty({
    description:
      'Estado del usuario (false desactiva el acceso sin eliminar el registro)',
    example: false,
  })
  @IsBoolean({ message: 'El estado del usuario debe ser un valor booleano.' })
  estado: boolean;
}
