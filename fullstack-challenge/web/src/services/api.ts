const urlBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333';

function obterToken() {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
}

async function requisicao<T>(
  rota: string,
  opcoes: RequestInit = {}
): Promise<T> {
  const token = obterToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...opcoes.headers,
  };
  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }
  const resposta = await fetch(`${urlBase}${rota}`, { ...opcoes, headers });
  if (!resposta.ok) {
    const erro = await resposta.json().catch(() => ({}));
    const msg = Array.isArray(erro.message)
      ? erro.message.join(', ')
      : erro.message || 'Erro na requisicao';
    throw new Error(msg);
  }
  return resposta.json();
}

export const api = {
  post: <T>(rota: string, corpo: object) =>
    requisicao<T>(rota, { method: 'POST', body: JSON.stringify(corpo) }),
  get: <T>(rota: string) => requisicao<T>(rota, { method: 'GET' }),
  patch: <T>(rota: string, corpo: object) =>
    requisicao<T>(rota, { method: 'PATCH', body: JSON.stringify(corpo) }),
  delete: <T>(rota: string) => requisicao<T>(rota, { method: 'DELETE' }),
};
