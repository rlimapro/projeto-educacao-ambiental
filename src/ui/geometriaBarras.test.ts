import { alturasDasBarras } from './geometriaBarras';

describe('alturasDasBarras', () => {
  it('dá a altura máxima ao maior valor e escala os outros', () => {
    // 100 é o maior: 100 → 120; 50 → 60; 25 → 30
    const alturas = alturasDasBarras([50, 100, 25], 120, 4);

    expect(alturas[0]).toBeCloseTo(60, 6);
    expect(alturas[1]).toBeCloseTo(120, 6);
    expect(alturas[2]).toBeCloseTo(30, 6);
  });

  it('mantém mês sem registro sem barra e mês com zero com altura zero', () => {
    expect(alturasDasBarras([null, 0, 10], 120, 4)).toEqual([null, 0, 120]);
  });

  it('garante a altura mínima para valores pequenos', () => {
    // 1 de 1000 daria 0,12; sobe para 4
    expect(alturasDasBarras([1, 1000], 120, 4)[0]).toBe(4);
  });

  it('não divide por zero quando todos os meses são zero ou vazios', () => {
    expect(alturasDasBarras([0, null, 0], 120, 4)).toEqual([0, null, 0]);
    expect(alturasDasBarras([], 120, 4)).toEqual([]);
  });
});
