import type { Terreno } from '@/calculo/distribuicao';

// Geometria do zoom no terreno da distribuição de mudas. A janela é o pedaço
// do terreno visível na tela; o deslocamento é quanto o terreno está empurrado
// para a esquerda e para cima dentro dela, em pontos. Funções puras, testadas
// sem a tela (como geometriaAnel.ts).

export type Ponto = { x: number; y: number };
export type Tamanho = { largura: number; altura: number };

// Escala (pontos por metro) em que o terreno inteiro cabe na largura disponível
// sem passar da altura máxima: é o zoom 1.
export function pontosPorMetroInteiro(
  terreno: Terreno,
  larguraDisponivel: number,
  alturaMaxima: number,
): number {
  if (larguraDisponivel <= 0) return 0;
  return Math.min(larguraDisponivel / terreno.larguraM, alturaMaxima / terreno.comprimentoM);
}

// Até onde dá para aproximar: até a escala máxima, mas nunca abaixo do zoom 1
// (um terreno pequeno já aparece grande e não tem zoom).
export function zoomMaximo(pontosPorMetroBase: number, pontosPorMetroMaximo: number): number {
  if (pontosPorMetroBase <= 0) return 1;
  return Math.max(1, pontosPorMetroMaximo / pontosPorMetroBase);
}

export function limitarZoom(zoom: number, maximo: number): number {
  return Math.min(Math.max(zoom, 1), maximo);
}

// A janela cresce com o terreno até a largura disponível e a altura máxima.
export function tamanhoJanela(
  terreno: Terreno,
  pontosPorMetro: number,
  larguraDisponivel: number,
  alturaMaxima: number,
): Tamanho {
  return {
    largura: Math.min(terreno.larguraM * pontosPorMetro, larguraDisponivel),
    altura: Math.min(terreno.comprimentoM * pontosPorMetro, alturaMaxima),
  };
}

// Mantém o terreno cobrindo a janela inteira: sem faixa vazia nas bordas.
export function limitarDeslocamento(
  deslocamento: Ponto,
  terreno: Terreno,
  pontosPorMetro: number,
  janela: Tamanho,
): Ponto {
  const limitar = (valor: number, maximo: number) => Math.min(Math.max(valor, 0), Math.max(maximo, 0));
  return {
    x: limitar(deslocamento.x, terreno.larguraM * pontosPorMetro - janela.largura),
    y: limitar(deslocamento.y, terreno.comprimentoM * pontosPorMetro - janela.altura),
  };
}

// Deslocamento que põe o ponto `pontoM` do terreno (em metros) no lugar
// `naJanela` da tela, dentro dos limites. É o que segura sob os dedos o ponto
// em que a pinça começou, e o centro da janela nos botões de zoom.
export function enquadrar(
  pontoM: Ponto,
  naJanela: Ponto,
  terreno: Terreno,
  pontosPorMetro: number,
  janela: Tamanho,
): Ponto {
  return limitarDeslocamento(
    { x: pontoM.x * pontosPorMetro - naJanela.x, y: pontoM.y * pontosPorMetro - naJanela.y },
    terreno,
    pontosPorMetro,
    janela,
  );
}

// Ponto do terreno, em metros, que aparece em `naJanela`.
export function pontoDoTerreno(naJanela: Ponto, deslocamento: Ponto, pontosPorMetro: number): Ponto {
  return {
    x: (naJanela.x + deslocamento.x) / pontosPorMetro,
    y: (naJanela.y + deslocamento.y) / pontosPorMetro,
  };
}

export function distancia(a: Ponto, b: Ponto): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function pontoMedio(a: Ponto, b: Ponto): Ponto {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

export type Area = Ponto & Tamanho;

// Se o ponto cai dentro da área, aumentada de `folga` em cada lado. A folga
// deixa acertar a lixeira sem precisão de dedo.
export function dentroDaArea(ponto: Ponto, area: Area, folga = 0): boolean {
  return (
    ponto.x >= area.x - folga &&
    ponto.x <= area.x + area.largura + folga &&
    ponto.y >= area.y - folga &&
    ponto.y <= area.y + area.altura + folga
  );
}
