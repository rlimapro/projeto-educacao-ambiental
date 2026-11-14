import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  HORIZONTE_ANOS,
  TAXA_SEQUESTRO_SEM_ESTADO,
  arvoresParaNeutralizar,
} from '@/calculo/arvores';
import { compararPeriodos, resumirEmissoes } from '@/calculo/resumo';
import { agruparSugestoes } from '@/calculo/sugestoes';
import { listarPeriodos } from '@/dados/periodos';
import { lerPerfil } from '@/dados/preferencias';
import { AnelEmissoes } from '@/ui/AnelEmissoes';
import { BotaoPrimario } from '@/ui/BotaoPrimario';
import { Cartao } from '@/ui/Cartao';
import { CartaoNumero } from '@/ui/CartaoNumero';
import { Etiqueta } from '@/ui/Etiqueta';
import { Ilustracao } from '@/ui/Ilustracao';
import {
  formatarEmissaoComUnidade,
  formatarParticipacao,
  formatarVariacao,
  nomeDoMes,
  nomeDoPerfil,
} from '@/ui/formatacao';
import { Icone } from '@/ui/Icone';
import { LinhaAcao } from '@/ui/LinhaAcao';
import { LinhaLegenda } from '@/ui/LinhaLegenda';
import { SeletorPeriodo } from '@/ui/SeletorPeriodo';
import { margemTela, medidas, useTema, type Cores } from '@/ui/tema';

// Tela inicial (RF03, RF05, RF07, RF08). Layout segue o protótipo no Figma
// ("04 Início") e usa apenas períodos registrados no aparelho. Tocar numa fonte
// da legenda abre a memória de cálculo dela (RF04). O parâmetro `periodo`
// (AAAA-MM) abre a tela num mês, como depois de registrar um consumo.

const CORES_FONTES: (keyof Cores)[] = ['grafico1', 'grafico2', 'grafico3'];

