import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { abreviacaoDoMes, nomeDoMes } from './formatacao';
import { Icone } from './Icone';
import { margemTela, medidas, useTema } from './tema';
import { useReduzirMovimento } from './useReduzirMovimento';

type Props = {
  visivel: boolean;
  selecionado: string;
  periodosRegistrados: string[];
  aoEscolher: (id: string) => void;
  aoFechar: () => void;
};

const MESES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const MESES_POR_LINHA = 3;
const PRIMEIRO_ANO = 2025;
const PRIMEIRO_MES = 8;

export function SeletorMesConsumo({ visivel, selecionado, periodosRegistrados, aoEscolher, aoFechar }: Props) {
  const { cores, tipografia, espacamento, raios } = useTema();
  const reduzirMovimento = useReduzirMovimento();
  const insets = useSafeAreaInsets();
  const anoAtual = new Date().getFullYear();
  const anoSelecionado = Number(selecionado.slice(0, 4));
  const [anoExibido, setAnoExibido] = useState(anoSelecionado);

  const mesesPorLinha: number[][] = [];
  for (let i = 0; i < MESES.length; i += MESES_POR_LINHA) {
    mesesPorLinha.push(MESES.slice(i, i + MESES_POR_LINHA));
  }

  return (
    <Modal visible={visivel} transparent animationType={reduzirMovimento ? 'none' : 'fade'} onRequestClose={aoFechar}>
      <View style={[estilos.fundo, { backgroundColor: cores.veu }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Fechar seletor de mês"
          onPress={aoFechar}
          style={estilos.fora}
        />
        <View
          style={{
            paddingHorizontal: margemTela,
            paddingTop: espacamento.m,
            paddingBottom: espacamento.gg + insets.bottom,
            gap: espacamento.m,
            backgroundColor: cores.superficie,
            borderTopLeftRadius: raios.cartao,
            borderTopRightRadius: raios.cartao,
          }}
        >
          <View style={estilos.linha}>
            <Text accessibilityRole="header" style={[tipografia.subtitulo, { color: cores.texto }]}>
              Escolha o mês do consumo
            </Text>
            <Pressable accessibilityRole="button" onPress={aoFechar} style={estilos.fechar}>
              <Text style={[tipografia.itemForte, { color: cores.texto }]}>Fechar</Text>
            </Pressable>
          </View>

          <View style={estilos.linha}>
            <Seta
              rotulo={`Ano anterior, ${anoExibido - 1}`}
              icone="anterior"
              desativado={anoExibido <= PRIMEIRO_ANO}
              aoPressionar={() => setAnoExibido((ano) => Math.max(PRIMEIRO_ANO, ano - 1))}
            />
            <Text accessibilityRole="header" style={[tipografia.numeroLinha, { color: cores.texto }]}>
              {anoExibido}
            </Text>
            <Seta
              rotulo={`Próximo ano, ${anoExibido + 1}`}
              icone="abrir"
              desativado={anoExibido >= anoAtual}
              aoPressionar={() => setAnoExibido((ano) => Math.min(anoAtual, ano + 1))}
            />
          </View>

          <View accessibilityRole="radiogroup" accessibilityLabel={`Meses de ${anoExibido}`} style={{ gap: espacamento.pp }}>
            {mesesPorLinha.map((linha) => (
              <View key={linha[0]} style={[estilos.linhaMeses, { gap: espacamento.pp }]}>
                {linha.map((mes) => {
                  const id = `${anoExibido}-${String(mes).padStart(2, '0')}`;
                  const registrado = periodosRegistrados.includes(id);
                  const marcado = id === selecionado;
                  const antesDaVigencia = anoExibido < PRIMEIRO_ANO || (anoExibido === PRIMEIRO_ANO && mes < PRIMEIRO_MES);
                  const futuro = anoExibido > anoAtual || (anoExibido === anoAtual && mes > new Date().getMonth() + 1);
                  const desativado = antesDaVigencia || futuro;
                  const rotulo = `${nomeDoMes(mes, true)} de ${anoExibido}`;

                  return (
                    <Pressable
                      key={mes}
                      accessibilityRole="radio"
                      accessibilityLabel={registrado ? `${rotulo}, já registrado` : rotulo}
                      accessibilityHint={antesDaVigencia ? 'Os fatores aprovados começam em agosto de 2025' : futuro ? 'Não é possível registrar um mês futuro' : undefined}
                      accessibilityState={{ checked: marcado, disabled: desativado }}
                      disabled={desativado}
                      onPress={() => aoEscolher(id)}
                      style={({ pressed }) => [
                        estilos.mes,
                        {
                          borderRadius: raios.segmento,
                          borderWidth: medidas.bordaCartao,
                          borderColor: marcado ? cores.marcaForte : registrado ? cores.marcaForte : desativado ? cores.superficie : cores.borda,
                          backgroundColor: marcado ? cores.marca : cores.superficie,
                          opacity: pressed ? medidas.opacidadePressionado : 1,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          marcado ? tipografia.itemForte : tipografia.item,
                          { color: marcado ? cores.sobreMarca : desativado ? cores.textoSuave : cores.texto },
                        ]}
                      >
                        {abreviacaoDoMes(mes)}
                      </Text>
                      {registrado ? <Text style={[tipografia.mini, { color: marcado ? cores.sobreMarca : cores.marcaForte }]}>Registrado</Text> : null}
                    </Pressable>
                  );
                })}
              </View>
            ))}
          </View>

          <Text style={[tipografia.legenda, { color: cores.textoSuave }]}>
            Escolha um mês passado ou o mês atual. Meses com registro podem ser editados.
          </Text>
        </View>
      </View>
    </Modal>
  );
}

type PropsSeta = {
  rotulo: string;
  icone: 'anterior' | 'abrir';
  desativado: boolean;
  aoPressionar: () => void;
};

function Seta({ rotulo, icone, desativado, aoPressionar }: PropsSeta) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={rotulo}
      accessibilityState={{ disabled: desativado }}
      disabled={desativado}
      onPress={aoPressionar}
      style={({ pressed }) => [estilos.seta, { opacity: pressed ? medidas.opacidadePressionado : 1 }]}
    >
      <Icone nome={icone} cor={desativado ? 'borda' : 'texto'} />
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  fundo: { flex: 1, justifyContent: 'flex-end' },
  fora: { flex: 1 },
  linha: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  linhaMeses: { flexDirection: 'row' },
  mes: { flex: 1, minHeight: medidas.areaToqueMinima, alignItems: 'center', justifyContent: 'center' },
  seta: { width: medidas.areaToqueMinima, height: medidas.areaToqueMinima, alignItems: 'center', justifyContent: 'center' },
  fechar: { minHeight: medidas.areaToqueMinima, justifyContent: 'center' },
});
