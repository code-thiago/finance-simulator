"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navegacao() {
  const pathname = usePathname();

  const links = [
    { href: "/", label: "Juros Compostos" },
    { href: "/comparador", label: "Comparador" },
  ];

  return (
    <nav className="w-full max-w-6xl mx-auto px-4 md:px-8 pt-6 flex justify-center md:justify-start">
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
    </nav>
  );
}
