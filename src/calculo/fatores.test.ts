import { FATORES_EMISSAO, selecionarFatorGasolina } from './fatores';

describe('fatores de emissão aprovados', () => {
  it('mantém os valores, unidades e rastreabilidade da metodologia', () => {
    expect(FATORES_EMISSAO.energia.valor).toBe(0.0461);
    expect(FATORES_EMISSAO.energia.unidadeFator).toBe('kg CO₂/kWh');
    expect(FATORES_EMISSAO.energia.fonte).toContain('MCTI');
    expect(FATORES_EMISSAO.gasolinaE30.ano).toBe(2025);
    expect(FATORES_EMISSAO.gasolinaE32.versao).toBe(2);
    expect(FATORES_EMISSAO.glp.unidadeEntrada).toBe('kg');
  });

  it('seleciona E30 até julho de 2026 e E32 desde agosto de 2026', () => {
    expect(selecionarFatorGasolina(2026, 7).id).toBe('gasolina-e30');
    expect(selecionarFatorGasolina(2026, 8).id).toBe('gasolina-e32');
  });

  it('recusa período anterior à vigência documentada', () => {
    expect(() => selecionarFatorGasolina(2025, 7)).toThrow();
  });
});
