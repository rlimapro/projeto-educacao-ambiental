import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BotaoTexto } from './BotaoTexto';
import { abreviacaoDoMes, nomeDoMes } from './formatacao';
import { Icone } from './Icone';
import { margemTela, medidas, useTema } from './tema';
import { useReduzirMovimento } from './useReduzirMovimento';

export type PeriodoEscolhivel = {
  // AAAA-MM.
  id: string;
  ano: number;
  // 1 a 12.
  mes: number;
};

type Props = {
  visivel: boolean;
  // Só os meses com registro podem ser escolhidos.
  periodos: PeriodoEscolhivel[];
  selecionado: string;
  aoEscolher: (id: string) => void;
  aoFechar: () => void;
};

const MESES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const MESES_POR_LINHA = 3;

// Folha inferior com a grade de meses de um ano e setas para trocar de ano.
// Qualquer mês registrado fica a no máximo um toque, além da troca de ano.
export function SeletorPeriodo({ visivel, periodos, selecionado, aoEscolher, aoFechar }: Props) {
  const { cores } = useTema();
  const reduzirMovimento = useReduzirMovimento();

  return (
    <Modal
      visible={visivel}
      transparent
      animationType={reduzirMovimento ? 'none' : 'fade'}
      onRequestClose={aoFechar}
    >
      <View style={[estilos.fundo, { backgroundColor: cores.veu }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Fechar"
          onPress={aoFechar}
          style={estilos.areaFora}
        />
        {/* Montado só com a folha aberta: cada abertura começa no ano do mês escolhido. */}
        <Folha
          periodos={periodos}
          selecionado={selecionado}
          aoEscolher={aoEscolher}
          aoFechar={aoFechar}
        />
      </View>
    </Modal>
  );
}

function Folha({ periodos, selecionado, aoEscolher, aoFechar }: Omit<Props, 'visivel'>) {
  const { cores, tipografia, espacamento, raios } = useTema();
  const insets = useSafeAreaInsets();

  const anos = [...new Set(periodos.map((p) => p.ano))].sort((a, b) => a - b);
  const anoInicial = periodos.find((p) => p.id === selecionado)?.ano ?? anos[anos.length - 1] ?? 0;
  const [ano, setAno] = useState(anoInicial);

  const posicaoAno = anos.indexOf(ano);
  const anoAnterior = anos[posicaoAno - 1];
  const anoSeguinte = anos[posicaoAno + 1];

  const linhas: number[][] = [];
  for (let i = 0; i < MESES.length; i += MESES_POR_LINHA) {
    linhas.push(MESES.slice(i, i + MESES_POR_LINHA));
  }

  return (
    <View
      style={{
        backgroundColor: cores.superficie,
        borderTopLeftRadius: raios.cartao,
        borderTopRightRadius: raios.cartao,
        paddingHorizontal: margemTela,
        paddingTop: espacamento.m,
        paddingBottom: espacamento.gg + insets.bottom,
        gap: espacamento.m,
      }}
    >
      <View style={estilos.linha}>
        <Text accessibilityRole="header" style={[tipografia.subtitulo, { color: cores.texto }]}>
          Escolha o mês
        </Text>
        <BotaoTexto rotulo="Fechar" onPress={aoFechar} />
      </View>

      <View style={estilos.linha}>
        <BotaoSeta
          icone="anterior"
          rotulo={anoAnterior ? `Ano anterior, ${anoAnterior}` : 'Ano anterior'}
          desativado={anoAnterior === undefined}
          onPress={() => anoAnterior !== undefined && setAno(anoAnterior)}
        />
        <Text accessibilityRole="header" style={[tipografia.numeroLinha, { color: cores.texto }]}>
          {ano}
        </Text>
        <BotaoSeta
          icone="abrir"
          rotulo={anoSeguinte ? `Próximo ano, ${anoSeguinte}` : 'Próximo ano'}
          desativado={anoSeguinte === undefined}
          onPress={() => anoSeguinte !== undefined && setAno(anoSeguinte)}
        />
      </View>

      <View
        accessibilityRole="radiogroup"
        accessibilityLabel={`Meses de ${ano}`}
        style={{ gap: espacamento.pp }}
      >
        {linhas.map((linha) => (
          <View key={linha[0]} style={[estilos.linhaMeses, { gap: espacamento.pp }]}>
            {linha.map((mes) => {
              const periodo = periodos.find((p) => p.ano === ano && p.mes === mes);
              const marcado = periodo !== undefined && periodo.id === selecionado;
              const disponivel = periodo !== undefined;
              return (
                <Pressable
                  key={mes}
                  accessibilityRole="radio"
                  accessibilityLabel={`${nomeDoMes(mes, true)} de ${ano}`}
                  accessibilityHint={disponivel ? undefined : 'Sem consumo registrado'}
                  accessibilityState={{
                    checked: marcado,
                    disabled: !disponivel,
                  }}
                  disabled={!disponivel}
                  onPress={() => periodo && aoEscolher(periodo.id)}
                  style={({ pressed }) => [
                    estilos.mes,
                    {
                      borderRadius: raios.segmento,
                      borderWidth: medidas.bordaCartao,
                      borderColor: disponivel && !marcado ? cores.borda : 'transparent',
                      backgroundColor: marcado ? cores.marca : 'transparent',
                      opacity: pressed ? medidas.opacidadePressionado : 1,
                    },
                  ]}
                >
                  <Text
                    style={[
                      marcado ? tipografia.itemForte : tipografia.item,
                      {
                        color: marcado
                          ? cores.sobreMarca
                          : disponivel
                            ? cores.texto
                            : cores.textoSuave,
                      },
                    ]}
                  >
                    {abreviacaoDoMes(mes)}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        ))}
      </View>

      <Text style={[tipografia.legenda, { color: cores.textoSuave }]}>
        Só dá para escolher meses com consumo registrado.
      </Text>
    </View>
  );
}

type PropsSeta = {
  icone: 'anterior' | 'abrir';
  rotulo: string;
  desativado: boolean;
  onPress: () => void;
};

function BotaoSeta({ icone, rotulo, desativado, onPress }: PropsSeta) {
  const { raios } = useTema();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={rotulo}
      accessibilityState={{ disabled: desativado }}
      disabled={desativado}
      onPress={onPress}
      style={({ pressed }) => [
        estilos.seta,
        {
          borderRadius: raios.pilula,
          opacity: pressed ? medidas.opacidadePressionado : 1,
        },
      ]}
    >
      <Icone nome={icone} cor={desativado ? 'borda' : 'texto'} />
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  fundo: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  areaFora: {
    flex: 1,
  },
  linha: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  linhaMeses: {
    flexDirection: 'row',
  },
  mes: {
    flex: 1,
    minHeight: medidas.areaToqueMinima,
    alignItems: 'center',
    justifyContent: 'center',
  },
  seta: {
    width: medidas.areaToqueMinima,
    height: medidas.areaToqueMinima,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
