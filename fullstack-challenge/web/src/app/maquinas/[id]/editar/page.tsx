'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../../../../store';
import { Box, Button, TextField, MenuItem, Paper, Typography } from '@mui/material';
import { api } from '../../../../services/api';
import { atualizarMaquina } from '../../../../store/maquinasSlice';
import { LayoutPrincipal } from '../../../../components/LayoutPrincipal';
import { ProtegerRota } from '../../../../components/ProtegerRota';

export default function EditarMaquinaPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const dispatch = useDispatch<AppDispatch>();
  const [nome, setNome] = useState('');
  const [tipo, setTipo] = useState('Pump');
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    api.get<{ nome: string; tipo: string }>(`/maquinas/${id}`).then((m) => {
      setNome(m.nome);
      setTipo(m.tipo);
      setCarregando(false);
    }).catch(() => router.push('/maquinas'));
  }, [id, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await dispatch(atualizarMaquina({ id, dados: { nome, tipo } }));
    router.push('/maquinas');
  };

  if (carregando) return <ProtegerRota><LayoutPrincipal><div>Carregando...</div></LayoutPrincipal></ProtegerRota>;

  return (
    <ProtegerRota>
      <LayoutPrincipal>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 64px - 48px)' }}>
          <Paper sx={{ p: 4, maxWidth: 520, width: '100%', borderRadius: 2 }}>
          <Typography variant="h4" fontWeight={600} gutterBottom sx={{ mb: 3 }}>
            Editar Maquina
          </Typography>
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              select
              label="Tipo"
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              margin="normal"
              required
            >
              <MenuItem value="Pump">Pump</MenuItem>
              <MenuItem value="Fan">Fan</MenuItem>
            </TextField>
            <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
              <Button type="submit" variant="contained" sx={{ fontWeight: 600 }}>
                Salvar
              </Button>
              <Button variant="outlined" onClick={() => router.back()}>
                Cancelar
              </Button>
            </Box>
          </form>
          </Paper>
        </Box>
      </LayoutPrincipal>
    </ProtegerRota>
  );
}
