import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsuarioAtual } from '../auth/usuario.decorator';
import { PontosMonitoramentoService } from './pontos-monitoramento.service';
import { CriarPontoDto } from './dto/criar-ponto.dto';
import { CriarSensorDto } from './dto/criar-sensor.dto';
import { AtualizarPontoDto } from './dto/atualizar-ponto.dto';

@Controller('pontos')
@UseGuards(JwtAuthGuard)
export class PontosMonitoramentoController {
  constructor(private pontosService: PontosMonitoramentoService) {}

  @Post()
  criar(@UsuarioAtual() usuario: { id: string }, @Body() dto: CriarPontoDto) {
    return this.pontosService.criar(dto.maquinaId, usuario.id, dto);
  }

  @Get()
  listar(
    @UsuarioAtual() usuario: { id: string },
    @Query('pagina') pagina?: string,
    @Query('limite') limite?: string,
    @Query('ordenarPor') ordenarPor?: string,
    @Query('direcao') direcao?: 'asc' | 'desc'
  ) {
    return this.pontosService.listar(
      usuario.id,
      pagina ? parseInt(pagina, 10) : 1,
      limite ? parseInt(limite, 10) : 5,
      ordenarPor,
      direcao || 'asc'
    );
  }

  @Patch(':id')
  atualizar(
    @Param('id') pontoId: string,
    @UsuarioAtual() usuario: { id: string },
    @Body() dto: AtualizarPontoDto
  ) {
    return this.pontosService.atualizar(pontoId, usuario.id, dto);
  }

  @Delete(':id')
  deletar(
    @Param('id') pontoId: string,
    @UsuarioAtual() usuario: { id: string }
  ) {
    return this.pontosService.deletar(pontoId, usuario.id);
  }

  @Post(':id/sensores')
  associarSensor(
    @Param('id') pontoId: string,
    @UsuarioAtual() usuario: { id: string },
    @Body() dto: CriarSensorDto
  ) {
    return this.pontosService.associarSensor(pontoId, usuario.id, dto);
  }
}
