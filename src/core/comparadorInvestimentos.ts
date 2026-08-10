/**
 * Interface que representa os parâmetros de entrada para o comparador de investimentos.
 */
export interface ParametrosComparador {
  valorInicial: number;
  periodoMeses: number;
  taxaSelicAnual: number; // em %, ex: 10.5
  percentualCDI: number; // em %, ex: 100 para 100% do CDI
  taxaCustodiaTesouroAnual?: number; // em %, padrão 0.20
  taxaReferencialMensal?: number; // em %, padrão 0
}

/**
 * Interface que representa o resultado da simulação para um produto de investimento específico.
 */
export interface ResultadoInvestimento {
  produto: "CDB" | "TESOURO_SELIC" | "POUPANCA";
  valorBruto: number;
  valorLiquido: number;
  rendimentoLiquido: number;
  aliquotaIR: number | null; // null para poupança
}

/**
 * Calcula a alíquota regressiva do Imposto de Renda (IR) com base no período da aplicação em meses.
 *
 * Simplificação assumida:
 * A contagem do período é feita em meses fechados de aplicação, e não em dias corridos exatos.
 * Na prática brasileira, a tabela regressiva considera dias corridos (180, 360, 720 dias).
 *
 * Faixas da alíquota de IR:
 * - Até 6 meses (inclusive): 22,5%
 * - De 6 a 12 meses (inclusive): 20,0%
 * - De 12 a 24 meses (inclusive): 17,5%
 * - Acima de 24 meses: 15,0%
 *
 * @param periodoMeses O período da aplicação em meses.
 * @returns A alíquota do IR como percentual (ex: 22.5).
 * @throws Error se o período em meses for menor ou igual a zero.
 */
export function calcularAliquotaIR(periodoMeses: number): number {
  if (periodoMeses <= 0) {
    throw new Error("O período em meses deve ser maior que zero.");
  }
  if (periodoMeses <= 6) return 22.5;
  if (periodoMeses <= 12) return 20.0;
  if (periodoMeses <= 24) return 17.5;
  return 15.0;
}

/**
 * Valida os parâmetros de entrada para garantir que não há valores inválidos (negativos ou zerados onde não permitido).
 *
 * @param params Parâmetros a serem validados.
 * @throws Error se qualquer parâmetro for inválido.
 */
function validarParametros(params: ParametrosComparador): void {
  const { valorInicial, periodoMeses, taxaSelicAnual, percentualCDI } = params;

  if (valorInicial < 0) {
    throw new Error("O valor inicial não pode ser negativo.");
  }
  if (periodoMeses <= 0) {
    throw new Error("O período em meses deve ser maior que zero.");
  }
  if (taxaSelicAnual < 0) {
    throw new Error("A taxa Selic anual não pode ser negativa.");
  }
  if (percentualCDI < 0) {
    throw new Error("O percentual do CDI não pode ser negativo.");
  }
  if (params.taxaCustodiaTesouroAnual !== undefined && params.taxaCustodiaTesouroAnual < 0) {
    throw new Error("A taxa de custódia do Tesouro Direto não pode ser negativa.");
  }
  if (params.taxaReferencialMensal !== undefined && params.taxaReferencialMensal < 0) {
    throw new Error("A taxa referencial mensal não pode ser negativa.");
  }
}

/**
 * Calcula o rendimento de um CDB pós-fixado indexado ao CDI.
 *
 * Simplificações assumidas:
 * 1. A taxa Selic anual é utilizada como proxy direto da taxa CDI anual, dada a forte proximidade histórica entre ambas no mercado brasileiro.
 * 2. O rendimento é calculado em regime de juros compostos com capitalização mensal.
 *
 * Convenção de Ponto Flutuante:
 * A simulação opera internamente em centavos (valores inteiros) com arredondamento mensal do saldo acumulado (Math.round)
 * para evitar distorções de precisão e simular com precisão a apuração de saldos de contas de investimento.
 * A conversão de volta para reais ocorre apenas no retorno final.
 *
 * @param params Parâmetros do comparador.
 * @returns O resultado detalhado do investimento em CDB.
 */
