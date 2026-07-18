-- CreateTable
CREATE TABLE "consentimientos" (
    "id" TEXT NOT NULL,
    "pacienteId" TEXT NOT NULL,
    "finalidad" TEXT NOT NULL,
    "aceptado" BOOLEAN NOT NULL,
    "fechaHora" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "version" TEXT NOT NULL,

    CONSTRAINT "consentimientos_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "consentimientos" ADD CONSTRAINT "consentimientos_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "pacientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
