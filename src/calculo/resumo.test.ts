import { compararPeriodos, resumirEmissoes } from './resumo';

const fonte = (id: string, emissaoKgCo2e: number) => ({ id, nome: id, emissaoKgCo2e });

describe('resumirEmissoes', () => {
  it('soma as fontes no total', () => {
    // 10 + 30 + 60 = 100
    const resumo = resumirEmissoes([fonte('a', 10), fonte('b', 30), fonte('c', 60)]);
    expect(resumo.totalKgCo2e).toBeCloseTo(100, 6);
  });

  it('calcula a participação de cada fonte', () => {
    // 10/100 = 0,1; 30/100 = 0,3; 60/100 = 0,6
    const resumo = resumirEmissoes([fonte('a', 10), fonte('b', 30), fonte('c', 60)]);
    const porId = Object.fromEntries(resumo.fontes.map((f) => [f.id, f.fracao]));
    expect(porId.a).toBeCloseTo(0.1, 6);
    expect(porId.b).toBeCloseTo(0.3, 6);
    expect(porId.c).toBeCloseTo(0.6, 6);
  });

  it('ordena da maior para a menor emissão', () => {
    const resumo = resumirEmissoes([fonte('a', 10), fonte('b', 30), fonte('c', 60)]);
    expect(resumo.fontes.map((f) => f.id)).toEqual(['c', 'b', 'a']);
  });

  it('a soma das fontes é igual ao total', () => {
    const resumo = resumirEmissoes([fonte('a', 0.1), fonte('b', 0.2), fonte('c', 0.7)]);
    const soma = resumo.fontes.reduce((s, f) => s + f.emissaoKgCo2e, 0);
    expect(soma).toBeCloseTo(resumo.totalKgCo2e, 10);
  });

  it('período sem emissões tem total zero e participações zero', () => {
    const resumo = resumirEmissoes([fonte('a', 0), fonte('b', 0)]);
    expect(resumo.totalKgCo2e).toBe(0);
    expect(resumo.fontes.every((f) => f.fracao === 0)).toBe(true);
  });

  it('recusa emissão negativa', () => {
    expect(() => resumirEmissoes([fonte('a', -1)])).toThrow();
  });
});

describe('compararPeriodos', () => {
  it('mostra quanto o período atual emitiu a menos', () => {
    // 80 − 100 = −20; −20 / 100 = −0,2
    const comparacao = compararPeriodos(80, 100);
    expect(comparacao.diferencaKgCo2e).toBeCloseTo(-20, 6);
    expect(comparacao.variacao).toBeCloseTo(-0.2, 6);
  });

  it('mostra quanto o período atual emitiu a mais', () => {
    // 150 − 100 = 50; 50 / 100 = 0,5
    const comparacao = compararPeriodos(150, 100);
    expect(comparacao.diferencaKgCo2e).toBeCloseTo(50, 6);
    expect(comparacao.variacao).toBeCloseTo(0.5, 6);
  });

  it('não calcula variação quando o período anterior foi zero', () => {
    expect(compararPeriodos(10, 0).variacao).toBeNull();
  });

  it('recusa emissão negativa', () => {
    expect(() => compararPeriodos(-1, 10)).toThrow();
  });
});
