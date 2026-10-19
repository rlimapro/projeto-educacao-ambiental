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
import { useEffect } from 'react';

import { TemaProvider, useTema } from '@/ui/tema';

// A abertura do sistema fica visível até as fontes carregarem, para não
// mostrar texto com a fonte errada.
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

  useEffect(() => {
    if (pronto) {
      SplashScreen.hide();
    }
  }, [pronto]);

  if (!pronto) {
    return null;
  }

  return (
    <TemaProvider>
      <Navegacao />
    </TemaProvider>
  );
}
