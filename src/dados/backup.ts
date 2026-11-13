import { Storage } from 'expo-sqlite/kv-store';

import { CHAVE_REGISTROS, lerRegistrosConsumo, validarRegistroConsumo, type RegistroConsumo } from './consumos';

export const VERSAO_BACKUP = 1;
export const TAMANHO_MAXIMO_BACKUP_BYTES = 5 * 1024 * 1024;

type ArquivoBackup = {
  versaoFormato: number;
  registros: RegistroConsumo[];
};

function ehObjeto(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === 'object' && valor !== null && !Array.isArray(valor);
}

function medirUtf8(conteudo: string): number {
  let total = 0;
  for (let indice = 0; indice < conteudo.length; indice += 1) {
    const codigo = conteudo.charCodeAt(indice);
    if (codigo <= 0x7f) total += 1;
    else if (codigo <= 0x7ff) total += 2;
    else if (codigo >= 0xd800 && codigo <= 0xdbff && indice + 1 < conteudo.length) {
      total += 4;
      indice += 1;
    } else total += 3;
  }
  return total;
}

export function gerarConteudoBackup(): string {
  return serializarConteudoBackup(lerRegistrosConsumo());
}

export function serializarConteudoBackup(registros: RegistroConsumo[]): string {
  const backup: ArquivoBackup = { versaoFormato: VERSAO_BACKUP, registros };
  return JSON.stringify(backup, null, 2);
}

export function validarConteudoBackup(conteudo: string): RegistroConsumo[] {
  if (medirUtf8(conteudo) > TAMANHO_MAXIMO_BACKUP_BYTES) {
    throw new Error('O arquivo de backup é maior que o limite permitido.');
  }

  let dados: unknown;
  try {
    dados = JSON.parse(conteudo) as unknown;
  } catch {
    throw new Error('O arquivo não contém um backup válido.');
  }

  if (!ehObjeto(dados) || typeof dados.versaoFormato !== 'number') {
    throw new Error('O arquivo não contém um backup válido.');
  }
  if (dados.versaoFormato !== VERSAO_BACKUP) {
    throw new Error('A versão deste backup não é compatível com o app.');
  }
  if (!Array.isArray(dados.registros) || !dados.registros.every(validarRegistroConsumo)) {
    throw new Error('O backup tem dados incompletos ou inválidos. Seus registros atuais foram mantidos.');
  }

  const ids = dados.registros.map((registro) => registro.id);
  if (new Set(ids).size !== ids.length) {
    throw new Error('O backup contém períodos repetidos. Seus registros atuais foram mantidos.');
  }
  return dados.registros;
}

export function restaurarConteudoBackup(conteudo: string): number {
  const registros = validarConteudoBackup(conteudo);
  // Um único valor do KV Store é atualizado após validar todo o arquivo.
  Storage.setItemSync(CHAVE_REGISTROS, JSON.stringify(registros));
  return registros.length;
}

export function apagarRegistrosSalvos(): void {
  Storage.removeItemSync(CHAVE_REGISTROS);
}
