'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch } from '../../../store';
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Typography,
  TablePagination,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import SensorsIcon from '@mui/icons-material/Sensors';
import { buscarMaquinas, deletarMaquina } from '../../../store/maquinasSlice';
import { RootState } from '../../../store';

export default function MaquinasPage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { lista, carregando, total, pagina, totalPaginas } = useSelector(
    (s: RootState) => s.maquinas
  );

  useEffect(() => {
    dispatch(buscarMaquinas({ pagina: 1, limite: 10 }));
  }, [dispatch]);

  const handleDeletar = async (id: string) => {
    if (confirm('Deseja realmente deletar esta maquina?')) {
      await dispatch(deletarMaquina(id));
      dispatch(buscarMaquinas({ pagina, limite: 10 }));
    }
  };

  const handleMudarPagina = (_: unknown, novaPagina: number) => {
    dispatch(buscarMaquinas({ pagina: novaPagina + 1, limite: 10 }));
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" fontWeight={600}>
          Maquinas
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => router.push('/maquinas/nova')}
          sx={{ fontWeight: 600 }}
        >
          Nova Maquina
        </Button>
      </Box>
      <TableContainer component={Paper} sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <Table size="medium">
          <TableHead>
            <TableRow>
              <TableCell>Nome</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell>Pontos</TableCell>
              <TableCell align="right">Acoes</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {carregando ? (
              <TableRow>
                <TableCell colSpan={4}>Carregando...</TableCell>
              </TableRow>
            ) : (
              lista.map((m) => (
                <TableRow key={m.id}>
                  <TableCell>{m.nome}</TableCell>
                  <TableCell>{m.tipo}</TableCell>
                  <TableCell>{m.pontosMonitoramento?.length || 0}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => router.push(`/maquinas/${m.id}/pontos`)}
                      title="Pontos"
                    >
                      <SensorsIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => router.push(`/maquinas/${m.id}/editar`)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDeletar(m.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
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
        rowsPerPage={10}
        rowsPerPageOptions={[10]}
        sx={{ mt: 1 }}
      />
    </Box>
  );
}
