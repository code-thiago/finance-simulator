import { useQuery } from "@tanstack/react-query";
import { fetchCotacaoAcao, fetchCotacaoCambio, CotacaoError, DadosAcao, DadosCambio, ResponseSucesso } from "./client";

export function useCotacaoAcao(ticker: string) {
  return useQuery<ResponseSucesso<DadosAcao>, CotacaoError>({
    queryKey: ["cotacao-acao", ticker],
    queryFn: () => fetchCotacaoAcao(ticker),
    staleTime: 1 * 60 * 1000, // 1 minuto (ações variam mais frequentemente)
    refetchOnWindowFocus: false, // Evita chamadas extras ao mudar de aba/foco
    retry: (failureCount, error) => {
      // Sem retry automático para símbolos inválidos
      if (error instanceof CotacaoError && error.tipo === "SIMBOLO_INVALIDO") {
        return false;
      }
      // Permite até 3 tentativas adicionais para erros de rede e rate limit
      return failureCount < 3;
    },
    enabled: !!ticker?.trim(), // Só executa se o ticker não for vazio
  });
}

export function useCotacaoCambio(par: string) {
  return useQuery<ResponseSucesso<DadosCambio>, CotacaoError>({
    queryKey: ["cotacao-cambio", par],
    queryFn: () => fetchCotacaoCambio(par),
    staleTime: 5 * 60 * 1000, // 5 minutos (câmbio varia mais devagar e limite da API é baixo)
    refetchOnWindowFocus: false, // Evita chamadas extras para não estourar o free tier
    retry: (failureCount, error) => {
      // Sem retry automático para símbolos inválidos
      if (error instanceof CotacaoError && error.tipo === "SIMBOLO_INVALIDO") {
        return false;
      }
      // Permite até 3 tentativas adicionais para erros de rede e rate limit
      return failureCount < 3;
    },
    enabled: !!par?.trim(), // Só executa se o par não for vazio
  });
}
