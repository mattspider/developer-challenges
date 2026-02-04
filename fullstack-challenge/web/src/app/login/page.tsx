'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Button, TextField, Typography, Paper, IconButton } from '@mui/material';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import { fazerLogin } from '../../store/authSlice';
import { RootState, AppDispatch } from '../../store';
import { useTema } from '../../contexto/TemaContext';
import { useState } from 'react';

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const token = useSelector((s: RootState) => s.auth.token);
  const carregando = useSelector((s: RootState) => s.auth.carregando);
  const erro = useSelector((s: RootState) => s.auth.erro);
  const { modo, alternarTema } = useTema();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  useEffect(() => {
    if (token) {
      router.push('/maquinas');
    }
  }, [token, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const resultado = await dispatch(fazerLogin({ email, senha }));
    if (fazerLogin.fulfilled.match(resultado)) {
      router.push('/maquinas');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        position: 'relative',
      }}
    >
      <IconButton
        onClick={alternarTema}
        sx={{
          position: 'absolute',
          top: 16,
          right: 16,
          color: 'text.primary',
        }}
        title={modo === 'dark' ? 'Tema claro' : 'Tema escuro'}
      >
        {modo === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
      </IconButton>
      <Paper
        elevation={0}
        sx={{
          p: 4,
          maxWidth: 420,
          width: '100%',
          borderRadius: 3,
          boxShadow: (theme) =>
            theme.palette.mode === 'dark'
              ? '0 4px 24px rgba(0,0,0,0.4)'
              : '0 8px 32px rgba(0,0,0,0.12)',
        }}
      >
        <Typography variant="h5" fontWeight={600} gutterBottom align="center" sx={{ mb: 3 }}>
          DynaPredict - Login
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            margin="normal"
            required
            sx={{ mb: 1 }}
          />
          <TextField
            fullWidth
            label="Senha"
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            margin="normal"
            required
            sx={{ mb: 1 }}
          />
          {erro && (
            <Typography color="error" sx={{ mt: 1, mb: 1 }}>
              {erro}
            </Typography>
          )}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            sx={{ mt: 3, py: 1.5, fontWeight: 600 }}
            disabled={carregando}
          >
            {carregando ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>
      </Paper>
    </Box>
  );
}
