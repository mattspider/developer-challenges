import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { TipoMaquina } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CriarMaquinaDto } from './dto/criar-maquina.dto';
import { AtualizarMaquinaDto } from './dto/atualizar-maquina.dto';

@Injectable()
export class MaquinasService {
  constructor(private prisma: PrismaService) {}

  async listar(usuarioId: string) {
    return this.prisma.maquina.findMany({
      where: { usuarioId },
      include: { pontosMonitoramento: true },
    });
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
        tipo: dto.tipo as TipoMaquina,
        usuarioId,
      },
    });
  }

  async atualizar(id: string, usuarioId: string, dto: AtualizarMaquinaDto) {
    await this.buscarPorId(id, usuarioId);
    return this.prisma.maquina.update({
      where: { id },
      data: {
        ...(dto.nome && { nome: dto.nome }),
        ...(dto.tipo && { tipo: dto.tipo as TipoMaquina }),
      },
    });
  }

  async deletar(id: string, usuarioId: string) {
    await this.buscarPorId(id, usuarioId);
    return this.prisma.maquina.delete({ where: { id } });
  }

  async verificarPropriedade(maquinaId: string, usuarioId: string) {
    const maquina = await this.prisma.maquina.findFirst({
      where: { id: maquinaId, usuarioId },
    });
    if (!maquina) {
      throw new ForbiddenException('Acesso negado');
    }
    return maquina;
  }
}
