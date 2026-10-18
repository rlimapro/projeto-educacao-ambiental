import { Pressable, StyleSheet, Text } from 'react-native';

import { medidas, useTema } from './tema';

type Props = {
  rotulo: string;
  onPress: () => void;
  dica?: string;
};

// Botão secundário, sem preenchimento, para ações de menor peso como "Pular".
export function BotaoTexto({ rotulo, onPress, dica }: Props) {
  const { cores, tipografia, espacamento } = useTema();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityHint={dica}
      onPress={onPress}
      hitSlop={espacamento.pp}
      style={({ pressed }) => [
        estilos.base,
        {
          paddingHorizontal: espacamento.p,
          opacity: pressed ? medidas.opacidadePressionado : 1,
        },
      ]}
    >
      <Text style={[tipografia.item, { color: cores.marcaForte }]}>{rotulo}</Text>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  base: {
    minHeight: medidas.areaToqueMinima,
    minWidth: medidas.areaToqueMinima,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
