import {
  IBMPlexSans_400Regular,
  IBMPlexSans_500Medium,
  IBMPlexSans_600SemiBold,
} from '@expo-google-fonts/ibm-plex-sans';
import {
  SpaceGrotesk_500Medium,
  SpaceGrotesk_600SemiBold,
  SpaceGrotesk_700Bold,
} from '@expo-google-fonts/space-grotesk';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AberturaAnimada } from '@/ui/AberturaAnimada';
import { TemaProvider, useTema } from '@/ui/tema';

// A abertura do sistema fica visível até as fontes carregarem, para não
// mostrar texto com a fonte errada. Depois, a AberturaAnimada assume a partir
// de um quadro idêntico a ela e anima por cima do app, que já carrega embaixo.
SplashScreen.preventAutoHideAsync();

function Navegacao() {
  const { cores, esquema } = useTema();

  useEffect(() => {
    SystemUI.setBackgroundColorAsync(cores.fundo);
  }, [cores.fundo]);

  return (
    <>
      <StatusBar style={esquema === 'escuro' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: cores.fundo },
        }}
      />
    </>
  );
}

export default function RootLayout() {
  const [fontesCarregadas, erroFontes] = useFonts({
    SpaceGrotesk_500Medium,
    SpaceGrotesk_600SemiBold,
    SpaceGrotesk_700Bold,
    IBMPlexSans_400Regular,
    IBMPlexSans_500Medium,
    IBMPlexSans_600SemiBold,
  });
  const pronto = fontesCarregadas || erroFontes !== null;
  const [abrindo, setAbrindo] = useState(true);
  const esconderAberturaNativa = useCallback(() => SplashScreen.hide(), []);
  const terminarAbertura = useCallback(() => setAbrindo(false), []);

  if (!pronto) {
    return null;
  }

  return (
    <TemaProvider>
      <View style={estilos.raiz}>
        <Navegacao />
        {abrindo ? (
          <AberturaAnimada aoMostrar={esconderAberturaNativa} aoTerminar={terminarAbertura} />
        ) : null}
      </View>
    </TemaProvider>
  );
}

const estilos = StyleSheet.create({
  raiz: {
    flex: 1,
  },
});
