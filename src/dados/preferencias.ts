import { Storage } from 'expo-sqlite/kv-store';

import type { PeriodoReferencia, Perfil } from '@/calculo/tipos';

// Preferências do usuário guardadas no aparelho. A leitura é síncrona para
// que o tema escolhido seja aplicado antes da primeira tela aparecer.

export type PreferenciaTema = 'claro' | 'escuro' | 'sistema';

export const PREFERENCIA_TEMA_PADRAO: PreferenciaTema = 'claro';

const CHAVE_TEMA = 'preferencias.tema';
const CHAVE_BOAS_VINDAS = 'preferencias.boasVindasConcluidas';
const CHAVE_PERFIL = 'preferencias.perfil';
const CHAVE_PERIODO = 'preferencias.periodo';

export const PERFIL_PADRAO: Perfil = 'residencia';
export const PERIODO_PADRAO: PeriodoReferencia = 'mes';

export function interpretarPreferenciaTema(valor: string | null): PreferenciaTema {
  if (valor === 'claro' || valor === 'escuro' || valor === 'sistema') {
    return valor;
  }
  return PREFERENCIA_TEMA_PADRAO;
}

export function lerPreferenciaTema(): PreferenciaTema {
  return interpretarPreferenciaTema(Storage.getItemSync(CHAVE_TEMA));
}

export function salvarPreferenciaTema(preferencia: PreferenciaTema): void {
  Storage.setItemSync(CHAVE_TEMA, preferencia);
}

export function boasVindasConcluidas(): boolean {
  return Storage.getItemSync(CHAVE_BOAS_VINDAS) === 'sim';
}

export function marcarBoasVindasConcluidas(): void {
  Storage.setItemSync(CHAVE_BOAS_VINDAS, 'sim');
}

export function interpretarPerfil(valor: string | null): Perfil {
  if (valor === 'pessoa' || valor === 'residencia' || valor === 'comercio') {
    return valor;
  }
  return PERFIL_PADRAO;
}

export function lerPerfil(): Perfil {
  return interpretarPerfil(Storage.getItemSync(CHAVE_PERFIL));
}

export function salvarPerfil(perfil: Perfil): void {
  Storage.setItemSync(CHAVE_PERFIL, perfil);
}

export function interpretarPeriodo(valor: string | null): PeriodoReferencia {
  if (valor === 'mes' || valor === 'ano') {
    return valor;
  }
  return PERIODO_PADRAO;
}

export function lerPeriodo(): PeriodoReferencia {
  return interpretarPeriodo(Storage.getItemSync(CHAVE_PERIODO));
}

export function salvarPeriodo(periodo: PeriodoReferencia): void {
  Storage.setItemSync(CHAVE_PERIODO, periodo);
}
