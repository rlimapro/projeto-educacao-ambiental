import { calcularEmissoes } from '@/calculo/emissoes';

import {
  gerarConteudoBackup,
  restaurarConteudoBackup,
  serializarConteudoBackup,
  validarConteudoBackup,
} from './backup';
import { lerRegistrosConsumo, salvarRegistroConsumo, type RegistroConsumo } from './consumos';

jest.mock('expo-sqlite/kv-store', () => {
  const valores = new Map<string, string>();
  return {
    Storage: {
      getItemSync: (chave: string) => valores.get(chave) ?? null,
      setItemSync: (chave: string, valor: string) => valores.set(chave, valor),
      removeItemSync: (chave: string) => valores.delete(chave),
      clearSync: () => valores.clear(),
    },
  };
});

const { Storage } = jest.requireMock<{ Storage: {
  getItemSync: (chave: string) => string | null;
  setItemSync: (chave: string, valor: string) => void;
  clearSync: () => void;
} }>('expo-sqlite/kv-store');

function criarRegistro(): RegistroConsumo {
  const ano = 2026;
  const mes = 10;
  const consumos = { energiaKwh: 100, gasolinaLitros: 0, etanolLitros: 0, dieselLitros: 0, glpBotoes13Kg: 0 };
  return {
    id: '2026-10',
    ano,
    mes,
    perfil: 'residencia',
    consumos,
    calculo: calcularEmissoes(consumos, ano, mes),
    criadoEm: '2026-11-04T12:00:00.000Z',
  };
}

beforeEach(() => Storage.clearSync());

describe('backup local', () => {
  it('exporta e importa os registros sem alterar os dados', () => {
    const registro = criarRegistro();
    salvarRegistroConsumo(registro);

    const conteudo = gerarConteudoBackup();
    Storage.clearSync();
    const quantidade = restaurarConteudoBackup(conteudo);

    expect(quantidade).toBe(1);
    expect(lerRegistrosConsumo()).toEqual([registro]);
  });

  it('serializa e valida um arquivo de backup versionado', () => {
    const registro = criarRegistro();
    const conteudo = serializarConteudoBackup([registro]);

    expect(validarConteudoBackup(conteudo)).toEqual([registro]);
  });

  it('recusa JSON inválido, versão desconhecida e campos obrigatórios ausentes', () => {
    expect(() => validarConteudoBackup('{inválido')).toThrow('backup válido');
    expect(() => validarConteudoBackup(JSON.stringify({ versaoFormato: 99, registros: [] }))).toThrow('não é compatível');
    expect(() => validarConteudoBackup(JSON.stringify({ versaoFormato: 1 }))).toThrow('incompletos ou inválidos');
  });

  it('mantém os registros salvos se o arquivo importado for inválido', () => {
    const atual = criarRegistro();
    salvarRegistroConsumo(atual);

    expect(() => restaurarConteudoBackup(JSON.stringify({ versaoFormato: 1, registros: [{ id: 'inválido' }] }))).toThrow();
    expect(lerRegistrosConsumo()).toEqual([atual]);
  });
});
