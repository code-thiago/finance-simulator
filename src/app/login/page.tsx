"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "@/src/lib/auth-client";
import Navegacao from "@/src/components/Navegacao";

export default function LoginPage() {
  const router = useRouter();
  const { data: session, isPending: isSessionPending } = useSession();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Redireciona se o usuário já estiver logado
  useEffect(() => {
    if (!isSessionPending && session?.user) {
      router.replace("/app");
    }
  }, [session, isSessionPending, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email || !password) {
      setErrorMessage("Por favor, preencha todos os campos.");
      return;
    }

    try {
      setIsLoading(true);
      const res = await signIn.email({
        email,
        password,
      });

      if (res?.error) {
        setErrorMessage(
          res.error.message || "E-mail ou senha incorretos. Verifique suas credenciais."
        );
        setIsLoading(false);
        return;
      }

      router.push("/app");
      router.refresh();
    } catch (err: unknown) {
      const error = err as { message?: string };
      setErrorMessage(
        error?.message || "Ocorreu um erro ao tentar entrar. Tente novamente."
      );
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center pb-12">
      <Navegacao />

      <div className="w-full max-w-md mx-auto px-4 mt-8">
        <div className="bg-card p-6 sm:p-8 rounded-2xl border border-border dark:border-zinc-800 shadow-sm space-y-6">
          {/* Cabeçalho */}
          <div className="text-center space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Entrar na sua conta
            </h1>
            <p className="text-sm text-muted-foreground">
              Acesse suas simulações salvas e histórico
            </p>
          </div>

          {/* Mensagem de Erro */}
          {errorMessage && (
            <div
              role="alert"
              className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium leading-relaxed"
            >
              {errorMessage}
            </div>
          )}

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Campo E-mail */}
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block"
              >
                E-mail
              </label>
              <div className="relative rounded-lg border border-border dark:border-zinc-800 overflow-hidden focus-within:ring-2 focus-within:ring-ring dark:focus-within:ring-indigo-500/50 focus-within:border-transparent transition-all">
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white dark:bg-zinc-950 px-3.5 py-2.5 text-base font-medium text-foreground focus:outline-none placeholder:text-zinc-300 dark:placeholder:text-zinc-700"
                />
              </div>
            </div>

            {/* Campo Senha */}
            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block"
              >
                Senha
              </label>
              <div className="relative rounded-lg border border-border dark:border-zinc-800 overflow-hidden focus-within:ring-2 focus-within:ring-ring dark:focus-within:ring-indigo-500/50 focus-within:border-transparent transition-all">
                <input
                  id="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white dark:bg-zinc-950 px-3.5 py-2.5 text-base font-medium text-foreground focus:outline-none placeholder:text-zinc-300 dark:placeholder:text-zinc-700"
                />
              </div>
            </div>

            {/* Botão de Envio */}
            <button
              type="submit"
              disabled={isLoading || isSessionPending}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-sm font-semibold tracking-wide shadow-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4 text-white"
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
                  <span>Entrando...</span>
                </>
              ) : (
                "Entrar"
              )}
            </button>
          </form>

          {/* Rodapé com link para cadastro */}
          <div className="text-center pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <p className="text-xs text-muted-foreground">
              Não tem uma conta?{" "}
              <Link
                href="/registro"
                className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Cadastre-se
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
