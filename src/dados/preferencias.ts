import { Storage } from 'expo-sqlite/kv-store';

// Preferências do usuário guardadas no aparelho. A leitura é síncrona para
// que o tema escolhido seja aplicado antes da primeira tela aparecer.

export type PreferenciaTema = 'claro' | 'escuro' | 'sistema';

export const PREFERENCIA_TEMA_PADRAO: PreferenciaTema = 'claro';

const CHAVE_TEMA = 'preferencias.tema';
const CHAVE_BOAS_VINDAS = 'preferencias.boasVindasConcluidas';

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
