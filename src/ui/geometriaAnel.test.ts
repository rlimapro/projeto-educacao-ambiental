import { calcularSegmentos } from './geometriaAnel';

describe('calcularSegmentos', () => {
  it('divide a circunferência pela participação e desconta o espaço', () => {
    // Total 100, circunferência 100, espaço 4: segmentos de 60 − 4 e 40 − 4.
    const [a, b] = calcularSegmentos([60, 40], 100, 4);
    expect(a.comprimento).toBeCloseTo(56, 6);
    expect(b.comprimento).toBeCloseTo(36, 6);
  });

  it('começa cada segmento depois do anterior, com meio espaço de folga', () => {
    // a começa em 0 + 2; b começa em 60 + 2.
    const [a, b] = calcularSegmentos([60, 40], 100, 4);
    expect(a.inicio).toBeCloseTo(2, 6);
    expect(b.inicio).toBeCloseTo(62, 6);
  });

  it('desenha os segmentos em sequência ao longo da animação', () => {
    const [a, b] = calcularSegmentos([60, 40], 100, 4);
    expect(a.progressoInicial).toBeCloseTo(0, 6);
    expect(a.progressoFinal).toBeCloseTo(0.6, 6);
    expect(b.progressoInicial).toBeCloseTo(0.6, 6);
    expect(b.progressoFinal).toBeCloseTo(1, 6);
  });

  it('com uma fonte só, fecha o anel sem espaço', () => {
    const [a, b] = calcularSegmentos([50, 0], 100, 4);
    expect(a.comprimento).toBeCloseTo(100, 6);
    expect(b.comprimento).toBe(0);
  });

  it('sem emissões, não desenha nenhum segmento', () => {
    const segmentos = calcularSegmentos([0, 0], 100, 4);
    expect(segmentos.every((s) => s.comprimento === 0)).toBe(true);
  });
});
