import { StyleSheet, Text, View } from 'react-native';

import { Cartao } from './Cartao';
import { useTema, type Cores } from './tema';

type Props = {
  rotulo: string;
  numero: string;
  // Texto ao lado do número, como "árvores".
  unidade?: string;
  nota: string;
  corNumero?: keyof Cores;
};

// Cartão com um número em destaque, como "Para neutralizar: 2 árvores".
export function CartaoNumero({ rotulo, numero, unidade, nota, corNumero = 'texto' }: Props) {
  const { cores, tipografia, espacamento } = useTema();

  return (
    <Cartao style={[estilos.cartao, { gap: espacamento.pp }]}>
      <Text style={[tipografia.legenda, { color: cores.textoSuave }]}>{rotulo}</Text>
      <View style={[estilos.valor, { gap: espacamento.pp }]}>
        <Text style={[tipografia.numeroCartao, { color: cores[corNumero] }]}>{numero}</Text>
        {unidade && <Text style={[tipografia.item, { color: cores.texto }]}>{unidade}</Text>}
      </View>
      <Text style={[tipografia.nota, { color: cores.textoSuave }]}>{nota}</Text>
    </Cartao>
  );
}

const estilos = StyleSheet.create({
  cartao: {
    flex: 1,
  },
  valor: {
    flexDirection: 'row',
    alignItems: 'baseline',
    flexWrap: 'wrap',
  },
});
