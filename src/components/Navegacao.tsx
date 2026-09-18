"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "@/src/lib/auth-client";
import { useState } from "react";

export default function Navegacao() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const links = [
    { href: "/app", label: "Juros Compostos" },
    { href: "/app/comparador", label: "Comparador" },
    ...(session?.user ? [{ href: "/app/minhas-simulacoes", label: "Minhas Simulações" }] : []),
  ];

  const handleSignOut = async () => {
    try {
      setIsLoggingOut(true);
      await signOut();
      router.push("/");
      router.refresh();
    } catch (err) {
      console.error("Erro ao sair:", err);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const isAuthPage = pathname === "/login" || pathname === "/registro";

  return (
    <nav className="w-full max-w-6xl mx-auto px-4 md:px-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
      {/* Links de navegação das ferramentas ou link de retorno */}
      {isAuthPage ? (
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted"
        >
          <span aria-hidden="true">&larr;</span> Voltar ao início
        </Link>
      ) : (
        <div className="flex gap-1.5 p-1 bg-muted rounded-xl border border-border dark:border-zinc-800/80 shadow-sm backdrop-blur-sm">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all duration-200 ${
                  isActive
                    ? "bg-card text-foreground shadow-sm border border-border"
                    : "text-muted-foreground hover:text-foreground border border-transparent"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      )}

      {/* Seção de Autenticação */}
      <div className="flex items-center gap-3">
        {isPending ? (
          <div className="h-9 w-20" aria-hidden="true" />
        ) : session?.user ? (
          <div className="flex items-center gap-3 bg-muted p-1 pl-3 pr-1 rounded-xl border border-border dark:border-zinc-800/80 shadow-sm backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold uppercase">
                {session.user.name?.charAt(0) || "U"}
              </div>
              <span className="text-xs font-medium text-foreground max-w-[140px] truncate">
                {session.user.name}
              </span>
            </div>
            <button
              onClick={handleSignOut}
              disabled={isLoggingOut}
              className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all duration-200 text-destructive hover:bg-destructive/10 border border-transparent disabled:opacity-50 cursor-pointer"
            >
              {isLoggingOut ? "Saindo..." : "Sair"}
            </button>
          </div>
        ) : (
          <div className="flex gap-1.5 p-1 bg-muted rounded-xl border border-border dark:border-zinc-800/80 shadow-sm backdrop-blur-sm">
            <Link
              href="/login"
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all duration-200 ${
                pathname === "/login" || pathname === "/registro"
                  ? "bg-card text-foreground shadow-sm border border-border"
                  : "text-muted-foreground hover:text-foreground border border-transparent"
              }`}
            >
              Entrar
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
