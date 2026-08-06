import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const par = searchParams.get("par");

    if (!par) {
      return NextResponse.json(
        {
          sucesso: false,
          erro: {
            tipo: "SIMBOLO_INVALIDO",
            mensagem: "Par de moedas não fornecido na query string (?par=...).",
          },
        },
        { status: 400 }
      );
    }

    const parts = par.split("-");
    if (parts.length !== 2) {
      return NextResponse.json(
        {
          sucesso: false,
          erro: {
            tipo: "SIMBOLO_INVALIDO",
            mensagem: "Formato do par de moedas inválido. Use o formato DE-PARA (ex: USD-BRL).",
          },
        },
        { status: 400 }
      );
    }

    const [fromCurrency, toCurrency] = parts.map(p => p.trim().toUpperCase());
    if (!fromCurrency || !toCurrency) {
      return NextResponse.json(
        {
          sucesso: false,
          erro: {
            tipo: "SIMBOLO_INVALIDO",
            mensagem: "Moedas de origem ou destino vazias no par fornecido.",
          },
        },
        { status: 400 }
      );
    }

    const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          sucesso: false,
          erro: {
            tipo: "ERRO_DESCONHECIDO",
            mensagem: "Chave de API do Alpha Vantage não configurada no servidor.",
          },
        },
        { status: 500 }
      );
    }

    const url = `https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=${encodeURIComponent(
      fromCurrency
    )}&to_currency=${encodeURIComponent(toCurrency)}&apikey=${encodeURIComponent(apiKey)}`;

    const response = await fetch(url);

    if (!response.ok) {
      if (response.status === 429) {
        return NextResponse.json(
          {
            sucesso: false,
            erro: {
              tipo: "RATE_LIMIT",
              mensagem: "Limite de requisições atingido na API externa (Alpha Vantage).",
            },
          },
          { status: 429 }
        );
      }

      return NextResponse.json(
        {
          sucesso: false,
          erro: {
            tipo: "ERRO_DESCONHECIDO",
            mensagem: `Erro na API externa de câmbio: ${response.statusText}`,
          },
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Alpha Vantage retorna rate limits como HTTP 200 com propriedades "Note" ou "Information"
    if (data["Note"] || data["Information"]) {
      return NextResponse.json(
        {
          sucesso: false,
          erro: {
            tipo: "RATE_LIMIT",
            mensagem: data["Note"] || data["Information"],
          },
        },
        { status: 429 }
      );
    }

    // Se houver mensagem de erro da API (par inválido ou chave inválida)
    if (data["Error Message"]) {
      const errMsg = data["Error Message"];
      const isApiKeyError =
        errMsg.toLowerCase().includes("apikey") ||
        errMsg.toLowerCase().includes("api key");

      return NextResponse.json(
        {
          sucesso: false,
          erro: {
            tipo: isApiKeyError ? "ERRO_DESCONHECIDO" : "SIMBOLO_INVALIDO",
            mensagem: errMsg,
          },
        },
        { status: isApiKeyError ? 500 : 400 }
      );
    }

    const rateObj = data["Realtime Currency Exchange Rate"];
    if (!rateObj) {
      return NextResponse.json(
        {
          sucesso: false,
          erro: {
            tipo: "SIMBOLO_INVALIDO",
            mensagem: `Não foi possível obter a cotação para o par '${par}'.`,
          },
        },
        { status: 400 }
      );
    }

    const taxa = parseFloat(rateObj["5. Exchange Rate"]);
    const bid = parseFloat(rateObj["8. Bid Price"]);
    const ask = parseFloat(rateObj["9. Ask Price"]);

    if (isNaN(taxa) || isNaN(bid) || isNaN(ask)) {
      return NextResponse.json(
        {
          sucesso: false,
          erro: {
            tipo: "ERRO_DESCONHECIDO",
            mensagem: "Valores recebidos da API externa de câmbio não são números válidos.",
          },
        },
        { status: 502 }
      );
    }

    const dados = {
      origem: rateObj["1. From_Currency Code"],
      destino: rateObj["3. To_Currency Code"],
      taxa,
      bid,
      ask,
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
              : "Falha de rede ou de conexão com a API de câmbio.",
        },
      },
      { status: 503 }
    );
  }
}