export default function Inicio() {
  const { cores, tipografia, espacamento } = useTema();
  const [estadoPeriodos, setEstadoPeriodos] = useState(() => {
    try {
      return { periodos: listarPeriodos(), erro: false };
    } catch {
      return { periodos: [], erro: true };
    }
  });
  const { periodos, erro } = estadoPeriodos;
  const { periodo: periodoPedido } = useLocalSearchParams<{ periodo?: string }>();
  // Sem escolha, ou se o mês escolhido deixar de existir, mostra o mais recente.
  const [idSelecionado, setIdSelecionado] = useState(periodoPedido ?? null);
  const [escolhendoPeriodo, setEscolhendoPeriodo] = useState(false);

  // Relê os registros a cada volta à tela. O mês escolhido é mantido, para quem
  // abriu a memória de cálculo voltar ao mesmo mês.
  useFocusEffect(
    useCallback(() => {
      try {
        setEstadoPeriodos({ periodos: listarPeriodos(), erro: false });
      } catch {
        setEstadoPeriodos({ periodos: [], erro: true });
      }
      if (periodoPedido) {
        setIdSelecionado(periodoPedido);
        router.setParams({ periodo: undefined });
      }
    }, [periodoPedido]),
  );

  if (erro) {
    return (
      <SafeAreaView
        edges={['top']}
        style={[estilos.vazio, { backgroundColor: cores.fundo, paddingHorizontal: margemTela }]}
      >
        <Cartao style={{ gap: espacamento.m }}>
          <Text accessibilityRole="header" style={[tipografia.subtitulo, { color: cores.texto }]}>
            Não foi possível abrir seus registros
          </Text>
          <Text style={[tipografia.corpo, { color: cores.textoSuave }]}>
            Os dados salvos não foram alterados. Tente novamente ao registrar um consumo.
          </Text>
          <BotaoPrimario rotulo="Registrar consumo" onPress={() => router.navigate('/registrar')} />
        </Cartao>
      </SafeAreaView>
    );
  }

  if (periodos.length === 0) {
    return <InicioSemRegistros />;
  }

  const indice = Math.max(
    0,
    periodos.findIndex((p) => p.id === idSelecionado),
  );
  const periodo = periodos[indice];
  const anterior = periodos[indice + 1];
  const resumo = resumirEmissoes(periodo.fontes);
  const comparacao = anterior
    ? compararPeriodos(resumo.totalKgCo2e, resumirEmissoes(anterior.fontes).totalKgCo2e)
    : null;
  const arvores = arvoresParaNeutralizar(resumo.totalKgCo2e, TAXA_SEQUESTRO_SEM_ESTADO);
  // Grupo de fontes que mais emitiu, com suas sugestões (RF08).
  const focoReducao = agruparSugestoes(periodo.fontes, periodo.perfil)[0];
  const mesAtual = indice === 0;
  const nomeMes = nomeDoMes(periodo.mes);
  const titulo = `${nomeDoMes(periodo.mes, true)} ${periodo.ano}`;

  const descricaoAnel =
    `Emissões de ${nomeMes} de ${periodo.ano}: ${formatarEmissaoComUnidade(resumo.totalKgCo2e)} de CO₂e. ` +
    resumo.fontes.map((f) => `${f.nome} ${formatarParticipacao(f.fracao)}`).join(', ') +
    '.';

  function escolherPeriodo(id: string) {
    setIdSelecionado(id);
    setEscolhendoPeriodo(false);
  }

  return (
    <SafeAreaView edges={['top']} style={[estilos.tela, { backgroundColor: cores.fundo }]}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: margemTela,
          paddingVertical: espacamento.m,
          gap: espacamento.m,
        }}
      >
        <View style={[estilos.topo, { minHeight: medidas.areaToqueMinima }]}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Período: ${titulo}`}
            accessibilityHint="Abre a lista de meses"
            onPress={() => setEscolhendoPeriodo(true)}
            style={[estilos.periodo, { gap: espacamento.mini, minHeight: medidas.areaToqueMinima }]}
          >
            <Text style={[tipografia.subtitulo, { color: cores.texto }]}>{titulo}</Text>
            <Icone nome="abrirPeriodo" cor="texto" />
          </Pressable>
          <Etiqueta texto={nomeDoPerfil(lerPerfil())} />
        </View>

        <View style={estilos.anel}>
          <AnelEmissoes
            segmentos={resumo.fontes}
            totalKgCo2e={resumo.totalKgCo2e}
            complementoRotulo={mesAtual ? 'este mês' : `em ${nomeMes}`}
            descricao={descricaoAnel}
            chaveAnimacao={periodo.id}
          />
        </View>

        {/* Sem espaço entre as linhas: cada uma já tem a altura mínima de toque. */}
        <View>
          {resumo.fontes.map((fonte, i) => (
            <LinhaLegenda
              key={fonte.id}
              cor={CORES_FONTES[i] ?? 'grafico3'}
              nome={fonte.nome}
              valor={formatarEmissaoComUnidade(fonte.emissaoKgCo2e)}
              onPress={() =>
                router.push({
                  pathname: '/memoria/[periodo]/[fonte]',
                  params: { periodo: periodo.id, fonte: fonte.id },
                })
              }
            />
          ))}
        </View>

        <View style={[estilos.cartoes, { gap: espacamento.p }]}>
          <CartaoNumero
            rotulo="Para neutralizar"
            numero={String(arvores)}
            unidade={arvores === 1 ? 'árvore' : 'árvores'}
            nota={`em ${HORIZONTE_ANOS} anos`}
            corNumero="marcaForte"
          />
          {anterior && comparacao ? (
            <CartaoNumero
              rotulo={`Comparado a ${nomeDoMes(anterior.mes)}`}
              numero={comparacao.variacao === null ? '—' : formatarVariacao(comparacao.variacao)}
              nota={
                comparacao.diferencaKgCo2e === 0
                  ? 'o mesmo que antes'
                  : `${formatarEmissaoComUnidade(Math.abs(comparacao.diferencaKgCo2e))} a ${
                      comparacao.diferencaKgCo2e < 0 ? 'menos' : 'mais'
                    }`
              }
            />
          ) : (
            <CartaoNumero rotulo="Comparação" numero="—" nota="Sem mês anterior registrado" />
          )}
        </View>

        {focoReducao && focoReducao.sugestoes.length > 0 && (
          <LinhaAcao
            icone="sugestao"
            titulo="Reduzir antes de compensar"
            descricao={`${focoReducao.sugestoes.length} ${
              focoReducao.sugestoes.length === 1 ? 'sugestão' : 'sugestões'
            } para ${focoReducao.nome.toLowerCase()}`}
            onPress={() =>
              router.push({ pathname: '/sugestoes/[periodo]', params: { periodo: periodo.id } })
            }
          />
        )}
      </ScrollView>

      <SeletorPeriodo
        visivel={escolhendoPeriodo}
        periodos={periodos}
        selecionado={periodo.id}
        aoEscolher={escolherPeriodo}
        aoFechar={() => setEscolhendoPeriodo(false)}
      />
    </SafeAreaView>
  );
}

// Primeiro uso, sem nenhum registro: o que a Início vai mostrar e o caminho
// até lá, na ordem do app (registrar, ver, reduzir antes de compensar).
const PASSOS = [
  {
    titulo: 'Registre o consumo do mês',
    descricao: 'A conta de luz, o combustível ou o gás de cozinha.',
  },
  {
    titulo: 'Veja suas emissões',
    descricao: 'O total do mês, de onde ele vem e como cada número foi calculado.',
  },
  {
    titulo: 'Reduza e simule o plantio',
    descricao: 'Sugestões para emitir menos e quantas árvores neutralizariam o que sobrar.',
  },
] as const;

function InicioSemRegistros() {
  const { cores, tipografia, espacamento, raios } = useTema();

  return (
    <SafeAreaView edges={['top']} style={[estilos.tela, { backgroundColor: cores.fundo }]}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: margemTela,
          paddingVertical: espacamento.m,
          gap: espacamento.g,
        }}
      >
        <View style={[estilos.topo, { minHeight: medidas.areaToqueMinima }]}>
          <Text accessibilityRole="header" style={[tipografia.subtitulo, { color: cores.texto }]}>
            Suas emissões
          </Text>
          <Etiqueta texto={nomeDoPerfil(lerPerfil())} />
        </View>

        <View style={[estilos.centro, { gap: espacamento.m }]}>
          <Ilustracao nome="semRegistros" />
          <View style={[estilos.centro, { gap: espacamento.p }]}>
            <Text
              accessibilityRole="header"
              style={[tipografia.tituloDetalhe, estilos.textoCentro, { color: cores.texto }]}
            >
              Nenhum consumo registrado
            </Text>
            <Text style={[tipografia.corpo, estilos.textoCentro, { color: cores.textoSuave }]}>
              Comece pela conta deste mês para ver suas emissões, fonte por fonte.
            </Text>
          </View>
        </View>

        <BotaoPrimario rotulo="Registrar consumo" onPress={() => router.navigate('/registrar')} />

        <Cartao style={{ gap: espacamento.m }}>
          <Text accessibilityRole="header" style={[tipografia.itemForte, { color: cores.texto }]}>
            Como funciona
          </Text>
          <View accessibilityRole="list" style={{ gap: espacamento.m }}>
            {PASSOS.map((passo, i) => (
              <View
                key={passo.titulo}
                accessible
                accessibilityLabel={`Passo ${i + 1} de ${PASSOS.length}: ${passo.titulo}. ${passo.descricao}`}
                style={[estilos.passo, { gap: espacamento.p }]}
              >
                <View
                  style={[
                    estilos.numeroPasso,
                    { borderRadius: raios.pilula, backgroundColor: cores.marca },
                  ]}
                >
                  <Text style={[tipografia.numeroLinha, { color: cores.sobreMarca }]}>{i + 1}</Text>
                </View>
                <View style={[estilos.expandir, { gap: espacamento.mini }]}>
                  <Text style={[tipografia.itemForte, { color: cores.texto }]}>{passo.titulo}</Text>
                  <Text style={[tipografia.legenda, { color: cores.textoSuave }]}>
                    {passo.descricao}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </Cartao>

        <View style={[estilos.privacidade, { gap: espacamento.p }]}>
          <Icone nome="semInternet" cor="textoSuave" fundo="fundo" />
          <Text style={[tipografia.legenda, estilos.encolher, { color: cores.textoSuave }]}>
            Seus registros ficam só neste aparelho.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  tela: {
    flex: 1,
  },
  vazio: {
    flex: 1,
    justifyContent: 'center',
  },
  topo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  periodo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  anel: {
    alignItems: 'center',
  },
  cartoes: {
    flexDirection: 'row',
  },
  centro: {
    alignItems: 'center',
  },
  textoCentro: {
    textAlign: 'center',
  },
  passo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  numeroPasso: {
    width: medidas.circuloIcone,
    height: medidas.circuloIcone,
    alignItems: 'center',
    justifyContent: 'center',
  },
  expandir: {
    flex: 1,
  },
  encolher: {
    flexShrink: 1,
  },
  privacidade: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
