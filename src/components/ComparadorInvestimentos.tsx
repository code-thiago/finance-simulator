"use client";

import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  compararInvestimentos,
  ResultadoInvestimento,
} from "../core/comparadorInvestimentos";

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

  // Validação estrita na UI para evitar propagar erros para a função core
  const isValid =
    !isNaN(valorInicial) &&
    valorInicial >= 0 &&
    !isNaN(periodo) &&
    periodo > 0 &&
    !isNaN(periodoMeses) &&
    periodoMeses > 0 &&
    !isNaN(taxaSelicAnual) &&
    taxaSelicAnual >= 0 &&
    !isNaN(percentualCDI) &&
    percentualCDI >= 0;

  let resultados: ResultadoInvestimento[] = [];
  if (isValid) {
    try {
      resultados = compararInvestimentos({
        valorInicial,
        periodoMeses,
        taxaSelicAnual,
        percentualCDI,
      });
    } catch {
      resultados = [];
    }
  }

  // Se for inválido, exibe estado zerado
  const produtosOrdemPadrao = ["CDB", "TESOURO_SELIC", "POUPANCA"] as const;
  const resultadosExibicao =
    isValid && resultados.length > 0
      ? resultados
      : produtosOrdemPadrao.map((p) => ({
          produto: p,
          valorBruto: 0,
          valorLiquido: 0,
          rendimentoLiquido: 0,
          aliquotaIR: p === "POUPANCA" ? null : 0,
        }));

  // Preparar dados do gráfico
  const dadosGrafico = resultadosExibicao.map((r) => {
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

  // Formatador de Moeda
  const formatarMoeda = (val: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(val);
  };

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
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Comparador de Investimentos
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-1">
          Compare de forma simples a rentabilidade líquida do CDB, Tesouro Selic e Poupança.
        </p>
      </div>

      {/* Grid Principal: Formulário à esquerda, cards e gráfico à direita */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Lado Esquerdo: Formulário */}
        <div className="lg:col-span-5 flex flex-col gap-6 w-full">
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-border dark:border-zinc-800 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider border-b border-zinc-100 dark:border-zinc-800 pb-2">
              Configurações da Comparação
            </h2>

            {/* Campo: Valor Inicial */}
            <div className="space-y-1.5">
              <label
                htmlFor="valorInicial"
                className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block"
              >
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

            {/* Campo: Período */}
            <div className="space-y-1.5">
              <label
                htmlFor="periodo"
                className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block"
              >
                Período da Aplicação
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
                        ? "bg-ring text-white"
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
                        ? "bg-ring text-white"
                        : "text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-800"
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
                className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block"
              >
                Taxa Selic Anual (%)
              </label>
              <div className="relative rounded-lg border border-border dark:border-zinc-800 overflow-hidden focus-within:ring-2 focus-within:ring-ring dark:focus-within:ring-indigo-500/50 focus-within:border-transparent transition-all">
                <input
                  id="taxaSelic"
                  type="number"
                  min="0"
                  step="any"
                  placeholder="0,00"
                  value={taxaSelicAnualStr}
                  onChange={(e) => setTaxaSelicAnualStr(e.target.value)}
                  className="w-full bg-white dark:bg-zinc-950 px-3 py-2.5 text-base font-semibold text-zinc-900 dark:text-zinc-50 focus:outline-none placeholder:text-zinc-300 dark:placeholder:text-zinc-700"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400 font-semibold select-none">
                  % a.a.
                </span>
              </div>
            </div>

            {/* Campo: Percentual do CDI */}
            <div className="space-y-1.5">
              <label
                htmlFor="percentualCDI"
                className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block"
              >
                Percentual do CDI (%)
              </label>
              <div className="relative rounded-lg border border-border dark:border-zinc-800 overflow-hidden focus-within:ring-2 focus-within:ring-ring dark:focus-within:ring-indigo-500/50 focus-within:border-transparent transition-all">
                <input
                  id="percentualCDI"
                  type="number"
                  min="0"
                  step="any"
                  placeholder="100"
                  value={percentualCDIStr}
                  onChange={(e) => setPercentualCDIStr(e.target.value)}
                  className="w-full bg-white dark:bg-zinc-950 px-3 py-2.5 text-base font-semibold text-zinc-900 dark:text-zinc-50 focus:outline-none placeholder:text-zinc-300 dark:placeholder:text-zinc-700"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400 font-semibold select-none">
                  % do CDI
                </span>
              </div>
            </div>
          </div>

          {/* Aviso de erro ou validação */}
          {!isValid && (
            <div className="text-xs text-indigo-600 dark:text-indigo-400 bg-indigo-50/30 dark:bg-indigo-950/20 p-3.5 rounded-xl border border-indigo-100/50 dark:border-indigo-950/30 font-medium">
              ⚠️ Preencha todos os campos com valores válidos (maiores ou iguais a zero) para visualizar a comparação.
            </div>
          )}
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
                  className={`relative bg-white dark:bg-zinc-900 rounded-2xl shadow-sm transition-all duration-300 flex flex-col overflow-hidden border ${
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
                      <span className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
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
                      <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">
                        Valor Líquido
                      </span>
                      <div
                        className={`text-xl font-extrabold font-mono tracking-tight mt-0.5 tabular-nums ${
                          isBest
                            ? "text-ring dark:text-indigo-400"
                            : "text-zinc-900 dark:text-zinc-50"
                        }`}
                      >
                        {formatarMoeda(r.valorLiquido)}
                      </div>
                    </div>

                    {/* Detalhes menores */}
                    <div className="border-t border-zinc-100 dark:border-zinc-800/80 pt-3 mt-auto space-y-1.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-zinc-400">Valor Bruto:</span>
                        <span className="font-semibold text-zinc-700 dark:text-zinc-300 font-mono tabular-nums">
                          {formatarMoeda(r.valorBruto)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-400">Rendimento Líq.:</span>
                        <span className="font-semibold text-zinc-700 dark:text-zinc-300 font-mono tabular-nums">
                          {formatarMoeda(r.rendimentoLiquido)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-400">Alíquota IR:</span>
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

          {/* Gráfico Comparativo */}
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-border dark:border-zinc-800 shadow-sm flex flex-col h-[350px]">
            <div className="mb-4">
              <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">
                Comparação de Valor Líquido
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Valores acumulados após o período simulado.
              </p>
            </div>

            <div className="flex-1 w-full min-h-0">
              {isMounted ? (
                isValid ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={dadosGrafico}
                      margin={{ top: 10, right: 10, left: -10, bottom: 5 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="var(--border)"
                        className="dark:opacity-10"
                      />
                      <XAxis
                        dataKey="name"
                        stroke="#A1A1AA"
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                        dy={8}
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
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-white/95 dark:bg-zinc-950/95 backdrop-blur-sm p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-xl text-xs space-y-2">
                                <p className="font-bold text-zinc-950 dark:text-zinc-50 border-b border-zinc-100 dark:border-zinc-800 pb-1">
                                  {data.name}
                                </p>
                                <div className="space-y-1 font-mono">
                                  <div className="flex justify-between gap-6">
                                    <span className="text-zinc-500 dark:text-zinc-400">
                                      Valor Bruto:
                                    </span>
                                    <span className="font-bold tabular-nums text-zinc-900 dark:text-zinc-100">
                                      {formatarMoeda(data.valorBruto)}
                                    </span>
                                  </div>
                                  <div className="flex justify-between gap-6 border-t border-zinc-100 dark:border-zinc-800 pt-1 font-bold">
                                    <span className="text-zinc-800 dark:text-zinc-200">
                                      Valor Líquido:
                                    </span>
                                    <span className="tabular-nums text-ring dark:text-indigo-400">
                                      {formatarMoeda(data.valorLiquido)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar dataKey="valorLiquido" radius={[6, 6, 0, 0]}>
                        {dadosGrafico.map((entry, index) => {
                          const color = obterCorProduto(entry.produto);
                          return <Cell key={`cell-${index}`} fill={color} />;
                        })}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-50/50 dark:bg-zinc-950/20 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl p-6 text-center">
                    <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">
                      Preencha os dados
                    </p>
                    <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1 max-w-xs">
                      Insira as configurações de comparação para visualizar o gráfico.
                    </p>
                  </div>
                )
              ) : (
                <div className="w-full h-full bg-zinc-50/50 dark:bg-zinc-950/20 animate-pulse rounded-xl" />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
