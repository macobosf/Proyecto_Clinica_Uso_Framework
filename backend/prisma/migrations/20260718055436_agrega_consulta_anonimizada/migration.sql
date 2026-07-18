-- CreateTable
CREATE TABLE "consultas_anonimizadas" (
    "id" TEXT NOT NULL,
    "anioOriginal" INTEGER NOT NULL,
    "motivoConsulta" TEXT NOT NULL,
    "diagnostico" TEXT NOT NULL,
    "tratamiento" TEXT NOT NULL,
    "notasClinicas" TEXT NOT NULL,
    "anonimizadaEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "consultas_anonimizadas_pkey" PRIMARY KEY ("id")
);
