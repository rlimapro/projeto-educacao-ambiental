import type { FatorEmissao, Perfil } from './tipos';

const todosPerfis: Perfil[] = ['pessoa', 'residencia', 'comercio'];

// Valores, unidades, fontes e anos vêm de docs/metodologia-calculo.md.
export const FATORES_EMISSAO = {
  energia: {
    id: 'energia',
    nome: 'Energia elétrica',
    unidadeEntrada: 'kWh',
    valor: 0.0461,
    unidadeFator: 'kg CO₂/kWh',
    fonte: 'MCTI, Fator médio anual do SIN para inventários, ano-base 2025',
    ano: 2025,
    versao: 1,
    perfis: todosPerfis,
  },
  gasolinaE30: {
    id: 'gasolina-e30',
    nome: 'Gasolina',
    unidadeEntrada: 'L',
    valor: 1.6187,
    unidadeFator: 'kg CO₂e/L',
    fonte: 'IPCC 2006; BEN 2025; IPCC AR6; mistura CNPE de 30%',
    ano: 2025,
    versao: 1,
    perfis: todosPerfis,
  },
  gasolinaE32: {
    id: 'gasolina-e32',
    nome: 'Gasolina',
    unidadeEntrada: 'L',
    valor: 1.5738,
    unidadeFator: 'kg CO₂e/L',
    fonte: 'IPCC 2006; BEN 2025; IPCC AR6; mistura CNPE de 32%',
    ano: 2026,
    versao: 2,
    perfis: todosPerfis,
  },
  etanol: {
    id: 'etanol',
    nome: 'Etanol',
    unidadeEntrada: 'L',
    valor: 0.0436,
    unidadeFator: 'kg CO₂e/L',
    fonte: 'IPCC 2006; BEN 2025; IPCC AR6',
    ano: 2025,
    versao: 1,
    perfis: todosPerfis,
  },
  diesel: {
    id: 'diesel',
    nome: 'Diesel',
    unidadeEntrada: 'L',
    valor: 2.2788,
    unidadeFator: 'kg CO₂e/L',
    fonte: 'IPCC 2006; BEN 2025; IPCC AR6; mistura CNPE de 15%',
    ano: 2025,
    versao: 1,
    perfis: todosPerfis,
  },
  glp: {
    id: 'glp',
    nome: 'Gás de cozinha',
    unidadeEntrada: 'kg',
    valor: 2.9407,
    unidadeFator: 'kg CO₂e/kg',
    fonte: 'IPCC 2006; BEN 2025; IPCC AR6',
    ano: 2025,
    versao: 1,
    perfis: todosPerfis,
  },
} satisfies Record<string, FatorEmissao>;

export function selecionarFatorGasolina(ano: number, mes: number): FatorEmissao {
  if (!Number.isInteger(ano) || !Number.isInteger(mes) || mes < 1 || mes > 12) {
    throw new Error('Período inválido para selecionar o fator de gasolina');
  }
  if (ano < 2025 || (ano === 2025 && mes < 8)) {
    throw new Error('Não há fator de gasolina aprovado para esse período');
  }
  return ano > 2026 || (ano === 2026 && mes >= 8)
    ? FATORES_EMISSAO.gasolinaE32
    : FATORES_EMISSAO.gasolinaE30;
}
