import { Redirect } from 'expo-router';
import { StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { boasVindasConcluidas } from '@/dados/preferencias';
import { margemTela, useTema } from '@/ui/tema';

export default function Inicio() {
  const { cores, tipografia, espacamento } = useTema();

  if (!boasVindasConcluidas()) {
    return <Redirect href="/boas-vindas" />;
  }

  // Provisória: o registro de consumos (RF01, RF02) ainda não existe.
  return (
    <SafeAreaView
      style={[
        estilos.tela,
        { backgroundColor: cores.fundo, paddingHorizontal: margemTela, gap: espacamento.pp },
      ]}
    >
      <Text accessibilityRole="header" style={[tipografia.titulo, { color: cores.texto }]}>
        Início
      </Text>
      <Text style={[tipografia.corpo, { color: cores.textoSuave }]}>
        Em breve você poderá registrar seus consumos aqui.
      </Text>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  tela: {
    flex: 1,
    justifyContent: 'center',
  },
});
