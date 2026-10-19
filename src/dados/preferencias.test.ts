import {
  boasVindasConcluidas,
  interpretarPerfil,
  interpretarPeriodo,
  interpretarPreferenciaTema,
  lerPerfil,
  lerPeriodo,
  lerPreferenciaTema,
  marcarBoasVindasConcluidas,
  salvarPerfil,
  salvarPeriodo,
  salvarPreferenciaTema,
} from './preferencias';

// O expo-sqlite não roda no Jest; o armazenamento é simulado em memória.
jest.mock('expo-sqlite/kv-store', () => {
  const valores = new Map<string, string>();
  return {
    Storage: {
      getItemSync: (chave: string) => valores.get(chave) ?? null,
      setItemSync: (chave: string, valor: string) => {
        valores.set(chave, valor);
      },
      clearSync: () => {
        valores.clear();
        return true;
      },
    },
  };
});

const { Storage } = jest.requireMock<{ Storage: { clearSync: () => boolean } }>(
  'expo-sqlite/kv-store',
);

beforeEach(() => {
  Storage.clearSync();
});

describe('interpretarPreferenciaTema', () => {
  it('aceita os três valores válidos', () => {
    expect(interpretarPreferenciaTema('claro')).toBe('claro');
    expect(interpretarPreferenciaTema('escuro')).toBe('escuro');
    expect(interpretarPreferenciaTema('sistema')).toBe('sistema');
  });

  it('usa o tema claro quando não há valor salvo', () => {
    expect(interpretarPreferenciaTema(null)).toBe('claro');
  });

  it('usa o tema claro quando o valor salvo é desconhecido', () => {
    expect(interpretarPreferenciaTema('roxo')).toBe('claro');
  });
});

describe('preferência de tema', () => {
  it('começa no tema claro', () => {
    expect(lerPreferenciaTema()).toBe('claro');
  });

  it('lê de volta a escolha salva', () => {
    salvarPreferenciaTema('escuro');
    expect(lerPreferenciaTema()).toBe('escuro');
  });
});

describe('boas-vindas', () => {
  it('não estão concluídas no primeiro uso', () => {
    expect(boasVindasConcluidas()).toBe(false);
  });

  it('ficam concluídas depois de marcadas', () => {
    marcarBoasVindasConcluidas();
    expect(boasVindasConcluidas()).toBe(true);
  });
});

describe('perfil', () => {
  it('aceita os três perfis', () => {
    expect(interpretarPerfil('pessoa')).toBe('pessoa');
    expect(interpretarPerfil('residencia')).toBe('residencia');
    expect(interpretarPerfil('comercio')).toBe('comercio');
  });

  it('usa residência quando não há valor salvo ou ele é desconhecido', () => {
    expect(interpretarPerfil(null)).toBe('residencia');
    expect(interpretarPerfil('empresa')).toBe('residencia');
  });

  it('lê de volta o perfil salvo', () => {
    salvarPerfil('comercio');
    expect(lerPerfil()).toBe('comercio');
  });
});

describe('período de referência', () => {
  it('usa o mês quando não há valor salvo ou ele é desconhecido', () => {
    expect(interpretarPeriodo(null)).toBe('mes');
    expect(interpretarPeriodo('semana')).toBe('mes');
  });

  it('lê de volta o período salvo', () => {
    salvarPeriodo('ano');
    expect(lerPeriodo()).toBe('ano');
  });
});
