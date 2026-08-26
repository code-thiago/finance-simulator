"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signUp, useSession } from "@/src/lib/auth-client";
import Navegacao from "@/src/components/Navegacao";

export default function RegistroPage() {
  const router = useRouter();
  const { data: session, isPending: isSessionPending } = useSession();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Redireciona se o usuário já estiver logado
  useEffect(() => {
    if (!isSessionPending && session?.user) {
      router.replace("/");
    }
  }, [session, isSessionPending, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name || !email || !password) {
      setErrorMessage("Por favor, preencha todos os campos.");
      return;
    }

    if (password.length < 8) {
      setErrorMessage("A senha deve conter pelo menos 8 caracteres.");
      return;
    }

    try {
      setIsLoading(true);
      const res = await signUp.email({
        name,
        email,
        password,
      });

      if (res?.error) {
        setErrorMessage(
          res.error.message || "Erro ao criar conta. Verifique os dados informados."
        );
        setIsLoading(false);
        return;
      }

      router.push("/");
      router.refresh();
    } catch (err: unknown) {
      const error = err as { message?: string };
      setErrorMessage(
        error?.message || "Ocorreu um erro ao tentar criar a conta. Tente novamente."
      );
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center pb-12">
      <Navegacao />

      <div className="w-full max-w-md mx-auto px-4 mt-8">
        <div className="bg-white dark:bg-zinc-900 p-6 sm:p-8 rounded-2xl border border-border dark:border-zinc-800 shadow-sm space-y-6">
          {/* Cabeçalho */}
          <div className="text-center space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              Criar sua conta
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Cadastre-se para salvar e comparar suas simulações
            </p>
          </div>

          {/* Mensagem de Erro */}
          {errorMessage && (
            <div
              role="alert"
              className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800/60 text-red-700 dark:text-red-300 text-xs font-medium leading-relaxed"
            >
              {errorMessage}
            </div>
          )}

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Campo Nome */}
            <div className="space-y-1.5">
              <label
                htmlFor="name"
                className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block"
              >
                Nome Completo
              </label>
              <div className="relative rounded-lg border border-border dark:border-zinc-800 overflow-hidden focus-within:ring-2 focus-within:ring-ring dark:focus-within:ring-indigo-500/50 focus-within:border-transparent transition-all">
                <input
                  id="name"
                  type="text"
                  required
                  autoComplete="name"
                  placeholder="Seu nome"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white dark:bg-zinc-950 px-3.5 py-2.5 text-base font-medium text-zinc-900 dark:text-zinc-50 focus:outline-none placeholder:text-zinc-300 dark:placeholder:text-zinc-700"
                />
              </div>
            </div>

            {/* Campo E-mail */}
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block"
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
                  className="w-full bg-white dark:bg-zinc-950 px-3.5 py-2.5 text-base font-medium text-zinc-900 dark:text-zinc-50 focus:outline-none placeholder:text-zinc-300 dark:placeholder:text-zinc-700"
                />
              </div>
            </div>

            {/* Campo Senha */}
            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block"
              >
                Senha
              </label>
              <div className="relative rounded-lg border border-border dark:border-zinc-800 overflow-hidden focus-within:ring-2 focus-within:ring-ring dark:focus-within:ring-indigo-500/50 focus-within:border-transparent transition-all">
                <input
                  id="password"
                  type="password"
                  required
                  autoComplete="new-password"
                  placeholder="Mínimo de 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white dark:bg-zinc-950 px-3.5 py-2.5 text-base font-medium text-zinc-900 dark:text-zinc-50 focus:outline-none placeholder:text-zinc-300 dark:placeholder:text-zinc-700"
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
                  <span>Cadastrando...</span>
                </>
              ) : (
                "Criar Conta"
              )}
            </button>
          </form>

          {/* Rodapé com link para login */}
          <div className="text-center pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Já tem uma conta?{" "}
              <Link
                href="/login"
                className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Entre
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
