'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch } from '../../store';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TableSortLabel,
  TablePagination,
  Typography,
} from '@mui/material';
import { buscarPontos } from '../../store/pontosSlice';
import { RootState } from '../../store';
import { LayoutPrincipal } from '../../components/LayoutPrincipal';
import { ProtegerRota } from '../../components/ProtegerRota';

type OrdenarPor = 'machineName' | 'machineType' | 'monitoringPointName' | 'sensorModel';

export default function PontosMonitoramentoPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { itens, total, pagina, totalPaginas, carregando } = useSelector(
    (s: RootState) => s.pontos
  );
  const [ordenarPor, setOrdenarPor] = useState<OrdenarPor>('monitoringPointName');
  const [direcao, setDirecao] = useState<'asc' | 'desc'>('asc');

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

  return (
    <ProtegerRota>
      <LayoutPrincipal>
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
                </TableRow>
              </TableHead>
              <TableBody>
                {carregando ? (
                  <TableRow>
                    <TableCell colSpan={4}>Carregando...</TableCell>
                  </TableRow>
                ) : (
                  itens.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>{p.nomeMaquina}</TableCell>
                      <TableCell>{p.tipoMaquina}</TableCell>
                      <TableCell>{p.nomePonto}</TableCell>
                      <TableCell>{p.modeloSensor || '-'}</TableCell>
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
        </Box>
      </LayoutPrincipal>
    </ProtegerRota>
  );
}
