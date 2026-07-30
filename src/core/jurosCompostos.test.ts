import { describe, it, expect } from "vitest";
import { calcularJurosCompostos } from "./jurosCompostos";

describe("calcularJurosCompostos", () => {
  it("deve degenerar para juros compostos simples sobre o valor inicial quando o aporte mensal for zero", () => {
    const params = {
      valorInicial: 1000,
      aporteMensal: 0,
      taxaAnual: 10, // 10% a.a.
      periodoMeses: 12,
    };

    const resultado = calcularJurosCompostos(params);

    expect(resultado).toHaveLength(12);

    const ultimoPonto = resultado[11];
    // Sem aportes, após 12 meses (1 ano), o valorTotal deve ser exatamente igual a valorInicial * (1 + taxaAnual/100)
    // Com arredondamento mensal de centavos, aceitamos 1 centavo de tolerância em relação ao valor exato de 1100.00
    expect(ultimoPonto.valorTotal).toBeCloseTo(1100.00, 1);
    expect(Math.abs(ultimoPonto.valorTotal - 1100.00)).toBeLessThanOrEqual(0.01);
    expect(ultimoPonto.valorInvestido).toBe(1000.00);
    expect(ultimoPonto.jurosAcumulados).toBeCloseTo(100.00, 1);
    expect(Math.abs(ultimoPonto.jurosAcumulados - 100.00)).toBeLessThanOrEqual(0.01);
  });

  it("deve crescer apenas pelos aportes quando a taxa anual for zero (sem juros)", () => {
    const params = {
      valorInicial: 1000,
      aporteMensal: 150,
      taxaAnual: 0,
      periodoMeses: 6,
    };

    const resultado = calcularJurosCompostos(params);

    expect(resultado).toHaveLength(6);
    
    // Verifica cada mês da evolução
    resultado.forEach((ponto, index) => {
      const mes = index + 1;
      const investidoEsperado = 1000 + mes * 150;
      expect(ponto.valorInvestido).toBe(investidoEsperado);
      expect(ponto.valorTotal).toBe(investidoEsperado);
      expect(ponto.jurosAcumulados).toBe(0);
    });
  });

  it("deve calcular corretamente para o período de apenas 1 mês", () => {
    const params = {
      valorInicial: 1000,
      aporteMensal: 200,
      taxaAnual: 12, // 12% a.a.
      periodoMeses: 1,
    };

    // taxaMensal = (1 + 0.12)^(1/12) - 1 ≈ 0.0094887929
    // saldoComAporte = 1000 + 200 = 1200
    // juros = 1200 * 0.0094887929 ≈ 11.38655 => arredondado para 11.39
    // valorTotal = 1200 + 11.39 = 1211.39
    const resultado = calcularJurosCompostos(params);

    expect(resultado).toHaveLength(1);
    expect(resultado[0]).toEqual({
      mes: 1,
      valorInvestido: 1200.00,
      valorTotal: 1211.39,
      jurosAcumulados: 11.39,
    });
  });

  it("deve bater com um caso de referência calculado à mão / validado externamente com tolerância de 1 centavo", () => {
    const params = {
      valorInicial: 5000,
      aporteMensal: 300,
      taxaAnual: 8.5, // 8.5% a.a.
      periodoMeses: 6,
    };

    // Valores de referência pré-calculados usando arredondamento mensal de centavos:
    // Mês 1: (5000 + 300) * (1 + i_m) = 5300 * 1.006820... = 5336.15
    // Mês 6: saldo final = 7051.64
    // Em float puro (sem arredondamentos intermediários): 7051.634... (arredonda para 7051.63)
    // Tolerância exigida: máxima de 1 centavo de diferença do cálculo esperado
    const resultado = calcularJurosCompostos(params);

    expect(resultado).toHaveLength(6);

    const pontoFinal = resultado[5];
    expect(pontoFinal.valorInvestido).toBe(6800.00);
    // Verifica proximidade do float puro (7051.63) com tolerância de 1 centavo
    expect(Math.abs(pontoFinal.valorTotal - 7051.63)).toBeLessThanOrEqual(0.011);
    
    // Verifica valores exatos gerados pelo arredondamento discreto
    expect(pontoFinal.valorTotal).toBe(7051.64);
    expect(pontoFinal.jurosAcumulados).toBe(251.64);
  });

  it("deve lançar um erro descritivo para entradas inválidas", () => {
    // Período menor ou igual a zero
    expect(() => {
      calcularJurosCompostos({
        valorInicial: 1000,
        aporteMensal: 100,
        taxaAnual: 10,
        periodoMeses: 0,
      });
    }).toThrow("O período em meses deve ser maior que zero.");

    expect(() => {
      calcularJurosCompostos({
        valorInicial: 1000,
        aporteMensal: 100,
        taxaAnual: 10,
        periodoMeses: -5,
      });
    }).toThrow("O período em meses deve ser maior que zero.");

    // Taxa anual negativa
    expect(() => {
      calcularJurosCompostos({
        valorInicial: 1000,
        aporteMensal: 100,
        taxaAnual: -1.5,
        periodoMeses: 12,
      });
    }).toThrow("A taxa de juros anual não pode ser negativa.");

    // Valor inicial negativo
    expect(() => {
      calcularJurosCompostos({
        valorInicial: -100,
        aporteMensal: 100,
        taxaAnual: 10,
        periodoMeses: 12,
      });
    }).toThrow("O valor inicial não pode ser negativo.");

    // Aporte mensal negativo
    expect(() => {
      calcularJurosCompostos({
        valorInicial: 1000,
        aporteMensal: -50,
        taxaAnual: 10,
        periodoMeses: 12,
      });
    }).toThrow("O aporte mensal não pode ser negativo.");
  });
});
