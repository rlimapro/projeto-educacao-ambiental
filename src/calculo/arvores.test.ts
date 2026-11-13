import {
  TAXAS_SEQUESTRO_POR_BIOMA,
  TAXA_SEQUESTRO_SEM_ESTADO,
  anoEmQueAlcancaEmissao,
  areaPlantioM2,
  somarEmissoesKgCo2e,
  arvoresParaNeutralizar,
  remocaoAcumuladaKgCo2,
  sequestroLiquidoKgCo2,
} from './arvores';
import type { TaxaSequestro } from './tipos';

// Taxa fictícia e redonda, para a conta caber de cabeça.
const taxaDeTeste: TaxaSequestro = {
  id: 'teste',
  valorKgCo2PorArvorePorAno: 10,
  fonte: 'fictícia',
  ano: 2000,
  versao: 1,
};

describe('arvoresParaNeutralizar', () => {
  it('divide a emissão pelo que uma árvore remove no horizonte', () => {
    // 10 kg/ano × 20 anos = 200 kg por árvore; 400 / 200 = 2 árvores
    expect(arvoresParaNeutralizar(400, taxaDeTeste, 20)).toBe(2);
  });

  it('arredonda sempre para cima', () => {
    // 202 / 200 = 1,01 → 2 árvores
    expect(arvoresParaNeutralizar(202, taxaDeTeste, 20)).toBe(2);
  });

  it('emissão zero não pede nenhuma árvore', () => {
    expect(arvoresParaNeutralizar(0, taxaDeTeste, 20)).toBe(0);
  });

  it('usa 20 anos quando o horizonte não é informado', () => {
    // 10 × 20 = 200; 600 / 200 = 3
    expect(arvoresParaNeutralizar(600, taxaDeTeste)).toBe(3);
  });

  it('recusa emissão negativa', () => {
    expect(() => arvoresParaNeutralizar(-1, taxaDeTeste)).toThrow();
  });

  it('a taxa sem estado é a menor da metodologia, com fonte e versão', () => {
    expect(TAXA_SEQUESTRO_SEM_ESTADO.valorKgCo2PorArvorePorAno).toBeCloseTo(3.037, 6);
    expect(TAXA_SEQUESTRO_SEM_ESTADO.fonte).not.toHaveLength(0);
    expect(TAXA_SEQUESTRO_SEM_ESTADO.versao).toBe(1);
  });
});

describe('taxas por bioma', () => {
  it('seguem a tabela da metodologia, da maior para a menor', () => {
    const valores = TAXAS_SEQUESTRO_POR_BIOMA.map((t) => t.valorKgCo2PorArvorePorAno);
    expect(valores).toEqual([7.449, 6.906, 5.379, 3.037]);
  });

  it('trazem a variação do IPCC: desvio-padrão ÷ média, arredondado', () => {
    // 2,5/5,9 = 42% → 40%; 2,3/5,2 = 44% → 45%; 2,4/3,9 = 62% → 60%; subtropical ±90%
    expect(TAXAS_SEQUESTRO_POR_BIOMA.map((t) => t.variacaoRelativa)).toEqual([0.4, 0.45, 0.6, 0.9]);
  });

  it('a taxa sem estado continua sendo a menor', () => {
    const menor = Math.min(...TAXAS_SEQUESTRO_POR_BIOMA.map((t) => t.valorKgCo2PorArvorePorAno));
    expect(TAXA_SEQUESTRO_SEM_ESTADO.valorKgCo2PorArvorePorAno).toBe(menor);
  });
});

describe('remocaoAcumuladaKgCo2', () => {
  it('cresce em linha reta: árvores × taxa × anos', () => {
    // 3 árvores × 10 kg/ano × 5 anos = 150 kg
    expect(remocaoAcumuladaKgCo2(3, taxaDeTeste, 5)).toBeCloseTo(150, 6);
    expect(remocaoAcumuladaKgCo2(3, taxaDeTeste, 0)).toBe(0);
  });

  it('recusa quantidade de árvores negativa ou fracionária', () => {
    expect(() => remocaoAcumuladaKgCo2(-1, taxaDeTeste, 5)).toThrow();
    expect(() => remocaoAcumuladaKgCo2(1.5, taxaDeTeste, 5)).toThrow();
  });
});

