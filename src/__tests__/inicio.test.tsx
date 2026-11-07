import { Slot } from 'expo-router';
import { fireEvent, renderRouter, screen } from 'expo-router/testing-library';

import { calcularEmissoes } from '@/calculo/emissoes';
import type { RegistroConsumo } from '@/dados/consumos';
import LayoutAbas from '@/app/(abas)/_layout';
import Ajustes from '@/app/(abas)/ajustes';
import Historico from '@/app/(abas)/historico';
import Inicio from '@/app/(abas)/index';
import Registrar from '@/app/(abas)/registrar';
import BoasVindas from '@/app/boas-vindas';
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

function criarRegistro(ano: number, mes: number, energiaKwh: number, gasolinaLitros: number, glpBotoes13Kg = 0): RegistroConsumo {
  const consumos = { energiaKwh, gasolinaLitros, etanolLitros: 0, dieselLitros: 0, glpBotoes13Kg };
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

function registrarDoisPeriodos() {
  const registros = [
    criarRegistro(2026, 11, 1000, 10, 1),
    criarRegistro(2026, 10, 100, 0),
    criarRegistro(2026, 9, 200, 0),
  ];
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
  '(abas)/index': Inicio,
  '(abas)/registrar': Registrar,
  '(abas)/historico': Historico,
  '(abas)/ajustes': Ajustes,
  'boas-vindas': BoasVindas,
};

beforeEach(() => {
  Storage.clearSync();
  Storage.setItemSync('preferencias.boasVindasConcluidas', 'sim');
});

describe('Início', () => {
  it('não mostra emissões de exemplo antes do primeiro registro', async () => {
    await renderRouter(rotas, { initialUrl: '/' });

    expect(screen.getByText('Nenhum consumo registrado')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Registrar consumo' })).toBeTruthy();
  });

  it('mostra o período e o perfil dos consumos registrados', async () => {
    registrarDoisPeriodos();
    await renderRouter(rotas, { initialUrl: '/' });

    expect(screen.getByRole('button', { name: 'Período: Novembro 2026' })).toBeTruthy();
    expect(screen.getByText('Residência')).toBeTruthy();
    expect(screen.getByText('46 kg')).toBeTruthy();
  });

  it('descreve as emissões registradas para leitores de tela', async () => {
    registrarDoisPeriodos();
    await renderRouter(rotas, { initialUrl: '/' });

    expect(screen.getByLabelText(/Emissões de novembro de 2026: 100 kg de CO₂e/)).toBeTruthy();
  });

  it('calcula árvores a partir do total registrado', async () => {
    registrarDoisPeriodos();
    await renderRouter(rotas, { initialUrl: '/' });

    // 100,0671 / (3,037 × 20) = 1,647... → 2 árvores
    expect(screen.getByText('2')).toBeTruthy();
    expect(screen.getByText('em 20 anos')).toBeTruthy();
  });

  it('compara o mês registrado com o período anterior', async () => {
    registrarDoisPeriodos();
    await renderRouter(rotas, { initialUrl: '/' });

    expect(screen.getByText('Comparado a outubro')).toBeTruthy();
    expect(screen.getByText('+2.071%')).toBeTruthy();
    expect(screen.getByText('95 kg a mais')).toBeTruthy();
  });

  it('permite consultar outro mês registrado', async () => {
    registrarDoisPeriodos();
    await renderRouter(rotas, { initialUrl: '/' });

    await fireEvent.press(screen.getByRole('button', { name: 'Período: Novembro 2026' }));
    await fireEvent.press(screen.getByRole('radio', { name: 'Outubro de 2026' }));

    expect(screen.getByRole('button', { name: 'Período: Outubro 2026' })).toBeTruthy();
    expect(screen.getByText('Comparado a setembro')).toBeTruthy();
    expect(screen.getByText('5 kg a menos')).toBeTruthy();
  });

  it('mostra a navegação e abre a aba tocada', async () => {
    await renderRouter(rotas, { initialUrl: '/' });
    expect(screen.getByRole('tab', { name: 'Início', selected: true })).toBeTruthy();

    await fireEvent.press(screen.getByRole('tab', { name: 'Histórico' }));
    expect(screen.getByText('Em breve você poderá comparar seus meses anteriores aqui.')).toBeTruthy();
  });
});
