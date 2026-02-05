import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../services/api';
import type { Usuario } from '../types';

interface EstadoAuth {
  usuario: Usuario | null;
  token: string | null;
  carregando: boolean;
  erro: string | null;
}

const estadoInicial: EstadoAuth = {
  usuario: null,
  token: null,
  carregando: false,
  erro: null,
};

export const fazerLogin = createAsyncThunk(
  'auth/login',
  async (credenciais: { email: string; senha: string }) => {
    const resposta = await api.post<{ token: string; usuario: Usuario }>(
      '/auth/login',
      credenciais
    );
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', resposta.token);
      localStorage.setItem('usuario', JSON.stringify(resposta.usuario));
    }
    return resposta;
  }
);

export const restaurarSessao = createAsyncThunk('auth/restaurar', async () => {
  if (typeof window === 'undefined') return null;
  const token = localStorage.getItem('token');
  const usuarioStr = localStorage.getItem('usuario');
  if (!token || !usuarioStr) return null;
  return { token, usuario: JSON.parse(usuarioStr) as Usuario };
});

const authSlice = createSlice({
  name: 'auth',
  initialState: estadoInicial,
  reducers: {
    fazerLogout: (state) => {
      state.usuario = null;
      state.token = null;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fazerLogin.pending, (state) => {
        state.carregando = true;
        state.erro = null;
      })
      .addCase(fazerLogin.fulfilled, (state, action) => {
        state.carregando = false;
        state.usuario = action.payload.usuario;
        state.token = action.payload.token;
        state.erro = null;
      })
      .addCase(fazerLogin.rejected, (state, action) => {
        state.carregando = false;
        state.erro = action.error.message || 'Erro ao fazer login';
      })
      .addCase(restaurarSessao.fulfilled, (state, action) => {
        if (action.payload) {
          state.usuario = action.payload.usuario;
          state.token = action.payload.token;
        }
      });
  },
});

export const { fazerLogout } = authSlice.actions;
export default authSlice.reducer;
