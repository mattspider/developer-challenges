-- CreateEnum
CREATE TYPE "TipoMaquina" AS ENUM ('Pump', 'Fan');

-- CreateEnum
CREATE TYPE "ModeloSensor" AS ENUM ('TcAg', 'TcAs', 'HFPlus');

-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Maquina" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "tipo" "TipoMaquina" NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Maquina_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PontoMonitoramento" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "maquinaId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PontoMonitoramento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sensor" (
    "id" TEXT NOT NULL,
    "identificadorUnico" TEXT NOT NULL,
    "modelo" "ModeloSensor" NOT NULL,
    "pontoMonitoramentoId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Sensor_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Sensor_identificadorUnico_key" ON "Sensor"("identificadorUnico");

-- AddForeignKey
ALTER TABLE "Maquina" ADD CONSTRAINT "Maquina_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PontoMonitoramento" ADD CONSTRAINT "PontoMonitoramento_maquinaId_fkey" FOREIGN KEY ("maquinaId") REFERENCES "Maquina"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sensor" ADD CONSTRAINT "Sensor_pontoMonitoramentoId_fkey" FOREIGN KEY ("pontoMonitoramentoId") REFERENCES "PontoMonitoramento"("id") ON DELETE CASCADE ON UPDATE CASCADE;
