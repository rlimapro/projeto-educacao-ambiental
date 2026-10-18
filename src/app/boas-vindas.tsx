import { router } from 'expo-router';
import { useRef, useState } from 'react';
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { marcarBoasVindasConcluidas } from '@/dados/preferencias';
import { BotaoPrimario } from '@/ui/BotaoPrimario';
import { BotaoTexto } from '@/ui/BotaoTexto';
import { Icone, type NomeIcone } from '@/ui/Icone';
import { SeletorTema } from '@/ui/SeletorTema';
import { margemTela, medidas, useTema } from '@/ui/tema';
import { useReduzirMovimento } from '@/ui/useReduzirMovimento';

// Textos revisados em docs/boas-vindas.md (RF12).
type Pagina = {
  icone: NomeIcone;
  titulo: string;
  texto: string;
};

const paginas: Pagina[] = [
  {
    icone: 'nuvem',
    titulo: 'Quanto você emite?',
    texto:
      'Registre o que você consome, como energia, combustível e gás de cozinha, e descubra as emissões que vêm disso. Vale para você, para sua casa ou para seu comércio.',
  },
  {
    icone: 'calculadora',
    titulo: 'Uma conta que você pode conferir',
    texto:
      'Cada consumo é multiplicado por um fator de emissão, como manda a norma ISO 14064. O app mostra a conta inteira: quanto você usou, o fator aplicado e de onde ele veio.',
  },
  {
    icone: 'queda',
    titulo: 'Primeiro reduzir, depois compensar',
    texto:
      'O app mostra de onde vem a maior parte das suas emissões e sugere como diminuí-las. Só depois estima quantas árvores neutralizariam o que sobrar.',
  },
  {
    icone: 'cadeado',
    titulo: 'Seus dados ficam com você',
    texto:
      'Funciona sem internet, sem conta e sem cadastro. Nada sai do seu celular, a não ser um backup que você mesmo decida exportar.',
  },
  {
    icone: 'contraste',
    titulo: 'Como prefere ver o app?',
    texto: 'Você pode mudar isso depois em Ajustes.',
  },
];

const ultima = paginas.length - 1;
const TAMANHO_ICONE = 64;

export default function BoasVindas() {
  const { cores, tipografia, espacamento, raios } = useTema();
  const { width: largura } = useWindowDimensions();
  const reduzirMovimento = useReduzirMovimento();
  const lista = useRef<FlatList<Pagina>>(null);
  const [atual, setAtual] = useState(0);

  function irPara(indice: number) {
    lista.current?.scrollToIndex({ index: indice, animated: !reduzirMovimento });
    setAtual(indice);
  }

  function aoTerminarRolagem(evento: NativeSyntheticEvent<NativeScrollEvent>) {
    setAtual(Math.round(evento.nativeEvent.contentOffset.x / largura));
  }

  function comecar() {
    marcarBoasVindasConcluidas();
    router.replace('/');
  }

  return (
    <SafeAreaView style={[estilos.tela, { backgroundColor: cores.fundo }]}>
      <View
        style={[
          estilos.topo,
          { paddingHorizontal: margemTela - espacamento.p, minHeight: medidas.areaToqueMinima },
        ]}
      >
        {atual < ultima && <BotaoTexto rotulo="Pular" onPress={() => irPara(ultima)} />}
      </View>

      <FlatList
        ref={lista}
        data={paginas}
        keyExtractor={(pagina) => pagina.icone}
        horizontal
        pagingEnabled
        bounces={false}
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={aoTerminarRolagem}
        getItemLayout={(_, indice) => ({ length: largura, offset: largura * indice, index: indice })}
        renderItem={({ item, index }) => (
          <ScrollView
            style={{ width: largura }}
            contentContainerStyle={[
              estilos.pagina,
              { paddingHorizontal: margemTela, gap: espacamento.m },
            ]}
          >
            <Icone nome={item.icone} tamanho={TAMANHO_ICONE} />
            <Text accessibilityRole="header" style={[tipografia.titulo, { color: cores.texto }]}>
              {item.titulo}
            </Text>
            <Text style={[tipografia.corpo, { color: cores.textoSuave }]}>{item.texto}</Text>
            {index === ultima && (
              <View style={{ marginTop: espacamento.pp }}>
                <SeletorTema />
              </View>
            )}
          </ScrollView>
        )}
      />

      <View style={{ paddingHorizontal: margemTela, paddingBottom: espacamento.m, gap: espacamento.m }}>
        <View
          accessible
          accessibilityLabel={`Tela ${atual + 1} de ${paginas.length}`}
          style={[estilos.indicador, { gap: espacamento.pp }]}
        >
          {paginas.map((pagina, indice) => (
            <View
              key={pagina.icone}
              style={{
                height: espacamento.pp,
                width: indice === atual ? espacamento.gg : espacamento.pp,
                borderRadius: raios.pilula,
                backgroundColor: indice === atual ? cores.marcaForte : cores.borda,
              }}
            />
          ))}
        </View>

        <View style={[estilos.botoes, { gap: espacamento.p }]}>
          <View style={estilos.voltar}>
            {atual > 0 && <BotaoTexto rotulo="Voltar" onPress={() => irPara(atual - 1)} />}
          </View>
          <View style={estilos.avancar}>
            {atual < ultima ? (
              <BotaoPrimario rotulo="Próximo" onPress={() => irPara(atual + 1)} />
            ) : (
              <BotaoPrimario rotulo="Começar" onPress={comecar} />
            )}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  tela: {
    flex: 1,
  },
  topo: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  pagina: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  indicador: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  botoes: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  voltar: {
    flexShrink: 0,
  },
  avancar: {
    flex: 1,
  },
});
