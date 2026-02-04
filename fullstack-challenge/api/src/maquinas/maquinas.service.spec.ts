import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { MaquinasService } from './maquinas.service';

describe('MaquinasService', () => {
  let service: MaquinasService;
  let prisma: PrismaService;

  const mockPrisma = {
    maquina: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MaquinasService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<MaquinasService>(MaquinasService);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  describe('listar', () => {
    it('retorna lista filtrada por usuarioId', async () => {
      const lista = [
        {
          id: 'maq-1',
          nome: 'Maquina 1',
          tipo: 'Pump',
          usuarioId: 'user-1',
          pontosMonitoramento: [],
        },
      ];
      mockPrisma.maquina.findMany.mockResolvedValue(lista);

      const resultado = await service.listar('user-1');

      expect(resultado).toEqual(lista);
      expect(mockPrisma.maquina.findMany).toHaveBeenCalledWith({
        where: { usuarioId: 'user-1' },
        include: { pontosMonitoramento: true },
      });
    });
  });

  describe('buscarPorId', () => {
    it('retorna maquina quando encontrada', async () => {
      const maquina = {
        id: 'maq-1',
        nome: 'Maquina 1',
        tipo: 'Pump',
        usuarioId: 'user-1',
        pontosMonitoramento: [{ id: 'p1', sensores: [] }],
      };
      mockPrisma.maquina.findFirst.mockResolvedValue(maquina);

      const resultado = await service.buscarPorId('maq-1', 'user-1');

      expect(resultado).toEqual(maquina);
      expect(mockPrisma.maquina.findFirst).toHaveBeenCalledWith({
        where: { id: 'maq-1', usuarioId: 'user-1' },
        include: { pontosMonitoramento: { include: { sensores: true } } },
      });
    });

    it('lanca NotFoundException quando nao encontrada', async () => {
      mockPrisma.maquina.findFirst.mockResolvedValue(null);

      await expect(
        service.buscarPorId('maq-inexistente', 'user-1')
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('criar', () => {
    it('chama prisma.maquina.create com dados corretos', async () => {
      const maquinaCriada = {
        id: 'maq-nova',
        nome: 'Nova Maquina',
        tipo: 'Fan',
        usuarioId: 'user-1',
      };
      mockPrisma.maquina.create.mockResolvedValue(maquinaCriada);

      const resultado = await service.criar('user-1', {
        nome: 'Nova Maquina',
        tipo: 'Fan',
      });

      expect(resultado).toEqual(maquinaCriada);
      expect(mockPrisma.maquina.create).toHaveBeenCalledWith({
        data: {
          nome: 'Nova Maquina',
          tipo: 'Fan',
          usuarioId: 'user-1',
        },
      });
    });
  });

  describe('atualizar', () => {
    it('chama buscarPorId e prisma.maquina.update', async () => {
      const maquinaExistente = {
        id: 'maq-1',
        nome: 'Maquina 1',
        tipo: 'Pump',
        usuarioId: 'user-1',
        pontosMonitoramento: [],
      };
      const maquinaAtualizada = {
        ...maquinaExistente,
        nome: 'Maquina Atualizada',
        tipo: 'Fan',
      };
      mockPrisma.maquina.findFirst.mockResolvedValue(maquinaExistente);
      mockPrisma.maquina.update.mockResolvedValue(maquinaAtualizada);

      const resultado = await service.atualizar('maq-1', 'user-1', {
        nome: 'Maquina Atualizada',
        tipo: 'Fan',
      });

      expect(resultado).toEqual(maquinaAtualizada);
      expect(mockPrisma.maquina.update).toHaveBeenCalledWith({
        where: { id: 'maq-1' },
        data: { nome: 'Maquina Atualizada', tipo: 'Fan' },
      });
    });
  });

  describe('deletar', () => {
    it('chama buscarPorId e prisma.maquina.delete', async () => {
      const maquinaExistente = {
        id: 'maq-1',
        nome: 'Maquina 1',
        tipo: 'Pump',
        usuarioId: 'user-1',
        pontosMonitoramento: [],
      };
      mockPrisma.maquina.findFirst.mockResolvedValue(maquinaExistente);
      mockPrisma.maquina.delete.mockResolvedValue(maquinaExistente);

      await service.deletar('maq-1', 'user-1');

      expect(mockPrisma.maquina.delete).toHaveBeenCalledWith({
        where: { id: 'maq-1' },
      });
    });
  });

  describe('verificarPropriedade', () => {
    it('retorna maquina quando existe e pertence ao usuario', async () => {
      const maquina = {
        id: 'maq-1',
        nome: 'Maquina 1',
        tipo: 'Pump',
        usuarioId: 'user-1',
      };
      mockPrisma.maquina.findFirst.mockResolvedValue(maquina);

      const resultado = await service.verificarPropriedade('maq-1', 'user-1');

      expect(resultado).toEqual(maquina);
    });

    it('lanca ForbiddenException quando maquina nao existe', async () => {
      mockPrisma.maquina.findFirst.mockResolvedValue(null);

      await expect(
        service.verificarPropriedade('maq-inexistente', 'user-1')
      ).rejects.toThrow(ForbiddenException);
      await expect(
        service.verificarPropriedade('maq-inexistente', 'user-1')
      ).rejects.toThrow('Acesso negado');
    });

    it('lanca ForbiddenException quando usuario nao e o dono', async () => {
      mockPrisma.maquina.findFirst.mockResolvedValue(null);

      await expect(
        service.verificarPropriedade('maq-1', 'user-outro')
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
