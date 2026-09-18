"use client";

import React, { useState, useEffect } from "react";
import { useCotacaoAcao, useCotacaoCambio } from "../api/hooks";
import { CotacaoError } from "../api/client";
import { formatarReal } from "@/src/lib/formatters";

// Formata o ISO string retornado na resposta para "HH:MM"
function formatarHora(isoString?: string) {
  if (!isoString) return "";
  try {
    const data = new Date(isoString);
    const horas = String(data.getHours()).padStart(2, "0");
    const minutos = String(data.getMinutes()).padStart(2, "0");
    return `${horas}:${minutos}`;
  } catch {
    return "";
  }
}

export default function CotacaoWidget() {
  const [tickerInput, setTickerInput] = useState("PETR4");
  const [debouncedTicker, setDebouncedTicker] = useState("PETR4");

  // Debounce do input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedTicker(tickerInput.trim().toUpperCase());
    }, 500);
    return () => clearTimeout(handler);
  }, [tickerInput]);

  // Chamada de Hooks
  const {
    data: acaoRes,
    isLoading: acaoLoading,
    error: acaoError,
    isFetching: acaoFetching,
  } = useCotacaoAcao(debouncedTicker);

  const {
    data: cambioRes,
    isLoading: cambioLoading,
    error: cambioError,
  } = useCotacaoCambio("USD-BRL");

  // Função para retornar a mensagem de erro formatada
  const getMensagemErro = (err: unknown) => {
    if (err instanceof CotacaoError || (err && typeof err === "object" && "tipo" in err)) {
      const cotacaoErr = err as { tipo: string };
      switch (cotacaoErr.tipo) {
        case "SIMBOLO_INVALIDO":
          return "Ticker não encontrado. Verifique o código.";
        case "RATE_LIMIT":
          return "Limite de requisições atingido. Tente novamente em instantes.";
        case "ERRO_REDE":
          return "Falha de conexão. Tente novamente.";
        case "ERRO_DESCONHECIDO":
        default:
          return "Erro ao buscar cotação.";
      }
    }
    return "Erro ao buscar cotação.";
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 md:px-8 mb-6 mt-2">
      <div className="bg-card rounded-2xl border border-border dark:border-zinc-800 shadow-sm p-4 flex flex-col md:flex-row gap-6 md:items-center justify-between w-full">

        {/* Seção da Ação */}
        <div className="flex-1 flex flex-col sm:flex-row items-start sm:items-center gap-4 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider select-none">
              Ação
            </span>
            <div className="relative">
              <input
                type="text"
                value={tickerInput}
                onChange={(e) => setTickerInput(e.target.value)}
                placeholder="Ticker"
                className="w-24 uppercase font-extrabold text-sm px-2.5 py-1.5 bg-muted border border-border dark:border-zinc-800 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring dark:focus:ring-indigo-500/50 focus:border-transparent transition-all tracking-wider"
              />
              {acaoFetching && (
                <div className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 border-2 border-zinc-300 dark:border-zinc-700 border-t-indigo-500 rounded-full animate-spin" />
              )}
            </div>
          </div>

          <div className="flex-1 min-w-0 flex flex-col justify-center min-h-[36px]">
            {acaoLoading ? (
              <div className="animate-pulse flex gap-2 items-center">
                <div className="h-6 w-20 bg-zinc-200 dark:bg-zinc-800 rounded" />
                <div className="h-4 w-12 bg-zinc-200 dark:bg-zinc-800 rounded" />
                <div className="h-4 w-28 bg-zinc-200 dark:bg-zinc-800 rounded" />
              </div>
            ) : acaoError ? (
              <span className="text-xs font-semibold text-rose-500 dark:text-rose-400">
                {getMensagemErro(acaoError)}
              </span>
            ) : acaoRes?.dados ? (
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
                <span className="text-lg font-extrabold font-mono text-foreground tabular-nums">
                  {formatarReal(acaoRes.dados.preco)}
                </span>

                {/* Variação em Verde ou Vermelho */}
                <span
                  className={`text-xs font-extrabold font-mono tabular-nums ${acaoRes.dados.variacao > 0
                      ? "text-emerald-600 dark:text-emerald-400"
                      : acaoRes.dados.variacao < 0
                        ? "text-rose-600 dark:text-rose-400"
                        : "text-muted-foreground"
                    }`}
                >
                  {acaoRes.dados.variacao > 0 ? "+" : ""}
                  {formatarReal(acaoRes.dados.variacao)} ({acaoRes.dados.variacaoPercentual > 0 ? "+" : ""}
                  {acaoRes.dados.variacaoPercentual.toFixed(2)}%)
                </span>

                <span className="text-xs font-semibold text-muted-foreground truncate max-w-[200px]" title={acaoRes.dados.nome}>
                  {acaoRes.dados.nome}
                </span>

                <span className="text-[10px] text-muted-foreground font-medium">
                  • Atualizado às {formatarHora(acaoRes.atualizadoEm)}
                </span>
              </div>
            ) : (
              <span className="text-xs text-muted-foreground">Digite um ticker para buscar.</span>
            )}
          </div>
        </div>

        {/* Divisor Vertical - oculto no mobile */}
        <div className="hidden md:block w-px h-8 bg-zinc-100 dark:bg-zinc-800/80 self-center" />

        {/* Seção do Câmbio */}
        <div className="flex-1 md:max-w-xs flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider select-none">
              Câmbio
            </span>
            <span className="px-2 py-1 bg-muted border border-border dark:border-zinc-800 rounded-lg text-xs font-extrabold text-zinc-700 dark:text-zinc-300 select-none">
              USD/BRL
            </span>
          </div>

          <div className="flex-1 flex flex-col items-end justify-center min-h-[36px]">
            {cambioLoading ? (
              <div className="animate-pulse flex gap-2 items-center">
                <div className="h-6 w-16 bg-zinc-200 dark:bg-zinc-800 rounded" />
                <div className="h-4 w-12 bg-zinc-200 dark:bg-zinc-800 rounded" />
              </div>
            ) : cambioError ? (
              <span className="text-xs font-semibold text-rose-500 dark:text-rose-400 text-right">
                {getMensagemErro(cambioError)}
              </span>
            ) : cambioRes?.dados ? (
              <div className="flex flex-col items-end">
                <div className="flex items-baseline gap-2">
                  <span className="text-lg font-extrabold font-mono text-foreground tabular-nums">
                    {formatarReal(cambioRes.dados.taxa)}
                  </span>
                </div>
                <span className="text-[10px] text-muted-foreground font-medium mt-0.5">
                  Atualizado às {formatarHora(cambioRes.atualizadoEm)}
                </span>
              </div>
            ) : null}
          </div>
        </div>

      </div>
    </div>
  );
}
