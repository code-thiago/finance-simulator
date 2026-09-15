"use client";

import React, { useState } from "react";
import { useSession } from "@/src/lib/auth-client";
import { useSalvarSimulacao } from "../api/useSalvarSimulacao";

export interface BlocoSalvarSimulacaoProps {
  tipo: "juros_compostos" | "comparador";
  parametros: Record<string, unknown>;
  isValid: boolean;
  titulo?: string;
  placeholder?: string;
  botaoTexto?: string;
  idInput?: string;
}

export default function BlocoSalvarSimulacao({
  tipo,
  parametros,
  isValid,
  titulo = tipo === "juros_compostos" ? "Salvar Simulação" : "Salvar Comparação",
  placeholder = tipo === "juros_compostos"
    ? "Ex: Aposentadoria 10 anos"
    : "Ex: CDB vs Selic 12m",
  botaoTexto = tipo === "juros_compostos" ? "Salvar Simulação" : "Salvar Comparação",
  idInput = tipo === "juros_compostos" ? "nomeSimulacao" : "nomeComparacao",
}: BlocoSalvarSimulacaoProps) {
  const { data: session } = useSession();
  const { salvar, salvando, sucesso, erro } = useSalvarSimulacao();
  const [nomeSimulacao, setNomeSimulacao] = useState("");

  // Só exibe o bloco se o usuário estiver autenticado e a simulação estiver válida
  if (!isValid || !session?.user) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    const res = await salvar({
      tipo,
      nome: nomeSimulacao,
      parametros,
    });

    if (res.ok) {
      setNomeSimulacao("");
    }
  };

  return (
    <div className="bg-card p-6 rounded-2xl border border-border dark:border-zinc-800 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-2">
        <h2 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">
          {titulo}
        </h2>
        <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded-full">
          Logado
        </span>
      </div>

      {sucesso && (
        <div
          role="status"
          className="p-3 rounded-xl bg-success/10 border border-success/20 text-success text-xs font-medium flex items-center gap-2"
        >
          <svg
            className="w-4 h-4 text-success shrink-0"
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
          <span>
            {tipo === "juros_compostos"
              ? "Simulação salva com sucesso!"
              : "Comparação salva com sucesso!"}
          </span>
        </div>
      )}

      {erro && (
        <div
          role="alert"
          className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium"
        >
          {erro}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="space-y-1.5">
          <label
            htmlFor={idInput}
            className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block"
          >
            Nome da simulação (opcional)
          </label>
          <div className="relative rounded-lg border border-border dark:border-zinc-800 overflow-hidden focus-within:ring-2 focus-within:ring-ring dark:focus-within:ring-indigo-500/50 focus-within:border-transparent transition-all">
            <input
              id={idInput}
              type="text"
              placeholder={placeholder}
              value={nomeSimulacao}
              onChange={(e) => setNomeSimulacao(e.target.value)}
              className="w-full bg-white dark:bg-zinc-950 px-3.5 py-2 text-sm font-medium text-foreground focus:outline-none placeholder:text-zinc-300 dark:placeholder:text-zinc-700"
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
            botaoTexto
          )}
        </button>
      </form>
    </div>
  );
}
