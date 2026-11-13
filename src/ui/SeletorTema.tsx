import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { PreferenciaTema } from '@/dados/preferencias';

import { medidas, useTema } from './tema';

const opcoes: { valor: PreferenciaTema; rotulo: string }[] = [
  { valor: 'claro', rotulo: 'Claro' },
  { valor: 'escuro', rotulo: 'Escuro' },
  { valor: 'sistema', rotulo: 'Sistema' },
];

export function SeletorTema() {
  const { cores, tipografia, espacamento, raios, preferencia, definirPreferencia } = useTema();

  return (
    <View
      accessibilityRole="radiogroup"
      accessibilityLabel="Aparência"
      style={[estilos.grupo, {
        gap: espacamento.mini,
        padding: espacamento.mini,
        borderRadius: raios.linha,
        borderWidth: medidas.bordaCartao,
        borderColor: cores.borda,
        backgroundColor: cores.superficie,
      }]}
    >
      {opcoes.map(({ valor, rotulo }) => {
        const selecionada = valor === preferencia;
        return (
          <Pressable
            key={valor}
            accessibilityRole="radio"
            accessibilityState={{ checked: selecionada }}
            onPress={() => definirPreferencia(valor)}
            style={({ pressed }) => [
              estilos.opcao,
              {
                borderRadius: raios.segmento,
                paddingHorizontal: espacamento.m,
                backgroundColor: selecionada ? cores.marca : cores.superficie,
                opacity: pressed ? medidas.opacidadePressionado : 1,
              },
            ]}
          >
            <Text style={[tipografia.item, { color: selecionada ? cores.sobreMarca : cores.texto }]}>
              {rotulo}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const estilos = StyleSheet.create({
  grupo: {
    flexDirection: 'row',
    width: '100%',
  },
  opcao: {
    flex: 1,
    minHeight: medidas.areaToqueMinima,
    justifyContent: 'center',
  },
});
