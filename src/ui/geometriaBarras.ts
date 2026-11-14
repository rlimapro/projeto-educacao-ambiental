// Altura de cada barra do gráfico do histórico, numa escala só: a maior barra
// da janela tem a altura máxima. Fica fora do componente para ser testada.
//
// - Mês sem registro (nulo): sem barra.
// - Mês com zero: barra de altura zero, mas o valor "0" aparece em cima.
// - Mês com pouca emissão: pelo menos a altura mínima, para a barra não sumir
//   ao lado de um mês muito maior.
export function alturasDasBarras(
  valores: (number | null)[],
  alturaMaxima: number,
  alturaMinima: number,
): (number | null)[] {
  const maior = Math.max(0, ...valores.map((v) => v ?? 0));
  return valores.map((valor) => {
    if (valor === null) return null;
    if (valor <= 0 || maior === 0) return 0;
    return Math.max(alturaMinima, (valor / maior) * alturaMaxima);
  });
}
