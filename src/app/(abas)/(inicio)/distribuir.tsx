import { useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type GestureResponderEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Line } from 'react-native-svg';

import {
  ESPACO_MUDA,
  LADO_MAXIMO_M,
  LADO_MINIMO_M,
  capacidadeTerreno,
  distribuirEmLinhas,
  encaixarNaGrade,
  posicaoValida,
  terrenoSugerido,
  terrenoValido,
  type PosicaoMuda,
  type Terreno,
} from '@/calculo/distribuicao';
import { BotaoSecundario } from '@/ui/BotaoSecundario';
import { BotaoTexto } from '@/ui/BotaoTexto';
import { CabecalhoDetalhe } from '@/ui/CabecalhoDetalhe';
import { formatarDecimal } from '@/ui/formatacao';
import { margemTela, medidas, useTema } from '@/ui/tema';

// Distribuição das mudas simuladas num terreno (RF06), aberta pela simulação de
// plantio com o parâmetro `arvores`. Funciona como a colocação de construções
// em jogos de estratégia: toque no terreno para pôr uma muda e arraste para
// mudar de lugar; cada muda reserva 3 m × 2 m (o espaçamento do plantio de
// mata) e o lugar fica vermelho, sem aceitar a muda, quando o espaço encosta no
// de outra ou sai do terreno. As regras estão em src/calculo/distribuicao.ts.

// Linhas da grade a cada metro; em terrenos grandes, a cada 5 m.
const GRADE_FINA_ATE_M = 30;
// Copa desenhada no meio do espaço da muda, em fração do lado menor.
const PROPORCAO_COPA = 0.7;
// Deslocamento do dedo, em pontos, a partir do qual o toque vira arraste.
const LIMIAR_ARRASTE = 4;

type Arraste = { indice: number; posicao: PosicaoMuda; valida: boolean };

