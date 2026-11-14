import { StyleSheet, Text, View } from 'react-native';

import { formatarVariacao } from './formatacao';
import { medidas, useTema } from './tema';

type Props = {
  // Fração da variação (−0,12 é 12% a menos). Nula quando não há percentual,
  // como depois de um mês com zero.
  variacao: number | null;
};

// Pílula com a variação em relação ao mês anterior (histórico, RF07). Queda em
// destaque, com fundo `marca`; alta ou estabilidade só com borda. O sinal no
// texto ("−12%", "+8%") diz o sentido sem depender da cor.
export function EtiquetaVariacao({ variacao }: Props) {
  const { cores, tipografia, espacamento, raios } = useTema();
  const queda = variacao !== null && Math.round(variacao * 100) < 0;

  return (
    <View
      style={[
        estilos.pilula,
        {
          paddingHorizontal: espacamento.pp,
          borderRadius: raios.pilula,
          borderWidth: medidas.bordaCartao,
          borderColor: queda ? cores.marca : cores.borda,
          backgroundColor: queda ? cores.marca : undefined,
        },
      ]}
    >
      <Text style={[tipografia.miniForte, { color: queda ? cores.sobreMarca : cores.textoSuave }]}>
        {variacao === null ? '—' : formatarVariacao(variacao)}
      </Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  pilula: {
    minWidth: medidas.larguraVariacao,
    minHeight: medidas.alturaVariacao,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
