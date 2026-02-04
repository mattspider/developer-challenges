import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from './auth.service';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;
  let jwt: JwtService;

  const mockPrisma = {
    usuario: {
      findUnique: jest.fn(),
    },
  };

  const mockJwt = {
    sign: jest.fn().mockReturnValue('token-jwt'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwt },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    jwt = module.get<JwtService>(JwtService);
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('retorna token e usuario quando credenciais sao validas', async () => {
      const usuarioDb = {
        id: 'user-1',
        email: 'admin@test.com',
        senha: 'hash-senha',
      };
      mockPrisma.usuario.findUnique.mockResolvedValue(usuarioDb);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwt.sign.mockReturnValue('token-jwt');

      const resultado = await service.login('admin@test.com', 'senha123');

      expect(resultado).toEqual({
        token: 'token-jwt',
        usuario: { id: 'user-1', email: 'admin@test.com' },
      });
      expect(mockPrisma.usuario.findUnique).toHaveBeenCalledWith({
        where: { email: 'admin@test.com' },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith('senha123', 'hash-senha');
    });

    it('lanca UnauthorizedException quando email nao existe', async () => {
      mockPrisma.usuario.findUnique.mockResolvedValue(null);

      await expect(
        service.login('inexistente@test.com', 'senha123')
      ).rejects.toThrow(UnauthorizedException);
      await expect(
        service.login('inexistente@test.com', 'senha123')
      ).rejects.toThrow('Email ou senha invalidos');
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    it('lanca UnauthorizedException quando senha invalida', async () => {
      mockPrisma.usuario.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'admin@test.com',
        senha: 'hash-senha',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.login('admin@test.com', 'senhaErrada')
      ).rejects.toThrow(UnauthorizedException);
      await expect(
        service.login('admin@test.com', 'senhaErrada')
      ).rejects.toThrow('Email ou senha invalidos');
    });
  });

  describe('validarUsuario', () => {
    it('retorna usuario quando existe', async () => {
      mockPrisma.usuario.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'admin@test.com',
      });

      const resultado = await service.validarUsuario('user-1');

      expect(resultado).toEqual({ id: 'user-1', email: 'admin@test.com' });
      expect(mockPrisma.usuario.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        select: { id: true, email: true },
      });
    });

    it('retorna null quando usuario nao existe', async () => {
      mockPrisma.usuario.findUnique.mockResolvedValue(null);

      const resultado = await service.validarUsuario('user-inexistente');

      expect(resultado).toBeNull();
    });
  });
});
