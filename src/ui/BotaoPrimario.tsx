import { Pressable, StyleSheet, Text } from 'react-native';

import { medidas, useTema } from './tema';

type Props = {
  rotulo: string;
  onPress: () => void;
  dica?: string;
};

export function BotaoPrimario({ rotulo, onPress, dica }: Props) {
  const { cores, tipografia, espacamento, raios } = useTema();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityHint={dica}
      onPress={onPress}
      style={({ pressed }) => [
        estilos.base,
        {
          backgroundColor: cores.marca,
          borderRadius: raios.cartao,
          paddingHorizontal: espacamento.gg,
          paddingVertical: espacamento.p,
          opacity: pressed ? medidas.opacidadePressionado : 1,
        },
      ]}
    >
      <Text style={[tipografia.botao, { color: cores.sobreMarca }]}>{rotulo}</Text>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  base: {
    minHeight: medidas.alturaBotao,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
