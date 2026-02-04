import { Module } from '@nestjs/common';
import { PontosMonitoramentoController } from './pontos-monitoramento.controller';
import { PontosMonitoramentoService } from './pontos-monitoramento.service';
import { MaquinasModule } from '../maquinas/maquinas.module';

@Module({
  imports: [MaquinasModule],
  controllers: [PontosMonitoramentoController],
  providers: [PontosMonitoramentoService],
})
export class PontosMonitoramentoModule {}
