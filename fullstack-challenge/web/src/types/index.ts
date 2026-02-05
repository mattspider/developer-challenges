export interface Usuario {
  id: string;
  email: string;
}

export interface Maquina {
  id: string;
  nome: string;
  tipo: string;
  usuarioId: string;
  pontosMonitoramento?: PontoMonitoramento[];
}

export interface PontoMonitoramento {
  id: string;
  nome: string;
  maquinaId: string;
  maquina?: Maquina;
  sensores?: Sensor[];
}

export interface Sensor {
  id: string;
  identificadorUnico: string;
  modelo: string;
  pontoMonitoramentoId: string;
}

export interface PontoCompleto {
  id: string;
  nomePonto: string;
  nomeMaquina: string;
  tipoMaquina: string;
  modeloSensor: string | null;
}

export interface RespostaPontos {
  itens: PontoCompleto[];
  total: number;
  pagina: number;
  totalPaginas: number;
}
