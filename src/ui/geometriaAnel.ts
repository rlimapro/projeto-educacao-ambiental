// Geometria do anel de emissões: onde cada segmento começa, quanto mede e em
// que parte da animação ele é desenhado. Medidas em pontos, ao longo da
// circunferência que passa pelo meio do traço.

export type SegmentoAnel = {
  // Onde o segmento começa, a partir do topo, no sentido horário.
  inicio: number;
  comprimento: number;
  // Trecho do progresso da animação (0 a 1) em que o segmento é desenhado.
  progressoInicial: number;
  progressoFinal: number;
};

export function calcularSegmentos(
  valores: number[],
  circunferencia: number,
  espaco: number,
): SegmentoAnel[] {
  const total = valores.reduce((soma, valor) => soma + valor, 0);
  if (total <= 0) {
    return valores.map(() => ({ inicio: 0, comprimento: 0, progressoInicial: 0, progressoFinal: 0 }));
  }

  // Com uma fonte só, o anel fica fechado, sem espaço.
  const comValor = valores.filter((valor) => valor > 0).length;
  const espacoUsado = comValor > 1 ? espaco : 0;

  let acumulado = 0;
  return valores.map((valor) => {
    const fracaoInicial = acumulado / total;
    acumulado += valor;
    const fracaoFinal = acumulado / total;
    const comprimentoBruto = (fracaoFinal - fracaoInicial) * circunferencia;
    return {
      inicio: fracaoInicial * circunferencia + espacoUsado / 2,
      comprimento: valor > 0 ? Math.max(comprimentoBruto - espacoUsado, 0) : 0,
      progressoInicial: fracaoInicial,
      progressoFinal: fracaoFinal,
    };
  });
}
