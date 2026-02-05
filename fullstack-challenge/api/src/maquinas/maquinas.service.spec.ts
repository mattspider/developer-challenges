import { NotFoundException } from '@nestjs/common';
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
      count: jest.fn(),
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
    it('retorna itens paginados filtrados por usuarioId', async () => {
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
      mockPrisma.maquina.count.mockResolvedValue(1);

      const resultado = await service.listar('user-1', 1, 10);

      expect(resultado).toEqual({
        itens: lista,
        total: 1,
        pagina: 1,
        totalPaginas: 1,
      });
      expect(mockPrisma.maquina.findMany).toHaveBeenCalledWith({
        where: { usuarioId: 'user-1' },
        skip: 0,
        take: 10,
        include: { pontosMonitoramento: true },
      });
      expect(mockPrisma.maquina.count).toHaveBeenCalledWith({
        where: { usuarioId: 'user-1' },
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
      } as any);

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
    it('chama prisma.maquina.update com id e usuarioId no where', async () => {
      const maquinaAtualizada = {
        id: 'maq-1',
        nome: 'Maquina Atualizada',
        tipo: 'Fan',
        usuarioId: 'user-1',
      };
      mockPrisma.maquina.update.mockResolvedValue(maquinaAtualizada);

      const resultado = await service.atualizar('maq-1', 'user-1', {
        nome: 'Maquina Atualizada',
        tipo: 'Fan',
      });

      expect(resultado).toEqual(maquinaAtualizada);
      expect(mockPrisma.maquina.update).toHaveBeenCalledWith({
        where: { id: 'maq-1', usuarioId: 'user-1' },
        data: { nome: 'Maquina Atualizada', tipo: 'Fan' },
      });
    });

    it('lanca NotFoundException quando nenhum registro atualizado', async () => {
      mockPrisma.maquina.update.mockRejectedValue(new Error('Record not found'));

      await expect(
        service.atualizar('maq-inexistente', 'user-1', { nome: 'X' })
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deletar', () => {
    it('chama prisma.maquina.delete com id e usuarioId no where', async () => {
      const maquinaDeletada = {
        id: 'maq-1',
        nome: 'Maquina 1',
        tipo: 'Pump',
        usuarioId: 'user-1',
      };
      mockPrisma.maquina.delete.mockResolvedValue(maquinaDeletada);

      await service.deletar('maq-1', 'user-1');

      expect(mockPrisma.maquina.delete).toHaveBeenCalledWith({
        where: { id: 'maq-1', usuarioId: 'user-1' },
      });
    });

    it('lanca NotFoundException quando nenhum registro deletado', async () => {
      mockPrisma.maquina.delete.mockRejectedValue(new Error('Record not found'));

      await expect(service.deletar('maq-inexistente', 'user-1')).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe('verificarPropriedade', () => {
    it('nao lanca quando maquina existe e pertence ao usuario', async () => {
      mockPrisma.maquina.count.mockResolvedValue(1);

      await expect(
        service.verificarPropriedade('maq-1', 'user-1')
      ).resolves.not.toThrow();
      expect(mockPrisma.maquina.count).toHaveBeenCalledWith({
        where: { id: 'maq-1', usuarioId: 'user-1' },
      });
    });

    it('lanca NotFoundException quando count e zero', async () => {
      mockPrisma.maquina.count.mockResolvedValue(0);

      await expect(
        service.verificarPropriedade('maq-inexistente', 'user-1')
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.verificarPropriedade('maq-inexistente', 'user-1')
      ).rejects.toThrow('Maquina nao encontrada');
    });
  });
});
