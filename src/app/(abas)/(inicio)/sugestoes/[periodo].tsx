import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GRUPOS_FONTE, agruparSugestoes, emissaoEvitadaKgCo2e } from '@/calculo/sugestoes';
import type { GrupoComSugestoes, GrupoFonte } from '@/calculo/tipos';
import { buscarRegistroConsumo, type RegistroConsumo } from '@/dados/consumos';
import { BotaoTexto } from '@/ui/BotaoTexto';
import { CabecalhoDetalhe } from '@/ui/CabecalhoDetalhe';
import { Cartao } from '@/ui/Cartao';
import { CartaoSugestao } from '@/ui/CartaoSugestao';
import { formatarEmissaoComUnidade, formatarParticipacao, nomeDoMes } from '@/ui/formatacao';
import { SeletorSegmentado } from '@/ui/SeletorSegmentado';
import { margemTela, useTema } from '@/ui/tema';

// Sugestões de redução do mês (RF08). Layout segue o protótipo no Figma
// ("07 Sugestões de redução"). Abre no grupo de fontes que mais emitiu, ou no
// grupo pedido pelo parâmetro `grupo` (vindo da memória de cálculo de uma
// fonte). Com mais de um grupo, botões no topo trocam entre eles.

// Fração usada no "quanto vale reduzir"; um número redondo e alcançável.
const REDUCAO_EXEMPLO = 0.1;
// Sugestões visíveis antes do "Mostrar mais".
const VISIVEIS = 3;

type Leitura =
  | { tipo: 'pronta'; registro: RegistroConsumo; grupos: GrupoComSugestoes[] }
  | { tipo: 'ausente' }
  | { tipo: 'erro' };

function ler(idPeriodo: string): Leitura {
  try {
    const registro = buscarRegistroConsumo(idPeriodo);
    if (!registro) return { tipo: 'ausente' };
    return {
      tipo: 'pronta',
      registro,
      grupos: agruparSugestoes(registro.calculo.fontes, registro.perfil),
    };
  } catch {
    return { tipo: 'erro' };
  }
}

export default function SugestoesReducao() {
  const { periodo = '', grupo } = useLocalSearchParams<{ periodo: string; grupo?: string }>();
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
        <CabecalhoDetalhe titulo="Reduzir antes de compensar" />

        {leitura.tipo === 'pronta' && leitura.grupos.length > 0 ? (
          <Conteudo registro={leitura.registro} grupos={leitura.grupos} grupoPedido={grupo} />
        ) : (
          <Cartao style={{ gap: espacamento.pp }}>
            <Text style={[tipografia.subtitulo, { color: cores.texto }]}>
              {leitura.tipo === 'erro'
                ? 'Não foi possível abrir as sugestões'
                : 'Nenhuma emissão neste mês'}
            </Text>
            <Text style={[tipografia.corpo, { color: cores.textoSuave }]}>
              {leitura.tipo === 'erro'
                ? 'Os dados salvos não foram alterados. Volte e tente de novo.'
                : 'As sugestões aparecem para os meses com consumo registrado.'}
            </Text>
          </Cartao>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function Conteudo({
  registro,
  grupos,
  grupoPedido,
}: {
  registro: RegistroConsumo;
  grupos: GrupoComSugestoes[];
  grupoPedido?: string;
}) {
  const { cores, tipografia, espacamento } = useTema();
  const [escolhido, setEscolhido] = useState<GrupoFonte>(
    () => grupos.find((g) => g.grupo === grupoPedido)?.grupo ?? grupos[0].grupo,
  );
  const [verTodas, setVerTodas] = useState(false);
  const atual = grupos.find((g) => g.grupo === escolhido) ?? grupos[0];

  const anoAtual = new Date().getFullYear();
  const mes = nomeDoMes(registro.mes) + (registro.ano === anoAtual ? '' : ` de ${registro.ano}`);
  const evitada = emissaoEvitadaKgCo2e(atual.emissaoKgCo2e, REDUCAO_EXEMPLO);
  const textoEvitada = evitada < 1 ? 'menos de 1 kg' : formatarEmissaoComUnidade(evitada);
  const visiveis = verTodas ? atual.sugestoes : atual.sugestoes.slice(0, VISIVEIS);
  const escondidas = atual.sugestoes.length - visiveis.length;

  function trocarGrupo(grupo: GrupoFonte) {
    setEscolhido(grupo);
    setVerTodas(false);
  }

  return (
    <>
      {grupos.length > 1 ? (
        <SeletorSegmentado
          rotulo="Sugestões para"
          opcoes={grupos.map((g) => ({ valor: g.grupo, rotulo: GRUPOS_FONTE[g.grupo].nomeCurto }))}
          valor={atual.grupo}
          aoMudar={trocarGrupo}
        />
      ) : null}

      <View style={{ gap: espacamento.mini }}>
        <Text style={[tipografia.linha, { color: cores.textoSuave }]}>
          Sugestões para {GRUPOS_FONTE[atual.grupo].comArtigo}, que responde por{' '}
          {formatarParticipacao(atual.fracao)} das suas emissões em {mes}.
        </Text>
        <Text style={[tipografia.linha, { color: cores.textoSuave }]}>
          Cada {formatarParticipacao(REDUCAO_EXEMPLO)} a menos evita{' '}
          <Text style={[tipografia.numeroLinha, { color: cores.marcaForte }]}>
            {textoEvitada} de CO₂e
          </Text>{' '}
          por mês.
        </Text>
      </View>

      <View style={{ gap: espacamento.p }}>
        {visiveis.map((sugestao) => (
          <CartaoSugestao key={sugestao.id} sugestao={sugestao} />
        ))}
      </View>

      {escondidas > 0 ? (
        <View style={estilos.mais}>
          <BotaoTexto
            rotulo={`Mostrar mais ${escondidas} ${escondidas === 1 ? 'sugestão' : 'sugestões'}`}
            onPress={() => setVerTodas(true)}
          />
        </View>
      ) : null}
    </>
  );
}

const estilos = StyleSheet.create({
  tela: {
    flex: 1,
  },
  mais: {
    alignItems: 'center',
  },
});
