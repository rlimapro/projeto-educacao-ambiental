import { router, useFocusEffect } from 'expo-router';
import { Fragment, useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  compararComMesAnterior,
  deslocarMes,
  haMesesForaDaJanela,
  janelaDeMeses,
  mesesNoGrafico,
  mesMaisRecente,
  resumirAno,
  type EmissaoMensal,
  type Mes,
  type MesComparado,
} from '@/calculo/historico';
import { resumirEmissoes } from '@/calculo/resumo';
import { listarPeriodos } from '@/dados/periodos';
import { lerPerfil } from '@/dados/preferencias';
import { BotaoPrimario } from '@/ui/BotaoPrimario';
import { Cartao } from '@/ui/Cartao';
import { CartaoNumero } from '@/ui/CartaoNumero';
import { EtiquetaVariacao } from '@/ui/EtiquetaVariacao';
import {
  abreviacaoDoMes,
  formatarEmissao,
  formatarEmissaoComUnidade,
  formatarParticipacao,
  nomeDoMes,
  nomeDoPerfil,
} from '@/ui/formatacao';
import { GraficoMeses } from '@/ui/GraficoMeses';
import { Icone } from '@/ui/Icone';
import { margemTela, medidas, useTema } from '@/ui/tema';

// Histórico (RF07). Layout segue o protótipo no Figma ("09 Histórico"): as
// emissões dos últimos seis meses em barras e a lista dos meses registrados,
// cada um comparado ao mês registrado antes dele. Tocar num mês abre a Início
// nele. Detalhes e divergências em docs/historico.md.

const MAXIMO_MESES_NO_GRAFICO = 6;

type Estado = { meses: EmissaoMensal[]; erro: boolean };

function lerMeses(): Estado {
  try {
    const meses = listarPeriodos().map((p) => ({
      ano: p.ano,
      mes: p.mes,
      totalKgCo2e: resumirEmissoes(p.fontes).totalKgCo2e,
    }));
    return { meses, erro: false };
  } catch {
    return { meses: [], erro: true };
  }
}

function idDoMes({ ano, mes }: Mes): string {
  return `${ano}-${String(mes).padStart(2, '0')}`;
}

// "Mai a out de 2026"; atravessando o ano, "Nov de 2025 a abr de 2026".
function nomeDaJanela(inicio: Mes, fim: Mes): string {
  const primeiro = abreviacaoDoMes(inicio.mes);
  const ultimo = abreviacaoDoMes(fim.mes).toLowerCase();
  return inicio.ano === fim.ano
    ? `${primeiro} a ${ultimo} de ${fim.ano}`
    : `${primeiro} de ${inicio.ano} a ${ultimo} de ${fim.ano}`;
}

// Para leitores de tela: "Outubro de 2026: 245 kg, 12% a menos que setembro".
function descreverMes(m: MesComparado): string {
  const base = `${nomeDoMes(m.mes, true)} de ${m.ano}: ${formatarEmissaoComUnidade(m.totalKgCo2e)}`;
  if (!m.anterior || !m.comparacao) return `${base}, primeiro mês registrado`;
  const nomeAnterior =
    m.anterior.ano === m.ano ? nomeDoMes(m.anterior.mes) : `${nomeDoMes(m.anterior.mes)} de ${m.anterior.ano}`;
  const { variacao, diferencaKgCo2e } = m.comparacao;
  if (variacao === null) return `${base}, ${nomeAnterior} não teve emissões`;
  if (Math.round(variacao * 100) === 0) return `${base}, o mesmo que ${nomeAnterior}`;
  const sentido = diferencaKgCo2e < 0 ? 'a menos' : 'a mais';
  return `${base}, ${formatarParticipacao(Math.abs(variacao))} ${sentido} que ${nomeAnterior}`;
}

