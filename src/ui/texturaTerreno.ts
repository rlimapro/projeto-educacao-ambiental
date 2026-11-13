import type { Terreno } from '@/calculo/distribuicao';

import type { Ponto } from './geometriaTerreno';

// Textura de terra arada do terreno da distribuição de mudas, vista de cima.
// Segue o que as referências de solo arado mostram (fotos aéreas e tiles de
// jogos de fazenda): sulcos paralelos com uma ondulação leve, crista
// iluminada e fundo em sombra, torrões e pedrinhas na borda dos sulcos, restos
// de palha e manchas grandes de terra úmida ou seca. Tudo aqui é geometria
// pura; as cores vêm do tema, no PlanoTerreno.
//
// O desenho é um bloco que se repete (um Pattern do SVG): o custo é o mesmo
// num terreno de 6 m ou de 100 m. O bloco tem 7 m de largura, e não um
// múltiplo de 3, para a repetição não se alinhar com as colunas de mudas.

export const LARGURA_BLOCO_M = 7;
// Sulcos por bloco: dois, com ondas em fases diferentes, para vizinhos não
// serem iguais.
export const SULCOS_POR_BLOCO = 2;

// Partes de um sulco, em fração da distância entre sulcos (de cima para baixo):
// a crista, onde a luz bate; a encosta em sombra; e o fundo.
const CRISTA = 0.16;
const FUNDO = 0.74;
// Ondulação: amplitude da onda e da segunda harmônica, em fração do sulco.
const ONDA = 0.07;
const HARMONICA = 0.025;
const PASSOS_ONDA = 28;

// Gerador pseudoaleatório com semente fixa (LCG de Numerical Recipes): o
// mesmo terreno sai sempre igual, sem Math.random.
function sorteador(semente: number): () => number {
  let estado = semente >>> 0;
  return () => {
    estado = (Math.imul(estado, 1664525) + 1013904223) >>> 0;
    return estado / 2 ** 32;
  };
}

// Deslocamento vertical da onda de um sulco em x, com período igual à largura
// do bloco (o começo e o fim do bloco se encaixam).
function onda(x: number, larguraBloco: number, sulco: number, fase: number): number {
  const angulo = (2 * Math.PI * x) / larguraBloco + fase;
  return sulco * (ONDA * Math.sin(angulo) + HARMONICA * Math.sin(2 * angulo + fase * 1.7));
}

function fase(indice: number): number {
  return indice * 2.1;
}

// Linha ondulada de um sulco, como caminho SVG, de x = 0 até o fim do bloco.
function linhaOndulada(
  larguraBloco: number,
  sulco: number,
  indice: number,
  fracao: number,
): Ponto[] {
  const base = indice * sulco + fracao * sulco;
  return Array.from({ length: PASSOS_ONDA + 1 }, (_, i) => {
    const x = (larguraBloco * i) / PASSOS_ONDA;
    return { x, y: base + onda(x, larguraBloco, sulco, fase(indice)) };
  });
}

function caminho(pontos: Ponto[]): string {
  return pontos.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join('');
}

export type SulcoDesenhado = {
  // Faixa da encosta em sombra, da crista ao fundo, fechada.
  encosta: string;
  crista: string;
  fundo: string;
};

// Os sulcos de um bloco, em pontos.
export function sulcosDoBloco(larguraBloco: number, sulco: number): SulcoDesenhado[] {
  return Array.from({ length: SULCOS_POR_BLOCO }, (_, indice) => {
    const crista = linhaOndulada(larguraBloco, sulco, indice, CRISTA);
    const fundo = linhaOndulada(larguraBloco, sulco, indice, FUNDO);
    const encosta = `${caminho(crista)}${caminho([...fundo].reverse()).replace(/^M/, 'L')}Z`;
    return { encosta, crista: caminho(crista), fundo: caminho(fundo) };
  });
}

