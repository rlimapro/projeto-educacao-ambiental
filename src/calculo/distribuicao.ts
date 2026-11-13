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

// Plano com mais de um terreno: as mudas da simulação são divididas entre
// terrenos de medidas diferentes (por exemplo, 10 mudas em 3 terrenos).
export type TerrenoPlanejado = Terreno & {
  // Identifica o terreno enquanto outros são criados e tirados.
  id: number;
  mudas: PosicaoMuda[];
};

// Limite de terrenos num plano. Com o terreno máximo (1.650 mudas), 7 já
// comportam as 9.999 mudas da simulação; o limite folgado serve a quem divide o
// plantio em muitos terrenos pequenos (quintais, canteiros).
export const MAXIMO_TERRENOS = 100;

export function totalMudas(terrenos: TerrenoPlanejado[]): number {
  return terrenos.reduce((soma, terreno) => soma + terreno.mudas.length, 0);
}

export function capacidadeTotal(terrenos: Terreno[]): number {
  return terrenos.reduce((soma, terreno) => soma + capacidadeTerreno(terreno), 0);
}

// Novo terreno, com o próximo id, no tamanho sugerido para `quantidade` mudas.
export function novoTerreno(terrenos: TerrenoPlanejado[], quantidade: number): TerrenoPlanejado {
  const id = terrenos.reduce((maior, terreno) => Math.max(maior, terreno.id), 0) + 1;
  return { id, ...terrenoSugerido(Math.max(1, quantidade)), mudas: [] };
}

// Mantém no plano no máximo `quantidade` mudas, tirando primeiro as últimas
// colocadas, do último terreno para o primeiro. Serve para um plano salvo
// quando a simulação passa a ter menos árvores.
export function limitarAQuantidade(
  terrenos: TerrenoPlanejado[],
  quantidade: number,
): { terrenos: TerrenoPlanejado[]; retiradas: number } {
  let excesso = Math.max(0, totalMudas(terrenos) - quantidade);
  const retiradas = excesso;
  const ajustados = [...terrenos]
    .reverse()
    .map((terreno) => {
      const tirar = Math.min(excesso, terreno.mudas.length);
      excesso -= tirar;
      return tirar > 0
        ? { ...terreno, mudas: terreno.mudas.slice(0, terreno.mudas.length - tirar) }
        : terreno;
    })
    .reverse();
  return { terrenos: ajustados, retiradas };
}

// Primeira posição livre, varrendo a grade linha por linha. Usada quando a muda
// é colocada sem apontar o lugar (leitor de tela). Devolve null se não houver.
export function primeiraPosicaoLivre(
  mudas: PosicaoMuda[],
  terreno: Terreno,
): PosicaoMuda | null {
  for (let y = 0; y + ESPACO_MUDA.comprimentoM <= terreno.comprimentoM; y += 1) {
    for (let x = 0; x + ESPACO_MUDA.larguraM <= terreno.larguraM; x += 1) {
      if (posicaoValida({ x, y }, mudas, terreno)) return { x, y };
    }
  }
  return null;
}

// Tira os terrenos de `ids` do plano. Um plano não fica vazio: se todos saírem,
// sobra um terreno novo, no tamanho sugerido para `quantidade` mudas.
export function tirarTerrenos(
  terrenos: TerrenoPlanejado[],
  ids: number[],
  quantidade: number,
): { terrenos: TerrenoPlanejado[]; mudasTiradas: number } {
  const tirados = terrenos.filter((terreno) => ids.includes(terreno.id));
  const restantes = terrenos.filter((terreno) => !ids.includes(terreno.id));
  return {
    terrenos: restantes.length > 0 ? restantes : [novoTerreno([], quantidade)],
    mudasTiradas: totalMudas(tirados),
  };
}
