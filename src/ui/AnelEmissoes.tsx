import { useEffect, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { formatarEmissao, formatarEmissaoNaUnidade } from './formatacao';
import { calcularSegmentos, type SegmentoAnel } from './geometriaAnel';
import { medidas, useTema, type Cores } from './tema';
import { useReduzirMovimento } from './useReduzirMovimento';

// Gráfico em anel das emissões do período (RF03), como no protótipo: o anel
// se desenha do zero até o valor, segmento por segmento, e o total no centro
// conta junto. O progresso vem da Animated do React Native (e não do
// Reanimated, que o expo-router/testing-library troca por um objeto vazio nos
// testes); a cada quadro, o comprimento visível de cada segmento é recalculado.
// Cada segmento é posicionado pelo strokeDashoffset, sem girar o círculo, e o
// anel inteiro gira −90° para começar no topo. Ver docs/design.md.

const DURACAO_MS = 700;
const CORES_SEGMENTOS: (keyof Cores)[] = ['grafico1', 'grafico2', 'grafico3'];

export type SegmentoEmissao = {
  id: string;
  emissaoKgCo2e: number;
};

type Props = {
  // Da maior para a menor emissão; recebem grafico1, grafico2 e grafico3.
  segmentos: SegmentoEmissao[];
  totalKgCo2e: number;
  // Completa a unidade abaixo do total: "este mês" → "kg CO₂e este mês".
  complementoRotulo: string;
  // Descrição para leitores de tela, com os valores em texto.
  descricao: string;
  // Muda quando o período muda, para a animação recomeçar.
  chaveAnimacao: string;
};

export function AnelEmissoes({
  segmentos,
  totalKgCo2e,
  complementoRotulo,
  descricao,
  chaveAnimacao,
}: Props) {
  const { cores, tipografia } = useTema();
  const reduzirMovimento = useReduzirMovimento();
  const [progresso] = useState(() => new Animated.Value(0));
  // Progresso da animação, de 0 a 1.
  const [andamento, setAndamento] = useState(0);

  const tamanho = medidas.areaAnel;
  const centro = tamanho / 2;
  const raio = (medidas.diametroAnel - medidas.espessuraAnel) / 2;
  const circunferencia = 2 * Math.PI * raio;
  const geometria = calcularSegmentos(
    segmentos.map((s) => s.emissaoKgCo2e),
    circunferencia,
    medidas.espacoEntreSegmentos,
  );
  const { unidade } = formatarEmissao(totalKgCo2e);

  useEffect(() => {
    const ouvinte = progresso.addListener(({ value }) => setAndamento(value));
    // O ouvinte já recebe este valor, então o anel e o total voltam a zero juntos.
    progresso.setValue(0);
    if (reduzirMovimento) {
      progresso.setValue(1);
      return () => progresso.removeListener(ouvinte);
    }
    const animacao = Animated.timing(progresso, {
      toValue: 1,
      duration: DURACAO_MS,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    });
    animacao.start();
    return () => {
      animacao.stop();
      progresso.removeListener(ouvinte);
    };
  }, [chaveAnimacao, totalKgCo2e, reduzirMovimento, progresso]);

  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={descricao}
      style={{ width: tamanho, height: tamanho }}
    >
      <View style={estilos.girado}>
        <Svg width={tamanho} height={tamanho} viewBox={`0 0 ${tamanho} ${tamanho}`} aria-hidden>
          <Circle
            cx={centro}
            cy={centro}
            r={raio}
            fill="none"
            stroke={cores.trilhaAnel}
            strokeWidth={medidas.espessuraAnel}
          />
          {geometria.map((segmento, indice) => {
            const visivel = comprimentoVisivel(segmento, andamento);
            if (visivel <= 0) return null;
            return (
              <Circle
                key={segmentos[indice].id}
                cx={centro}
                cy={centro}
                r={raio}
                fill="none"
                stroke={cores[CORES_SEGMENTOS[indice] ?? 'grafico3']}
                strokeWidth={medidas.espessuraAnel}
                strokeDasharray={[visivel, circunferencia]}
                // Deslocamento negativo empurra o traço até o início do segmento.
                strokeDashoffset={-segmento.inicio}
              />
            );
          })}
        </Svg>
      </View>
      <View style={estilos.centro} pointerEvents="none">
        <Text
          maxFontSizeMultiplier={1.2}
          style={[tipografia.numeroDestaque, { color: cores.texto }]}
        >
          {formatarEmissaoNaUnidade(andamento * totalKgCo2e, unidade)}
        </Text>
        <Text maxFontSizeMultiplier={1.2} style={[tipografia.legenda, { color: cores.textoSuave }]}>
          {`${unidade} CO₂e ${complementoRotulo}`}
        </Text>
      </View>
    </View>
  );
}

// Parte já desenhada de um segmento, dado o progresso geral da animação.
function comprimentoVisivel(segmento: SegmentoAnel, andamento: number): number {
  if (segmento.comprimento <= 0) return 0;
  const largura = segmento.progressoFinal - segmento.progressoInicial;
  const fracao = largura > 0 ? (andamento - segmento.progressoInicial) / largura : 1;
  return Math.min(Math.max(fracao, 0), 1) * segmento.comprimento;
}

const estilos = StyleSheet.create({
  girado: {
    transform: [{ rotate: '-90deg' }],
  },
  centro: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
