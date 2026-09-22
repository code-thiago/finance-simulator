# finance-simulator

Financial calculations for TypeScript. Pure functions, compound arithmetic, zero floating-point drift.

```ts
import { calcularJurosCompostos } from "@/src/core/jurosCompostos";

// Inputs in BRL and nominal annual rate
const timeline = calcularJurosCompostos({
  valorInicial: 5000,   // R$ 5,000.00
  aporteMensal: 500,    // R$ 500.00/month
  taxaAnual: 12.0,      // 12% p.a.
  periodoMeses: 24,     // 24 months (2 years)
});

const lastMonth = timeline[timeline.length - 1];
// => { mes: 24, valorInvestido: 17000, valorTotal: 19890.31, jurosAcumulados: 2890.31 }
```

---

## Overview

**finance-simulator** is a web application for financial planning and wealth projection:
- **Compound Interest Calculator**: Iterative month-by-month projection with regular contributions and interactive Recharts visualization.
- **Fixed Income Comparator**: Real-time net yield comparison across Brazilian post-fixed CDB, Tesouro Selic, and Savings (Poupança).
- **Live Market Quotes**: Real-time quotes for B3 Brazilian equities (Brapi API) and global currency pairs (Alpha Vantage API) backed by distributed caching and rate limiting.
- **User Accounts**: Cloud-persisted scenario storage using Better Auth to save, reload, and organize simulations.

---

## Stack

- **Framework**: Next.js 15 (App Router, Server & Client Components)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Database & ORM**: Neon (Serverless Postgres) with Drizzle ORM
- **Authentication**: Better Auth
- **Rate Limiting & Cache**: Upstash Redis (`@upstash/ratelimit`)
- **State Management & Caching**: TanStack Query
- **Charts**: Recharts
- **Testing**: Vitest

---

## Why This Project Exists

Consuming a market quote API and rendering inputs is trivial. The purpose of this project is to implement real-world financial and fiscal logic with mathematical precision, where naive simplifications produce inaccurate results:

- **Real Regressive Income Tax Table**: For CDB and Tesouro Selic, income tax applies strictly to gross capital gains across statutory Brazilian brackets (22.5% up to 6 months, 20.0% up to 12 months, 17.5% up to 24 months, and 15.0% beyond 24 months).
- **Savings Account Rule (Brazilian Federal Law 12,703/2012)**: Yield dynamics adapt to the benchmark Selic rate. If target Selic exceeds 8.5% p.a., return is 0.5% per month + TR (Reference Rate); otherwise, it yields 70% of the annualized Selic converted to a monthly equivalent + TR, maintaining full tax exemption for individuals.
- **Cent-Based Integer Arithmetic Against Floating-Point Drift**: In simulations running up to 360 iterations (30 years), standard IEEE 754 floating-point numbers accumulate recurring decimal drift (`0.1 + 0.2 !== 0.3`). The internal engine operates entirely on integer cents with discrete monthly rounding (`Math.round`), preventing fractional drift over hundreds of capitalizations.
- **Saved Simulations Never Store Computed Totals**: The database persists exclusively raw input parameters (`jsonb`). Projections are always recomputed on the fly through the same pure, thoroughly tested functions used in the live view, ensuring historical records never diverge from updated core logic.

---

## Getting Started Locally

### Prerequisites
- Node.js 18+ or 20+
- A [Neon](https://neon.tech) account (PostgreSQL)
- An [Upstash](https://upstash.com) account (Redis)
- A free token from [Brapi](https://brapi.dev) (B3 equities)
- An API key from [Alpha Vantage](https://www.alphavantage.co) (Forex)

### Environment Variables
Create a `.env.local` file in the project root:

```env
DATABASE_URL=
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=
ALPHA_VANTAGE_API_KEY=
BRAPI_TOKEN=
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

### Installation and Execution
```bash
# 1. Install dependencies
npm install

# 2. Push schema to Neon Postgres via Drizzle Kit
npx drizzle-kit push

# 3. Start local development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Project Structure

```
src/
├── core/         # Pure domain financial calculation functions and unit tests (zero framework dependency)
├── api/          # Internal HTTP client, TanStack Query hooks, and market data cache management
├── db/           # Drizzle ORM schema, relational definitions, and connection to Neon Postgres pooler
├── lib/          # Better Auth clients (server & browser), currency formatters, and Upstash Redis instances
├── components/   # React UI components (forms with defensive input ceilings, tables, and Recharts)
└── app/          # Next.js App Router (public landing, protected /app routes, middleware, and API handlers)
```

---

## Technical Decisions

- **Dual-tier rate limiting**: A global route limiter protects shared external API quotas from total exhaustion, while per-IP limiters prevent any single client from consuming the global budget alone.
- **Optimistic session authentication**: Session cookie presence is verified directly inside Next.js Middleware without database roundtrips, deferring cryptographic session resolution to API route handlers prior to state mutations.
- **Two-tiered form input validation**: Individual field bounds prevent invalid inputs, combined with a hard ceiling on the final computed result — exponential compounding can cause numeric overflow even with seemingly reasonable inputs.
- **Saved simulations store only parameters in jsonb**: Persisting only inputs eliminates calculation duplication between live and historical views, ensuring engine improvements immediately apply across all user data.

---

## Testing

Pure domain calculations in `src/core/` and protected API route handlers are covered by automated unit tests:

```bash
npx vitest run
```

---

## License

To be determined. Inquire with the author for usage or redistribution permissions.
