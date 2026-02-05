import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsuarioAtual } from '../auth/usuario.decorator';
import { MaquinasService } from './maquinas.service';
import { CriarMaquinaDto } from './dto/criar-maquina.dto';
import { AtualizarMaquinaDto } from './dto/atualizar-maquina.dto';

@Controller('maquinas')
@UseGuards(JwtAuthGuard)
export class MaquinasController {
  constructor(private maquinasService: MaquinasService) {}

  @Get()
  listar(
    @UsuarioAtual() usuario: { id: string },
    @Query('pagina') pagina?: string,
    @Query('limite') limite?: string
  ) {
    return this.maquinasService.listar(
      usuario.id,
      pagina ? parseInt(pagina, 10) : 1,
      limite ? parseInt(limite, 10) : 10
    );
  }

  @Get(':id')
  buscar(@Param('id') id: string, @UsuarioAtual() usuario: { id: string }) {
    return this.maquinasService.buscarPorId(id, usuario.id);
  }

  @Post()
  criar(@UsuarioAtual() usuario: { id: string }, @Body() dto: CriarMaquinaDto) {
    return this.maquinasService.criar(usuario.id, dto);
  }

  @Patch(':id')
  atualizar(
    @Param('id') id: string,
    @UsuarioAtual() usuario: { id: string },
    @Body() dto: AtualizarMaquinaDto
  ) {
    return this.maquinasService.atualizar(id, usuario.id, dto);
  }

  @Delete(':id')
  deletar(@Param('id') id: string, @UsuarioAtual() usuario: { id: string }) {
    return this.maquinasService.deletar(id, usuario.id);
  }
}
