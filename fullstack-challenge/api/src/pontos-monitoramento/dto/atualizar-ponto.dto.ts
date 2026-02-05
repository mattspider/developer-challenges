import { IsOptional, IsString, IsNotEmpty } from 'class-validator';

export class AtualizarPontoDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  nome?: string;
}
