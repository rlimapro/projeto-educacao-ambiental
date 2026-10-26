import { StyleSheet, Text, View } from 'react-native';

import { medidas, useTema, type Cores } from './tema';

type Props = {
  cor: keyof Cores;
  nome: string;
  valor: string;
};

// Linha da legenda do anel: marcador na cor do segmento, nome e valor.
export function LinhaLegenda({ cor, nome, valor }: Props) {
  const { cores, tipografia, espacamento } = useTema();

  return (
    <View style={[estilos.linha, { gap: espacamento.p }]}>
      <View
        style={{
          width: medidas.marcadorLegenda,
          height: medidas.marcadorLegenda,
          borderRadius: medidas.raioMarcadorLegenda,
          backgroundColor: cores[cor],
        }}
      />
      <Text style={[estilos.nome, tipografia.linha, { color: cores.texto }]}>{nome}</Text>
      <Text style={[tipografia.numeroLinha, { color: cores.texto }]}>{valor}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  linha: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nome: {
    flex: 1,
  },
});
