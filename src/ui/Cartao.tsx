import type { ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';

import { medidas, useTema } from './tema';

type Props = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function Cartao({ children, style }: Props) {
  const { cores, espacamento, raios } = useTema();

  return (
    <View
      style={[
        {
          padding: espacamento.m,
          borderRadius: raios.cartao,
          backgroundColor: cores.superficie,
          borderWidth: medidas.bordaCartao,
          borderColor: cores.borda,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
