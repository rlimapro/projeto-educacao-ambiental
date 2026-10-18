import { Slot } from 'expo-router';
import { fireEvent, renderRouter, screen } from 'expo-router/testing-library';

import BoasVindas from '@/app/boas-vindas';
import Inicio from '@/app/index';
import { TemaProvider } from '@/ui/tema';

// Fluxo de primeiro uso (RF12). Fica fora de src/app porque o Expo Router
// trataria qualquer arquivo daquela pasta como uma tela.

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

function LayoutDeTeste() {
  return (
    <TemaProvider>
      <Slot />
    </TemaProvider>
  );
}

const rotas = {
  _layout: LayoutDeTeste,
  index: Inicio,
  'boas-vindas': BoasVindas,
};

beforeEach(() => {
  Storage.clearSync();
});

describe('primeiro uso', () => {
  it('abre as boas-vindas quando o app é aberto pela primeira vez', async () => {
    const app = await renderRouter(rotas, { initialUrl: '/' });

    expect(app.getPathname()).toBe('/boas-vindas');
    expect(screen.getByText('Quanto você emite?')).toBeTruthy();
    expect(screen.getByLabelText('Tela 1 de 5')).toBeTruthy();
  });

  it('avança uma tela por vez com o botão Próximo', async () => {
    await renderRouter(rotas, { initialUrl: '/' });

    await fireEvent.press(screen.getByRole('button', { name: 'Próximo' }));

    expect(screen.getByLabelText('Tela 2 de 5')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Voltar' })).toBeTruthy();
  });

  it('Pular leva à escolha de tema, e não direto ao início', async () => {
    const app = await renderRouter(rotas, { initialUrl: '/' });

    await fireEvent.press(screen.getByRole('button', { name: 'Pular' }));

    expect(app.getPathname()).toBe('/boas-vindas');
    expect(screen.getByLabelText('Tela 5 de 5')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Começar' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Pular' })).toBeNull();
  });

  it('Começar guarda a escolha de tema e vai ao início', async () => {
    const app = await renderRouter(rotas, { initialUrl: '/' });

    await fireEvent.press(screen.getByRole('button', { name: 'Pular' }));
    await fireEvent.press(screen.getByRole('radio', { name: 'Escuro' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Começar' }));

    expect(app.getPathname()).toBe('/');
    expect(screen.getByText('Início')).toBeTruthy();
  });

  it('não mostra as boas-vindas de novo depois de concluídas', async () => {
    Storage.setItemSync('preferencias.boasVindasConcluidas', 'sim');

    const app = await renderRouter(rotas, { initialUrl: '/' });

    expect(app.getPathname()).toBe('/');
    expect(screen.queryByText('Quanto você emite?')).toBeNull();
  });
});
