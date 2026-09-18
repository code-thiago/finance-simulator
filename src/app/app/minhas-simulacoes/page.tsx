"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "@/src/lib/auth-client";
import Navegacao from "@/src/components/Navegacao";
import CotacaoWidget from "@/src/components/CotacaoWidget";
import { formatarMoeda } from "@/src/lib/formatters";
import {
  calcularJurosCompostos,
  ParametrosSimulacao,
} from "@/src/core/jurosCompostos";
import {
  compararInvestimentos,
  ParametrosComparador,
} from "@/src/core/comparadorInvestimentos";

interface SimulacaoDb {
  id: string;
  tipo: "juros_compostos" | "comparador";
  nome: string | null;
  parametros: Record<string, unknown>;
  criadoEm: string;
}

interface ResumoJurosCompostos {
  tipo: "juros_compostos";
  valorFinal: number;
  totalInvestido: number;
  totalJuros: number;
  parametros: {
    valorInicial: number;
    aporteMensal: number;
    taxaAnual: number;
    periodoMeses: number;
  };
}

interface ResumoComparador {
  tipo: "comparador";
  produtoVencedor: "CDB" | "TESOURO_SELIC" | "POUPANCA";
  valorLiquidoVencedor: number;
  parametros: {
    valorInicial: number;
    periodoMeses: number;
    taxaSelicAnual: number;
    percentualCDI: number;
  };
}

type ResultadoRecalculo =
  | { sucesso: true; resumo: ResumoJurosCompostos | ResumoComparador }
  | { sucesso: false; mensagemErro: string };

function recalcularSimulacao(item: SimulacaoDb): ResultadoRecalculo {
  try {
    if (item.tipo === "juros_compostos") {
      const p = item.parametros || {};
      const valorInicial = Number(p.valorInicial ?? 0);
      const aporteMensal = Number(p.aporteMensal ?? 0);
      const taxaAnual = Number(p.taxaAnual ?? 0);
      const periodoMeses = Number(
        p.periodoMeses ??
        (Number(p.periodo ?? 0) * (p.periodoUnidade === "anos" ? 12 : 1))
      );

      const params: ParametrosSimulacao = {
        valorInicial,
        aporteMensal,
        taxaAnual,
        periodoMeses,
      };

      const pontos = calcularJurosCompostos(params);
      if (!pontos || pontos.length === 0) {
        throw new Error("Falha no cálculo: período inválido.");
      }

      const pontoFinal = pontos[pontos.length - 1];

      return {
        sucesso: true,
        resumo: {
          tipo: "juros_compostos",
          valorFinal: pontoFinal.valorTotal,
          totalInvestido: pontoFinal.valorInvestido,
          totalJuros: pontoFinal.jurosAcumulados,
          parametros: {
            valorInicial,
            aporteMensal,
            taxaAnual,
            periodoMeses,
          },
        },
      };
    } else if (item.tipo === "comparador") {
      const p = item.parametros || {};
      const valorInicial = Number(p.valorInicial ?? 0);
      const periodoMeses = Number(
        p.periodoMeses ??
        (Number(p.periodo ?? 0) * (p.periodoUnidade === "anos" ? 12 : 1))
      );
      const taxaSelicAnual = Number(p.taxaSelicAnual ?? 0);
      const percentualCDI = Number(p.percentualCDI ?? 0);
      const taxaCustodiaTesouroAnual =
        p.taxaCustodiaTesouroAnual !== undefined
          ? Number(p.taxaCustodiaTesouroAnual)
          : undefined;
      const taxaReferencialMensal =
        p.taxaReferencialMensal !== undefined
          ? Number(p.taxaReferencialMensal)
          : undefined;

      const params: ParametrosComparador = {
        valorInicial,
        periodoMeses,
        taxaSelicAnual,
        percentualCDI,
        taxaCustodiaTesouroAnual,
        taxaReferencialMensal,
      };

      const resultados = compararInvestimentos(params);
      if (!resultados || resultados.length === 0) {
        throw new Error("Falha na comparação: nenhum resultado obtido.");
      }

      const vencedor = resultados[0];

      return {
        sucesso: true,
        resumo: {
          tipo: "comparador",
          produtoVencedor: vencedor.produto,
          valorLiquidoVencedor: vencedor.valorLiquido,
          parametros: {
            valorInicial,
            periodoMeses,
            taxaSelicAnual,
            percentualCDI,
          },
        },
      };
    } else {
      return {
        sucesso: false,
        mensagemErro: "Tipo de simulação desconhecido.",
      };
    }
  } catch (err: unknown) {
    const msg =
      err instanceof Error
        ? err.message
        : "Erro ao recalcular valores desta simulação.";
    return {
      sucesso: false,
      mensagemErro: msg,
    };
  }
}

function formatarDataCriacao(dataIso: string): string {
  try {
    const data = new Date(dataIso);
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(data);
  } catch {
    return dataIso;
  }
}

