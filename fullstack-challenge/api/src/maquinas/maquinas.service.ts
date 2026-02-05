import { Injectable, NotFoundException } from '@nestjs/common';
import { TipoMaquina } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CriarMaquinaDto } from './dto/criar-maquina.dto';
import { AtualizarMaquinaDto } from './dto/atualizar-maquina.dto';

@Injectable()
export class MaquinasService {
  constructor(private prisma: PrismaService) {}

  async listar(
    usuarioId: string,
    pagina: number = 1,
    limite: number = 10
  ) {
    const skip = (pagina - 1) * limite;
    const where = { usuarioId };
    const [itens, total] = await Promise.all([
      this.prisma.maquina.findMany({
        where,
        skip,
        take: limite,
        include: { pontosMonitoramento: true },
      }),
      this.prisma.maquina.count({ where }),
    ]);
    return {
      itens,
      total,
      pagina,
      totalPaginas: Math.ceil(total / limite),
    };
  }

  async buscarPorId(id: string, usuarioId: string) {
    const maquina = await this.prisma.maquina.findFirst({
      where: { id, usuarioId },
      include: { pontosMonitoramento: { include: { sensores: true } } },
    });
    if (!maquina) {
      throw new NotFoundException('Maquina nao encontrada');
    }
    return maquina;
  }

  async criar(usuarioId: string, dto: CriarMaquinaDto) {
    return this.prisma.maquina.create({
      data: {
        nome: dto.nome,
        tipo: dto.tipo,
        usuarioId,
      },
    });
  }

  async atualizar(id: string, usuarioId: string, dto: AtualizarMaquinaDto) {
    try {
      const atualizado = await this.prisma.maquina.update({
        where: { id, usuarioId },
        data: {
          ...(dto.nome && { nome: dto.nome }),
          ...(dto.tipo && { tipo: dto.tipo }),
        },
      });
      return atualizado;
    } catch {
      throw new NotFoundException('Maquina nao encontrada');
    }
  }

  async deletar(id: string, usuarioId: string) {
    try {
      return await this.prisma.maquina.delete({
        where: { id, usuarioId },
      });
    } catch {
      throw new NotFoundException('Maquina nao encontrada');
    }
  }

  async verificarPropriedade(maquinaId: string, usuarioId: string) {
    const count = await this.prisma.maquina.count({
      where: { id: maquinaId, usuarioId },
    });
    if (count === 0) {
      throw new NotFoundException('Maquina nao encontrada');
    }
  }
}
