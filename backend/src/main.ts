import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();
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
