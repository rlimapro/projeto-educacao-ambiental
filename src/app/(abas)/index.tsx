import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  HORIZONTE_ANOS,
  TAXA_SEQUESTRO_SEM_ESTADO,
  arvoresParaNeutralizar,
} from '@/calculo/arvores';
import { compararPeriodos, resumirEmissoes } from '@/calculo/resumo';
import type { Perfil } from '@/calculo/tipos';
import { listarPeriodos } from '@/dados/periodos';
import { lerPerfil } from '@/dados/preferencias';
import { AnelEmissoes } from '@/ui/AnelEmissoes';
import { BotaoPrimario } from '@/ui/BotaoPrimario';
import { Cartao } from '@/ui/Cartao';
import { CartaoNumero } from '@/ui/CartaoNumero';
import { Etiqueta } from '@/ui/Etiqueta';
import {
  formatarEmissaoComUnidade,
  formatarParticipacao,
  formatarVariacao,
  nomeDoMes,
} from '@/ui/formatacao';
import { Icone } from '@/ui/Icone';
import { LinhaAcao } from '@/ui/LinhaAcao';
import { LinhaLegenda } from '@/ui/LinhaLegenda';
import { SeletorPeriodo } from '@/ui/SeletorPeriodo';
import { margemTela, medidas, useTema, type Cores } from '@/ui/tema';

// Tela inicial (RF03, RF05, RF07, RF08). Layout segue o protótipo no Figma
// ("04 Início"). Os períodos ainda são de exemplo (ver src/dados/periodos.ts).

const nomesPerfil: Record<Perfil, string> = {
  pessoa: 'Pessoal',
  residencia: 'Residência',
  comercio: 'Comércio',
};

const CORES_FONTES: (keyof Cores)[] = ['grafico1', 'grafico2', 'grafico3'];

export default function Inicio() {
  const { cores, tipografia, espacamento } = useTema();
  const periodos = listarPeriodos();
  const [indice, setIndice] = useState(0);
  const [escolhendoPeriodo, setEscolhendoPeriodo] = useState(false);

  if (periodos.length === 0) {
    return (
      <SafeAreaView
        edges={['top']}
        style={[estilos.vazio, { backgroundColor: cores.fundo, paddingHorizontal: margemTela }]}
      >
        <Cartao style={{ gap: espacamento.m }}>
          <Text accessibilityRole="header" style={[tipografia.subtitulo, { color: cores.texto }]}>
            Nenhum consumo registrado
          </Text>
          <Text style={[tipografia.corpo, { color: cores.textoSuave }]}>
            Registre a conta de luz, o combustível ou o gás do mês para ver suas emissões aqui.
          </Text>
          <BotaoPrimario rotulo="Registrar consumo" onPress={() => router.navigate('/registrar')} />
        </Cartao>
      </SafeAreaView>
    );
  }

  const periodo = periodos[indice];
  const anterior = periodos[indice + 1];
  const resumo = resumirEmissoes(periodo.fontes);
  const comparacao = anterior
    ? compararPeriodos(resumo.totalKgCo2e, resumirEmissoes(anterior.fontes).totalKgCo2e)
    : null;
  const arvores = arvoresParaNeutralizar(resumo.totalKgCo2e, TAXA_SEQUESTRO_SEM_ESTADO);
  const maiorFonte = resumo.fontes[0];
  const mesAtual = indice === 0;
  const nomeMes = nomeDoMes(periodo.mes);
  const titulo = `${nomeDoMes(periodo.mes, true)} ${periodo.ano}`;

  const descricaoAnel =
    `Emissões de ${nomeMes} de ${periodo.ano}: ${formatarEmissaoComUnidade(resumo.totalKgCo2e)} de CO₂e. ` +
    resumo.fontes.map((f) => `${f.nome} ${formatarParticipacao(f.fracao)}`).join(', ') +
    '.';

  function escolherPeriodo(id: string) {
    const escolhido = periodos.findIndex((p) => p.id === id);
    if (escolhido >= 0) setIndice(escolhido);
    setEscolhendoPeriodo(false);
  }

  return (
    <SafeAreaView edges={['top']} style={[estilos.tela, { backgroundColor: cores.fundo }]}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: margemTela,
          paddingVertical: espacamento.m,
          gap: espacamento.m,
        }}
      >
        <View style={[estilos.topo, { minHeight: medidas.areaToqueMinima }]}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Período: ${titulo}`}
            accessibilityHint="Abre a lista de meses"
            onPress={() => setEscolhendoPeriodo(true)}
            style={[estilos.periodo, { gap: espacamento.mini, minHeight: medidas.areaToqueMinima }]}
          >
            <Text style={[tipografia.subtitulo, { color: cores.texto }]}>{titulo}</Text>
            <Icone nome="abrirPeriodo" cor="texto" />
          </Pressable>
          <Etiqueta texto={nomesPerfil[lerPerfil()]} />
        </View>

        <View style={estilos.anel}>
          <AnelEmissoes
            segmentos={resumo.fontes}
            totalKgCo2e={resumo.totalKgCo2e}
            complementoRotulo={mesAtual ? 'este mês' : `em ${nomeMes}`}
            descricao={descricaoAnel}
            chaveAnimacao={periodo.id}
          />
        </View>

        <View style={{ gap: espacamento.pp }}>
          {resumo.fontes.map((fonte, i) => (
            <LinhaLegenda
              key={fonte.id}
              cor={CORES_FONTES[i] ?? 'grafico3'}
              nome={fonte.nome}
              valor={formatarEmissaoComUnidade(fonte.emissaoKgCo2e)}
            />
          ))}
        </View>

        <View style={[estilos.cartoes, { gap: espacamento.p }]}>
          <CartaoNumero
            rotulo="Para neutralizar"
            numero={String(arvores)}
            unidade={arvores === 1 ? 'árvore' : 'árvores'}
            nota={`em ${HORIZONTE_ANOS} anos`}
            corNumero="marcaForte"
          />
          {anterior && comparacao ? (
            <CartaoNumero
              rotulo={`Comparado a ${nomeDoMes(anterior.mes)}`}
              numero={comparacao.variacao === null ? '—' : formatarVariacao(comparacao.variacao)}
              nota={
                comparacao.diferencaKgCo2e === 0
                  ? 'o mesmo que antes'
                  : `${formatarEmissaoComUnidade(Math.abs(comparacao.diferencaKgCo2e))} a ${
                      comparacao.diferencaKgCo2e < 0 ? 'menos' : 'mais'
                    }`
              }
            />
          ) : (
            <CartaoNumero rotulo="Comparação" numero="—" nota="Sem mês anterior registrado" />
          )}
        </View>

        {maiorFonte && maiorFonte.emissaoKgCo2e > 0 && (
          <LinhaAcao
            icone="sugestao"
            titulo="Reduzir antes de compensar"
            descricao={`${periodo.quantidadeSugestoes} ${
              periodo.quantidadeSugestoes === 1 ? 'sugestão' : 'sugestões'
            } para ${maiorFonte.nome.toLowerCase()}`}
          />
        )}
      </ScrollView>

      <SeletorPeriodo
        visivel={escolhendoPeriodo}
        periodos={periodos}
        selecionado={periodo.id}
        aoEscolher={escolherPeriodo}
        aoFechar={() => setEscolhendoPeriodo(false)}
      />
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  tela: {
    flex: 1,
  },
  vazio: {
    flex: 1,
    justifyContent: 'center',
  },
  topo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  periodo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  anel: {
    alignItems: 'center',
  },
  cartoes: {
    flexDirection: 'row',
  },
});
