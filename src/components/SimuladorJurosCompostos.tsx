"use client";

import React, { useState, useEffect, useMemo } from "react";
import { calcularJurosCompostos, PontoEvolucao } from "../core/jurosCompostos";
import { formatarMoeda } from "@/src/lib/formatters";
import BlocoSalvarSimulacao from "./BlocoSalvarSimulacao";
import GraficoEvolucao from "./GraficoEvolucao";

export default function SimuladorJurosCompostos() {
  const [isMounted, setIsMounted] = useState(false);

  // Estados dos inputs gerenciados como string para permitir edição fluida (ex: limpar o campo)
  const [valorInicialStr, setValorInicialStr] = useState<string>("1000");
  const [aporteMensalStr, setAporteMensalStr] = useState<string>("100");
  const [taxaAnualStr, setTaxaAnualStr] = useState<string>("12");
  const [periodoStr, setPeriodoStr] = useState<string>("5");
  const [periodoUnidade, setPeriodoUnidade] = useState<"meses" | "anos">("anos");

  // Ativar montagem no client para evitar mismatch de hidratação com o Recharts
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Parsing numérico com fallback seguro
  const valorInicial = valorInicialStr === "" ? 0 : parseFloat(valorInicialStr);
  const aporteMensal = aporteMensalStr === "" ? 0 : parseFloat(aporteMensalStr);
  const taxaAnual = taxaAnualStr === "" ? 0 : parseFloat(taxaAnualStr);
  const periodo = periodoStr === "" ? 0 : parseFloat(periodoStr);

  // Conversão de período para meses
  const periodoMeses = Math.round(
    periodoUnidade === "anos" ? periodo * 12 : periodo
  );

  // Validação estrita na UI para evitar propagar erros para a função core
  const isValid =
    !isNaN(valorInicial) &&
    valorInicial >= 0 &&
    !isNaN(aporteMensal) &&
    aporteMensal >= 0 &&
    !isNaN(taxaAnual) &&
    taxaAnual >= 0 &&
    !isNaN(periodo) &&
    periodo > 0 &&
    !isNaN(periodoMeses) &&
    periodoMeses > 0;

  // Memoização do cálculo de juros compostos
  const pontos: PontoEvolucao[] = useMemo(() => {
    if (!isValid) return [];
    try {
      return calcularJurosCompostos({
        valorInicial,
        aporteMensal,
        taxaAnual,
        periodoMeses,
      });
    } catch {
      // Falha silenciosa de segurança para a UI
      return [];
    }
  }, [valorInicial, aporteMensal, taxaAnual, periodoMeses, isValid]);

  // Prepara dados do gráfico injetando o ponto inicial (Mês 0) com memoização
  const dadosGrafico: PontoEvolucao[] = useMemo(() => {
    if (!isValid) return [];
    const pontoZero: PontoEvolucao = {
      mes: 0,
      valorInvestido: valorInicial,
      valorTotal: valorInicial,
      jurosAcumulados: 0,
    };
    return [pontoZero, ...pontos];
  }, [isValid, valorInicial, pontos]);

  // Valores de resumo derivados dos pontos calculados
  const valorFinalTotal = isValid && pontos.length > 0 ? pontos[pontos.length - 1].valorTotal : 0;
  const totalInvestido = isValid && pontos.length > 0 ? pontos[pontos.length - 1].valorInvestido : 0;
  const totalJuros = isValid && pontos.length > 0 ? pontos[pontos.length - 1].jurosAcumulados : 0;

  // Parâmetros memoizados para salvar simulação sem gerar novos objetos em re-renders desnecessários
  const parametrosSalvar = useMemo(() => ({
    valorInicial,
    aporteMensal,
    taxaAnual,
    periodo,
    periodoUnidade,
    periodoMeses,
  }), [valorInicial, aporteMensal, taxaAnual, periodo, periodoUnidade, periodoMeses]);

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col gap-8 p-4 md:p-8">
      {/* Cabeçalho */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Simulador de Juros Compostos
        </h1>
        <p className="text-muted-foreground mt-1">
          Projete o crescimento do seu patrimônio com aportes mensais e juros compostos.
        </p>
      </div>

      {/* Grid Principal: Lado a Lado no Desktop (lg:grid-cols-12), Coluna no Mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Lado Esquerdo: Resumo + Formulário */}
        <div className="lg:col-span-5 flex flex-col gap-6 w-full">
          
          {/* 2. Resumo em Destaque no Topo */}
          <div className="flex flex-col gap-4">
            {/* Card Principal: Valor Final */}
            <div className="bg-indigo-50/50 dark:bg-zinc-900/50 p-6 rounded-2xl border border-indigo-100 dark:border-zinc-800 transition-all duration-300">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                Valor Total Estimado
              </span>
              <div className="text-3xl font-bold font-mono tracking-tight text-indigo-900 dark:text-indigo-400 mt-1 tabular-nums">
                {formatarMoeda(valorFinalTotal)}
              </div>
            </div>

            {/* Grid dos Subcards */}
            <div className="grid grid-cols-2 gap-4">
              {/* Card Investido */}
              <div className="bg-card p-4 rounded-xl border-l-4 border-investido border-t border-r border-b border-zinc-100 dark:border-zinc-800 shadow-sm transition-all duration-300">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">
                  Total Investido
                </span>
                <div className="text-lg font-bold font-mono text-zinc-800 dark:text-zinc-200 mt-1 tabular-nums">
                  {formatarMoeda(totalInvestido)}
                </div>
              </div>

              {/* Card Juros */}
              <div className="bg-card p-4 rounded-xl border-l-4 border-juros border-t border-r border-b border-zinc-100 dark:border-zinc-800 shadow-sm transition-all duration-300">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">
                  Total em Juros
                </span>
                <div className="text-lg font-bold font-mono text-juros dark:text-indigo-400 mt-1 tabular-nums">
                  {formatarMoeda(totalJuros)}
                </div>
              </div>
            </div>
          </div>

          {/* 1. Formulário */}
          <div className="bg-card p-6 rounded-2xl border border-border dark:border-zinc-800 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider border-b border-zinc-100 dark:border-zinc-800 pb-2">
              Configurações do Investimento
            </h2>

            {/* Campo: Valor Inicial */}
            <div className="space-y-1.5">
              <label htmlFor="valorInicial" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                Valor Inicial (R$)
              </label>
              <div className="relative rounded-lg border border-border dark:border-zinc-800 overflow-hidden focus-within:ring-2 focus-within:ring-ring dark:focus-within:ring-indigo-500/50 focus-within:border-transparent transition-all">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400 font-medium select-none">
                  R$
                </span>
                <input
                  id="valorInicial"
                  type="number"
                  min="0"
                  step="any"
                  placeholder="0,00"
                  value={valorInicialStr}
                  onChange={(e) => setValorInicialStr(e.target.value)}
                  className="w-full bg-white dark:bg-zinc-950 pl-9 pr-3 py-2.5 text-base font-semibold text-foreground focus:outline-none placeholder:text-zinc-300 dark:placeholder:text-zinc-700"
                />
              </div>
            </div>

            {/* Campo: Aporte Mensal */}
            <div className="space-y-1.5">
              <label htmlFor="aporteMensal" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                Aporte Mensal (R$)
              </label>
              <div className="relative rounded-lg border border-border dark:border-zinc-800 overflow-hidden focus-within:ring-2 focus-within:ring-ring dark:focus-within:ring-indigo-500/50 focus-within:border-transparent transition-all">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400 font-medium select-none">
                  R$
                </span>
                <input
                  id="aporteMensal"
                  type="number"
                  min="0"
                  step="any"
                  placeholder="0,00"
                  value={aporteMensalStr}
                  onChange={(e) => setAporteMensalStr(e.target.value)}
                  className="w-full bg-white dark:bg-zinc-950 pl-9 pr-3 py-2.5 text-base font-semibold text-foreground focus:outline-none placeholder:text-zinc-300 dark:placeholder:text-zinc-700"
                />
              </div>
            </div>

            {/* Grid: Taxa de Juros e Período */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Campo: Taxa Anual */}
              <div className="space-y-1.5">
                <label htmlFor="taxaAnual" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                  Taxa de Juros Anual (%)
                </label>
                <div className="relative rounded-lg border border-border dark:border-zinc-800 overflow-hidden focus-within:ring-2 focus-within:ring-ring dark:focus-within:ring-indigo-500/50 focus-within:border-transparent transition-all">
                  <input
                    id="taxaAnual"
                    type="number"
                    step="any"
                    placeholder="0"
                    value={taxaAnualStr}
                    onChange={(e) => setTaxaAnualStr(e.target.value)}
                    className="w-full bg-white dark:bg-zinc-950 px-3 py-2.5 text-base font-semibold text-foreground focus:outline-none placeholder:text-zinc-300 dark:placeholder:text-zinc-700"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 font-medium select-none pointer-events-none">
                    % a.a.
                  </span>
                </div>
              </div>

              {/* Campo: Período com Toggle Integrado */}
              <div className="space-y-1.5">
                <label htmlFor="periodo" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                  Período
                </label>
                <div className="flex rounded-lg border border-border dark:border-zinc-800 overflow-hidden focus-within:ring-2 focus-within:ring-ring dark:focus-within:ring-indigo-500/50 focus-within:border-transparent transition-all bg-white dark:bg-zinc-950">
                  <input
                    id="periodo"
                    type="number"
                    min="0"
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
                          ? "bg-juros text-white"
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
                          ? "bg-juros text-white"
                          : "text-muted-foreground hover:bg-zinc-200 dark:hover:bg-zinc-800"
                      }`}
                    >
                      Anos
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Aviso de erro/validação amigável */}
            {!isValid && (
              <div className="text-xs text-indigo-600 dark:text-indigo-400 mt-2 bg-indigo-50/30 dark:bg-indigo-950/20 p-2.5 rounded-lg border border-indigo-100/50 dark:border-indigo-950/30 font-medium">
                ⚠️ Insira um período válido (maior que 0) e uma taxa de juros não negativa para simular.
              </div>
            )}
          </div>

          {/* Bloco de Salvar Simulação (isolado em componente próprio para não re-renderizar o pai) */}
          <BlocoSalvarSimulacao
            tipo="juros_compostos"
            parametros={parametrosSalvar}
            isValid={isValid}
          />
        </div>

        {/* Lado Direito: Gráfico de Evolução Patrimonial (memoizado) */}
        <div className="lg:col-span-7 w-full">
          <GraficoEvolucao
            dados={dadosGrafico}
            periodoUnidade={periodoUnidade}
            isMounted={isMounted}
          />
        </div>
      </div>
    </div>
  );
}
