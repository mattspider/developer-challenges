import pontosReducer, { buscarPontos, definirPagina } from './pontosSlice';

describe('pontosSlice', () => {
  const itens = [
    {
      id: 'p1',
      nomePonto: 'Ponto A',
      nomeMaquina: 'Maq 1',
      tipoMaquina: 'Pump',
      modeloSensor: 'HF+',
    },
  ];
  const payload = {
    itens,
    total: 10,
    pagina: 2,
    totalPaginas: 2,
  };

  it('buscarPontos.fulfilled atualiza itens, total, pagina e totalPaginas', () => {
    const resultado = pontosReducer(
      { itens: [], total: 0, pagina: 1, totalPaginas: 0, carregando: true, erro: null },
      buscarPontos.fulfilled(payload, 'requestId', { pagina: 2, limite: 5 })
    );
    expect(resultado.itens).toEqual(itens);
    expect(resultado.total).toBe(10);
    expect(resultado.pagina).toBe(2);
    expect(resultado.totalPaginas).toBe(2);
    expect(resultado.carregando).toBe(false);
    expect(resultado.erro).toBeNull();
  });

  it('buscarPontos.pending define carregando true', () => {
    const resultado = pontosReducer(
      { itens: [], total: 0, pagina: 1, totalPaginas: 0, carregando: false, erro: 'Erro' },
      buscarPontos.pending('requestId', {})
    );
    expect(resultado.carregando).toBe(true);
    expect(resultado.erro).toBeNull();
  });

  it('buscarPontos.rejected define carregando false e erro', () => {
    const resultado = pontosReducer(
      { itens: [], total: 0, pagina: 1, totalPaginas: 0, carregando: true, erro: null },
      buscarPontos.rejected(new Error('Falha na rede'), 'requestId', {})
    );
    expect(resultado.carregando).toBe(false);
    expect(resultado.erro).toBe('Falha na rede');
  });

  it('definirPagina atualiza pagina', () => {
    const resultado = pontosReducer(
      { itens: [], total: 0, pagina: 1, totalPaginas: 5, carregando: false, erro: null },
      definirPagina(3)
    );
    expect(resultado.pagina).toBe(3);
  });
});
