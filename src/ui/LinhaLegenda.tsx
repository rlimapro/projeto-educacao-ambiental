import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icone } from './Icone';
import { medidas, useTema, type Cores } from './tema';

type Props = {
  cor: keyof Cores;
  nome: string;
  valor: string;
  // Com ação, a linha vira um botão com seta, como na Início, onde abre a
  // memória de cálculo da fonte (RF04).
  onPress?: () => void;
};

// Linha da legenda do anel: marcador na cor do segmento, nome e valor.
export function LinhaLegenda({ cor, nome, valor, onPress }: Props) {
  const { cores, tipografia, espacamento } = useTema();

  const conteudo = (
    <>
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
    </>
  );

  if (!onPress) {
    return <View style={[estilos.linha, { gap: espacamento.p }]}>{conteudo}</View>;
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${nome}: ${valor}`}
      accessibilityHint="Mostra como esse número foi calculado"
      onPress={onPress}
      style={({ pressed }) => [
        estilos.linha,
        {
          gap: espacamento.p,
          minHeight: medidas.areaToqueMinima,
          opacity: pressed ? medidas.opacidadePressionado : 1,
        },
      ]}
    >
      {conteudo}
      <Icone nome="abrir" cor="textoSuave" />
    </Pressable>
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
