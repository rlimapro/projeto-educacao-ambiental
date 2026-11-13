import { Slot } from 'expo-router';
import { cleanup, fireEvent, renderRouter, screen } from 'expo-router/testing-library';

import { calcularEmissoes } from '@/calculo/emissoes';
import type { ConsumosInformados, Perfil } from '@/calculo/tipos';
import type { RegistroConsumo } from '@/dados/consumos';
import LayoutInicio from '@/app/(abas)/(inicio)/_layout';
import Inicio from '@/app/(abas)/(inicio)/index';
import MemoriaCalculo from '@/app/(abas)/(inicio)/memoria/[periodo]/[fonte]';
import SimularPlantio from '@/app/(abas)/(inicio)/plantio/[periodo]';
import SugestoesReducao from '@/app/(abas)/(inicio)/sugestoes/[periodo]';
import LayoutAbas from '@/app/(abas)/_layout';
import Ajustes from '@/app/(abas)/ajustes';
import Historico from '@/app/(abas)/historico';
import Registrar from '@/app/(abas)/registrar';
import { TemaProvider } from '@/ui/tema';

// Simulação de plantio (RF05, RF06), aberta pelas sugestões de redução.
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

// Vários meses: cada um com o próprio cálculo, salvos juntos.
function registrarMeses(meses: { ano: number; mes: number; energiaKwh: number }[]) {
  const registros: RegistroConsumo[] = meses.map(({ ano, mes, energiaKwh }) => {
    const consumos = {
      energiaKwh,
      gasolinaLitros: 0,
      etanolLitros: 0,
      dieselLitros: 0,
      glpBotoes13Kg: 0,
    };
    return {
      id: `${ano}-${String(mes).padStart(2, '0')}`,
      ano,
      mes,
      perfil: 'residencia',
      consumos,
      calculo: calcularEmissoes(consumos, ano, mes),
      criadoEm: '2026-11-11T12:00:00.000Z',
    };
  });
  Storage.setItemSync('consumos.registrados.v1', JSON.stringify(registros));
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

describe('Simular plantio', () => {
  it('só se chega pelas sugestões de redução, e começa no bioma mais lento', async () => {
    registrar('residencia', { energiaKwh: 1000 });
    const app = await renderRouter(rotas, { initialUrl: '/sugestoes/2026-11' });

    expect(screen.getByText('Já reduziu o que dava?')).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: 'Simular plantio' }));

    expect(app.getPathname()).toBe('/plantio/2026-11');
    expect(
      screen.getByRole('button', {
        name: 'Pampa e Mata Atlântica do Sul. Bioma onde as mudas seriam plantadas',
      }),
    ).toBeTruthy();
    // 46,1 / 60,74 = 0,76 → 1 árvore
    expect(screen.getByText('1 árvore')).toBeTruthy();
    // 60,74 − 46,1 = 14,64 → +15 kg
    expect(screen.getByText('+15')).toBeTruthy();
    expect(
      screen.getByText('seriam retirados da atmosfera além do que você emitiu em novembro.'),
    ).toBeTruthy();
    // 46,1 / 3,037 = 15,2 → ano 16
    expect(screen.getByText(/chegaria a esse valor por volta do ano 16/)).toBeTruthy();
  });

  it('recalcula ao trocar o bioma', async () => {
    registrar('residencia', { energiaKwh: 1000 });
    await renderRouter(rotas, { initialUrl: '/plantio/2026-11' });

    await fireEvent.press(
      screen.getByRole('button', {
        name: 'Pampa e Mata Atlântica do Sul. Bioma onde as mudas seriam plantadas',
      }),
    );
    await fireEvent.press(
      screen.getByRole('radio', { name: 'Amazônia. 7,449 kg CO₂ por árvore por ano' }),
    );

    // 148,98 − 46,1 = 102,88 → +103 kg; 46,1 / 7,449 = 6,2 → ano 7
    expect(screen.getByText('+103')).toBeTruthy();
    expect(screen.getByText(/por volta do ano 7/)).toBeTruthy();
  });

  it('muda a quantidade pelos botões, sem passar de uma árvore para menos', async () => {
    registrar('residencia', { energiaKwh: 1000 });
    await renderRouter(rotas, { initialUrl: '/plantio/2026-11' });

    expect(screen.getByRole('button', { name: 'Uma árvore a menos' })).toBeDisabled();

    await fireEvent.press(screen.getByRole('button', { name: 'Uma árvore a mais' }));

    // 2 × 60,74 = 121,48; 121,48 − 46,1 = 75,38 → +75 kg
    expect(screen.getByText('Com 2 árvores, em 20 anos após o plantio')).toBeTruthy();
    expect(screen.getByText('+75')).toBeTruthy();
  });

  it('mostra quanto faltaria quando as árvores não alcançam a emissão', async () => {
    // Gasolina (novembro de 2026): 100 L × 1,5738 = 157,38 kg
    // Pampa: 157,38 / 60,74 = 2,59 → 3 árvores para neutralizar
    registrar('residencia', { gasolinaLitros: 100 });
    await renderRouter(rotas, { initialUrl: '/plantio/2026-11' });

    expect(screen.getByText('3 árvores')).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: 'Uma árvore a menos' }));

    // 2 × 60,74 = 121,48; 121,48 − 157,38 = −35,9 → −36 kg
    expect(screen.getByText('−36')).toBeTruthy();
    expect(
      screen.getByText('ainda faltariam para retirar o que você emitiu em novembro.'),
    ).toBeTruthy();
    expect(screen.getByText(/não chegaria a esse valor em 20 anos/)).toBeTruthy();

    // Tocar no cartão de referência volta para a quantidade que neutralizaria.
    await fireEvent.press(
      screen.getByRole('button', { name: 'Para neutralizar novembro: 3 árvores' }),
    );
    expect(screen.getByText('Com 3 árvores, em 20 anos após o plantio')).toBeTruthy();
  });

  it('abre as orientações sobre os tipos de árvore', async () => {
    registrar('residencia', { energiaKwh: 1000 });
    await renderRouter(rotas, { initialUrl: '/plantio/2026-11' });

    await fireEvent.press(
      screen.getByRole('button', {
        name: 'Que árvores plantar. Nativas e variadas: o que cada tipo faz',
      }),
    );

    expect(screen.getByText('Antes de plantar')).toBeTruthy();
    expect(screen.getByText(/Evite eucalipto e pinus/)).toBeTruthy();
  });

  it('esconde a escolha de meses quando só um mês está registrado', async () => {
    registrar('residencia', { energiaKwh: 1000 });
    await renderRouter(rotas, { initialUrl: '/plantio/2026-11' });

    expect(screen.queryByText('Quais meses simular?')).toBeNull();
    expect(screen.queryByText(/trocar os meses/)).toBeNull();
  });

  it('soma os meses escolhidos num plantio só, arredondando as árvores uma vez', async () => {
    // Energia × 0,0461: nov 1.000 kWh = 46,1 kg; out 1.000 = 46,1; set 2025 500 = 23,05.
    registrarMeses([
      { ano: 2026, mes: 11, energiaKwh: 1000 },
      { ano: 2026, mes: 10, energiaKwh: 1000 },
      { ano: 2025, mes: 9, energiaKwh: 500 },
    ]);
    await renderRouter(rotas, { initialUrl: '/plantio/2026-11' });

    await fireEvent.press(
      screen.getByRole('button', {
        name: 'Novembro de 2026. 46 kg CO₂e emitidos · trocar os meses',
      }),
    );
    // Atalhos: o mês aberto, o ano dele (há mais de um ano) e todos.
    expect(screen.getByRole('radio', { name: 'Só novembro' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Todo 2026' })).toBeTruthy();

    await fireEvent.press(screen.getByRole('radio', { name: 'Todo 2026' }));
    // 46,1 + 46,1 = 92,2 kg → 92 kg
    expect(screen.getByText('2 meses · 92 kg CO₂e')).toBeTruthy();
    expect(screen.getByText(/2 de 12 meses de 2026 registrados/)).toBeTruthy();

    await fireEvent.press(screen.getByRole('button', { name: 'Simular' }));

    // Pampa: 92,2 / 60,74 = 1,52 → 2 árvores (sobre o total, uma vez só).
    expect(screen.getByText('Para neutralizar esses 2 meses')).toBeTruthy();
    expect(screen.getByText('2 árvores')).toBeTruthy();
    // 2 × 60,74 = 121,48; 121,48 − 92,2 = 29,28 → +29 kg
    expect(screen.getByText('+29')).toBeTruthy();
    expect(
      screen.getByText('seriam retirados da atmosfera além do que você emitiu nesses 2 meses.'),
    ).toBeTruthy();
  });

  it('marca e desmarca meses na grade e não simula sem nenhum mês', async () => {
    registrarMeses([
      { ano: 2026, mes: 11, energiaKwh: 1000 },
      { ano: 2026, mes: 10, energiaKwh: 1000 },
    ]);
    await renderRouter(rotas, { initialUrl: '/plantio/2026-11' });

    await fireEvent.press(
      screen.getByRole('button', {
        name: 'Novembro de 2026. 46 kg CO₂e emitidos · trocar os meses',
      }),
    );
    // Um ano só: sem o atalho do ano.
    expect(screen.queryByRole('radio', { name: 'Todo 2026' })).toBeNull();
    expect(screen.getByRole('checkbox', { name: 'Março de 2026, sem registro' })).toBeDisabled();

    await fireEvent.press(
      screen.getByRole('checkbox', { name: 'Novembro de 2026, 46 kg de CO₂e' }),
    );
    expect(screen.getByText('Escolha ao menos um mês')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Simular' })).toBeDisabled();

    await fireEvent.press(screen.getByRole('radio', { name: 'Todos os meses' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Simular' }));

    expect(screen.getByText('Para neutralizar todos os meses registrados')).toBeTruthy();
  });

  it('mostra a área do plantio de restauração', async () => {
    registrar('residencia', { energiaKwh: 1000 });
    await renderRouter(rotas, { initialUrl: '/plantio/2026-11' });

    // 1 árvore × 6 m² = 6 m²
    expect(screen.getByText(/ocupariam cerca de 6 m²/)).toBeTruthy();
  });

  it('avisa quando o mês não tem registro', async () => {
    await renderRouter(rotas, { initialUrl: '/plantio/2026-01' });

    expect(screen.getByText('Nenhuma emissão neste mês')).toBeTruthy();
  });
});
