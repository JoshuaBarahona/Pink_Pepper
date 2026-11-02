-- CreateEnum
CREATE TYPE "Rol" AS ENUM ('GERENTE', 'ADMIN', 'CLIENTE', 'REPARTIDOR', 'COCINA');

-- CreateEnum
CREATE TYPE "Categoria" AS ENUM ('HAMBURGUESAS', 'POLLO', 'BEBIDAS');

-- CreateEnum
CREATE TYPE "EstadoPedido" AS ENUM ('RECIBIDO', 'EN_PREPARACION', 'LISTO_PARA_REPARTIDOR', 'EN_CAMINO', 'ENTREGADO');

-- CreateTable
CREATE TABLE "Pedido" (
    "id_pedido" SERIAL NOT NULL,
    "id_cliente" INTEGER NOT NULL,
    "id_repartidor" INTEGER NOT NULL,
    "fecha_creacion" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_entrega" TIMESTAMPTZ(6) NOT NULL,
    "direccion" TEXT NOT NULL,
    "referencia" TEXT NOT NULL,
    "notas_cliente" TEXT NOT NULL,
    "metodo_pago" VARCHAR NOT NULL,
    "comprobante" VARCHAR NOT NULL,
    "costo_envio" MONEY NOT NULL,
    "total" MONEY NOT NULL,
    "estado_pedido" "EstadoPedido" NOT NULL DEFAULT 'RECIBIDO',
    "motivo_cancelacion" TEXT NOT NULL,

    CONSTRAINT "Pedido_pkey" PRIMARY KEY ("id_pedido")
);

-- CreateTable
CREATE TABLE "Usuario" (
    "id_usuario" SERIAL NOT NULL,
    "id_rol" INTEGER NOT NULL,
    "primer_nombre" VARCHAR(20) NOT NULL,
    "segundo_nombre" VARCHAR(20) NOT NULL,
    "primer_apellido" VARCHAR(20) NOT NULL,
    "segundo_apellido" VARCHAR(20) NOT NULL,
    "correo" VARCHAR(50) NOT NULL,
    "password" VARCHAR(150) NOT NULL,
    "telefono" VARCHAR(20) NOT NULL,
    "estado" BOOLEAN NOT NULL,
    "fecha_registro" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id_usuario")
);

-- CreateTable
CREATE TABLE "categoria" (
    "id_categoria" SERIAL NOT NULL,
    "nombre_categoria" "Categoria" NOT NULL,

    CONSTRAINT "categoria_pkey" PRIMARY KEY ("id_categoria")
);

-- CreateTable
CREATE TABLE "detalle_pedido" (
    "id_detalle" SERIAL NOT NULL,
    "id_pedido" INTEGER NOT NULL,
    "id_producto" INTEGER NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "precio_unitario" MONEY NOT NULL,
    "subtotal" MONEY NOT NULL,

    CONSTRAINT "detalle_pedido_pkey" PRIMARY KEY ("id_detalle")
);

-- CreateTable
CREATE TABLE "producto" (
    "id_producto" SERIAL NOT NULL,
    "id_categoria" INTEGER NOT NULL,
    "nombre" VARCHAR(50) NOT NULL,
    "descripcion" VARCHAR(50) NOT NULL,
    "imagen_url" VARCHAR(255) NOT NULL,
    "precio" MONEY NOT NULL,
    "estado" BOOLEAN NOT NULL,
    "fecha_registro" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "producto_pkey" PRIMARY KEY ("id_producto")
);

-- CreateTable
CREATE TABLE "rol " (
    "id_rol" SERIAL NOT NULL,
    "nombre_rol" "Rol" NOT NULL,

    CONSTRAINT "rol _pkey" PRIMARY KEY ("id_rol")
);

-- AddForeignKey
ALTER TABLE "Pedido" ADD CONSTRAINT "fk_pedido_cliente" FOREIGN KEY ("id_cliente") REFERENCES "Usuario"("id_usuario") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Pedido" ADD CONSTRAINT "fk_pedido_repartidor" FOREIGN KEY ("id_repartidor") REFERENCES "Usuario"("id_usuario") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Usuario" ADD CONSTRAINT "fk_user_rol" FOREIGN KEY ("id_rol") REFERENCES "rol "("id_rol") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "detalle_pedido" ADD CONSTRAINT "fk_user_pedido" FOREIGN KEY ("id_pedido") REFERENCES "Pedido"("id_pedido") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "detalle_pedido" ADD CONSTRAINT "fk_user_producto" FOREIGN KEY ("id_producto") REFERENCES "producto"("id_producto") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "producto" ADD CONSTRAINT "fk_categoria" FOREIGN KEY ("id_categoria") REFERENCES "categoria"("id_categoria") ON DELETE NO ACTION ON UPDATE NO ACTION;
