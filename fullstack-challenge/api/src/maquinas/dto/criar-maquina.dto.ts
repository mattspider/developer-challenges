import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class CriarMaquinaDto {
  @IsString()
  @IsNotEmpty()
  nome: string;

  @IsEnum(['Pump', 'Fan'])
  tipo: string;
}
