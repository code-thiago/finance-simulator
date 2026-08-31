// Instância única de Intl.NumberFormat criada em nível de módulo para pt-BR / BRL
export const formatadorMoeda = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

/**
 * Formata um valor numérico para moeda brasileira (R$ 0,00) de forma performática.
 */
export function formatarMoeda(valor: number): string {
  return formatadorMoeda.format(valor);
}

// Alias para compatibilidade semântica quando chamado como formatarReal
export const formatarReal = formatarMoeda;
