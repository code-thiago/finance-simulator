import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/src/lib/auth";
import { db } from "@/src/db";
import { simulacoes } from "@/src/db/schema";

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json(
        { erro: { mensagem: "Não autorizado. Faça login para salvar simulações." } },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { erro: { mensagem: "Corpo da requisição inválido." } },
        { status: 400 }
      );
    }

    const { tipo, parametros, nome } = body;

    if (tipo !== "juros_compostos" && tipo !== "comparador") {
      return NextResponse.json(
        {
          erro: {
            mensagem:
              "Tipo de simulação inválido. Esperado 'juros_compostos' ou 'comparador'.",
          },
        },
        { status: 400 }
      );
    }

    if (!parametros || typeof parametros !== "object" || Object.keys(parametros).length === 0) {
      return NextResponse.json(
        { erro: { mensagem: "Parâmetros da simulação são obrigatórios." } },
        { status: 400 }
      );
    }

    const nomeFormatado =
      typeof nome === "string" && nome.trim().length > 0 ? nome.trim() : null;

    const [novaSimulacao] = await db
      .insert(simulacoes)
      .values({
        userId: session.user.id,
        tipo,
        nome: nomeFormatado,
        parametros,
      })
      .returning();

    return NextResponse.json(novaSimulacao, { status: 201 });
  } catch (error) {
    console.error("Erro ao salvar simulação:", error);
    return NextResponse.json(
      { erro: { mensagem: "Erro interno do servidor ao salvar a simulação." } },
      { status: 500 }
    );
  }
}
