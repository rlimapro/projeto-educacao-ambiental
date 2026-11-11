import {
  capacidadeTerreno,
  cabeNoTerreno,
  distribuirEmLinhas,
  encaixarNaGrade,
  posicaoValida,
  sobrepoe,
  terrenoSugerido,
  terrenoValido,
} from './distribuicao';

// Cada muda reserva 3 m (largura) × 2 m (comprimento).
const terreno = { larguraM: 10, comprimentoM: 8 };

describe('terrenoValido', () => {
  it('aceita lados inteiros de 2 a 100 m', () => {
    expect(terrenoValido({ larguraM: 2, comprimentoM: 100 })).toBe(true);
    expect(terrenoValido({ larguraM: 1, comprimentoM: 10 })).toBe(false);
    expect(terrenoValido({ larguraM: 10, comprimentoM: 101 })).toBe(false);
    expect(terrenoValido({ larguraM: 10.5, comprimentoM: 10 })).toBe(false);
  });
});

describe('cabeNoTerreno', () => {
  it('exige o retângulo inteiro dentro do terreno', () => {
    // x 7 + 3 = 10 cabe; x 8 + 3 = 11 passa da largura
    expect(cabeNoTerreno({ x: 7, y: 6 }, terreno)).toBe(true);
    expect(cabeNoTerreno({ x: 8, y: 0 }, terreno)).toBe(false);
    // y 7 + 2 = 9 passa do comprimento
    expect(cabeNoTerreno({ x: 0, y: 7 }, terreno)).toBe(false);
    expect(cabeNoTerreno({ x: -1, y: 0 }, terreno)).toBe(false);
  });
});

describe('sobrepoe', () => {
  it('detecta retângulos que se cruzam', () => {
    // (0,0)–(3,2) e (2,1)–(5,3) se cruzam
    expect(sobrepoe({ x: 0, y: 0 }, { x: 2, y: 1 })).toBe(true);
    expect(sobrepoe({ x: 0, y: 0 }, { x: 0, y: 0 })).toBe(true);
  });

  it('não conta retângulos que só se encostam pela borda', () => {
    // lado a lado: (0,0)–(3,2) e (3,0)–(6,2)
    expect(sobrepoe({ x: 0, y: 0 }, { x: 3, y: 0 })).toBe(false);
    // um embaixo do outro: (0,0)–(3,2) e (0,2)–(3,4)
    expect(sobrepoe({ x: 0, y: 0 }, { x: 0, y: 2 })).toBe(false);
  });
});

describe('posicaoValida', () => {
  it('recusa posição fora do terreno ou em cima de outra muda', () => {
    const outras = [{ x: 0, y: 0 }];
    expect(posicaoValida({ x: 3, y: 0 }, outras, terreno)).toBe(true);
    expect(posicaoValida({ x: 1, y: 1 }, outras, terreno)).toBe(false);
    expect(posicaoValida({ x: 8, y: 0 }, outras, terreno)).toBe(false);
  });
});

describe('encaixarNaGrade', () => {
  it('centra a muda no ponto tocado e arredonda para o metro', () => {
    // ponto (5,2; 4,1): canto = (5,2 − 1,5; 4,1 − 1) = (3,7; 3,1) → (4, 3)
    expect(encaixarNaGrade(5.2, 4.1, terreno)).toEqual({ x: 4, y: 3 });
  });

  it('não deixa a muda sair do terreno', () => {
    expect(encaixarNaGrade(-5, -5, terreno)).toEqual({ x: 0, y: 0 });
    // máximo: x 10 − 3 = 7, y 8 − 2 = 6
    expect(encaixarNaGrade(50, 50, terreno)).toEqual({ x: 7, y: 6 });
  });
});

describe('capacidadeTerreno', () => {
  it('é o número de colunas vezes o de linhas', () => {
    // ⌊10 / 3⌋ = 3 colunas; ⌊8 / 2⌋ = 4 linhas → 12
    expect(capacidadeTerreno(terreno)).toBe(12);
    // 2 m de largura não cabe nenhuma muda de 3 m
    expect(capacidadeTerreno({ larguraM: 2, comprimentoM: 10 })).toBe(0);
  });
});

describe('distribuirEmLinhas', () => {
  it('preenche as linhas da esquerda para a direita, sem sobreposição', () => {
    const posicoes = distribuirEmLinhas(4, terreno);
    expect(posicoes).toEqual([
      { x: 0, y: 0 },
      { x: 3, y: 0 },
      { x: 6, y: 0 },
      { x: 0, y: 2 },
    ]);
    posicoes.forEach((p, i) => {
      expect(
        posicaoValida(
          p,
          posicoes.filter((_, j) => j !== i),
          terreno,
        ),
      ).toBe(true);
    });
  });

  it('para na capacidade do terreno', () => {
    expect(distribuirEmLinhas(50, terreno)).toHaveLength(12);
  });

  it('recusa quantidade negativa', () => {
    expect(() => distribuirEmLinhas(-1, terreno)).toThrow();
  });
});

describe('terrenoSugerido', () => {
  it('sempre comporta as mudas pedidas', () => {
    for (const quantidade of [1, 4, 5, 13, 40, 100]) {
      expect(capacidadeTerreno(terrenoSugerido(quantidade))).toBeGreaterThanOrEqual(quantidade);
    }
  });

  it('começa num quadrado de 6 m para poucas mudas', () => {
    // 6 m: ⌊6/3⌋ × ⌊6/2⌋ = 2 × 3 = 6 mudas
    expect(terrenoSugerido(5)).toEqual({ larguraM: 6, comprimentoM: 6 });
  });
});
