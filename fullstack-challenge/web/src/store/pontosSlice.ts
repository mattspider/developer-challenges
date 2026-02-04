import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../services/api';
import type { RespostaPontos } from '../tipos';

interface EstadoPontos {
  itens: RespostaPontos['itens'];
  total: number;
  pagina: number;
  totalPaginas: number;
  carregando: boolean;
  erro: string | null;
}

const estadoInicial: EstadoPontos = {
  itens: [],
  total: 0,
  pagina: 1,
  totalPaginas: 0,
  carregando: false,
  erro: null,
};

export const buscarPontos = createAsyncThunk(
  'pontos/buscar',
  async (params: {
    pagina?: number;
    limite?: number;
    ordenarPor?: string;
    direcao?: string;
  }) => {
    const qs = new URLSearchParams();
    if (params.pagina) qs.set('pagina', String(params.pagina));
    if (params.limite) qs.set('limite', String(params.limite));
    if (params.ordenarPor) qs.set('ordenarPor', params.ordenarPor);
    if (params.direcao) qs.set('direcao', params.direcao);
    return api.get<RespostaPontos>(`/pontos?${qs}`);
  }
);

export const associarSensor = createAsyncThunk(
  'pontos/associarSensor',
  async ({
    pontoId,
    identificadorUnico,
    modelo,
  }: {
    pontoId: string;
    identificadorUnico: string;
    modelo: string;
  }) => api.post(`/pontos/${pontoId}/sensores`, { identificadorUnico, modelo })
);

const pontosSlice = createSlice({
  name: 'pontos',
  initialState: estadoInicial,
  reducers: {
    definirPagina: (state, action) => {
      state.pagina = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(buscarPontos.pending, (state) => {
        state.carregando = true;
        state.erro = null;
      })
      .addCase(buscarPontos.fulfilled, (state, action) => {
        state.carregando = false;
        state.itens = action.payload.itens;
        state.total = action.payload.total;
        state.pagina = action.payload.pagina;
        state.totalPaginas = action.payload.totalPaginas;
        state.erro = null;
      })
      .addCase(buscarPontos.rejected, (state, action) => {
        state.carregando = false;
        state.erro = action.error.message || 'Erro ao buscar pontos';
      });
  },
});

export const { definirPagina } = pontosSlice.actions;
export default pontosSlice.reducer;
