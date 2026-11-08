import { Stack } from 'expo-router';

import { useTema } from '@/ui/tema';

// Pilha da aba Início: a tela inicial e a memória de cálculo de cada fonte
// (RF04), que abre por cima dela sem esconder a barra de abas.
export default function LayoutInicio() {
  const { cores } = useTema();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: cores.fundo },
      }}
    />
  );
}
