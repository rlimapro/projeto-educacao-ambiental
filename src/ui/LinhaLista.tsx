import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { medidas, useTema } from './tema';

type Props = {
  icone: ReactNode;
  rotulo: string;
};

// Linha de lista com ícone e texto, sem ação (por exemplo, as garantias de
// privacidade nas boas-vindas).
export function LinhaLista({ icone, rotulo }: Props) {
  const { cores, tipografia, espacamento, raios } = useTema();

  return (
    <View
      style={[
        estilos.linha,
        {
          gap: espacamento.p,
          paddingHorizontal: espacamento.m,
          paddingVertical: espacamento.p,
          borderRadius: raios.linha,
          borderWidth: medidas.bordaCartao,
          borderColor: cores.borda,
          backgroundColor: cores.superficie,
        },
      ]}
    >
      {icone}
      <Text style={[estilos.rotulo, tipografia.item, { color: cores.texto }]}>{rotulo}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  linha: {
    minHeight: medidas.alturaBotao,
    flexDirection: 'row',
    alignItems: 'center',
  },
  rotulo: {
    flexShrink: 1,
  },
});
