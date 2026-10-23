import type { ComparacaoPeriodos, EmissaoFonte, ResumoEmissoes } from './tipos';

// Total do período e participação de cada fonte (RF03). O total é a soma
// exata das fontes; nada é arredondado aqui.
export function resumirEmissoes(fontes: EmissaoFonte[]): ResumoEmissoes {
  for (const fonte of fontes) {
    if (!Number.isFinite(fonte.emissaoKgCo2e) || fonte.emissaoKgCo2e < 0) {
      throw new Error(`Emissão inválida para ${fonte.nome}: ${fonte.emissaoKgCo2e}`);
    }
  }

  const totalKgCo2e = fontes.reduce((soma, fonte) => soma + fonte.emissaoKgCo2e, 0);

  return {
    totalKgCo2e,
    fontes: fontes
      .map((fonte) => ({
        ...fonte,
        fracao: totalKgCo2e > 0 ? fonte.emissaoKgCo2e / totalKgCo2e : 0,
      }))
      .sort((a, b) => b.emissaoKgCo2e - a.emissaoKgCo2e),
  };
}

// Compara o período atual com o anterior (RF07).
export function compararPeriodos(atualKgCo2e: number, anteriorKgCo2e: number): ComparacaoPeriodos {
  if (atualKgCo2e < 0 || anteriorKgCo2e < 0) {
    throw new Error('Emissões não podem ser negativas');
  }
  const diferencaKgCo2e = atualKgCo2e - anteriorKgCo2e;
  return {
    diferencaKgCo2e,
    variacao: anteriorKgCo2e > 0 ? diferencaKgCo2e / anteriorKgCo2e : null,
  };
}
