import { Slot } from 'expo-router';
import { cleanup, fireEvent, renderRouter, screen } from 'expo-router/testing-library';

import LayoutAbas from '@/app/(abas)/_layout';
import Inicio from '@/app/(abas)/index';
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
  '(abas)/index': Inicio,
  '(abas)/registrar': Registrar,
};

beforeEach(() => {
  cleanup();
  Storage.clearSync();
  Storage.setItemSync('preferencias.boasVindasConcluidas', 'sim');
  Storage.setItemSync('preferencias.perfil', 'residencia');
  jest.useFakeTimers().setSystemTime(new Date(2026, 10, 4, 12));
});

afterEach(() => {
  cleanup();
  jest.useRealTimers();
});

describe('registro de consumo', () => {
  it('calcula e salva as emissões no aparelho com a memória do fator usado', async () => {
    await renderRouter(rotas, { initialUrl: '/registrar' });
    await fireEvent.press(screen.getByRole('button', { name: 'Calcular emissões' }));
    expect(screen.getByText('Informe ao menos um consumo para continuar.')).toBeTruthy();
    expect(Storage.getItemSync('consumos.registrados.v1')).toBeNull();

    await fireEvent.changeText(screen.getByLabelText('Energia elétrica, consumo em kWh'), '100');
    await fireEvent.press(screen.getByRole('button', { name: 'Calcular emissões' }));

    expect(screen.getByText('Consumos registrados neste aparelho.')).toBeTruthy();
    expect(screen.getByText('5 kg CO₂e')).toBeTruthy();
    expect(screen.getByText(/MCTI, Fator médio anual do SIN.*2025.*versão 1/)).toBeTruthy();

    const salvo = Storage.getItemSync('consumos.registrados.v1');
    expect(salvo).not.toBeNull();
    const registros = JSON.parse(salvo ?? '[]') as { id: string; consumos: { energiaKwh: number }; calculo: { totalKgCo2e: number } }[];
    expect(registros[0].id).toBe('2026-11');
    expect(registros[0].consumos.energiaKwh).toBe(100);
    // 100 kWh × 0,0461 kg CO₂/kWh = 4,61 kg CO₂e
    expect(registros[0].calculo.totalKgCo2e).toBeCloseTo(4.61, 6);
  });

  it('reabre o mês com os consumos já salvos', async () => {
    const app = await renderRouter(rotas, { initialUrl: '/registrar' });
    await fireEvent.changeText(screen.getByLabelText('Energia elétrica, consumo em kWh'), '100');
    await fireEvent.press(screen.getByRole('button', { name: 'Calcular emissões' }));
    app.unmount();
    await renderRouter(rotas, { initialUrl: '/registrar' });

    expect(screen.getByLabelText('Energia elétrica, consumo em kWh').props.value).toBe('100');
    expect(screen.getByText('Emissões calculadas')).toBeTruthy();
  });

});
