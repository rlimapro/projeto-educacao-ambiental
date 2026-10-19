import { Pressable, StyleSheet, Text, View } from 'react-native';

import { medidas, useTema } from './tema';

type Opcao<T extends string> = {
  valor: T;
  rotulo: string;
};

type Props<T extends string> = {
  rotulo: string;
  opcoes: Opcao<T>[];
  valor: T;
  aoMudar: (valor: T) => void;
};

// Escolha única entre poucas opções curtas, lado a lado (por exemplo, Mês ou Ano).
export function SeletorSegmentado<T extends string>({ rotulo, opcoes, valor, aoMudar }: Props<T>) {
  const { cores, tipografia, espacamento, raios } = useTema();

  return (
    <View style={{ gap: espacamento.pp }}>
      <Text style={[tipografia.rotulo, { color: cores.textoSuave }]}>{rotulo}</Text>
      <View
        accessibilityRole="radiogroup"
        accessibilityLabel={rotulo}
        style={[
          estilos.trilho,
          {
            gap: espacamento.mini,
            padding: espacamento.mini,
            borderRadius: raios.linha,
            borderWidth: medidas.bordaCartao,
            borderColor: cores.borda,
            backgroundColor: cores.superficie,
          },
        ]}
      >
        {opcoes.map((opcao) => {
          const selecionada = opcao.valor === valor;
          return (
            <Pressable
              key={opcao.valor}
              accessibilityRole="radio"
              accessibilityState={{ checked: selecionada }}
              onPress={() => aoMudar(opcao.valor)}
              style={[
                estilos.opcao,
                {
                  borderRadius: raios.segmento,
                  backgroundColor: selecionada ? cores.marca : 'transparent',
                },
              ]}
            >
              <Text
                style={[
                  selecionada ? tipografia.itemForte : tipografia.item,
                  { color: selecionada ? cores.sobreMarca : cores.textoSuave },
                ]}
              >
                {opcao.rotulo}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  trilho: {
    flexDirection: 'row',
  },
  opcao: {
    flex: 1,
    minHeight: medidas.areaToqueMinima,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
