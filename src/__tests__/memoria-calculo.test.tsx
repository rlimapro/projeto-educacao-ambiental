import { Slot } from 'expo-router';
import { cleanup, fireEvent, renderRouter, screen } from 'expo-router/testing-library';

import { calcularEmissoes } from '@/calculo/emissoes';
import type { ConsumosInformados } from '@/calculo/tipos';
import type { RegistroConsumo } from '@/dados/consumos';
import LayoutInicio from '@/app/(abas)/(inicio)/_layout';
import Inicio from '@/app/(abas)/(inicio)/index';
import MemoriaCalculo from '@/app/(abas)/(inicio)/memoria/[periodo]/[fonte]';
import LayoutAbas from '@/app/(abas)/_layout';
import Ajustes from '@/app/(abas)/ajustes';
import Historico from '@/app/(abas)/historico';
import Registrar from '@/app/(abas)/registrar';
import { TemaProvider } from '@/ui/tema';

// Memória de cálculo de uma fonte (RF04), aberta pela legenda da Início.
// Fica fora de src/app porque o Expo Router trataria o arquivo como tela.

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
  Storage: {
    getItemSync: (chave: string) => string | null;
    setItemSync: (chave: string, valor: string) => void;
    clearSync: () => void;
  };
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
  '(abas)/(inicio)/_layout': LayoutInicio,
  '(abas)/(inicio)/index': Inicio,
  '(abas)/(inicio)/memoria/[periodo]/[fonte]': MemoriaCalculo,
  '(abas)/registrar': Registrar,
  '(abas)/historico': Historico,
  '(abas)/ajustes': Ajustes,
};

function criarRegistro(
  ano: number,
  mes: number,
  consumos: Partial<ConsumosInformados>,
): RegistroConsumo {
  const completos = {
    energiaKwh: 0,
    gasolinaLitros: 0,
    etanolLitros: 0,
    dieselLitros: 0,
    glpBotoes13Kg: 0,
    ...consumos,
  };
  return {
    id: `${ano}-${String(mes).padStart(2, '0')}`,
    ano,
    mes,
    perfil: 'residencia',
    consumos: completos,
    calculo: calcularEmissoes(completos, ano, mes),
    criadoEm: '2026-11-08T12:00:00.000Z',
  };
}

function salvar(...registros: RegistroConsumo[]) {
  Storage.setItemSync('consumos.registrados.v1', JSON.stringify(registros));
}

beforeEach(() => {
  cleanup();
  Storage.clearSync();
  Storage.setItemSync('preferencias.boasVindasConcluidas', 'sim');
  jest.useFakeTimers().setSystemTime(new Date(2026, 10, 8, 12));
});

afterEach(() => {
  cleanup();
  jest.useRealTimers();
});

describe('Memória de cálculo', () => {
  it('abre pela legenda e mostra consumo × fator = emissão, com a origem do fator', async () => {
    // Energia: 1.000 kWh × 0,0461 = 46,1 kg
    // Gasolina (novembro de 2026, mistura de 32%): 10 L × 1,5738 = 15,738 kg
    // Gás: 1 botijão × 13 kg × 2,9407 = 38,2291 kg
    // Total: 100,0671 kg; energia 46,1 / 100,0671 = 46,07% → 46%
    salvar(criarRegistro(2026, 11, { energiaKwh: 1000, gasolinaLitros: 10, glpBotoes13Kg: 1 }));
    const app = await renderRouter(rotas, { initialUrl: '/' });

    await fireEvent.press(screen.getByRole('button', { name: 'Energia elétrica: 46 kg' }));

    expect(app.getPathname()).toBe('/memoria/2026-11/energia');
    expect(screen.getByRole('header', { name: 'Energia elétrica' })).toBeTruthy();
    expect(screen.getByText('46% das emissões de novembro')).toBeTruthy();
    expect(screen.getByText('1.000 kWh de energia elétrica')).toBeTruthy();
    expect(screen.getByText('0,0461 kg CO₂ por kWh')).toBeTruthy();
    expect(screen.getByText('46 kg CO₂e')).toBeTruthy();
    expect(
      screen.getByText('MCTI, Fator médio anual do SIN para inventários, ano-base 2025'),
    ).toBeTruthy();
    // A Início continua na barra de abas, como no protótipo.
    expect(screen.getByRole('tab', { name: 'Início', selected: true })).toBeTruthy();
  });

  it('mostra a versão do fator usada no mês, mesmo quando há uma mais nova', async () => {
    // Setembro de 2025 ainda usa a gasolina com 30% de etanol (versão 1):
    // 10 L × 1,6187 = 16,187 kg → 16 kg
    salvar(
      criarRegistro(2026, 11, { gasolinaLitros: 10 }),
      criarRegistro(2025, 9, { gasolinaLitros: 10 }),
    );
    await renderRouter(rotas, { initialUrl: '/memoria/2025-09/gasolina' });

    expect(screen.getByText('100% das emissões de setembro de 2025')).toBeTruthy();
    expect(screen.getByText('10 litros de gasolina')).toBeTruthy();
    expect(screen.getByText('1,6187 kg CO₂e por litro')).toBeTruthy();
    expect(screen.getByText('16 kg CO₂e')).toBeTruthy();
    expect(screen.getByText('2025')).toBeTruthy();
    expect(screen.getByText('1')).toBeTruthy();
  });

  it('mostra a conversão de botijões em quilos antes do fator', async () => {
    // 2 botijões × 13 kg = 26 kg; 26 kg × 2,9407 = 76,4582 kg → 76 kg
    salvar(criarRegistro(2026, 11, { glpBotoes13Kg: 2 }));
    await renderRouter(rotas, { initialUrl: '/memoria/2026-11/glp' });

    expect(screen.getByText('2 botijões de 13 kg')).toBeTruthy();
    expect(screen.getByText('2 × 13 kg = 26 kg')).toBeTruthy();
    expect(screen.getByText('2,9407 kg CO₂e por kg')).toBeTruthy();
    expect(screen.getByText('76 kg CO₂e')).toBeTruthy();
  });

  it('volta para a Início no mesmo mês que estava aberto', async () => {
    salvar(
      criarRegistro(2026, 11, { energiaKwh: 1000 }),
      criarRegistro(2026, 10, { energiaKwh: 500 }),
    );
    const app = await renderRouter(rotas, { initialUrl: '/' });

    await fireEvent.press(screen.getByRole('button', { name: 'Período: Novembro 2026' }));
    await fireEvent.press(screen.getByRole('radio', { name: 'Outubro de 2026' }));
    // 500 kWh × 0,0461 = 23,05 kg → 23 kg
    await fireEvent.press(screen.getByRole('button', { name: 'Energia elétrica: 23 kg' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Voltar' }));

    expect(app.getPathname()).toBe('/');
    expect(screen.getByRole('button', { name: 'Período: Outubro 2026' })).toBeTruthy();
  });

  it('avisa quando o cálculo pedido não existe mais', async () => {
    await renderRouter(rotas, { initialUrl: '/memoria/2026-01/energia' });

    expect(screen.getByText('Este cálculo não está mais registrado')).toBeTruthy();
  });
});
