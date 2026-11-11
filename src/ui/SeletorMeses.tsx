import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BotaoPrimario } from './BotaoPrimario';
import { abreviacaoDoMes, formatarEmissaoComUnidade, nomeDoMes } from './formatacao';
import { Icone } from './Icone';
import { margemTela, medidas, useTema } from './tema';
import { useReduzirMovimento } from './useReduzirMovimento';

export type MesComEmissao = {
  // AAAA-MM.
  id: string;
  ano: number;
  // 1 a 12.
  mes: number;
  emissaoKgCo2e: number;
};

type Props = {
  visivel: boolean;
  // Só os meses registrados podem ser escolhidos.
  meses: MesComEmissao[];
  selecionados: string[];
  // Mês aberto na Início, que vira o atalho "Só <mês>".
  idAberto: string;
  aoConfirmar: (ids: string[]) => void;
  aoFechar: () => void;
};

const MESES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const MESES_POR_LINHA = 3;

// Folha inferior para escolher vários meses (simulação de plantio, RF06):
// atalhos no topo, grade de meses com marcação múltipla, total ao vivo e
// "Simular" para confirmar. Fechar sem confirmar descarta a escolha. Mesma
// aparência do SeletorPeriodo, que escolhe um mês só.
export function SeletorMeses({ visivel, ...props }: Props) {
  const { cores } = useTema();
  const reduzirMovimento = useReduzirMovimento();

  return (
    <Modal
      visible={visivel}
      transparent
      animationType={reduzirMovimento ? 'none' : 'fade'}
      onRequestClose={props.aoFechar}
    >
      <View style={[estilos.fundo, { backgroundColor: cores.veu }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Fechar sem mudar os meses"
          onPress={props.aoFechar}
          style={estilos.fora}
        />
        {/* Montado só com a folha aberta: cada abertura parte da escolha atual. */}
        <Folha {...props} />
      </View>
    </Modal>
  );
}

function iguais(a: string[], b: string[]): boolean {
  return a.length === b.length && a.every((id) => b.includes(id));
}

function Folha({ meses, selecionados, idAberto, aoConfirmar }: Omit<Props, 'visivel'>) {
  const { cores, tipografia, espacamento, raios } = useTema();
  const insets = useSafeAreaInsets();
  const [escolhidos, setEscolhidos] = useState(selecionados);

  const anos = [...new Set(meses.map((m) => m.ano))].sort((a, b) => a - b);
  const aberto = meses.find((m) => m.id === idAberto);
  const [ano, setAno] = useState(aberto?.ano ?? anos[anos.length - 1] ?? 0);
  const posicaoAno = anos.indexOf(ano);
  const anoAnterior = anos[posicaoAno - 1];
  const anoSeguinte = anos[posicaoAno + 1];

  const doAno = (a: number) => meses.filter((m) => m.ano === a).map((m) => m.id);
  const atalhos = [
    ...(aberto ? [{ rotulo: `Só ${nomeDoMes(aberto.mes)}`, ids: [aberto.id] }] : []),
    // "Todo <ano>" só faz sentido quando há meses de mais de um ano.
    ...(aberto && anos.length > 1
      ? [{ rotulo: `Todo ${aberto.ano}`, ids: doAno(aberto.ano) }]
      : []),
    { rotulo: 'Todos os meses', ids: meses.map((m) => m.id) },
  ];

  const total = meses
    .filter((m) => escolhidos.includes(m.id))
    .reduce((soma, m) => soma + m.emissaoKgCo2e, 0);
  const registradosNoAno = doAno(ano).length;
  const marcadosNoAno = doAno(ano).filter((id) => escolhidos.includes(id)).length;

  function alternar(id: string) {
    setEscolhidos((atuais) =>
      atuais.includes(id) ? atuais.filter((x) => x !== id) : [...atuais, id],
    );
  }

  const linhas: number[][] = [];
  for (let i = 0; i < MESES.length; i += MESES_POR_LINHA) {
    linhas.push(MESES.slice(i, i + MESES_POR_LINHA));
  }

  return (
    <View
      style={[
        estilos.folha,
        {
          backgroundColor: cores.superficie,
          borderTopLeftRadius: raios.cartao,
          borderTopRightRadius: raios.cartao,
        },
      ]}
    >
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: margemTela,
          paddingTop: espacamento.gg,
          paddingBottom: espacamento.gg + insets.bottom,
          gap: espacamento.m,
        }}
      >
        <Text accessibilityRole="header" style={[tipografia.tituloDetalhe, { color: cores.texto }]}>
          Quais meses simular?
        </Text>

        <View accessibilityRole="radiogroup" style={[estilos.atalhos, { gap: espacamento.pp }]}>
          {atalhos.map((atalho) => {
            const marcado = iguais(atalho.ids, escolhidos);
            return (
              <Pressable
                key={atalho.rotulo}
                accessibilityRole="radio"
                accessibilityState={{ checked: marcado }}
                onPress={() => setEscolhidos(atalho.ids)}
                style={({ pressed }) => [
                  estilos.atalho,
                  {
                    paddingHorizontal: espacamento.m,
                    borderRadius: raios.pilula,
                    borderWidth: medidas.bordaCartao,
                    borderColor: marcado ? cores.marca : cores.borda,
                    backgroundColor: marcado ? cores.marca : 'transparent',
                    opacity: pressed ? medidas.opacidadePressionado : 1,
                  },
                ]}
              >
                <Text
                  style={[
                    marcado ? tipografia.itemForte : tipografia.item,
                    { color: marcado ? cores.sobreMarca : cores.texto },
                  ]}
                >
                  {atalho.rotulo}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={estilos.linhaAno}>
          <BotaoAno
            icone="anterior"
            rotulo={anoAnterior ? `Ano anterior, ${anoAnterior}` : 'Ano anterior'}
            desativado={anoAnterior === undefined}
            onPress={() => anoAnterior !== undefined && setAno(anoAnterior)}
          />
          <Text accessibilityRole="header" style={[tipografia.numeroLinha, { color: cores.texto }]}>
            {ano}
          </Text>
          <BotaoAno
            icone="abrir"
            rotulo={anoSeguinte ? `Próximo ano, ${anoSeguinte}` : 'Próximo ano'}
            desativado={anoSeguinte === undefined}
            onPress={() => anoSeguinte !== undefined && setAno(anoSeguinte)}
          />
        </View>

        <View
          accessibilityLabel={`Meses de ${ano}, ${marcadosNoAno} marcados`}
          style={{ gap: espacamento.pp }}
        >
          {linhas.map((linha) => (
            <View key={linha[0]} style={[estilos.linhaMeses, { gap: espacamento.pp }]}>
              {linha.map((mes) => {
                const registro = meses.find((m) => m.ano === ano && m.mes === mes);
                const marcado = registro !== undefined && escolhidos.includes(registro.id);
                return (
                  <Pressable
                    key={mes}
                    accessibilityRole="checkbox"
                    accessibilityLabel={
                      registro
                        ? `${nomeDoMes(mes, true)} de ${ano}, ${formatarEmissaoComUnidade(registro.emissaoKgCo2e)} de CO₂e`
                        : `${nomeDoMes(mes, true)} de ${ano}, sem registro`
                    }
                    accessibilityState={{ checked: marcado, disabled: !registro }}
                    disabled={!registro}
                    onPress={() => registro && alternar(registro.id)}
                    style={({ pressed }) => [
                      estilos.mes,
                      {
                        gap: espacamento.mini,
                        borderRadius: raios.segmento,
                        borderWidth: medidas.bordaCartao,
                        borderColor: registro && !marcado ? cores.borda : 'transparent',
                        backgroundColor: marcado ? cores.marca : 'transparent',
                        opacity: pressed ? medidas.opacidadePressionado : 1,
                      },
                    ]}
                  >
                    {/* O ✓ junto da cor: a marcação não depende só do verde. */}
                    {marcado ? <Icone nome="marcado" cor="sobreMarca" fundo="marca" /> : null}
                    <Text
                      style={[
                        marcado ? tipografia.itemForte : tipografia.item,
                        {
                          color: marcado
                            ? cores.sobreMarca
                            : registro
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
          {registradosNoAno} de 12 meses de {ano} registrados. Meses sem registro não entram na
          conta.
        </Text>

        <Text
          accessibilityLiveRegion="polite"
          style={[tipografia.itemForte, { color: cores.texto }]}
        >
          {escolhidos.length === 0
            ? 'Escolha ao menos um mês'
            : `${escolhidos.length} ${escolhidos.length === 1 ? 'mês' : 'meses'} · ${formatarEmissaoComUnidade(total)} CO₂e`}
        </Text>
        <BotaoPrimario
          rotulo="Simular"
          desativado={escolhidos.length === 0}
          onPress={() =>
            aoConfirmar(meses.filter((m) => escolhidos.includes(m.id)).map((m) => m.id))
          }
        />
      </ScrollView>
    </View>
  );
}

function BotaoAno({
  icone,
  rotulo,
  desativado,
  onPress,
}: {
  icone: 'anterior' | 'abrir';
  rotulo: string;
  desativado: boolean;
  onPress: () => void;
}) {
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
        { borderRadius: raios.pilula, opacity: pressed ? medidas.opacidadePressionado : 1 },
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
  fora: {
    flex: 1,
  },
  folha: {
    maxHeight: '90%',
  },
  atalhos: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  atalho: {
    minHeight: medidas.areaToqueMinima,
    justifyContent: 'center',
  },
  linhaAno: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  linhaMeses: {
    flexDirection: 'row',
  },
  mes: {
    flex: 1,
    flexDirection: 'row',
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
