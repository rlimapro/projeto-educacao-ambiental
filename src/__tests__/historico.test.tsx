import { Slot } from 'expo-router';
import { fireEvent, renderRouter, screen } from 'expo-router/testing-library';

import { calcularEmissoes } from '@/calculo/emissoes';
import type { RegistroConsumo } from '@/dados/consumos';
import LayoutAbas from '@/app/(abas)/_layout';
import Ajustes from '@/app/(abas)/ajustes';
import Historico from '@/app/(abas)/historico';
import LayoutInicio from '@/app/(abas)/(inicio)/_layout';
import Inicio from '@/app/(abas)/(inicio)/index';
import Registrar from '@/app/(abas)/registrar';
import { TemaProvider } from '@/ui/tema';

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

const { Storage } = jest.requireMock<{
  Storage: { getItemSync: (chave: string) => string | null; setItemSync: (chave: string, valor: string) => void; clearSync: () => void };
}>('expo-sqlite/kv-store');

// Só energia elétrica: o total é proporcional aos kWh, então as variações entre
// meses saem da razão dos consumos, sem depender do valor do fator.
function registrarEnergia(ano: number, mes: number, energiaKwh: number): RegistroConsumo {
  const consumos = { energiaKwh, gasolinaLitros: 0, etanolLitros: 0, dieselLitros: 0, glpBotoes13Kg: 0 };
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

function salvar(registros: RegistroConsumo[]) {
  Storage.setItemSync('consumos.registrados.v1', JSON.stringify(registros));
}

function LayoutDeTeste() {
  return (
    <TemaProvider>
      <Slot />
    </TemaProvider>
  );
}

const rotas = {
  _layout: LayoutDeTeste,
  '(abas)/_layout': LayoutAbas,
  '(abas)/(inicio)/_layout': LayoutInicio,
  '(abas)/(inicio)/index': Inicio,
  '(abas)/registrar': Registrar,
  '(abas)/historico': Historico,
  '(abas)/ajustes': Ajustes,
};

beforeEach(() => {
  Storage.clearSync();
  Storage.setItemSync('preferencias.boasVindasConcluidas', 'sim');
});

describe('Histórico', () => {
  it('explica o que fazer quando não há registros', async () => {
    await renderRouter(rotas, { initialUrl: '/historico' });

    expect(screen.getByText('Nenhum mês registrado')).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: 'Registrar consumo' }));
    expect(screen.getByRole('tab', { name: 'Registrar', selected: true })).toBeTruthy();
  });

  it('compara cada mês com o mês registrado antes dele', async () => {
    // junho 200, agosto 160 (julho sem registro), setembro 200, outubro 100 kWh
    salvar([
      registrarEnergia(2026, 10, 100),
      registrarEnergia(2026, 9, 200),
      registrarEnergia(2026, 8, 160),
      registrarEnergia(2026, 6, 200),
    ]);
    await renderRouter(rotas, { initialUrl: '/historico' });

    // outubro: (100 − 200) ÷ 200 = −50%
    expect(screen.getByRole('button', { name: /^Outubro de 2026: .*, 50% a menos que setembro$/ })).toBeTruthy();
    // setembro: (200 − 160) ÷ 160 = +25%
    expect(screen.getByRole('button', { name: /^Setembro de 2026: .*, 25% a mais que agosto$/ })).toBeTruthy();
    // agosto contra junho, porque julho não foi registrado: (160 − 200) ÷ 200 = −20%
    expect(screen.getByRole('button', { name: /^Agosto de 2026: .*, 20% a menos que junho$/ })).toBeTruthy();
    expect(screen.getByRole('button', { name: /^Junho de 2026: .*, primeiro mês registrado$/ })).toBeTruthy();
    expect(screen.getByText('−50%')).toBeTruthy();
    expect(screen.getByText('+25%')).toBeTruthy();
    expect(screen.getByText('−20%')).toBeTruthy();
  });

  it('mostra no gráfico os meses sem registro, sem tratá-los como zero', async () => {
    salvar([registrarEnergia(2026, 8, 160), registrarEnergia(2026, 6, 200)]);
    await renderRouter(rotas, { initialUrl: '/historico' });

    // De junho a agosto: três barras, com julho vazio.
    expect(screen.getByRole('image', { name: /julho de 2026, sem registro/ })).toBeTruthy();
    expect(screen.queryByRole('image', { name: /maio/ })).toBeNull();
  });

  it('troca os meses do gráfico quando há registros mais antigos', async () => {
    // dezembro de 2025 a outubro de 2026: 11 meses, mais que os 6 do gráfico
    salvar([registrarEnergia(2026, 10, 100), registrarEnergia(2026, 5, 100), registrarEnergia(2025, 12, 100)]);
    await renderRouter(rotas, { initialUrl: '/historico' });

    expect(screen.getByText('Mai a out de 2026')).toBeTruthy();
    expect(screen.getByRole('button', { name: '6 meses seguintes' })).toBeDisabled();

    await fireEvent.press(screen.getByRole('button', { name: '6 meses anteriores' }));
    expect(screen.getByText('Nov de 2025 a abr de 2026')).toBeTruthy();
    expect(screen.getByRole('button', { name: '6 meses anteriores' })).toBeDisabled();

    await fireEvent.press(screen.getByRole('button', { name: '6 meses seguintes' }));
    expect(screen.getByText('Mai a out de 2026')).toBeTruthy();
  });

  it('resume o ano com os meses registrados', async () => {
    salvar([registrarEnergia(2026, 10, 100), registrarEnergia(2026, 9, 100), registrarEnergia(2025, 12, 100)]);
    await renderRouter(rotas, { initialUrl: '/historico' });

    expect(screen.getByText('Em 2026')).toBeTruthy();
    // dezembro de 2025 fica de fora do ano
    expect(screen.getByText('em 2 meses registrados')).toBeTruthy();
  });

  it('abre na Início o mês tocado', async () => {
    salvar([registrarEnergia(2026, 10, 100), registrarEnergia(2026, 9, 200)]);
    await renderRouter(rotas, { initialUrl: '/historico' });

    await fireEvent.press(screen.getByRole('button', { name: /^Setembro de 2026: / }));

    expect(screen.getByRole('tab', { name: 'Início', selected: true })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Período: Setembro 2026' })).toBeTruthy();
  });

  it('pede o próximo mês quando só há um registrado', async () => {
    salvar([registrarEnergia(2026, 10, 100)]);
    await renderRouter(rotas, { initialUrl: '/historico' });

    expect(screen.getByText('Registre o próximo mês para comparar.')).toBeTruthy();
    expect(screen.queryByText('Em 2026')).toBeNull();
  });
});
