import { StyleSheet, Text, View } from 'react-native';

import { formatarEmissaoComUnidade } from './formatacao';
import { medidas, useTema } from './tema';

export type MarcoRemocao = {
  anos: number;
  remocaoKgCo2: number;
};

type Props = {
  marcos: MarcoRemocao[];
  emissaoKgCo2e: number;
  // Como a emissão é chamada na legenda: "Emitido em outubro".
  rotuloEmissao: string;
};

// Barras horizontais com o CO₂ removido em cada marco, numa escala só, e uma
// linha vertical na emissão do mês (docs/design.md, "GraficoRemocao"). Uma
// série só: os valores ficam escritos ao lado, sem caixa de legenda; a linha da
// emissão tem a sua própria legenda abaixo das barras.
export function GraficoRemocao({ marcos, emissaoKgCo2e, rotuloEmissao }: Props) {
  const { cores, tipografia, espacamento, raios } = useTema();
  const maximo = Math.max(emissaoKgCo2e, ...marcos.map((m) => m.remocaoKgCo2));
  const fracao = (valor: number) => (maximo > 0 ? Math.min(valor / maximo, 1) : 0);
  const posicaoEmissao = `${fracao(emissaoKgCo2e) * 100}%` as const;

  const descricao =
    marcos
      .map((m) => `Em ${m.anos} anos, ${formatarEmissaoComUnidade(m.remocaoKgCo2)} removidos`)
      .join('. ') + `. ${rotuloEmissao}: ${formatarEmissaoComUnidade(emissaoKgCo2e)}.`;

  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={descricao}
      style={{ gap: espacamento.p }}
    >
      {marcos.map((marco) => (
        <View key={marco.anos} style={{ gap: espacamento.mini }}>
          <View style={estilos.linha}>
            <Text style={[tipografia.legenda, { color: cores.textoSuave }]}>
              Em {marco.anos} anos
            </Text>
            <Text style={[tipografia.numeroLinha, { color: cores.texto }]}>
              {formatarEmissaoComUnidade(marco.remocaoKgCo2)}
            </Text>
          </View>
          <View
            style={[
              estilos.trilha,
              {
                height: medidas.alturaBarra,
                borderRadius: raios.marcador,
                backgroundColor: cores.trilhaAnel,
              },
            ]}
          >
            <View
              style={{
                width: `${fracao(marco.remocaoKgCo2) * 100}%`,
                height: medidas.alturaBarra,
                borderRadius: raios.marcador,
                backgroundColor: cores.grafico1,
              }}
            />
            <View
              style={[
                estilos.referencia,
                {
                  left: posicaoEmissao,
                  width: medidas.linhaReferencia,
                  backgroundColor: cores.texto,
                },
              ]}
            />
          </View>
        </View>
      ))}
      <View style={[estilos.legenda, { gap: espacamento.pp }]}>
        <View
          style={{
            width: medidas.linhaReferencia,
            height: medidas.alturaBarra,
            backgroundColor: cores.texto,
          }}
        />
        <Text style={[tipografia.legenda, { color: cores.textoSuave }]}>
          {rotuloEmissao}: {formatarEmissaoComUnidade(emissaoKgCo2e)}
        </Text>
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  linha: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  trilha: {
    overflow: 'visible',
  },
  referencia: {
    position: 'absolute',
    top: 0,
    bottom: 0,
  },
  legenda: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
