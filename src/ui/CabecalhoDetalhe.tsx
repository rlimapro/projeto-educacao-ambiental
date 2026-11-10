import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icone } from './Icone';
import { medidas, useTema } from './tema';

type Props = {
  titulo: string;
};

// Cabeçalho das telas de detalhe da aba Início: seta de voltar e título. Sem
// tela anterior (aberta por um link direto), volta para a Início.
export function CabecalhoDetalhe({ titulo }: Props) {
  const { cores, tipografia, espacamento } = useTema();

  return (
    <View style={[estilos.cabecalho, { gap: espacamento.pp, minHeight: medidas.areaToqueMinima }]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Voltar"
        hitSlop={espacamento.p}
        onPress={() => (router.canGoBack() ? router.back() : router.navigate('/'))}
        style={({ pressed }) => ({ opacity: pressed ? medidas.opacidadePressionado : 1 })}
      >
        <Icone nome="voltar" cor="texto" />
      </Pressable>
      <Text
        accessibilityRole="header"
        style={[estilos.titulo, tipografia.tituloDetalhe, { color: cores.texto }]}
      >
        {titulo}
      </Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  cabecalho: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titulo: {
    flex: 1,
  },
});
