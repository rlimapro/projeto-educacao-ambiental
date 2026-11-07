import { calcularEmissoes } from '@/calculo/emissoes';

import { lerRegistrosConsumo, salvarRegistroConsumo, validarRegistroConsumo, type RegistroConsumo } from './consumos';

jest.mock('expo-sqlite/kv-store', () => {
  const valores = new Map<string, string>();
  return {
    Storage: {
      getItemSync: (chave: string) => valores.get(chave) ?? null,
      setItemSync: (chave: string, valor: string) => valores.set(chave, valor),
      clearSync: () => valores.clear(),
    },
  };
});

const { Storage } = jest.requireMock<{ Storage: { getItemSync: (chave: string) => string | null; setItemSync: (chave: string, valor: string) => void; clearSync: () => void } }>(
  'expo-sqlite/kv-store',
);

function criarRegistro(mes: number): RegistroConsumo {
  const ano = 2026;
  const consumos = { energiaKwh: 100, gasolinaLitros: 0, etanolLitros: 0, dieselLitros: 0, glpBotoes13Kg: 0 };
  return {
    id: `${ano}-${String(mes).padStart(2, '0')}`,
    ano,
    mes,
    perfil: 'residencia',
    consumos,
    calculo: calcularEmissoes(consumos, ano, mes),
    criadoEm: '2026-11-04T12:00:00.000Z',
  };
}

beforeEach(() => Storage.clearSync());

describe('validarRegistroConsumo', () => {
  it('aceita registro com consumos, cálculo e fator rastreável', () => {
    expect(validarRegistroConsumo(criarRegistro(11))).toBe(true);
  });

  it('recusa período, consumo ou memória de cálculo inválidos', () => {
    const registro = criarRegistro(11);
    expect(validarRegistroConsumo({ ...registro, id: '2026-13', mes: 13 })).toBe(false);
    expect(validarRegistroConsumo({ ...registro, consumos: { ...registro.consumos, energiaKwh: -1 } })).toBe(false);
    expect(validarRegistroConsumo({ ...registro, calculo: { totalKgCo2e: 1, fontes: [{ id: 'energia' }] } })).toBe(false);
  });
});

describe('lerRegistrosConsumo', () => {
  it('retorna lista vazia no primeiro uso e lê os registros salvos', () => {
    expect(lerRegistrosConsumo()).toEqual([]);
    salvarRegistroConsumo(criarRegistro(11));
    expect(lerRegistrosConsumo()).toHaveLength(1);
    expect(lerRegistrosConsumo()[0].id).toBe('2026-11');
  });

  it('mantém os dados existentes quando o conteúdo local é inválido', () => {
    Storage.setItemSync('consumos.registrados.v1', '{invalido');
    expect(() => lerRegistrosConsumo()).toThrow('não puderam ser lidos');
    expect(Storage.getItemSync('consumos.registrados.v1')).toBe('{invalido');
  });
});

describe('salvarRegistroConsumo', () => {
  it('ordena períodos e substitui o mesmo mês sem duplicar', () => {
    salvarRegistroConsumo(criarRegistro(10));
    salvarRegistroConsumo(criarRegistro(11));
    salvarRegistroConsumo({ ...criarRegistro(11), perfil: 'pessoa' });
    const registros = lerRegistrosConsumo();
    expect(registros.map((registro) => registro.id)).toEqual(['2026-11', '2026-10']);
    expect(registros[0].perfil).toBe('pessoa');
  });

  it('não grava um registro inválido', () => {
    expect(() => salvarRegistroConsumo({ ...criarRegistro(11), consumos: { ...criarRegistro(11).consumos, energiaKwh: -1 } })).toThrow();
    expect(lerRegistrosConsumo()).toEqual([]);
  });
});
