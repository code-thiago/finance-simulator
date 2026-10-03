import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Sobre o Projeto | Project Midas",
  description: "Conheça a arquitetura, objetivos matemáticos e stack técnica do Project Midas — Simulador Financeiro.",
};

export default function SobrePage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Cabeçalho Simplificado */}
      <header className="w-full max-w-4xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted"
        >
          <span aria-hidden="true">&larr;</span> Voltar ao início
        </Link>
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400" />
          Documentação
        </span>
      </header>

      {/* Conteúdo Principal */}
      <main className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-12 sm:space-y-16 flex-1">
        {/* a) Hero */}
        <section className="space-y-5 text-center sm:text-left">
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
              Project Midas — Simulador Financeiro
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl leading-relaxed">
              Uma ferramenta de simulação e comparativo de investimentos orientada pelo rigor matemático, respeito à legislação fiscal brasileira e decisões de engenharia pragmáticas.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <Link
              href="/registro"
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-sm font-semibold tracking-wide shadow-sm hover:shadow transition-all text-center"
            >
              Criar conta gratuita
            </Link>
            <Link
              href="/"
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-card hover:bg-muted text-foreground border border-border text-sm font-semibold tracking-wide shadow-xs transition-all text-center"
            >
              Voltar ao início
            </Link>
          </div>
        </section>

        {/* b) Por que esse projeto existe */}
        <section className="bg-card border border-border rounded-2xl p-6 sm:p-8 space-y-4 shadow-xs">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Por que esse projeto existe
          </h2>
          <div className="space-y-3 text-sm sm:text-base text-muted-foreground leading-relaxed">
            <p>
              O diferencial desta aplicação não é consumir uma API de cotação — integrar endpoints externos é algo que qualquer um faz. O que o Project Midas demonstra é um entendimento sólido da lógica financeira e fiscal real por trás da tela.
            </p>
            <p>
              Em vez de adotar aproximações simplificadas que geram resultados inconsistentes com o mercado real, o projeto foca no rigor das regras brasileiras:
            </p>
            <ul className="list-disc pl-5 space-y-2.5 text-foreground/90">
              <li>
                <strong className="text-foreground">Tabela de IR regressivo real:</strong> Aplicação exata das alíquotas oficiais de Imposto de Renda (de 22,5% a 15%) conforme o prazo do investimento (até 180 dias, 181 a 360, 361 a 720 e acima de 720 dias).
              </li>
              <li>
                <strong className="text-foreground">Regra da poupança (Lei 12.703/2012):</strong> Alternância precisa entre 70% da meta da Selic + TR (quando a taxa básica está em até 8,5% ao ano) e o rendimento de 0,5% ao mês + TR (quando a Selic ultrapassa 8,5% ao ano).
              </li>
              <li>
                <strong className="text-foreground">Aritmética em centavos:</strong> Operações monetárias calculadas com inteiros em centavos para evitar erros de ponto flutuante inerentes ao padrão IEEE 754.
              </li>
              <li>
                <strong className="text-foreground">Simulação salva nunca armazenada como resultado estático:</strong> O banco armazena estritamente os parâmetros de entrada. Toda consulta ou histórico é sempre recalculado a partir dos parâmetros originais, utilizando as mesmas funções puras e exaustivamente testadas que a tela ao vivo usa.
              </li>
            </ul>
          </div>
        </section>

        {/* c) Funcionalidades */}
        <section className="space-y-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Funcionalidades
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Recursos construídos para análise e planejamento financeiro confiável.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-card border border-border rounded-xl p-5 space-y-2">
              <h3 className="font-semibold text-foreground text-base">
                Simulador de juros compostos
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Cálculo de rendimento com aporte mensal e aportes regulares, acompanhado de gráfico de evolução patrimonial discriminando o valor investido dos juros acumulados.
              </p>
            </div>

            <div className="bg-card border border-border rounded-xl p-5 space-y-2">
              <h3 className="font-semibold text-foreground text-base">
                Comparador de investimentos
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Comparativo direto entre CDB, Tesouro Selic e Poupança, considerando alíquotas reais de IR regressivo e taxa de custódia da B3.
              </p>
            </div>

            <div className="bg-card border border-border rounded-xl p-5 space-y-2">
              <h3 className="font-semibold text-foreground text-base">
                Cotação em tempo real
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Acompanhamento de ações via Brapi e câmbio via Alpha Vantage, protegidos por rate limiting em duas camadas para otimizar consumo e estabilidade.
              </p>
            </div>

            <div className="bg-card border border-border rounded-xl p-5 space-y-2">
              <h3 className="font-semibold text-foreground text-base">
                Conta de usuário
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Área autenticada para salvar simulações preferidas e consultar o histórico completo com recálculo ao vivo e determinístico.
              </p>
            </div>
          </div>
        </section>

        {/* d) Stack técnica */}
        <section className="space-y-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Stack técnica
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Tecnologias selecionadas com foco em tipagem estrita, performance e simplicidade operacional.
            </p>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 divide-y divide-border">
            <div className="py-3.5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4">
              <span className="w-36 shrink-0 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Frontend
              </span>
              <span className="text-sm sm:text-base text-foreground font-medium">
                Next.js 15 (App Router), TypeScript, Tailwind v4, Recharts, TanStack Query
              </span>
            </div>

            <div className="py-3.5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4">
              <span className="w-36 shrink-0 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Dados
              </span>
              <span className="text-sm sm:text-base text-foreground font-medium">
                Drizzle ORM, Neon (Postgres serverless)
              </span>
            </div>

            <div className="py-3.5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4">
              <span className="w-36 shrink-0 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Autenticação
              </span>
              <span className="text-sm sm:text-base text-foreground font-medium">
                Better Auth
              </span>
            </div>

            <div className="py-3.5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4">
              <span className="w-36 shrink-0 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Infraestrutura
              </span>
              <span className="text-sm sm:text-base text-foreground font-medium">
                Upstash Redis (rate limiting), Vercel
              </span>
            </div>

            <div className="py-3.5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4">
              <span className="w-36 shrink-0 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Testes
              </span>
              <span className="text-sm sm:text-base text-foreground font-medium">
                Vitest
              </span>
            </div>
          </div>
        </section>

        {/* e) Decisões técnicas */}
        <section className="space-y-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Decisões técnicas
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              O porquê por trás de cada escolha arquitetural no desenvolvimento da plataforma.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-card border border-border rounded-xl p-5 space-y-2">
              <h3 className="font-semibold text-foreground text-sm sm:text-base">
                Rate limiting em duas camadas
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Combina limitação global por rota com limitação individual por IP, protegendo cotas de APIs externas gratuitas e prevenindo abusos sem degradar a experiência de usuários legítimos.
              </p>
            </div>

            <div className="bg-card border border-border rounded-xl p-5 space-y-2">
              <h3 className="font-semibold text-foreground text-sm sm:text-base">
                Autenticação em duas camadas
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Utiliza middleware no Edge para redirecionamentos rápidos de rotas protegidas e validação real da sessão diretamente nos endpoints de API, garantindo segurança mesmo se o middleware for burlado.
              </p>
            </div>

            <div className="bg-card border border-border rounded-xl p-5 space-y-2">
              <h3 className="font-semibold text-foreground text-sm sm:text-base">
                Validação de formulário em duas camadas
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Aplica teto individual por campo de entrada e teto sobre o resultado calculado, mitigando riscos de estouro numérico decorrentes do crescimento exponencial característico dos juros compostos.
              </p>
            </div>

            <div className="bg-card border border-border rounded-xl p-5 space-y-2">
              <h3 className="font-semibold text-foreground text-sm sm:text-base">
                Simulações salvas guardam só os parâmetros
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Nunca persistimos o resultado final no banco de dados para evitar duplicação de lógica de cálculo e garantir que qualquer evolução nos algoritmos se aplique automaticamente a todo o histórico.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Rodapé simples */}
      <footer className="w-full border-t border-border mt-12 py-6 text-center text-xs text-muted-foreground">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>Project Midas &copy; Todos os direitos reservados.</span>
          <Link
            href="/"
            className="hover:text-foreground transition-colors"
          >
            Voltar para a página inicial &rarr;
          </Link>
        </div>
      </footer>
    </div>
  );
}
