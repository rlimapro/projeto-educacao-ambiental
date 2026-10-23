import type { TaxaSequestro } from './tipos';

// Valores de docs/metodologia-calculo.md, seção "Compensação por plantio".

export const HORIZONTE_ANOS = 20;

// Menor taxa da tabela por bioma (floresta subtropical úmida), usada enquanto
// o usuário não escolhe o estado (RF05, RF13): o número de árvores nunca é
// subestimado.
export const TAXA_SEQUESTRO_SEM_ESTADO: TaxaSequestro = {
  id: 'floresta-subtropical-umida',
  valorKgCo2PorArvorePorAno: 3.037,
  fonte:
    'IPCC 2019 Refinement, Vol. 4, cap. 4, Tabelas 4.4 e 4.9; IPCC 2006, Vol. 4, Tabela 4.3; densidade de 1.666,7 árvores/ha',
  ano: 2019,
  versao: 1,
};

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
