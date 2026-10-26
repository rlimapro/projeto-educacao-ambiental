import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icone, type NomeIcone } from './Icone';
import { medidas, useTema } from './tema';

type Props = {
  icone: NomeIcone;
  titulo: string;
  descricao: string;
  // Sem ação, a linha aparece desativada (a tela de destino ainda não existe).
  onPress?: () => void;
};

// Cartão em linha que leva a outra tela, com ícone, título, descrição e seta.
export function LinhaAcao({ icone, titulo, descricao, onPress }: Props) {
  const { cores, tipografia, espacamento, raios } = useTema();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${titulo}. ${descricao}`}
      accessibilityState={{ disabled: !onPress }}
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => [
        estilos.linha,
        {
          gap: espacamento.p,
          paddingHorizontal: espacamento.m,
          paddingVertical: espacamento.p,
          borderRadius: raios.cartao,
          borderWidth: medidas.bordaCartao,
          borderColor: cores.borda,
          backgroundColor: cores.superficie,
          opacity: pressed ? medidas.opacidadePressionado : 1,
        },
      ]}
    >
      <Icone nome={icone} />
      <View style={[estilos.textos, { gap: espacamento.mini }]}>
        <Text style={[tipografia.itemForte, { color: cores.texto }]}>{titulo}</Text>
        <Text style={[tipografia.legenda, { color: cores.textoSuave }]}>{descricao}</Text>
      </View>
      <Icone nome="abrir" cor="textoSuave" />
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  linha: {
    minHeight: medidas.alturaBotao,
    flexDirection: 'row',
    alignItems: 'center',
  },
  textos: {
    flex: 1,
  },
});
