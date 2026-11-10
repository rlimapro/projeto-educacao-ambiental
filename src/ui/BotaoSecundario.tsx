import { Pressable, StyleSheet, Text } from 'react-native';

import { medidas, useTema } from './tema';

type Props = {
  rotulo: string;
  onPress: () => void;
};

// Botão de ação secundária em destaque, como "Ver como reduzir": superfície com
// borda, mais leve que o BotaoPrimario.
export function BotaoSecundario({ rotulo, onPress }: Props) {
  const { cores, tipografia, raios } = useTema();

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        estilos.base,
        {
          borderRadius: raios.cartao,
          borderWidth: medidas.bordaCartao,
          borderColor: cores.borda,
          backgroundColor: cores.superficie,
          opacity: pressed ? medidas.opacidadePressionado : 1,
        },
      ]}
    >
      <Text style={[tipografia.itemForte, { color: cores.texto }]}>{rotulo}</Text>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  base: {
    minHeight: medidas.alturaCampo,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
