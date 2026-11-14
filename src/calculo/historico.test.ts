import {
  compararComMesAnterior,
  deslocarMes,
  haMesesForaDaJanela,
  janelaDeMeses,
  mesesNoGrafico,
  mesMaisRecente,
  resumirAno,
  type EmissaoMensal,
} from './historico';

const registros: EmissaoMensal[] = [
  { ano: 2026, mes: 10, totalKgCo2e: 80 },
  { ano: 2026, mes: 8, totalKgCo2e: 100 },
  { ano: 2026, mes: 9, totalKgCo2e: 120 },
  { ano: 2025, mes: 12, totalKgCo2e: 50 },
];

describe('deslocarMes', () => {
  it('atravessa a virada do ano nos dois sentidos', () => {
    expect(deslocarMes({ ano: 2026, mes: 1 }, -1)).toEqual({ ano: 2025, mes: 12 });
    expect(deslocarMes({ ano: 2025, mes: 12 }, 1)).toEqual({ ano: 2026, mes: 1 });
    // outubro de 2026 menos 6 meses = abril de 2026
    expect(deslocarMes({ ano: 2026, mes: 10 }, -6)).toEqual({ ano: 2026, mes: 4 });
  });

  it('rejeita deslocamento fracionário', () => {
    expect(() => deslocarMes({ ano: 2026, mes: 1 }, 0.5)).toThrow();
  });
});

describe('mesMaisRecente', () => {
  it('escolhe o último mês do calendário, não o último da lista', () => {
    expect(mesMaisRecente(registros)).toEqual({ ano: 2026, mes: 10 });
  });

  it('devolve nulo sem registros', () => {
    expect(mesMaisRecente([])).toBeNull();
  });
});

describe('mesesNoGrafico', () => {
  it('conta do primeiro ao último mês registrado, incluindo as lacunas', () => {
    // dezembro de 2025 a outubro de 2026 são 11 meses; o máximo é 6
    expect(mesesNoGrafico(registros, 6)).toBe(6);
    // agosto a outubro de 2026: 3 meses
    expect(mesesNoGrafico(registros.filter((r) => r.ano === 2026), 6)).toBe(3);
    // setembro de 2026 e janeiro de 2027: set, out, nov, dez, jan = 5
    expect(
      mesesNoGrafico(
        [
          { ano: 2026, mes: 9, totalKgCo2e: 1 },
          { ano: 2027, mes: 1, totalKgCo2e: 1 },
        ],
        6,
      ),
    ).toBe(5);
  });

  it('devolve zero sem registros e um com um mês só', () => {
    expect(mesesNoGrafico([], 6)).toBe(0);
    expect(mesesNoGrafico([{ ano: 2026, mes: 3, totalKgCo2e: 10 }], 6)).toBe(1);
  });
});

describe('janelaDeMeses', () => {
  it('lista os meses seguidos do mais antigo ao fim, com nulo nos não registrados', () => {
    const janela = janelaDeMeses(registros, { ano: 2026, mes: 10 }, 4);

    expect(janela).toEqual([
      { ano: 2026, mes: 7, totalKgCo2e: null },
      { ano: 2026, mes: 8, totalKgCo2e: 100 },
      { ano: 2026, mes: 9, totalKgCo2e: 120 },
      { ano: 2026, mes: 10, totalKgCo2e: 80 },
    ]);
  });

  it('distingue um mês registrado com zero de um mês sem registro', () => {
    const janela = janelaDeMeses([{ ano: 2026, mes: 2, totalKgCo2e: 0 }], { ano: 2026, mes: 2 }, 2);

    expect(janela[0].totalKgCo2e).toBeNull();
    expect(janela[1].totalKgCo2e).toBe(0);
  });

  it('atravessa a virada do ano', () => {
    const janela = janelaDeMeses(registros, { ano: 2026, mes: 1 }, 2);

    expect(janela).toEqual([
      { ano: 2025, mes: 12, totalKgCo2e: 50 },
      { ano: 2026, mes: 1, totalKgCo2e: null },
    ]);
  });

  it('rejeita quantidade menor que um', () => {
    expect(() => janelaDeMeses(registros, { ano: 2026, mes: 10 }, 0)).toThrow();
  });

  it('rejeita emissão negativa e mês repetido', () => {
    expect(() => janelaDeMeses([{ ano: 2026, mes: 1, totalKgCo2e: -1 }], { ano: 2026, mes: 1 }, 1)).toThrow();
    expect(() =>
      janelaDeMeses(
        [
          { ano: 2026, mes: 1, totalKgCo2e: 1 },
          { ano: 2026, mes: 1, totalKgCo2e: 2 },
        ],
        { ano: 2026, mes: 1 },
        1,
      ),
    ).toThrow();
  });
});

