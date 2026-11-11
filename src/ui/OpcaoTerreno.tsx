import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View, type GestureResponderEvent } from 'react-native';

import type { Ponto } from './geometriaTerreno';
import { medidas, useTema } from './tema';

// Um terreno na escolha de terrenos da distribuição de mudas. Tocar abre o
// terreno. Tocar e segurar o pega para arrastar até a lixeira (o padrão de
// arrastar e soltar das telas iniciais de celular); mexer o dedo antes disso
// deixa a lista rolar para os lados.

// Tempo de toque e segure para pegar o terreno.
export const DURACAO_SEGURAR_MS = 500;
// Quanto o dedo pode tremer, em pontos, sem desistir de segurar.
const TREMOR_MAXIMO = 8;

export type Pegada = {
  // Onde está o dedo, na página.
  pagina: Ponto;
  // Onde o dedo pegou o terreno, a partir do canto dele.
  noItem: Ponto;
};

type Props = {
  nome: string;
  detalhe: string;
  descricao: string;
  escolhido: boolean;
  // Sem isso, segurar não pega o terreno (o plano tem um terreno só).
  podeTirar: boolean;
  // Este terreno está sendo arrastado: fica apagado no lugar.
  arrastando: boolean;
  aoTocar: () => void;
  aoSegurar: (pegada: Pegada) => void;
  aoArrastar: (pagina: Ponto) => void;
  aoSoltar: (pagina: Ponto) => void;
  aoCancelar: () => void;
  // Leitor de tela: tira o terreno sem arrastar.
  aoTirar: () => void;
};

export function OpcaoTerreno({
  nome,
  detalhe,
  descricao,
  escolhido,
  podeTirar,
  arrastando,
  aoTocar,
  aoSegurar,
  aoArrastar,
  aoSoltar,
  aoCancelar,
  aoTirar,
}: Props) {
  const { cores, tipografia, espacamento, raios } = useTema();
  const [pressionado, setPressionado] = useState(false);
  const relogio = useRef<ReturnType<typeof setTimeout> | null>(null);
  const segurando = useRef(false);
  const desistiu = useRef(false);
  const inicio = useRef<Ponto>({ x: 0, y: 0 });
  const ultima = useRef<Ponto>({ x: 0, y: 0 });
  const noItem = useRef<Ponto>({ x: 0, y: 0 });

  function pararRelogio() {
    if (relogio.current !== null) clearTimeout(relogio.current);
    relogio.current = null;
  }

  // Desmontado no meio do toque, o relógio não dispara depois.
  useEffect(() => pararRelogio, []);

  const tratadores = {
    onStartShouldSetResponder: () => true,
    // Antes de pegar, a lista pode rolar; depois, o dedo é do terreno.
    onResponderTerminationRequest: () => !segurando.current,
    onResponderGrant: (evento: GestureResponderEvent) => {
      const { pageX, pageY, locationX, locationY } = evento.nativeEvent;
      inicio.current = { x: pageX, y: pageY };
      ultima.current = { x: pageX, y: pageY };
      noItem.current = { x: locationX, y: locationY };
      segurando.current = false;
      desistiu.current = false;
      setPressionado(true);
      pararRelogio();
      if (podeTirar) {
        relogio.current = setTimeout(() => {
          relogio.current = null;
          segurando.current = true;
          aoSegurar({ pagina: ultima.current, noItem: noItem.current });
        }, DURACAO_SEGURAR_MS);
      }
      // Não trava a rolagem nativa: sem segurar, o dedo pode rolar a lista.
      return false;
    },
    onResponderMove: (evento: GestureResponderEvent) => {
      const { pageX, pageY } = evento.nativeEvent;
      ultima.current = { x: pageX, y: pageY };
      if (segurando.current) {
        aoArrastar(ultima.current);
        return;
      }
      const tremeu =
        Math.abs(pageX - inicio.current.x) > TREMOR_MAXIMO ||
        Math.abs(pageY - inicio.current.y) > TREMOR_MAXIMO;
      if (tremeu) {
        // Mexeu antes de pegar: é rolagem, e não toque nem arraste.
        desistiu.current = true;
        pararRelogio();
        setPressionado(false);
      }
    },
    onResponderRelease: () => {
      pararRelogio();
      setPressionado(false);
      if (segurando.current) aoSoltar(ultima.current);
      else if (!desistiu.current) aoTocar();
      segurando.current = false;
    },
    onResponderTerminate: () => {
      pararRelogio();
      setPressionado(false);
      if (segurando.current) aoCancelar();
      segurando.current = false;
    },
  };

  return (
    <View
      {...tratadores}
      accessible
      accessibilityRole="radio"
      accessibilityState={{ checked: escolhido }}
      accessibilityLabel={descricao}
      accessibilityHint={podeTirar ? 'Toque e segure para arrastar até a lixeira' : undefined}
      accessibilityActions={podeTirar ? [{ name: 'tirar', label: `Tirar o ${nome.toLowerCase()}` }] : undefined}
      onAccessibilityAction={(evento) => {
        if (evento.nativeEvent.actionName === 'tirar') aoTirar();
      }}
      onAccessibilityTap={aoTocar}
      style={[
        estilos.opcao,
        {
          paddingHorizontal: espacamento.m,
          borderRadius: raios.segmento,
          borderWidth: medidas.bordaCartao,
          borderColor: escolhido ? cores.marca : cores.borda,
          backgroundColor: escolhido ? cores.marca : cores.superficie,
          opacity: arrastando
            ? medidas.opacidadeOrigemMuda
            : pressionado
              ? medidas.opacidadePressionado
              : 1,
        },
      ]}
    >
      <Text
        style={[
          escolhido ? tipografia.itemForte : tipografia.item,
          { color: escolhido ? cores.sobreMarca : cores.texto },
        ]}
      >
        {nome}
      </Text>
      <Text style={[tipografia.legenda, { color: escolhido ? cores.sobreMarca : cores.textoSuave }]}>
        {detalhe}
      </Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  opcao: {
    minHeight: medidas.areaToqueMinima,
    justifyContent: 'center',
  },
});