export function calcularRendimentoCDB(params: ParametrosComparador): ResultadoInvestimento {
  validarParametros(params);

  const { valorInicial, periodoMeses, taxaSelicAnual, percentualCDI } = params;

  // CDI Anual estimado com Selic como proxy
  const taxaCDIAnual = (taxaSelicAnual * percentualCDI) / 100;
  // Conversão de taxa anual para taxa mensal equivalente
  const taxaMensal = Math.pow(1 + taxaCDIAnual / 100, 1 / 12) - 1;

  const valorInicialCents = Math.round(valorInicial * 100);
  let saldoCents = valorInicialCents;

  for (let mes = 1; mes <= periodoMeses; mes++) {
    saldoCents = Math.round(saldoCents * (1 + taxaMensal));
  }

  const rendimentoBrutoCents = saldoCents - valorInicialCents;
  const aliquota = calcularAliquotaIR(periodoMeses);
  const impostoCents = Math.round(rendimentoBrutoCents * (aliquota / 100));
  const valorLiquidoCents = saldoCents - impostoCents;
  const rendimentoLiquidoCents = valorLiquidoCents - valorInicialCents;

  return {
    produto: "CDB",
    valorBruto: saldoCents / 100,
    valorLiquido: valorLiquidoCents / 100,
    rendimentoLiquido: rendimentoLiquidoCents / 100,
    aliquotaIR: aliquota,
  };
}

/**
 * Calcula o rendimento do Tesouro Selic.
 *
 * Simplificações assumidas:
 * 1. O rendimento bruto é calculado em regime de juros compostos capitalizados mensalmente à taxa Selic.
 * 2. A taxa de custódia da B3 é calculada pro-rata mensalmente sobre o montante final bruto acumulado da aplicação,
 *    representando de forma simplificada o provisionamento diário oficial.
 *
 * ATENÇÃO: A taxa de custódia padrão adotada é de 0,20% a.a. (parâmetro taxaCustodiaTesouroAnual),
 * mas este percentual deve ser confirmado contra a tabela vigente da B3, pois pode ser alterado pela entidade.
 *
 * Imposto de Renda:
 * O IR incide de forma regressiva sobre o rendimento líquido da taxa de custódia (rendimento bruto - taxa de custódia).
 *
 * Convenção de Ponto Flutuante:
 * A simulação opera internamente em centavos (valores inteiros) com arredondamento mensal do saldo acumulado (Math.round).
 *
 * @param params Parâmetros do comparador.
 * @returns O resultado detalhado do investimento em Tesouro Selic.
 */
export function calcularRendimentoTesouroSelic(params: ParametrosComparador): ResultadoInvestimento {
  validarParametros(params);

  const { valorInicial, periodoMeses, taxaSelicAnual } = params;
  const taxaCustodiaAnual = params.taxaCustodiaTesouroAnual !== undefined ? params.taxaCustodiaTesouroAnual : 0.20;

  // Conversão da Selic anual para taxa mensal equivalente
  const taxaMensalSelic = Math.pow(1 + taxaSelicAnual / 100, 1 / 12) - 1;

  const valorInicialCents = Math.round(valorInicial * 100);
  let saldoCents = valorInicialCents;

  for (let mes = 1; mes <= periodoMeses; mes++) {
    saldoCents = Math.round(saldoCents * (1 + taxaMensalSelic));
  }

  // Custódia B3: pro-rata mensal baseada no saldo bruto final acumulado
  const taxaCustodiaTotalProRata = (taxaCustodiaAnual / 100) * (periodoMeses / 12);
  const custodiaCents = Math.round(saldoCents * taxaCustodiaTotalProRata);

  const rendimentoBrutoCents = saldoCents - valorInicialCents;
  // O rendimento líquido da taxa de custódia (base do IR)
  const rendimentoLiquidoCustodiaCents = rendimentoBrutoCents - custodiaCents;
  const baseCalculoIRCents = Math.max(0, rendimentoLiquidoCustodiaCents);

  const aliquota = calcularAliquotaIR(periodoMeses);
  const impostoCents = Math.round(baseCalculoIRCents * (aliquota / 100));

  const valorLiquidoCents = saldoCents - custodiaCents - impostoCents;
  const rendimentoLiquidoCents = valorLiquidoCents - valorInicialCents;

  return {
    produto: "TESOURO_SELIC",
    valorBruto: saldoCents / 100,
    valorLiquido: valorLiquidoCents / 100,
    rendimentoLiquido: rendimentoLiquidoCents / 100,
    aliquotaIR: aliquota,
  };
}

