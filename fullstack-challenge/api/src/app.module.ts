import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { MaquinasModule } from './maquinas/maquinas.module';
import { PontosMonitoramentoModule } from './pontos-monitoramento/pontos-monitoramento.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    PrismaModule,
    AuthModule,
    MaquinasModule,
    PontosMonitoramentoModule,
  ],
})
export class AppModule {}
