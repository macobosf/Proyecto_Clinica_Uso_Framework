-- CreateEnum
CREATE TYPE "PropositoEnlace" AS ENUM ('CONSENTIMIENTO', 'ARCO');

-- CreateTable
CREATE TABLE "enlaces_acceso" (
    "id" TEXT NOT NULL,
    "pacienteId" TEXT NOT NULL,
    "proposito" "PropositoEnlace" NOT NULL,
    "expiraEn" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "enlaces_acceso_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "enlaces_acceso" ADD CONSTRAINT "enlaces_acceso_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "pacientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
