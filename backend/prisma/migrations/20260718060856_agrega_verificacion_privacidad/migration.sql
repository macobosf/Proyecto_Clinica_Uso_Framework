-- CreateTable
CREATE TABLE "verificaciones_privacidad" (
    "id" TEXT NOT NULL,
    "fechaHora" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resultadoGlobal" TEXT NOT NULL,
    "detalle" JSONB NOT NULL,
    "usuarioId" TEXT,

    CONSTRAINT "verificaciones_privacidad_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "verificaciones_privacidad" ADD CONSTRAINT "verificaciones_privacidad_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;
