import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { PaymentMethodsController } from './payment-methods.controller.js';
import { PaymentMethodsService } from './payment-methods.service.js';

@Module({
  imports: [AuthModule],
  controllers: [PaymentMethodsController],
  providers: [PaymentMethodsService],
})
export class PaymentMethodsModule {}
