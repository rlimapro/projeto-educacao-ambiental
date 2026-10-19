import { router } from 'expo-router';
import { useRef, useState, type ReactNode } from 'react';
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

import type { PeriodoReferencia, Perfil } from '@/calculo/tipos';
import {
  PERFIL_PADRAO,
  PERIODO_PADRAO,
  marcarBoasVindasConcluidas,
  salvarPerfil,
  salvarPeriodo,
} from '@/dados/preferencias';
import { BotaoPrimario } from '@/ui/BotaoPrimario';
import { BotaoTexto } from '@/ui/BotaoTexto';
import { Icone } from '@/ui/Icone';
import { Ilustracao, type NomeIlustracao } from '@/ui/Ilustracao';
import { LinhaLista } from '@/ui/LinhaLista';
import { OpcaoCartao } from '@/ui/OpcaoCartao';
import { SeletorSegmentado } from '@/ui/SeletorSegmentado';
import { margemTela, medidas, useTema } from '@/ui/tema';
import { useReduzirMovimento } from '@/ui/useReduzirMovimento';

// Textos e regras revisados em docs/boas-vindas.md (RF12). Layout segue o
// protótipo no Figma ("Boas-vindas · O app", "Privacidade" e "Perfil").

type Pagina = {
  chave: string;
  ilustracao?: NomeIlustracao;
  titulo: string;
  texto: string;
};

const paginas: Pagina[] = [
  {
    chave: 'o-app',
    ilustracao: 'anel',
    titulo: 'Descubra quanto você emite.',
    texto:
      'Registre seus consumos de energia, combustível e gás. O app calcula suas emissões e mostra quantas árvores as neutralizariam.',
  },
  {
    chave: 'conta',
    ilustracao: 'conta',
    titulo: 'Uma conta que você pode conferir.',
    texto:
      'Cada consumo é multiplicado por um fator de emissão de fonte oficial. O app mostra a conta inteira: quanto você usou, o fator e de onde ele veio.',
  },
  {
    chave: 'privacidade',
    ilustracao: 'cadeado',
    titulo: 'Seus dados ficam neste aparelho.',
    texto: 'Nada é enviado a servidores. Sem conta, sem login, sem compartilhamento.',
  },
  {
    chave: 'perfil',
    titulo: 'Para quem é o cálculo?',
    texto: 'Isso define quais consumos aparecem para preencher. Você pode mudar depois em Ajustes.',
  },
];

const ultima = paginas.length - 1;

const opcoesPerfil: { valor: Perfil; titulo: string; descricao: string }[] = [
  { valor: 'pessoa', titulo: 'Para mim', descricao: 'Deslocamentos e consumo pessoal' },
  { valor: 'residencia', titulo: 'Minha residência', descricao: 'Energia, gás e veículos da casa' },
  { valor: 'comercio', titulo: 'Meu comércio', descricao: 'Energia, gás, combustível e entregas' },
];

const opcoesPeriodo: { valor: PeriodoReferencia; rotulo: string }[] = [
  { valor: 'mes', rotulo: 'Mês' },
  { valor: 'ano', rotulo: 'Ano' },
];

function doisDigitos(numero: number): string {
  return String(numero).padStart(2, '0');
}

