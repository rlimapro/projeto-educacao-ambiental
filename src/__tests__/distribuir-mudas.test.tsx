import { Slot } from 'expo-router';
import { act, cleanup, fireEvent, renderRouter, screen } from 'expo-router/testing-library';
import { AccessibilityInfo } from 'react-native';

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

// O terreno é desenhado depois de medir a largura disponível na tela. A borda
// de 1 ponto fica por fora do terreno: com 302 pontos, sobram 300 para ele, e
// num terreno de 6 m cada metro vale 50 pontos.
async function medirTerreno(larguraPontos = 302) {
  await act(async () => {
    fireEvent(screen.getByTestId('area-do-terreno'), 'layout', {
      nativeEvent: { layout: { width: larguraPontos, height: 0, x: 0, y: 0 } },
    });
  });
}

// Encostar e soltar sem mover numa muda.
async function tocarMuda(nome: string) {
  const muda = screen.getByRole('button', { name: nome });
  const toque = { pageX: 0, pageY: 0, locationX: 0, locationY: 0, touches: [{ pageX: 0, pageY: 0 }] };
  await fireEvent(muda, 'responderGrant', { nativeEvent: toque });
  await fireEvent(muda, 'responderRelease', { nativeEvent: { ...toque, touches: [] } });
}

// A lixeira é medida ao surgir; nos testes, fica em (150, 600), com 72 × 72.
const NA_LIXEIRA = { pageX: 186, pageY: 636, locationX: 0, locationY: 0 };
const LONGE = { pageX: 20, pageY: 100, locationX: 0, locationY: 0 };

async function tocarTerreno(nome: RegExp) {
  const terreno = screen.getByRole('radio', { name: nome });
  const toque = { pageX: 0, pageY: 0, locationX: 0, locationY: 0, touches: [{}] };
  await fireEvent(terreno, 'responderGrant', { nativeEvent: toque });
  await fireEvent(terreno, 'responderRelease', { nativeEvent: { ...toque, touches: [] } });
}

// Segura o terreno por 500 ms; se a lixeira surgir, mede onde ela está.
async function segurarTerreno(terreno: ReturnType<typeof screen.getByRole>) {
  await fireEvent(terreno, 'responderGrant', {
    nativeEvent: { pageX: 20, pageY: 20, locationX: 10, locationY: 10, touches: [{}] },
  });
  await act(async () => {
    jest.advanceTimersByTime(500);
  });
  const lixeira = screen.queryByTestId('lixeira');
  if (lixeira) {
    await fireEvent(lixeira, 'layout', {
      nativeEvent: { layout: { x: 150, y: 600, width: 72, height: 72 } },
    });
  }
}

async function arrastarTerreno(nome: RegExp, destino: typeof NA_LIXEIRA) {
  const terreno = screen.getByRole('radio', { name: nome });
  await segurarTerreno(terreno);
  await fireEvent(terreno, 'responderMove', { nativeEvent: { ...destino, touches: [{}] } });
  await fireEvent(terreno, 'responderRelease', { nativeEvent: { ...destino, touches: [] } });
}

function camadaDeToque() {
  return screen.getByRole('button', { name: /^Terreno (\d+, )?de / });
}