export default function Historico() {
  const { cores, tipografia, espacamento } = useTema();
  const [{ meses, erro }, setEstado] = useState(lerMeses);
  // Último mês do gráfico; nulo é o mês registrado mais recente.
  const [fimEscolhido, setFimEscolhido] = useState<Mes | null>(null);

  // Relê os registros a cada volta à aba, e o gráfico volta aos meses recentes.
  useFocusEffect(
    useCallback(() => {
      setEstado(lerMeses());
      setFimEscolhido(null);
    }, []),
  );

  const cabecalho = (
    <View style={{ gap: espacamento.mini }}>
      <Text accessibilityRole="header" style={[tipografia.tituloTela, { color: cores.texto }]}>
        Histórico
      </Text>
      <Text style={[tipografia.apoio, { color: cores.textoSuave }]}>
        Emissões por mês · {nomeDoPerfil(lerPerfil())}
      </Text>
    </View>
  );

  const recente = erro ? null : mesMaisRecente(meses);

  if (erro || recente === null) {
    return (
      <SafeAreaView edges={['top']} style={[estilos.tela, { backgroundColor: cores.fundo }]}>
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: margemTela,
            paddingVertical: espacamento.m,
            gap: espacamento.m,
          }}
        >
          {cabecalho}
          <Cartao style={{ gap: espacamento.m }}>
            <Text accessibilityRole="header" style={[tipografia.subtitulo, { color: cores.texto }]}>
              {erro ? 'Não foi possível abrir seus registros' : 'Nenhum mês registrado'}
            </Text>
            <Text style={[tipografia.corpo, { color: cores.textoSuave }]}>
              {erro
                ? 'Os dados salvos não foram alterados. Tente novamente ao registrar um consumo.'
                : 'Registre o consumo de um mês para começar. A partir do segundo, você vê aqui se está emitindo mais ou menos.'}
            </Text>
            <BotaoPrimario rotulo="Registrar consumo" onPress={() => router.navigate('/registrar')} />
          </Cartao>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Cópia já sem nulo, para as funções abaixo.
  const maisRecente: Mes = recente;
  const fim = fimEscolhido ?? maisRecente;
  const quantidade = mesesNoGrafico(meses, MAXIMO_MESES_NO_GRAFICO);
  const inicio = deslocarMes(fim, -(quantidade - 1));
  const janela = janelaDeMeses(meses, fim, quantidade);
  const fora = haMesesForaDaJanela(meses, fim, quantidade);
  const comparados = compararComMesAnterior(meses);
  const resumoAno = resumirAno(meses, recente.ano);

  function irPara(novoFim: Mes) {
    // Ao chegar ao mês mais recente, o gráfico volta a segui-lo.
    const chegouAoRecente =
      novoFim.ano > maisRecente.ano ||
      (novoFim.ano === maisRecente.ano && novoFim.mes >= maisRecente.mes);
    setFimEscolhido(chegouAoRecente ? null : novoFim);
  }

  function abrirNaInicio(m: Mes) {
    router.navigate({ pathname: '/', params: { periodo: idDoMes(m) } });
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
        {cabecalho}

        <Cartao style={{ gap: espacamento.p, paddingBottom: espacamento.p }}>
          {(fora.antes || fora.depois) && (
            <View style={estilos.linha}>
              <BotaoJanela
                icone="anterior"
                rotulo={`${quantidade} meses anteriores`}
                ativo={fora.antes}
                onPress={() => irPara(deslocarMes(fim, -quantidade))}
              />
              <Text style={[tipografia.apoioForte, estilos.centro, { color: cores.texto }]}>
                {nomeDaJanela(inicio, fim)}
              </Text>
              <BotaoJanela
                icone="abrir"
                rotulo={`${quantidade} meses seguintes`}
                ativo={fora.depois}
                onPress={() => irPara(deslocarMes(fim, quantidade))}
              />
            </View>
          )}
          <GraficoMeses meses={janela} destaque={recente} chaveAnimacao={idDoMes(fim)} />
          <Text style={[tipografia.nota, { color: cores.textoSuave }]}>Valores em kg CO₂e</Text>
        </Cartao>

        {resumoAno && resumoAno.mesesRegistrados > 1 && (
          <View style={[estilos.linha, { gap: espacamento.p }]}>
            <CartaoNumero
              rotulo={`Em ${resumoAno.ano}`}
              numero={formatarEmissao(resumoAno.totalKgCo2e).valor}
              unidade={formatarEmissao(resumoAno.totalKgCo2e).unidade}
              nota={`em ${resumoAno.mesesRegistrados} meses registrados`}
            />
            <CartaoNumero
              rotulo="Média por mês"
              numero={formatarEmissao(resumoAno.mediaMensalKgCo2e).valor}
              unidade={formatarEmissao(resumoAno.mediaMensalKgCo2e).unidade}
              nota={`nos meses de ${resumoAno.ano}`}
            />
          </View>
        )}

        <Text accessibilityRole="header" style={[tipografia.subtitulo, { color: cores.texto }]}>
          Últimos meses
        </Text>
        {/* Cada linha tem a altura mínima de toque; o respiro do cartão completa o do protótipo. */}
        <Cartao style={{ paddingVertical: espacamento.mini }}>
          {comparados.map((m, i) => (
            <Fragment key={idDoMes(m)}>
              {i > 0 && <View style={{ height: medidas.bordaCartao, backgroundColor: cores.borda }} />}
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={descreverMes(m)}
                accessibilityHint="Abre esse mês na Início"
                onPress={() => abrirNaInicio(m)}
                style={({ pressed }) => [
                  estilos.linha,
                  {
                    gap: espacamento.p,
                    minHeight: medidas.areaToqueMinima,
                    opacity: pressed ? medidas.opacidadePressionado : 1,
                  },
                ]}
              >
                <Text style={[tipografia.item, estilos.expandir, { color: cores.texto }]}>
                  {nomeDoMes(m.mes, true)} {m.ano}
                </Text>
                <Text style={[tipografia.numeroLinha, { color: cores.texto }]}>
                  {formatarEmissaoComUnidade(m.totalKgCo2e)}
                </Text>
                {m.comparacao ? (
                  <EtiquetaVariacao variacao={m.comparacao.variacao} />
                ) : (
                  <View style={{ minWidth: medidas.larguraVariacao }} />
                )}
                <Icone nome="abrir" cor="textoSuave" />
              </Pressable>
            </Fragment>
          ))}
        </Cartao>
        {comparados.length === 1 && (
          <Text style={[tipografia.legenda, { color: cores.textoSuave }]}>
            Registre o próximo mês para comparar.
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function BotaoJanela({
  icone,
  rotulo,
  ativo,
  onPress,
}: {
  icone: 'anterior' | 'abrir';
  rotulo: string;
  ativo: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={rotulo}
      accessibilityState={{ disabled: !ativo }}
      disabled={!ativo}
      onPress={onPress}
      style={estilos.botaoJanela}
    >
      <Icone nome={icone} cor={ativo ? 'texto' : 'borda'} />
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  tela: {
    flex: 1,
  },
  linha: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  centro: {
    flex: 1,
    textAlign: 'center',
  },
  expandir: {
    flex: 1,
  },
  botaoJanela: {
    width: medidas.areaToqueMinima,
    height: medidas.areaToqueMinima,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
