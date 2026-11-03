import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthService } from './auth.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { Public } from './decorators/public.decorator.js';
import { CurrentUser } from './decorators/current-user.decorator.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';
import type { JwtPayload } from './interfaces/jwt-payload.interface.js';
import { UpdateProfileDto } from './dto/update-profile.dto.js';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @ApiOperation({
    summary: 'Registrar un nuevo usuario cliente',
    description:
      'Registra un nuevo usuario asignándole el rol CLIENTE por defecto, cifra su contraseña con bcrypt y retorna el access_token JWT.',
  })
  @ApiCreatedResponse({
    description: 'Usuario registrado exitosamente con su token JWT.',
  })
  @ApiConflictResponse({
    description: 'El correo electrónico ya se encuentra registrado.',
  })
  @ApiBadRequestResponse({
    description: 'Datos de entrada inválidos según las reglas del DTO.',
  })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  @ApiOperation({
    summary: 'Iniciar sesión con correo y contraseña',
    description:
      'Verifica las credenciales del usuario y devuelve un access_token JWT junto con el perfil sin contraseña.',
  })
  @ApiOkResponse({
    description: 'Inicio de sesión exitoso; devuelve access_token y usuario.',
  })
  @ApiUnauthorizedResponse({
    description: 'Correo electrónico o contraseña incorrectos.',
  })
  @ApiForbiddenResponse({
    description: 'La cuenta del usuario se encuentra deshabilitada.',
  })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Obtener el perfil del usuario autenticado',
    description:
      'Retorna los datos actualizados del usuario correspondiente al token JWT enviado.',
  })
  @ApiOkResponse({
    description: 'Datos del usuario autenticado.',
  })
  @ApiUnauthorizedResponse({
    description: 'Token JWT ausente, inválido o expirado.',
  })
  getProfile(@CurrentUser() user: JwtPayload) {
    return this.authService.getProfile(user.sub);
  }

  @UseGuards(JwtAuthGuard)
@Patch('profile')
@ApiBearerAuth()
@ApiOperation({
  summary: 'Actualizar el perfil del usuario autenticado',
  description:
    'Permite modificar los datos personales del usuario correspondiente al token JWT enviado.',
})
@ApiOkResponse({
  description: 'Perfil actualizado exitosamente.',
})
@ApiBadRequestResponse({
  description: 'Los datos enviados no son válidos.',
})
@ApiConflictResponse({
  description: 'El correo electrónico ya está registrado.',
})
@ApiForbiddenResponse({
  description: 'La cuenta del usuario se encuentra deshabilitada.',
})
@ApiUnauthorizedResponse({
  description: 'Token JWT ausente, inválido o expirado.',
})
updateProfile(
  @CurrentUser() user: JwtPayload,
  @Body() dto: UpdateProfileDto,
) {
  return this.authService.updateProfile(user.sub, dto);
}

}
