import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Evita inicialização ou chamadas de rede reais durante a execução de testes unitários (vitest/jest)
// para não interceptar o fetch global mockado nos testes existentes de rotas.
const isTest = process.env.NODE_ENV === "test";

const redis =
  !isTest &&
  process.env.UPSTASH_REDIS_REST_URL &&
  process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : undefined;

/**
 * Limitador GLOBAL para Câmbio (Alpha Vantage)
 * Alpha Vantage possui limite documentado estrito de 5 requisições por minuto no plano gratuito.
 */
export const cambioGlobalLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "60 s"),
      prefix: "ratelimit:cambio:global",
      analytics: true,
    })
  : null;

/**
 * Limitador POR IP para Câmbio (Alpha Vantage)
 * Limite de 3 requisições por 60s por IP, impedindo que um único cliente consuma
 * sozinho toda a cota global compartilhada de 5 requisições/minuto.
 */
export const cambioIpLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(3, "60 s"),
      prefix: "ratelimit:cambio:ip",
      analytics: true,
    })
  : null;

/**
 * Limitador GLOBAL para Ações (Brapi)
 * A Brapi não possui um limite documentado tão rígido quanto a Alpha Vantage para o plano free;
 * usamos 15 requisições / 60s como ponto de partida inicial.
 * NOTA: Ajustar este valor de acordo com o plano real contratado da Brapi.
 */
export const acaoGlobalLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(15, "60 s"),
      prefix: "ratelimit:acao:global",
      analytics: true,
    })
  : null;

/**
 * Limitador POR IP para Ações (Brapi)
 * Limite de 10 requisições / 60s por IP, impedindo que uma única origem
 * consuma sozinha o orçamento global de cotações de ações.
 */
export const acaoIpLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, "60 s"),
      prefix: "ratelimit:acao:ip",
      analytics: true,
    })
  : null;

/**
 * Extrai o endereço IP do cliente a partir do cabeçalho `x-forwarded-for` (padrão Vercel e proxies reversos),
 * com fallback seguro para "unknown" se ausente, garantindo que a ausência do IP nunca quebre a rota.
 */
export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const ip = forwardedFor.split(",")[0].trim();
    if (ip) return ip;
  }
  return "unknown";
}
