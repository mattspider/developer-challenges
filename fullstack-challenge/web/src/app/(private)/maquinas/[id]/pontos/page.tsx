'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../../../../../store';
import {
  Box,
  Button,
  TextField,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { api } from '../../../../../services/api';
import { criarPonto } from '../../../../../store/maquinasSlice';
import {
  associarSensor,
  atualizarPonto,
  buscarPontos,
  deletarPonto,
} from '../../../../../store/pontosSlice';

interface PontoComMaquina {
  id: string;
  nome: string;
  maquina: { nome: string; tipo: string };
  sensores: { id: string; identificadorUnico: string; modelo: string }[];
}

export default function PontosMaquinaPage() {
  const router = useRouter();
  const params = useParams();
  const maquinaId = params.id as string;
  const dispatch = useDispatch<AppDispatch>();
  const [maquina, setMaquina] = useState<{ nome: string; tipo: string } | null>(null);
  const [pontos, setPontos] = useState<PontoComMaquina[]>([]);
  const [novoPontoNome, setNovoPontoNome] = useState('');
  const [dialogAberto, setDialogAberto] = useState(false);
  const [pontoSelecionado, setPontoSelecionado] = useState<string | null>(null);
  const [identificadorUnico, setIdentificadorUnico] = useState('');
  const [modeloSensor, setModeloSensor] = useState('HF+');
  const [erroSensor, setErroSensor] = useState<string | null>(null);
  const [dialogEditarAberto, setDialogEditarAberto] = useState(false);
  const [pontoParaEditar, setPontoParaEditar] = useState<{
    id: string;
    nome: string;
  } | null>(null);
  const [nomeEditando, setNomeEditando] = useState('');

  useEffect(() => {
    api
      .get<{ nome: string; tipo: string; pontosMonitoramento: PontoComMaquina[] }>(
        `/maquinas/${maquinaId}`
      )
      .then((m) => {
        setMaquina({ nome: m.nome, tipo: m.tipo });
        setPontos(m.pontosMonitoramento || []);
      })
      .catch(() => router.push('/maquinas'));
  }, [maquinaId, router]);

  const handleCriarPonto = async (e: React.FormEvent) => {
    e.preventDefault();
    await dispatch(criarPonto({ maquinaId, nome: novoPontoNome }));
    setNovoPontoNome('');
    const m = await api.get<{ pontosMonitoramento: PontoComMaquina[] }>(
      `/maquinas/${maquinaId}`
    );
    setPontos(m.pontosMonitoramento || []);
  };

  const abrirDialogSensor = (pontoId: string) => {
    setPontoSelecionado(pontoId);
    setIdentificadorUnico('');
    setModeloSensor('HF+');
    setErroSensor(null);
    setDialogAberto(true);
  };

  const handleAssociarSensor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pontoSelecionado) return;
    setErroSensor(null);
    try {
      await dispatch(
        associarSensor({
          pontoId: pontoSelecionado,
          identificadorUnico,
          modelo: modeloSensor,
        })
      ).unwrap();
      setDialogAberto(false);
      dispatch(buscarPontos({ pagina: 1 }));
      const m = await api.get<{ pontosMonitoramento: PontoComMaquina[] }>(
        `/maquinas/${maquinaId}`
      );
      setPontos(m.pontosMonitoramento || []);
    } catch (err) {
      setErroSensor((err as Error).message || 'Erro ao associar sensor');
    }
  };

  const sensoresPermitidos =
    maquina?.tipo === 'Pump' ? ['HF+'] : ['TcAg', 'TcAs', 'HF+'];

  const abrirDialogEditar = (p: PontoComMaquina) => {
    setPontoParaEditar({ id: p.id, nome: p.nome });
    setNomeEditando(p.nome);
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
      dispatch(buscarPontos({ pagina: 1 }));
      const m = await api.get<{ pontosMonitoramento: PontoComMaquina[] }>(
        `/maquinas/${maquinaId}`
      );
      setPontos(m.pontosMonitoramento || []);
    } catch {
      // erro silencioso ou exibir snackbar
    }
  };

  const handleDeletarPonto = async (pontoId: string) => {
    if (!confirm('Deseja excluir este ponto e todos os sensores associados?')) return;
    try {
      await dispatch(deletarPonto(pontoId)).unwrap();
      dispatch(buscarPontos({ pagina: 1 }));
      const m = await api.get<{ pontosMonitoramento: PontoComMaquina[] }>(
        `/maquinas/${maquinaId}`
      );
      setPontos(m.pontosMonitoramento || []);
    } catch {
      // erro silencioso ou exibir snackbar
    }
  };

  return (
    <Box>
      <Button sx={{ mb: 2 }} variant="outlined" onClick={() => router.push('/maquinas')}>
        Voltar
      </Button>
      <Typography variant="h4" fontWeight={600} sx={{ mb: 3 }}>
        Pontos de Monitoramento - {maquina?.nome}
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
        <Paper sx={{ p: 4, borderRadius: 2, maxWidth: 480, width: '100%' }}>
          <Typography variant="h6" fontWeight={600} gutterBottom sx={{ mb: 2 }}>
            Criar Ponto
          </Typography>
          <form onSubmit={handleCriarPonto}>
            <TextField
              label="Nome do ponto"
              value={novoPontoNome}
              onChange={(e) => setNovoPontoNome(e.target.value)}
              required
              sx={{ mr: 2 }}
            />
            <Button type="submit" variant="contained">
              Criar
            </Button>
          </form>
        </Paper>
      </Box>
      <TableContainer component={Paper} sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Ponto</TableCell>
              <TableCell>Sensores</TableCell>
              <TableCell align="right">Acoes</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pontos.map((p) => (
              <TableRow key={p.id}>
                <TableCell>{p.nome}</TableCell>
                <TableCell>
                  {p.sensores?.length
                    ? p.sensores
                        .map((s) => `${s.identificadorUnico} (${s.modelo === 'HFPlus' ? 'HF+' : s.modelo})`)
                        .join(', ')
                    : '-'}
                </TableCell>
                <TableCell align="right">
                  <Button size="small" onClick={() => abrirDialogEditar(p)} sx={{ mr: 1 }}>
                    <EditIcon fontSize="small" /> Editar
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    onClick={() => handleDeletarPonto(p.id)}
                  >
                    <DeleteIcon fontSize="small" /> Excluir
                  </Button>
                  <Button
                    size="small"
                    onClick={() => abrirDialogSensor(p.id)}
                    sx={{ ml: 1 }}
                  >
                    <AddIcon fontSize="small" /> Adicionar Sensor
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Dialog open={dialogAberto} onClose={() => { setDialogAberto(false); setErroSensor(null); }}>
        <DialogTitle>Associar Sensor</DialogTitle>
        <form onSubmit={handleAssociarSensor}>
          <DialogContent>
            {erroSensor && (
              <Typography color="error" sx={{ mb: 2 }}>
                {erroSensor}
              </Typography>
            )}
            <TextField
              fullWidth
              label="Identificador Unico"
              value={identificadorUnico}
              onChange={(e) => setIdentificadorUnico(e.target.value)}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              select
              label="Modelo"
              value={modeloSensor}
              onChange={(e) => setModeloSensor(e.target.value)}
              margin="normal"
            >
              {sensoresPermitidos.map((mod) => (
                <MenuItem key={mod} value={mod}>
                  {mod}
                </MenuItem>
              ))}
            </TextField>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogAberto(false)}>Cancelar</Button>
            <Button type="submit" variant="contained">
              Salvar
            </Button>
          </DialogActions>
        </form>
      </Dialog>
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
