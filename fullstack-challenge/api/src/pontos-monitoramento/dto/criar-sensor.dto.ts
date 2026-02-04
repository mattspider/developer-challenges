import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class CriarSensorDto {
  @IsString()
  @IsNotEmpty()
  identificadorUnico: string;

  @IsEnum(['TcAg', 'TcAs', 'HF+'])
  modelo: string;
}
