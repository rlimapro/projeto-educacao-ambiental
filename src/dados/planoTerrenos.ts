import { Storage } from 'expo-sqlite/kv-store';

import {
  MAXIMO_TERRENOS,
  posicaoValida,
  terrenoValido,
  type PosicaoMuda,
  type TerrenoPlanejado,
} from '@/calculo/distribuicao';

// Terrenos e mudas da distribuição no terreno (RF06), guardados só no aparelho
// para o usuário voltar ao plano depois. É um plano só: o último salvo.

const CHAVE_PLANO = 'plantio.terrenos.v1';
// O mesmo limite de árvores da simulação.
const MAXIMO_MUDAS = 9999;

function ehObjeto(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === 'object' && valor !== null && !Array.isArray(valor);
}

function ehPosicao(valor: unknown): valor is PosicaoMuda {
  return ehObjeto(valor) && Number.isInteger(valor.x) && Number.isInteger(valor.y);
}

function validarTerreno(valor: unknown): valor is TerrenoPlanejado {
  if (!ehObjeto(valor) || !Number.isInteger(valor.id) || (valor.id as number) < 1) return false;
  const { larguraM, comprimentoM, mudas } = valor;
  if (typeof larguraM !== 'number' || typeof comprimentoM !== 'number') return false;
  const terreno = { larguraM, comprimentoM };
  if (!terrenoValido(terreno) || !Array.isArray(mudas) || !mudas.every(ehPosicao)) return false;
  // Cada muda dentro do terreno e sem encostar no espaço das anteriores.
  return mudas.every((muda, i) => posicaoValida(muda, mudas.slice(0, i), terreno));
}

export function validarPlanoTerrenos(valor: unknown): valor is TerrenoPlanejado[] {
  if (!Array.isArray(valor) || valor.length < 1 || valor.length > MAXIMO_TERRENOS) return false;
  if (!valor.every(validarTerreno)) return false;
  const ids = new Set(valor.map((terreno) => terreno.id));
  const mudas = valor.reduce((soma, terreno) => soma + terreno.mudas.length, 0);
  return ids.size === valor.length && mudas <= MAXIMO_MUDAS;
}

// Plano salvo, ou null quando não há nenhum. Um plano corrompido é descartado:
// ele não guarda consumos, e o usuário pode refazê-lo.
export function lerPlanoTerrenos(): TerrenoPlanejado[] | null {
  const salvo = Storage.getItemSync(CHAVE_PLANO);
  if (salvo === null) return null;
  try {
    const plano = JSON.parse(salvo) as unknown;
    if (!validarPlanoTerrenos(plano)) return null;
    // Só os campos conhecidos, sem nada a mais que o texto salvo tenha.
    return plano.map(({ id, larguraM, comprimentoM, mudas }) => ({
      id,
      larguraM,
      comprimentoM,
      mudas: mudas.map(({ x, y }) => ({ x, y })),
    }));
  } catch {
    return null;
  }
}

export function salvarPlanoTerrenos(terrenos: TerrenoPlanejado[]): void {
  if (!validarPlanoTerrenos(terrenos)) {
    throw new Error('O plano de terrenos é inválido');
  }
  Storage.setItemSync(CHAVE_PLANO, JSON.stringify(terrenos));
}
