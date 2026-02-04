import { IsEnum, IsOptional, IsString } from 'class-validator';

export class AtualizarMaquinaDto {
  @IsString()
  @IsOptional()
  nome?: string;

  @IsEnum(['Pump', 'Fan'])
  @IsOptional()
  tipo?: string;
}
