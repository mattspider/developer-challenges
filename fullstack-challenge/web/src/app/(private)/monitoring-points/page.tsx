'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch } from '../../../store';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TablePagination,
  TextField,
  Typography,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  buscarPontos,
  atualizarPonto,
  deletarPonto,
} from '../../../store/pontosSlice';
import { RootState } from '../../../store';

type OrdenarPor = 'machineName' | 'machineType' | 'monitoringPointName' | 'sensorModel';

export default function PontosMonitoramentoPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { itens, total, pagina, totalPaginas, carregando } = useSelector(
    (s: RootState) => s.pontos
  );
  const [ordenarPor, setOrdenarPor] = useState<OrdenarPor>('monitoringPointName');
  const [direcao, setDirecao] = useState<'asc' | 'desc'>('asc');
  const [dialogEditarAberto, setDialogEditarAberto] = useState(false);
  const [pontoParaEditar, setPontoParaEditar] = useState<{
    id: string;
    nomePonto: string;
  } | null>(null);
  const [nomeEditando, setNomeEditando] = useState('');

  useEffect(() => {
    dispatch(
      buscarPontos({
        pagina: 1,
        limite: 5,
        ordenarPor,
        direcao,
      })
    );
  }, [dispatch, ordenarPor, direcao]);

  const handleOrdenar = (coluna: OrdenarPor) => {
    const isAsc = ordenarPor === coluna && direcao === 'asc';
    setOrdenarPor(coluna);
    setDirecao(isAsc ? 'desc' : 'asc');
  };

  const handleMudarPagina = (_: unknown, novaPagina: number) => {
    dispatch(
      buscarPontos({
        pagina: novaPagina + 1,
        limite: 5,
        ordenarPor,
        direcao,
      })
    );
  };

  const abrirDialogEditar = (p: { id: string; nomePonto: string }) => {
    setPontoParaEditar({ id: p.id, nomePonto: p.nomePonto });
    setNomeEditando(p.nomePonto);
    setDialogEditarAberto(true);
  };

  const handleEditarPonto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pontoParaEditar) return;
    try {
      await dispatch(
        atualizarPonto({ pontoId: pontoParaEditar.id, nome: nomeEditando })
      ).unwrap();
      setDialogEditarAberto(false);
      setPontoParaEditar(null);
      dispatch(
        buscarPontos({ pagina, limite: 5, ordenarPor, direcao })
      );
    } catch {
      // erro silencioso
    }
  };

  const handleDeletarPonto = async (pontoId: string) => {
    if (!confirm('Deseja excluir este ponto e todos os sensores associados?')) return;
    try {
      await dispatch(deletarPonto(pontoId)).unwrap();
      dispatch(
        buscarPontos({ pagina, limite: 5, ordenarPor, direcao })
      );
    } catch {
      // erro silencioso
    }
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight={600} sx={{ mb: 3 }}>
        Pontos de Monitoramento
      </Typography>
      <TableContainer component={Paper} sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <TableSortLabel
                  active={ordenarPor === 'machineName'}
                  direction={ordenarPor === 'machineName' ? direcao : 'asc'}
                  onClick={() => handleOrdenar('machineName')}
                >
                  Nome da Maquina
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={ordenarPor === 'machineType'}
                  direction={ordenarPor === 'machineType' ? direcao : 'asc'}
                  onClick={() => handleOrdenar('machineType')}
                >
                  Tipo da Maquina
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={ordenarPor === 'monitoringPointName'}
                  direction={ordenarPor === 'monitoringPointName' ? direcao : 'asc'}
                  onClick={() => handleOrdenar('monitoringPointName')}
                >
                  Nome do Ponto
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={ordenarPor === 'sensorModel'}
                  direction={ordenarPor === 'sensorModel' ? direcao : 'asc'}
                  onClick={() => handleOrdenar('sensorModel')}
                >
                  Modelo do Sensor
                </TableSortLabel>
              </TableCell>
              <TableCell align="right">Acoes</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {carregando ? (
              <TableRow>
                <TableCell colSpan={5}>Carregando...</TableCell>
              </TableRow>
            ) : (
              itens.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>{p.nomeMaquina}</TableCell>
                  <TableCell>{p.tipoMaquina}</TableCell>
                  <TableCell>{p.nomePonto}</TableCell>
                  <TableCell>{p.modeloSensor || '-'}</TableCell>
                  <TableCell align="right">
                    <Button
                      size="small"
                      onClick={() => abrirDialogEditar(p)}
                      sx={{ mr: 1 }}
                    >
                      <EditIcon fontSize="small" /> Editar
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      onClick={() => handleDeletarPonto(p.id)}
                    >
                      <DeleteIcon fontSize="small" /> Excluir
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={total}
        page={pagina - 1}
        onPageChange={handleMudarPagina}
        rowsPerPage={5}
        rowsPerPageOptions={[5]}
        sx={{ mt: 1 }}
      />
      <Dialog
        open={dialogEditarAberto}
        onClose={() => {
          setDialogEditarAberto(false);
          setPontoParaEditar(null);
        }}
      >
        <DialogTitle>Editar Ponto</DialogTitle>
        <form onSubmit={handleEditarPonto}>
          <DialogContent>
            <TextField
              fullWidth
              label="Nome do ponto"
              value={nomeEditando}
              onChange={(e) => setNomeEditando(e.target.value)}
              margin="normal"
              required
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogEditarAberto(false)}>Cancelar</Button>
            <Button type="submit" variant="contained">
              Salvar
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
