import { fireEvent, render, screen } from '@testing-library/react-native';

import { BotaoPrimario } from './BotaoPrimario';
import { TemaProvider } from './tema';

jest.mock('@/dados/preferencias', () => ({
  lerPreferenciaTema: jest.fn(() => 'claro'),
  salvarPreferenciaTema: jest.fn(),
}));

describe('BotaoPrimario', () => {
  it('é anunciado como botão e responde ao toque', async () => {
    const aoTocar = jest.fn();
    await render(
      <TemaProvider>
        <BotaoPrimario rotulo="Começar" onPress={aoTocar} />
      </TemaProvider>,
    );

    await fireEvent.press(screen.getByRole('button', { name: 'Começar' }));

    expect(aoTocar).toHaveBeenCalledTimes(1);
  });
});