export default function DistribuirMudas() {
  const { arvores } = useLocalSearchParams<{ arvores?: string }>();
  const quantidade = Math.max(1, Math.min(9999, Math.floor(Number(arvores) || 1)));
  const { cores, tipografia, espacamento } = useTema();

  const [terreno, setTerreno] = useState<Terreno>(() => terrenoSugerido(quantidade));
  const [textoLargura, setTextoLargura] = useState(String(terreno.larguraM));
  const [textoComprimento, setTextoComprimento] = useState(String(terreno.comprimentoM));
  const [mudas, setMudas] = useState<PosicaoMuda[]>([]);
  const [selecionada, setSelecionada] = useState<number | null>(null);
  const [arraste, setArraste] = useState<Arraste | null>(null);
  const [aviso, setAviso] = useState('');
  // Lado digitado fora de 2 a 100 m: o terreno não muda e o campo avisa.
  const [ladoInvalido, setLadoInvalido] = useState<'larguraM' | 'comprimentoM' | null>(null);
  const [larguraTela, setLarguraTela] = useState(0);

  const capacidade = capacidadeTerreno(terreno);
  // Com os dois lados no máximo, não adianta pedir um terreno maior.
  const terrenoNoMaximo =
    terreno.larguraM === LADO_MAXIMO_M && terreno.comprimentoM === LADO_MAXIMO_M;
  const comoCaberTodas = terrenoNoMaximo
    ? 'Esse é o maior terreno da simulação: divida o plantio em mais de um terreno.'
    : 'Aumente o terreno para caber todas.';
  const faltam = quantidade - mudas.length;
  // Metros → pontos na tela: cabe na largura e não passa da altura máxima.
  const pontosPorM =
    larguraTela > 0
      ? Math.min(larguraTela / terreno.larguraM, medidas.alturaMaximaTerreno / terreno.comprimentoM)
      : 0;

  function mudarLado(lado: 'larguraM' | 'comprimentoM', texto: string) {
    const digitos = texto.replace(/\D/g, '').slice(0, 3);
    if (lado === 'larguraM') setTextoLargura(digitos);
    else setTextoComprimento(digitos);
    const novo = { ...terreno, [lado]: Number(digitos) };
    if (!terrenoValido(novo)) {
      setLadoInvalido(lado);
      return;
    }
    setLadoInvalido(null);
    setTerreno(novo);
    // Mudas que deixaram de caber saem do terreno.
    const restantes = mudas.filter((m) => posicaoValida(m, [], novo));
    if (restantes.length < mudas.length) {
      setAviso(
        `${formatarDecimal(mudas.length - restantes.length)} ${mudas.length - restantes.length === 1 ? 'muda saiu' : 'mudas saíram'} porque o terreno diminuiu.`,
      );
    }
    setMudas(restantes);
    setSelecionada(null);
  }

  // Ao sair do campo, um valor inválido volta para o último que valia.
  function confirmarLado() {
    setTextoLargura(String(terreno.larguraM));
    setTextoComprimento(String(terreno.comprimentoM));
    setLadoInvalido(null);
  }

  function colocar(evento: GestureResponderEvent) {
    if (pontosPorM === 0) return;
    if (faltam <= 0) {
      setAviso('Todas as mudas já estão no terreno. Arraste para mudar de lugar.');
      return;
    }
    const { locationX, locationY } = evento.nativeEvent;
    const posicao = encaixarNaGrade(locationX / pontosPorM, locationY / pontosPorM, terreno);
    if (!posicaoValida(posicao, mudas, terreno)) {
      setAviso('Não cabe aí: o espaço da muda encosta no de outra.');
      return;
    }
    setMudas((atuais) => [...atuais, posicao]);
    setSelecionada(null);
    setAviso('');
  }

  function distribuir() {
    const posicoes = distribuirEmLinhas(quantidade, terreno);
    setMudas(posicoes);
    setSelecionada(null);
    setAviso(
      posicoes.length < quantidade
        ? `Couberam ${formatarDecimal(posicoes.length)} de ${formatarDecimal(quantidade)} mudas. ${comoCaberTodas}`
        : '',
    );
  }

  function soltar(indice: number, posicaoFinal: PosicaoMuda) {
    const outras = mudas.filter((_, i) => i !== indice);
    if (posicaoValida(posicaoFinal, outras, terreno)) {
      setMudas((lista) => lista.map((m, i) => (i === indice ? posicaoFinal : m)));
      setAviso('');
    } else {
      setAviso('Não cabe aí: a muda voltou para onde estava.');
    }
    setArraste(null);
  }

  function remover() {
    if (selecionada === null) return;
    setMudas((atuais) => atuais.filter((_, i) => i !== selecionada));
    setSelecionada(null);
    setAviso('');
  }

  const descricaoTerreno =
    `Terreno de ${terreno.larguraM} por ${terreno.comprimentoM} metros, ` +
    `com ${formatarDecimal(mudas.length)} de ${formatarDecimal(quantidade)} mudas.`;

  return (
    <SafeAreaView edges={['top']} style={[estilos.tela, { backgroundColor: cores.fundo }]}>
      <ScrollView
        scrollEnabled={arraste === null}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingHorizontal: margemTela,
          paddingVertical: espacamento.m,
          gap: espacamento.m,
        }}
      >
        <CabecalhoDetalhe titulo="Distribuir no terreno" />
        <Text style={[tipografia.apoio, { color: cores.textoSuave }]}>
          Toque no terreno para colocar uma muda e arraste para mudar de lugar. Cada muda reserva{' '}
          {ESPACO_MUDA.larguraM} m × {ESPACO_MUDA.comprimentoM} m, o espaçamento do plantio de mata.
          Em vermelho, onde não cabe.
        </Text>

        <View style={[estilos.linha, { gap: espacamento.p }]}>
          <CampoLado
            rotulo="Largura"
            valor={textoLargura}
            invalido={ladoInvalido === 'larguraM'}
            aoMudar={(texto) => mudarLado('larguraM', texto)}
            aoSair={confirmarLado}
          />
          <CampoLado
            rotulo="Comprimento"
            valor={textoComprimento}
            invalido={ladoInvalido === 'comprimentoM'}
            aoMudar={(texto) => mudarLado('comprimentoM', texto)}
            aoSair={confirmarLado}
          />
        </View>
        {ladoInvalido ? (
          <Text
            accessibilityLiveRegion="polite"
            style={[tipografia.legenda, { color: cores.perigo }]}
          >
            Use um valor inteiro de {LADO_MINIMO_M} a {LADO_MAXIMO_M} m. O terreno continua com{' '}
            {terreno.larguraM} m × {terreno.comprimentoM} m.
          </Text>
        ) : null}

        <Text style={[tipografia.itemForte, { color: cores.texto }]}>
          {formatarDecimal(mudas.length)} de {formatarDecimal(quantidade)}{' '}
          {quantidade === 1 ? 'muda' : 'mudas'} no terreno · cabem até {formatarDecimal(capacidade)}
        </Text>
        {capacidade < quantidade ? (
          <Text style={[tipografia.legenda, { color: cores.perigo }]}>
            Nesse espaço cabem no máximo {formatarDecimal(capacidade)} mudas.{' '}
            {terrenoNoMaximo
              ? comoCaberTodas
              : `Aumente a largura ou o comprimento (até ${LADO_MAXIMO_M} m).`}
          </Text>
        ) : null}

        <View testID="area-do-terreno" onLayout={(e) => setLarguraTela(e.nativeEvent.layout.width)}>
          {pontosPorM > 0 ? (
            <View
              style={[
                estilos.terreno,
                {
                  width: terreno.larguraM * pontosPorM,
                  height: terreno.comprimentoM * pontosPorM,
                  backgroundColor: cores.superficie,
                  borderColor: cores.borda,
                  borderWidth: medidas.bordaCartao,
                },
              ]}
            >
              {/* Camada de toque atrás das mudas, e não em volta delas: um botão não pode
                  ficar dentro de outro. */}
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={descricaoTerreno}
                accessibilityHint="Toque para colocar uma muda. Use Distribuir automaticamente para preencher em fileiras."
                onPress={colocar}
                style={StyleSheet.absoluteFill}
              >
                <Grade terreno={terreno} pontosPorM={pontosPorM} />
              </Pressable>
              {mudas.map((posicao, indice) => (
                // A muda tocada continua montada durante o arraste (desmontá-la
                // encerraria o gesto); só fica apagada enquanto a cópia segue o dedo.
                <Muda
                  key={`${indice}-${posicao.x}-${posicao.y}`}
                  numero={indice + 1}
                  posicao={posicao}
                  pontosPorM={pontosPorM}
                  selecionada={selecionada === indice}
                  estado={arraste?.indice === indice ? 'origem' : 'normal'}
                  aoTocar={() => setSelecionada(selecionada === indice ? null : indice)}
                  aoArrastar={(posicaoNova) => {
                    const outras = mudas.filter((_, i) => i !== indice);
                    setArraste({
                      indice,
                      posicao: posicaoNova,
                      valida: posicaoValida(posicaoNova, outras, terreno),
                    });
                  }}
                  aoSoltar={(posicaoFinal) => soltar(indice, posicaoFinal)}
                  terreno={terreno}
                />
              ))}
              {arraste ? (
                <Muda
                  numero={arraste.indice + 1}
                  posicao={arraste.posicao}
                  pontosPorM={pontosPorM}
                  selecionada
                  estado={arraste.valida ? 'valida' : 'invalida'}
                  terreno={terreno}
                />
              ) : null}
            </View>
          ) : null}
        </View>

        {aviso ? (
          <Text
            accessibilityLiveRegion="polite"
            style={[tipografia.legenda, { color: cores.textoSuave }]}
          >
            {aviso}
          </Text>
        ) : null}

        <BotaoSecundario rotulo="Distribuir automaticamente" onPress={distribuir} />
        <View style={[estilos.linha, estilos.entre]}>
          <BotaoTexto
            rotulo="Limpar terreno"
            onPress={() => {
              setMudas([]);
              setSelecionada(null);
              setAviso('');
            }}
          />
          {selecionada !== null ? (
            <BotaoTexto rotulo={`Tirar a muda ${selecionada + 1}`} onPress={remover} />
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function CampoLado({
  rotulo,
  valor,
  invalido,
  aoMudar,
  aoSair,
}: {
  rotulo: string;
  valor: string;
  invalido: boolean;
  aoMudar: (texto: string) => void;
  aoSair: () => void;
}) {
  const { cores, tipografia, espacamento, raios } = useTema();

  return (
    <View style={[estilos.expandir, { gap: espacamento.pp }]}>
      <Text style={[tipografia.rotulo, { color: cores.texto }]}>{rotulo}</Text>
      <View
        style={[
          estilos.linha,
          {
            minHeight: medidas.alturaCampo,
            gap: espacamento.pp,
            paddingHorizontal: espacamento.m,
            borderWidth: invalido ? medidas.bordaSelecionada : medidas.bordaCartao,
            borderColor: invalido ? cores.perigo : cores.borda,
            borderRadius: raios.linha,
            backgroundColor: cores.superficie,
          },
        ]}
      >
        <TextInput
          accessibilityLabel={`${rotulo} do terreno, em metros`}
          accessibilityHint={`De ${LADO_MINIMO_M} a ${LADO_MAXIMO_M} metros`}
          value={valor}
          onChangeText={aoMudar}
          onBlur={aoSair}
          keyboardType="number-pad"
          inputMode="numeric"
          style={[tipografia.subtitulo, estilos.expandir, estilos.entrada, { color: cores.texto }]}
        />
        <Text style={[tipografia.linha, { color: cores.textoSuave }]}>m</Text>
      </View>
    </View>
  );
}

// Linhas da grade do terreno.
function Grade({ terreno, pontosPorM }: { terreno: Terreno; pontosPorM: number }) {
  const { cores } = useTema();
  const passo = Math.max(terreno.larguraM, terreno.comprimentoM) > GRADE_FINA_ATE_M ? 5 : 1;
  const largura = terreno.larguraM * pontosPorM;
  const altura = terreno.comprimentoM * pontosPorM;
  const verticais = Array.from(
    { length: Math.floor(terreno.larguraM / passo) + 1 },
    (_, i) => i * passo,
  );
  const horizontais = Array.from(
    { length: Math.floor(terreno.comprimentoM / passo) + 1 },
    (_, i) => i * passo,
  );

  return (
    <Svg width={largura} height={altura} style={StyleSheet.absoluteFill} aria-hidden>
      {verticais.map((m) => (
        <Line
          key={`v${m}`}
          x1={m * pontosPorM}
          y1={0}
          x2={m * pontosPorM}
          y2={altura}
          stroke={cores.trilhaAnel}
          strokeWidth={medidas.bordaCartao}
        />
      ))}
      {horizontais.map((m) => (
        <Line
          key={`h${m}`}
          x1={0}
          y1={m * pontosPorM}
          x2={largura}
          y2={m * pontosPorM}
          stroke={cores.trilhaAnel}
          strokeWidth={medidas.bordaCartao}
        />
      ))}
    </Svg>
  );
}

type PropsMuda = {
  numero: number;
  posicao: PosicaoMuda;
  pontosPorM: number;
  selecionada: boolean;
  // origem: a muda que está sendo arrastada, apagada no lugar de onde saiu.
  estado: 'normal' | 'origem' | 'valida' | 'invalida';
  terreno: Terreno;
  aoTocar?: () => void;
  aoArrastar?: (posicao: PosicaoMuda) => void;
  aoSoltar?: (posicaoFinal: PosicaoMuda) => void;
};

// Uma muda: o retângulo que ela reserva e a copa no meio. Arrastável quando
// recebe os tratadores; durante o arraste, a cópia que segue o dedo mostra se o
// lugar vale (verde) ou não (vermelho).
function Muda({
  numero,
  posicao,
  pontosPorM,
  selecionada,
  estado,
  terreno,
  aoTocar,
  aoArrastar,
  aoSoltar,
}: PropsMuda) {
  const { cores, tipografia, raios } = useTema();
  const largura = ESPACO_MUDA.larguraM * pontosPorM;
  const altura = ESPACO_MUDA.comprimentoM * pontosPorM;
  const ultima = useRef(posicao);
  const moveu = useRef(false);
  // Onde o dedo tocou, em pontos da tela, para medir quanto ele andou.
  const inicio = useRef({ x: 0, y: 0 });

  // Arraste pelos eventos de toque do próprio View (sistema de responder do
  // React Native). A muda que recebe o toque fica montada até ele terminar.
  const tratadores = aoArrastar
    ? {
        onStartShouldSetResponder: () => true,
        onResponderTerminationRequest: () => false,
        onResponderGrant: (evento: GestureResponderEvent) => {
          moveu.current = false;
          ultima.current = posicao;
          inicio.current = { x: evento.nativeEvent.pageX, y: evento.nativeEvent.pageY };
        },
        onResponderMove: (evento: GestureResponderEvent) => {
          const dx = evento.nativeEvent.pageX - inicio.current.x;
          const dy = evento.nativeEvent.pageY - inicio.current.y;
          const comecou =
            !moveu.current && (Math.abs(dx) > LIMIAR_ARRASTE || Math.abs(dy) > LIMIAR_ARRASTE);
          if (comecou) moveu.current = true;
          if (!moveu.current) return;
          // Centro da muda + quanto o dedo andou, em metros, encaixado na grade.
          const nova = encaixarNaGrade(
            posicao.x + ESPACO_MUDA.larguraM / 2 + dx / pontosPorM,
            posicao.y + ESPACO_MUDA.comprimentoM / 2 + dy / pontosPorM,
            terreno,
          );
          // Só avisa a tela quando muda de casa (ou no começo do arraste).
          if (comecou || nova.x !== ultima.current.x || nova.y !== ultima.current.y) {
            ultima.current = nova;
            aoArrastar(nova);
          }
        },
        onResponderRelease: () => {
          if (moveu.current) aoSoltar?.(ultima.current);
          else aoTocar?.();
        },
        onResponderTerminate: () => {
          if (moveu.current) aoSoltar?.(ultima.current);
        },
      }
    : {};

  const corBorda =
    estado === 'invalida' ? cores.perigo : selecionada ? cores.marcaForte : cores.grafico1;
  const fundo = estado === 'invalida' ? cores.perigoFundo : cores.areaMuda;
  const copa = Math.min(largura, altura) * PROPORCAO_COPA;

  return (
    <View
      {...tratadores}
      accessible={Boolean(aoTocar)}
      accessibilityRole={aoTocar ? 'button' : undefined}
      accessibilityLabel={`Muda ${numero}, a ${posicao.x} m da esquerda e ${posicao.y} m do topo`}
      accessibilityState={aoTocar ? { selected: selecionada } : undefined}
      onAccessibilityTap={aoTocar}
      style={[
        estilos.muda,
        {
          left: posicao.x * pontosPorM,
          top: posicao.y * pontosPorM,
          width: largura,
          height: altura,
          borderRadius: raios.marcador,
          borderWidth: selecionada ? medidas.bordaSelecionada : medidas.bordaCartao,
          borderColor: corBorda,
          backgroundColor: fundo,
          opacity: estado === 'origem' ? medidas.opacidadeOrigemMuda : 1,
          // A cópia que segue o dedo não recebe toques.
          pointerEvents: aoArrastar ? 'auto' : 'none',
        },
      ]}
    >
      {/* Círculo simples de View, e não SVG: um terreno grande pode ter mais de mil mudas. */}
      <View
        style={{
          width: copa,
          height: copa,
          borderRadius: raios.pilula,
          backgroundColor: estado === 'invalida' ? cores.perigo : cores.grafico1,
        }}
      />
      {copa >= medidas.copaMinimaComNumero ? (
        <Text style={[tipografia.miniForte, estilos.numeroMuda, { color: cores.sobreMarca }]}>
          {numero}
        </Text>
      ) : null}
    </View>
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
  entre: {
    justifyContent: 'space-between',
  },
  expandir: {
    flex: 1,
  },
  entrada: {
    paddingVertical: 0,
    minWidth: 0,
  },
  terreno: {
    alignSelf: 'center',
    overflow: 'hidden',
  },
  muda: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  numeroMuda: {
    position: 'absolute',
  },
});
