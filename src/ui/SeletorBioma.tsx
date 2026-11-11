import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { TaxaSequestroBioma } from '@/calculo/tipos';

import { formatarDecimal } from './formatacao';
import { OpcaoCartao } from './OpcaoCartao';
import { margemTela, useTema } from './tema';
import { useReduzirMovimento } from './useReduzirMovimento';

type Props = {
  visivel: boolean;
  taxas: TaxaSequestroBioma[];
  selecionada: string;
  aoEscolher: (id: string) => void;
  aoFechar: () => void;
};

// Folha inferior para escolher o bioma do plantio (RF06). Cada opção mostra
// quanto uma árvore removeria por ano naquele bioma.
export function SeletorBioma({ visivel, taxas, selecionada, aoEscolher, aoFechar }: Props) {
  const { cores, tipografia, espacamento, raios } = useTema();
  const reduzirMovimento = useReduzirMovimento();
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visivel}
      transparent
      animationType={reduzirMovimento ? 'none' : 'fade'}
      onRequestClose={aoFechar}
    >
      <View style={[estilos.fundo, { backgroundColor: cores.veu }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Fechar escolha de bioma"
          onPress={aoFechar}
          style={estilos.fora}
        />
        <View
          style={[
            estilos.folha,
            {
              backgroundColor: cores.superficie,
              borderTopLeftRadius: raios.cartao,
              borderTopRightRadius: raios.cartao,
            },
          ]}
        >
          <ScrollView
            contentContainerStyle={{
              paddingHorizontal: margemTela,
              paddingTop: espacamento.gg,
              paddingBottom: espacamento.gg + insets.bottom,
              gap: espacamento.m,
            }}
          >
            <View style={{ gap: espacamento.mini }}>
              <Text
                accessibilityRole="header"
                style={[tipografia.tituloDetalhe, { color: cores.texto }]}
              >
                Onde as mudas seriam plantadas?
              </Text>
              <Text style={[tipografia.legenda, { color: cores.textoSuave }]}>
                Cada bioma cresce num ritmo. Sem escolha, o app usa o mais lento, para não prometer
                demais.
              </Text>
            </View>
            <View accessibilityRole="radiogroup" style={{ gap: espacamento.p }}>
              {taxas.map((taxa) => (
                <OpcaoCartao
                  key={taxa.id}
                  icone="arvore"
                  titulo={taxa.biomas}
                  descricao={`${formatarDecimal(taxa.valorKgCo2PorArvorePorAno)} kg CO₂ por árvore por ano`}
                  selecionada={taxa.id === selecionada}
                  onPress={() => aoEscolher(taxa.id)}
                />
              ))}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const estilos = StyleSheet.create({
  fundo: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  fora: {
    flex: 1,
  },
  folha: {
    maxHeight: '85%',
  },
});
