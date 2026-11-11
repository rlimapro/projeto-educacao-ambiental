import {
  capacidadeTerreno,
  capacidadeTotal,
  limitarAQuantidade,
  novoTerreno,
  primeiraPosicaoLivre,
  tirarTerrenos,
  totalMudas,
  type TerrenoPlanejado,
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

describe('vários terrenos', () => {
  const plano: TerrenoPlanejado[] = [
    { id: 1, larguraM: 6, comprimentoM: 6, mudas: [{ x: 0, y: 0 }, { x: 3, y: 0 }] },
    { id: 4, larguraM: 9, comprimentoM: 2, mudas: [{ x: 0, y: 0 }, { x: 3, y: 0 }, { x: 6, y: 0 }] },
  ];

  it('soma as mudas e a capacidade dos terrenos', () => {
    // 2 + 3 mudas
    expect(totalMudas(plano)).toBe(5);
    // ⌊6/3⌋ × ⌊6/2⌋ = 6, mais ⌊9/3⌋ × ⌊2/2⌋ = 3
    expect(capacidadeTotal(plano)).toBe(9);
    expect(totalMudas([])).toBe(0);
  });

  it('cria um terreno vazio com o próximo id e o tamanho sugerido', () => {
    // maior id é 4; 20 mudas pedem o mesmo terreno de terrenoSugerido(20)
    expect(novoTerreno(plano, 20)).toEqual({ id: 5, ...terrenoSugerido(20), mudas: [] });
    // sem mudas faltando, o terreno novo é o mínimo de 6 m
    expect(novoTerreno([], 0)).toEqual({ id: 1, larguraM: 6, comprimentoM: 6, mudas: [] });
  });

  it('tira o excesso a partir das últimas mudas do último terreno', () => {
    // 5 mudas, simulação com 1: tira 3 do 2º terreno e 1 do 1º
    const { terrenos, retiradas } = limitarAQuantidade(plano, 1);
    expect(retiradas).toBe(4);
    expect(terrenos[0].mudas).toEqual([{ x: 0, y: 0 }]);
    expect(terrenos[1].mudas).toEqual([]);
    // dentro do limite, nada muda
    expect(limitarAQuantidade(plano, 5)).toEqual({ terrenos: plano, retiradas: 0 });
  });

  it('acha a primeira posição livre linha por linha', () => {
    // em 6 × 6 com (0,0) e (3,0) ocupados, a próxima linha começa em y = 2
    expect(primeiraPosicaoLivre(plano[0].mudas, plano[0])).toEqual({ x: 0, y: 2 });
    // terreno 9 × 2 cheio
    expect(primeiraPosicaoLivre(plano[1].mudas, plano[1])).toBeNull();
    // (1,0) ocupado: x 0 a 3 se cruzam com ele; a primeira livre na linha 0 é x 4
    expect(primeiraPosicaoLivre([{ x: 1, y: 0 }], { larguraM: 7, comprimentoM: 2 })).toEqual({
      x: 4,
      y: 0,
    });
  });

  it('tira vários terrenos de uma vez e conta as mudas que saíram', () => {
    // tirar o de id 4, com 3 mudas
    expect(tirarTerrenos(plano, [4], 5)).toEqual({ terrenos: [plano[0]], mudasTiradas: 3 });
    // id desconhecido não tira nada
    expect(tirarTerrenos(plano, [99], 5)).toEqual({ terrenos: plano, mudasTiradas: 0 });
  });

  it('deixa um terreno novo quando todos saem', () => {
    // 2 + 3 mudas saem; o terreno novo é o sugerido para 20 mudas, com id 1
    expect(tirarTerrenos(plano, [1, 4], 20)).toEqual({
      terrenos: [{ id: 1, ...terrenoSugerido(20), mudas: [] }],
      mudasTiradas: 5,
    });
  });
});
