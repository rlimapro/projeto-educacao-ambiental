import { Slot } from 'expo-router';
import { act, cleanup, fireEvent, renderRouter, screen } from 'expo-router/testing-library';

import { calcularEmissoes } from '@/calculo/emissoes';
import type { ConsumosInformados, Perfil } from '@/calculo/tipos';
import type { RegistroConsumo } from '@/dados/consumos';
import LayoutInicio from '@/app/(abas)/(inicio)/_layout';
import Inicio from '@/app/(abas)/(inicio)/index';
import MemoriaCalculo from '@/app/(abas)/(inicio)/memoria/[periodo]/[fonte]';
import DistribuirMudas from '@/app/(abas)/(inicio)/distribuir';
import SimularPlantio from '@/app/(abas)/(inicio)/plantio/[periodo]';
import SugestoesReducao from '@/app/(abas)/(inicio)/sugestoes/[periodo]';
import LayoutAbas from '@/app/(abas)/_layout';
import Ajustes from '@/app/(abas)/ajustes';
import Historico from '@/app/(abas)/historico';
import Registrar from '@/app/(abas)/registrar';
import { TemaProvider } from '@/ui/tema';

// Distribuição das mudas no terreno (RF06), aberta pela simulação de plantio.
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
  '(abas)/(inicio)/sugestoes/[periodo]': SugestoesReducao,
  '(abas)/(inicio)/plantio/[periodo]': SimularPlantio,
  '(abas)/(inicio)/distribuir': DistribuirMudas,
  '(abas)/registrar': Registrar,
  '(abas)/historico': Historico,
  '(abas)/ajustes': Ajustes,
};

function registrar(perfil: Perfil, consumos: Partial<ConsumosInformados>) {
  const completos = {
    energiaKwh: 0,
    gasolinaLitros: 0,
    etanolLitros: 0,
    dieselLitros: 0,
    glpBotoes13Kg: 0,
    ...consumos,
  };
  const registro: RegistroConsumo = {
    id: '2026-11',
    ano: 2026,
    mes: 11,
    perfil,
    consumos: completos,
    calculo: calcularEmissoes(completos, 2026, 11),
    criadoEm: '2026-11-10T12:00:00.000Z',
  };
  Storage.setItemSync('consumos.registrados.v1', JSON.stringify([registro]));
}

beforeEach(() => {
  cleanup();
  Storage.clearSync();
  Storage.setItemSync('preferencias.boasVindasConcluidas', 'sim');
  jest.useFakeTimers().setSystemTime(new Date(2026, 10, 11, 12));
});

afterEach(() => {
  cleanup();
  jest.useRealTimers();
});

// Energia: 1.000 kWh × 0,0461 = 46,1 kg CO₂e no mês.
// Pampa: 3,037 kg/ano × 20 anos = 60,74 kg por árvore.
// Amazônia: 7,449 × 20 = 148,98 kg por árvore.

// O terreno é desenhado depois de medir a largura disponível na tela. Com 300
// pontos de largura e terreno de 6 m, cada metro vale 50 pontos.
async function medirTerreno(larguraPontos = 300) {
  await act(async () => {
    fireEvent(screen.getByTestId('area-do-terreno'), 'layout', {
      nativeEvent: { layout: { width: larguraPontos, height: 0, x: 0, y: 0 } },
    });
  });
}

function camadaDeToque() {
  return screen.getByRole('button', { name: /^Terreno de/ });
}

// Toque num ponto do terreno, em metros (50 pontos por metro).
async function tocarEm(xM: number, yM: number) {
  await fireEvent.press(camadaDeToque(), {
    nativeEvent: { locationX: xM * 50, locationY: yM * 50 },
  });
}

