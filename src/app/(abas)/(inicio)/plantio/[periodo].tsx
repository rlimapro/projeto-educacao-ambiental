import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  HORIZONTE_ANOS,
  TAXAS_SEQUESTRO_POR_BIOMA,
  TAXA_SEQUESTRO_SEM_ESTADO,
  anoEmQueAlcancaEmissao,
  areaPlantioM2,
  arvoresParaNeutralizar,
  remocaoAcumuladaKgCo2,
  sequestroLiquidoKgCo2,
  somarEmissoesKgCo2e,
} from '@/calculo/arvores';
import { lerRegistrosConsumo, type RegistroConsumo } from '@/dados/consumos';
import { AJUDA_CUIDADOS_DO_PLANTIO, AJUDA_TIPOS_DE_ARVORE } from '@/ui/ajudaPlantio';
import type { AjudaCampo } from '@/ui/ajudaConsumo';
import { CabecalhoDetalhe } from '@/ui/CabecalhoDetalhe';
import { Cartao } from '@/ui/Cartao';
import { FolhaAjuda } from '@/ui/FolhaAjuda';
import {
  formatarDecimal,
  formatarEmissao,
  formatarEmissaoComUnidade,
  nomeDoMes,
} from '@/ui/formatacao';
import { GraficoRemocao } from '@/ui/GraficoRemocao';
import { Icone } from '@/ui/Icone';
import { LinhaAcao } from '@/ui/LinhaAcao';
import { SeletorBioma } from '@/ui/SeletorBioma';
import { SeletorMeses } from '@/ui/SeletorMeses';
import { margemTela, medidas, useTema } from '@/ui/tema';

// Simulação de plantio (RF05, RF06). Layout segue o protótipo no Figma
// ("08 Simular plantio"), com o bioma, a remoção ao longo do tempo e as
// orientações de plantio. A taxa é a do bioma, não a da espécie: a pesquisa
// registrada em docs/simular-plantio.md não sustenta taxas por tipo de árvore.
// Só se chega aqui pelas sugestões de redução: reduzir antes de compensar.
//
// Abre no mês do parâmetro `periodo`, mas pode somar vários meses registrados
// num plantio só (atalhos e grade em SeletorMeses). Meses sem registro não
// entram: nada é estimado para eles.

const MARCOS_ANOS = [5, 10, HORIZONTE_ANOS];
// Limites do controle de quantidade.
const MINIMO_ARVORES = 1;
const MAXIMO_ARVORES = 9999;

type Leitura =
  | { tipo: 'pronta'; aberto: RegistroConsumo; registros: RegistroConsumo[] }
  | { tipo: 'ausente' }
  | { tipo: 'erro' };

function ler(idPeriodo: string): Leitura {
  try {
    const registros = lerRegistrosConsumo();
    const aberto = registros.find((r) => r.id === idPeriodo);
    return aberto && aberto.calculo.totalKgCo2e > 0
      ? { tipo: 'pronta', aberto, registros }
      : { tipo: 'ausente' };
  } catch {
    return { tipo: 'erro' };
  }
}

// Área aproximada: valor exato abaixo de 100 m², de 10 em 10 a partir daí.
function arredondarArea(m2: number): number {
  return m2 < 100 ? m2 : Math.round(m2 / 10) * 10;
}

