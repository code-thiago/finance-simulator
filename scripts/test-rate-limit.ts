/**
 * Script de teste de estresse para Rate Limiting no Next.js
 * Dispara 15 requisições simultâneas contra o endpoint crítico de autenticação:
 * /api/auth/sign-up/email
 */

const TARGET_URL = process.env.TEST_URL || "http://localhost:3000/api/auth/sign-up/email";
const TOTAL_REQUESTS = 15;

interface RequestResult {
  index: number;
  status: number;
  statusText: string;
  retryAfter: string | null;
  durationMs: number;
}

async function sendRequest(index: number): Promise<RequestResult> {
  const startTime = Date.now();
  try {
    const response = await fetch(TARGET_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: `stress-test-${Date.now()}-${index}@example.com`,
        password: "Password123!",
        name: `Stress User ${index}`,
      }),
    });

    return {
      index,
      status: response.status,
      statusText: response.statusText,
      retryAfter: response.headers.get("retry-after"),
      durationMs: Date.now() - startTime,
    };
  } catch (error) {
    return {
      index,
      status: 0,
      statusText: (error as Error).message,
      retryAfter: null,
      durationMs: Date.now() - startTime,
    };
  }
}

async function runStressTest() {
  console.log("=================================================");
  console.log("  Iniciando Teste de Estresse de Rate Limiting   ");
  console.log(`  Alvo: ${TARGET_URL}`);
  console.log(`  Disparando ${TOTAL_REQUESTS} requisições simultâneas...`);
  console.log("=================================================\n");

  const promises = Array.from({ length: TOTAL_REQUESTS }, (_, i) => sendRequest(i + 1));
  const results = await Promise.all(promises);

  // Ordena por índice para facilitar a leitura sequencial
  results.sort((a, b) => a.index - b.index);

  let allowedCount = 0;
  let rateLimitedCount = 0;

  for (const res of results) {
    const isRateLimited = res.status === 429;
    if (isRateLimited) {
      rateLimitedCount++;
      console.log(
        `[REQ #${String(res.index).padStart(2, "0")}] HTTP ${res.status} (BLOQUEADA) | Retry-After: ${res.retryAfter ?? "N/A"}s | ${res.durationMs}ms`
      );
    } else {
      allowedCount++;
      console.log(
        `[REQ #${String(res.index).padStart(2, "0")}] HTTP ${res.status} (PERMITIDA) | ${res.durationMs}ms`
      );
    }
  }

  console.log("\n-------------------------------------------------");
  console.log("  Resultado do Teste:");
  console.log(`  - Requisições permitidas pela cota: ${allowedCount} (esperado: <= 5)`);
  console.log(`  - Requisições contidas com HTTP 429: ${rateLimitedCount} (esperado: >= 10)`);
  console.log("-------------------------------------------------");

  if (rateLimitedCount >= 10 && allowedCount <= 5) {
    console.log("SUCESSO: Rate Limiting operando conforme esperado! 🛡️");
    process.exit(0);
  } else {
    console.warn("AVISO: A distribuição de respostas não bateu exatamente com a expectativa.");
    console.warn(`Permitidas: ${allowedCount}, Bloqueadas: ${rateLimitedCount}`);
    process.exit(1);
  }
}

runStressTest();
