import { IsEnum, IsOptional, IsString } from 'class-validator';
import { TipoMaquina } from '@prisma/client';

export class AtualizarMaquinaDto {
  @IsString()
  @IsOptional()
  nome?: string;

  @IsEnum(TipoMaquina)
  @IsOptional()
  tipo?: TipoMaquina;
}
