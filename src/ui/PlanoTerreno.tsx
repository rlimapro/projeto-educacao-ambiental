import { useLayoutEffect, useRef, useState, type ComponentRef } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  View,
  type GestureResponderEvent,
} from 'react-native';
import Svg, { Line } from 'react-native-svg';

import {
  ESPACO_MUDA,
  encaixarNaGrade,
  posicaoValida,
  type PosicaoMuda,
  type Terreno,
} from '@/calculo/distribuicao';

import { BotaoRedondo } from './BotaoRedondo';
import { BotaoTexto } from './BotaoTexto';
import { formatarDecimal } from './formatacao';
import {
  distancia,
  enquadrar,
  limitarDeslocamento,
  limitarZoom,
  pontoDoTerreno,
  pontoMedio,
  pontosPorMetroInteiro,
  tamanhoJanela,
  zoomMaximo,
  type Ponto,
  type Tamanho,
} from './geometriaTerreno';
import { medidas, useTema } from './tema';

// Terreno da distribuição de mudas (RF06), com zoom. Toque no fundo põe uma
// muda; arrastar uma muda a move; com dois dedos, a pinça aproxima ou afasta;
// com zoom, arrastar o fundo anda pelo terreno. Os botões − e + fazem o mesmo
// zoom sem pinça (leitores de tela, prévia web). A geometria está em
// geometriaTerreno.ts; as regras das mudas, em src/calculo/distribuicao.ts.
//
// Para não redesenhar até 1.650 mudas a cada quadro, o arraste do fundo e a
// pinça mexem só no transform do terreno (Animated do React Native); o novo
// zoom é desenhado de verdade ao soltar os dedos.

// Linhas da grade a cada metro; em terrenos grandes, a cada 5 m, a não ser
// que o zoom deixe o metro largo o bastante.
const GRADE_FINA_ATE_M = 30;
const PONTOS_POR_M_GRADE_FINA = 10;
// Copa desenhada no meio do espaço da muda, em fração do lado menor.
const PROPORCAO_COPA = 0.7;
// Deslocamento do dedo, em pontos, a partir do qual o toque vira arraste.
const LIMIAR_ARRASTE = 4;
// Cada toque em − ou + divide ou multiplica o zoom por este valor. Os botões
// só aparecem quando dá para aproximar pelo menos um passo.
const PASSO_ZOOM = 1.5;

type Arraste = { indice: number; posicao: PosicaoMuda; valida: boolean };

type Gesto =
  | { tipo: 'nenhum' }
  | { tipo: 'toque'; inicio: Ponto; local: Ponto; deslocamento: Ponto }
  | { tipo: 'andar'; inicio: Ponto; deslocamento: Ponto }
  | {
      tipo: 'pinca';
      distanciaInicial: number;
      // Ponto do terreno, em metros, que começou entre os dedos.
      pontoM: Ponto;
      // Zoom em que a pinça começou e o provisório, confirmado ao soltar.
      zoom: number;
      zoomNovo: number;
      meio: Ponto;
    };

type Props = {
  terreno: Terreno;
  mudas: PosicaoMuda[];
  // Número da primeira muda deste terreno (as mudas são numeradas em todos).
  numeroInicial: number;
  larguraDisponivel: number;
  selecionada: number | null;
  descricao: string;
  aoTocarNoTerreno: (pontoM: Ponto) => void;
  // Leitor de tela: põe a muda sem apontar o lugar.
  aoColocarSemApontar: () => void;
  aoSelecionar: (indice: number | null) => void;
  aoSoltar: (indice: number, posicao: PosicaoMuda) => void;
  // Avisa a tela para travar a rolagem enquanto há um dedo no terreno.
  aoMudarGesto: (ativo: boolean) => void;
};

type Toques = GestureResponderEvent['nativeEvent']['touches'];

function pontoNaPagina(toque: { pageX: number; pageY: number }): Ponto {
  return { x: toque.pageX, y: toque.pageY };
}

