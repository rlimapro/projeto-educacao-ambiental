import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { PreferenciaTema } from '@/dados/preferencias';

import { medidas, useTema } from './tema';

const opcoes: { valor: PreferenciaTema; rotulo: string }[] = [
  { valor: 'claro', rotulo: 'Claro' },
  { valor: 'escuro', rotulo: 'Escuro' },
  { valor: 'sistema', rotulo: 'Seguir o sistema' },
];

export function SeletorTema() {
  const { cores, tipografia, espacamento, raios, preferencia, definirPreferencia } = useTema();

  return (
    <View accessibilityRole="radiogroup" style={[estilos.grupo, { gap: espacamento.pp }]}>
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
                borderRadius: raios.pilula,
                paddingHorizontal: espacamento.m,
                borderWidth: medidas.bordaCartao,
                borderColor: selecionada ? cores.marca : cores.borda,
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
    flexWrap: 'wrap',
  },
  opcao: {
    minHeight: medidas.areaToqueMinima,
    justifyContent: 'center',
  },
});
