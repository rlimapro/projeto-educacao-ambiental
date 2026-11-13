// Textos de ajuda dos campos do registro de consumo (RF02), abertos pelo botão
// "?" de cada campo. Dizem onde achar o número e como chegar a ele; não trazem
// fatores nem médias de consumo. Os preços dos exemplos são só ilustrativos.

export type CampoComAjuda = 'energia' | 'gasolina' | 'gas' | 'etanol' | 'diesel';

export type AjudaCampo = {
  // Linha acima do título; sem ela, "Como preencher".
  chamada?: string;
  titulo: string;
  resumo: string;
  dicas: string[];
  exemplo?: string;
};

const dicasCarro = [
  'Os litros aparecem na bomba, no comprovante e na nota fiscal.',
  'Carro flex: gasolina e etanol vão cada um no seu campo.',
  'Só tem o valor pago? Divida pelo preço do litro.',
];

export const AJUDA_CONSUMO: Record<CampoComAjuda, AjudaCampo> = {
  energia: {
    titulo: 'Energia elétrica',
    resumo: 'Use o consumo do mês em kWh, que está na conta de luz.',
    dicas: [
      'Procure “Consumo” ou “Consumo faturado” na conta. O número vem seguido de kWh.',
      'Use os kWh, e não o valor em reais.',
      'Registre no mês de referência que aparece no topo da conta.',
    ],
    exemplo: 'A conta mostra “Consumo: 180 kWh”: digite 180.',
  },
  gasolina: {
    titulo: 'Gasolina',
    resumo: 'Some os litros de todos os abastecimentos de gasolina do mês.',
    dicas: dicasCarro,
    exemplo: 'Pagou R$ 150 com o litro a R$ 6,00 (preço de exemplo): 150 ÷ 6 = 25 litros.',
  },
  etanol: {
    titulo: 'Etanol',
    resumo: 'Some os litros de todos os abastecimentos de etanol do mês.',
    dicas: dicasCarro,
    exemplo: 'Pagou R$ 100 com o litro a R$ 4,00 (preço de exemplo): 100 ÷ 4 = 25 litros.',
  },
  diesel: {
    titulo: 'Diesel',
    resumo: 'Some os litros de todos os abastecimentos de diesel do mês.',
    dicas: [
      'Os litros aparecem na bomba, no comprovante e na nota fiscal.',
      'Conte só os veículos que entram neste cálculo.',
      'Só tem o valor pago? Divida pelo preço do litro.',
    ],
    exemplo: 'Pagou R$ 300 com o litro a R$ 6,00 (preço de exemplo): 300 ÷ 6 = 50 litros.',
  },
  gas: {
    titulo: 'Gás de cozinha',
    resumo: 'Informe quantos botijões de 13 kg você usou no mês. É o botijão comum de cozinha.',
    dicas: [
      'Trocou um botijão no mês? Digite 1.',
      'Se um botijão dura mais de um mês, divida pelo número de meses.',
      'Gás encanado ainda não entra no cálculo.',
    ],
    exemplo: 'Um botijão a cada dois meses: digite 0,5 em cada mês.',
  },
};
