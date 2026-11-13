import {
  SULCOS_POR_BLOCO,
  detalhesDoBloco,
  manchasDoTerreno,
  sulcosDoBloco,
} from './texturaTerreno';

// Primeiro e último ponto de um caminho "M x y L x y ...".
function pontas(caminho: string): { inicio: number[]; fim: number[] } {
  const numeros = caminho.replace(/[MLZ]/g, ' ').trim().split(/\s+/).map(Number);
  return { inicio: numeros.slice(0, 2), fim: numeros.slice(-2) };
}

describe('sulcosDoBloco', () => {
  // Bloco de 7 m a 10 pontos por metro (70) e sulcos a cada 20 pontos.
  const sulcos = sulcosDoBloco(70, 20);

  it('desenha dois sulcos por bloco', () => {
    expect(sulcos).toHaveLength(SULCOS_POR_BLOCO);
  });

  it('fecha a onda na largura do bloco, para a emenda não aparecer', () => {
    for (const sulco of sulcos) {
      for (const linha of [sulco.crista, sulco.fundo]) {
        const { inicio, fim } = pontas(linha);
        expect(inicio[0]).toBeCloseTo(0, 6);
        // x vai de 0 a 70; y termina onde começou (período = largura)
        expect(fim[0]).toBeCloseTo(70, 6);
        expect(fim[1]).toBeCloseTo(inicio[1], 1);
      }
    }
  });

  it('mantém cada sulco na sua faixa do bloco', () => {
    // Sulco 0 entre 0 e 20, sulco 1 entre 20 e 40, com a ondulação de
    // até 0,07 + 0,025 = 0,095 do sulco (1,9 ponto)
    sulcos.forEach((sulco, indice) => {
      const ys = sulco.encosta
        .replace(/[MLZ]/g, ' ')
        .trim()
        .split(/\s+/)
        .map(Number)
        .filter((_, i) => i % 2 === 1);
      expect(Math.min(...ys)).toBeGreaterThanOrEqual(indice * 20);
      expect(Math.max(...ys)).toBeLessThanOrEqual((indice + 1) * 20);
    });
  });

  it('fecha a faixa da encosta', () => {
    expect(sulcos[0].encosta.endsWith('Z')).toBe(true);
  });
});

describe('detalhesDoBloco', () => {
  const detalhes = detalhesDoBloco(70, 20);

  it('tem torrões, pedras e palha', () => {
    const tipos = new Set(detalhes.map((d) => d.tipo));
    expect(tipos).toEqual(new Set(['torraoEscuro', 'torraoClaro', 'pedra', 'palha']));
  });

  it('não encosta na borda do bloco', () => {
    // margem de 4% de 70 = 2,8 pontos
    for (const d of detalhes) {
      expect(d.x).toBeGreaterThanOrEqual(2.8);
      expect(d.x).toBeLessThanOrEqual(70 - 2.8);
      expect(d.y).toBeGreaterThanOrEqual(0);
      expect(d.y).toBeLessThanOrEqual(40);
    }
  });

  it('sai sempre igual', () => {
    expect(detalhesDoBloco(70, 20)).toEqual(detalhes);
  });
});

describe('manchasDoTerreno', () => {
  it('põe uma mancha a cada 120 m², de 3 a 14', () => {
    // 6 × 6 = 36 m² → mínimo de 3
    expect(manchasDoTerreno({ larguraM: 6, comprimentoM: 6 })).toHaveLength(3);
    // 30 × 40 = 1.200 m² → 10
    expect(manchasDoTerreno({ larguraM: 30, comprimentoM: 40 })).toHaveLength(10);
    // 100 × 100 = 10.000 m² → máximo de 14
    expect(manchasDoTerreno({ larguraM: 100, comprimentoM: 100 })).toHaveLength(14);
  });

  it('centra as manchas dentro do terreno, alongadas na direção dos sulcos', () => {
    for (const m of manchasDoTerreno({ larguraM: 30, comprimentoM: 40 })) {
      expect(m.x).toBeGreaterThanOrEqual(0);
      expect(m.x).toBeLessThanOrEqual(30);
      expect(m.y).toBeGreaterThanOrEqual(0);
      expect(m.y).toBeLessThanOrEqual(40);
      expect(m.ry).toBeLessThan(m.rx);
    }
  });

  it('dá as mesmas manchas ao mesmo terreno, e outras a outro', () => {
    const terreno = { larguraM: 20, comprimentoM: 12 };
    expect(manchasDoTerreno(terreno)).toEqual(manchasDoTerreno(terreno));
    expect(manchasDoTerreno({ larguraM: 21, comprimentoM: 12 })).not.toEqual(
      manchasDoTerreno(terreno),
    );
  });

  it('tem manchas úmidas e secas', () => {
    const manchas = manchasDoTerreno({ larguraM: 30, comprimentoM: 40 });
    expect(manchas.some((m) => m.umida)).toBe(true);
    expect(manchas.some((m) => !m.umida)).toBe(true);
  });
});
