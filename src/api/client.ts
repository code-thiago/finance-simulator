export interface ResponseSucesso<T> {
  sucesso: true;
  dados: T;
  atualizadoEm: string;
}

export interface ResponseErro {
  sucesso: false;
  erro: {
    tipo: "SIMBOLO_INVALIDO" | "RATE_LIMIT" | "ERRO_REDE" | "ERRO_DESCONHECIDO";
    mensagem: string;
  };
}

export type ApiResponse<T> = ResponseSucesso<T> | ResponseErro;

export interface DadosAcao {
  simbolo: string;
  nome: string;
  preco: number;
  variacao: number;
  variacaoPercentual: number;
  maxima: number;
  minima: number;
  volume: number;
}

export interface DadosCambio {
  origem: string;
  destino: string;
  taxa: number;
  bid: number;
  ask: number;
}

export class CotacaoError extends Error {
  tipo: "SIMBOLO_INVALIDO" | "RATE_LIMIT" | "ERRO_REDE" | "ERRO_DESCONHECIDO";

  constructor(tipo: "SIMBOLO_INVALIDO" | "RATE_LIMIT" | "ERRO_REDE" | "ERRO_DESCONHECIDO", mensagem: string) {
    super(mensagem);
    this.name = "CotacaoError";
    this.tipo = tipo;
  }
}

export async function fetchCotacaoAcao(ticker: string): Promise<ResponseSucesso<DadosAcao>> {
  try {
    const res = await fetch(`/api/cotacoes/acao?ticker=${encodeURIComponent(ticker)}`);
    const data: ApiResponse<DadosAcao> = await res.json();

    if (!data.sucesso) {
      throw new CotacaoError(data.erro.tipo, data.erro.mensagem);
    }

    return data;
  } catch (error) {
    if (error instanceof CotacaoError) {
      throw error;
    }
    throw new CotacaoError(
      "ERRO_REDE",
      error instanceof Error ? error.message : "Erro ao conectar-se à API local."
    );
  }
}

export async function fetchCotacaoCambio(par: string): Promise<ResponseSucesso<DadosCambio>> {
  try {
    const res = await fetch(`/api/cotacoes/cambio?par=${encodeURIComponent(par)}`);
    const data: ApiResponse<DadosCambio> = await res.json();

    if (!data.sucesso) {
      throw new CotacaoError(data.erro.tipo, data.erro.mensagem);
    }

    return data;
  } catch (error) {
    if (error instanceof CotacaoError) {
      throw error;
    }
    throw new CotacaoError(
      "ERRO_REDE",
      error instanceof Error ? error.message : "Erro ao conectar-se à API local."
    );
  }
}
