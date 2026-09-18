"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  compararInvestimentos,
  ResultadoInvestimento,
} from "../core/comparadorInvestimentos";
import { formatarMoeda } from "@/src/lib/formatters";
import BlocoSalvarSimulacao from "./BlocoSalvarSimulacao";
import GraficoComparacao, { ItemDadoGraficoComparacao } from "./GraficoComparacao";

const VALOR_MAXIMO = 1_000_000_000; // R$ 1 bilhão
const TAXA_MAXIMA = 100; // 100% a.a.
const PERIODO_MAXIMO_MESES = 1200; // 100 anos
const PERCENTUAL_CDI_MAXIMO = 1000; // 1000% do CDI
const RESULTADO_MAXIMO_EXIBIVEL = 1_000_000_000_000_000; // R$ 1 quatrilhão

export default function ComparadorInvestimentos() {
  const [isMounted, setIsMounted] = useState(false);

  // Estados dos inputs gerenciados como string para digitação fluida
  const [valorInicialStr, setValorInicialStr] = useState<string>("10000");
  const [periodoStr, setPeriodoStr] = useState<string>("12");
  const [periodoUnidade, setPeriodoUnidade] = useState<"meses" | "anos">("meses");
  const [taxaSelicAnualStr, setTaxaSelicAnualStr] = useState<string>("10.75");
  const [percentualCDIStr, setPercentualCDIStr] = useState<string>("100");

  // Ativar montagem no client para evitar hydration mismatch no Recharts
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Parsing numérico com fallback seguro
  const valorInicial = valorInicialStr === "" ? 0 : parseFloat(valorInicialStr);
  const periodo = periodoStr === "" ? 0 : parseFloat(periodoStr);
  const taxaSelicAnual = taxaSelicAnualStr === "" ? 0 : parseFloat(taxaSelicAnualStr);
  const percentualCDI = percentualCDIStr === "" ? 0 : parseFloat(percentualCDIStr);

  // Conversão de período para meses
  const periodoMeses = Math.round(
    periodoUnidade === "anos" ? periodo * 12 : periodo
  );

  // Validação estrita de entrada na UI para evitar propagar erros para a função core
  const isInputValid =
    !isNaN(valorInicial) &&
    valorInicial >= 0 &&
    valorInicial <= VALOR_MAXIMO &&
    !isNaN(periodo) &&
    periodo > 0 &&
    !isNaN(periodoMeses) &&
    periodoMeses > 0 &&
    periodoMeses <= PERIODO_MAXIMO_MESES &&
    !isNaN(taxaSelicAnual) &&
    taxaSelicAnual >= 0 &&
    taxaSelicAnual <= TAXA_MAXIMA &&
    !isNaN(percentualCDI) &&
    percentualCDI >= 0 &&
    percentualCDI <= PERCENTUAL_CDI_MAXIMO;

  // Memoização do cálculo de comparação de investimentos
  const resultadosCalculados: ResultadoInvestimento[] = useMemo(() => {
    if (!isInputValid) return [];
    try {
      return compararInvestimentos({
        valorInicial,
        periodoMeses,
        taxaSelicAnual,
        percentualCDI,
      });
    } catch {
      return [];
    }
  }, [valorInicial, periodoMeses, taxaSelicAnual, percentualCDI, isInputValid]);

  // Verificar se o maior valor líquido excede o teto exibível ou resulta em overflow
  const maiorValorLiquido = useMemo(() => {
    if (resultadosCalculados.length === 0) return 0;
    return Math.max(...resultadosCalculados.map((r) => r.valorLiquido));
  }, [resultadosCalculados]);

  const resultadoExcedeLimite =
    maiorValorLiquido > RESULTADO_MAXIMO_EXIBIVEL ||
    !Number.isFinite(maiorValorLiquido);

  const isValid = isInputValid && !resultadoExcedeLimite;
  const resultados = useMemo(
    () => (isValid ? resultadosCalculados : []),
    [isValid, resultadosCalculados]
  );

  // Se for inválido, exibe estado zerado memoizado
  const resultadosExibicao: ResultadoInvestimento[] = useMemo(() => {
    if (isValid && resultados.length > 0) {
      return resultados;
    }
    const produtosOrdemPadrao = ["CDB", "TESOURO_SELIC", "POUPANCA"] as const;
    return produtosOrdemPadrao.map((p) => ({
      produto: p,
      valorBruto: 0,
      valorLiquido: 0,
      rendimentoLiquido: 0,
      aliquotaIR: p === "POUPANCA" ? null : 0,
    }));
  }, [isValid, resultados]);

  // Preparar dados do gráfico com memoização
  const dadosGrafico: ItemDadoGraficoComparacao[] = useMemo(() => {
    return resultadosExibicao.map((r) => {
      let name = "CDB";
      if (r.produto === "TESOURO_SELIC") name = "Tesouro Selic";
      else if (r.produto === "POUPANCA") name = "Poupança";

      return {
        name,
        produto: r.produto,
        valorLiquido: r.valorLiquido,
        valorBruto: r.valorBruto,
      };
    });
  }, [resultadosExibicao]);

  // Parâmetros memoizados para salvar comparação
  const parametrosSalvar = useMemo(() => ({
    valorInicial,
    periodo,
    periodoUnidade,
    periodoMeses,
    taxaSelicAnual,
    percentualCDI,
  }), [valorInicial, periodo, periodoUnidade, periodoMeses, taxaSelicAnual, percentualCDI]);

  const formatarNomeProduto = (produto: "CDB" | "TESOURO_SELIC" | "POUPANCA") => {
    switch (produto) {
      case "CDB":
        return "CDB";
      case "TESOURO_SELIC":
        return "Tesouro Selic";
      case "POUPANCA":
        return "Poupança";
    }
  };

  // Cores de cada produto
  const obterCorProduto = (produto: "CDB" | "TESOURO_SELIC" | "POUPANCA") => {
    switch (produto) {
      case "CDB":
        return "var(--chart-2)";
      case "TESOURO_SELIC":
        return "var(--chart-4)";
      case "POUPANCA":
        return "var(--chart-5)";
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col gap-8 p-4 md:p-8">
      {/* Cabeçalho */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Comparador de Investimentos
        </h1>
        <p className="text-muted-foreground mt-1">
          Compare de forma simples a rentabilidade líquida do CDB, Tesouro Selic e Poupança.
        </p>
      </div>

      {/* Grid Principal: Formulário à esquerda, cards e gráfico à direita */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Lado Esquerdo: Formulário */}
        <div className="lg:col-span-5 flex flex-col gap-6 w-full">
          <div className="bg-card p-6 rounded-2xl border border-border dark:border-zinc-800 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-foreground uppercase tracking-wider border-b border-border pb-2">
              Configurações da Comparação
            </h2>

            {/* Campo: Valor Inicial */}
            <div className="space-y-1.5">
              <label
                htmlFor="valorInicial"
                className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block"
              >
                Valor Inicial (R$)
              </label>
              <div className="relative rounded-lg border border-border dark:border-zinc-800 overflow-hidden focus-within:ring-2 focus-within:ring-ring dark:focus-within:ring-indigo-500/50 focus-within:border-transparent transition-all">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium select-none">
                  R$
                </span>
                <input
                  id="valorInicial"
                  type="number"
                  min="0"
                  max={VALOR_MAXIMO}
                  step="any"
                  placeholder="0,00"
                  value={valorInicialStr}
                  onChange={(e) => setValorInicialStr(e.target.value)}
                  className="w-full bg-muted pl-9 pr-3 py-2.5 text-base font-semibold text-foreground focus:outline-none placeholder:text-zinc-300 dark:placeholder:text-zinc-700"
                />
              </div>
            </div>

            {/* Campo: Período */}
            <div className="space-y-1.5">
              <label
                htmlFor="periodo"
                className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block"
              >
                Período da Aplicação
              </label>
              <div className="flex rounded-lg border border-border dark:border-zinc-800 overflow-hidden focus-within:ring-2 focus-within:ring-ring dark:focus-within:ring-indigo-500/50 focus-within:border-transparent transition-all bg-muted">
                <input
                  id="periodo"
                  type="number"
                  min="0"
                  max={periodoUnidade === "anos" ? PERIODO_MAXIMO_MESES / 12 : PERIODO_MAXIMO_MESES}
                  step="any"
                  placeholder="0"
                  value={periodoStr}
                  onChange={(e) => setPeriodoStr(e.target.value)}
                  className="w-full min-w-0 bg-transparent px-3 py-2.5 text-base font-semibold text-foreground focus:outline-none placeholder:text-zinc-300 dark:placeholder:text-zinc-700"
                />
                <div className="flex items-center gap-1 border-l border-border dark:border-zinc-800 px-2 py-1 bg-muted select-none">
                  <button
                    type="button"
                    onClick={() => setPeriodoUnidade("meses")}
                    className={`px-2 py-1 text-[10px] font-bold rounded transition-colors ${
                      periodoUnidade === "meses"
                        ? "bg-ring text-white"
                        : "text-muted-foreground hover:bg-zinc-200 dark:hover:bg-zinc-800"
                    }`}
                  >
                    Meses
                  </button>
                  <button
                    type="button"
                    onClick={() => setPeriodoUnidade("anos")}
                    className={`px-2 py-1 text-[10px] font-bold rounded transition-colors ${
                      periodoUnidade === "anos"
                        ? "bg-ring text-white"
                        : "text-muted-foreground hover:bg-zinc-200 dark:hover:bg-zinc-800"
                    }`}
                  >
                    Anos
                  </button>
                </div>
              </div>
            </div>

            {/* Campo: Taxa Selic Anual */}
            <div className="space-y-1.5">
              <label
                htmlFor="taxaSelic"
                className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block"
              >
                Taxa Selic Anual (%)
              </label>
              <div className="relative rounded-lg border border-border dark:border-zinc-800 overflow-hidden focus-within:ring-2 focus-within:ring-ring dark:focus-within:ring-indigo-500/50 focus-within:border-transparent transition-all">
                <input
                  id="taxaSelic"
                  type="number"
                  min="0"
                  max={TAXA_MAXIMA}
                  step="any"
                  placeholder="0,00"
                  value={taxaSelicAnualStr}
                  onChange={(e) => setTaxaSelicAnualStr(e.target.value)}
                  className="w-full bg-muted px-3 py-2.5 text-base font-semibold text-foreground focus:outline-none placeholder:text-zinc-300 dark:placeholder:text-zinc-700"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-semibold select-none">
                  % a.a.
                </span>
              </div>
            </div>

            {/* Campo: Percentual do CDI */}
            <div className="space-y-1.5">
              <label
                htmlFor="percentualCDI"
                className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block"
              >
                Percentual do CDI (%)
              </label>
              <div className="relative rounded-lg border border-border dark:border-zinc-800 overflow-hidden focus-within:ring-2 focus-within:ring-ring dark:focus-within:ring-indigo-500/50 focus-within:border-transparent transition-all">
                <input
                  id="percentualCDI"
                  type="number"
                  min="0"
                  max={PERCENTUAL_CDI_MAXIMO}
                  step="any"
                  placeholder="100"
                  value={percentualCDIStr}
                  onChange={(e) => setPercentualCDIStr(e.target.value)}
                  className="w-full bg-muted px-3 py-2.5 text-base font-semibold text-foreground focus:outline-none placeholder:text-zinc-300 dark:placeholder:text-zinc-700"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-semibold select-none">
                  % do CDI
                </span>
              </div>
            </div>
          </div>

          {/* Aviso de erro ou validação */}
          {!isValid && (
            <div className="text-xs text-indigo-600 dark:text-indigo-400 bg-indigo-50/30 dark:bg-indigo-950/20 p-3.5 rounded-xl border border-indigo-100/50 dark:border-indigo-950/30 font-medium">
              ⚠️ Insira um período válido (maior que 0 e até 100 anos), taxa Selic entre 0% e 100%, CDI até 1000% e valores até R$ 1 bilhão para simular. Se o resultado for maior que R$ 1 quatrilhão, reduza os valores de entrada.
            </div>
          )}

          {/* Bloco de Salvar Simulação (isolado em componente próprio para não re-renderizar o pai) */}
          <BlocoSalvarSimulacao
            tipo="comparador"
            parametros={parametrosSalvar}
            isValid={isValid}
          />
        </div>

        {/* Lado Direito: Resultados e Gráficos */}
        <div className="lg:col-span-7 flex flex-col gap-6 w-full">
          {/* Grid de Cards de Resultados */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {resultadosExibicao.map((r, index) => {
              const isBest = isValid && index === 0;
              const accentColor = obterCorProduto(r.produto);

              return (
                <div
                  key={r.produto}
                  className={`relative bg-card rounded-2xl shadow-sm transition-all duration-300 flex flex-col overflow-hidden border ${
                    isBest
                      ? "border-ring dark:border-indigo-500 shadow-md scale-[1.02]"
                      : "border-border dark:border-zinc-800"
                  }`}
                >
                  {/* Top Bar com a cor do produto */}
                  <div
                    className="h-1.5 w-full"
                    style={{ backgroundColor: accentColor }}
                  />

                  <div className="p-5 flex flex-col flex-1 gap-3">
                    {/* Linha superior: Nome do Produto + Badge de destaque */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-bold text-foreground">
                        {formatarNomeProduto(r.produto)}
                      </span>
                      {isBest && (
                        <span className="px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider rounded bg-ring/10 dark:bg-indigo-500/20 text-ring dark:text-indigo-400 border border-ring/10 dark:border-indigo-500/20">
                          Melhor Opção
                        </span>
                      )}
                    </div>

                    {/* Destaque: Valor Líquido */}
                    <div>
                      <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">
                        Valor Líquido
                      </span>
                      <div
                        className={`text-xl font-extrabold font-mono tracking-tight mt-0.5 tabular-nums ${
                          isBest
                            ? "text-ring dark:text-indigo-400"
                            : "text-foreground"
                        }`}
                      >
                        {formatarMoeda(r.valorLiquido)}
                      </div>
                    </div>

                    {/* Detalhes menores */}
                    <div className="border-t border-border pt-3 mt-auto space-y-1.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Valor Bruto:</span>
                        <span className="font-semibold text-zinc-700 dark:text-zinc-300 font-mono tabular-nums">
                          {formatarMoeda(r.valorBruto)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Rendimento Líq.:</span>
                        <span className="font-semibold text-zinc-700 dark:text-zinc-300 font-mono tabular-nums">
                          {formatarMoeda(r.rendimentoLiquido)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Alíquota IR:</span>
                        <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                          {r.aliquotaIR !== null ? `${r.aliquotaIR.toFixed(1)}%` : "Isento"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Gráfico Comparativo (memoizado) */}
          <GraficoComparacao
            dados={dadosGrafico}
            isValid={isValid}
            isMounted={isMounted}
          />
        </div>
      </div>
    </div>
  );
}
