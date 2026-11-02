import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { Categoria } from '../generated/prisma/enums.js';
import type {
  Prisma,
  categoria,
  producto,
} from '../generated/prisma/client.js';
import { CreateProductDto } from './dto/create-product.dto.js';
import { UpdateProductDto } from './dto/update-product.dto.js';
import { QueryProductsDto } from './dto/query-products.dto.js';

type ProductoConCategoria = producto & {
  categoria: categoria;
};

export interface ProductResponse {
  id_producto: number;
  id_categoria: number;
  categoria: Categoria;
  nombre: string;
  descripcion: string;
  imagen_url: string;
  precio: number;
  estado: boolean;
  fecha_registro: Date;
}

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateProductDto): Promise<ProductResponse> {
    const existingProduct = await this.prisma.producto.findFirst({
      where: {
        nombre: {
          equals: dto.nombre,
          mode: 'insensitive',
        },
      },
    });

    if (existingProduct) {
      throw new ConflictException(
        'Ya existe un producto registrado con ese nombre.',
      );
    }

    const idCategoria = await this.resolveCategoryId(
      dto.id_categoria,
      dto.categoria,
    );

    const nuevoProducto = await this.prisma.producto.create({
      data: {
        id_categoria: idCategoria,
        nombre: dto.nombre,
        descripcion: dto.descripcion ?? '',
        imagen_url: dto.imagen_url ?? '',
        precio: dto.precio,
        estado: dto.estado ?? true,
        fecha_registro: new Date(),
      },
      include: {
        categoria: true,
      },
    });

    return this.formatProduct(nuevoProducto);
  }

  async findAll(query: QueryProductsDto = {}): Promise<ProductResponse[]> {
    const where: Prisma.productoWhereInput = {};

    if (query.estado !== undefined) {
      where.estado = query.estado;
    } else if (!query.includeInactive) {
      where.estado = true;
    }

    if (query.id_categoria !== undefined) {
      where.id_categoria = query.id_categoria;
    }

    if (query.categoria !== undefined) {
      where.categoria = {
        nombre_categoria: query.categoria,
      };
    }

    const productos = await this.prisma.producto.findMany({
      where,
      include: {
        categoria: true,
      },
      orderBy: {
        id_producto: 'asc',
      },
    });

    return productos.map((item) => this.formatProduct(item));
  }

  async findAllForManagement(
    query: QueryProductsDto = {},
  ): Promise<ProductResponse[]> {
    return this.findAll({
      ...query,
      includeInactive: query.includeInactive ?? true,
    });
  }

  async findOne(id: number): Promise<ProductResponse> {
    const producto = await this.prisma.producto.findUnique({
      where: { id_producto: id },
      include: { categoria: true },
    });

    if (!producto) {
      throw new NotFoundException(`Producto con ID ${id} no encontrado.`);
    }

    return this.formatProduct(producto);
  }

  async update(id: number, dto: UpdateProductDto): Promise<ProductResponse> {
    const currentProduct = await this.prisma.producto.findUnique({
      where: { id_producto: id },
    });

    if (!currentProduct) {
      throw new NotFoundException(`Producto con ID ${id} no encontrado.`);
    }

    if (dto.nombre !== undefined) {
      const duplicate = await this.prisma.producto.findFirst({
        where: {
          id_producto: { not: id },
          nombre: {
            equals: dto.nombre,
            mode: 'insensitive',
          },
        },
      });

      if (duplicate) {
        throw new ConflictException(
          'Ya existe otro producto registrado con ese nombre.',
        );
      }
    }

    const data: Prisma.productoUncheckedUpdateInput = {};

    if (dto.id_categoria !== undefined || dto.categoria !== undefined) {
      data.id_categoria = await this.resolveCategoryId(
        dto.id_categoria,
        dto.categoria,
      );
    }

    if (dto.nombre !== undefined) {
      data.nombre = dto.nombre;
    }

    if (dto.descripcion !== undefined) {
      data.descripcion = dto.descripcion;
    }

    if (dto.imagen_url !== undefined) {
      data.imagen_url = dto.imagen_url;
    }

    if (dto.precio !== undefined) {
      data.precio = dto.precio;
    }

    if (dto.estado !== undefined) {
      data.estado = dto.estado;
    }

    const actualizado = await this.prisma.producto.update({
      where: { id_producto: id },
      data,
      include: {
        categoria: true,
      },
    });

    return this.formatProduct(actualizado);
  }

  /**
   * Eliminación lógica (soft delete): desactiva el producto cambiando `estado` a `false`
   * sin borrar el registro físico de la base de datos.
   */
  async remove(id: number): Promise<ProductResponse> {
    const currentProduct = await this.prisma.producto.findUnique({
      where: { id_producto: id },
    });

    if (!currentProduct) {
      throw new NotFoundException(`Producto con ID ${id} no encontrado.`);
    }

    const desactivado = await this.prisma.producto.update({
      where: { id_producto: id },
      data: { estado: false },
      include: {
        categoria: true,
      },
    });

    return this.formatProduct(desactivado);
  }

  async restore(id: number): Promise<ProductResponse> {
    const currentProduct = await this.prisma.producto.findUnique({
      where: { id_producto: id },
    });

    if (!currentProduct) {
      throw new NotFoundException(`Producto con ID ${id} no encontrado.`);
    }

    const reactivado = await this.prisma.producto.update({
      where: { id_producto: id },
      data: { estado: true },
      include: {
        categoria: true,
      },
    });

    return this.formatProduct(reactivado);
  }

  private async resolveCategoryId(
    idCategoria?: number,
    nombreCategoria?: Categoria,
  ): Promise<number> {
    if (idCategoria !== undefined) {
      const categoriaExistente = await this.prisma.categoria.findUnique({
        where: { id_categoria: idCategoria },
      });

      if (!categoriaExistente) {
        throw new NotFoundException(
          `La categoría con ID ${idCategoria} no existe.`,
        );
      }

      if (
        nombreCategoria !== undefined &&
        categoriaExistente.nombre_categoria !== nombreCategoria
      ) {
        throw new BadRequestException(
          'El id_categoria proporcionado no coincide con el nombre de categoría enviado.',
        );
      }

      return categoriaExistente.id_categoria;
    }

    if (nombreCategoria !== undefined) {
      let categoriaRow = await this.prisma.categoria.findFirst({
        where: { nombre_categoria: nombreCategoria },
      });

      if (!categoriaRow) {
        categoriaRow = await this.prisma.categoria.create({
          data: { nombre_categoria: nombreCategoria },
        });
      }

      return categoriaRow.id_categoria;
    }

    throw new BadRequestException(
      'Debes proporcionar categoria o id_categoria para el producto.',
    );
  }

  private formatProduct(producto: ProductoConCategoria): ProductResponse {
    return {
      id_producto: producto.id_producto,
      id_categoria: producto.id_categoria,
      categoria: producto.categoria.nombre_categoria,
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      imagen_url: producto.imagen_url,
      precio: Number(producto.precio),
      estado: producto.estado,
      fecha_registro: producto.fecha_registro,
    };
  }
}
