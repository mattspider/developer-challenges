import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { TipoMaquina } from '@prisma/client';

export class CriarMaquinaDto {
  @IsString()
  @IsNotEmpty()
  nome: string;

  @IsEnum(TipoMaquina)
  tipo: TipoMaquina;
}
