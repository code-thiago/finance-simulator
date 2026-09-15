"use client";

import React, { memo } from "react";
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
import { formatarMoeda } from "@/src/lib/formatters";

export interface ItemDadoGraficoComparacao {
  name: string;
  produto: "CDB" | "TESOURO_SELIC" | "POUPANCA";
  valorLiquido: number;
  valorBruto: number;
}

export interface GraficoComparacaoProps {
  dados: ItemDadoGraficoComparacao[];
  isValid: boolean;
  isMounted: boolean;
}

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

// Formatador de valores no eixo Y
const formatarEixoY = (val: number) => {
  if (val >= 1e6) return `R$ ${(val / 1e6).toFixed(1)}M`;
  if (val >= 1e3) return `R$ ${(val / 1e3).toFixed(0)}k`;
  return `R$ ${val}`;
};

export const GraficoComparacao = memo(function GraficoComparacao({
  dados,
  isValid,
  isMounted,
}: GraficoComparacaoProps) {
  return (
    <div className="bg-card p-6 rounded-2xl border border-border dark:border-zinc-800 shadow-sm flex flex-col h-[350px]">
      <div className="mb-4">
        <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">
          Comparação de Valor Líquido
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Valores acumulados após o período simulado.
        </p>
      </div>

      <div className="flex-1 w-full min-h-0">
        {isMounted ? (
          isValid ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={dados}
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
                  tickFormatter={formatarEixoY}
                  dx={-5}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-card/95 backdrop-blur-sm p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-xl text-xs space-y-2">
                          <p className="font-bold text-foreground border-b border-zinc-100 dark:border-zinc-800 pb-1">
                            {data.name}
                          </p>
                          <div className="space-y-1 font-mono">
                            <div className="flex justify-between gap-6">
                              <span className="text-muted-foreground">
                                Valor Bruto:
                              </span>
                              <span className="font-bold tabular-nums text-foreground">
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
                  {dados.map((entry, index) => {
                    const color = obterCorProduto(entry.produto);
                    return <Cell key={`cell-${index}`} fill={color} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-muted border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl p-6 text-center">
              <p className="text-sm font-semibold text-muted-foreground">
                Preencha os dados
              </p>
              <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                Insira as configurações de comparação para visualizar o gráfico.
              </p>
            </div>
          )
        ) : (
          <div className="w-full h-full bg-muted animate-pulse rounded-xl" />
        )}
      </div>
    </div>
  );
});

export default GraficoComparacao;
