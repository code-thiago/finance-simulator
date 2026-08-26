"use client";

import { useState } from "react";

export interface SalvarSimulacaoPayload {
  tipo: "juros_compostos" | "comparador";
  parametros: Record<string, unknown>;
  nome?: string;
}

export interface UseSalvarSimulacaoReturn {
  salvar: (dados: SalvarSimulacaoPayload) => Promise<{ ok: boolean; erro?: string; data?: unknown }>;
  salvando: boolean;
  sucesso: boolean;
  erro: string | null;
  resetar: () => void;
}

export function useSalvarSimulacao(): UseSalvarSimulacaoReturn {
  const [salvando, setSalvando] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const salvar = async (dados: SalvarSimulacaoPayload) => {
    setSalvando(true);
    setSucesso(false);
    setErro(null);

    try {
      const response = await fetch("/api/simulacoes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dados),
      });

      const json = await response.json().catch(() => null);

      if (!response.ok) {
        const mensagemErro =
          json?.erro?.mensagem || "Erro ao salvar a simulação. Tente novamente.";
        setErro(mensagemErro);
        return { ok: false, erro: mensagemErro };
      }

      setSucesso(true);
      setTimeout(() => {
        setSucesso(false);
      }, 4000);

      return { ok: true, data: json };
    } catch (err: unknown) {
      const mensagem =
        err instanceof Error ? err.message : "Erro ao conectar com o servidor.";
      setErro(mensagem);
      return { ok: false, erro: mensagem };
    } finally {
      setSalvando(false);
    }
  };

  const resetar = () => {
    setSucesso(false);
    setErro(null);
  };

  return {
    salvar,
    salvando,
    sucesso,
    erro,
    resetar,
  };
}
