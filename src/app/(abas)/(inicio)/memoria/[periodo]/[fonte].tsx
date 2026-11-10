import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { resumirEmissoes } from '@/calculo/resumo';
import { grupoDeFonte } from '@/calculo/sugestoes';
import type { MemoriaCalculoFonte } from '@/calculo/tipos';
import { buscarRegistroConsumo, type RegistroConsumo } from '@/dados/consumos';
import { BotaoSecundario } from '@/ui/BotaoSecundario';
import { CabecalhoDetalhe } from '@/ui/CabecalhoDetalhe';
import { Cartao } from '@/ui/Cartao';
import {
  descreverConsumo,
  descreverUnidadeFator,
  formatarDecimal,
  formatarEmissao,
  formatarEmissaoComUnidade,
  formatarParticipacao,
  nomeDoMes,
} from '@/ui/formatacao';
import { margemTela, medidas, useTema } from '@/ui/tema';

// Memória de cálculo de uma fonte num mês (RF04). Layout segue o protótipo no
// Figma ("06 Memória de cálculo"). Mostra o cálculo salvo no registro, com o
// fator da época, para que uma atualização de fator não mude o que já foi
// mostrado ao usuário. "Ver como reduzir" abre as sugestões (RF08) já no grupo
// da fonte.

type Leitura =
  | { tipo: 'pronta'; registro: RegistroConsumo; fonte: MemoriaCalculoFonte; fracao: number }
  | { tipo: 'ausente' }
  | { tipo: 'erro' };

function ler(idPeriodo: string, idFonte: string): Leitura {
  try {
    const registro = buscarRegistroConsumo(idPeriodo);
    const fonte = registro?.calculo.fontes.find((f) => f.id === idFonte);
    if (!registro || !fonte) return { tipo: 'ausente' };
    const fracao =
      resumirEmissoes(registro.calculo.fontes).fontes.find((f) => f.id === idFonte)?.fracao ?? 0;
    return { tipo: 'pronta', registro, fonte, fracao };
  } catch {
    return { tipo: 'erro' };
  }
}

