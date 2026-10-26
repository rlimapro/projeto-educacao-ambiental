import { fireEvent, render, screen } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { SeletorPeriodo, type PeriodoEscolhivel } from './SeletorPeriodo';
import { TemaProvider } from './tema';

jest.mock('@/dados/preferencias', () => ({
  lerPreferenciaTema: jest.fn(() => 'claro'),
  salvarPreferenciaTema: jest.fn(),
}));

const periodos: PeriodoEscolhivel[] = [
  { id: '2026-01', ano: 2026, mes: 1 },
  { id: '2025-12', ano: 2025, mes: 12 },
  { id: '2025-11', ano: 2025, mes: 11 },
];

// Sem medidas iniciais, o SafeAreaProvider não desenha nada no Jest.
const medidasIniciais = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 0, right: 0, bottom: 0, left: 0 },
};

async function abrir(selecionado: string) {
  const aoEscolher = jest.fn();
  const aoFechar = jest.fn();
  await render(
    <SafeAreaProvider initialMetrics={medidasIniciais}>
      <TemaProvider>
        <SeletorPeriodo
          visivel
          periodos={periodos}
          selecionado={selecionado}
          aoEscolher={aoEscolher}
          aoFechar={aoFechar}
        />
      </TemaProvider>
    </SafeAreaProvider>,
  );
  return { aoEscolher, aoFechar };
}

describe('SeletorPeriodo', () => {
  it('abre no ano do mês escolhido, com ele marcado', async () => {
    await abrir('2025-12');

    expect(screen.getByText('2025')).toBeTruthy();
    expect(screen.getByRole('radio', { name: 'Dezembro de 2025' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Novembro de 2025' })).not.toBeChecked();
  });

  it('só deixa escolher meses com registro', async () => {
    const { aoEscolher } = await abrir('2025-12');

    expect(screen.getByRole('radio', { name: 'Março de 2025' })).toBeDisabled();

    await fireEvent.press(screen.getByRole('radio', { name: 'Novembro de 2025' }));

    expect(aoEscolher).toHaveBeenCalledWith('2025-11');
  });

  it('troca de ano pelas setas, só entre anos com registro', async () => {
    const { aoEscolher } = await abrir('2025-12');

    expect(screen.getByRole('button', { name: 'Ano anterior' })).toBeDisabled();

    await fireEvent.press(screen.getByRole('button', { name: 'Próximo ano, 2026' }));

    expect(screen.getByText('2026')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Próximo ano' })).toBeDisabled();

    await fireEvent.press(screen.getByRole('radio', { name: 'Janeiro de 2026' }));

    expect(aoEscolher).toHaveBeenCalledWith('2026-01');
  });

  it('fecha sem escolher', async () => {
    const { aoEscolher, aoFechar } = await abrir('2026-01');

    await fireEvent.press(screen.getAllByRole('button', { name: 'Fechar' })[0]);

    expect(aoFechar).toHaveBeenCalled();
    expect(aoEscolher).not.toHaveBeenCalled();
  });
});