/**
 * Calcula o rendimento da Caderneta de Poupança (Lei 12.703/2012).
 *
 * Regras de rendimento:
 * 1. Se a taxa Selic anual for maior que 8,5% a.a.: Rende 0,5% a.m. + TR (Taxa Referencial).
 * 2. Se a taxa Selic anual for menor ou igual a 8,5% a.a.: Rende 70% da Selic anual convertida para taxa mensal + TR.
 *
 * Imposto de Renda:
 * A poupança é isenta de imposto de renda para pessoas físicas (aliquotaIR retorna null).
 *
 * Convenção de Ponto Flutuante:
 * A simulação opera internamente em centavos (valores inteiros) com arredondamento mensal do saldo acumulado (Math.round).
 *
 * @param params Parâmetros do comparador.
 * @returns O resultado detalhado do investimento em Poupança.
 */
export function calcularRendimentoPoupanca(params: ParametrosComparador): ResultadoInvestimento {
  validarParametros(params);

  const { valorInicial, periodoMeses, taxaSelicAnual } = params;
  const taxaReferencialMensal = params.taxaReferencialMensal !== undefined ? params.taxaReferencialMensal : 0;

  let taxaMensalPoupanca = 0;

  if (taxaSelicAnual > 8.5) {
    // 0,5% ao mês + TR
    taxaMensalPoupanca = 0.5 / 100 + taxaReferencialMensal / 100;
  } else {
    // 70% da Selic (convertida para taxa mensal equivalente) + TR
    const taxaMensalSelic = Math.pow(1 + taxaSelicAnual / 100, 1 / 12) - 1;
    taxaMensalPoupanca = 0.70 * taxaMensalSelic + taxaReferencialMensal / 100;
  }

  const valorInicialCents = Math.round(valorInicial * 100);
  let saldoCents = valorInicialCents;

  for (let mes = 1; mes <= periodoMeses; mes++) {
    saldoCents = Math.round(saldoCents * (1 + taxaMensalPoupanca));
  }

  const valorBruto = saldoCents / 100;
  const valorLiquido = valorBruto;
  const rendimentoLiquidoCents = saldoCents - valorInicialCents;

  return {
    produto: "POUPANCA",
    valorBruto,
    valorLiquido,
    rendimentoLiquido: rendimentoLiquidoCents / 100,
    aliquotaIR: null,
  };
}

/**
 * Compara o rendimento líquido de CDB, Tesouro Selic e Poupança sob os mesmos parâmetros de simulação.
 *
 * Os resultados são retornados ordenados em ordem decrescente de valor líquido acumulado
 * (o produto mais rentável encabeça a lista).
 *
 * @param params Parâmetros do comparador.
 * @returns Array contendo os resultados ordenados dos três produtos.
 */
export function compararInvestimentos(params: ParametrosComparador): ResultadoInvestimento[] {
  validarParametros(params);

  const cdb = calcularRendimentoCDB(params);
  const tesouro = calcularRendimentoTesouroSelic(params);
  const poupanca = calcularRendimentoPoupanca(params);

  const resultados = [cdb, tesouro, poupanca];

  // Ordena por valor líquido decrescente
  return resultados.sort((a, b) => b.valorLiquido - a.valorLiquido);
}
