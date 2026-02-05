import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { MaquinasService } from '../maquinas/maquinas.service';
import { PrismaService } from '../prisma/prisma.service';
import { PontosMonitoramentoService } from './pontos-monitoramento.service';

describe('PontosMonitoramentoService', () => {
  let service: PontosMonitoramentoService;
  let prisma: PrismaService;
  let maquinasService: MaquinasService;

  const mockPrisma = {
    pontoMonitoramento: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    sensor: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };

  const mockMaquinasService = {
    verificarPropriedade: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PontosMonitoramentoService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: MaquinasService, useValue: mockMaquinasService },
      ],
    }).compile();

    service = module.get<PontosMonitoramentoService>(PontosMonitoramentoService);
    prisma = module.get<PrismaService>(PrismaService);
    maquinasService = module.get<MaquinasService>(MaquinasService);
    jest.clearAllMocks();
  });

  describe('criar', () => {
    it('chama verificarPropriedade e prisma.pontoMonitoramento.create', async () => {
      const maquina = {
        id: 'maq-1',
        nome: 'Maquina 1',
        tipo: 'Pump',
        usuarioId: 'user-1',
      };
      const pontoCriado = {
        id: 'ponto-1',
        nome: 'Ponto A',
        maquinaId: 'maq-1',
      };
      mockMaquinasService.verificarPropriedade.mockResolvedValue(maquina);
      mockPrisma.pontoMonitoramento.create.mockResolvedValue(pontoCriado);

      const resultado = await service.criar('maq-1', 'user-1', {
        maquinaId: 'maq-1',
        nome: 'Ponto A',
      });

      expect(resultado).toEqual(pontoCriado);
      expect(mockMaquinasService.verificarPropriedade).toHaveBeenCalledWith(
        'maq-1',
        'user-1'
      );
      expect(mockPrisma.pontoMonitoramento.create).toHaveBeenCalledWith({
        data: { nome: 'Ponto A', maquinaId: 'maq-1' },
      });
    });
  });

  it('deve rejeitar sensor TcAg em maquina tipo Pump', async () => {
    mockPrisma.pontoMonitoramento.findFirst.mockResolvedValue({
      id: 'ponto-1',
      maquinaId: 'maq-1',
      maquina: { tipo: 'Pump' },
    });
    mockMaquinasService.verificarPropriedade.mockResolvedValue({});

    await expect(
      service.associarSensor('ponto-1', 'user-1', {
        identificadorUnico: 'sens-1',
        modelo: 'TcAg',
      })
    ).rejects.toThrow(BadRequestException);
  });

  it('deve rejeitar sensor TcAs em maquina tipo Pump', async () => {
    mockPrisma.pontoMonitoramento.findFirst.mockResolvedValue({
      id: 'ponto-1',
      maquinaId: 'maq-1',
      maquina: { tipo: 'Pump' },
    });
    mockMaquinasService.verificarPropriedade.mockResolvedValue({});

    await expect(
      service.associarSensor('ponto-1', 'user-1', {
        identificadorUnico: 'sens-1',
        modelo: 'TcAs',
      })
    ).rejects.toThrow(BadRequestException);
  });

  it('deve lancar BadRequestException quando identificadorUnico ja existe', async () => {
    mockPrisma.pontoMonitoramento.findFirst.mockResolvedValue({
      id: 'ponto-1',
      maquinaId: 'maq-1',
      maquina: { tipo: 'Fan' },
    });
    mockMaquinasService.verificarPropriedade.mockResolvedValue({});
    mockPrisma.sensor.findUnique.mockResolvedValue({
      id: 'sensor-existente',
      identificadorUnico: 'sens-duplicado',
    });

    await expect(
      service.associarSensor('ponto-1', 'user-1', {
        identificadorUnico: 'sens-duplicado',
        modelo: 'HF+',
      })
    ).rejects.toThrow(BadRequestException);
    await expect(
      service.associarSensor('ponto-1', 'user-1', {
        identificadorUnico: 'sens-duplicado',
        modelo: 'HF+',
      })
    ).rejects.toThrow('Identificador unico ja existe no sistema');
    expect(mockPrisma.sensor.create).not.toHaveBeenCalled();
  });

  it('deve permitir sensor HF+ em maquina tipo Pump', async () => {
    mockPrisma.pontoMonitoramento.findFirst.mockResolvedValue({
      id: 'ponto-1',
      maquinaId: 'maq-1',
      maquina: { tipo: 'Pump' },
    });
    mockMaquinasService.verificarPropriedade.mockResolvedValue({});
    mockPrisma.sensor.findUnique.mockResolvedValue(null);
    mockPrisma.sensor.create.mockResolvedValue({ id: 'sensor-1' });

    const resultado = await service.associarSensor('ponto-1', 'user-1', {
      identificadorUnico: 'sens-1',
      modelo: 'HF+',
    });

    expect(resultado).toEqual({ id: 'sensor-1' });
    expect(mockPrisma.sensor.create).toHaveBeenCalled();
  });

  it('deve lancar NotFoundException quando ponto nao existe', async () => {
    mockPrisma.pontoMonitoramento.findFirst.mockResolvedValue(null);

    await expect(
      service.associarSensor('ponto-inexistente', 'user-1', {
        identificadorUnico: 'sens-1',
        modelo: 'HF+',
      })
    ).rejects.toThrow(NotFoundException);
    await expect(
      service.associarSensor('ponto-inexistente', 'user-1', {
        identificadorUnico: 'sens-1',
        modelo: 'HF+',
      })
    ).rejects.toThrow('Ponto de monitoramento nao encontrado');
    expect(mockMaquinasService.verificarPropriedade).not.toHaveBeenCalled();
  });

  it('deve permitir sensor TcAg em maquina tipo Fan', async () => {
    mockPrisma.pontoMonitoramento.findFirst.mockResolvedValue({
      id: 'ponto-1',
      maquinaId: 'maq-1',
      maquina: { tipo: 'Fan' },
    });
    mockMaquinasService.verificarPropriedade.mockResolvedValue({});
    mockPrisma.sensor.findUnique.mockResolvedValue(null);
    mockPrisma.sensor.create.mockResolvedValue({ id: 'sensor-1' });

    const resultado = await service.associarSensor('ponto-1', 'user-1', {
      identificadorUnico: 'sens-1',
      modelo: 'TcAg',
    });

    expect(resultado).toEqual({ id: 'sensor-1' });
    expect(mockPrisma.sensor.create).toHaveBeenCalled();
  });

  describe('atualizar', () => {
    it('atualiza nome do ponto apos verificar propriedade', async () => {
      mockPrisma.pontoMonitoramento.findFirst.mockResolvedValue({
        id: 'ponto-1',
        maquinaId: 'maq-1',
        maquina: { tipo: 'Fan' },
      });
      mockMaquinasService.verificarPropriedade.mockResolvedValue({});
      mockPrisma.pontoMonitoramento.update.mockResolvedValue({
        id: 'ponto-1',
        nome: 'Ponto Atualizado',
      });

      const resultado = await service.atualizar('ponto-1', 'user-1', {
        nome: 'Ponto Atualizado',
      });

      expect(resultado.nome).toBe('Ponto Atualizado');
      expect(mockMaquinasService.verificarPropriedade).toHaveBeenCalledWith(
        'maq-1',
        'user-1'
      );
      expect(mockPrisma.pontoMonitoramento.update).toHaveBeenCalledWith({
        where: { id: 'ponto-1' },
        data: { nome: 'Ponto Atualizado' },
      });
    });

    it('lanca NotFoundException quando ponto nao existe', async () => {
      mockPrisma.pontoMonitoramento.findFirst.mockResolvedValue(null);

      await expect(
        service.atualizar('ponto-inexistente', 'user-1', { nome: 'Novo' })
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deletar', () => {
    it('deleta ponto apos verificar propriedade', async () => {
      mockPrisma.pontoMonitoramento.findFirst.mockResolvedValue({
        id: 'ponto-1',
        maquinaId: 'maq-1',
      });
      mockMaquinasService.verificarPropriedade.mockResolvedValue({});
      mockPrisma.pontoMonitoramento.delete.mockResolvedValue({ id: 'ponto-1' });

      await service.deletar('ponto-1', 'user-1');

      expect(mockPrisma.pontoMonitoramento.delete).toHaveBeenCalledWith({
        where: { id: 'ponto-1' },
      });
    });

    it('lanca NotFoundException quando ponto nao existe', async () => {
      mockPrisma.pontoMonitoramento.findFirst.mockResolvedValue(null);

      await expect(
        service.deletar('ponto-inexistente', 'user-1')
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('listar', () => {
    it('retorna itens paginados com formato correto', async () => {
      const itensDb = [
        {
          id: 'p1',
          nome: 'Ponto A',
          maquina: { nome: 'Maq 1', tipo: 'Pump' },
          sensores: [{ modelo: 'HFPlus' }],
        },
      ];
      mockPrisma.pontoMonitoramento.findMany.mockResolvedValue(itensDb);
      mockPrisma.pontoMonitoramento.count.mockResolvedValue(1);

      const resultado = await service.listar('user-1', 1, 5);

      expect(resultado).toEqual({
        itens: [
          {
            id: 'p1',
            nomePonto: 'Ponto A',
            nomeMaquina: 'Maq 1',
            tipoMaquina: 'Pump',
            modeloSensor: 'HF+',
          },
        ],
        total: 1,
        pagina: 1,
        totalPaginas: 1,
      });
      expect(mockPrisma.pontoMonitoramento.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { maquina: { usuarioId: 'user-1' } },
          skip: 0,
          take: 5,
          include: {
            maquina: true,
            sensores: true,
          },
        })
      );
    });

    it('aplica ordenacao por machineName', async () => {
      mockPrisma.pontoMonitoramento.findMany.mockResolvedValue([]);
      mockPrisma.pontoMonitoramento.count.mockResolvedValue(0);

      await service.listar('user-1', 1, 5, 'machineName', 'desc');

      expect(mockPrisma.pontoMonitoramento.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { maquina: { nome: 'desc' } },
        })
      );
    });

    it('aplica ordenacao por machineType', async () => {
      mockPrisma.pontoMonitoramento.findMany.mockResolvedValue([]);
      mockPrisma.pontoMonitoramento.count.mockResolvedValue(0);

      await service.listar('user-1', 1, 5, 'machineType', 'asc');

      expect(mockPrisma.pontoMonitoramento.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { maquina: { tipo: 'asc' } },
        })
      );
    });

    it('exibe HF+ para maquina Pump e todos os modelos para Fan', async () => {
      const itensDb = [
        {
          id: 'p1',
          nome: 'Ponto Pump',
          maquina: { nome: 'Maq Pump', tipo: 'Pump' },
          sensores: [{ modelo: 'HFPlus' }],
        },
        {
          id: 'p2',
          nome: 'Ponto Fan',
          maquina: { nome: 'Maq Fan', tipo: 'Fan' },
          sensores: [
            { modelo: 'TcAg' },
            { modelo: 'TcAs' },
            { modelo: 'HFPlus' },
          ],
        },
        {
          id: 'p3',
          nome: 'Ponto Pump sem sensor',
          maquina: { nome: 'Maq Pump 2', tipo: 'Pump' },
          sensores: [],
        },
      ];
      mockPrisma.pontoMonitoramento.findMany.mockResolvedValue(itensDb);
      mockPrisma.pontoMonitoramento.count.mockResolvedValue(3);

      const resultado = await service.listar('user-1', 1, 5);

      expect(resultado.itens[0].modeloSensor).toBe('HF+');
      expect(resultado.itens[1].modeloSensor).toBe('TcAg, TcAs, HF+');
      expect(resultado.itens[2].modeloSensor).toBeNull();
    });
  });
});
