"use client";

import React, { memo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { PontoEvolucao } from "../core/jurosCompostos";
import { formatarMoeda } from "@/src/lib/formatters";

export interface GraficoEvolucaoProps {
  dados: PontoEvolucao[];
  periodoUnidade: "meses" | "anos";
  isMounted: boolean;
}

// Formatador do eixo X do gráfico
const criarFormatadorEixoX = (periodoUnidade: "meses" | "anos") => (mes: number) => {
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

// Formatador de valores no eixo Y
const formatarEixoY = (val: number) => {
  if (val >= 1e6) return `R$ ${(val / 1e6).toFixed(1)}M`;
  if (val >= 1e3) return `R$ ${(val / 1e3).toFixed(0)}k`;
  return `R$ ${val}`;
};

export const GraficoEvolucao = memo(function GraficoEvolucao({
  dados,
  periodoUnidade,
  isMounted,
}: GraficoEvolucaoProps) {
  const formatarEixoX = criarFormatadorEixoX(periodoUnidade);

  return (
    <div className="bg-card p-6 rounded-2xl border border-border dark:border-zinc-800 shadow-sm flex flex-col w-full h-[480px]">
      {/* Custom Header que funciona como Legenda */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-border pb-4 mb-4 gap-2">
        <div>
          <h3 className="font-bold text-foreground">
            Evolução Patrimonial
          </h3>
          <p className="text-xs text-muted-foreground">
            Comparativo da evolução patrimonial acumulada no período.
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs font-semibold select-none">
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-sm bg-investido border border-indigo-200 dark:border-transparent"></span>
            <span className="text-muted-foreground">Investido</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-sm bg-juros"></span>
            <span className="text-muted-foreground">Juros</span>
          </div>
        </div>
      </div>

      {/* Gráfico Recharts com tratamento de SSR */}
      <div className="flex-1 w-full min-h-0">
        {isMounted ? (
          dados.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={dados}
                margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--border)"
                  className="dark:opacity-10"
                />
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
                  tickFormatter={formatarEixoY}
                  dx={-5}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-card/95 backdrop-blur-sm p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-xl text-xs space-y-2">
                          <p className="font-bold text-foreground border-b border-border pb-1">
                            {formatarLabelTooltip(label)}
                          </p>
                          <div className="space-y-1.5 font-mono">
                            <div className="flex justify-between gap-6">
                              <span className="text-muted-foreground">
                                Investido:
                              </span>
                              <span className="font-bold tabular-nums text-foreground">
                                {formatarMoeda(data.valorInvestido)}
                              </span>
                            </div>
                            <div className="flex justify-between gap-6">
                              <span className="text-muted-foreground">
                                Juros:
                              </span>
                              <span className="font-bold tabular-nums text-juros dark:text-indigo-400">
                                +{formatarMoeda(data.jurosAcumulados)}
                              </span>
                            </div>
                            <div className="flex justify-between gap-6 border-t border-border pt-1.5 font-bold">
                              <span className="text-foreground">
                                Total:
                              </span>
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
            <div className="w-full h-full flex flex-col items-center justify-center bg-muted border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl p-6 text-center">
              <p className="text-sm font-semibold text-muted-foreground">
                Nenhum dado para exibir
              </p>
              <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                Preencha os valores do investimento à esquerda para gerar o gráfico de projeção.
              </p>
            </div>
          )
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted rounded-xl animate-pulse">
            <span className="text-muted-foreground text-xs font-semibold">
              Carregando gráfico de evolução...
            </span>
          </div>
        )}
      </div>
    </div>
  );
});

export default GraficoEvolucao;
