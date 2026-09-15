"use client";

import Link from "next/link";

export default function LandingPlaceholderPage() {
  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center px-4 sm:px-6 py-12">
      <div className="w-full max-w-xl text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60">
          <span className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400 animate-pulse" />
          Project Midas
        </div>

        <div className="space-y-3">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground">
            Simulador Financeiro
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-md mx-auto leading-relaxed">
            Planeje seus investimentos, compare rentabilidades reais e tome decisões financeiras mais inteligentes.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <Link
            href="/login"
            className="w-full sm:w-auto min-w-[140px] px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-sm font-semibold tracking-wide shadow-sm hover:shadow transition-all duration-200 text-center"
          >
            Entrar
          </Link>

          <Link
            href="/registro"
            className="w-full sm:w-auto min-w-[140px] px-6 py-3 rounded-xl bg-card hover:bg-muted text-foreground border border-border text-sm font-semibold tracking-wide shadow-xs transition-all duration-200 text-center"
          >
            Criar conta
          </Link>
        </div>
      </div>
    </main>
  );
}