export default function MemoriaCalculo() {
  const { periodo = '', fonte = '' } = useLocalSearchParams<{ periodo: string; fonte: string }>();
  const { cores, tipografia, espacamento } = useTema();
  const [leitura] = useState(() => ler(periodo, fonte));

  return (
    <SafeAreaView edges={['top']} style={[estilos.tela, { backgroundColor: cores.fundo }]}>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: margemTela,
          paddingVertical: espacamento.m,
          gap: espacamento.m,
        }}
      >
        <CabecalhoDetalhe
          titulo={leitura.tipo === 'pronta' ? leitura.fonte.nome : 'Memória de cálculo'}
        />

        {leitura.tipo === 'pronta' ? (
          <Conteudo {...leitura} />
        ) : (
          <Cartao style={{ gap: espacamento.pp }}>
            <Text style={[tipografia.subtitulo, { color: cores.texto }]}>
              {leitura.tipo === 'erro'
                ? 'Não foi possível abrir este cálculo'
                : 'Este cálculo não está mais registrado'}
            </Text>
            <Text style={[tipografia.corpo, { color: cores.textoSuave }]}>
              {leitura.tipo === 'erro'
                ? 'Os dados salvos não foram alterados. Volte e tente de novo.'
                : 'O mês ou a fonte foram apagados ou substituídos. Volte para ver os registros atuais.'}
            </Text>
          </Cartao>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function Conteudo({
  registro,
  fonte,
  fracao,
}: {
  registro: RegistroConsumo;
  fonte: MemoriaCalculoFonte;
  fracao: number;
}) {
  const { cores, tipografia, espacamento } = useTema();
  const emissao = formatarEmissao(fonte.emissaoKgCo2e);
  const anoAtual = new Date().getFullYear();
  const mes = nomeDoMes(registro.mes) + (registro.ano === anoAtual ? '' : ` de ${registro.ano}`);
  const { fator } = fonte;

  return (
    <>
      <View style={{ gap: espacamento.mini }}>
        <View style={[estilos.valor, { gap: espacamento.pp }]}>
          <Text style={[tipografia.numeroResultado, { color: cores.texto }]}>{emissao.valor}</Text>
          <Text style={[tipografia.unidadeResultado, { color: cores.textoSuave }]}>
            {emissao.unidade} CO₂e
          </Text>
        </View>
        <Text style={[tipografia.apoio, { color: cores.textoSuave }]}>
          {formatarParticipacao(fracao)} das emissões de {mes}
        </Text>
      </View>

      <Text accessibilityRole="header" style={[tipografia.subtitulo, { color: cores.texto }]}>
        Como chegamos a esse número
      </Text>
      <Cartao style={{ gap: espacamento.pp }}>
        <Passo
          rotulo="Consumo informado"
          valor={descreverConsumo(fonte.consumoInformado, fonte.unidadeInformada, fonte.nome)}
          nota={
            fonte.conversao
              ? `${formatarDecimal(fonte.consumoInformado)} × ${formatarDecimal(
                  fonte.conversao.multiplicador,
                )} kg = ${formatarDecimal(fonte.consumoAplicado)} ${fonte.conversao.unidadeResultado}`
              : undefined
          }
        />
        <Operador simbolo="×" />
        <Passo
          rotulo="Fator de emissão"
          valor={`${formatarDecimal(fator.valor)} ${descreverUnidadeFator(fator.unidadeFator)}`}
        />
        <Operador simbolo="=" />
        <View style={{ gap: espacamento.mini }}>
          <Text style={[tipografia.legenda, { color: cores.textoSuave }]}>Emissão do mês</Text>
          <Text style={[tipografia.tituloDetalhe, { color: cores.marcaForte }]}>
            {formatarEmissaoComUnidade(fonte.emissaoKgCo2e)} CO₂e
          </Text>
        </View>
      </Cartao>

      <Text accessibilityRole="header" style={[tipografia.subtitulo, { color: cores.texto }]}>
        De onde vem o fator
      </Text>
      <Cartao style={{ gap: espacamento.p }}>
        <LinhaDetalhe rotulo="Fonte" valor={fator.fonte} />
        <Divisor />
        <LinhaDetalhe rotulo="Ano de referência" valor={String(fator.ano)} />
        <Divisor />
        <LinhaDetalhe rotulo="Versão usada neste mês" valor={String(fator.versao)} />
      </Cartao>

      <View style={estilos.espaco} />
      <BotaoSecundario
        rotulo="Ver como reduzir"
        onPress={() =>
          router.push({
            pathname: '/sugestoes/[periodo]',
            params: { periodo: registro.id, grupo: grupoDeFonte(fonte.id) },
          })
        }
      />
    </>
  );
}

function Passo({ rotulo, valor, nota }: { rotulo: string; valor: string; nota?: string }) {
  const { cores, tipografia, espacamento } = useTema();

  return (
    <View style={{ gap: espacamento.mini }}>
      <Text style={[tipografia.legenda, { color: cores.textoSuave }]}>{rotulo}</Text>
      <Text style={[tipografia.itemForte, { color: cores.texto }]}>{valor}</Text>
      {nota ? <Text style={[tipografia.nota, { color: cores.textoSuave }]}>{nota}</Text> : null}
    </View>
  );
}

// Sinal da conta entre os passos; lido como "vezes" e "igual a".
function Operador({ simbolo }: { simbolo: '×' | '=' }) {
  const { cores, tipografia } = useTema();

  return (
    <Text
      accessibilityLabel={simbolo === '×' ? 'vezes' : 'igual a'}
      style={[tipografia.subtitulo, { color: cores.textoSuave }]}
    >
      {simbolo}
    </Text>
  );
}

function LinhaDetalhe({ rotulo, valor }: { rotulo: string; valor: string }) {
  const { cores, tipografia, espacamento } = useTema();

  return (
    <View style={[estilos.linhaDetalhe, { gap: espacamento.p }]}>
      <Text style={[tipografia.apoio, { color: cores.textoSuave }]}>{rotulo}</Text>
      <Text style={[estilos.valorDetalhe, tipografia.apoioForte, { color: cores.texto }]}>
        {valor}
      </Text>
    </View>
  );
}

function Divisor() {
  const { cores } = useTema();

  return <View style={{ height: medidas.bordaCartao, backgroundColor: cores.borda }} />;
}

const estilos = StyleSheet.create({
  tela: {
    flex: 1,
  },
  espaco: {
    flexGrow: 1,
  },
  valor: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  linhaDetalhe: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  valorDetalhe: {
    flex: 1,
    textAlign: 'right',
  },
});
