import { StyleSheet, Text, View } from 'react-native';

import type { Area, Ponto } from './geometriaTerreno';
import { Icone } from './Icone';
import { medidas, useTema } from './tema';

type Props = {
  // Nome do terreno que segue o dedo ("Terreno 2").
  rotulo: string;
  // Canto do terreno arrastado, nas coordenadas da tela.
  posicao: Ponto;
  // O dedo está sobre a lixeira: soltar tira o terreno.
  sobreLixeira: boolean;
  aoMedirLixeira: (area: Area) => void;
};

// Camada por cima da tela enquanto um terreno é arrastado: a cópia do terreno
// que segue o dedo e a lixeira no pé da tela. Não recebe toques: o dedo
// continua sendo do terreno que foi segurado.
export function CamadaLixeira({ rotulo, posicao, sobreLixeira, aoMedirLixeira }: Props) {
  const { cores, tipografia, espacamento, raios } = useTema();

  return (
    <View style={[StyleSheet.absoluteFill, estilos.semToque]}>
      {/* A cópia vem antes da lixeira para ficar por baixo dela. */}
      <View
        testID="terreno-arrastado"
        style={[
          estilos.fantasma,
          {
            left: posicao.x,
            top: posicao.y,
            paddingHorizontal: espacamento.m,
            borderRadius: raios.segmento,
            borderWidth: medidas.bordaSelecionada,
            borderColor: sobreLixeira ? cores.perigo : cores.marcaForte,
            backgroundColor: cores.marca,
            // Sobre a lixeira, a cópia fica translúcida e a lixeira aparece por cima.
            opacity: sobreLixeira ? medidas.opacidadeOrigemMuda : 1,
          },
        ]}
      >
        <Text style={[tipografia.itemForte, { color: cores.sobreMarca }]}>{rotulo}</Text>
      </View>
      <View
        style={[
          estilos.aviso,
          {
            bottom: espacamento.xg + medidas.lixeira * medidas.escalaLixeiraAtiva + espacamento.p,
            paddingHorizontal: espacamento.m,
            paddingVertical: espacamento.pp,
            borderRadius: raios.pilula,
            backgroundColor: cores.superficie,
            borderWidth: medidas.bordaCartao,
            borderColor: sobreLixeira ? cores.perigo : cores.borda,
          },
        ]}
      >
        <Text
          accessibilityLiveRegion="polite"
          style={[tipografia.legenda, { color: sobreLixeira ? cores.perigo : cores.texto }]}
        >
          {sobreLixeira ? `Solte para tirar o ${rotulo.toLowerCase()}` : 'Arraste até a lixeira para tirar'}
        </Text>
      </View>

      <View
        testID="lixeira"
        onLayout={(evento) => {
          const { x, y, width, height } = evento.nativeEvent.layout;
          aoMedirLixeira({ x, y, largura: width, altura: height });
        }}
        style={[
          estilos.lixeira,
          {
            bottom: espacamento.xg,
            marginLeft: -medidas.lixeira / 2,
            borderRadius: raios.pilula,
            borderWidth: medidas.bordaSelecionada,
            borderColor: cores.perigo,
            backgroundColor: sobreLixeira ? cores.perigo : cores.superficie,
            transform: [{ scale: sobreLixeira ? medidas.escalaLixeiraAtiva : 1 }],
          },
        ]}
      >
        <Icone
          nome="lixeira"
          cor={sobreLixeira ? 'superficie' : 'perigo'}
          fundo={sobreLixeira ? 'perigo' : 'superficie'}
        />
      </View>

    </View>
  );
}

const estilos = StyleSheet.create({
  semToque: {
    pointerEvents: 'none',
  },
  aviso: {
    position: 'absolute',
    alignSelf: 'center',
  },
  lixeira: {
    position: 'absolute',
    left: '50%',
    width: medidas.lixeira,
    height: medidas.lixeira,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fantasma: {
    position: 'absolute',
    minHeight: medidas.areaToqueMinima,
    justifyContent: 'center',
  },
});
