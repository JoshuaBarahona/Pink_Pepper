import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Rol } from '../generated/prisma/enums.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface.js';
import { AdminService } from './admin.service.js';
import { CreateAdminUserDto } from './dto/create-admin-user.dto.js';
import { UpdateAdminUserDto } from './dto/update-admin-user.dto.js';
import { UpdateUserRoleDto } from './dto/update-user-role.dto.js';
import { UpdateUserStatusDto } from './dto/update-user-status.dto.js';
import { QueryEmployeesDto, QueryUsersDto } from './dto/query-users.dto.js';

@ApiTags('Admin')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Token JWT ausente o inválido.' })
@ApiForbiddenResponse({
  description: 'Acceso exclusivo para usuarios con rol ADMIN.',
})
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Rol.ADMIN)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('employees')
  @ApiOperation({
    summary:
      'Listar empleados operativos: cocineros, repartidores y gerentes (ADMIN)',
    description:
      'Devuelve el resumen estadístico y la lista de empleados con roles COCINA, REPARTIDOR y GERENTE.',
  })
  @ApiOkResponse({
    description: 'Resumen y lista de empleados obtenida exitosamente.',
  })
  findEmployees(@Query() query: QueryEmployeesDto) {
    return this.adminService.findEmployees(query);
  }

  @Get('users')
  @ApiOperation({
    summary: 'Listar todos los usuarios registrados con filtros (ADMIN)',
  })
  @ApiOkResponse({
    description: 'Lista de usuarios (sin contraseñas) obtenida exitosamente.',
  })
  findAllUsers(@Query() query: QueryUsersDto) {
    return this.adminService.findAllUsers(query);
  }

  @Get('users/:id')
  @ApiOperation({
    summary: 'Obtener el detalle de un usuario por ID (ADMIN)',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID numérico del usuario',
  })
  @ApiOkResponse({ description: 'Información del usuario.' })
  @ApiNotFoundResponse({ description: 'Usuario no encontrado.' })
  findOneUser(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.findOneUser(id);
  }

  @Post('users')
  @ApiOperation({
    summary: 'Crear un nuevo usuario o empleado con rol específico (ADMIN)',
  })
  @ApiCreatedResponse({ description: 'Usuario creado exitosamente.' })
  @ApiBadRequestResponse({ description: 'Datos de validación inválidos.' })
  @ApiConflictResponse({ description: 'El correo electrónico ya existe.' })
  createUser(@Body() dto: CreateAdminUserDto) {
    return this.adminService.createUser(dto);
  }

  @Patch('users/:id')
  @ApiOperation({
    summary: 'Actualizar datos generales, rol o estado de un usuario (ADMIN)',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID numérico del usuario',
  })
  @ApiOkResponse({ description: 'Usuario actualizado exitosamente.' })
  @ApiBadRequestResponse({
    description:
      'Datos inválidos o intento de desactivar/quitar rol ADMIN a la propia cuenta o a un repartidor con entregas activas.',
  })
  @ApiConflictResponse({ description: 'El correo electrónico ya está en uso.' })
  @ApiNotFoundResponse({ description: 'Usuario no encontrado.' })
  updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAdminUserDto,
    @CurrentUser() admin: JwtPayload,
  ) {
    return this.adminService.updateUser(id, dto, admin.sub);
  }

  @Patch('users/:id/role')
  @ApiOperation({
    summary: 'Cambiar el rol de un usuario (ADMIN)',
    description:
      'Impide que el administrador se quite su propio rol ADMIN o cambie el rol de un repartidor con pedidos activos.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID numérico del usuario',
  })
  @ApiOkResponse({ description: 'Rol actualizado exitosamente.' })
  @ApiBadRequestResponse({
    description:
      'No puedes quitarte tu propio rol ADMIN ni cambiar el rol de un repartidor con pedidos activos.',
  })
  @ApiNotFoundResponse({ description: 'Usuario no encontrado.' })
  changeUserRole(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserRoleDto,
    @CurrentUser() admin: JwtPayload,
  ) {
    return this.adminService.changeUserRole(id, dto, admin.sub);
  }

  @Patch('users/:id/status')
  @ApiOperation({
    summary: 'Activar o desactivar el estado de un usuario (ADMIN)',
    description:
      'Cambia el campo booleano estado sin eliminar el registro de la base de datos.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID numérico del usuario',
  })
  @ApiOkResponse({ description: 'Estado del usuario actualizado.' })
  @ApiBadRequestResponse({
    description:
      'No puedes desactivar tu propia cuenta ni a un repartidor con pedidos activos.',
  })
  @ApiNotFoundResponse({ description: 'Usuario no encontrado.' })
  changeUserStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserStatusDto,
    @CurrentUser() admin: JwtPayload,
  ) {
    return this.adminService.changeUserStatus(id, dto, admin.sub);
  }

  @Patch('users/:id/restore')
  @ApiOperation({
    summary: 'Reactivar un usuario desactivado cambiando estado a true (ADMIN)',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID numérico del usuario',
  })
  @ApiOkResponse({ description: 'Usuario reactivado exitosamente.' })
  @ApiNotFoundResponse({ description: 'Usuario no encontrado.' })
  restoreUser(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() admin: JwtPayload,
  ) {
    return this.adminService.changeUserStatus(id, { estado: true }, admin.sub);
  }

  @Delete('users/:id')
  @ApiOperation({
    summary: 'Desactivar lógicamente un usuario (soft-delete: estado = false)',
    description:
      'No elimina físicamente el usuario de la base de datos; únicamente actualiza su estado a false.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID numérico del usuario a desactivar',
  })
  @ApiOkResponse({
    description: 'Usuario desactivado lógicamente (estado = false).',
  })
  @ApiBadRequestResponse({
    description:
      'No puedes desactivar tu propia cuenta ni a un repartidor con pedidos activos.',
  })
  @ApiNotFoundResponse({ description: 'Usuario no encontrado.' })
  deactivateUser(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() admin: JwtPayload,
  ) {
    return this.adminService.deactivateUser(id, admin.sub);
  }
}
