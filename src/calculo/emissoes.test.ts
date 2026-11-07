import { calcularEmissao, calcularEmissoes, converterBotoesGlpParaQuilos } from './emissoes';
import { FATORES_EMISSAO } from './fatores';

describe('calcularEmissao', () => {
  it('multiplica o consumo pelo fator informado', () => {
    const fator = { ...FATORES_EMISSAO.energia, valor: 0.1 };
    // 150 kWh × 0,1 kg/kWh = 15 kg CO₂e
    expect(calcularEmissao(150, fator)).toBeCloseTo(15, 6);
  });

  it('retorna zero para consumo zero', () => {
    expect(calcularEmissao(0, FATORES_EMISSAO.energia)).toBe(0);
  });

  it('recusa consumo negativo', () => {
    expect(() => calcularEmissao(-1, FATORES_EMISSAO.energia)).toThrow();
  });
});

describe('converterBotoesGlpParaQuilos', () => {
  it('converte botijões de 13 kg para quilos antes de aplicar o fator', () => {
    // 2 botijões × 13 kg = 26 kg
    expect(converterBotoesGlpParaQuilos(2)).toBe(26);
  });

  it('recusa quantidade negativa', () => {
    expect(() => converterBotoesGlpParaQuilos(-1)).toThrow();
  });
});

describe('calcularEmissoes', () => {
  it('calcula o total das fontes e guarda a memória com o fator usado', () => {
    const resultado = calcularEmissoes(
      { energiaKwh: 100, gasolinaLitros: 10, etanolLitros: 10, dieselLitros: 0, glpBotoes13Kg: 1 },
      2026,
      11,
    );
    // 100×0,0461 + 10×1,5738 + 10×0,0436 + 13×2,9407 = 59,0131 kg CO₂e
    expect(resultado.totalKgCo2e).toBeCloseTo(59.0131, 6);
    expect(resultado.fontes.find((fonte) => fonte.id === 'gasolina')?.fator.versao).toBe(2);
    expect(resultado.fontes.find((fonte) => fonte.id === 'gasolina')?.fator.fonte).toContain('CNPE');
    expect(resultado.fontes.find((fonte) => fonte.id === 'glp')?.consumoAplicado).toBe(13);
    expect(resultado.fontes.reduce((total, fonte) => total + fonte.emissaoKgCo2e, 0)).toBeCloseTo(
      resultado.totalKgCo2e,
      10,
    );
  });

  it('inclui zero sem criar emissão e calcula zero para um período vazio', () => {
    const resultado = calcularEmissoes(
      { energiaKwh: 0, gasolinaLitros: 0, etanolLitros: 0, dieselLitros: 0, glpBotoes13Kg: 0 },
      2026,
      11,
    );
    expect(resultado.totalKgCo2e).toBe(0);
    expect(resultado.fontes).toHaveLength(0);
  });

  it('recusa qualquer consumo negativo ou não finito', () => {
    expect(() => calcularEmissoes(
      { energiaKwh: -1, gasolinaLitros: 0, etanolLitros: 0, dieselLitros: 0, glpBotoes13Kg: 0 },
      2026,
      11,
    )).toThrow();
    expect(() => calcularEmissoes(
      { energiaKwh: Number.NaN, gasolinaLitros: 0, etanolLitros: 0, dieselLitros: 0, glpBotoes13Kg: 0 },
      2026,
      11,
    )).toThrow();
  });
});