function formatarNomeProduto(produto: "CDB" | "TESOURO_SELIC" | "POUPANCA") {
  switch (produto) {
    case "CDB":
      return "CDB";
    case "TESOURO_SELIC":
      return "Tesouro Selic";
    case "POUPANCA":
      return "Poupança";
  }
}

function CardSimulacao({ item }: { item: SimulacaoDb }) {
  const recalculo = useMemo(() => recalcularSimulacao(item), [item]);

  const nomeExibicao =
    item.nome && item.nome.trim().length > 0
      ? item.nome
      : item.tipo === "juros_compostos"
        ? "Simulação de juros compostos"
        : "Comparação de investimentos";

  const dataFormatada = formatarDataCriacao(item.criadoEm);

  return (
    <div className="bg-card rounded-2xl border border-border dark:border-zinc-800 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-5">
      {/* Topo do Card */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          {item.tipo === "juros_compostos" ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400" />
              Juros Compostos
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide bg-violet-50 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800/60">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-600 dark:bg-violet-400" />
              Comparador
            </span>
          )}

          <span className="text-xs text-muted-foreground font-medium">
            {dataFormatada}
          </span>
        </div>

        <div>
          <h2 className="text-base font-bold text-foreground tracking-tight leading-snug">
            {nomeExibicao}
          </h2>
        </div>
      </div>

      {/* Conteúdo Recalculado ou Erro */}
      <div className="flex-1">
        {!recalculo.sucesso ? (
          <div
            role="alert"
            className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium space-y-1"
          >
            <div className="font-semibold flex items-center gap-1.5">
              <svg
                className="w-4 h-4 text-destructive shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <span>Erro ao recalcular</span>
            </div>
            <p className="text-[11px] opacity-90">{recalculo.mensagemErro}</p>
          </div>
        ) : recalculo.resumo.tipo === "juros_compostos" ? (
          <div className="space-y-4">
            {/* Valor final recalculado */}
            <div className="bg-indigo-50/50 dark:bg-zinc-950/50 p-4 rounded-xl border border-indigo-100 dark:border-zinc-800 transition-colors">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                Valor Final Estimado
              </span>
              <div className="text-2xl font-bold font-mono tracking-tight text-indigo-900 dark:text-indigo-400 mt-0.5 tabular-nums">
                {formatarMoeda(recalculo.resumo.valorFinal)}
              </div>
            </div>

            {/* Subtotais */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="bg-muted p-3 rounded-xl border border-border dark:border-zinc-800/60">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">
                  Total Investido
                </span>
                <span className="text-sm font-bold font-mono text-foreground mt-0.5 block tabular-nums">
                  {formatarMoeda(recalculo.resumo.totalInvestido)}
                </span>
              </div>

              <div className="bg-muted p-3 rounded-xl border border-border dark:border-zinc-800/60">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">
                  Total em Juros
                </span>
                <span className="text-sm font-bold font-mono text-juros dark:text-indigo-400 mt-0.5 block tabular-nums">
                  +{formatarMoeda(recalculo.resumo.totalJuros)}
                </span>
              </div>
            </div>

            {/* Resumo dos parâmetros */}
            <div className="text-[11px] text-muted-foreground pt-1 flex flex-wrap gap-x-3 gap-y-1">
              <span>
                Aporte: {formatarMoeda(recalculo.resumo.parametros.aporteMensal)}/mês
              </span>
              <span>•</span>
              <span>{recalculo.resumo.parametros.periodoMeses} meses</span>
              <span>•</span>
              <span>{recalculo.resumo.parametros.taxaAnual}% a.a.</span>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Produto Vencedor e Valor Líquido */}
            <div className="bg-indigo-50/50 dark:bg-zinc-950/50 p-4 rounded-xl border border-indigo-100 dark:border-zinc-800 transition-colors">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                  Produto Vencedor
                </span>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-md uppercase tracking-wider bg-indigo-600 text-white shadow-xs">
                  {formatarNomeProduto(recalculo.resumo.produtoVencedor)}
                </span>
              </div>
              <div className="text-2xl font-bold font-mono tracking-tight text-indigo-900 dark:text-indigo-400 mt-1 tabular-nums">
                {formatarMoeda(recalculo.resumo.valorLiquidoVencedor)}
              </div>
              <span className="text-[10px] text-indigo-700/80 dark:text-indigo-400/80 font-medium">
                Maior valor líquido após impostos
              </span>
            </div>

            {/* Resumo dos parâmetros */}
            <div className="text-[11px] text-muted-foreground pt-1 flex flex-wrap gap-x-3 gap-y-1">
              <span>
                Inicial: {formatarMoeda(recalculo.resumo.parametros.valorInicial)}
              </span>
              <span>•</span>
              <span>{recalculo.resumo.parametros.periodoMeses} meses</span>
              <span>•</span>
              <span>Selic {recalculo.resumo.parametros.taxaSelicAnual}%</span>
              <span>•</span>
              <span>CDI {recalculo.resumo.parametros.percentualCDI}%</span>
            </div>
          </div>
        )}
      </div>

      {/* Rodapé com link para ferramenta */}
      <div className="pt-3 border-t border-border flex items-center justify-between">
        <span className="text-[11px] text-muted-foreground">
          Recalculado agora
        </span>
        <Link
          href={item.tipo === "juros_compostos" ? "/app" : "/app/comparador"}
          className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1 transition-colors"
        >
          <span>Abrir no simulador</span>
          <span aria-hidden="true">&rarr;</span>
        </Link>
      </div>
    </div>
  );
}

