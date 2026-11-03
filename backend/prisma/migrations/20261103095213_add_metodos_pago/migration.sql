-- CreateTable
CREATE TABLE "metodo_pago_usuario" (
    "id_metodo_pago" SERIAL NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "tipo" VARCHAR(20) NOT NULL,
    "titular" VARCHAR(100),
    "marca" VARCHAR(30),
    "ultimos_digitos" VARCHAR(4),
    "mes_expiracion" INTEGER,
    "anio_expiracion" INTEGER,
    "es_principal" BOOLEAN NOT NULL DEFAULT false,
    "fecha_registro" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "metodo_pago_usuario_pkey" PRIMARY KEY ("id_metodo_pago")
);

-- AddForeignKey
ALTER TABLE "metodo_pago_usuario" ADD CONSTRAINT "metodo_pago_usuario_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "Usuario"("id_usuario") ON DELETE CASCADE ON UPDATE CASCADE;
