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

describe("GET /api/cotacoes/cambio", () => {
  beforeEach(() => {
    vi.stubEnv("ALPHA_VANTAGE_API_KEY", "mocked-api-key");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("deve retornar taxa de câmbio de sucesso e normalizada", async () => {
    const mockResponse = {
      "Realtime Currency Exchange Rate": {
        "1. From_Currency Code": "USD",
        "2. From_Currency Name": "United States Dollar",
        "3. To_Currency Code": "BRL",
        "4. To_Currency Name": "Brazilian Real",
        "5. Exchange Rate": "5.60000000",
        "6. Last Refreshed": "2026-07-31 17:52:01",
        "7. Time Zone": "UTC",
        "8. Bid Price": "5.59900000",
        "9. Ask Price": "5.60100000",
      },
    };

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockResponse,
    });
    vi.stubGlobal("fetch", mockFetch);

    const request = new NextRequest("http://localhost:3000/api/cotacoes/cambio?par=USD-BRL");
    const response = await GET(request);
    const body = await response.json();

    expect(mockFetch).toHaveBeenCalledWith(
      "https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=USD&to_currency=BRL&apikey=mocked-api-key"
    );
    expect(response.status).toBe(200);
    expect(body.sucesso).toBe(true);
    expect(body.dados).toEqual({
      origem: "USD",
      destino: "BRL",
      taxa: 5.6,
      bid: 5.599,
      ask: 5.601,
    });
    expect(body.atualizadoEm).toBeDefined();
  });

  it("deve retornar erro RATE_LIMIT se a resposta contiver 'Note' (Alpha Vantage)", async () => {
    const mockResponse = {
      Note: "Thank you for using Alpha Vantage! Our standard API call frequency is 5 calls per minute...",
    };

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockResponse,
    });
    vi.stubGlobal("fetch", mockFetch);

    const request = new NextRequest("http://localhost:3000/api/cotacoes/cambio?par=USD-BRL");
    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(429);
    expect(body.sucesso).toBe(false);
    expect(body.erro.tipo).toBe("RATE_LIMIT");
    expect(body.erro.mensagem).toContain("Thank you for using Alpha Vantage");
  });

  it("deve retornar erro RATE_LIMIT se a resposta contiver 'Information' (Alpha Vantage)", async () => {
    const mockResponse = {
      Information: "Thank you for using Alpha Vantage! Our standard API call frequency is 5 calls per minute...",
    };

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockResponse,
    });
    vi.stubGlobal("fetch", mockFetch);

    const request = new NextRequest("http://localhost:3000/api/cotacoes/cambio?par=USD-BRL");
    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(429);
    expect(body.sucesso).toBe(false);
    expect(body.erro.tipo).toBe("RATE_LIMIT");
    expect(body.erro.mensagem).toContain("Thank you for using Alpha Vantage");
  });

  it("deve retornar erro SIMBOLO_INVALIDO se a resposta contiver 'Error Message' de símbolo inválido (Alpha Vantage)", async () => {
    const mockResponse = {
      "Error Message": "The symbol pair USD-INVALIDO is invalid or unsupported.",
    };

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockResponse,
    });
    vi.stubGlobal("fetch", mockFetch);

    const request = new NextRequest("http://localhost:3000/api/cotacoes/cambio?par=USD-INVALIDO");
    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.sucesso).toBe(false);
    expect(body.erro.tipo).toBe("SIMBOLO_INVALIDO");
    expect(body.erro.mensagem).toContain("USD-INVALIDO");
  });

  it("deve retornar erro ERRO_DESCONHECIDO se a resposta contiver 'Error Message' referente à chave de API (Alpha Vantage)", async () => {
    const mockResponse = {
      "Error Message": "Invalid API call. Please retry with the correct API key, call parameters, or method.",
    };

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockResponse,
    });
    vi.stubGlobal("fetch", mockFetch);

    const request = new NextRequest("http://localhost:3000/api/cotacoes/cambio?par=USD-BRL");
    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.sucesso).toBe(false);
    expect(body.erro.tipo).toBe("ERRO_DESCONHECIDO");
    expect(body.erro.mensagem).toContain("API key");
  });

  it("deve retornar erro SIMBOLO_INVALIDO se a chave 'Realtime Currency Exchange Rate' estiver ausente", async () => {
    const mockResponse = {};

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockResponse,
    });
    vi.stubGlobal("fetch", mockFetch);

    const request = new NextRequest("http://localhost:3000/api/cotacoes/cambio?par=USD-BRL");
    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.sucesso).toBe(false);
    expect(body.erro.tipo).toBe("SIMBOLO_INVALIDO");
  });

  it("deve retornar erro ERRO_REDE se a requisição fetch falhar", async () => {
    const mockFetch = vi.fn().mockRejectedValue(new Error("Network connection failed"));
    vi.stubGlobal("fetch", mockFetch);

    const request = new NextRequest("http://localhost:3000/api/cotacoes/cambio?par=USD-BRL");
    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(body.sucesso).toBe(false);
    expect(body.erro.tipo).toBe("ERRO_REDE");
    expect(body.erro.mensagem).toBe("Network connection failed");
  });
});