export type Detalhe = {
  tipo: 'torraoEscuro' | 'torraoClaro' | 'pedra' | 'palha';
  x: number;
  y: number;
  // Raios (torrões, pedras) ou meio comprimento (palha), em pontos.
  rx: number;
  ry: number;
  // Inclinação, em graus (palha e torrões alongados).
  giro: number;
};

// Torrões, pedrinhas e palha de um bloco, em pontos. Os torrões escuros ficam
// na borda do fundo do sulco, onde a terra se acumula; os claros, na crista.
// Nada encosta na borda do bloco, para não ser cortado na emenda.
export function detalhesDoBloco(larguraBloco: number, sulco: number): Detalhe[] {
  const sorte = sorteador(20261111);
  const detalhes: Detalhe[] = [];
  const margem = 0.04 * larguraBloco;
  const x = () => margem + sorte() * (larguraBloco - 2 * margem);
  for (let indice = 0; indice < SULCOS_POR_BLOCO; indice++) {
    const naLinha = (fracao: number, px: number) =>
      indice * sulco + fracao * sulco + onda(px, larguraBloco, sulco, fase(indice));
    for (let i = 0; i < 9; i++) {
      const px = x();
      const tamanho = sulco * (0.07 + sorte() * 0.09);
      detalhes.push({
        tipo: 'torraoEscuro',
        x: px,
        y: naLinha(FUNDO - 0.08 + sorte() * 0.1, px),
        rx: tamanho,
        ry: tamanho * (0.6 + sorte() * 0.3),
        giro: sorte() * 180,
      });
    }
    for (let i = 0; i < 8; i++) {
      const px = x();
      const tamanho = sulco * (0.06 + sorte() * 0.08);
      detalhes.push({
        tipo: 'torraoClaro',
        x: px,
        y: naLinha(CRISTA + 0.04 + sorte() * 0.16, px),
        rx: tamanho,
        ry: tamanho * (0.6 + sorte() * 0.3),
        giro: sorte() * 180,
      });
    }
    // Uma pedrinha por sulco, no meio da encosta.
    const pxPedra = x();
    const pedra = sulco * (0.06 + sorte() * 0.04);
    detalhes.push({
      tipo: 'pedra',
      x: pxPedra,
      y: naLinha(0.45 + sorte() * 0.15, pxPedra),
      rx: pedra,
      ry: pedra * 0.8,
      giro: sorte() * 180,
    });
    // Dois restos de palha, quase na direção dos sulcos.
    for (let i = 0; i < 2; i++) {
      const px = x();
      detalhes.push({
        tipo: 'palha',
        x: px,
        y: naLinha(0.8 + sorte() * 0.1, px),
        rx: sulco * (0.18 + sorte() * 0.14),
        ry: 0,
        giro: -25 + sorte() * 50,
      });
    }
  }
  return detalhes;
}

export type Mancha = {
  // Centro e raios, em metros; alongada na direção dos sulcos.
  x: number;
  y: number;
  rx: number;
  ry: number;
  // Úmida (mais escura) ou seca (mais clara).
  umida: boolean;
};

// Manchas grandes de terra úmida e seca espalhadas pelo terreno: uma a cada
// 120 m², de 3 a 14. A semente vem das medidas, então o mesmo terreno tem
// sempre as mesmas manchas.
export function manchasDoTerreno({ larguraM, comprimentoM }: Terreno): Mancha[] {
  const quantidade = Math.min(14, Math.max(3, Math.round((larguraM * comprimentoM) / 120)));
  const sorte = sorteador(larguraM * 1009 + comprimentoM * 9176);
  const menorLado = Math.min(larguraM, comprimentoM);
  return Array.from({ length: quantidade }, (_, i) => {
    const rx = menorLado * (0.18 + sorte() * 0.22);
    return {
      x: sorte() * larguraM,
      y: sorte() * comprimentoM,
      rx,
      ry: rx * (0.35 + sorte() * 0.25),
      umida: i % 3 !== 2,
    };
  });
}
