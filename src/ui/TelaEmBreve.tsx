import { StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { margemTela, useTema } from './tema';

// Tela provisória para abas que ainda não foram implementadas.
export function TelaEmBreve({ titulo, texto }: { titulo: string; texto: string }) {
  const { cores, tipografia, espacamento } = useTema();

  return (
    <SafeAreaView
      edges={['top']}
      style={[
        estilos.tela,
        { backgroundColor: cores.fundo, paddingHorizontal: margemTela, gap: espacamento.pp },
      ]}
    >
      <Text accessibilityRole="header" style={[tipografia.titulo, { color: cores.texto }]}>
        {titulo}
      </Text>
      <Text style={[tipografia.corpo, { color: cores.textoSuave }]}>{texto}</Text>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  tela: {
    flex: 1,
    justifyContent: 'center',
  },
});