// Toque num ponto do terreno, em metros (50 pontos por metro, salvo outra
// escala). O terreno trata o toque pelos eventos de responder: encostar e soltar
// sem mover põe a muda onde o dedo tocou.
async function tocarEm(xM: number, yM: number, pontosPorM = 50) {
  const toque = {
    locationX: xM * pontosPorM,
    locationY: yM * pontosPorM,
    pageX: xM * pontosPorM,
    pageY: yM * pontosPorM,
  };
  await fireEvent(camadaDeToque(), 'responderGrant', { nativeEvent: { ...toque, touches: [toque] } });
  await fireEvent(camadaDeToque(), 'responderRelease', { nativeEvent: { ...toque, touches: [] } });
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
      screen.getByText(
        'Couberam 4 de 5 mudas. Aumente o terreno ou adicione outro para as que faltam.',
      ),
    ).toBeTruthy();
  });

  it('tira a muda selecionada e limpa o terreno', async () => {
    await renderRouter(rotas, { initialUrl: '/distribuir?arvores=3' });
    await medirTerreno();
    await fireEvent.press(screen.getByRole('button', { name: 'Distribuir automaticamente' }));

    await tocarMuda('Muda 2, a 3 m da esquerda e 0 m do topo');
    await fireEvent.press(screen.getByRole('button', { name: 'Tirar a muda 2' }));
    expect(screen.getByText('2 de 3 mudas no terreno · cabem até 6')).toBeTruthy();

    await fireEvent.press(screen.getByRole('button', { name: 'Limpar terreno' }));
    expect(screen.getByText('0 de 3 mudas no terreno · cabem até 6')).toBeTruthy();
    // Vazio, não há o que limpar
    expect(screen.queryByRole('button', { name: 'Limpar terreno' })).toBeNull();
  });

  it('só mostra Limpar terreno quando há muda no terreno', async () => {
    await renderRouter(rotas, { initialUrl: '/distribuir?arvores=3' });
    await medirTerreno();
    expect(screen.queryByRole('button', { name: 'Limpar terreno' })).toBeNull();
    await tocarEm(1.5, 1);
    expect(screen.getByRole('button', { name: 'Limpar terreno' })).toBeTruthy();
  });

  it('segurar uma muda e arrastar continua movendo a muda', async () => {
    await renderRouter(rotas, { initialUrl: '/distribuir?arvores=1' });
    await medirTerreno();
    await tocarEm(1.5, 1);
    const muda = screen.getByRole('button', { name: 'Muda 1, a 0 m da esquerda e 0 m do topo' });
    const inicio = { pageX: 75, pageY: 50, locationX: 75, locationY: 50, touches: [{}] };
    await fireEvent(muda, 'responderGrant', { nativeEvent: inicio });
    // segura um segundo antes de arrastar: nada de seleção nem lixeira
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });
    // 150 pontos à direita = 3 m: a muda vai de x 0 para x 3
    await fireEvent(muda, 'responderMove', { nativeEvent: { ...inicio, pageX: 225 } });
    await fireEvent(muda, 'responderRelease', { nativeEvent: { ...inicio, pageX: 225, touches: [] } });
    expect(
      screen.getByRole('button', { name: 'Muda 1, a 3 m da esquerda e 0 m do topo' }),
    ).toBeTruthy();
    expect(screen.queryByTestId('lixeira')).toBeNull();
  });

  it('trava a rolagem da tela enquanto há um dedo no terreno', async () => {
    await renderRouter(rotas, { initialUrl: '/distribuir?arvores=2' });
    await medirTerreno();
    const rolagem = screen.getByTestId('rolagem-da-tela');
    const janela = screen.getByTestId('janela-do-terreno');
    expect(rolagem.props.scrollEnabled).toBe(true);

    await fireEvent(janela, 'touchStart', { nativeEvent: { touches: [{}] } });
    expect(rolagem.props.scrollEnabled).toBe(false);
    // Um de dois dedos saiu: continua travada
    await fireEvent(janela, 'touchEnd', { nativeEvent: { touches: [{}] } });
    expect(rolagem.props.scrollEnabled).toBe(false);
    await fireEvent(janela, 'touchEnd', { nativeEvent: { touches: [] } });
    expect(rolagem.props.scrollEnabled).toBe(true);
  });

  it('desenha a borda por fora do terreno, sem cortar as mudas da direita e de baixo', async () => {
    await renderRouter(rotas, { initialUrl: '/distribuir?arvores=2' });
    await medirTerreno();
    // 6 m × 50 = 300 pontos de terreno, mais 1 de borda de cada lado
    expect(screen.getByTestId('janela-do-terreno')).toHaveStyle({
      width: 302,
      height: 302,
      borderWidth: 1,
    });
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
        'Couberam 1.650 de 9.999 mudas. Esse é o maior terreno da simulação: adicione outro terreno para as que faltam.',
      ),
    ).toBeTruthy();
  });

  it('põe a muda no primeiro lugar livre pelo leitor de tela', async () => {
    await renderRouter(rotas, { initialUrl: '/distribuir?arvores=2' });
    await medirTerreno();

    await fireEvent(camadaDeToque(), 'accessibilityTap');
    await fireEvent(camadaDeToque(), 'accessibilityTap');
    // 6 × 6: (0,0) e depois (3,0), ao lado
    expect(
      screen.getByRole('button', { name: 'Muda 2, a 3 m da esquerda e 0 m do topo' }),
    ).toBeTruthy();
    await fireEvent(camadaDeToque(), 'accessibilityTap');
    expect(
      screen.getByText('Todas as mudas já estão no terreno. Arraste para mudar de lugar.'),
    ).toBeTruthy();
  });
});

