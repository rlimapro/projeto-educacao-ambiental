import { Storage } from 'expo-sqlite/kv-store';

import type { ConsumosInformados, FonteEmissaoId, Perfil, ResultadoEmissoes } from '@/calculo/tipos';

export type RegistroConsumo = {
  id: string;
  ano: number;
  mes: number;
  perfil: Perfil;
  consumos: ConsumosInformados;
  calculo: ResultadoEmissoes;
  criadoEm: string;
};

const CHAVE_REGISTROS = 'consumos.registrados.v1';
const IDS_FONTES: FonteEmissaoId[] = ['energia', 'gasolina', 'etanol', 'diesel', 'glp'];
const IDS_FATORES = ['energia', 'gasolina-e30', 'gasolina-e32', 'etanol', 'diesel', 'glp'];
const PERFIS: Perfil[] = ['pessoa', 'residencia', 'comercio'];
const CHAVES_CONSUMOS: (keyof ConsumosInformados)[] = [
  'energiaKwh', 'gasolinaLitros', 'etanolLitros', 'dieselLitros', 'glpBotoes13Kg',
];

function ehObjeto(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === 'object' && valor !== null && !Array.isArray(valor);
}

function numeroNaoNegativo(valor: unknown): valor is number {
  return typeof valor === 'number' && Number.isFinite(valor) && valor >= 0;
}

function validarFator(valor: unknown): boolean {
  if (!ehObjeto(valor)) return false;
  return typeof valor.id === 'string'
    && IDS_FATORES.includes(valor.id)
    && typeof valor.nome === 'string'
    && typeof valor.unidadeEntrada === 'string'
    && numeroNaoNegativo(valor.valor)
    && typeof valor.unidadeFator === 'string'
    && typeof valor.fonte === 'string'
    && Number.isInteger(valor.ano)
    && Number.isInteger(valor.versao)
    && Array.isArray(valor.perfis)
    && valor.perfis.every((perfil) => typeof perfil === 'string' && PERFIS.includes(perfil as Perfil));
}

function validarFonte(valor: unknown): boolean {
  if (!ehObjeto(valor)) return false;
  if (typeof valor.id !== 'string' || !IDS_FONTES.includes(valor.id as FonteEmissaoId)) return false;
  if (typeof valor.nome !== 'string' || !numeroNaoNegativo(valor.emissaoKgCo2e)) return false;
  if (!numeroNaoNegativo(valor.consumoInformado) || typeof valor.unidadeInformada !== 'string') return false;
  if (!numeroNaoNegativo(valor.consumoAplicado) || !validarFator(valor.fator)) return false;
  if (valor.conversao !== undefined) {
    if (!ehObjeto(valor.conversao)
      || !numeroNaoNegativo(valor.conversao.multiplicador)
      || typeof valor.conversao.unidadeResultado !== 'string') return false;
  }
  return true;
}

export function validarRegistroConsumo(valor: unknown): valor is RegistroConsumo {
  if (!ehObjeto(valor)) return false;
  if (typeof valor.ano !== 'number' || !Number.isInteger(valor.ano)
    || typeof valor.mes !== 'number' || !Number.isInteger(valor.mes) || valor.mes < 1 || valor.mes > 12) return false;
  if (valor.id !== `${valor.ano}-${String(valor.mes).padStart(2, '0')}`) return false;
  if (typeof valor.perfil !== 'string' || !PERFIS.includes(valor.perfil as Perfil)) return false;
  if (typeof valor.criadoEm !== 'string' || Number.isNaN(Date.parse(valor.criadoEm))) return false;
  const consumos = valor.consumos;
  if (!ehObjeto(consumos) || !CHAVES_CONSUMOS.every((chave) => numeroNaoNegativo(consumos[chave]))) return false;
  if (!ehObjeto(valor.calculo) || !numeroNaoNegativo(valor.calculo.totalKgCo2e) || !Array.isArray(valor.calculo.fontes)) return false;
  return valor.calculo.fontes.every(validarFonte);
}

export function lerRegistrosConsumo(): RegistroConsumo[] {
  const salvo = Storage.getItemSync(CHAVE_REGISTROS);
  if (salvo === null) return [];

  let registros: unknown;
  try {
    registros = JSON.parse(salvo) as unknown;
  } catch {
    throw new Error('Os consumos salvos não puderam ser lidos');
  }
  if (!Array.isArray(registros) || !registros.every(validarRegistroConsumo)) {
    throw new Error('Os consumos salvos têm um formato inválido');
  }
  return registros.sort((a, b) => b.ano - a.ano || b.mes - a.mes);
}

export function salvarRegistroConsumo(registro: RegistroConsumo): void {
  if (!validarRegistroConsumo(registro)) {
    throw new Error('O registro de consumo é inválido');
  }
  const registros = lerRegistrosConsumo().filter((item) => item.id !== registro.id);
  registros.push(registro);
  registros.sort((a, b) => b.ano - a.ano || b.mes - a.mes);
  Storage.setItemSync(CHAVE_REGISTROS, JSON.stringify(registros));
}

// Registro de um mês (AAAA-MM), com o cálculo salvo e os fatores daquela época.
export function buscarRegistroConsumo(id: string): RegistroConsumo | null {
  return lerRegistrosConsumo().find((registro) => registro.id === id) ?? null;
}
