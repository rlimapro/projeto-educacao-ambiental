import { lerPlanoTerrenos, salvarPlanoTerrenos, validarPlanoTerrenos } from './planoTerrenos';

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

const { Storage } = jest.requireMock<{
  Storage: { clearSync: () => boolean; setItemSync: (chave: string, valor: string) => void };
}>('expo-sqlite/kv-store');

const CHAVE = 'plantio.terrenos.v1';

const plano = [
  { id: 1, larguraM: 6, comprimentoM: 6, mudas: [{ x: 0, y: 0 }, { x: 3, y: 0 }] },
  { id: 2, larguraM: 9, comprimentoM: 2, mudas: [{ x: 6, y: 0 }] },
];

beforeEach(() => {
  Storage.clearSync();
});

describe('plano de terrenos', () => {
  it('não tem plano antes de salvar', () => {
    expect(lerPlanoTerrenos()).toBeNull();
  });

  it('lê de volta o plano salvo, igual ao original', () => {
    salvarPlanoTerrenos(plano);
    expect(lerPlanoTerrenos()).toEqual(plano);
  });

  it('descarta campos desconhecidos ao ler', () => {
    Storage.setItemSync(
      CHAVE,
      JSON.stringify([{ ...plano[0], extra: 'x', mudas: [{ x: 0, y: 0, cor: 'azul' }] }]),
    );
    expect(lerPlanoTerrenos()).toEqual([{ id: 1, larguraM: 6, comprimentoM: 6, mudas: [{ x: 0, y: 0 }] }]);
  });

  it.each([
    ['JSON inválido', '{'],
    ['lista vazia', '[]'],
    ['não é lista', '{"id":1}'],
    ['lado fora de 2 a 100 m', JSON.stringify([{ ...plano[0], larguraM: 500 }])],
    ['lado decimal', JSON.stringify([{ ...plano[0], larguraM: 6.5 }])],
    ['muda fora do terreno', JSON.stringify([{ ...plano[0], mudas: [{ x: 5, y: 0 }] }])],
    // (0,0) e (1,1) se cruzam
    ['mudas sobrepostas', JSON.stringify([{ ...plano[0], mudas: [{ x: 0, y: 0 }, { x: 1, y: 1 }] }])],
    ['id repetido', JSON.stringify([plano[0], { ...plano[1], id: 1 }])],
    ['id ausente', JSON.stringify([{ larguraM: 6, comprimentoM: 6, mudas: [] }])],
    ['muda com texto', JSON.stringify([{ ...plano[0], mudas: [{ x: '0', y: 0 }] }])],
  ])('ignora um plano salvo com %s', (_, texto) => {
    Storage.setItemSync(CHAVE, texto);
    expect(lerPlanoTerrenos()).toBeNull();
  });

  it('recusa mais de 100 terrenos', () => {
    const terrenos = Array.from({ length: 101 }, (_, i) => ({ id: i + 1, larguraM: 6, comprimentoM: 6, mudas: [] }));
    expect(validarPlanoTerrenos(terrenos)).toBe(false);
    expect(validarPlanoTerrenos(terrenos.slice(0, 100))).toBe(true);
  });

  it('não salva um plano inválido e mantém o anterior', () => {
    salvarPlanoTerrenos(plano);
    expect(() => salvarPlanoTerrenos([{ ...plano[0], larguraM: 1 }])).toThrow('inválido');
    expect(lerPlanoTerrenos()).toEqual(plano);
  });
});
