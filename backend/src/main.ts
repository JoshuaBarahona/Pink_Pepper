import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module.js';

import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'node:path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  console.log('Directorio actual:', process.cwd());
  console.log('Carpeta de imágenes:', join(process.cwd(), 'uploads'));

  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads/',
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Pink Pepper API')
    .setDescription(
      'Documentación interactiva del backend de Pink Pepper: autenticación JWT, productos, pedidos, tablero de cocina, repartidores, dashboard gerencial y panel de administración.',
    )
    .setVersion('1.0.0')
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      description:
        'Pega aquí el access_token JWT obtenido en /auth/login o /auth/register.',
    })
    .addTag('Health', 'Estado general del servicio')
    .addTag('Auth', 'Registro de clientes, inicio de sesión y perfil JWT')
    .addTag('Products', 'Catálogo público y gestión del menú (GERENTE y ADMIN)')
    .addTag('Orders', 'Creación de pedidos, historial y flujo de cocina')
    .addTag('Addresses', 'Gestión de direcciones de entrega del usuario')
    .addTag(
      'Payment Methods',
      'Gestión de métodos de pago con tarjeta del usuario',
    )
    .addTag(
      'Courier',
      'Entregas asignadas, ubicación y cambio de estado (REPARTIDOR)',
    )
    .addTag('Dashboard', 'Métricas semanales exclusivas para el GERENTE')
    .addTag('Admin', 'Gestión de usuarios, roles, estados y empleados (ADMIN)')
    .build();

  const documentFactory = () =>
    SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, documentFactory, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
