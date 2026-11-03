import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';
import { CreatePaymentMethodDto } from './dto/create-payment-method.dto.js';
import { UpdatePaymentMethodDto } from './dto/update-payment-method.dto.js';

@Injectable()
export class PaymentMethodsService {
  constructor(private readonly prisma: PrismaService) {}

  // Consultar las tarjetas de un usuario
  async findAll(userId: number) {
    return this.prisma.metodo_pago_usuario.findMany({
      where: {
        id_usuario: userId,
      },
      orderBy: [{ es_principal: 'desc' }, { fecha_registro: 'desc' }],
    });
  }

  // Registrar una tarjeta
  async create(userId: number, dto: CreatePaymentMethodDto) {
    this.validateExpiration(dto.mes_expiracion, dto.anio_expiracion);

    const totalMethods = await this.prisma.metodo_pago_usuario.count({
      where: {
        id_usuario: userId,
      },
    });

    const isDefault = dto.es_principal ?? totalMethods === 0;

    if (isDefault) {
      return this.prisma.$transaction(async (tx) => {
        await tx.metodo_pago_usuario.updateMany({
          where: {
            id_usuario: userId,
          },
          data: {
            es_principal: false,
          },
        });

        return tx.metodo_pago_usuario.create({
          data: {
            ...dto,
            tipo: 'TARJETA',
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

    return this.prisma.metodo_pago_usuario.create({
      data: {
        ...dto,
        tipo: 'TARJETA',
        es_principal: false,
        usuario: {
          connect: {
            id_usuario: userId,
          },
        },
      },
    });
  }

  // Editar una tarjeta
  async update(
    userId: number,
    paymentMethodId: number,
    dto: UpdatePaymentMethodDto,
  ) {
    const paymentMethod = await this.prisma.metodo_pago_usuario.findFirst({
      where: {
        id_metodo_pago: paymentMethodId,
        id_usuario: userId,
      },
    });

    if (!paymentMethod) {
      throw new NotFoundException(
        'No se encontró el método de pago solicitado.',
      );
    }

    this.validateExpiration(
      dto.mes_expiracion ?? paymentMethod.mes_expiracion!,
      dto.anio_expiracion ?? paymentMethod.anio_expiracion!,
    );

    return this.prisma.metodo_pago_usuario.update({
      where: {
        id_metodo_pago: paymentMethodId,
      },
      data: dto,
    });
  }

  // Eliminar una tarjeta
  async remove(userId: number, paymentMethodId: number) {
    const paymentMethod = await this.prisma.metodo_pago_usuario.findFirst({
      where: {
        id_metodo_pago: paymentMethodId,
        id_usuario: userId,
      },
    });

    if (!paymentMethod) {
      throw new NotFoundException(
        'No se encontró el método de pago solicitado.',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.metodo_pago_usuario.delete({
        where: {
          id_metodo_pago: paymentMethodId,
        },
      });

      // Si se elimina la tarjeta principal,
      // se selecciona otra como principal.
      if (paymentMethod.es_principal) {
        const nextMethod = await tx.metodo_pago_usuario.findFirst({
          where: {
            id_usuario: userId,
          },
          orderBy: {
            fecha_registro: 'asc',
          },
        });

        if (nextMethod) {
          await tx.metodo_pago_usuario.update({
            where: {
              id_metodo_pago: nextMethod.id_metodo_pago,
            },
            data: {
              es_principal: true,
            },
          });
        }
      }

      return {
        message: 'Método de pago eliminado correctamente.',
      };
    });
  }

  // Establecer una tarjeta como principal
  async setDefault(userId: number, paymentMethodId: number) {
    const paymentMethod = await this.prisma.metodo_pago_usuario.findFirst({
      where: {
        id_metodo_pago: paymentMethodId,
        id_usuario: userId,
      },
    });

    if (!paymentMethod) {
      throw new NotFoundException(
        'No se encontró el método de pago solicitado.',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.metodo_pago_usuario.updateMany({
        where: {
          id_usuario: userId,
        },
        data: {
          es_principal: false,
        },
      });

      return tx.metodo_pago_usuario.update({
        where: {
          id_metodo_pago: paymentMethodId,
        },
        data: {
          es_principal: true,
        },
      });
    });
  }

  // Validar que la tarjeta no esté vencida
  private validateExpiration(month: number, year: number) {
    if (month < 1 || month > 12) {
      throw new BadRequestException(
        'El mes de vencimiento debe estar entre 1 y 12.',
      );
    }

    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    if (year < currentYear || (year === currentYear && month < currentMonth)) {
      throw new BadRequestException('La tarjeta se encuentra vencida.');
    }
  }
}
