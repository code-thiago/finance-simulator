import { vi } from "vitest";

// Mock de 'next/server' já que ele não está presente no ambiente de testes legado (Next 9.3.3)
vi.mock("next/server", () => {
  return {
    NextRequest: Request,
    NextResponse: {
      json: (body: any, init?: ResponseInit) => {
        return Response.json(body, init);
      },
    },
  };
});

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { GET } from "./route";
import { NextRequest } from "next/server";

describe("GET /api/cotacoes/acao", () => {
  beforeEach(() => {
    vi.stubEnv("BRAPI_TOKEN", "mocked-token");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("deve retornar cotação de sucesso e normalizada", async () => {
    const mockResponse = {
      results: [
        {
          symbol: "PETR4",
          data: {
            shortName: "PETROBRAS PN",
            longName: "Petróleo Brasileiro S.A. - Petrobras",
            regularMarketPrice: 38.5,
            regularMarketChange: 0.45,
            regularMarketChangePercent: 1.2,
            regularMarketDayHigh: 39.0,
            regularMarketDayLow: 38.2,
            regularMarketVolume: 45678900,
          },
        },
      ],
    };

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockResponse,
    });
    vi.stubGlobal("fetch", mockFetch);

    const request = new NextRequest("http://localhost:3000/api/cotacoes/acao?ticker=PETR4");
    const response = await GET(request);
    const body = await response.json();

    expect(mockFetch).toHaveBeenCalledWith(
      "https://brapi.dev/api/v2/stocks/quote?symbols=PETR4",
      { headers: { Authorization: "Bearer mocked-token" } }
    );
    expect(response.status).toBe(200);
    expect(body.sucesso).toBe(true);
    expect(body.dados).toEqual({
      simbolo: "PETR4",
      nome: "Petróleo Brasileiro S.A. - Petrobras",
      preco: 38.5,
      variacao: 0.45,
      variacaoPercentual: 1.2,
      maxima: 39.0,
      minima: 38.2,
      volume: 45678900,
    });
    expect(body.atualizadoEm).toBeDefined();
  });

  it("deve retornar erro SIMBOLO_INVALIDO se o ticker não for encontrado (404)", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      statusText: "Not Found",
    });
    vi.stubGlobal("fetch", mockFetch);

    const request = new NextRequest("http://localhost:3000/api/cotacoes/acao?ticker=INVALIDO");
    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.sucesso).toBe(false);
    expect(body.erro.tipo).toBe("SIMBOLO_INVALIDO");
    expect(body.erro.mensagem).toContain("não foi encontrado");
  });

  it("deve retornar erro SIMBOLO_INVALIDO se o ticker for inválido no JSON retornado (200 mas com erro)", async () => {
    const mockResponse = {
      results: [
        {
          error: true,
          message: "Ticker not found",
        },
      ],
    };

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockResponse,
    });
    vi.stubGlobal("fetch", mockFetch);

    const request = new NextRequest("http://localhost:3000/api/cotacoes/acao?ticker=INVALIDO");
    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.sucesso).toBe(false);
    expect(body.erro.tipo).toBe("SIMBOLO_INVALIDO");
    expect(body.erro.mensagem).toBe("Ticker not found");
  });

  it("deve retornar erro RATE_LIMIT se o limite de requisições for atingido (429)", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 429,
      statusText: "Too Many Requests",
    });
    vi.stubGlobal("fetch", mockFetch);

    const request = new NextRequest("http://localhost:3000/api/cotacoes/acao?ticker=PETR4");
    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(429);
    expect(body.sucesso).toBe(false);
    expect(body.erro.tipo).toBe("RATE_LIMIT");
  });

  it("deve retornar erro RATE_LIMIT se o corpo da resposta contiver mensagem de limite ou cota (Brapi)", async () => {
    const mockResponse = {
      message: "You have exceeded your plan's rate limit.",
      error: true,
    };

    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => mockResponse,
    });
    vi.stubGlobal("fetch", mockFetch);

    const request = new NextRequest("http://localhost:3000/api/cotacoes/acao?ticker=PETR4");
    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.sucesso).toBe(false);
    expect(body.erro.tipo).toBe("RATE_LIMIT");
    expect(body.erro.mensagem).toContain("rate limit");
  });

  it("deve retornar erro ERRO_REDE se a requisição fetch falhar", async () => {
    const mockFetch = vi.fn().mockRejectedValue(new Error("Network connection failed"));
    vi.stubGlobal("fetch", mockFetch);

    const request = new NextRequest("http://localhost:3000/api/cotacoes/acao?ticker=PETR4");
    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(body.sucesso).toBe(false);
    expect(body.erro.tipo).toBe("ERRO_REDE");
    expect(body.erro.mensagem).toBe("Network connection failed");
  });
});
