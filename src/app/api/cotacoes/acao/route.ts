import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ticker = searchParams.get("ticker");

    if (!ticker) {
      return NextResponse.json(
        {
          sucesso: false,
          erro: {
            tipo: "SIMBOLO_INVALIDO",
            mensagem: "Ticker não fornecido na query string (?ticker=...).",
          },
        },
        { status: 400 }
      );
    }

    const token = process.env.BRAPI_TOKEN;
    const cleanTicker = encodeURIComponent(ticker.trim().toUpperCase());
    const url = `https://brapi.dev/api/v2/stocks/quote?symbols=${cleanTicker}`;
    const headers: Record<string, string> = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(url, { headers });

    if (!response.ok) {
      if (response.status === 429) {
        return NextResponse.json(
          {
            sucesso: false,
            erro: {
              tipo: "RATE_LIMIT",
              mensagem: "Limite de requisições atingido na API externa (Brapi).",
            },
          },
          { status: 429 }
        );
      }

      if (response.status === 404) {
        return NextResponse.json(
          {
            sucesso: false,
            erro: {
              tipo: "SIMBOLO_INVALIDO",
              mensagem: `Ticker '${ticker}' não foi encontrado.`,
            },
          },
          { status: 400 }
        );
      }

      try {
        const errData = await response.json();
        if (errData && errData.message) {
          const isQuota =
            errData.message.toLowerCase().includes("limit") ||
            errData.message.toLowerCase().includes("quota");
          return NextResponse.json(
            {
              sucesso: false,
              erro: {
                tipo: isQuota ? "RATE_LIMIT" : "SIMBOLO_INVALIDO",
                mensagem: errData.message,
              },
            },
            { status: response.status }
          );
        }
      } catch {
        // Ignora erro de parsing
      }

      return NextResponse.json(
        {
          sucesso: false,
          erro: {
            tipo: "ERRO_DESCONHECIDO",
            mensagem: `Erro na API externa: ${response.statusText}`,
          },
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    if (!data || !data.results || data.results.length === 0) {
      return NextResponse.json(
        {
          sucesso: false,
          erro: {
            tipo: "SIMBOLO_INVALIDO",
            mensagem: `Ticker '${ticker}' não possui dados disponíveis ou é inválido.`,
          },
        },
        { status: 400 }
      );
    }

    const resObj = data.results[0];

    if (!resObj || resObj.error || !resObj.symbol || !resObj.data) {
      return NextResponse.json(
        {
          sucesso: false,
          erro: {
            tipo: "SIMBOLO_INVALIDO",
            mensagem: resObj?.message || `Ticker '${ticker}' é inválido ou não possui dados de cotação.`,
          },
        },
        { status: 400 }
      );
    }

    const dados = {
      simbolo: resObj.symbol,
      nome: resObj.data.longName || resObj.data.shortName || "",
      preco: resObj.data.regularMarketPrice,
      variacao: resObj.data.regularMarketChange,
      variacaoPercentual: resObj.data.regularMarketChangePercent,
      maxima: resObj.data.regularMarketDayHigh,
      minima: resObj.data.regularMarketDayLow,
      volume: resObj.data.regularMarketVolume,
    };

    return NextResponse.json({
      sucesso: true,
      dados,
      atualizadoEm: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        sucesso: false,
        erro: {
          tipo: "ERRO_REDE",
          mensagem:
            error instanceof Error
              ? error.message
              : "Falha de rede ou de conexão com a API externa.",
        },
      },
      { status: 503 }
    );
  }
}
