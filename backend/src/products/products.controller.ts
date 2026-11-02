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
import { Public } from '../auth/decorators/public.decorator.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { ProductsService } from './products.service.js';
import { CreateProductDto } from './dto/create-product.dto.js';
import { UpdateProductDto } from './dto/update-product.dto.js';
import { QueryProductsDto } from './dto/query-products.dto.js';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Rol.GERENTE, Rol.ADMIN)
  @Post()
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Crear un nuevo producto en el menú',
    description:
      'Disponible únicamente para GERENTE y ADMIN. Registra un platillo asociándolo a una categoría (HAMBURGUESAS, POLLO o BEBIDAS).',
  })
  @ApiCreatedResponse({ description: 'Producto creado exitosamente.' })
  @ApiConflictResponse({
    description: 'Ya existe un producto registrado con ese nombre.',
  })
  @ApiBadRequestResponse({ description: 'Datos inválidos en la solicitud.' })
  @ApiUnauthorizedResponse({ description: 'Token JWT ausente o inválido.' })
  @ApiForbiddenResponse({
    description: 'Se requiere rol GERENTE o ADMIN.',
  })
  create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  @Public()
  @Get()
  @ApiOperation({
    summary: 'Listar productos disponibles del menú',
    description:
      'Endpoint público que lista por defecto los productos activos (estado: true), con filtros opcionales por categoría.',
  })
  @ApiOkResponse({ description: 'Lista de productos obtenida exitosamente.' })
  findAll(@Query() query: QueryProductsDto) {
    return this.productsService.findAll(query);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Rol.GERENTE, Rol.ADMIN)
  @Get('all')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Listar todos los productos (activos e inactivos) para gestión',
    description:
      'Exclusivo para GERENTE y ADMIN. Incluye productos agotados/desactivados para administrarlos desde el panel.',
  })
  @ApiOkResponse({
    description: 'Lista completa de productos para gestión.',
  })
  @ApiUnauthorizedResponse({ description: 'Token JWT ausente o inválido.' })
  @ApiForbiddenResponse({ description: 'Se requiere rol GERENTE o ADMIN.' })
  findAllForManagement(@Query() query: QueryProductsDto) {
    return this.productsService.findAllForManagement(query);
  }

  @Public()
  @Get(':id')
  @ApiOperation({
    summary: 'Obtener el detalle de un producto por ID',
    description: 'Endpoint público que devuelve la información de un producto.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Identificador numérico del producto (id_producto)',
  })
  @ApiOkResponse({ description: 'Detalle del producto encontrado.' })
  @ApiNotFoundResponse({ description: 'Producto no encontrado.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Rol.GERENTE, Rol.ADMIN)
  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Actualizar parcialmente un producto',
    description:
      'Permite a GERENTE y ADMIN editar nombre, descripción, imagen, precio, categoría o disponibilidad de un producto.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Identificador numérico del producto (id_producto)',
  })
  @ApiOkResponse({ description: 'Producto actualizado correctamente.' })
  @ApiNotFoundResponse({ description: 'Producto no encontrado.' })
  @ApiConflictResponse({
    description: 'Ya existe otro producto con ese nombre.',
  })
  @ApiForbiddenResponse({ description: 'Se requiere rol GERENTE o ADMIN.' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateProductDto) {
    return this.productsService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Rol.GERENTE, Rol.ADMIN)
  @Patch(':id/restore')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Reactivar un producto desactivado',
    description:
      'Cambia nuevamente el estado del producto a true (GERENTE y ADMIN).',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Identificador numérico del producto (id_producto)',
  })
  @ApiOkResponse({ description: 'Producto reactivado exitosamente.' })
  @ApiNotFoundResponse({ description: 'Producto no encontrado.' })
  @ApiForbiddenResponse({ description: 'Se requiere rol GERENTE o ADMIN.' })
  restore(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.restore(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Rol.GERENTE, Rol.ADMIN)
  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Desactivar un producto (eliminación lógica)',
    description:
      'Cambia el campo estado a false en la base de datos sin eliminar el registro físico (GERENTE y ADMIN).',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Identificador numérico del producto (id_producto)',
  })
  @ApiOkResponse({
    description: 'Producto desactivado correctamente (estado: false).',
  })
  @ApiNotFoundResponse({ description: 'Producto no encontrado.' })
  @ApiForbiddenResponse({ description: 'Se requiere rol GERENTE o ADMIN.' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.remove(id);
  }
}
