import { useEffect, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';

import type { Mes, MesDaJanela } from '@/calculo/historico';

import { abreviacaoDoMes, formatarEmissaoNaUnidade, nomeDoMes } from './formatacao';
import { alturasDasBarras } from './geometriaBarras';
import { medidas, useTema } from './tema';
import { useReduzirMovimento } from './useReduzirMovimento';

const DURACAO_MS = 700;
// O valor em cima da barra cresce com a fonte do sistema só até este limite,
// para caber na coluna de cada mês.
const ESCALA_MAXIMA_VALOR = 1.4;

type Props = {
  // Meses seguidos, do mais antigo ao mais recente.
  meses: MesDaJanela[];
  // Mês em destaque (o mais recente registrado), se estiver na janela.
  destaque: Mes | null;
  // Muda quando a janela muda, para as barras crescerem de novo.
  chaveAnimacao: string;
};

// Barras verticais das emissões de cada mês (histórico, RF07). Valores sempre
// em kg, com a legenda "Valores em kg CO₂e" logo abaixo, na tela. As barras
// crescem a partir da base como o anel da Início: 700 ms, saída suave.
export function GraficoMeses({ meses, destaque, chaveAnimacao }: Props) {
  const { cores, tipografia, espacamento } = useTema();
  const reduzirMovimento = useReduzirMovimento();
  const [progresso] = useState(() => new Animated.Value(0));

  const alturas = alturasDasBarras(
    meses.map((m) => m.totalKgCo2e),
    medidas.alturaMaximaBarraMes,
    medidas.alturaMinimaBarraMes,
  );

  useEffect(() => {
    if (reduzirMovimento) {
      progresso.setValue(1);
      return;
    }
    progresso.setValue(0);
    const animacao = Animated.timing(progresso, {
      toValue: 1,
      duration: DURACAO_MS,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    });
    animacao.start();
    return () => animacao.stop();
  }, [chaveAnimacao, reduzirMovimento, progresso]);

  const descricao =
    'Emissões por mês, em quilos de CO₂e: ' +
    meses
      .map(
        (m) =>
          `${nomeDoMes(m.mes)} de ${m.ano}, ${
            m.totalKgCo2e === null ? 'sem registro' : formatarEmissaoNaUnidade(m.totalKgCo2e, 'kg')
          }`,
      )
      .join('; ') +
    '.';

  return (
    <View accessible accessibilityRole="image" accessibilityLabel={descricao} style={estilos.barras}>
      {meses.map((m, i) => {
        const altura = alturas[i];
        const emDestaque = destaque !== null && destaque.ano === m.ano && destaque.mes === m.mes;
        const corTexto = emDestaque ? cores.texto : cores.textoSuave;

        return (
          <View key={`${m.ano}-${m.mes}`} style={[estilos.coluna, { gap: espacamento.mini }]}>
            <Text
              numberOfLines={1}
              maxFontSizeMultiplier={ESCALA_MAXIMA_VALOR}
              style={[tipografia.numeroBarra, { color: corTexto }]}
            >
              {m.totalKgCo2e === null ? '—' : formatarEmissaoNaUnidade(m.totalKgCo2e, 'kg')}
            </Text>
            {altura !== null && (
              <Animated.View
                style={{
                  width: medidas.larguraBarraMes,
                  height: progresso.interpolate({ inputRange: [0, 1], outputRange: [0, altura] }),
                  borderTopLeftRadius: medidas.raioTopoBarraMes,
                  borderTopRightRadius: medidas.raioTopoBarraMes,
                  borderBottomLeftRadius: medidas.raioBaseBarraMes,
                  borderBottomRightRadius: medidas.raioBaseBarraMes,
                  backgroundColor: emDestaque ? cores.grafico1 : cores.grafico3,
                }}
              />
            )}
            <Text
              numberOfLines={1}
              maxFontSizeMultiplier={ESCALA_MAXIMA_VALOR}
              style={[emDestaque ? tipografia.miniForte : tipografia.nota, { color: corTexto }]}
            >
              {abreviacaoDoMes(m.mes).toLowerCase()}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const estilos = StyleSheet.create({
  barras: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  coluna: {
    flex: 1,
    alignItems: 'center',
  },
});
