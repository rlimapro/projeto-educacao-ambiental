import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Platform, StyleSheet, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { medidas, useTema } from './tema';
import { useReduzirMovimento } from './useReduzirMovimento';

type Props = {
  // Chamado quando o primeiro quadro está na tela: hora de esconder a abertura
  // nativa, que é idêntica a ele (só a trilha do anel).
  aoMostrar: () => void;
  aoTerminar: () => void;
};

// Abertura animada (docs/design.md, "Abertura"). O anel das emissões se fecha,
// um broto cresce no meio e aparece a proposta do app, na ordem em que ele
// pede para agir: medir, reduzir e só então neutralizar.

// Geometria na grade de 200 do anel da Início: espessura 22, raio médio 89.
const RAIO = 89;
const ESPESSURA = 22;
const CIRCUNFERENCIA = 2 * Math.PI * RAIO;

const DURACAO_ANEL_MS = 700;
const INICIO_BROTO_MS = 350;
const INICIO_FRASE_MS = 700;
const DURACAO_FRASE_MS = 300;
const PAUSA_FINAL_MS = 350;
const DURACAO_SAIDA_MS = 350;
// Com movimento reduzido, tudo já aparece pronto e fica um instante na tela.
const PAUSA_SEM_MOVIMENTO_MS = 600;

const MOLA_BROTO = { stiffness: 180, damping: 14, mass: 1 };
// Transformações e opacidade rodam na thread nativa; a web não tem esse módulo.
const DRIVER_NATIVO = Platform.OS !== 'web';

export function AberturaAnimada({ aoMostrar, aoTerminar }: Props) {
  const { cores, tipografia, espacamento } = useTema();
  const reduzirMovimento = useReduzirMovimento();
  const [anel] = useState(() => new Animated.Value(0));
  const [broto] = useState(() => new Animated.Value(0));
  const [frase] = useState(() => new Animated.Value(0));
  const [saida] = useState(() => new Animated.Value(1));
  const [progressoAnel, setProgressoAnel] = useState(0);
  const mostrada = useRef(false);

  useEffect(() => {
    const id = anel.addListener(({ value }) => setProgressoAnel(value));
    return () => anel.removeListener(id);
  }, [anel]);

  useEffect(() => {
    if (reduzirMovimento) {
      anel.setValue(1);
      broto.setValue(1);
      frase.setValue(1);
      const espera = setTimeout(aoTerminar, PAUSA_SEM_MOVIMENTO_MS);
      return () => clearTimeout(espera);
    }

    const animacao = Animated.sequence([
      Animated.parallel([
        Animated.timing(anel, {
          toValue: 1,
          duration: DURACAO_ANEL_MS,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false,
        }),
        Animated.sequence([
          Animated.delay(INICIO_BROTO_MS),
          Animated.spring(broto, { toValue: 1, ...MOLA_BROTO, useNativeDriver: DRIVER_NATIVO }),
        ]),
        Animated.sequence([
          Animated.delay(INICIO_FRASE_MS),
          Animated.timing(frase, {
            toValue: 1,
            duration: DURACAO_FRASE_MS,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: DRIVER_NATIVO,
          }),
        ]),
      ]),
      Animated.delay(PAUSA_FINAL_MS),
      Animated.timing(saida, {
        toValue: 0,
        duration: DURACAO_SAIDA_MS,
        easing: Easing.in(Easing.quad),
        useNativeDriver: DRIVER_NATIVO,
      }),
    ]);
    animacao.start(({ finished }) => {
      if (finished) aoTerminar();
    });
    return () => animacao.stop();
  }, [reduzirMovimento, anel, broto, frase, saida, aoTerminar]);

  function primeiroQuadro() {
    if (mostrada.current) return;
    mostrada.current = true;
    aoMostrar();
  }

  return (
    <Animated.View
      onLayout={primeiroQuadro}
      accessibilityLabel="Meça. Reduza. Neutralize."
      style={[
        StyleSheet.absoluteFill,
        estilos.centro,
        { backgroundColor: cores.fundo, opacity: saida, pointerEvents: 'none' },
      ]}
    >
      <View style={estilos.marca}>
        {/* Gira o anel inteiro para começar no topo, como o AnelEmissoes. */}
        <Svg
          width={medidas.tamanhoIlustracao}
          height={medidas.tamanhoIlustracao}
          viewBox="0 0 200 200"
          style={estilos.girado}
          aria-hidden
        >
          <Circle
            cx={100}
            cy={100}
            r={RAIO}
            stroke={cores.trilhaAnel}
            strokeWidth={ESPESSURA}
            fill="none"
          />
          {progressoAnel > 0 ? (
            <Circle
              cx={100}
              cy={100}
              r={RAIO}
              stroke={cores.grafico1}
              strokeWidth={ESPESSURA}
              fill="none"
              strokeDasharray={`${CIRCUNFERENCIA} ${CIRCUNFERENCIA}`}
              strokeDashoffset={CIRCUNFERENCIA * (1 - progressoAnel)}
            />
          ) : null}
        </Svg>

        {/* O broto cresce a partir da base do caule (y 128 de 200). */}
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            { transformOrigin: '50% 64%', transform: [{ scale: broto }], opacity: broto },
          ]}
        >
          <Svg
            width={medidas.tamanhoIlustracao}
            height={medidas.tamanhoIlustracao}
            viewBox="0 0 200 200"
            aria-hidden
          >
            <Path
              d="M100 128V94"
              stroke={cores.marcaForte}
              strokeWidth={4.66667}
              strokeLinecap="round"
            />
            <Path
              d="M100 110C86 110 76 100 76 86C90 86 100 96 100 110Z"
              stroke={cores.marcaForte}
              strokeWidth={4.66667}
              strokeLinejoin="round"
              fill={cores.marca}
            />
            <Path
              d="M100 96C100 80 111 70 126 70C126 85 116 96 100 96Z"
              stroke={cores.marcaForte}
              strokeWidth={4.66667}
              strokeLinejoin="round"
              fill={cores.marca}
            />
          </Svg>
        </Animated.View>

        <Animated.Text
          style={[
            tipografia.subtitulo,
            estilos.frase,
            {
              top: medidas.tamanhoIlustracao + espacamento.gg,
              color: cores.texto,
              opacity: frase,
              transform: [
                {
                  translateY: frase.interpolate({
                    inputRange: [0, 1],
                    outputRange: [espacamento.pp, 0],
                  }),
                },
              ],
            },
          ]}
        >
          Meça. Reduza. Neutralize.
        </Animated.Text>
      </View>
    </Animated.View>
  );
}

const estilos = StyleSheet.create({
  centro: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Só o anel ocupa o centro da tela, como a imagem da abertura nativa; a frase
  // fica abaixo, fora do cálculo de centralização.
  marca: {
    width: medidas.tamanhoIlustracao,
    height: medidas.tamanhoIlustracao,
  },
  girado: {
    transform: [{ rotate: '-90deg' }],
  },
  frase: {
    position: 'absolute',
    // Mais largo que o anel, para a frase caber numa linha.
    left: -medidas.tamanhoIlustracao,
    right: -medidas.tamanhoIlustracao,
    textAlign: 'center',
  },
});
