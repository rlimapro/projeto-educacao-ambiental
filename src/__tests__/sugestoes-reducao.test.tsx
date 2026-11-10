import { Slot } from 'expo-router';
import { cleanup, fireEvent, renderRouter, screen } from 'expo-router/testing-library';

import { calcularEmissoes } from '@/calculo/emissoes';
import type { ConsumosInformados, Perfil } from '@/calculo/tipos';
import type { RegistroConsumo } from '@/dados/consumos';
import LayoutInicio from '@/app/(abas)/(inicio)/_layout';
import Inicio from '@/app/(abas)/(inicio)/index';
import MemoriaCalculo from '@/app/(abas)/(inicio)/memoria/[periodo]/[fonte]';
import SugestoesReducao from '@/app/(abas)/(inicio)/sugestoes/[periodo]';
import LayoutAbas from '@/app/(abas)/_layout';
import Ajustes from '@/app/(abas)/ajustes';
import Historico from '@/app/(abas)/historico';
import Registrar from '@/app/(abas)/registrar';
import { TemaProvider } from '@/ui/tema';

// Sugestões de redução (RF08), abertas pela Início e pela memória de cálculo.
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

// Energia: 1.000 kWh × 0,0461 = 46,1 kg
// Gás: 1 botijão × 13 kg × 2,9407 = 38,2291 kg
// Gasolina (novembro de 2026): 10 L × 1,5738 = 15,738 kg
// Total 100,0671 kg: energia 46%, gás 38%, combustível 16%
const consumosTresGrupos = { energiaKwh: 1000, glpBotoes13Kg: 1, gasolinaLitros: 10 };

beforeEach(() => {
  cleanup();
  Storage.clearSync();
  Storage.setItemSync('preferencias.boasVindasConcluidas', 'sim');
  jest.useFakeTimers().setSystemTime(new Date(2026, 10, 10, 12));
});

afterEach(() => {
  cleanup();
  jest.useRealTimers();
});

describe('Sugestões de redução', () => {
  it('abre pela Início no grupo que mais emite, com quanto vale reduzir 10%', async () => {
    registrar('residencia', consumosTresGrupos);
    const app = await renderRouter(rotas, { initialUrl: '/' });

    // Energia para residência: 2 de impacto alto, 2 médio e 2 baixo.
    await fireEvent.press(
      screen.getByRole('button', {
        name: 'Reduzir antes de compensar. 6 sugestões para energia elétrica',
      }),
    );

    expect(app.getPathname()).toBe('/sugestoes/2026-11');
    expect(screen.getByRole('radio', { name: 'Energia' })).toBeChecked();
    expect(
      screen.getByText(
        'Sugestões para a energia elétrica, que responde por 46% das suas emissões em novembro.',
      ),
    ).toBeTruthy();
    // 10% de 46,1 kg = 4,61 kg → 5 kg
    expect(screen.getByText('5 kg de CO₂e')).toBeTruthy();
    expect(screen.getByText('Encurte o banho')).toBeTruthy();
    expect(screen.getByText('Ajuste o ar-condicionado')).toBeTruthy();
    expect(screen.queryByText('Tire da tomada')).toBeNull();

    await fireEvent.press(screen.getByRole('button', { name: 'Mostrar mais 3 sugestões' }));

    expect(screen.getByText('Tire da tomada')).toBeTruthy();
  });

  it('troca de grupo pelos botões do topo', async () => {
    registrar('residencia', consumosTresGrupos);
    await renderRouter(rotas, { initialUrl: '/sugestoes/2026-11' });

    await fireEvent.press(screen.getByRole('radio', { name: 'Gás' }));

    expect(
      screen.getByText(
        'Sugestões para o gás de cozinha, que responde por 38% das suas emissões em novembro.',
      ),
    ).toBeTruthy();
    // 10% de 38,2291 kg = 3,82 kg → 4 kg
    expect(screen.getByText('4 kg de CO₂e')).toBeTruthy();
    expect(screen.getByText('Use a panela de pressão')).toBeTruthy();
  });

  it('abre pela memória de cálculo já no grupo da fonte', async () => {
    registrar('residencia', consumosTresGrupos);
    const app = await renderRouter(rotas, { initialUrl: '/memoria/2026-11/gasolina' });

    await fireEvent.press(screen.getByRole('button', { name: 'Ver como reduzir' }));

    expect(app.getPathname()).toBe('/sugestoes/2026-11');
    expect(screen.getByRole('radio', { name: 'Combustível' })).toBeChecked();
    expect(screen.getByText('Prefira etanol no carro flex')).toBeTruthy();
  });

  it('escolhe as sugestões pelo perfil e esconde os botões com um grupo só', async () => {
    // 1 L × 1,5738 = 1,5738 kg; 10% = 0,157 kg
    registrar('comercio', { gasolinaLitros: 1 });
    await renderRouter(rotas, { initialUrl: '/sugestoes/2026-11' });

    expect(screen.getByText('Planeje entregas por região')).toBeTruthy();
    expect(screen.queryByText('Divida o carro')).toBeNull();
    expect(screen.queryByRole('radiogroup')).toBeNull();
    expect(screen.getByText('menos de 1 kg de CO₂e')).toBeTruthy();
  });

  it('avisa quando o mês não tem registro', async () => {
    await renderRouter(rotas, { initialUrl: '/sugestoes/2026-01' });

    expect(screen.getByText('Nenhuma emissão neste mês')).toBeTruthy();
  });
});