export default function SimularPlantio() {
  const { periodo = '' } = useLocalSearchParams<{ periodo: string }>();
  const { cores, tipografia, espacamento } = useTema();
  const [leitura] = useState(() => ler(periodo));

  return (
    <SafeAreaView edges={['top']} style={[estilos.tela, { backgroundColor: cores.fundo }]}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: margemTela,
          paddingVertical: espacamento.m,
          gap: espacamento.m,
        }}
      >
        <CabecalhoDetalhe titulo="Simular plantio" />
        {leitura.tipo === 'pronta' ? (
          <Conteudo aberto={leitura.aberto} registros={leitura.registros} />
        ) : (
          <Cartao style={{ gap: espacamento.pp }}>
            <Text style={[tipografia.subtitulo, { color: cores.texto }]}>
              {leitura.tipo === 'erro'
                ? 'Não foi possível abrir a simulação'
                : 'Nenhuma emissão neste mês'}
            </Text>
            <Text style={[tipografia.corpo, { color: cores.textoSuave }]}>
              {leitura.tipo === 'erro'
                ? 'Os dados salvos não foram alterados. Volte e tente de novo.'
                : 'A simulação aparece para os meses com consumo registrado.'}
            </Text>
          </Cartao>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function Conteudo({
  aberto,
  registros,
}: {
  aberto: RegistroConsumo;
  registros: RegistroConsumo[];
}) {
  const { cores, tipografia, espacamento, raios } = useTema();
  const [idsMeses, setIdsMeses] = useState([aberto.id]);
  const escolhidos = registros.filter((r) => idsMeses.includes(r.id));
  const emissao = somarEmissoesKgCo2e(escolhidos.map((r) => r.calculo.totalKgCo2e));
  const [idTaxa, setIdTaxa] = useState(TAXA_SEQUESTRO_SEM_ESTADO.id);
  const [quantidade, setQuantidade] = useState(() =>
    Math.max(MINIMO_ARVORES, arvoresParaNeutralizar(emissao, TAXA_SEQUESTRO_SEM_ESTADO)),
  );
  const [escolhendoBioma, setEscolhendoBioma] = useState(false);
  const [escolhendoMeses, setEscolhendoMeses] = useState(false);
  const [ajuda, setAjuda] = useState<AjudaCampo | null>(null);

  const taxa = TAXAS_SEQUESTRO_POR_BIOMA.find((t) => t.id === idTaxa) ?? TAXA_SEQUESTRO_SEM_ESTADO;
  const necessarias = arvoresParaNeutralizar(emissao, taxa);
  const liquido = sequestroLiquidoKgCo2(quantidade, taxa, emissao);
  const ano = anoEmQueAlcancaEmissao(quantidade, taxa, emissao);
  const marcos = MARCOS_ANOS.map((anos) => ({
    anos,
    remocaoKgCo2: remocaoAcumuladaKgCo2(quantidade, taxa, anos),
  }));

  const anoAtual = new Date().getFullYear();
  const nomeMes = (r: RegistroConsumo) =>
    nomeDoMes(r.mes) + (r.ano === anoAtual ? '' : ` de ${r.ano}`);
  const arvoresTexto = (n: number) => `${n} ${n === 1 ? 'árvore' : 'árvores'}`;
  // O período nas frases da tela.
  const umMes = escolhidos.length === 1 ? escolhidos[0] : null;
  const todos = escolhidos.length === registros.length && registros.length > 1;
  const n = escolhidos.length;
  const frases = umMes
    ? { nome: nomeMes(umMes), em: `em ${nomeMes(umMes)}`, de: `de ${nomeMes(umMes)}` }
    : todos
      ? {
          nome: 'todos os meses registrados',
          em: 'em todos os meses registrados',
          de: 'de todos os meses registrados',
        }
      : { nome: `esses ${n} meses`, em: `nesses ${n} meses`, de: `desses ${n} meses` };
  const tituloPeriodo = umMes
    ? `${nomeDoMes(umMes.mes, true)} de ${umMes.ano}`
    : todos
      ? `Todos os meses (${registros.length})`
      : `${escolhidos.length} meses`;
  const area = arredondarArea(areaPlantioM2(quantidade));

  function simularMeses(ids: string[]) {
    const total = somarEmissoesKgCo2e(
      registros.filter((r) => ids.includes(r.id)).map((r) => r.calculo.totalKgCo2e),
    );
    setIdsMeses(ids);
    // A quantidade volta para a que neutralizaria o novo período.
    setQuantidade(Math.max(MINIMO_ARVORES, arvoresParaNeutralizar(total, taxa)));
    setEscolhendoMeses(false);
  }
  const sobra = liquido >= 0;
  const resultado = formatarEmissao(Math.abs(liquido));

  function mudarQuantidade(delta: number) {
    setQuantidade((atual) => Math.min(MAXIMO_ARVORES, Math.max(MINIMO_ARVORES, atual + delta)));
  }

  return (
    <>
      {registros.length > 1 ? (
        <LinhaAcao
          icone="navHistorico"
          titulo={tituloPeriodo}
          descricao={`${formatarEmissaoComUnidade(emissao)} CO₂e emitidos · trocar os meses`}
          onPress={() => setEscolhendoMeses(true)}
        />
      ) : null}
      <LinhaAcao
        icone="sol"
        titulo={taxa.biomas}
        descricao="Bioma onde as mudas seriam plantadas"
        onPress={() => setEscolhendoBioma(true)}
      />

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Para neutralizar ${frases.nome}: ${arvoresTexto(necessarias)}`}
        accessibilityHint="Usa essa quantidade na simulação"
        onPress={() => setQuantidade(Math.max(MINIMO_ARVORES, necessarias))}
      >
        <Cartao style={[estilos.linha, { gap: espacamento.p }]}>
          <Icone nome="arvore" />
          <View style={[estilos.expandir, { gap: espacamento.mini }]}>
            <Text style={[tipografia.legenda, { color: cores.textoSuave }]}>
              Para neutralizar {frases.nome}
            </Text>
            <Text style={[tipografia.opcao, { color: cores.texto }]}>
              {arvoresTexto(necessarias)}
            </Text>
          </View>
        </Cartao>
      </Pressable>

      <View style={[estilos.quantidade, { gap: espacamento.p, paddingVertical: espacamento.pp }]}>
        <Text style={[tipografia.item, { color: cores.texto }]}>
          Quantas árvores você pretende plantar?
        </Text>
        <View style={[estilos.linha, { gap: espacamento.gg }]}>
          <BotaoRedondo
            icone="menos"
            rotulo="Uma árvore a menos"
            desativado={quantidade <= MINIMO_ARVORES}
            onPress={() => mudarQuantidade(-1)}
          />
          <Text
            accessibilityLabel={arvoresTexto(quantidade)}
            accessibilityLiveRegion="polite"
            style={[tipografia.numeroControle, { color: cores.texto }]}
          >
            {quantidade}
          </Text>
          <BotaoRedondo
            icone="mais"
            rotulo="Uma árvore a mais"
            desativado={quantidade >= MAXIMO_ARVORES}
            onPress={() => mudarQuantidade(1)}
          />
        </View>
        <Text style={[tipografia.legenda, estilos.centro, { color: cores.textoSuave }]}>
          Em plantio de restauração (3 m × 2 m), ocupariam cerca de {formatarDecimal(area)} m².
          Árvores isoladas precisam de mais espaço cada e removem quantidades diferentes.
        </Text>
      </View>

      <View
        style={{
          gap: espacamento.mini,
          padding: espacamento.g,
          borderRadius: raios.cartao,
          borderWidth: medidas.bordaCartao,
          borderColor: sobra ? cores.marca : cores.borda,
          backgroundColor: sobra ? cores.marca : cores.superficie,
        }}
      >
        <Text style={[tipografia.apoioForte, { color: sobra ? cores.sobreMarca : cores.texto }]}>
          Com {arvoresTexto(quantidade)}, em {HORIZONTE_ANOS} anos após o plantio
        </Text>
        <View style={[estilos.valor, { gap: espacamento.pp }]}>
          <Text
            style={[tipografia.numeroResultado, { color: sobra ? cores.sobreMarca : cores.texto }]}
          >
            {sobra ? '+' : '−'}
            {resultado.valor}
          </Text>
          <Text style={[tipografia.opcao, { color: sobra ? cores.sobreMarca : cores.texto }]}>
            {resultado.unidade} CO₂e
          </Text>
        </View>
        <Text style={[tipografia.apoio, { color: sobra ? cores.sobreMarca : cores.textoSuave }]}>
          {sobra
            ? `seriam retirados da atmosfera além do que você emitiu ${frases.em}.`
            : `ainda faltariam para retirar o que você emitiu ${frases.em}.`}
        </Text>
      </View>

      <Text accessibilityRole="header" style={[tipografia.subtitulo, { color: cores.texto }]}>
        Ao longo do tempo
      </Text>
      <Cartao style={{ gap: espacamento.m }}>
        <Text style={[tipografia.apoio, { color: cores.texto }]}>
          {ano === null
            ? `As emissões ${frases.de} já estão no ar. Com ${arvoresTexto(quantidade)}, a remoção não chegaria a esse valor em ${HORIZONTE_ANOS} anos.`
            : `As emissões ${frases.de} já estão no ar. Com ${arvoresTexto(quantidade)}, a remoção chegaria a esse valor por volta do ano ${ano}.`}
        </Text>
        <GraficoRemocao
          marcos={marcos}
          emissaoKgCo2e={emissao}
          rotuloEmissao={umMes ? `Emitido ${frases.em}` : 'Emitido no período'}
        />
        <Text style={[tipografia.legenda, { color: cores.textoSuave }]}>
          Os valores são uma média por ano. Nos primeiros anos, as mudas crescem mais devagar.
        </Text>
      </Cartao>

      <View style={{ gap: espacamento.p }}>
        <LinhaAcao
          icone="folha"
          titulo="Que árvores plantar"
          descricao="Nativas e variadas: o que cada tipo faz"
          onPress={() => setAjuda(AJUDA_TIPOS_DE_ARVORE)}
        />
        <LinhaAcao
          icone="gota"
          titulo="Como cuidar do plantio"
          descricao="Época, capina e proteção nos primeiros anos"
          onPress={() => setAjuda(AJUDA_CUIDADOS_DO_PLANTIO)}
        />
      </View>

      <SeletorMeses
        visivel={escolhendoMeses}
        meses={registros.map((r) => ({
          id: r.id,
          ano: r.ano,
          mes: r.mes,
          emissaoKgCo2e: r.calculo.totalKgCo2e,
        }))}
        selecionados={idsMeses}
        idAberto={aberto.id}
        aoConfirmar={simularMeses}
        aoFechar={() => setEscolhendoMeses(false)}
      />
      <SeletorBioma
        visivel={escolhendoBioma}
        taxas={TAXAS_SEQUESTRO_POR_BIOMA}
        selecionada={taxa.id}
        aoEscolher={(id) => {
          setIdTaxa(id);
          setEscolhendoBioma(false);
        }}
        aoFechar={() => setEscolhendoBioma(false)}
      />
      <FolhaAjuda ajuda={ajuda} aoFechar={() => setAjuda(null)} />
    </>
  );
}

function BotaoRedondo({
  icone,
  rotulo,
  desativado,
  onPress,
}: {
  icone: 'menos' | 'mais';
  rotulo: string;
  desativado: boolean;
  onPress: () => void;
}) {
  const { cores, raios } = useTema();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={rotulo}
      accessibilityState={{ disabled: desativado }}
      disabled={desativado}
      onPress={onPress}
      style={({ pressed }) => [
        estilos.redondo,
        {
          borderRadius: raios.pilula,
          borderWidth: medidas.bordaCartao,
          borderColor: cores.borda,
          backgroundColor: cores.superficie,
          opacity: pressed ? medidas.opacidadePressionado : 1,
        },
      ]}
    >
      <Icone nome={icone} cor={desativado ? 'borda' : 'texto'} />
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  tela: {
    flex: 1,
  },
  linha: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  expandir: {
    flex: 1,
  },
  quantidade: {
    alignItems: 'center',
  },
  centro: {
    textAlign: 'center',
  },
  valor: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  redondo: {
    width: medidas.alturaBotao,
    height: medidas.alturaBotao,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
