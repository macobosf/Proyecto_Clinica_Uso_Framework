-- CreateTable
CREATE TABLE "eventos_seguridad" (
    "id" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "fechaHora" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ip" TEXT,
    "usuarioId" TEXT,

    CONSTRAINT "eventos_seguridad_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "eventos_seguridad" ADD CONSTRAINT "eventos_seguridad_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;