describe('haMesesForaDaJanela', () => {
  it('indica registros antes do início e depois do fim', () => {
    // Janela de agosto a outubro de 2026: dezembro de 2025 fica antes.
    expect(haMesesForaDaJanela(registros, { ano: 2026, mes: 10 }, 3)).toEqual({ antes: true, depois: false });
    // Janela de julho a setembro de 2026: outubro fica depois, dezembro de 2025 antes.
    expect(haMesesForaDaJanela(registros, { ano: 2026, mes: 9 }, 3)).toEqual({ antes: true, depois: true });
    // Janela de maio de 2025 a outubro de 2026 (18 meses) cobre tudo.
    expect(haMesesForaDaJanela(registros, { ano: 2026, mes: 10 }, 18)).toEqual({ antes: false, depois: false });
  });
});

describe('compararComMesAnterior', () => {
  it('ordena do mais recente ao mais antigo e compara com o registrado antes', () => {
    const comparados = compararComMesAnterior(registros);

    expect(comparados.map((m) => `${m.mes}/${m.ano}`)).toEqual(['10/2026', '9/2026', '8/2026', '12/2025']);
    // outubro (80) contra setembro (120): (80 − 120) ÷ 120 = −0,3333
    expect(comparados[0].comparacao?.diferencaKgCo2e).toBeCloseTo(-40, 6);
    expect(comparados[0].comparacao?.variacao).toBeCloseTo(-1 / 3, 6);
    // setembro (120) contra agosto (100): 20 ÷ 100 = 0,2
    expect(comparados[1].comparacao?.variacao).toBeCloseTo(0.2, 6);
  });

  it('compara com o último mês registrado quando há meses sem registro no meio', () => {
    const agosto = compararComMesAnterior(registros)[2];

    // agosto de 2026 (100) contra dezembro de 2025 (50): 50 ÷ 50 = 1
    expect(agosto.anterior).toEqual({ ano: 2025, mes: 12, totalKgCo2e: 50 });
    expect(agosto.comparacao?.variacao).toBeCloseTo(1, 6);
  });

  it('não compara o mês mais antigo', () => {
    const maisAntigo = compararComMesAnterior(registros)[3];

    expect(maisAntigo.anterior).toBeNull();
    expect(maisAntigo.comparacao).toBeNull();
  });

  it('não calcula percentual quando o mês anterior foi zero', () => {
    const comparados = compararComMesAnterior([
      { ano: 2026, mes: 2, totalKgCo2e: 30 },
      { ano: 2026, mes: 1, totalKgCo2e: 0 },
    ]);

    expect(comparados[0].comparacao?.variacao).toBeNull();
    expect(comparados[0].comparacao?.diferencaKgCo2e).toBeCloseTo(30, 6);
  });

  it('devolve lista vazia sem registros', () => {
    expect(compararComMesAnterior([])).toEqual([]);
  });
});

describe('resumirAno', () => {
  it('soma os meses do ano e divide a média só pelos meses registrados', () => {
    const resumo = resumirAno(registros, 2026);

    // 80 + 100 + 120 = 300 kg em 3 meses; média 300 ÷ 3 = 100
    expect(resumo?.totalKgCo2e).toBeCloseTo(300, 6);
    expect(resumo?.mesesRegistrados).toBe(3);
    expect(resumo?.mediaMensalKgCo2e).toBeCloseTo(100, 6);
  });

  it('não mistura meses de outro ano', () => {
    const resumo = resumirAno(registros, 2025);

    expect(resumo?.totalKgCo2e).toBeCloseTo(50, 6);
    expect(resumo?.mesesRegistrados).toBe(1);
  });

  it('devolve nulo para um ano sem registros', () => {
    expect(resumirAno(registros, 2024)).toBeNull();
  });

  it('mantém a precisão total, sem arredondar', () => {
    const resumo = resumirAno(
      [
        { ano: 2026, mes: 1, totalKgCo2e: 0.1 },
        { ano: 2026, mes: 2, totalKgCo2e: 0.2 },
      ],
      2026,
    );

    // (0,1 + 0,2) ÷ 2 = 0,15
    expect(resumo?.mediaMensalKgCo2e).toBeCloseTo(0.15, 10);
  });
});