export default function BoasVindas() {
  const { cores, tipografia, espacamento } = useTema();
  const { width: largura } = useWindowDimensions();
  const reduzirMovimento = useReduzirMovimento();
  const lista = useRef<FlatList<Pagina>>(null);
  const [atual, setAtual] = useState(0);
  // Altura medida da lista: cada página ocupa toda ela, para a ilustração
  // ficar centralizada no espaço livre acima do texto, como no protótipo.
  const [alturaLista, setAlturaLista] = useState(0);
  const [perfil, setPerfil] = useState<Perfil>(PERFIL_PADRAO);
  const [periodo, setPeriodo] = useState<PeriodoReferencia>(PERIODO_PADRAO);

  function irPara(indice: number) {
    lista.current?.scrollToIndex({ index: indice, animated: !reduzirMovimento });
    setAtual(indice);
  }

  function aoTerminarRolagem(evento: NativeSyntheticEvent<NativeScrollEvent>) {
    setAtual(Math.round(evento.nativeEvent.contentOffset.x / largura));
  }

  function comecar() {
    salvarPerfil(perfil);
    salvarPeriodo(periodo);
    marcarBoasVindasConcluidas();
    router.replace('/');
  }

  function conteudoExtra(pagina: Pagina): ReactNode {
    if (pagina.chave === 'privacidade') {
      return (
        <View style={{ gap: espacamento.pp }}>
          <LinhaLista icone={<Icone nome="semInternet" />} rotulo="Funciona sem internet" />
          <LinhaLista icone={<Icone nome="semCadastro" />} rotulo="Sem cadastro nem login" />
          <LinhaLista icone={<Icone nome="backup" />} rotulo="Backup só quando você pedir" />
        </View>
      );
    }
    if (pagina.chave === 'perfil') {
      return (
        <>
          <View accessibilityRole="radiogroup" style={{ gap: espacamento.p }}>
            {opcoesPerfil.map((opcao) => (
              <OpcaoCartao
                key={opcao.valor}
                icone={opcao.valor}
                titulo={opcao.titulo}
                descricao={opcao.descricao}
                selecionada={perfil === opcao.valor}
                onPress={() => setPerfil(opcao.valor)}
              />
            ))}
          </View>
          <SeletorSegmentado
            rotulo="Período de referência"
            opcoes={opcoesPeriodo}
            valor={periodo}
            aoMudar={setPeriodo}
          />
        </>
      );
    }
    return null;
  }

  return (
    <SafeAreaView style={[estilos.tela, { backgroundColor: cores.fundo }]}>
      <View
        style={[
          estilos.topo,
          {
            minHeight: medidas.areaToqueMinima,
            marginTop: espacamento.m,
            paddingLeft: margemTela,
            paddingRight: margemTela - espacamento.p,
          },
        ]}
      >
        <Text
          accessibilityLabel={`Tela ${atual + 1} de ${paginas.length}`}
          style={[tipografia.contador, { color: cores.textoSuave }]}
        >
          {`${doisDigitos(atual + 1)} / ${doisDigitos(paginas.length)}`}
        </Text>
        {atual < ultima && <BotaoTexto rotulo="Pular" onPress={() => irPara(ultima)} />}
      </View>

      <FlatList
        ref={lista}
        style={estilos.lista}
        onLayout={(evento) => setAlturaLista(evento.nativeEvent.layout.height)}
        data={paginas}
        keyExtractor={(pagina) => pagina.chave}
        horizontal
        pagingEnabled
        bounces={false}
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={aoTerminarRolagem}
        getItemLayout={(_, indice) => ({ length: largura, offset: largura * indice, index: indice })}
        renderItem={({ item }) => (
          <ScrollView
            style={{ width: largura, height: alturaLista || undefined }}
            contentContainerStyle={[
              estilos.pagina,
              {
                paddingHorizontal: margemTela,
                paddingTop: espacamento.m,
                gap: item.ilustracao ? espacamento.m : espacamento.g,
              },
            ]}
          >
            {item.ilustracao && (
              <View style={estilos.areaIlustracao}>
                <Ilustracao nome={item.ilustracao} />
              </View>
            )}
            <View style={{ gap: espacamento.pp }}>
              <Text accessibilityRole="header" style={[tipografia.titulo, { color: cores.texto }]}>
                {item.titulo}
              </Text>
              <Text style={[tipografia.corpo, { color: cores.textoSuave }]}>{item.texto}</Text>
            </View>
            {conteudoExtra(item)}
          </ScrollView>
        )}
      />

      <View
        style={{
          paddingHorizontal: margemTela,
          paddingTop: espacamento.m,
          paddingBottom: espacamento.xg,
        }}
      >
        {atual < ultima ? (
          <BotaoPrimario rotulo="Continuar" onPress={() => irPara(atual + 1)} />
        ) : (
          <BotaoPrimario rotulo="Começar" onPress={comecar} />
        )}
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
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lista: {
    flex: 1,
  },
  pagina: {
    flexGrow: 1,
  },
  areaIlustracao: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
