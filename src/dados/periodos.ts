import type { EmissaoFonte } from '@/calculo/tipos';

// Períodos registrados pelo usuário.
//
// PROVISÓRIO: enquanto o registro de consumos (RF02) e o banco não existem,
// esta função devolve dados de exemplo, fixos no código. Os totais seguem o
// protótipo no Figma (telas Início e Histórico): outubro 245 kg, setembro 278,
// agosto 302, julho 280. A divisão por fonte dos meses anteriores a outubro é
// inventada só para a tela ter o que mostrar. Nenhum valor aqui vem de fator
// de emissão; quando o registro existir, esta função passa a ler do SQLite e
// os dados de exemplo saem do app.

export type PeriodoRegistrado = {
  // Ano e mês no formato AAAA-MM.
  id: string;
  ano: number;
  // 1 a 12.
  mes: number;
  fontes: EmissaoFonte[];
  // Quantas sugestões de redução existem para a maior fonte (RF08).
  quantidadeSugestoes: number;
};

const fontes = (combustivel: number, gas: number, energia: number): EmissaoFonte[] => [
  { id: 'combustivel', nome: 'Combustível', emissaoKgCo2e: combustivel },
  { id: 'gas', nome: 'Gás de cozinha', emissaoKgCo2e: gas },
  { id: 'energia', nome: 'Energia elétrica', emissaoKgCo2e: energia },
];

const periodosDeExemplo: PeriodoRegistrado[] = [
  { id: '2026-10', ano: 2026, mes: 10, fontes: fontes(198, 38, 9), quantidadeSugestoes: 3 },
  { id: '2026-09', ano: 2026, mes: 9, fontes: fontes(214, 41, 23), quantidadeSugestoes: 3 },
  { id: '2026-08', ano: 2026, mes: 8, fontes: fontes(236, 44, 22), quantidadeSugestoes: 3 },
  { id: '2026-07', ano: 2026, mes: 7, fontes: fontes(219, 40, 21), quantidadeSugestoes: 3 },
];

// Do mais recente para o mais antigo.
export function listarPeriodos(): PeriodoRegistrado[] {
  return periodosDeExemplo;
}
