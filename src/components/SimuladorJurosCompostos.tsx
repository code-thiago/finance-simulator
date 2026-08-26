"use client";

import React, { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { calcularJurosCompostos, PontoEvolucao } from "../core/jurosCompostos";
import { useSession } from "@/src/lib/auth-client";
import { useSalvarSimulacao } from "../api/useSalvarSimulacao";

export default function SimuladorJurosCompostos() {
  const [isMounted, setIsMounted] = useState(false);
  const { data: session } = useSession();
  const { salvar, salvando, sucesso, erro } = useSalvarSimulacao();
  const [nomeSimulacao, setNomeSimulacao] = useState("");

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

  let pontos: PontoEvolucao[] = [];
  if (isValid) {
    try {
      pontos = calcularJurosCompostos({
        valorInicial,
        aporteMensal,
        taxaAnual,
        periodoMeses,
      });
    } catch {
      // Falha silenciosa de segurança para a UI
      pontos = [];
    }
  }

  // Prepara dados do gráfico injetando o ponto inicial (Mês 0)
  const pontoZero: PontoEvolucao = {
    mes: 0,
    valorInvestido: valorInicial,
    valorTotal: valorInicial,
    jurosAcumulados: 0,
  };
  const dadosGrafico = isValid ? [pontoZero, ...pontos] : [];

  // Valores de resumo
  const valorFinalTotal = isValid && pontos.length > 0 ? pontos[pontos.length - 1].valorTotal : 0;
  const totalInvestido = isValid && pontos.length > 0 ? pontos[pontos.length - 1].valorInvestido : 0;
  const totalJuros = isValid && pontos.length > 0 ? pontos[pontos.length - 1].jurosAcumulados : 0;

  // Formatador monetário pt-BR
  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valor);
  };

  // Formatador do eixo X do gráfico
  const formatarEixoX = (mes: number) => {
    if (mes === 0) return "Início";
    if (periodoUnidade === "anos") {
      if (mes % 12 === 0) {
        const ano = mes / 12;
        return `${ano} ${ano === 1 ? "ano" : "anos"}`;
      }
      return "";
    }
    return `${mes}m`;
  };

  // Formatador da label do Tooltip
  const formatarLabelTooltip = (label: string | number | undefined) => {
    if (label === undefined || label === null) return "";
    const mes = Number(label);
    if (isNaN(mes)) return "";
    if (mes === 0) return "Início (Mês 0)";
    if (mes % 12 === 0) {
      const ano = mes / 12;
      return `Mês ${mes} (${ano} ${ano === 1 ? "ano" : "anos"})`;
    }
    return `Mês ${mes}`;
  };

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col gap-8 p-4 md:p-8">
      {/* Cabeçalho */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Simulador de Juros Compostos
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-1">
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
              <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">
                Valor Total Estimado
              </span>
              <div className="text-3xl font-bold font-mono tracking-tight text-indigo-900 dark:text-indigo-400 mt-1 tabular-nums">
                {formatarMoeda(valorFinalTotal)}
              </div>
            </div>

            {/* Grid dos Subcards */}
            <div className="grid grid-cols-2 gap-4">
              {/* Card Investido */}
              <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border-l-4 border-investido border-t border-r border-b border-zinc-100 dark:border-zinc-800 shadow-sm transition-all duration-300">
                <span className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">
                  Total Investido
                </span>
                <div className="text-lg font-bold font-mono text-zinc-800 dark:text-zinc-200 mt-1 tabular-nums">
                  {formatarMoeda(totalInvestido)}
                </div>
              </div>

              {/* Card Juros */}
              <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border-l-4 border-juros border-t border-r border-b border-zinc-100 dark:border-zinc-800 shadow-sm transition-all duration-300">
                <span className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">
                  Total em Juros
                </span>
                <div className="text-lg font-bold font-mono text-juros dark:text-indigo-400 mt-1 tabular-nums">
                  {formatarMoeda(totalJuros)}
                </div>
              </div>
            </div>
          </div>

          {/* 1. Formulário */}
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-border dark:border-zinc-800 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider border-b border-zinc-100 dark:border-zinc-800 pb-2">
              Configurações do Investimento
            </h2>

            {/* Campo: Valor Inicial */}
            <div className="space-y-1.5">
              <label htmlFor="valorInicial" className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">
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
                  className="w-full bg-white dark:bg-zinc-950 pl-9 pr-3 py-2.5 text-base font-semibold text-zinc-900 dark:text-zinc-50 focus:outline-none placeholder:text-zinc-300 dark:placeholder:text-zinc-700"
                />
              </div>
            </div>

            {/* Campo: Aporte Mensal */}
            <div className="space-y-1.5">
              <label htmlFor="aporteMensal" className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">
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
                  className="w-full bg-white dark:bg-zinc-950 pl-9 pr-3 py-2.5 text-base font-semibold text-zinc-900 dark:text-zinc-50 focus:outline-none placeholder:text-zinc-300 dark:placeholder:text-zinc-700"
                />
              </div>
            </div>

            {/* Grid: Taxa de Juros e Período */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Campo: Taxa Anual */}
              <div className="space-y-1.5">
                <label htmlFor="taxaAnual" className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">
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
                    className="w-full bg-white dark:bg-zinc-950 px-3 py-2.5 text-base font-semibold text-zinc-900 dark:text-zinc-50 focus:outline-none placeholder:text-zinc-300 dark:placeholder:text-zinc-700"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 font-medium select-none pointer-events-none">
                    % a.a.
                  </span>
                </div>
              </div>

              {/* Campo: Período com Toggle Integrado */}
              <div className="space-y-1.5">
                <label htmlFor="periodo" className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">
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
                    className="w-full min-w-0 bg-transparent px-3 py-2.5 text-base font-semibold text-zinc-900 dark:text-zinc-50 focus:outline-none placeholder:text-zinc-300 dark:placeholder:text-zinc-700"
                  />
                  <div className="flex items-center gap-1 border-l border-border dark:border-zinc-800 px-2 py-1 bg-zinc-50/50 dark:bg-zinc-900 select-none">
                    <button
                      type="button"
                      onClick={() => setPeriodoUnidade("meses")}
                      className={`px-2 py-1 text-[10px] font-bold rounded transition-colors ${
                        periodoUnidade === "meses"
                          ? "bg-juros text-white"
                          : "text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-800"
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
                          : "text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-800"
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

          {/* Bloco de Salvar Simulação (apenas para usuários logados e com simulação válida) */}
          {isValid && session?.user && (
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-border dark:border-zinc-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-2">
                <h2 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">
                  Salvar Simulação
                </h2>
                <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded-full">
                  Logado
                </span>
              </div>

              {sucesso && (
                <div
                  role="status"
                  className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 text-xs font-medium flex items-center gap-2"
                >
                  <svg
                    className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span>Simulação salva com sucesso!</span>
                </div>
              )}

              {erro && (
                <div
                  role="alert"
                  className="p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800/60 text-red-700 dark:text-red-300 text-xs font-medium"
                >
                  {erro}
                </div>
              )}

              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!isValid) return;
                  const res = await salvar({
                    tipo: "juros_compostos",
                    nome: nomeSimulacao,
                    parametros: {
                      valorInicial,
                      aporteMensal,
                      taxaAnual,
                      periodo,
                      periodoUnidade,
                      periodoMeses,
                    },
                  });
                  if (res.ok) {
                    setNomeSimulacao("");
                  }
                }}
                className="space-y-3"
              >
                <div className="space-y-1.5">
                  <label
                    htmlFor="nomeSimulacao"
                    className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block"
                  >
                    Nome da simulação (opcional)
                  </label>
                  <div className="relative rounded-lg border border-border dark:border-zinc-800 overflow-hidden focus-within:ring-2 focus-within:ring-ring dark:focus-within:ring-indigo-500/50 focus-within:border-transparent transition-all">
                    <input
                      id="nomeSimulacao"
                      type="text"
                      placeholder="Ex: Aposentadoria 10 anos"
                      value={nomeSimulacao}
                      onChange={(e) => setNomeSimulacao(e.target.value)}
                      className="w-full bg-white dark:bg-zinc-950 px-3.5 py-2 text-sm font-medium text-zinc-900 dark:text-zinc-50 focus:outline-none placeholder:text-zinc-300 dark:placeholder:text-zinc-700"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={salvando}
                  className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-bold uppercase tracking-wider shadow-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                >
                  {salvando ? (
                    <>
                      <svg
                        className="animate-spin h-3.5 w-3.5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v8H4z"
                        />
                      </svg>
                      <span>Salvando...</span>
                    </>
                  ) : (
                    "Salvar Simulação"
                  )}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Lado Direito: Gráfico de Evolução Patrimonial */}
        <div className="lg:col-span-7 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-border dark:border-zinc-800 shadow-sm flex flex-col w-full h-[480px]">
          {/* Custom Header que funciona como Legenda */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4 mb-4 gap-2">
            <div>
              <h3 className="font-bold text-zinc-950 dark:text-zinc-50">
                Evolução Patrimonial
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Comparativo da evolução patrimonial acumulada no período.
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold select-none">
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded-sm bg-investido border border-indigo-200 dark:border-transparent"></span>
                <span className="text-zinc-600 dark:text-zinc-400">Investido</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded-sm bg-juros"></span>
                <span className="text-zinc-600 dark:text-zinc-400">Juros</span>
              </div>
            </div>
          </div>

          {/* Gráfico Recharts com tratamento de SSR */}
          <div className="flex-1 w-full min-h-0">
            {isMounted ? (
              dadosGrafico.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={dadosGrafico}
                    margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" className="dark:opacity-10" />
                    <XAxis
                      dataKey="mes"
                      tickFormatter={formatarEixoX}
                      stroke="#A1A1AA"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      dy={10}
                    />
                    <YAxis
                      stroke="#A1A1AA"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(val) => {
                        if (val >= 1e6) return `R$ ${(val / 1e6).toFixed(1)}M`;
                        if (val >= 1e3) return `R$ ${(val / 1e3).toFixed(0)}k`;
                        return `R$ ${val}`;
                      }}
                      dx={-5}
                    />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-white/95 dark:bg-zinc-950/95 backdrop-blur-sm p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-xl text-xs space-y-2">
                              <p className="font-bold text-zinc-950 dark:text-zinc-50 border-b border-zinc-100 dark:border-zinc-800 pb-1">
                                {formatarLabelTooltip(label)}
                              </p>
                              <div className="space-y-1.5 font-mono">
                                <div className="flex justify-between gap-6">
                                  <span className="text-zinc-500 dark:text-zinc-400">Investido:</span>
                                  <span className="font-bold tabular-nums text-zinc-900 dark:text-zinc-100">
                                    {formatarMoeda(data.valorInvestido)}
                                  </span>
                                </div>
                                <div className="flex justify-between gap-6">
                                  <span className="text-zinc-500 dark:text-zinc-400">Juros:</span>
                                  <span className="font-bold tabular-nums text-juros dark:text-indigo-400">
                                    +{formatarMoeda(data.jurosAcumulados)}
                                  </span>
                                </div>
                                <div className="flex justify-between gap-6 border-t border-zinc-100 dark:border-zinc-800 pt-1.5 font-bold">
                                  <span className="text-zinc-800 dark:text-zinc-200">Total:</span>
                                  <span className="tabular-nums text-indigo-950 dark:text-indigo-300">
                                    {formatarMoeda(data.valorTotal)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    {/* Área Empilhada: "valorInvestido" embaixo e "jurosAcumulados" em cima */}
                    <Area
                      type="monotone"
                      dataKey="valorInvestido"
                      stackId="1"
                      stroke="var(--investido)"
                      fill="var(--investido)"
                      fillOpacity={0.85}
                    />
                    <Area
                      type="monotone"
                      dataKey="jurosAcumulados"
                      stackId="1"
                      stroke="var(--juros)"
                      fill="var(--juros)"
                      fillOpacity={0.9}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-50/50 dark:bg-zinc-950/20 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl p-6 text-center">
                  <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">
                    Nenhum dado para exibir
                  </p>
                  <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1 max-w-xs">
                    Preencha os valores do investimento à esquerda para gerar o gráfico de projeção.
                  </p>
                </div>
              )
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-zinc-50/50 dark:bg-zinc-900/50 rounded-xl animate-pulse">
                <span className="text-zinc-400 dark:text-zinc-500 text-xs font-semibold">
                  Carregando gráfico de evolução...
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
