import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icone, type NomeIcone } from './Icone';
import { medidas, useTema } from './tema';

type Props = {
  icone: NomeIcone;
  titulo: string;
  descricao: string;
  selecionada: boolean;
  onPress: () => void;
};

// Opção de escolha única em formato de cartão, com ícone, título e descrição.
// Use dentro de um View com accessibilityRole="radiogroup".
export function OpcaoCartao({ icone, titulo, descricao, selecionada, onPress }: Props) {
  const { cores, tipografia, espacamento, raios } = useTema();
  // A borda mais grossa na opção marcada é compensada no preenchimento, para
  // o conteúdo não pular de lugar ao trocar a seleção.
  const borda = selecionada ? medidas.bordaSelecionada : medidas.bordaCartao;

  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: selecionada }}
      accessibilityLabel={`${titulo}. ${descricao}`}
      onPress={onPress}
      style={({ pressed }) => [
        estilos.cartao,
        {
          gap: espacamento.p,
          padding: espacamento.m - (borda - medidas.bordaCartao),
          borderRadius: raios.cartao,
          borderWidth: borda,
          borderColor: selecionada ? cores.marcaForte : cores.borda,
          backgroundColor: cores.superficie,
          opacity: pressed ? medidas.opacidadePressionado : 1,
        },
      ]}
    >
      <View
        style={[
          estilos.circuloIcone,
          { borderRadius: raios.pilula, backgroundColor: cores.fundo },
        ]}
      >
        <Icone nome={icone} />
      </View>
      <View style={[estilos.textos, { gap: espacamento.mini }]}>
        <Text style={[tipografia.opcao, { color: cores.texto }]}>{titulo}</Text>
        <Text style={[tipografia.legenda, { color: cores.textoSuave }]}>{descricao}</Text>
      </View>
      <Icone
        nome={selecionada ? 'radioMarcado' : 'radioVazio'}
        cor={selecionada ? 'marcaForte' : 'textoSuave'}
      />
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  cartao: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  circuloIcone: {
    width: medidas.areaToqueMinima,
    height: medidas.areaToqueMinima,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textos: {
    flex: 1,
  },
});
