import type { TaxaSequestro, TaxaSequestroBioma } from './tipos';

// Valores de docs/metodologia-calculo.md, seção "Compensação por plantio".

export const HORIZONTE_ANOS = 20;

const FONTE_TAXAS =
  'IPCC 2019 Refinement, Vol. 4, cap. 4, Tabelas 4.4 e 4.9; IPCC 2006, Vol. 4, Tabela 4.3; densidade de 1.666,7 árvores/ha';

// Taxas por grupo de biomas (tabela "Taxa de sequestro por bioma" da
// metodologia), da maior para a menor. A variação relativa é o desvio-padrão
// dividido pela média do crescimento na Tabela 4.9 do IPCC 2019 (2,5/5,9;
// 2,3/5,2; 2,4/3,9), arredondada; na zona subtropical, ±90% é a incerteza
// padrão que o próprio IPCC indica.
export const TAXAS_SEQUESTRO_POR_BIOMA: TaxaSequestroBioma[] = [
  {
    id: 'floresta-tropical-umida',
    biomas: 'Amazônia',
    valorKgCo2PorArvorePorAno: 7.449,
    variacaoRelativa: 0.4,
    fonte: FONTE_TAXAS,
    ano: 2019,
    versao: 1,
  },
  {
    id: 'floresta-tropical-umida-decidua',
    biomas: 'Mata Atlântica',
    valorKgCo2PorArvorePorAno: 6.906,
    variacaoRelativa: 0.45,
    fonte: FONTE_TAXAS,
    ano: 2019,
    versao: 1,
  },
  {
    id: 'floresta-tropical-seca',
    biomas: 'Cerrado, Caatinga e Pantanal',
    valorKgCo2PorArvorePorAno: 5.379,
    variacaoRelativa: 0.6,
    fonte: FONTE_TAXAS,
    ano: 2019,
    versao: 1,
  },
  {
    id: 'floresta-subtropical-umida',
    biomas: 'Pampa e Mata Atlântica do Sul',
    valorKgCo2PorArvorePorAno: 3.037,
    variacaoRelativa: 0.9,
    fonte: FONTE_TAXAS,
    ano: 2019,
    versao: 1,
  },
];

// Menor taxa da tabela por bioma (floresta subtropical úmida), usada enquanto
// o usuário não escolhe o estado (RF05, RF13): o número de árvores nunca é
// subestimado.
export const TAXA_SEQUESTRO_SEM_ESTADO: TaxaSequestroBioma = TAXAS_SEQUESTRO_POR_BIOMA[3];

// Árvores que neutralizariam a emissão no horizonte dado (RF05). Sempre
// arredondado para cima: arredondar para baixo deixaria emissões sem compensação.
export function arvoresParaNeutralizar(
  emissaoKgCo2e: number,
  taxa: TaxaSequestro,
  horizonteAnos: number = HORIZONTE_ANOS,
): number {
  if (!Number.isFinite(emissaoKgCo2e) || emissaoKgCo2e < 0) {
    throw new Error(`Emissão inválida: ${emissaoKgCo2e}`);
  }
  if (taxa.valorKgCo2PorArvorePorAno <= 0 || horizonteAnos <= 0) {
    throw new Error('Taxa de sequestro e horizonte precisam ser positivos');
  }
  return Math.ceil(emissaoKgCo2e / (taxa.valorKgCo2PorArvorePorAno * horizonteAnos));
}

function validarPlantio(arvores: number, taxa: TaxaSequestro) {
  if (!Number.isInteger(arvores) || arvores < 0) {
    throw new Error(`Quantidade de árvores inválida: ${arvores}`);
  }
  if (taxa.valorKgCo2PorArvorePorAno <= 0) {
    throw new Error('A taxa de sequestro precisa ser positiva');
  }
}

// CO₂ que as árvores teriam removido depois de `anos` (RF06). A taxa do IPCC é
// uma média constante para florestas de até 20 anos, então a remoção cresce em
// linha reta; nos primeiros anos, a real tende a ser menor.
export function remocaoAcumuladaKgCo2(arvores: number, taxa: TaxaSequestro, anos: number): number {
  validarPlantio(arvores, taxa);
  if (!Number.isFinite(anos) || anos < 0) throw new Error(`Anos inválidos: ${anos}`);
  return arvores * taxa.valorKgCo2PorArvorePorAno * anos;
}

// Sequestro líquido (RF06): o que as árvores removeriam no horizonte menos o
// que o período emitiu. Positivo quando o plantio removeria mais do que foi
// emitido.
export function sequestroLiquidoKgCo2(
  arvores: number,
  taxa: TaxaSequestro,
  emissaoKgCo2e: number,
  horizonteAnos: number = HORIZONTE_ANOS,
): number {
  if (!Number.isFinite(emissaoKgCo2e) || emissaoKgCo2e < 0) {
    throw new Error(`Emissão inválida: ${emissaoKgCo2e}`);
  }
  return remocaoAcumuladaKgCo2(arvores, taxa, horizonteAnos) - emissaoKgCo2e;
}

// Primeiro ano completo em que a remoção acumulada alcança a emissão do
// período, ou nulo se não alcança dentro do horizonte. Arredonda para cima: no
// meio de um ano, a emissão ainda não foi alcançada.
export function anoEmQueAlcancaEmissao(
  arvores: number,
  taxa: TaxaSequestro,
  emissaoKgCo2e: number,
  horizonteAnos: number = HORIZONTE_ANOS,
): number | null {
  validarPlantio(arvores, taxa);
  if (!Number.isFinite(emissaoKgCo2e) || emissaoKgCo2e < 0) {
    throw new Error(`Emissão inválida: ${emissaoKgCo2e}`);
  }
  if (emissaoKgCo2e === 0) return 0;
  if (arvores === 0) return null;
  // A tolerância evita que 20,000000001 (erro de ponto flutuante) vire 21.
  const ano = Math.ceil(emissaoKgCo2e / (arvores * taxa.valorKgCo2PorArvorePorAno) - 1e-9);
  return ano <= horizonteAnos ? ano : null;
}

// Espaçamento do plantio de restauração usado na taxa por muda: 3 m × 2 m
// (1.666,7 mudas por hectare, ver metodologia).
export const AREA_POR_MUDA_M2 = 3 * 2;

// Área que as mudas ocupariam num plantio de restauração. Árvores isoladas
// ocupam mais espaço cada; a tela avisa isso.
export function areaPlantioM2(arvores: number): number {
  if (!Number.isInteger(arvores) || arvores < 0) {
    throw new Error(`Quantidade de árvores inválida: ${arvores}`);
  }
  return arvores * AREA_POR_MUDA_M2;
}

// Emissão de vários meses registrados, para simular um único plantio que cubra
// todos (RF06). Só soma o que foi registrado: meses sem registro não entram, e
// nada é estimado para eles. As árvores são arredondadas uma vez, sobre esse
// total, e não mês a mês.
export function somarEmissoesKgCo2e(emissoesPorMesKgCo2e: number[]): number {
  for (const emissao of emissoesPorMesKgCo2e) {
    if (!Number.isFinite(emissao) || emissao < 0) {
      throw new Error(`Emissão inválida: ${emissao}`);
    }
  }
  return emissoesPorMesKgCo2e.reduce((soma, emissao) => soma + emissao, 0);
}