describe('sequestroLiquidoKgCo2', () => {
  it('é o que as árvores removem no horizonte menos o que foi emitido', () => {
    // 5 × 10 × 20 = 1.000 kg removidos; 1.000 − 400 = 600 kg a mais
    expect(sequestroLiquidoKgCo2(5, taxaDeTeste, 400, 20)).toBeCloseTo(600, 6);
  });

  it('fica negativo quando o plantio não alcança a emissão', () => {
    // 1 × 10 × 20 = 200 kg; 200 − 500 = −300 kg
    expect(sequestroLiquidoKgCo2(1, taxaDeTeste, 500)).toBeCloseTo(-300, 6);
  });

  it('recusa emissão negativa', () => {
    expect(() => sequestroLiquidoKgCo2(1, taxaDeTeste, -1)).toThrow();
  });
});

describe('anoEmQueAlcancaEmissao', () => {
  it('é o primeiro ano completo em que a remoção alcança a emissão', () => {
    // 2 árvores × 10 kg = 20 kg/ano; 250 / 20 = 12,5 → ano 13
    expect(anoEmQueAlcancaEmissao(2, taxaDeTeste, 250)).toBe(13);
    // 200 / 20 = 10 exatos → ano 10
    expect(anoEmQueAlcancaEmissao(2, taxaDeTeste, 200)).toBe(10);
  });

  it('não vira o ano seguinte por erro de ponto flutuante', () => {
    // 1 × 6,906 × 20 = 138,12 kg: alcança exatamente no ano 20
    const taxa = TAXAS_SEQUESTRO_POR_BIOMA[1];
    expect(anoEmQueAlcancaEmissao(1, taxa, remocaoAcumuladaKgCo2(1, taxa, 20))).toBe(20);
  });

  it('é nulo quando não alcança dentro do horizonte', () => {
    // 1 × 10 × 20 = 200 kg < 500 kg
    expect(anoEmQueAlcancaEmissao(1, taxaDeTeste, 500)).toBeNull();
    expect(anoEmQueAlcancaEmissao(0, taxaDeTeste, 500)).toBeNull();
  });

  it('é zero quando não houve emissão', () => {
    expect(anoEmQueAlcancaEmissao(3, taxaDeTeste, 0)).toBe(0);
  });
});

describe('somarEmissoesKgCo2e', () => {
  it('soma só os meses informados', () => {
    // 100 + 250,5 + 49,5 = 400 kg
    expect(somarEmissoesKgCo2e([100, 250.5, 49.5])).toBeCloseTo(400, 6);
    expect(somarEmissoesKgCo2e([])).toBe(0);
  });

  it('arredondar as árvores sobre o total pede menos que arredondar mês a mês', () => {
    // Três meses de 50 kg, taxa de 10 kg/ano × 20 = 200 kg por árvore.
    // Sobre o total: 150 / 200 = 0,75 → 1 árvore. Mês a mês: 3 × arredondarParaCima(0,25) = 3.
    const total = somarEmissoesKgCo2e([50, 50, 50]);
    expect(arvoresParaNeutralizar(total, taxaDeTeste)).toBe(1);
  });

  it('recusa emissão negativa', () => {
    expect(() => somarEmissoesKgCo2e([10, -1])).toThrow();
  });
});

describe('areaPlantioM2', () => {
  it('usa o espaçamento de 3 m × 2 m por muda', () => {
    // 22 mudas × 6 m² = 132 m²
    expect(areaPlantioM2(22)).toBe(132);
    expect(areaPlantioM2(0)).toBe(0);
  });

  it('recusa quantidade fracionária', () => {
    expect(() => areaPlantioM2(1.5)).toThrow();
  });
});
