// Distribuição de mudas num terreno (RF06), como na colocação de construções
// de jogos de estratégia: cada muda reserva um retângulo de 3 m × 2 m — o
// espaçamento do plantio de restauração usado na taxa por muda (ver
// AREA_POR_MUDA_M2 em arvores.ts) — encaixado numa grade de 1 m. Uma posição
// só vale se o retângulo couber no terreno e não encostar no de outra muda.

export type Terreno = {
  larguraM: number;
  comprimentoM: number;
};

// Canto superior esquerdo do retângulo da muda, em metros inteiros.
export type PosicaoMuda = {
  x: number;
  y: number;
};

// Espaço reservado por muda: 3 m na largura e 2 m no comprimento do terreno.
export const ESPACO_MUDA = { larguraM: 3, comprimentoM: 2 } as const;

// Lados aceitos para o terreno, em metros: abaixo de uma muda não cabe nada; o
// máximo mantém a grade legível na tela do celular.
export const LADO_MINIMO_M = 2;
export const LADO_MAXIMO_M = 100;

export function terrenoValido({ larguraM, comprimentoM }: Terreno): boolean {
  return [larguraM, comprimentoM].every(
    (lado) => Number.isInteger(lado) && lado >= LADO_MINIMO_M && lado <= LADO_MAXIMO_M,
  );
}

export function cabeNoTerreno({ x, y }: PosicaoMuda, terreno: Terreno): boolean {
  return (
    x >= 0 &&
    y >= 0 &&
    x + ESPACO_MUDA.larguraM <= terreno.larguraM &&
    y + ESPACO_MUDA.comprimentoM <= terreno.comprimentoM
  );
}

// Retângulos que só se encostam pela borda não se sobrepõem.
export function sobrepoe(a: PosicaoMuda, b: PosicaoMuda): boolean {
  return (
    a.x < b.x + ESPACO_MUDA.larguraM &&
    b.x < a.x + ESPACO_MUDA.larguraM &&
    a.y < b.y + ESPACO_MUDA.comprimentoM &&
    b.y < a.y + ESPACO_MUDA.comprimentoM
  );
}

// Se a muda pode ficar em `posicao`, dadas as outras já colocadas.
export function posicaoValida(
  posicao: PosicaoMuda,
  outras: PosicaoMuda[],
  terreno: Terreno,
): boolean {
  return cabeNoTerreno(posicao, terreno) && outras.every((outra) => !sobrepoe(posicao, outra));
}

// Leva um ponto qualquer (em metros, como o dedo na tela) para a posição da
// grade mais próxima, com a muda centrada no ponto e sem sair do terreno.
export function encaixarNaGrade(xM: number, yM: number, terreno: Terreno): PosicaoMuda {
  const limitar = (valor: number, maximo: number) =>
    Math.min(Math.max(valor, 0), Math.max(maximo, 0));
  return {
    x: limitar(Math.round(xM - ESPACO_MUDA.larguraM / 2), terreno.larguraM - ESPACO_MUDA.larguraM),
    y: limitar(
      Math.round(yM - ESPACO_MUDA.comprimentoM / 2),
      terreno.comprimentoM - ESPACO_MUDA.comprimentoM,
    ),
  };
}

// Quantas mudas cabem no máximo. Com retângulos iguais e na mesma direção, a
// grade de linhas e colunas é o melhor arranjo: cada linha tem no máximo
// ⌊largura ÷ 3⌋ mudas e cabem no máximo ⌊comprimento ÷ 2⌋ linhas.
export function capacidadeTerreno(terreno: Terreno): number {
  return (
    Math.floor(terreno.larguraM / ESPACO_MUDA.larguraM) *
    Math.floor(terreno.comprimentoM / ESPACO_MUDA.comprimentoM)
  );
}

// Coloca até `quantidade` mudas em linhas, da esquerda para a direita e de cima
// para baixo. Devolve menos posições quando o terreno não comporta todas.
export function distribuirEmLinhas(quantidade: number, terreno: Terreno): PosicaoMuda[] {
  if (!Number.isInteger(quantidade) || quantidade < 0) {
    throw new Error(`Quantidade de mudas inválida: ${quantidade}`);
  }
  const porLinha = Math.floor(terreno.larguraM / ESPACO_MUDA.larguraM);
  const total = Math.min(quantidade, capacidadeTerreno(terreno));
  return Array.from({ length: total }, (_, i) => ({
    x: (i % porLinha) * ESPACO_MUDA.larguraM,
    y: Math.floor(i / porLinha) * ESPACO_MUDA.comprimentoM,
  }));
}

// Terreno inicial sugerido: o menor quadrado, a partir de 6 m, em que cabem
// todas as mudas com 2 m de folga, sem passar do limite.
export function terrenoSugerido(quantidade: number): Terreno {
  const folgaM = 2;
  let lado = 6;
  while (
    lado < LADO_MAXIMO_M &&
    capacidadeTerreno({ larguraM: lado, comprimentoM: lado }) < quantidade
  ) {
    lado += 1;
  }
  const comFolga = Math.min(LADO_MAXIMO_M, lado + (lado > 6 ? folgaM : 0));
  return { larguraM: comFolga, comprimentoM: comFolga };
}
