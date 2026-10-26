import { useEffect, useRef, useState } from 'react';
import { Animated, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { Icone, type NomeIcone } from './Icone';
import { medidas, useTema } from './tema';
import { useReduzirMovimento } from './useReduzirMovimento';

export type ItemNavegacao = {
  nome: string;
  rotulo: string;
  icone: NomeIcone;
};

type Props = {
  itens: ItemNavegacao[];
  ativo: string;
  aoTocar: (nome: string) => void;
  // Área da barra de gestos do sistema, somada ao respiro inferior.
  margemInferior: number;
};

// Mola quase sem repique, perto da usada pelo iOS (amortecimento de ~0,87).
const MOLA = { stiffness: 260, damping: 28, mass: 1 };
// Transformações rodam na thread nativa no iOS e no Android; a web não tem
// esse módulo e avisaria no console.
const DRIVER_NATIVO = Platform.OS !== 'web';

// Barra de navegação inferior com quatro itens (docs/design.md); o ativo tem o
// ícone sobre uma pílula marca e o rótulo em marcaForte. A pílula desliza até a
// aba tocada (ver "Movimento" em docs/design.md).
export function BarraNavegacao({ itens, ativo, aoTocar, margemInferior }: Props) {
  const { cores, tipografia, espacamento, raios } = useTema();
  const reduzirMovimento = useReduzirMovimento();
  const [largura, setLargura] = useState(0);
  const [deslocamento] = useState(() => new Animated.Value(0));
  const [contraDeslocamento] = useState(() => Animated.multiply(deslocamento, -1));
  const posicionada = useRef(false);

  const indiceAtivo = Math.max(
    0,
    itens.findIndex((item) => item.nome === ativo),
  );
  const larguraItem = itens.length > 0 ? largura / itens.length : 0;

  useEffect(() => {
    if (largura === 0) return;
    const destino = indiceAtivo * larguraItem + (larguraItem - medidas.larguraIndicadorAba) / 2;
    // Na primeira medida e com movimento reduzido, a pílula já aparece no lugar.
    if (!posicionada.current || reduzirMovimento) {
      posicionada.current = true;
      deslocamento.setValue(destino);
      return;
    }
    const animacao = Animated.spring(deslocamento, {
      toValue: destino,
      ...MOLA,
      useNativeDriver: DRIVER_NATIVO,
    });
    animacao.start();
    return () => animacao.stop();
  }, [indiceAtivo, largura, larguraItem, reduzirMovimento, deslocamento]);

  return (
    <View
      accessibilityRole="tablist"
      style={{
        paddingTop: espacamento.pp,
        paddingBottom: espacamento.m + margemInferior,
        paddingHorizontal: espacamento.p,
        borderTopWidth: medidas.bordaCartao,
        borderTopColor: cores.borda,
        backgroundColor: cores.superficie,
      }}
    >
      <View style={estilos.linha} onLayout={(e) => setLargura(e.nativeEvent.layout.width)}>
        {itens.map((item) => {
          const selecionado = item.nome === ativo;
          return (
            <Pressable
              key={item.nome}
              accessibilityRole="tab"
              accessibilityState={{ selected: selecionado }}
              accessibilityLabel={item.rotulo}
              onPress={() => aoTocar(item.nome)}
              style={[estilos.item, { gap: espacamento.mini }]}
            >
              <View style={estilos.indicador}>
                <Icone nome={item.icone} cor="textoSuave" fundo="superficie" />
              </View>
              <Text
                style={[
                  selecionado ? tipografia.miniForte : tipografia.mini,
                  { color: selecionado ? cores.marcaForte : cores.textoSuave },
                ]}
              >
                {item.rotulo}
              </Text>
            </Pressable>
          );
        })}

        {largura > 0 && (
          // A pílula funciona como uma lente: dentro dela, uma cópia dos ícones em
          // sobreMarca anda no sentido contrário e fica parada em relação à barra.
          // Assim o que está sob a pílula aparece escuro durante todo o trajeto.
          <Animated.View
            style={[
              estilos.pilula,
              {
                borderRadius: raios.pilula,
                backgroundColor: cores.marca,
                transform: [{ translateX: deslocamento }],
              },
            ]}
          >
            <Animated.View
              style={[
                estilos.lente,
                { width: largura, transform: [{ translateX: contraDeslocamento }] },
              ]}
            >
              {itens.map((item) => (
                <View key={item.nome} style={estilos.itemLente}>
                  <View style={estilos.indicador}>
                    <Icone nome={item.icone} cor="sobreMarca" fundo="marca" />
                  </View>
                </View>
              ))}
            </Animated.View>
          </Animated.View>
        )}
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  linha: {
    flexDirection: 'row',
  },
  item: {
    flex: 1,
    minHeight: medidas.areaToqueMinima,
    alignItems: 'center',
  },
  itemLente: {
    flex: 1,
    alignItems: 'center',
  },
  indicador: {
    width: medidas.larguraIndicadorAba,
    height: medidas.alturaIndicadorAba,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pilula: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: medidas.larguraIndicadorAba,
    height: medidas.alturaIndicadorAba,
    overflow: 'hidden',
    pointerEvents: 'none',
  },
  lente: {
    flexDirection: 'row',
    height: medidas.alturaIndicadorAba,
  },
});
