import { Slot } from 'expo-router';
import { fireEvent, renderRouter, screen } from 'expo-router/testing-library';

import LayoutAbas from '@/app/(abas)/_layout';
import Ajustes from '@/app/(abas)/ajustes';
import Historico from '@/app/(abas)/historico';
import Inicio from '@/app/(abas)/index';
import Registrar from '@/app/(abas)/registrar';
import BoasVindas from '@/app/boas-vindas';
import { TemaProvider } from '@/ui/tema';

// Tela Início com os períodos de exemplo de src/dados/periodos.ts (RF03, RF05,
// RF07). Fica fora de src/app porque o Expo Router trataria o arquivo como tela.

jest.mock('expo-sqlite/kv-store', () => {
  const valores = new Map<string, string>([['preferencias.boasVindasConcluidas', 'sim']]);
  return {
    Storage: {
      getItemSync: (chave: string) => valores.get(chave) ?? null,
      setItemSync: (chave: string, valor: string) => {
        valores.set(chave, valor);
      },
    },
  };
});

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

describe('Início', () => {
  it('mostra o período e o perfil no topo', async () => {
    await renderRouter(rotas, { initialUrl: '/' });

    expect(screen.getByRole('button', { name: 'Período: Outubro 2026' })).toBeTruthy();
    expect(screen.getByText('Residência')).toBeTruthy();
  });

  it('descreve o anel em texto para leitores de tela', async () => {
    await renderRouter(rotas, { initialUrl: '/' });

    // 198/245 = 81%, 38/245 = 16%, 9/245 = 4%
    expect(
      screen.getByLabelText(
        'Emissões de outubro de 2026: 245 kg de CO₂e. Combustível 81%, Gás de cozinha 16%, Energia elétrica 4%.',
      ),
    ).toBeTruthy();
  });

  it('lista as fontes da maior para a menor, com o valor', async () => {
    await renderRouter(rotas, { initialUrl: '/' });

    expect(screen.getByText('198 kg')).toBeTruthy();
    expect(screen.getByText('38 kg')).toBeTruthy();
    expect(screen.getByText('9 kg')).toBeTruthy();
  });

  it('mostra as árvores que neutralizariam o mês, arredondadas para cima', async () => {
    await renderRouter(rotas, { initialUrl: '/' });

    // 245 / (3,037 × 20) = 4,03 → 5 árvores
    expect(screen.getByText('5')).toBeTruthy();
    expect(screen.getByText('árvores')).toBeTruthy();
    expect(screen.getByText('em 20 anos')).toBeTruthy();
  });

  it('compara com o mês anterior', async () => {
    await renderRouter(rotas, { initialUrl: '/' });

    // 245 − 278 = −33; −33 / 278 = −11,9% → −12%
    expect(screen.getByText('Comparado a setembro')).toBeTruthy();
    expect(screen.getByText('−12%')).toBeTruthy();
    expect(screen.getByText('33 kg a menos')).toBeTruthy();
  });

  it('troca de período escolhendo o mês na lista', async () => {
    await renderRouter(rotas, { initialUrl: '/' });

    await fireEvent.press(screen.getByRole('button', { name: 'Período: Outubro 2026' }));
    await fireEvent.press(screen.getByRole('radio', { name: 'Setembro de 2026' }));

    expect(screen.queryByText('Escolha o mês')).toBeNull();
    expect(screen.getByRole('button', { name: 'Período: Setembro 2026' })).toBeTruthy();
    // 278 − 302 = −24; −24 / 302 = −7,9% → −8%
    expect(screen.getByText('Comparado a agosto')).toBeTruthy();
    expect(screen.getByText('−8%')).toBeTruthy();
  });

  it('mostra a barra de navegação com o Início selecionado', async () => {
    await renderRouter(rotas, { initialUrl: '/' });

    expect(screen.getByRole('tab', { name: 'Início', selected: true })).toBeTruthy();
    expect(screen.getByRole('tab', { name: 'Registrar', selected: false })).toBeTruthy();
  });

  it('leva à aba tocada', async () => {
    const app = await renderRouter(rotas, { initialUrl: '/' });

    await fireEvent.press(screen.getByRole('tab', { name: 'Histórico' }));

    expect(app.getPathname()).toBe('/historico');
  });
});
