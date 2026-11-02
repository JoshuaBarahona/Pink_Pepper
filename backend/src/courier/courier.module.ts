import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { CourierController } from './courier.controller.js';
import { CourierService } from './courier.service.js';

@Module({
  imports: [AuthModule],
  controllers: [CourierController],
  providers: [CourierService],
  exports: [CourierService],
})
export class CourierModule {}
