import maquinasReducer, {
  buscarMaquinas,
  criarMaquina,
  atualizarMaquina,
  deletarMaquina,
} from './maquinasSlice';

describe('maquinasSlice', () => {
  const estadoInicialSlice = {
    lista: [],
    total: 0,
    pagina: 1,
    totalPaginas: 0,
    carregando: false,
    erro: null,
  };

  const maquina1 = {
    id: 'maq-1',
    nome: 'Maquina 1',
    tipo: 'Pump',
    usuarioId: 'user-1',
  };
  const maquina2 = {
    id: 'maq-2',
    nome: 'Maquina 2',
    tipo: 'Fan',
    usuarioId: 'user-1',
  };

  it('buscarMaquinas.fulfilled atualiza lista e paginacao', () => {
    const lista = [maquina1, maquina2];
    const payload = {
      itens: lista,
      total: 2,
      pagina: 1,
      totalPaginas: 1,
    };
    const resultado = maquinasReducer(
      { ...estadoInicialSlice, carregando: true },
      buscarMaquinas.fulfilled(payload, 'requestId')
    );
    expect(resultado.lista).toEqual(lista);
    expect(resultado.total).toBe(2);
    expect(resultado.pagina).toBe(1);
    expect(resultado.totalPaginas).toBe(1);
    expect(resultado.carregando).toBe(false);
    expect(resultado.erro).toBeNull();
  });

  it('criarMaquina.fulfilled adiciona item na lista', () => {
    const estadoInicial = {
      ...estadoInicialSlice,
      lista: [maquina1],
    };
    const novaMaquina = {
      id: 'maq-nova',
      nome: 'Nova',
      tipo: 'Fan',
      usuarioId: 'user-1',
    };
    const resultado = maquinasReducer(
      estadoInicial,
      criarMaquina.fulfilled(novaMaquina, 'requestId', { nome: 'Nova', tipo: 'Fan' })
    );
    expect(resultado.lista).toHaveLength(2);
    expect(resultado.lista[1]).toEqual(novaMaquina);
  });

  it('atualizarMaquina.fulfilled atualiza item na lista', () => {
    const estadoInicial = {
      ...estadoInicialSlice,
      lista: [maquina1, maquina2],
    };
    const maquinaAtualizada = {
      ...maquina1,
      nome: 'Maquina 1 Atualizada',
      tipo: 'Fan',
    };
    const resultado = maquinasReducer(
      estadoInicial,
      atualizarMaquina.fulfilled(maquinaAtualizada, 'requestId', {
        id: 'maq-1',
        dados: { nome: 'Maquina 1 Atualizada', tipo: 'Fan' },
      })
    );
    expect(resultado.lista[0]).toEqual(maquinaAtualizada);
    expect(resultado.lista[1]).toEqual(maquina2);
  });

  it('deletarMaquina.fulfilled remove item da lista', () => {
    const estadoInicial = {
      ...estadoInicialSlice,
      lista: [maquina1, maquina2],
    };
    const resultado = maquinasReducer(
      estadoInicial,
      deletarMaquina.fulfilled('maq-1', 'requestId', 'maq-1')
    );
    expect(resultado.lista).toHaveLength(1);
    expect(resultado.lista[0]).toEqual(maquina2);
  });
});
