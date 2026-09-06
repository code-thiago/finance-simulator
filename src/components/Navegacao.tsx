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
    { href: "/", label: "Juros Compostos" },
    { href: "/comparador", label: "Comparador" },
    ...(session?.user ? [{ href: "/minhas-simulacoes", label: "Minhas Simulações" }] : []),
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

  return (
    <nav className="w-full max-w-6xl mx-auto px-4 md:px-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
      {/* Links de navegação das ferramentas */}
      <div className="flex gap-1.5 p-1 bg-zinc-100 dark:bg-zinc-900/60 rounded-xl border border-border dark:border-zinc-800/80 shadow-sm backdrop-blur-sm">
        {links.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all duration-200 ${
                isActive
                  ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 shadow-sm border border-zinc-200/50 dark:border-zinc-700/50"
                  : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 border border-transparent"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </div>

      {/* Seção de Autenticação */}
      <div className="flex items-center gap-3">
        {isPending ? (
          <div className="h-9 w-20" aria-hidden="true" />
        ) : session?.user ? (
          <div className="flex items-center gap-3 bg-zinc-100 dark:bg-zinc-900/60 p-1 pl-3 pr-1 rounded-xl border border-border dark:border-zinc-800/80 shadow-sm backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold uppercase">
                {session.user.name?.charAt(0) || "U"}
              </div>
              <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300 max-w-[140px] truncate">
                {session.user.name}
              </span>
            </div>
            <button
              onClick={handleSignOut}
              disabled={isLoggingOut}
              className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all duration-200 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 border border-transparent disabled:opacity-50 cursor-pointer"
            >
              {isLoggingOut ? "Saindo..." : "Sair"}
            </button>
          </div>
        ) : (
          <div className="flex gap-1.5 p-1 bg-zinc-100 dark:bg-zinc-900/60 rounded-xl border border-border dark:border-zinc-800/80 shadow-sm backdrop-blur-sm">
            <Link
              href="/login"
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all duration-200 ${
                pathname === "/login" || pathname === "/registro"
                  ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 shadow-sm border border-zinc-200/50 dark:border-zinc-700/50"
                  : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 border border-transparent"
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
