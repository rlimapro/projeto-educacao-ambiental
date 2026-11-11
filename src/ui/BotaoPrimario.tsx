import { Pressable, StyleSheet, Text } from 'react-native';

import { medidas, useTema } from './tema';

type Props = {
  rotulo: string;
  onPress: () => void;
  dica?: string;
  // Desativado, perde o verde-limão para não parecer tocável.
  desativado?: boolean;
};

export function BotaoPrimario({ rotulo, onPress, dica, desativado = false }: Props) {
  const { cores, tipografia, espacamento, raios } = useTema();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityHint={dica}
      accessibilityState={{ disabled: desativado }}
      disabled={desativado}
      onPress={onPress}
      style={({ pressed }) => [
        estilos.base,
        {
          backgroundColor: desativado ? cores.trilhaAnel : cores.marca,
          borderRadius: raios.cartao,
          paddingHorizontal: espacamento.gg,
          paddingVertical: espacamento.p,
          opacity: pressed ? medidas.opacidadePressionado : 1,
        },
      ]}
    >
      <Text style={[tipografia.botao, { color: desativado ? cores.textoSuave : cores.sobreMarca }]}>
        {rotulo}
      </Text>
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
