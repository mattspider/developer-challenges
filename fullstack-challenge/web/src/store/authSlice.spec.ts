import authReducer, { fazerLogin, fazerLogout, restaurarSessao } from './authSlice';

describe('authSlice', () => {
  const estadoInicial = {
    usuario: null as { id: string; email: string } | null,
    token: null as string | null,
    carregando: false,
    erro: null as string | null,
  };

  it('fazerLogout limpa usuario e token', () => {
    const estadoComUsuario = {
      ...estadoInicial,
      usuario: { id: '1', email: 'a@b.com' },
      token: 'token-123',
    };
    const resultado = authReducer(estadoComUsuario, fazerLogout());
    expect(resultado.usuario).toBeNull();
    expect(resultado.token).toBeNull();
  });

  it('fazerLogin.pending define carregando true e erro null', () => {
    const estadoComErro = { ...estadoInicial, erro: 'Erro anterior' };
    const resultado = authReducer(
      estadoComErro,
      fazerLogin.pending('requestId', { email: 'a@b.com', senha: 'x' })
    );
    expect(resultado.carregando).toBe(true);
    expect(resultado.erro).toBeNull();
  });

  it('fazerLogin.fulfilled preenche usuario e token', () => {
    const payload = {
      token: 'token-jwt',
      usuario: { id: 'user-1', email: 'admin@test.com' },
    };
    const resultado = authReducer(
      { ...estadoInicial, carregando: true },
      fazerLogin.fulfilled(payload, 'requestId', { email: 'admin@test.com', senha: 'x' })
    );
    expect(resultado.carregando).toBe(false);
    expect(resultado.usuario).toEqual(payload.usuario);
    expect(resultado.token).toBe(payload.token);
    expect(resultado.erro).toBeNull();
  });

  it('fazerLogin.rejected define carregando false e erro', () => {
    const resultado = authReducer(
      { ...estadoInicial, carregando: true },
      fazerLogin.rejected(new Error('Credenciais invalidas'), 'requestId', {
        email: 'a@b.com',
        senha: 'x',
      })
    );
    expect(resultado.carregando).toBe(false);
    expect(resultado.erro).toBe('Credenciais invalidas');
  });

  it('restaurarSessao.fulfilled restaura usuario e token quando payload existe', () => {
    const payload = {
      token: 'token-salvo',
      usuario: { id: 'user-1', email: 'admin@test.com' },
    };
    const resultado = authReducer(
      estadoInicial,
      restaurarSessao.fulfilled(payload, 'requestId')
    );
    expect(resultado.usuario).toEqual(payload.usuario);
    expect(resultado.token).toBe(payload.token);
  });

  it('restaurarSessao.fulfilled com payload null nao altera estado', () => {
    const resultado = authReducer(
      estadoInicial,
      restaurarSessao.fulfilled(null, 'requestId')
    );
    expect(resultado.usuario).toBeNull();
    expect(resultado.token).toBeNull();
  });
});