describe('Vários terrenos', () => {
  it('divide as mudas entre terrenos de medidas diferentes', async () => {
    await renderRouter(rotas, { initialUrl: '/distribuir?arvores=10' });
    await medirTerreno();

    // O terreno sugerido para 10 mudas é 11 × 11. 1º terreno de 6 × 4:
    // ⌊6/3⌋ × ⌊4/2⌋ = 4 lugares
    await fireEvent.changeText(screen.getByLabelText('Largura do terreno, em metros'), '6');
    await fireEvent.changeText(screen.getByLabelText('Comprimento do terreno, em metros'), '4');
    await fireEvent.press(screen.getByRole('button', { name: 'Distribuir automaticamente' }));
    expect(screen.getByText('4 de 10 mudas no terreno · cabem até 4')).toBeTruthy();

    // 2º terreno: sugerido para as 6 que faltam, 6 × 6 com 6 lugares
    await fireEvent.press(screen.getByRole('button', { name: '+ Terreno' }));
    expect(screen.getByText('4 de 10 mudas em 2 terrenos · cabem até 10')).toBeTruthy();
    await fireEvent.changeText(screen.getByLabelText('Largura do terreno 2, em metros'), '3');
    // 3 × 6: ⌊3/3⌋ × ⌊6/2⌋ = 3 lugares; das 6 que faltam, cabem 3
    await fireEvent.press(screen.getByRole('button', { name: 'Distribuir automaticamente' }));
    expect(
      screen.getByText('Couberam 3 de 6 mudas. Aumente o terreno ou adicione outro para as que faltam.'),
    ).toBeTruthy();
    // a numeração continua depois das 4 mudas do 1º terreno
    expect(screen.getByRole('button', { name: 'Muda 5, a 0 m da esquerda e 0 m do topo' })).toBeTruthy();

    // 3º terreno para as 3 restantes
    await fireEvent.press(screen.getByRole('button', { name: '+ Terreno' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Distribuir automaticamente' }));
    // 4 + 3 + 3 = 10; capacidades 4 + 3 + 6 = 13
    expect(screen.getByText('10 de 10 mudas em 3 terrenos · cabem até 13')).toBeTruthy();
    expect(screen.getByText('Neste terreno: 3 mudas · cabem até 6')).toBeTruthy();

    // Voltar ao 1º terreno mostra as medidas dele
    await tocarTerreno(/^Terreno 1,/);
    expect(screen.getByLabelText('Comprimento do terreno 1, em metros').props.value).toBe('4');
    await tocarEm(1, 1);
    expect(
      screen.getByText(
        'Todas as mudas já estão nos terrenos. Arraste para mudar de lugar ou tire de outro terreno.',
      ),
    ).toBeTruthy();
  });

  // Três terrenos 6 × 6, com as 5 mudas no 2º.
  async function tresTerrenos() {
    await renderRouter(rotas, { initialUrl: '/distribuir?arvores=5' });
    await medirTerreno();
    await fireEvent.press(screen.getByRole('button', { name: '+ Terreno' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Distribuir automaticamente' }));
    await fireEvent.press(screen.getByRole('button', { name: '+ Terreno' }));
    expect(screen.getByText('5 de 5 mudas em 3 terrenos · cabem até 18')).toBeTruthy();
  }

  it('tira o terreno arrastado até a lixeira e permite desfazer', async () => {
    await tresTerrenos();
    await arrastarTerreno(/^Terreno 2,/, NA_LIXEIRA);
    expect(screen.getByText('O terreno 2 saiu do plano, com 5 mudas.')).toBeTruthy();
    expect(screen.getByText('0 de 5 mudas em 2 terrenos · cabem até 12')).toBeTruthy();
    expect(screen.queryByTestId('lixeira')).toBeNull();

    await fireEvent.press(screen.getByRole('button', { name: 'Desfazer (5 s)' }));
    expect(screen.getByText('O terreno 2 voltou ao plano.')).toBeTruthy();
    expect(screen.getByText('5 de 5 mudas em 3 terrenos · cabem até 18')).toBeTruthy();
    expect(screen.getByRole('radio', { name: /^Terreno 2, 6 por 6 metros, 5 mudas/ })).toBeTruthy();
  });

  it('o Desfazer conta 5 segundos e some com o aviso', async () => {
    await tresTerrenos();
    await arrastarTerreno(/^Terreno 3,/, NA_LIXEIRA);
    expect(screen.getByRole('button', { name: 'Desfazer (5 s)' })).toBeTruthy();

    await act(async () => {
      jest.advanceTimersByTime(1000);
    });
    expect(screen.getByRole('button', { name: 'Desfazer (4 s)' })).toBeTruthy();
    // mais 4 segundos: 5 no total
    for (let i = 0; i < 4; i++) {
      await act(async () => {
        jest.advanceTimersByTime(1000);
      });
    }
    expect(screen.queryByRole('button', { name: /^Desfazer/ })).toBeNull();
    expect(screen.queryByText('O terreno 3 saiu do plano.')).toBeNull();
    // O terreno continua fora
    expect(screen.getByText('5 de 5 mudas em 2 terrenos · cabem até 12')).toBeTruthy();
  });

  it('com leitor de tela, o Desfazer não tem prazo', async () => {
    const leitor = jest.spyOn(AccessibilityInfo, 'isScreenReaderEnabled').mockResolvedValue(true);
    try {
      await tresTerrenos();
      await fireEvent(screen.getByRole('radio', { name: /^Terreno 3,/ }), 'accessibilityAction', {
        nativeEvent: { actionName: 'tirar' },
      });
      await act(async () => {
        jest.advanceTimersByTime(30000);
      });
      expect(screen.getByRole('button', { name: 'Desfazer' })).toBeTruthy();
    } finally {
      // O AccessibilityInfo do jest-expo já é simulado: volta ao padrão, sem leitor.
      leitor.mockResolvedValue(false);
    }
  });

  it('mostra a lixeira ao segurar e avisa quando o terreno está sobre ela', async () => {
    await tresTerrenos();
    const terreno = screen.getByRole('radio', { name: /^Terreno 3,/ });
    await segurarTerreno(terreno);
    expect(screen.getByText('Arraste até a lixeira para tirar')).toBeTruthy();
    await fireEvent(terreno, 'responderMove', { nativeEvent: { ...NA_LIXEIRA, touches: [{}] } });
    expect(screen.getByText('Solte para tirar o terreno 3')).toBeTruthy();
    // Volta para longe da lixeira e solta: nada sai
    await fireEvent(terreno, 'responderMove', { nativeEvent: { ...LONGE, touches: [{}] } });
    await fireEvent(terreno, 'responderRelease', { nativeEvent: { ...LONGE, touches: [] } });
    expect(screen.queryByTestId('lixeira')).toBeNull();
    expect(screen.getByText('5 de 5 mudas em 3 terrenos · cabem até 18')).toBeTruthy();
  });

  it('toque curto abre o terreno, e mexer antes de segurar não pega o terreno', async () => {
    await tresTerrenos();
    const terreno1 = screen.getByRole('radio', { name: /^Terreno 1,/ });
    const toque = { pageX: 20, pageY: 20, locationX: 10, locationY: 10, touches: [{}] };
    // Mexer 30 pontos antes dos 500 ms é rolar a lista
    await fireEvent(terreno1, 'responderGrant', { nativeEvent: toque });
    await fireEvent(terreno1, 'responderMove', { nativeEvent: { ...toque, pageX: 50 } });
    await act(async () => {
      jest.advanceTimersByTime(600);
    });
    expect(screen.queryByTestId('lixeira')).toBeNull();
    await fireEvent(terreno1, 'responderRelease', { nativeEvent: { ...toque, pageX: 50, touches: [] } });
    expect(screen.getByRole('radio', { name: /^Terreno 3,/ }).props.accessibilityState).toEqual(
      expect.objectContaining({ checked: true }),
    );

    await tocarTerreno(/^Terreno 1,/);
    expect(terreno1.props.accessibilityState).toEqual(expect.objectContaining({ checked: true }));
  });

  it('com um terreno só, segurar não mostra a lixeira', async () => {
    await renderRouter(rotas, { initialUrl: '/distribuir?arvores=5' });
    await medirTerreno();
    await segurarTerreno(screen.getByRole('radio', { name: /^Terreno 1,/ }));
    expect(screen.queryByTestId('lixeira')).toBeNull();
  });

  it('tira o terreno pela ação do leitor de tela', async () => {
    await tresTerrenos();
    await fireEvent(screen.getByRole('radio', { name: /^Terreno 3,/ }), 'accessibilityAction', {
      nativeEvent: { actionName: 'tirar' },
    });
    expect(screen.getByText('O terreno 3 saiu do plano.')).toBeTruthy();
  });

  it('guarda o plano no aparelho e o retoma ao voltar', async () => {
    await renderRouter(rotas, { initialUrl: '/distribuir?arvores=5' });
    await medirTerreno();
    await fireEvent.press(screen.getByRole('button', { name: 'Distribuir automaticamente' }));
    await fireEvent.press(screen.getByRole('button', { name: '+ Terreno' }));
    await fireEvent.changeText(screen.getByLabelText('Largura do terreno 2, em metros'), '9');
    await cleanup();

    // 6 × 6 com 6 lugares e 9 × 6 com ⌊9/3⌋ × ⌊6/2⌋ = 9
    await renderRouter(rotas, { initialUrl: '/distribuir?arvores=5' });
    expect(screen.getByText('5 de 5 mudas em 2 terrenos · cabem até 15')).toBeTruthy();
    expect(screen.getByRole('radio', { name: /^Terreno 2, 9 por 6 metros/ })).toBeTruthy();
    await cleanup();

    // Com menos árvores na simulação, as últimas mudas saem do plano salvo
    await renderRouter(rotas, { initialUrl: '/distribuir?arvores=3' });
    expect(screen.getByText('2 mudas saíram do plano salvo porque a simulação agora tem 3 mudas.')).toBeTruthy();
    expect(screen.getByText('3 de 3 mudas em 2 terrenos · cabem até 15')).toBeTruthy();
  });
});

describe('Zoom no terreno', () => {
  it('aproxima e afasta um terreno grande com os botões', async () => {
    // 100 × 100 m em 300 pontos: 3 pontos por metro no terreno inteiro
    await renderRouter(rotas, { initialUrl: '/distribuir?arvores=9999' });
    await medirTerreno();
    expect(screen.getByText('1×')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Afastar' }).props.accessibilityState).toEqual(
      expect.objectContaining({ disabled: true }),
    );

    await fireEvent.press(screen.getByRole('button', { name: 'Aproximar' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Aproximar' }));
    // 1,5 × 1,5 = 2,25 vezes, mostrado com uma casa: 2,3×
    expect(screen.getByText('2,3×')).toBeTruthy();
    // a janela fica com a largura da tela e a altura máxima de 440, mais a borda
    expect(screen.getByTestId('janela-do-terreno')).toHaveStyle({ width: 302, height: 442 });

    // o toque vale na escala nova: 3 × 2,25 = 6,75 pontos por metro.
    // (10 m; 10 m) → muda em (9, 9)
    await tocarEm(10, 10, 6.75);
    expect(
      screen.getByRole('button', { name: 'Muda 1, a 9 m da esquerda e 9 m do topo' }),
    ).toBeTruthy();

    await fireEvent.press(screen.getByRole('button', { name: 'Ver inteiro' }));
    expect(screen.getByText('1×')).toBeTruthy();
    expect(screen.getByTestId('janela-do-terreno')).toHaveStyle({ width: 302, height: 302 });
  });

  it('aproxima com a pinça de dois dedos', async () => {
    await renderRouter(rotas, { initialUrl: '/distribuir?arvores=9999' });
    await medirTerreno();
    // Dedos a 100 pontos um do outro, depois a 200: o zoom dobra
    const dedos = (distanciaPontos: number) => [
      { pageX: 150 - distanciaPontos / 2, pageY: 150 },
      { pageX: 150 + distanciaPontos / 2, pageY: 150 },
    ];
    const toque = { locationX: 100, locationY: 150, pageX: 100, pageY: 150 };
    await fireEvent(camadaDeToque(), 'responderGrant', {
      nativeEvent: { ...toque, touches: dedos(100) },
    });
    await fireEvent(camadaDeToque(), 'responderMove', {
      nativeEvent: { ...toque, touches: dedos(200) },
    });
    await fireEvent(camadaDeToque(), 'responderRelease', {
      nativeEvent: { ...toque, touches: [] },
    });
    expect(screen.getByText('2×')).toBeTruthy();
    // 3 × 2 = 6 pontos por metro: a janela passa a ter a altura máxima de 440, mais a borda
    expect(screen.getByTestId('janela-do-terreno')).toHaveStyle({ width: 302, height: 442 });
    // A pinça não pôs nenhuma muda
    expect(screen.getByText('0 de 9.999 mudas no terreno · cabem até 1.650')).toBeTruthy();
  });

  it('com zoom, desenha só as mudas perto da vista', async () => {
    // 400 mudas: terreno sugerido de 52 × 52 m (⌊50/3⌋ × ⌊50/2⌋ = 400, mais 2 m)
    await renderRouter(rotas, { initialUrl: '/distribuir?arvores=400' });
    await medirTerreno();
    await fireEvent.press(screen.getByRole('button', { name: 'Distribuir automaticamente' }));
    const mudasDesenhadas = () => screen.queryAllByLabelText(/^Muda \d+,/).length;
    expect(mudasDesenhadas()).toBe(400);

    // 300 ÷ 52 ≈ 5,8 pontos por metro; o máximo de 32 é cerca de 5,5 vezes, e
    // cinco toques de 1,5× passam dele. O zoom é em torno do centro (26 m).
    for (let i = 0; i < 5; i++) {
      await fireEvent.press(screen.getByRole('button', { name: 'Aproximar' }));
    }
    // A 32 pontos por metro, a janela de 300 × 440 mais uma janela de margem
    // de cada lado cobre uns 28 m × 41 m em volta do centro: só parte das mudas.
    const perto = mudasDesenhadas();
    expect(perto).toBeGreaterThan(0);
    expect(perto).toBeLessThan(400);
    // A muda 1, no canto (0, 0), fica a mais de 26 − 14 = 12 m da vista
    expect(screen.queryByLabelText(/^Muda 1, a 0 m da esquerda/)).toBeNull();

    await fireEvent.press(screen.getByRole('button', { name: 'Ver inteiro' }));
    expect(mudasDesenhadas()).toBe(400);
  });

  it('não oferece zoom num terreno que já aparece grande', async () => {
    // 6 × 6 m a 50 pontos por metro já passa do zoom máximo de 32
    await renderRouter(rotas, { initialUrl: '/distribuir?arvores=2' });
    await medirTerreno();
    expect(screen.queryByRole('button', { name: 'Aproximar' })).toBeNull();
  });
});