export function PlanoTerreno({
  terreno,
  mudas,
  numeroInicial,
  larguraDisponivel,
  selecionada,
  descricao,
  aoTocarNoTerreno,
  aoColocarSemApontar,
  aoSelecionar,
  aoSoltar,
  aoMudarGesto,
}: Props) {
  const { cores, tipografia, espacamento } = useTema();
  const [zoom, setZoom] = useState(1);
  const [arraste, setArraste] = useState<Arraste | null>(null);
  const [translacao] = useState(() => new Animated.ValueXY({ x: 0, y: 0 }));
  const [escala] = useState(() => new Animated.Value(1));
  const deslocamento = useRef<Ponto>({ x: 0, y: 0 });
  // Deslocamento a aplicar quando o novo zoom for desenhado.
  const pendente = useRef<Ponto | null>(null);
  const gesto = useRef<Gesto>({ tipo: 'nenhum' });
  // Canto superior esquerdo da janela na página, para achar o ponto entre os dedos.
  const origemJanela = useRef<Ponto | null>(null);
  const janelaRef = useRef<ComponentRef<typeof View>>(null);
  const mudaComODedo = useRef(false);

  // A borda da janela fica por fora do terreno: no React Native a largura
  // inclui a borda, e uma borda por dentro cortava a última coluna e a última
  // linha (a borda direita e a de baixo das mudas nesses cantos sumiam).
  const borda = medidas.bordaCartao;
  const larguraInterna = Math.max(0, larguraDisponivel - 2 * borda);
  const base = pontosPorMetroInteiro(terreno, larguraInterna, medidas.alturaMaximaTerreno);
  const maximo = zoomMaximo(base, medidas.pontosPorMetroMaximo);
  const pontosPorM = base * zoom;
  const janela = tamanhoJanela(terreno, pontosPorM, larguraInterna, medidas.alturaMaximaTerreno);
  const conteudoMaiorQueJanela =
    terreno.larguraM * pontosPorM > janela.largura + 0.5 ||
    terreno.comprimentoM * pontosPorM > janela.altura + 0.5;

  function aplicarDeslocamento(novo: Ponto) {
    deslocamento.current = novo;
    translacao.setValue({ x: -novo.x, y: -novo.y });
  }

  // Desenhado o novo zoom, a escala provisória da pinça volta a 1 no mesmo quadro.
  useLayoutEffect(() => {
    const alvo = pendente.current ?? deslocamento.current;
    pendente.current = null;
    escala.setValue(1);
    const limitado = limitarDeslocamento(alvo, terreno, pontosPorM, janela);
    deslocamento.current = limitado;
    translacao.setValue({ x: -limitado.x, y: -limitado.y });
    // janela e terreno dependem só destes valores.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pontosPorM, janela.largura, janela.altura, terreno.larguraM, terreno.comprimentoM]);

  if (pontosPorM === 0) return null;

  function janelaCom(zoomNovo: number): Tamanho {
    return tamanhoJanela(terreno, base * zoomNovo, larguraInterna, medidas.alturaMaximaTerreno);
  }

  // Muda o zoom mantendo `pontoM` do terreno no lugar dado por `naJanela`.
  function confirmarZoom(zoomPedido: number, pontoM: Ponto, naJanela: (j: Tamanho) => Ponto) {
    const novo = limitarZoom(zoomPedido, maximo);
    const janelaNova = janelaCom(novo);
    const alvo = enquadrar(pontoM, naJanela(janelaNova), terreno, base * novo, janelaNova);
    if (novo === zoom) {
      escala.setValue(1);
      aplicarDeslocamento(alvo);
      return;
    }
    pendente.current = alvo;
    setZoom(novo);
  }

  function zoomPeloBotao(fator: number) {
    const centro = { x: janela.largura / 2, y: janela.altura / 2 };
    const pontoM = pontoDoTerreno(centro, deslocamento.current, pontosPorM);
    confirmarZoom(zoom * fator, pontoM, (j) => ({ x: j.largura / 2, y: j.altura / 2 }));
  }

  function noMeioDaJanela(toques: Toques): Ponto {
    const meio = pontoMedio(pontoNaPagina(toques[0]), pontoNaPagina(toques[1]));
    const origem = origemJanela.current;
    // Sem a posição da janela, a pinça aproxima em torno do centro.
    if (!origem) return { x: janela.largura / 2, y: janela.altura / 2 };
    return { x: meio.x - origem.x, y: meio.y - origem.y };
  }

  function comecarPinca(toques: Toques) {
    const meio = noMeioDaJanela(toques);
    gesto.current = {
      tipo: 'pinca',
      distanciaInicial: Math.max(1, distancia(pontoNaPagina(toques[0]), pontoNaPagina(toques[1]))),
      pontoM: pontoDoTerreno(meio, deslocamento.current, pontosPorM),
      zoom,
      zoomNovo: zoom,
      meio,
    };
  }

  // Durante a pinça, o terreno desenhado no zoom atual é só esticado.
  function moverPinca(toques: Toques) {
    const atual = gesto.current;
    if (atual.tipo !== 'pinca' || toques.length < 2) return;
    const razao =
      distancia(pontoNaPagina(toques[0]), pontoNaPagina(toques[1])) / atual.distanciaInicial;
    const novo = limitarZoom(atual.zoom * razao, maximo);
    const meio = noMeioDaJanela(toques);
    gesto.current = { ...atual, meio, zoomNovo: novo };
    const alvo = enquadrar(atual.pontoM, meio, terreno, base * novo, janela);
    escala.setValue(novo / zoom);
    deslocamento.current = alvo;
    translacao.setValue({ x: -alvo.x, y: -alvo.y });
  }

  function terminarGesto() {
    const atual = gesto.current;
    if (atual.tipo === 'pinca') {
      const meio = atual.meio;
      confirmarZoom(atual.zoomNovo, atual.pontoM, () => meio);
    }
    gesto.current = { tipo: 'nenhum' };
  }

  function medirJanela() {
    janelaRef.current?.measure?.((_x: number, _y: number, _l: number, _a: number, paginaX: number, paginaY: number) => {
      if (Number.isFinite(paginaX) && Number.isFinite(paginaY)) {
        origemJanela.current = { x: paginaX + borda, y: paginaY + borda };
      }
    });
  }

  // Gestos que começam no fundo do terreno.
  const tratadoresFundo = {
    onStartShouldSetResponder: () => true,
    // O terreno não cede o dedo para a rolagem da página.
    onResponderTerminationRequest: () => false,
    onResponderGrant: (evento: GestureResponderEvent) => {
      const { locationX, locationY, pageX, pageY, touches } = evento.nativeEvent;
      // O fundo cobre o terreno inteiro: o canto dele na página é o toque
      // menos a posição local, e a janela fica a `deslocamento` desse canto.
      origemJanela.current = {
        x: pageX - locationX + deslocamento.current.x,
        y: pageY - locationY + deslocamento.current.y,
      };
      if (touches && touches.length >= 2) {
        comecarPinca(touches);
      } else {
        gesto.current = {
          tipo: 'toque',
          inicio: { x: pageX, y: pageY },
          local: { x: locationX, y: locationY },
          deslocamento: deslocamento.current,
        };
      }
      // Impede a rolagem nativa de tomar o gesto.
      return true;
    },
    onResponderMove: (evento: GestureResponderEvent) => {
      const { touches, pageX, pageY } = evento.nativeEvent;
      const atual = gesto.current;
      if (touches && touches.length >= 2) {
        if (atual.tipo !== 'pinca') comecarPinca(touches);
        else moverPinca(touches);
        return;
      }
      if (atual.tipo === 'toque') {
        const dx = pageX - atual.inicio.x;
        const dy = pageY - atual.inicio.y;
        if (Math.abs(dx) <= LIMIAR_ARRASTE && Math.abs(dy) <= LIMIAR_ARRASTE) return;
        if (!conteudoMaiorQueJanela) return;
        gesto.current = { tipo: 'andar', inicio: atual.inicio, deslocamento: atual.deslocamento };
      }
      const andando = gesto.current;
      if (andando.tipo === 'andar') {
        aplicarDeslocamento(
          limitarDeslocamento(
            {
              x: andando.deslocamento.x - (pageX - andando.inicio.x),
              y: andando.deslocamento.y - (pageY - andando.inicio.y),
            },
            terreno,
            pontosPorM,
            janela,
          ),
        );
      }
    },
    onResponderRelease: () => {
      const atual = gesto.current;
      if (atual.tipo === 'toque') {
        gesto.current = { tipo: 'nenhum' };
        aoTocarNoTerreno({ x: atual.local.x / pontosPorM, y: atual.local.y / pontosPorM });
        return;
      }
      terminarGesto();
    },
    onResponderTerminate: terminarGesto,
  };

  // Pinça que começa com um dedo em cima de uma muda: o terreno toma o gesto
  // quando o segundo dedo chega, se a muda ainda não estava sendo arrastada.
  const tratadoresPincaSobreMuda = {
    onMoveShouldSetResponderCapture: (evento: GestureResponderEvent) =>
      mudaComODedo.current && (evento.nativeEvent.touches?.length ?? 0) >= 2,
    onResponderGrant: (evento: GestureResponderEvent) => {
      mudaComODedo.current = false;
      medirJanela();
      if ((evento.nativeEvent.touches?.length ?? 0) >= 2) comecarPinca(evento.nativeEvent.touches);
      return true;
    },
    onResponderMove: (evento: GestureResponderEvent) => moverPinca(evento.nativeEvent.touches ?? []),
    onResponderTerminationRequest: () => false,
    onResponderRelease: terminarGesto,
    onResponderTerminate: terminarGesto,
  };

  // Qualquer dedo no terreno trava a rolagem da página até o último sair. Os
  // eventos de toque chegam aqui mesmo quando uma muda é quem trata o gesto.
  const travarRolagem = {
    onTouchStart: () => aoMudarGesto(true),
    onTouchEnd: (evento: GestureResponderEvent) => {
      if ((evento.nativeEvent.touches?.length ?? 0) === 0) aoMudarGesto(false);
    },
    onTouchCancel: () => aoMudarGesto(false),
  };

  const larguraConteudo = terreno.larguraM * pontosPorM;
  const alturaConteudo = terreno.comprimentoM * pontosPorM;

  return (
    <View style={{ gap: espacamento.p }}>
      {/* Acima do terreno, para ficarem à vista mesmo com o terreno ocupando a tela. */}
      {maximo >= PASSO_ZOOM ? (
        <View style={[estilos.linha, estilos.centro, { gap: espacamento.m }]}>
          <BotaoRedondo
            icone="menos"
            rotulo="Afastar"
            desativado={zoom <= 1}
            onPress={() => zoomPeloBotao(1 / PASSO_ZOOM)}
          />
          <Text
            accessibilityLabel={`Zoom de ${formatarDecimal(zoom)} vezes`}
            accessibilityLiveRegion="polite"
            style={[tipografia.itemForte, estilos.textoZoom, { color: cores.texto }]}
          >
            {formatarDecimal(Math.round(zoom * 10) / 10)}×
          </Text>
          <BotaoRedondo
            icone="mais"
            rotulo="Aproximar"
            desativado={zoom >= maximo}
            onPress={() => zoomPeloBotao(PASSO_ZOOM)}
          />
          {zoom > 1 ? (
            <BotaoTexto
              rotulo="Ver inteiro"
              dica="Volta o zoom para mostrar o terreno inteiro"
              onPress={() => confirmarZoom(1, { x: 0, y: 0 }, () => ({ x: 0, y: 0 }))}
            />
          ) : null}
        </View>
      ) : null}
      <View
        ref={janelaRef}
        testID="janela-do-terreno"
        style={[
          estilos.janela,
          {
            width: janela.largura + 2 * borda,
            height: janela.altura + 2 * borda,
            backgroundColor: cores.superficie,
            borderColor: cores.borda,
            borderWidth: borda,
          },
        ]}
        {...travarRolagem}
      >
        <Animated.View
          {...tratadoresPincaSobreMuda}
          style={[
            estilos.conteudo,
            {
              width: larguraConteudo,
              height: alturaConteudo,
              transform: [
                { translateX: translacao.x },
                { translateY: translacao.y },
                { scale: escala },
              ],
            },
          ]}
        >
          {/* Camada de toque atrás das mudas, e não em volta delas: um botão não
              pode ficar dentro de outro. */}
          <View
            {...tratadoresFundo}
            accessible
            accessibilityRole="button"
            accessibilityLabel={descricao}
            accessibilityHint="Toque para colocar uma muda no primeiro lugar livre. Use Distribuir automaticamente para preencher em fileiras."
            onAccessibilityTap={aoColocarSemApontar}
            style={StyleSheet.absoluteFill}
          >
            <Grade terreno={terreno} pontosPorM={pontosPorM} />
          </View>
          {mudas.map((posicao, indice) => (
            // A muda tocada continua montada durante o arraste (desmontá-la
            // encerraria o gesto); só fica apagada enquanto a cópia segue o dedo.
            <Muda
              key={`${indice}-${posicao.x}-${posicao.y}`}
              numero={numeroInicial + indice}
              posicao={posicao}
              pontosPorM={pontosPorM}
              selecionada={selecionada === indice}
              estado={arraste?.indice === indice ? 'origem' : 'normal'}
              aoEncostar={() => {
                mudaComODedo.current = true;
              }}
              aoTocar={() => aoSelecionar(selecionada === indice ? null : indice)}
              aoArrastar={(posicaoNova) => {
                const outras = mudas.filter((_, i) => i !== indice);
                setArraste({
                  indice,
                  posicao: posicaoNova,
                  valida: posicaoValida(posicaoNova, outras, terreno),
                });
              }}
              aoSoltar={(posicaoFinal) => {
                mudaComODedo.current = false;
                setArraste(null);
                aoSoltar(indice, posicaoFinal);
              }}
              terreno={terreno}
            />
          ))}
          {arraste ? (
            <Muda
              numero={numeroInicial + arraste.indice}
              posicao={arraste.posicao}
              pontosPorM={pontosPorM}
              selecionada
              estado={arraste.valida ? 'valida' : 'invalida'}
              terreno={terreno}
            />
          ) : null}
        </Animated.View>
      </View>

    </View>
  );
}

// Linhas da grade do terreno, que não recebem toques.
function Grade({ terreno, pontosPorM }: { terreno: Terreno; pontosPorM: number }) {
  const { cores } = useTema();
  const grande = Math.max(terreno.larguraM, terreno.comprimentoM) > GRADE_FINA_ATE_M;
  const passo = grande && pontosPorM < PONTOS_POR_M_GRADE_FINA ? 5 : 1;
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
    <Svg
      width={largura}
      height={altura}
      style={[StyleSheet.absoluteFill, estilos.semToque]}
      aria-hidden
    >
      {verticais.map((m) => (
        <Line
          key={`v${m}`}
          x1={m * pontosPorM}
          y1={0}
          x2={m * pontosPorM}
          y2={altura}
          stroke={cores.gradeTerreno}
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
          stroke={cores.gradeTerreno}
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
  aoEncostar?: () => void;
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
  aoEncostar,
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
        // Só cede o toque para a pinça (dois dedos) antes de começar a arrastar.
        onResponderTerminationRequest: (evento: GestureResponderEvent) =>
          !moveu.current && (evento.nativeEvent.touches?.length ?? 0) >= 2,
        onResponderGrant: (evento: GestureResponderEvent) => {
          moveu.current = false;
          ultima.current = posicao;
          inicio.current = { x: evento.nativeEvent.pageX, y: evento.nativeEvent.pageY };
          aoEncostar?.();
          // Impede a rolagem nativa de tomar o arraste.
          return true;
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
  janela: {
    alignSelf: 'center',
    overflow: 'hidden',
  },
  conteudo: {
    // A pinça estica o terreno a partir do canto, onde o deslocamento é medido.
    transformOrigin: 'left top',
  },
  semToque: {
    pointerEvents: 'none',
  },
  linha: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  centro: {
    justifyContent: 'center',
  },
  textoZoom: {
    minWidth: medidas.areaToqueMinima,
    textAlign: 'center',
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
