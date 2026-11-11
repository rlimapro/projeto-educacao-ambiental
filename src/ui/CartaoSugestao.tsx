import { StyleSheet, Text, View } from 'react-native';

import type { ImpactoSugestao, SugestaoReducao } from '@/calculo/tipos';

import { Cartao } from './Cartao';
import { Icone } from './Icone';
import { medidas, useTema } from './tema';

const rotulosImpacto: Record<ImpactoSugestao, string> = {
  alto: 'Impacto alto',
  medio: 'Impacto médio',
  baixo: 'Impacto baixo',
};

type Props = {
  sugestao: SugestaoReducao;
};

// Sugestão de redução (RF08): ícone num círculo, título, descrição e o impacto.
// Impacto alto vem preenchido em marca; os outros, só com borda.
export function CartaoSugestao({ sugestao }: Props) {
  const { cores, tipografia, espacamento, raios } = useTema();
  const alto = sugestao.impacto === 'alto';

  return (
    <Cartao style={[estilos.linha, { gap: espacamento.p }]}>
      <View style={[estilos.circulo, { borderRadius: raios.pilula, backgroundColor: cores.fundo }]}>
        <Icone nome={sugestao.icone} fundo="fundo" />
      </View>
      <View style={[estilos.textos, { gap: espacamento.mini }]}>
        <Text style={[tipografia.opcao, { color: cores.texto }]}>{sugestao.titulo}</Text>
        <Text style={[tipografia.apoio, { color: cores.textoSuave }]}>{sugestao.descricao}</Text>
        <View
          style={[
            estilos.impacto,
            {
              marginTop: espacamento.mini,
              paddingHorizontal: espacamento.p,
              paddingVertical: espacamento.mini,
              borderRadius: raios.pilula,
              borderWidth: medidas.bordaCartao,
              borderColor: alto ? cores.marca : cores.borda,
              backgroundColor: alto ? cores.marca : 'transparent',
            },
          ]}
        >
          <Text
            style={[tipografia.miniForte, { color: alto ? cores.sobreMarca : cores.textoSuave }]}
          >
            {rotulosImpacto[sugestao.impacto]}
          </Text>
        </View>
      </View>
    </Cartao>
  );
}

const estilos = StyleSheet.create({
  linha: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  circulo: {
    width: medidas.circuloIcone,
    height: medidas.circuloIcone,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textos: {
    flex: 1,
  },
  impacto: {
    alignSelf: 'flex-start',
  },
});
