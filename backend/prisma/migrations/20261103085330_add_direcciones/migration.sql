-- CreateTable
CREATE TABLE "direccion_usuario" (
    "id_direccion" SERIAL NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "nombre_direccion" VARCHAR(30) NOT NULL,
    "direccion" VARCHAR(255) NOT NULL,
    "referencia" VARCHAR(255),
    "es_principal" BOOLEAN NOT NULL DEFAULT false,
    "fecha_registro" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "direccion_usuario_pkey" PRIMARY KEY ("id_direccion")
);

-- AddForeignKey
ALTER TABLE "direccion_usuario" ADD CONSTRAINT "direccion_usuario_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "Usuario"("id_usuario") ON DELETE CASCADE ON UPDATE CASCADE;
