import { Redirect } from 'expo-router';
import { Tabs, type BottomTabBarProps } from 'expo-router/tabs';

import { boasVindasConcluidas } from '@/dados/preferencias';
import { BarraNavegacao, type ItemNavegacao } from '@/ui/BarraNavegacao';
import { useTema } from '@/ui/tema';

const itens: ItemNavegacao[] = [
  { nome: 'index', rotulo: 'Início', icone: 'navInicio' },
  { nome: 'registrar', rotulo: 'Registrar', icone: 'navRegistrar' },
  { nome: 'historico', rotulo: 'Histórico', icone: 'navHistorico' },
  { nome: 'ajustes', rotulo: 'Ajustes', icone: 'navAjustes' },
];

function Barra({ state, emitter, navigateToTab, insets }: BottomTabBarProps) {
  const ativo = state.routes[state.index]?.name ?? 'index';

  function aoTocar(nome: string) {
    const rota = state.routes.find((r) => r.name === nome);
    if (!rota) return;
    const evento = emitter.emit({ type: 'tabPress', target: rota.key, canPreventDefault: true });
    if (nome !== ativo && !evento.defaultPrevented) {
      navigateToTab(rota.key);
    }
  }

  return (
    <BarraNavegacao itens={itens} ativo={ativo} aoTocar={aoTocar} margemInferior={insets.bottom} />
  );
}

export default function LayoutAbas() {
  const { cores } = useTema();

  // Nenhuma aba abre antes das boas-vindas (RF12).
  if (!boasVindasConcluidas()) {
    return <Redirect href="/boas-vindas" />;
  }

  return (
    <Tabs
      tabBar={(props) => <Barra {...props} />}
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: cores.fundo } }}
    >
      {itens.map((item) => (
        <Tabs.Screen key={item.nome} name={item.nome} options={{ title: item.rotulo }} />
      ))}
    </Tabs>
  );
}
