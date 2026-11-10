import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { AccessibilityInfo } from 'react-native';

import { AberturaAnimada } from './AberturaAnimada';
import { TemaProvider } from './tema';

jest.mock('@/dados/preferencias', () => ({
  lerPreferenciaTema: jest.fn(() => 'claro'),
  salvarPreferenciaTema: jest.fn(),
}));

async function abrir(reduzirMovimento: boolean) {
  jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(reduzirMovimento);
  const aoMostrar = jest.fn();
  const aoTerminar = jest.fn();
  await render(
    <TemaProvider>
      <AberturaAnimada aoMostrar={aoMostrar} aoTerminar={aoTerminar} />
    </TemaProvider>,
  );
  return { aoMostrar, aoTerminar };
}

beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
});

describe('AberturaAnimada', () => {
  it('libera a abertura nativa no primeiro quadro, uma vez só', async () => {
    const { aoMostrar } = await abrir(false);
    const abertura = screen.getByLabelText('Meça. Reduza. Neutralize.');

    await fireEvent(abertura, 'layout', { nativeEvent: { layout: { width: 390, height: 844 } } });
    await fireEvent(abertura, 'layout', { nativeEvent: { layout: { width: 390, height: 844 } } });

    expect(aoMostrar).toHaveBeenCalledTimes(1);
  });

  it('mostra a proposta do app e termina depois da animação', async () => {
    const { aoTerminar } = await abrir(false);

    expect(screen.getByText('Meça. Reduza. Neutralize.')).toBeTruthy();
    expect(aoTerminar).not.toHaveBeenCalled();

    // Anel, broto e frase (até 1.000 ms) + pausa (350) + saída (350) = 1.700 ms
    await act(async () => {
      jest.advanceTimersByTime(2500);
    });

    expect(aoTerminar).toHaveBeenCalledTimes(1);
  });

  it('com movimento reduzido, aparece pronta e termina após uma pausa curta', async () => {
    const { aoTerminar } = await abrir(true);

    await act(async () => {
      jest.advanceTimersByTime(700);
    });

    expect(aoTerminar).toHaveBeenCalledTimes(1);
  });
});