export default function MinhasSimulacoesPage() {
  const router = useRouter();
  const { data: session, isPending: isSessionPending } = useSession();

  const [simulacoes, setSimulacoes] = useState<SimulacaoDb[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erroRede, setErroRede] = useState<string | null>(null);

  // Redireciona se não houver sessão ativa
  useEffect(() => {
    if (!isSessionPending && !session?.user) {
      router.replace("/login");
    }
  }, [session, isSessionPending, router]);

  // Busca as simulações do usuário
  const carregarSimulacoes = useCallback(async () => {
    try {
      setCarregando(true);
      setErroRede(null);

      const res = await fetch("/api/simulacoes");

      if (!res.ok) {
        if (res.status === 401) {
          router.replace("/login");
          return;
        }
        const errJson = await res.json().catch(() => null);
        throw new Error(
          errJson?.erro?.mensagem || "Não foi possível carregar as simulações salvas."
        );
      }

      const data = await res.json();
      setSimulacoes(data);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Erro de conexão ao buscar simulações.";
      setErroRede(msg);
    } finally {
      setCarregando(false);
    }
  }, [router]);

  useEffect(() => {
    if (session?.user) {
      carregarSimulacoes();
    }
  }, [session?.user, carregarSimulacoes]);

  // Se a sessão ainda está carregando ou se está deslogado aguardando redirect
  if (isSessionPending || !session?.user) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center pb-12">
        <Navegacao />
        <div className="w-full max-w-6xl mx-auto px-4 md:px-8 mt-12 flex flex-col items-center justify-center gap-4 py-24">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium text-muted-foreground">
            Verificando autenticação...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center pb-12">
      <Navegacao />
      <CotacaoWidget />

      <main className="w-full max-w-6xl mx-auto p-4 md:p-8 flex flex-col gap-8">
        {/* Cabeçalho da Página */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Minhas Simulações
            </h1>
            <p className="text-muted-foreground mt-1">
              Consulte suas simulações salvas, com cálculos e rendimentos atualizados em tempo real.
            </p>
          </div>

          {!carregando && !erroRede && (
            <div className="text-xs font-semibold text-muted-foreground bg-muted px-3.5 py-2 rounded-xl self-start sm:self-auto border border-zinc-200 dark:border-zinc-700/60">
              {simulacoes.length === 1
                ? "1 simulação salva"
                : `${simulacoes.length} simulações salvas`}
            </div>
          )}
        </div>

        {/* Estado de Carregamento */}
        {carregando && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-9 h-9 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-medium text-muted-foreground">
              Carregando suas simulações salvas...
            </p>
          </div>
        )}

        {/* Estado de Erro de Rede */}
        {!carregando && erroRede && (
          <div
            role="alert"
            className="p-6 rounded-2xl bg-destructive/10 border border-destructive/20 text-center max-w-md mx-auto space-y-4 my-8"
          >
            <div className="w-12 h-12 rounded-full bg-destructive/20 text-destructive mx-auto flex items-center justify-center">
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-base font-bold text-destructive">
                Erro ao carregar simulações
              </h2>
              <p className="text-xs text-destructive mt-1">
                {erroRede}
              </p>
            </div>
            <button
              onClick={carregarSimulacoes}
              className="px-4 py-2 bg-destructive hover:bg-destructive/90 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-sm"
            >
              Tentar novamente
            </button>
          </div>
        )}

        {/* Estado Vazio */}
        {!carregando && !erroRede && simulacoes.length === 0 && (
          <div className="flex flex-col items-center justify-center text-center py-16 px-4 bg-muted rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800 max-w-2xl mx-auto w-full my-6">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>

            <h2 className="text-lg font-bold text-foreground">
              Você ainda não salvou nenhuma simulação
            </h2>
            <p className="text-sm text-muted-foreground mt-1 max-w-md">
              Crie uma projeção no simulador de juros compostos ou no comparador de investimentos e salve-a para acompanhar aqui.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-3 mt-6 w-full max-w-sm">
              <Link
                href="/app"
                className="w-full sm:w-auto flex-1 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-bold uppercase tracking-wider text-center shadow-sm transition-all"
              >
                Juros Compostos
              </Link>
              <Link
                href="/app/comparador"
                className="w-full sm:w-auto flex-1 py-2.5 px-4 rounded-xl bg-card hover:bg-muted text-foreground border border-zinc-200 dark:border-zinc-700 text-xs font-bold uppercase tracking-wider text-center shadow-xs transition-all"
              >
                Comparador
              </Link>
            </div>
          </div>
        )}

        {/* Lista de Simulações */}
        {!carregando && !erroRede && simulacoes.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {simulacoes.map((item) => (
              <CardSimulacao key={item.id} item={item} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
