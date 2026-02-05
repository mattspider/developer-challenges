import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../services/api';
import type { Maquina } from '../types';

interface RespostaMaquinas {
  itens: Maquina[];
  total: number;
  pagina: number;
  totalPaginas: number;
}

interface EstadoMaquinas {
  lista: Maquina[];
  total: number;
  pagina: number;
  totalPaginas: number;
  carregando: boolean;
  erro: string | null;
}

const estadoInicial: EstadoMaquinas = {
  lista: [],
  total: 0,
  pagina: 1,
  totalPaginas: 0,
  carregando: false,
  erro: null,
};

export const buscarMaquinas = createAsyncThunk(
  'maquinas/buscar',
  async (params?: { pagina?: number; limite?: number }) => {
    const qs = new URLSearchParams();
    if (params?.pagina) qs.set('pagina', String(params.pagina));
    if (params?.limite) qs.set('limite', String(params.limite));
    return api.get<RespostaMaquinas>(`/maquinas?${qs}`);
  }
);

export const criarMaquina = createAsyncThunk(
  'maquinas/criar',
  async (dados: { nome: string; tipo: string }) =>
    api.post<Maquina>('/maquinas', dados)
);

export const atualizarMaquina = createAsyncThunk(
  'maquinas/atualizar',
  async ({ id, dados }: { id: string; dados: { nome?: string; tipo?: string } }) =>
    api.patch<Maquina>(`/maquinas/${id}`, dados)
);

export const deletarMaquina = createAsyncThunk(
  'maquinas/deletar',
  async (id: string) => {
    await api.delete(`/maquinas/${id}`);
    return id;
  }
);

export const criarPonto = createAsyncThunk(
  'maquinas/criarPonto',
  async ({ maquinaId, nome }: { maquinaId: string; nome: string }) =>
    api.post(`/pontos`, { maquinaId, nome })
);

const maquinasSlice = createSlice({
  name: 'maquinas',
  initialState: estadoInicial,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(buscarMaquinas.pending, (state) => {
        state.carregando = true;
        state.erro = null;
      })
      .addCase(buscarMaquinas.fulfilled, (state, action) => {
        state.carregando = false;
        state.lista = action.payload.itens;
        state.total = action.payload.total;
        state.pagina = action.payload.pagina;
        state.totalPaginas = action.payload.totalPaginas;
        state.erro = null;
      })
      .addCase(buscarMaquinas.rejected, (state, action) => {
        state.carregando = false;
        state.erro = action.error.message || 'Erro ao buscar maquinas';
      })
      .addCase(criarMaquina.fulfilled, (state, action) => {
        state.lista.push(action.payload);
      })
      .addCase(atualizarMaquina.fulfilled, (state, action) => {
        const idx = state.lista.findIndex((m) => m.id === action.payload.id);
        if (idx >= 0) state.lista[idx] = action.payload;
      })
      .addCase(deletarMaquina.fulfilled, (state, action) => {
        state.lista = state.lista.filter((m) => m.id !== action.payload);
      });
  },
});

export default maquinasSlice.reducer;
