/**
 * Interface que representa os parâmetros necessários para a simulação de juros compostos.
 */
export interface ParametrosSimulacao {
  valorInicial: number;
  aporteMensal: number;
  taxaAnual: number; // em %, ex: 12 = 12% a.a.
  periodoMeses: number;
}

/**
 * Interface que representa o estado da evolução patrimonial em um determinado mês.
 */
export interface PontoEvolucao {
  mes: number;
  valorInvestido: number;
  valorTotal: number;
  jurosAcumulados: number;
}

/**
 * Calcula a evolução de um investimento sob regime de juros compostos com aportes mensais periódicos.
 *
 * Convenção adotada:
 * O aporte mensal é aplicado no **início** de cada período (mês).
 * Isso significa que, no início de cada mês, o aporte é somado ao saldo do mês anterior
 * e a taxa de juros mensal equivalente é aplicada sobre o montante consolidado resultante.
 *
 * Tratamento de Ponto Flutuante:
 * Para evitar o acúmulo de erros de ponto flutuante comuns em JavaScript/TypeScript ao longo de simulações longas
 * (de até 360 iterações / 30 anos), todos os cálculos monetários internos são efetuados em centavos (valores inteiros).
 * O arredondamento (Math.round) é realizado a cada capitalização mensal.
 * Isso simula com precisão o comportamento de contas de investimento reais (onde centavos são discretizados mensalmente)
 * e impede o surgimento e propagação de imprecisões de ponto flutuante (como dízimas da multiplicação com taxa)
 * ao longo de centenas de passos. A conversão de volta para reais (divisão por 100) é feita apenas no retorno.
 *
 * @param params Parâmetros para a simulação de juros compostos.
 * @returns Um array contendo a evolução mensal detalhada do mês 1 até o periodoMeses.
 * @throws Error se periodoMeses for menor ou igual a zero, ou se a taxaAnual for negativa, ou se valorInicial ou aporteMensal forem negativos.
 */
export function calcularJurosCompostos(params: ParametrosSimulacao): PontoEvolucao[] {
  const { valorInicial, aporteMensal, taxaAnual, periodoMeses } = params;

  // Validações de entrada
  if (periodoMeses <= 0) {
    throw new Error("O período em meses deve ser maior que zero.");
  }
  if (taxaAnual < 0) {
    throw new Error("A taxa de juros anual não pode ser negativa.");
  }
  if (valorInicial < 0) {
    throw new Error("O valor inicial não pode ser negativo.");
  }
  if (aporteMensal < 0) {
    throw new Error("O aporte mensal não pode ser negativo.");
  }

  const pontos: PontoEvolucao[] = [];

  // Conversão matematicamente correta de taxa anual para taxa mensal equivalente
  // (1 + i_anual) = (1 + i_mensal)^12 => i_mensal = (1 + i_anual)^(1/12) - 1
  const taxaMensal = Math.pow(1 + taxaAnual / 100, 1 / 12) - 1;

  // Convertendo os valores de entrada para centavos (inteiros)
  const valorInicialCents = Math.round(valorInicial * 100);
  const aporteMensalCents = Math.round(aporteMensal * 100);

  let saldoCents = valorInicialCents;

  for (let mes = 1; mes <= periodoMeses; mes++) {
    // 1. O aporte mensal é aplicado no início do mês
    const saldoComAporte = saldoCents + aporteMensalCents;

    // 2. Os juros são capitalizados sobre o saldo com aporte
    saldoCents = Math.round(saldoComAporte * (1 + taxaMensal));

    // 3. Cálculo do valor total investido acumulado (sem juros) em centavos
    const valorInvestidoCents = valorInicialCents + mes * aporteMensalCents;

    // 4. Os juros acumulados são o saldo atual menos o total investido
    const jurosAcumuladosCents = saldoCents - valorInvestidoCents;

    // Adiciona o ponto de evolução mensal, convertendo de volta para reais
    pontos.push({
      mes,
      valorInvestido: valorInvestidoCents / 100,
      valorTotal: saldoCents / 100,
      jurosAcumulados: jurosAcumuladosCents / 100,
    });
  }

  return pontos;
}
