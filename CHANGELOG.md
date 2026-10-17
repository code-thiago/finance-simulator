# Changelog — Finance Simulator

Todas as alterações notáveis deste projeto serão documentadas neste arquivo, estruturadas rigorosamente segundo as diretrizes de governança de versionamento e a especificação do [Semantic Versioning (SemVer)](https://semver.org/lang/pt-BR/).

---

## 🏛️ Guia Oficial dos 3 Estilos de Versão

O projeto `finance-simulator` adota um modelo estrito de governança dividido em 3 estilos de incremento (`X.Y.Z`):

```
       1.0.0                         0.1.0                         0.0.1
   [ M A J O R ]                 [ M I N O R ]                 [ P A T C H ]
Atualizações Gigantes         Mudanças Relevantes          Mudanças Leves & Fixes
```

### 1. Estilo `1.0.0` (MAJOR — Atualizações Gigantes)
* **Critério**: Mudanças estruturais e profundas que alteram a dinâmica central do sistema, introduzem arquiteturas fundamentais ou redefinem a experiência do usuário.
* **Exemplos**:
  * Lançamento da fundação do sistema (`src/core/` em centavos inteiros, motor de Juros Compostos, Comparador de Renda Fixa CDB/Selic/Poupança, Cotações Brapi/AlphaVantage com cache Upstash Redis, Better Auth com Drizzle/Neon e Servidor MCP).
  * Troca completa de Design System (ex: migração para o Design System *"Obsidian Telemetry"*).
  * Novas features que alteram os contratos de API, fluxo de banco de dados ou a dinâmica operacional da aplicação.

### 2. Estilo `0.1.0` (MINOR — Mudanças Relevantes)
* **Critério**: Adição de novas pequenas features, novos componentes visuais isolados, ajustes perceptíveis de design ou melhorias substanciais que agregam valor sem romper a arquitetura existente.
* **Exemplos**:
  * Novos componentes visuais isolados (ex: `DottedGlowBackground`, novos widgets de métricas).
  * Novas páginas secundárias (ex: `/sobre`, novos dashboards de relatórios).
  * Ajustes e refinamentos visuais de espaçamento, respiro (*breathing room*) ou remoção de barras de navegação secundárias.
  * Implementação de rate limiting por IP ou novos provedores secundários.

### 3. Estilo `0.0.1` (PATCH — Mudanças Leves & Bugfixes)
* **Critério**: Correções pontuais de bugs, tratamentos técnicos de ambiente, refatorações internas sem alteração de comportamento, pequenas melhorias de documentação e tarefas de manutenção (*chore*).
* **Exemplos**:
  * Correções técnicas pontuais (ex: ajuste de `src/middleware.ts` para runtime Node.js com `auth.api.getSession()`).
  * Fallbacks de conexão em tempo de build (`src/db/index.ts`).
  * Ajustes em arquivos de documentação (`README.md`, `CHANGELOG.md`).
  * Atualizações cosméticas de dependências ou variáveis de ambiente.

---

## 📦 Histórico de Versões e Releases

### [1.1.1] — 2026-10-17 (PATCH)
#### Adicionado
- **Governança de Versionamento**: Estabelecimento formal do modelo de versionamento estrito de 3 estilos (`1.0.0`, `0.1.0`, `0.0.1`) no documento `CHANGELOG.md`.
- **Rastreabilidade Completa**: Mapeamento histórico exaustivo de todos os commits realizados no Git desde a criação do repositório.
- **Sincronização do Pacote**: Atualização da versão do projeto para `1.1.1` no `package.json`.

---

### [1.1.0] — 2026-10-03 (MINOR)
#### Adicionado
- **Página Institucional**: Nova rota e página `/sobre` (`src/app/sobre/page.tsx`) com documentação do projeto e apresentação da arquitetura.
- **Navegação Integrada**: Inclusão de atalho para a página institucional no componente `Navegacao.tsx`.
- **Governança de IA & Git**: Criação do arquivo de regras `AGENTS.md` definindo políticas estritas de proteção da branch `main` e fluxo de trabalho na `develop`.
- **Scripts de Diagnóstico**: Utilitário `scripts/test-rate-limit.ts` para validação automatizada de limites de requisição Upstash Redis.
- **Configuração de Ambiente**: Modelos de variáveis `.env.example` e `.env.local.example` para simplificar onboarding de novos operadores.

---

### [1.0.6] — 2026-09-27 (PATCH)
#### Documentação
- **Refinamento Textual**: Limpeza e padronização visual de tópicos técnicos no `README.md`.

---

### [1.0.5] — 2026-09-27 (PATCH)
#### Corrigido
- **Autenticação em Pré-visualização**: Suporte dinâmico à resolução de `baseURL` e inclusão de curingas de domínio Vercel (`https://*.vercel.app`) na lista de `trustedOrigins` do Better Auth (`src/lib/auth.ts`).

---

### [1.0.4] — 2026-09-27 (PATCH)
#### Documentação
- **Deploy & Setup**: Atualização das instruções de inicialização de variáveis de banco e autenticação no `README.md`.

---

### [1.0.3] — 2026-09-27 (PATCH)
#### Manutenção (Chore)
- **Pipeline de Deploy**: Atualização e injeção das variáveis de ambiente de produção na Vercel com disparo de novo build de release.

---

### [1.0.2] — 2026-09-27 (PATCH)
#### Corrigido
- **Build-Time Fallback do Banco**: Implementação de string de conexão substituta controlada no `src/db/index.ts` durante a fase estática de coleta de dados de página do Next.js (`Collecting page data`), prevenindo travamento do build na ausência temporária do `DATABASE_URL`.

---

### [1.0.1] — 2026-09-27 (PATCH)
#### Corrigido
- **Runtime do Middleware**: Migração do `src/middleware.ts` para o runtime Node.js nativo utilizando `auth.api.getSession({ headers })`, resolvendo incompatibilidade de módulos criptográficos e conexões Postgres no runtime Edge.

---

### [1.0.0] — 2026-09-22 (MAJOR — Lançamento da Fundação do Sistema)
#### Adicionado
- **Motor Financeiro de Precisão (`src/core/`)**:
  - `jurosCompostos.ts`: Cálculo de juros compostos com aportes mensais, retorno de montante, juros acumulados e evolução patrimonial calculados rigorosamente em centavos inteiros (`BigInt`/`number` inteiro), prevenindo anomalias de arredondamento IEEE 754.
  - `comparadorInvestimentos.ts`: Motor de comparação entre Poupança, CDB (com tabela regressiva de IRPF: 22.5% a 15%) e Tesouro Selic.
  - Suíte completa de 34 testes unitários automatizados com Vitest.
- **Módulos de Cotação em Tempo Real**:
  - Integração com provedores externos (Brapi e AlphaVantage) para ações da B3 e pares de moedas (USD/BRL, EUR/BRL).
  - Cache distribuído e rate limiting resiliente com `@upstash/ratelimit` e `@upstash/redis` nas rotas `/api/cotacoes/acao` e `/api/cotacoes/cambio`.
  - Componente de visualização em tempo real `CotacaoWidget.tsx`.
- **Infraestrutura de Dados & Autenticação**:
  - Integração Neon Serverless Postgres via Drizzle ORM (`src/db/index.ts`, `src/db/schema.ts`).
  - Better Auth configurado com persistência de sessões, usuários, contas e tokens.
  - Rotas de API `/api/simulacoes` para criação e consulta de projeções salvas vinculadas à conta do usuário.
- **Interface e Navegação do Usuário**:
  - Telas completas de `/login` e `/registro`.
  - Simuladores interativos com gráficos Recharts (`GraficoEvolucao.tsx`, `GraficoComparacao.tsx`).
  - Página `/app/minhas-simulacoes` para recálculo instantâneo de histórico no cliente.
  - Middleware de proteção de rotas privadas (`/app/*`).
  - Teto visual de segurança contra overflow em valores astronômicos.
  - Documentação arquitetural abrangente em inglês no `README.md`.

---

## 📜 Histórico Completo de Commits (Git Log Ledger)

Abaixo está o registro cronológico exato e decrescente (da versão atual até a fundação inicial) de todos os commits que compõem o histórico do repositório:

| Versão | Data | Tipo | Commit Hash | Mensagem do Commit | Descrição Técnica Detalhada |
| :---: | :---: | :---: | :---: | :--- | :--- |
| **`1.1.1`** | `2026-10-17` | `PATCH` | `HEAD` *(atual)* | `docs(changelog): adiciona governanca de versoes (1.0.0, 0.1.0, 0.0.1) e historico completo de commits` | Criação do documento `CHANGELOG.md` na raiz com as diretrizes dos 3 estilos de versão, rastreamento histórico de todos os 23 commits reais do projeto e atualização do campo `version` para `1.1.1` no `package.json`. |
| **`1.1.0`** | `2026-10-03` | `MINOR` | `2fd517c` | `feat: adicionar documentacao, integracao na navegacao e configuracoes de auth/middleware` | Adição da página institucional `/sobre`, inclusão de link na navegação, criação do `AGENTS.md` com guardrails de Git (proteção da branch `main`), script `test-rate-limit.ts` e ajustes de ambiente. |
| **`1.0.6`** | `2026-09-27` | `PATCH` | `64792c7` | `Update README.md` | Ajuste cosmético de quebras de linha e padronização de documentação no `README.md`. |
| **`1.0.5`** | `2026-09-27` | `PATCH` | `97b85ac` | `fix(auth): support dynamic baseURL and vercel preview domains in trustedOrigins` | Configuração de suporte dinâmico a `baseURL` e liberação de curingas de subdomínio Vercel (`https://*.vercel.app`) no array `trustedOrigins` do Better Auth (`src/lib/auth.ts`). |
| **`1.0.4`** | `2026-09-27` | `PATCH` | `1d03d85` | `Update README.md` | Atualização das instruções de inicialização de variáveis de ambiente no `README.md`. |
| **`1.0.3`** | `2026-09-27` | `PATCH` | `dd3abc2` | `chore: trigger deployment with updated environment variables` | Commit de manutenção operacional para disparar novo build na Vercel com injeção de novas variáveis de ambiente. |
| **`1.0.2`** | `2026-09-27` | `PATCH` | `f7ac29d` | `fix(db): add connection string fallback for build-time page data collection` | Tratamento de fallback seguro de conexão no `src/db/index.ts` durante a fase estática `Collecting page data` do Next.js, evitando falha na ausência temporária do `DATABASE_URL`. |
| **`1.0.1`** | `2026-09-27` | `PATCH` | `8b01263` | `fix(auth): switch middleware to nodejs runtime with full session validation` | Migração do `src/middleware.ts` para o runtime Node.js nativo utilizando `auth.api.getSession()`, contornando incompatibilidades do runtime Edge com PostgreSQL e criptografia. |
| **`1.0.0`** | `2026-09-22` | `PATCH` | `f0064b5` | `docs: add technical and comprehensive README in English` | Elaboração da documentação técnica e abrangente em inglês no `README.md`, detalhando stack, arquitetura e contratos de API. |
| **`1.0.0`** | `2026-09-22` | `PATCH` | `42aa7c5` | `chore: update project name to finance-simulator` | Atualização oficial do identificador do pacote no `package.json` para `finance-simulator`. |
| **`1.0.0`** | `2026-09-18` | `PATCH` | `585852b` | `feat: adicionar teto maximo exibivel aos resultados dos simuladores para evitar overflow visual` | Adição de teto numérico exibível nos simuladores para prevenir quebra de layout (*visual overflow*) em projeções temporais extremas. |
| **`1.0.0`** | `2026-09-17` | `MINOR` | `b11b4b2` | `feat: adicionar middleware de protecao de rotas, ajustar navegacao e limites de entrada nos simuladores` | Criação do `src/middleware.ts` para proteção da rota `/app/*`, refinamento de navegação e imposição de limites de entrada nos inputs financeiros. |
| **`1.0.0`** | `2026-09-15` | `MINOR` | `1383ed1` | `feat: completar tokens do design system e refatorar cores dos componentes` | Expansão dos tokens semânticos no `src/app/globals.css`, reestruturação de rotas `/app/` e `/app/comparador` e alinhamento cromático dos componentes. |
| **`1.0.0`** | `2026-09-09` | `MINOR` | `dd7be99` | `feat: rate limiting com upstash redis nas rotas de cotacao` | Implementação de controle de taxa de requisições com `@upstash/ratelimit` e Redis nas rotas de cotação de ativos e câmbio. |
| **`1.0.0`** | `2026-09-06` | `MINOR` | `a741150` | `feat: listar simulacoes salvas com recalculacao no client (Fase 4)` | Criação da página `/app/minhas-simulacoes` e rota `GET /api/simulacoes` para exibição e recálculo instantâneo de simulações salvas. |
| **`1.0.0`** | `2026-08-30` | `PATCH` | `5555dda` | `refactor: modularizar componentes de graficos, salvar simulacao e formatters` | Modularização de `GraficoEvolucao.tsx`, `GraficoComparacao.tsx`, `BlocoSalvarSimulacao.tsx` e utilitários de formatação de moedas (`formatters.ts`). |
| **`1.0.0`** | `2026-08-26` | `MAJOR` | `bd2cc4f` | `feat: autenticacao, telas de login/registro e salvamento de simulacoes (Fases 2 e 3)` | Implementação das interfaces de `/login` e `/registro`, hook `useSalvarSimulacao` e endpoint `POST /api/simulacoes` com persistência relacional. |
| **`1.0.0`** | `2026-08-24` | `MAJOR` | `fbe307b` | `implementação inicial db` | Configuração inicial do banco de dados Serverless Postgres no Neon com Drizzle ORM (`schema.ts`), tabelas do Better Auth e entidade de simulações. |
| **`1.0.0`** | `2026-08-22` | `MINOR` | `258f31d` | `SimuladorJuros add` | Implementação do componente visual `SimuladorJurosCompostos.tsx` com formulário de simulação e projeção gráfica. |
| **`1.0.0`** | `2026-08-18` | `MINOR` | `b32a6f8` | `CotacaoWidge implementacion` | Criação do widget de cotações em tempo real `CotacaoWidget.tsx` para monitoramento de ativos da B3 e moedas estrangeiras. |
| **`1.0.0`** | `2026-08-10` | `MAJOR` | `c9405bb` | `build comparadorInvestimentos` | Implementação do motor de cálculo de renda fixa `comparadorInvestimentos.ts` (Selic, Poupança e CDB com IRPF regressivo) e 16 testes unitários. |
| **`1.0.0`** | `2026-08-06` | `MINOR` | `0943bd0` | `Alterações na API` | Construção dos endpoints `/api/cotacoes/acao` e `/api/cotacoes/cambio`, integração HTTP com Brapi/AlphaVantage, hooks e testes de rota. |
| **`1.0.0`** | `2026-08-04` | `PATCH` | `815a3aa` | `desenvolvimento api/cotacoes` | Estruturação inicial dos diretórios de layout e arquivos fundamentais no padrão Next.js App Router. |
| **`1.0.0`** | `2026-07-30` | `MAJOR` | `273440f` | `feat: configuração inicial build jurosCompostos.ts` | Fundação do motor de cálculo financeiro `jurosCompostos.ts` com aritmética de precisão em centavos inteiros e suíte inicial de testes unitários. |
