import { NextRequest, NextResponse } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { auth } from "@/src/lib/auth";

const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : undefined;

// Regra 1 (Auth crítica): Máximo de 5 requisições a cada 60s por IP
const authLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "60 s"),
      prefix: "ratelimit:auth",
      analytics: true,
    })
  : null;

// Regra 2 (API geral): Máximo de 10 requisições a cada 10s por IP (ou por user_id se autenticado)
const apiLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, "10 s"),
      prefix: "ratelimit:api",
      analytics: true,
    })
  : null;

function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const firstIp = forwardedFor.split(",")[0]?.trim();
    if (firstIp) return firstIp;
  }
  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;
  return (request as unknown as { ip?: string }).ip || "127.0.0.1";
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Proteção de rotas do app (Validação de sessão existente)
  if (pathname.startsWith("/app/minhas-simulacoes")) {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    return NextResponse.next();
  }

  // 2. Rate Limiting distribuído para rotas /api/*
  if (pathname.startsWith("/api/")) {
    const clientIp = getClientIp(request);

    // Regra 1: Auth crítica (/api/auth/sign-up/* e /api/auth/sign-in/*)
    const isCriticalAuth =
      pathname.startsWith("/api/auth/sign-up") ||
      pathname.startsWith("/api/auth/sign-in");

    if (isCriticalAuth) {
      if (authLimiter) {
        const { success, reset } = await authLimiter.limit(`auth:${clientIp}`);
        if (!success) {
          const retryAfter = Math.max(1, Math.ceil((reset - Date.now()) / 1000));
          return new NextResponse(
            JSON.stringify({
              erro: {
                mensagem: "Muitas tentativas de autenticação. Tente novamente mais tarde.",
              },
            }),
            {
              status: 429,
              headers: {
                "Content-Type": "application/json",
                "Retry-After": retryAfter.toString(),
              },
            }
          );
        }
      }
    } else {
      // Regra 2: Restante de /api/* (por IP ou por user_id se autenticado)
      if (apiLimiter) {
        let identifier = `ip:${clientIp}`;
        const cookieHeader = request.headers.get("cookie");
        if (cookieHeader && cookieHeader.includes("session")) {
          try {
            const session = await auth.api.getSession({
              headers: request.headers,
            });
            if (session?.user?.id) {
              identifier = `user:${session.user.id}`;
            }
          } catch {
            // Fallback seguro para IP em caso de erro na sessão
          }
        }

        const { success, reset } = await apiLimiter.limit(identifier);
        if (!success) {
          const retryAfter = Math.max(1, Math.ceil((reset - Date.now()) / 1000));
          return new NextResponse(
            JSON.stringify({
              erro: {
                mensagem: "Limite de requisições excedido. Reduza a frequência.",
              },
            }),
            {
              status: 429,
              headers: {
                "Content-Type": "application/json",
                "Retry-After": retryAfter.toString(),
              },
            }
          );
        }
      }
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  runtime: "nodejs",
  matcher: [
    "/app/minhas-simulacoes",
    "/app/minhas-simulacoes/:path*",
    "/api/:path*",
  ],
};
