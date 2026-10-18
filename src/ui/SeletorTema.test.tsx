import { fireEvent, render, screen } from '@testing-library/react-native';

import { SeletorTema } from './SeletorTema';
import { TemaProvider } from './tema';

jest.mock('@/dados/preferencias', () => ({
  lerPreferenciaTema: jest.fn(() => 'claro'),
  salvarPreferenciaTema: jest.fn(),
}));

const preferencias = jest.requireMock<{ salvarPreferenciaTema: jest.Mock }>(
  '@/dados/preferencias',
);

describe('SeletorTema', () => {
  it('marca a opção atual e troca para a escolhida', async () => {
    await render(
      <TemaProvider>
        <SeletorTema />
      </TemaProvider>,
    );

    expect(screen.getByRole('radio', { name: 'Claro' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Escuro' })).not.toBeChecked();

    await fireEvent.press(screen.getByRole('radio', { name: 'Escuro' }));

    expect(screen.getByRole('radio', { name: 'Escuro' })).toBeChecked();
    expect(preferencias.salvarPreferenciaTema).toHaveBeenCalledWith('escuro');
  });
});
