import { Text } from 'react-native';
import { fireEvent, render, screen } from '@testing-library/react-native';

import { TemaProvider, resolverEsquema, useTema } from './TemaProvider';
import { cores } from './tokens';

jest.mock('@/dados/preferencias', () => ({
  lerPreferenciaTema: jest.fn(() => 'claro'),
  salvarPreferenciaTema: jest.fn(),
}));

const preferencias = jest.requireMock<{
  lerPreferenciaTema: jest.Mock;
  salvarPreferenciaTema: jest.Mock;
}>('@/dados/preferencias');

describe('resolverEsquema', () => {
  it('respeita a escolha explícita do usuário', () => {
    expect(resolverEsquema('claro', 'dark')).toBe('claro');
    expect(resolverEsquema('escuro', 'light')).toBe('escuro');
  });

  it('segue o sistema quando pedido', () => {
    expect(resolverEsquema('sistema', 'dark')).toBe('escuro');
    expect(resolverEsquema('sistema', 'light')).toBe('claro');
  });

  it('usa o claro quando o sistema não informa o esquema', () => {
    expect(resolverEsquema('sistema', null)).toBe('claro');
  });
});

function MostraTema() {
  const { esquema, cores: coresAtuais, definirPreferencia } = useTema();
  return (
    <>
      <Text>{`esquema: ${esquema}`}</Text>
      <Text>{`fundo: ${coresAtuais.fundo}`}</Text>
      <Text onPress={() => definirPreferencia('escuro')}>trocar</Text>
    </>
  );
}

describe('TemaProvider', () => {
  it('aplica a preferência salva ao abrir', async () => {
    preferencias.lerPreferenciaTema.mockReturnValueOnce('escuro');
    await render(
      <TemaProvider>
        <MostraTema />
      </TemaProvider>,
    );
    expect(screen.getByText('esquema: escuro')).toBeTruthy();
    expect(screen.getByText(`fundo: ${cores.escuro.fundo}`)).toBeTruthy();
  });

  it('troca o tema e salva a escolha', async () => {
    await render(
      <TemaProvider>
        <MostraTema />
      </TemaProvider>,
    );
    expect(screen.getByText('esquema: claro')).toBeTruthy();

    await fireEvent.press(screen.getByText('trocar'));

    expect(screen.getByText('esquema: escuro')).toBeTruthy();
    expect(preferencias.salvarPreferenciaTema).toHaveBeenCalledWith('escuro');
  });
});
