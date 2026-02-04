import { IsNotEmpty, IsString } from 'class-validator';

export class CriarPontoDto {
  @IsString()
  @IsNotEmpty()
  maquinaId: string;

  @IsString()
  @IsNotEmpty()
  nome: string;
}