describe('Distribuir no terreno', () => {
  it('abre pela simulação com a quantidade de árvores escolhida', async () => {
    registrar('residencia', { energiaKwh: 1000 });
    const app = await renderRouter(rotas, { initialUrl: '/plantio/2026-11' });

    await fireEvent.press(screen.getByRole('button', { name: 'Uma árvore a mais' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Ver como caberiam no terreno' }));

    expect(app.getPathname()).toBe('/distribuir');
    // 2 mudas; terreno sugerido de 6 m × 6 m: ⌊6/3⌋ × ⌊6/2⌋ = 6 lugares
    expect(screen.getByText('0 de 2 mudas no terreno · cabem até 6')).toBeTruthy();
  });

  it('coloca uma muda onde se toca e recusa um lugar já ocupado', async () => {
    await renderRouter(rotas, { initialUrl: '/distribuir?arvores=5' });
    await medirTerreno();

    // Toque em (1,5 m; 1 m): a muda ocupa de (0,0) a (3,2)
    await tocarEm(1.5, 1);
    expect(screen.getByText('1 de 5 mudas no terreno · cabem até 6')).toBeTruthy();
    expect(
      screen.getByRole('button', { name: 'Muda 1, a 0 m da esquerda e 0 m do topo' }),
    ).toBeTruthy();

    // Toque em (2,5 m; 1,5 m): a muda iria para (1,1), em cima da primeira
    await tocarEm(2.5, 1.5);
    expect(screen.getByText('Não cabe aí: o espaço da muda encosta no de outra.')).toBeTruthy();
    expect(screen.getByText('1 de 5 mudas no terreno · cabem até 6')).toBeTruthy();

    // Encostada pela borda é permitido: (4,5 m; 1 m) → (3,0)
    await tocarEm(4.5, 1);
    expect(screen.getByText('2 de 5 mudas no terreno · cabem até 6')).toBeTruthy();
  });

  it('distribui em fileiras e avisa quando o terreno não comporta todas', async () => {
    await renderRouter(rotas, { initialUrl: '/distribuir?arvores=5' });
    await medirTerreno();

    await fireEvent.press(screen.getByRole('button', { name: 'Distribuir automaticamente' }));
    expect(screen.getByText('5 de 5 mudas no terreno · cabem até 6')).toBeTruthy();

    // Comprimento 4 m: ⌊6/3⌋ × ⌊4/2⌋ = 4 lugares; a 5ª muda, na 3ª fileira, sai.
    await fireEvent.changeText(screen.getByLabelText('Comprimento do terreno, em metros'), '4');
    expect(screen.getByText('4 de 5 mudas no terreno · cabem até 4')).toBeTruthy();
    expect(screen.getByText('1 muda saiu porque o terreno diminuiu.')).toBeTruthy();
    expect(screen.getByText(/Nesse espaço cabem no máximo 4 mudas/)).toBeTruthy();

    await fireEvent.press(screen.getByRole('button', { name: 'Distribuir automaticamente' }));
    expect(
      screen.getByText('Couberam 4 de 5 mudas. Aumente o terreno para caber todas.'),
    ).toBeTruthy();
  });

  it('tira a muda selecionada e limpa o terreno', async () => {
    await renderRouter(rotas, { initialUrl: '/distribuir?arvores=3' });
    await medirTerreno();
    await fireEvent.press(screen.getByRole('button', { name: 'Distribuir automaticamente' }));

    await fireEvent(
      screen.getByRole('button', { name: 'Muda 2, a 3 m da esquerda e 0 m do topo' }),
      'accessibilityTap',
    );
    await fireEvent.press(screen.getByRole('button', { name: 'Tirar a muda 2' }));
    expect(screen.getByText('2 de 3 mudas no terreno · cabem até 6')).toBeTruthy();

    await fireEvent.press(screen.getByRole('button', { name: 'Limpar terreno' }));
    expect(screen.getByText('0 de 3 mudas no terreno · cabem até 6')).toBeTruthy();
  });

  it('não aceita lado fora de 2 a 100 m e volta ao último valor ao sair do campo', async () => {
    await renderRouter(rotas, { initialUrl: '/distribuir?arvores=5' });
    await medirTerreno();
    const largura = screen.getByLabelText('Largura do terreno, em metros');

    await fireEvent.changeText(largura, '999');
    expect(screen.getByText(/Use um valor inteiro de 2 a 100 m/)).toBeTruthy();
    // O terreno continua 6 m × 6 m: ⌊6/3⌋ × ⌊6/2⌋ = 6 lugares
    expect(screen.getByText('0 de 5 mudas no terreno · cabem até 6')).toBeTruthy();

    await fireEvent(largura, 'blur');
    expect(largura.props.value).toBe('6');
    expect(screen.queryByText(/Use um valor inteiro/)).toBeNull();

    // Letras e sinais nem entram no campo.
    await fireEvent.changeText(largura, '-1,5abc');
    expect(largura.props.value).toBe('15');
  });

  it.each([
    ['abc', 1],
    ['-5', 1],
    ['2.7', 2],
  ])('corrige a quantidade irreal %p vinda do link', async (valor, esperado) => {
    await renderRouter(rotas, { initialUrl: `/distribuir?arvores=${valor}` });

    expect(
      screen.getByText(
        `0 de ${esperado} ${esperado === 1 ? 'muda' : 'mudas'} no terreno · cabem até 6`,
      ),
    ).toBeTruthy();
  });

  it('limita quantidades enormes e o terreno ao máximo de 100 m', async () => {
    // 1e9 vira o limite de 9.999; o terreno sugerido para no máximo de 100 m:
    // ⌊100/3⌋ × ⌊100/2⌋ = 33 × 50 = 1.650 lugares
    await renderRouter(rotas, { initialUrl: '/distribuir?arvores=1e9' });
    expect(screen.getByText('0 de 9.999 mudas no terreno · cabem até 1.650')).toBeTruthy();
    expect(screen.getByLabelText('Largura do terreno, em metros').props.value).toBe('100');

    await medirTerreno();
    await fireEvent.press(screen.getByRole('button', { name: 'Distribuir automaticamente' }));
    expect(
      screen.getByText(
        'Couberam 1.650 de 9.999 mudas. Esse é o maior terreno da simulação: divida o plantio em mais de um terreno.',
      ),
    ).toBeTruthy();
  });
});
