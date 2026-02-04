import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ModeloSensor } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { MaquinasService } from '../maquinas/maquinas.service';
import { CriarPontoDto } from './dto/criar-ponto.dto';
import { CriarSensorDto } from './dto/criar-sensor.dto';

const modeloParaPrisma: Record<string, ModeloSensor> = {
  TcAg: 'TcAg',
  TcAs: 'TcAs',
  'HF+': 'HFPlus',
};

@Injectable()
export class PontosMonitoramentoService {
  constructor(
    private prisma: PrismaService,
    private maquinasService: MaquinasService
  ) {}

  async listar(
    usuarioId: string,
    pagina: number = 1,
    limite: number = 5,
    ordenarPor?: string,
    direcao: 'asc' | 'desc' = 'asc'
  ) {
    const skip = (pagina - 1) * limite;
    const where = { maquina: { usuarioId } };
    let orderBy: object = { nome: direcao };
    if (ordenarPor === 'machineName') {
      orderBy = { maquina: { nome: direcao } };
    } else if (ordenarPor === 'machineType') {
      orderBy = { maquina: { tipo: direcao } };
    } else if (ordenarPor === 'monitoringPointName') {
      orderBy = { nome: direcao };
    } else if (ordenarPor === 'sensorModel') {
      orderBy = { nome: direcao };
    }

    const [itens, total] = await Promise.all([
      this.prisma.pontoMonitoramento.findMany({
        where,
        skip,
        take: limite,
        include: {
          maquina: true,
          sensores: { take: 1 },
        },
        orderBy,
      }),
      this.prisma.pontoMonitoramento.count({ where }),
    ]);

    const itensFormatados = itens.map((p) => ({
      id: p.id,
      nomePonto: p.nome,
      nomeMaquina: p.maquina.nome,
      tipoMaquina: p.maquina.tipo,
      modeloSensor: p.sensores[0] ? this.prismaParaModelo(p.sensores[0].modelo) : null,
    }));

    return {
      itens: itensFormatados,
      total,
      pagina,
      totalPaginas: Math.ceil(total / limite),
    };
  }

  async criar(maquinaId: string, usuarioId: string, dto: CriarPontoDto) {
    await this.maquinasService.verificarPropriedade(maquinaId, usuarioId);
    return this.prisma.pontoMonitoramento.create({
      data: {
        nome: dto.nome,
        maquinaId,
      },
    });
  }

  private prismaParaModelo(modelo: ModeloSensor): string {
    if (modelo === 'HFPlus') return 'HF+';
    return modelo;
  }

  async associarSensor(pontoId: string, usuarioId: string, dto: CriarSensorDto) {
    const ponto = await this.prisma.pontoMonitoramento.findFirst({
      where: { id: pontoId },
      include: { maquina: true },
    });
    if (!ponto) {
      throw new NotFoundException('Ponto de monitoramento nao encontrado');
    }
    await this.maquinasService.verificarPropriedade(ponto.maquinaId, usuarioId);
    if (ponto.maquina.tipo === 'Pump' && (dto.modelo === 'TcAg' || dto.modelo === 'TcAs')) {
      throw new BadRequestException('Maquinas do tipo Pump nao podem ter sensores TcAg ou TcAs');
    }
    const sensorExistente = await this.prisma.sensor.findUnique({
      where: { identificadorUnico: dto.identificadorUnico },
    });
    if (sensorExistente) {
      throw new BadRequestException('Identificador unico ja existe no sistema');
    }
    const modeloPrisma = modeloParaPrisma[dto.modelo] || (dto.modelo as ModeloSensor);
    return this.prisma.sensor.create({
      data: {
        identificadorUnico: dto.identificadorUnico,
        modelo: modeloPrisma,
        pontoMonitoramentoId: pontoId,
      },
    });
  }
}
