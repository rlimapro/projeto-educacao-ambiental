import {
  GRUPOS_FONTE,
  SUGESTOES_REDUCAO,
  agruparSugestoes,
  emissaoEvitadaKgCo2e,
  grupoDeFonte,
} from './sugestoes';
import type { EmissaoFonte, SugestaoReducao } from './tipos';

const fonte = (id: string, emissaoKgCo2e: number): EmissaoFonte => ({
  id,
  nome: id,
  emissaoKgCo2e,
});

// Catálogo fictício e pequeno, para as contas caberem de cabeça.
const sugestao = (
  id: string,
  grupo: SugestaoReducao['grupo'],
  impacto: SugestaoReducao['impacto'],
  extra: Partial<SugestaoReducao> = {},
): SugestaoReducao => ({
  id,
  grupo,
  impacto,
  titulo: id,
  descricao: id,
  icone: 'rota',
  perfis: ['pessoa', 'residencia', 'comercio'],
  ...extra,
});

const catalogo: SugestaoReducao[] = [
  sugestao('combustivel-medio', 'combustivel', 'medio'),
  sugestao('combustivel-alto', 'combustivel', 'alto'),
  sugestao('combustivel-baixo', 'combustivel', 'baixo'),
  sugestao('combustivel-alto-2', 'combustivel', 'alto'),
  sugestao('so-com-gasolina', 'combustivel', 'medio', { exigeFonte: ['gasolina'] }),
  sugestao('so-comercio', 'combustivel', 'alto', { perfis: ['comercio'] }),
  sugestao('energia-alto', 'energia', 'alto'),
  sugestao('gas-alto', 'gas', 'alto'),
];

describe('agruparSugestoes', () => {
  it('junta gasolina, etanol e diesel em combustível e ordena do grupo que mais emite', () => {
    // Combustível: 60 + 20 + 10 = 90; energia 30; gás 0. Total 120.
    const grupos = agruparSugestoes(
      [
        fonte('energia', 30),
        fonte('gasolina', 60),
        fonte('etanol', 20),
        fonte('diesel', 10),
        fonte('glp', 0),
      ],
      'residencia',
      catalogo,
    );

    expect(grupos.map((g) => g.grupo)).toEqual(['combustivel', 'energia']);
    expect(grupos[0].emissaoKgCo2e).toBeCloseTo(90, 6);
    // 90 / 120 = 0,75; 30 / 120 = 0,25
    expect(grupos[0].fracao).toBeCloseTo(0.75, 6);
    expect(grupos[1].fracao).toBeCloseTo(0.25, 6);
    expect(grupos[0].nome).toBe('Combustível');
  });

  it('põe as de maior impacto primeiro, mantendo a ordem do catálogo entre iguais', () => {
    const [combustivel] = agruparSugestoes([fonte('gasolina', 10)], 'pessoa', catalogo);

    expect(combustivel.sugestoes.map((s) => s.id)).toEqual([
      'combustivel-alto',
      'combustivel-alto-2',
      'combustivel-medio',
      'so-com-gasolina',
      'combustivel-baixo',
    ]);
  });

  it('mostra só as sugestões do perfil', () => {
    const [comercio] = agruparSugestoes([fonte('gasolina', 10)], 'comercio', catalogo);
    const [pessoa] = agruparSugestoes([fonte('gasolina', 10)], 'pessoa', catalogo);

    expect(comercio.sugestoes.map((s) => s.id)).toContain('so-comercio');
    expect(pessoa.sugestoes.map((s) => s.id)).not.toContain('so-comercio');
  });

  it('esconde sugestões que dependem de uma fonte sem emissão no mês', () => {
    const [soEtanol] = agruparSugestoes(
      [fonte('etanol', 10), fonte('gasolina', 0)],
      'pessoa',
      catalogo,
    );

    expect(soEtanol.sugestoes.map((s) => s.id)).not.toContain('so-com-gasolina');
  });

  it('não sugere nada quando o mês não tem emissão', () => {
    expect(agruparSugestoes([], 'pessoa', catalogo)).toEqual([]);
    expect(agruparSugestoes([fonte('energia', 0)], 'pessoa', catalogo)).toEqual([]);
  });

  it('usa o catálogo do app quando nenhum é passado', () => {
    const grupos = agruparSugestoes([fonte('energia', 10), fonte('glp', 5)], 'residencia');

    expect(grupos.map((g) => g.grupo)).toEqual(['energia', 'gas']);
    expect(grupos.every((g) => g.sugestoes.length > 0)).toBe(true);
  });
});

describe('catálogo de sugestões', () => {
  it('tem pelo menos três sugestões por grupo para cada perfil', () => {
    for (const grupo of Object.keys(GRUPOS_FONTE)) {
      for (const perfil of ['pessoa', 'residencia', 'comercio'] as const) {
        const doGrupo = SUGESTOES_REDUCAO.filter(
          (s) => s.grupo === grupo && s.perfis.includes(perfil),
        );
        expect(doGrupo.length).toBeGreaterThanOrEqual(3);
      }
    }
  });

  it('não repete identificadores', () => {
    const ids = SUGESTOES_REDUCAO.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('grupoDeFonte', () => {
  it('leva cada fonte ao seu grupo', () => {
    expect(grupoDeFonte('gasolina')).toBe('combustivel');
    expect(grupoDeFonte('diesel')).toBe('combustivel');
    expect(grupoDeFonte('energia')).toBe('energia');
    expect(grupoDeFonte('glp')).toBe('gas');
  });
});

describe('emissaoEvitadaKgCo2e', () => {
  it('é a mesma fração da emissão, porque a emissão é proporcional ao consumo', () => {
    // 10% de 150 kg = 15 kg
    expect(emissaoEvitadaKgCo2e(150, 0.1)).toBeCloseTo(15, 6);
    expect(emissaoEvitadaKgCo2e(0, 0.1)).toBe(0);
  });

  it('recusa emissão negativa e redução fora de 0 a 1', () => {
    expect(() => emissaoEvitadaKgCo2e(-1, 0.1)).toThrow();
    expect(() => emissaoEvitadaKgCo2e(10, 1.5)).toThrow();
    expect(() => emissaoEvitadaKgCo2e(10, -0.1)).toThrow();
  });
});
