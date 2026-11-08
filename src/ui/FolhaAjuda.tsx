import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { AjudaCampo } from './ajudaConsumo';
import { BotaoPrimario } from './BotaoPrimario';
import { margemTela, medidas, useTema } from './tema';
import { useReduzirMovimento } from './useReduzirMovimento';

type Props = {
  // Nula, a folha fica fechada.
  ajuda: AjudaCampo | null;
  aoFechar: () => void;
};

// Folha inferior com a ajuda de um campo: resumo, dicas e um exemplo em
// destaque. Mesma aparência das folhas de escolha de mês.
export function FolhaAjuda({ ajuda, aoFechar }: Props) {
  const { cores } = useTema();
  const reduzirMovimento = useReduzirMovimento();

  return (
    <Modal
      visible={ajuda !== null}
      transparent
      animationType={reduzirMovimento ? 'none' : 'fade'}
      onRequestClose={aoFechar}
    >
      <View style={[estilos.fundo, { backgroundColor: cores.veu }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Fechar ajuda"
          onPress={aoFechar}
          style={estilos.fora}
        />
        {ajuda ? <Conteudo ajuda={ajuda} aoFechar={aoFechar} /> : null}
      </View>
    </Modal>
  );
}

function Conteudo({ ajuda, aoFechar }: { ajuda: AjudaCampo; aoFechar: () => void }) {
  const { cores, tipografia, espacamento, raios } = useTema();
  const insets = useSafeAreaInsets();

  return (
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
          <Text style={[tipografia.rotulo, { color: cores.marcaForte }]}>Como preencher</Text>
          <Text
            accessibilityRole="header"
            style={[tipografia.tituloDetalhe, { color: cores.texto }]}
          >
            {ajuda.titulo}
          </Text>
        </View>

        <Text style={[tipografia.corpo, { color: cores.texto }]}>{ajuda.resumo}</Text>

        <View style={{ gap: espacamento.p }}>
          {ajuda.dicas.map((dica) => (
            <View key={dica} style={[estilos.dica, { gap: espacamento.p }]}>
              <View
                style={[
                  estilos.marcador,
                  { borderRadius: raios.pilula, backgroundColor: cores.marcaForte },
                ]}
              />
              <Text style={[estilos.textoDica, tipografia.linha, { color: cores.textoSuave }]}>
                {dica}
              </Text>
            </View>
          ))}
        </View>

        {ajuda.exemplo ? (
          <View
            style={{
              gap: espacamento.mini,
              padding: espacamento.m,
              borderRadius: raios.linha,
              backgroundColor: cores.fundo,
            }}
          >
            <Text style={[tipografia.rotulo, { color: cores.textoSuave }]}>Exemplo</Text>
            <Text style={[tipografia.item, { color: cores.texto }]}>{ajuda.exemplo}</Text>
          </View>
        ) : null}

        <BotaoPrimario rotulo="Entendi" onPress={aoFechar} />
      </ScrollView>
    </View>
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
    // Com fonte grande, a folha rola em vez de cobrir a tela toda.
    maxHeight: '85%',
  },
  dica: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  marcador: {
    width: medidas.marcadorDica,
    height: medidas.marcadorDica,
    // Alinha o ponto ao centro da primeira linha do texto (tipografia.linha).
    marginTop: medidas.margemMarcadorDica,
  },
  textoDica: {
    flex: 1,
  },
});
