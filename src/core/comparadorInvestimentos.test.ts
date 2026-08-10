import { describe, it, expect } from "vitest";
import {
  calcularAliquotaIR,
  calcularRendimentoCDB,
  calcularRendimentoTesouroSelic,
  calcularRendimentoPoupanca,
  compararInvestimentos,
} from "./comparadorInvestimentos";

describe("comparadorInvestimentos", () => {
  describe("calcularAliquotaIR", () => {
    it("deve retornar 22.5% para períodos de até 6 meses", () => {
      expect(calcularAliquotaIR(1)).toBe(22.5);
      expect(calcularAliquotaIR(3)).toBe(22.5);
      expect(calcularAliquotaIR(6)).toBe(22.5);
    });

    it("deve retornar 20.0% para períodos de 6 a 12 meses", () => {
      expect(calcularAliquotaIR(7)).toBe(20.0);
      expect(calcularAliquotaIR(12)).toBe(20.0);
    });

    it("deve retornar 17.5% para períodos de 12 a 24 meses", () => {
      expect(calcularAliquotaIR(13)).toBe(17.5);
      expect(calcularAliquotaIR(18)).toBe(17.5);
      expect(calcularAliquotaIR(24)).toBe(17.5);
    });

    it("deve retornar 15.0% para períodos acima de 24 meses", () => {
      expect(calcularAliquotaIR(25)).toBe(15.0);
      expect(calcularAliquotaIR(30)).toBe(15.0);
      expect(calcularAliquotaIR(120)).toBe(15.0);
    });

    it("deve lançar erro descritivo para período em meses inválido", () => {
      expect(() => calcularAliquotaIR(0)).toThrow("O período em meses deve ser maior que zero.");
      expect(() => calcularAliquotaIR(-5)).toThrow("O período em meses deve ser maior que zero.");
    });
  });

  describe("calcularRendimentoCDB", () => {
    it("deve bater com o caso de referência calculado à mão com tolerância de 1 centavo", () => {
      // Parâmetros de referência:
      // valorInicial = 5000
      // periodoMeses = 6
      // taxaSelicAnual = 10
      // percentualCDI = 110 (ou seja, CDI Anual = 11%)
      // taxaCDIMensal = (1.11)^(1/12) - 1 ≈ 0.008741328
      //
      // Evolução do saldo em centavos:
      // M0: 500000
      // M1: Math.round(500000 * 1.008741328) = 504371
      // M2: Math.round(504371 * 1.008741328) = 508780
      // M3: Math.round(508780 * 1.008741328) = 513227
      // M4: Math.round(513227 * 1.008741328) = 517714
      // M5: Math.round(517714 * 1.008741328) = 522238
      // M6: Math.round(522238 * 1.008741328) = 526803
      //
      // Valor Bruto = 5267.82
      // Rendimento Bruto = 267.82
      // Alíquota IR = 22.5% (para 6 meses)
      // Imposto = Math.round(26782 * 0.225) = 6026 cents (60.26)
      // Valor Líquido = 5267.82 - 60.26 = 5207.56
      // Rendimento Líquido = 207.56
      const params = {
        valorInicial: 5000,
        periodoMeses: 6,
        taxaSelicAnual: 10,
        percentualCDI: 110,
      };

      const resultado = calcularRendimentoCDB(params);

      expect(resultado.produto).toBe("CDB");
      expect(resultado.valorBruto).toBeCloseTo(5267.82, 1);
      expect(Math.abs(resultado.valorBruto - 5267.82)).toBeLessThanOrEqual(0.01);

      expect(resultado.aliquotaIR).toBe(22.5);
      
      expect(resultado.valorLiquido).toBeCloseTo(5207.56, 1);
      expect(Math.abs(resultado.valorLiquido - 5207.56)).toBeLessThanOrEqual(0.01);

      expect(resultado.rendimentoLiquido).toBeCloseTo(207.56, 1);
      expect(Math.abs(resultado.rendimentoLiquido - 207.56)).toBeLessThanOrEqual(0.01);
    });
  });

  describe("calcularRendimentoTesouroSelic", () => {
    it("deve bater com o caso de referência calculado à mão com tolerância de 1 centavo", () => {
      // Parâmetros de referência:
      // valorInicial = 5000
      // periodoMeses = 6
      // taxaSelicAnual = 10
      // percentualCDI = 100 (não interfere no Tesouro, mas é obrigatório no parâmetro)
      // taxaCustodiaTesouroAnual = 0.20
      // taxaSelicMensal = (1.10)^(1/12) - 1 ≈ 0.007974140
      //
      // Evolução do saldo em centavos:
      // M0: 500000
      // M1: Math.round(500000 * 1.007974140) = 503987
      // M2: Math.round(503987 * 1.007974140) = 508006
      // M3: Math.round(508006 * 1.007974140) = 512057
      // M4: Math.round(512057 * 1.007974140) = 516140
      // M5: Math.round(516140 * 1.007974140) = 520256
      // M6: Math.round(520256 * 1.007974140) = 524405
      //
      // Valor Bruto = 5244.05
      // Taxa de Custódia = Math.round(524405 * (0.002 * (6 / 12))) = Math.round(524405 * 0.001) = 524 cents (5.24)
      // Rendimento Líquido de Custódia = 24405 - 524 = 23881 cents (238.81)
      // Alíquota IR = 22.5% (para 6 meses)
      // Imposto = Math.round(23881 * 0.225) = 5373 cents (53.73)
      // Valor Líquido = 5244.05 - 5.24 - 53.73 = 5185.08
      // Rendimento Líquido = 185.08
      const params = {
        valorInicial: 5000,
        periodoMeses: 6,
        taxaSelicAnual: 10,
        percentualCDI: 100,
        taxaCustodiaTesouroAnual: 0.20,
      };

      const resultado = calcularRendimentoTesouroSelic(params);

      expect(resultado.produto).toBe("TESOURO_SELIC");
      expect(resultado.valorBruto).toBeCloseTo(5244.05, 1);
      expect(Math.abs(resultado.valorBruto - 5244.05)).toBeLessThanOrEqual(0.01);

      expect(resultado.aliquotaIR).toBe(22.5);

      expect(resultado.valorLiquido).toBeCloseTo(5185.08, 1);
      expect(Math.abs(resultado.valorLiquido - 5185.08)).toBeLessThanOrEqual(0.01);

      expect(resultado.rendimentoLiquido).toBeCloseTo(185.08, 1);
      expect(Math.abs(resultado.rendimentoLiquido - 185.08)).toBeLessThanOrEqual(0.01);
    });
  });

  describe("calcularRendimentoPoupanca", () => {
    it("deve calcular corretamente para Selic acima de 8,5% (usando 0,5% a.m. + TR)", () => {
      // Parâmetros de referência:
      // valorInicial = 5000
      // periodoMeses = 6
      // taxaSelicAnual = 10 (ou seja, > 8.5%)
      // taxaReferencialMensal = 0
      //
      // Taxa Poupança Mensal = 0.5% (0.005)
      // Evolução do saldo em centavos:
      // M0: 500000
      // M1: Math.round(500000 * 1.005) = 502500
      // M2: Math.round(502500 * 1.005) = 505012
      // M3: Math.round(505012 * 1.005) = 507537
      // M4: Math.round(507537 * 1.005) = 510075
      // M5: Math.round(510075 * 1.005) = 512625
      // M6: Math.round(512625 * 1.005) = 515188
      //
      // Valor Bruto = 5151.88
      // Isenta de IR
      // Valor Líquido = 5151.88
      // Rendimento Líquido = 151.88
      const params = {
        valorInicial: 5000,
        periodoMeses: 6,
        taxaSelicAnual: 10,
        percentualCDI: 100,
        taxaReferencialMensal: 0,
      };

      const resultado = calcularRendimentoPoupanca(params);

      expect(resultado.produto).toBe("POUPANCA");
      expect(resultado.valorBruto).toBeCloseTo(5151.88, 1);
      expect(Math.abs(resultado.valorBruto - 5151.88)).toBeLessThanOrEqual(0.01);
      expect(resultado.aliquotaIR).toBeNull();
      expect(resultado.valorLiquido).toBe(resultado.valorBruto);
      expect(resultado.rendimentoLiquido).toBeCloseTo(151.88, 1);
    });

    it("deve calcular corretamente para Selic igual ou abaixo de 8,5% (usando 70% da Selic mensal + TR)", () => {
      // Parâmetros de referência:
      // valorInicial = 5000
      // periodoMeses = 6
      // taxaSelicAnual = 8.0 (ou seja, <= 8.5%)
      // taxaReferencialMensal = 0
      //
      // taxaSelicMensal = (1.08)^(1/12) - 1 ≈ 0.00643403
      // taxaPoupancaMensal = 0.70 * 0.00643403 ≈ 0.00450382
      //
      // Evolução do saldo em centavos:
      // M0: 500000
      // M1: Math.round(500000 * 1.00450382) = 502252
      // M2: Math.round(502252 * 1.00450382) = 504514
      // M3: Math.round(504514 * 1.00450382) = 506786
      // M4: Math.round(506786 * 1.00450382) = 509068
      // M5: Math.round(509068 * 1.00450382) = 511361
      // M6: Math.round(511361 * 1.00450382) = 513664
      //
      // Valor Bruto = 5136.64
      // Isenta de IR
      // Valor Líquido = 5136.64
      // Rendimento Líquido = 136.64
      const params = {
        valorInicial: 5000,
        periodoMeses: 6,
        taxaSelicAnual: 8.0,
        percentualCDI: 100,
        taxaReferencialMensal: 0,
      };

      const resultado = calcularRendimentoPoupanca(params);

      expect(resultado.produto).toBe("POUPANCA");
      expect(resultado.valorBruto).toBeCloseTo(5136.64, 1);
      expect(Math.abs(resultado.valorBruto - 5136.64)).toBeLessThanOrEqual(0.01);
      expect(resultado.aliquotaIR).toBeNull();
      expect(resultado.valorLiquido).toBe(resultado.valorBruto);
      expect(resultado.rendimentoLiquido).toBeCloseTo(136.64, 1);
    });
  });

  describe("compararInvestimentos", () => {
    it("deve retornar ordenado do maior para o menor valor líquido e Tesouro Selic deve superar a Poupança", () => {
      // Sanity check do enunciado:
      // taxaSelicAnual = 10, periodoMeses = 24
      // Tesouro Selic deve superar a Poupança em valor líquido.
      const params = {
        valorInicial: 1000,
        periodoMeses: 24,
        taxaSelicAnual: 10,
        percentualCDI: 100,
      };

      const resultados = compararInvestimentos(params);

      expect(resultados).toHaveLength(3);

      // Verificação da ordenação decrescente de valor líquido
      expect(resultados[0].valorLiquido).toBeGreaterThanOrEqual(resultados[1].valorLiquido);
      expect(resultados[1].valorLiquido).toBeGreaterThanOrEqual(resultados[2].valorLiquido);

      // Garantir que Tesouro Selic e Poupança estão na lista e comparar seus valores líquidos
      const tesouro = resultados.find((r) => r.produto === "TESOURO_SELIC");
      const poupanca = resultados.find((r) => r.produto === "POUPANCA");

      expect(tesouro).toBeDefined();
      expect(poupanca).toBeDefined();
      expect(tesouro!.valorLiquido).toBeGreaterThan(poupanca!.valorLiquido);
    });
  });

  describe("Validação de Entradas Inválidas", () => {
    const defaultParams = {
      valorInicial: 1000,
      periodoMeses: 12,
      taxaSelicAnual: 10.5,
      percentualCDI: 100,
    };

    it("deve lançar erro se valorInicial < 0", () => {
      expect(() => calcularRendimentoCDB({ ...defaultParams, valorInicial: -1 })).toThrow(
        "O valor inicial não pode ser negativo."
      );
      expect(() => calcularRendimentoTesouroSelic({ ...defaultParams, valorInicial: -50 })).toThrow(
        "O valor inicial não pode ser negativo."
      );
      expect(() => calcularRendimentoPoupanca({ ...defaultParams, valorInicial: -0.01 })).toThrow(
        "O valor inicial não pode ser negativo."
      );
      expect(() => compararInvestimentos({ ...defaultParams, valorInicial: -1000 })).toThrow(
        "O valor inicial não pode ser negativo."
      );
    });

    it("deve lançar erro se periodoMeses <= 0", () => {
      expect(() => calcularRendimentoCDB({ ...defaultParams, periodoMeses: 0 })).toThrow(
        "O período em meses deve ser maior que zero."
      );
      expect(() => calcularRendimentoTesouroSelic({ ...defaultParams, periodoMeses: -3 })).toThrow(
        "O período em meses deve ser maior que zero."
      );
      expect(() => calcularRendimentoPoupanca({ ...defaultParams, periodoMeses: 0 })).toThrow(
        "O período em meses deve ser maior que zero."
      );
      expect(() => compararInvestimentos({ ...defaultParams, periodoMeses: -12 })).toThrow(
        "O período em meses deve ser maior que zero."
      );
    });

    it("deve lançar erro se taxaSelicAnual < 0", () => {
      expect(() => calcularRendimentoCDB({ ...defaultParams, taxaSelicAnual: -0.5 })).toThrow(
        "A taxa Selic anual não pode ser negativa."
      );
      expect(() => calcularRendimentoTesouroSelic({ ...defaultParams, taxaSelicAnual: -10 })).toThrow(
        "A taxa Selic anual não pode ser negativa."
      );
      expect(() => calcularRendimentoPoupanca({ ...defaultParams, taxaSelicAnual: -1.5 })).toThrow(
        "A taxa Selic anual não pode ser negativa."
      );
      expect(() => compararInvestimentos({ ...defaultParams, taxaSelicAnual: -5 })).toThrow(
        "A taxa Selic anual não pode ser negativa."
      );
    });

    it("deve lançar erro se percentualCDI < 0", () => {
      expect(() => calcularRendimentoCDB({ ...defaultParams, percentualCDI: -10 })).toThrow(
        "O percentual do CDI não pode ser negativo."
      );
      expect(() => compararInvestimentos({ ...defaultParams, percentualCDI: -1 })).toThrow(
        "O percentual do CDI não pode ser negativo."
      );
    });

    it("deve lançar erro se taxaCustodiaTesouroAnual < 0", () => {
      expect(() =>
        calcularRendimentoTesouroSelic({ ...defaultParams, taxaCustodiaTesouroAnual: -0.1 })
      ).toThrow("A taxa de custódia do Tesouro Direto não pode ser negativa.");
    });

    it("deve lançar erro se taxaReferencialMensal < 0", () => {
      expect(() =>
        calcularRendimentoPoupanca({ ...defaultParams, taxaReferencialMensal: -0.05 })
      ).toThrow("A taxa referencial mensal não pode ser negativa.");
    });
  });
});
