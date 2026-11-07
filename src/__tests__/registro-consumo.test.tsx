import { Slot } from 'expo-router';
import { cleanup, fireEvent, renderRouter, screen } from 'expo-router/testing-library';

import { calcularEmissoes } from '@/calculo/emissoes';
import type { RegistroConsumo } from '@/dados/consumos';
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

function criarRegistro(ano: number, mes: number, energiaKwh: number): RegistroConsumo {
  const consumos = { energiaKwh, gasolinaLitros: 0, etanolLitros: 0, dieselLitros: 0, glpBotoes13Kg: 0 };
  return {
    id: `${ano}-${String(mes).padStart(2, '0')}`,
    ano,
    mes,
    perfil: 'residencia',
    consumos,
    calculo: calcularEmissoes(consumos, ano, mes),
    criadoEm: '2026-11-06T12:00:00.000Z',
  };
}

beforeEach(() => {
  cleanup();
  Storage.clearSync();
  Storage.setItemSync('preferencias.boasVindasConcluidas', 'sim');
  Storage.setItemSync('preferencias.perfil', 'residencia');
  jest.useFakeTimers().setSystemTime(new Date(2026, 10, 6, 12));
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
    await renderRouter(rotas, { initialUrl: '/registrar' });
    await fireEvent.changeText(screen.getByLabelText('Energia elétrica, consumo em kWh'), '100');
    await fireEvent.press(screen.getByRole('button', { name: 'Calcular emissões' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Mês do consumo: Novembro de 2026' }));
    await fireEvent.press(screen.getByRole('radio', { name: 'Novembro de 2026, já registrado' }));

    expect(screen.getByLabelText('Energia elétrica, consumo em kWh').props.value).toBe('100');
    expect(screen.getByText('Emissões calculadas')).toBeTruthy();
  });

  it('permite escolher um mês passado sem registro e usa os fatores vigentes naquela data', async () => {
    await renderRouter(rotas, { initialUrl: '/registrar' });
    await fireEvent.press(screen.getByRole('button', { name: 'Mês do consumo: Novembro de 2026' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Ano anterior, 2025' }));
    await fireEvent.press(screen.getByRole('radio', { name: 'Setembro de 2025' }));

    expect(screen.getByRole('button', { name: 'Mês do consumo: Setembro de 2025' })).toBeTruthy();
    await fireEvent.changeText(screen.getByLabelText('Gasolina, consumo em litros'), '10');
    await fireEvent.press(screen.getByRole('button', { name: 'Calcular emissões' }));

    const salvo = Storage.getItemSync('consumos.registrados.v1');
    const registros = JSON.parse(salvo ?? '[]') as RegistroConsumo[];
    expect(registros[0].id).toBe('2025-09');
    expect(registros[0].calculo.fontes[0].fator.id).toBe('gasolina-e30');
    // 10 L × 1,6187 kg CO₂e/L = 16,187 kg CO₂e
    expect(registros[0].calculo.totalKgCo2e).toBeCloseTo(16.187, 6);
  });

  it('carrega registro existente e só o substitui depois de confirmar', async () => {
    const original = criarRegistro(2026, 11, 50);
    Storage.setItemSync('consumos.registrados.v1', JSON.stringify([original]));
    await renderRouter(rotas, { initialUrl: '/registrar' });

    expect(screen.getByLabelText('Energia elétrica, consumo em kWh').props.value).toBe('50');
    await fireEvent.changeText(screen.getByLabelText('Energia elétrica, consumo em kWh'), '-1');
    await fireEvent.press(screen.getByRole('button', { name: 'Calcular emissões' }));
    expect(screen.queryByText('Substituir registro?')).toBeNull();
    expect(screen.getByText('Confira os valores: use números iguais ou maiores que zero.')).toBeTruthy();
    expect(JSON.parse(Storage.getItemSync('consumos.registrados.v1') ?? '[]')[0].consumos.energiaKwh).toBe(50);

    await fireEvent.changeText(screen.getByLabelText('Energia elétrica, consumo em kWh'), '50');
    await fireEvent.press(screen.getByRole('button', { name: 'Calcular emissões' }));
    expect(screen.getByText('Substituir registro?')).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: 'Cancelar' }));
    expect(JSON.parse(Storage.getItemSync('consumos.registrados.v1') ?? '[]')[0].consumos.energiaKwh).toBe(50);

    await fireEvent.changeText(screen.getByLabelText('Energia elétrica, consumo em kWh'), '75');
    await fireEvent.press(screen.getByRole('button', { name: 'Calcular emissões' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Substituir registro' }));

    const registros = JSON.parse(Storage.getItemSync('consumos.registrados.v1') ?? '[]') as RegistroConsumo[];
    expect(registros).toHaveLength(1);
    expect(registros[0].consumos.energiaKwh).toBe(75);
    // 75 kWh × 0,0461 kg CO₂/kWh = 3,4575 kg CO₂e
    expect(registros[0].calculo.totalKgCo2e).toBeCloseTo(3.4575, 6);
  });

});
