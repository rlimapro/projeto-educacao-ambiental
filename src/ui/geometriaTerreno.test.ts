import {
  dentroDaArea,
  distancia,
  enquadrar,
  limitarDeslocamento,
  limitarZoom,
  pontoDoTerreno,
  pontoMedio,
  pontosPorMetroInteiro,
  tamanhoJanela,
  zoomMaximo,
} from './geometriaTerreno';

// Terreno de 100 m × 50 m numa tela de 300 pontos, altura máxima de 400.
const terreno = { larguraM: 100, comprimentoM: 50 };

describe('pontosPorMetroInteiro', () => {
  it('cabe na largura sem passar da altura máxima', () => {
    // 300 ÷ 100 = 3; 400 ÷ 50 = 8 → 3
    expect(pontosPorMetroInteiro(terreno, 300, 400)).toBeCloseTo(3, 6);
    // 300 ÷ 10 = 30; 400 ÷ 100 = 4 → 4
    expect(pontosPorMetroInteiro({ larguraM: 10, comprimentoM: 100 }, 300, 400)).toBeCloseTo(4, 6);
  });

  it('é zero antes de medir a tela', () => {
    expect(pontosPorMetroInteiro(terreno, 0, 400)).toBe(0);
  });
});

describe('zoom', () => {
  it('aproxima até a escala máxima, nunca abaixo de 1', () => {
    // 30 ÷ 3 = 10 vezes
    expect(zoomMaximo(3, 30)).toBeCloseTo(10, 6);
    // terreno pequeno a 50 pontos por metro já passa de 30: sem zoom
    expect(zoomMaximo(50, 30)).toBe(1);
    expect(zoomMaximo(0, 30)).toBe(1);
  });

  it('limita o zoom entre 1 e o máximo', () => {
    expect(limitarZoom(0.5, 4)).toBe(1);
    expect(limitarZoom(2.5, 4)).toBe(2.5);
    expect(limitarZoom(9, 4)).toBe(4);
  });
});

describe('tamanhoJanela', () => {
  it('cresce com o terreno até a tela', () => {
    // a 3 pt/m: 300 × 150
    expect(tamanhoJanela(terreno, 3, 300, 400)).toEqual({ largura: 300, altura: 150 });
    // a 12 pt/m: 1.200 × 600, limitado a 300 × 400
    expect(tamanhoJanela(terreno, 12, 300, 400)).toEqual({ largura: 300, altura: 400 });
  });
});

describe('deslocamento', () => {
  // A 12 pt/m o terreno tem 1.200 × 600 pontos; a janela, 300 × 400.
  const janela = { largura: 300, altura: 400 };

  it('não deixa faixa vazia nas bordas', () => {
    // máximos: 1.200 − 300 = 900 e 600 − 400 = 200
    expect(limitarDeslocamento({ x: 2000, y: 500 }, terreno, 12, janela)).toEqual({ x: 900, y: 200 });
    expect(limitarDeslocamento({ x: -10, y: -10 }, terreno, 12, janela)).toEqual({ x: 0, y: 0 });
    // terreno menor que a janela: fica parado
    expect(limitarDeslocamento({ x: 50, y: 50 }, terreno, 2, janela)).toEqual({ x: 0, y: 0 });
  });

  it('põe um ponto do terreno no lugar pedido da janela', () => {
    // 50 m × 12 = 600 pontos; no centro da janela (150): 600 − 150 = 450
    // 25 m × 12 = 300; 300 − 200 = 100
    expect(enquadrar({ x: 50, y: 25 }, { x: 150, y: 200 }, terreno, 12, janela)).toEqual({
      x: 450,
      y: 100,
    });
    // perto da borda, o limite vence: 1 m × 12 − 150 < 0
    expect(enquadrar({ x: 1, y: 1 }, { x: 150, y: 200 }, terreno, 12, janela)).toEqual({ x: 0, y: 0 });
  });

  it('acha o ponto do terreno sob a janela', () => {
    // (150 + 450) ÷ 12 = 50; (200 + 100) ÷ 12 = 25
    const ponto = pontoDoTerreno({ x: 150, y: 200 }, { x: 450, y: 100 }, 12);
    expect(ponto.x).toBeCloseTo(50, 6);
    expect(ponto.y).toBeCloseTo(25, 6);
  });
});

describe('dois dedos', () => {
  it('mede a distância e o meio entre os toques', () => {
    // triângulo 3-4-5
    expect(distancia({ x: 0, y: 0 }, { x: 3, y: 4 })).toBeCloseTo(5, 6);
    expect(pontoMedio({ x: 0, y: 10 }, { x: 4, y: 20 })).toEqual({ x: 2, y: 15 });
  });
});

describe('dentroDaArea', () => {
  // Lixeira de 72 × 72 com o canto em (100, 500)
  const lixeira = { x: 100, y: 500, largura: 72, altura: 72 };

  it('acerta dentro e nas bordas da área', () => {
    expect(dentroDaArea({ x: 136, y: 536 }, lixeira)).toBe(true);
    // 100 + 72 = 172, a borda direita
    expect(dentroDaArea({ x: 172, y: 572 }, lixeira)).toBe(true);
    expect(dentroDaArea({ x: 173, y: 536 }, lixeira)).toBe(false);
  });

  it('aceita a folga em volta', () => {
    // 16 pontos acima: 500 − 16 = 484
    expect(dentroDaArea({ x: 136, y: 484 }, lixeira, 16)).toBe(true);
    expect(dentroDaArea({ x: 136, y: 483 }, lixeira, 16)).toBe(false);
  });
});
