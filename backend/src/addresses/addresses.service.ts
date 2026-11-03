import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';
import { CreateAddressDto } from './dto/create-address.dto.js';
import { UpdateAddressDto } from './dto/update-address.dto.js';

@Injectable()
export class AddressesService {
  constructor(private readonly prisma: PrismaService) {}

  // Consultar las direcciones de un usuario
  async findAll(userId: number) {
    return this.prisma.direccion_usuario.findMany({
      where: {
        id_usuario: userId,
      },
      orderBy: [
        { es_principal: 'desc' },
        { fecha_registro: 'desc' },
      ],
    });
  }

  // Registrar una dirección
  async create(userId: number, dto: CreateAddressDto) {
    const totalAddresses = await this.prisma.direccion_usuario.count({
      where: {
        id_usuario: userId,
      },
    });

    const isDefault = dto.es_principal ?? totalAddresses === 0;

    if (isDefault) {
      return this.prisma.$transaction(async (tx) => {
        await tx.direccion_usuario.updateMany({
          where: {
            id_usuario: userId,
          },
          data: {
            es_principal: false,
          },
        });

        return tx.direccion_usuario.create({
          data: {
            ...dto,
            es_principal: true,
            usuario: {
              connect: {
                id_usuario: userId,
              },
            },
          },
        });
      });
    }

    return this.prisma.direccion_usuario.create({
      data: {
        ...dto,
        es_principal: false,
        usuario: {
          connect: {
            id_usuario: userId,
          },
        },
      },
    });
  }

  // Editar una dirección
  async update(
    userId: number,
    addressId: number,
    dto: UpdateAddressDto,
  ) {
    const address = await this.prisma.direccion_usuario.findFirst({
      where: {
        id_direccion: addressId,
        id_usuario: userId,
      },
    });

    if (!address) {
      throw new NotFoundException(
        'No se encontró la dirección solicitada.',
      );
    }

    if (dto.es_principal === true) {
      return this.prisma.$transaction(async (tx) => {
        await tx.direccion_usuario.updateMany({
          where: {
            id_usuario: userId,
          },
          data: {
            es_principal: false,
          },
        });

        return tx.direccion_usuario.update({
          where: {
            id_direccion: addressId,
          },
          data: dto,
        });
      });
    }

    return this.prisma.direccion_usuario.update({
      where: {
        id_direccion: addressId,
      },
      data: dto,
    });
  }

  // Eliminar una dirección
  async remove(userId: number, addressId: number) {
    const address = await this.prisma.direccion_usuario.findFirst({
      where: {
        id_direccion: addressId,
        id_usuario: userId,
      },
    });

    if (!address) {
      throw new NotFoundException(
        'No se encontró la dirección solicitada.',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.direccion_usuario.delete({
        where: {
          id_direccion: addressId,
        },
      });

      // Si se elimina la dirección principal,
      // se selecciona otra como principal.
      if (address.es_principal) {
        const nextAddress = await tx.direccion_usuario.findFirst({
          where: {
            id_usuario: userId,
          },
          orderBy: {
            fecha_registro: 'asc',
          },
        });

        if (nextAddress) {
          await tx.direccion_usuario.update({
            where: {
              id_direccion: nextAddress.id_direccion,
            },
            data: {
              es_principal: true,
            },
          });
        }
      }

      return {
        message: 'Dirección eliminada correctamente.',
      };
    });
  }

  // Establecer una dirección como principal
  async setDefault(userId: number, addressId: number) {
    const address = await this.prisma.direccion_usuario.findFirst({
      where: {
        id_direccion: addressId,
        id_usuario: userId,
      },
    });

    if (!address) {
      throw new NotFoundException(
        'No se encontró la dirección solicitada.',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.direccion_usuario.updateMany({
        where: {
          id_usuario: userId,
        },
        data: {
          es_principal: false,
        },
      });

      return tx.direccion_usuario.update({
        where: {
          id_direccion: addressId,
        },
        data: {
          es_principal: true,
        },
      });
    });
  }
}