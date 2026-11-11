import { Pressable, StyleSheet } from 'react-native';

import { Icone } from './Icone';
import { medidas, useTema } from './tema';

type Props = {
  icone: 'menos' | 'mais';
  // Diz o que o botão faz, para leitores de tela ("Uma árvore a mais").
  rotulo: string;
  desativado?: boolean;
  onPress: () => void;
};

// Botão redondo só com ícone de − ou +, para mudar uma quantidade ou o zoom.
export function BotaoRedondo({ icone, rotulo, desativado = false, onPress }: Props) {
  const { cores, raios } = useTema();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={rotulo}
      accessibilityState={{ disabled: desativado }}
      disabled={desativado}
      onPress={onPress}
      style={({ pressed }) => [
        estilos.redondo,
        {
          borderRadius: raios.pilula,
          borderWidth: medidas.bordaCartao,
          borderColor: cores.borda,
          backgroundColor: cores.superficie,
          opacity: pressed ? medidas.opacidadePressionado : 1,
        },
      ]}
    >
      <Icone nome={icone} cor={desativado ? 'borda' : 'texto'} />
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  redondo: {
    width: medidas.alturaBotao,
    height: medidas.alturaBotao,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
