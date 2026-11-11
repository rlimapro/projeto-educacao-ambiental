import { useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState, type ComponentRef } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  ESPACO_MUDA,
  LADO_MAXIMO_M,
  LADO_MINIMO_M,
  MAXIMO_TERRENOS,
  capacidadeTerreno,
  capacidadeTotal,
  distribuirEmLinhas,
  encaixarNaGrade,
  limitarAQuantidade,
  novoTerreno,
  posicaoValida,
  primeiraPosicaoLivre,
  terrenoValido,
  tirarTerrenos,
  totalMudas,
  type PosicaoMuda,
  type TerrenoPlanejado,
} from '@/calculo/distribuicao';
import { lerPlanoTerrenos, salvarPlanoTerrenos } from '@/dados/planoTerrenos';
import { BotaoSecundario } from '@/ui/BotaoSecundario';
import { BotaoTexto } from '@/ui/BotaoTexto';
import { CabecalhoDetalhe } from '@/ui/CabecalhoDetalhe';
import { CamadaLixeira } from '@/ui/CamadaLixeira';
import { formatarDecimal } from '@/ui/formatacao';
import { dentroDaArea, type Area, type Ponto } from '@/ui/geometriaTerreno';
import { OpcaoTerreno, type Pegada } from '@/ui/OpcaoTerreno';
import { PlanoTerreno } from '@/ui/PlanoTerreno';
import { margemTela, medidas, useTema } from '@/ui/tema';
import { useLeitorDeTela } from '@/ui/useLeitorDeTela';

// Distribuição das mudas simuladas em um ou mais terrenos (RF06), aberta pela
// simulação de plantio com o parâmetro `arvores`. Funciona como a colocação de
// construções em jogos de estratégia: toque no terreno para pôr uma muda e
// arraste para mudar de lugar; cada muda reserva 3 m × 2 m (o espaçamento do
// plantio de mata). As mudas podem ser divididas entre terrenos de medidas
// diferentes, e o plano fica salvo no aparelho. Para tirar um terreno, ele é
// segurado e arrastado até a lixeira que surge no pé da tela. O terreno
// desenhado, com zoom, está em src/ui/PlanoTerreno.tsx; as regras, em
// src/calculo/distribuicao.ts.

type Lado = 'larguraM' | 'comprimentoM';

// Terreno segurado, a caminho da lixeira. `posicao` é o canto da cópia que
// segue o dedo, nas coordenadas da tela.
type ArrasteTerreno = {
  id: number;
  nome: string;
  noItem: Ponto;
  posicao: Ponto;
  sobreLixeira: boolean;
};

// Por quanto tempo "Desfazer" fica na tela depois de tirar um terreno. Com
// leitor de tela, não some sozinho: 5 s não bastam para chegar até ele.
const PRAZO_DESFAZER_S = 5;

// O que "Desfazer" devolve depois de tirar um terreno.
type TerrenoTirado = { terreno: TerrenoPlanejado; indice: number; nome: string };

function mudasTexto(n: number): string {
  return `${formatarDecimal(n)} ${n === 1 ? 'muda' : 'mudas'}`;
}

// Plano salvo, sem as mudas que passam da quantidade simulada agora.
function planoInicial(quantidade: number): { terrenos: TerrenoPlanejado[]; aviso: string } {
  const salvo = lerPlanoTerrenos();
  if (!salvo) return { terrenos: [novoTerreno([], quantidade)], aviso: '' };
  const { terrenos, retiradas } = limitarAQuantidade(salvo, quantidade);
  return {
    terrenos,
    aviso:
      retiradas > 0
        ? `${mudasTexto(retiradas)} ${retiradas === 1 ? 'saiu' : 'saíram'} do plano salvo porque a simulação agora tem ${mudasTexto(quantidade)}.`
        : '',
  };
}

export default function DistribuirMudas() {
  const { arvores } = useLocalSearchParams<{ arvores?: string }>();
  const quantidade = Math.max(1, Math.min(9999, Math.floor(Number(arvores) || 1)));
  const { cores, tipografia, espacamento } = useTema();

  const [inicial] = useState(() => planoInicial(quantidade));
  const [terrenos, setTerrenos] = useState<TerrenoPlanejado[]>(inicial.terrenos);
  const [atualId, setAtualId] = useState(inicial.terrenos[0].id);
  const atual = terrenos.find((t) => t.id === atualId) ?? terrenos[0];
  const indiceAtual = terrenos.indexOf(atual);
  const [textoLargura, setTextoLargura] = useState(String(atual.larguraM));
  const [textoComprimento, setTextoComprimento] = useState(String(atual.comprimentoM));
  const [selecionada, setSelecionada] = useState<number | null>(null);
  const [aviso, setAviso] = useState(inicial.aviso);
  const [desfazer, setDesfazer] = useState<TerrenoTirado | null>(null);
  const [segundosDesfazer, setSegundosDesfazer] = useState(PRAZO_DESFAZER_S);
  const leitorDeTela = useLeitorDeTela();
  // Lado digitado fora de 2 a 100 m: o terreno não muda e o campo avisa.
  const [ladoInvalido, setLadoInvalido] = useState<Lado | null>(null);
  const [larguraTela, setLarguraTela] = useState(0);
  // Enquanto há um dedo no terreno, a página não rola.
  const [gestoNoTerreno, setGestoNoTerreno] = useState(false);
  const [arrasteTerreno, setArrasteTerreno] = useState<ArrasteTerreno | null>(null);
  const telaRef = useRef<ComponentRef<typeof View>>(null);
  // Canto da tela na página, para levar o dedo às coordenadas da camada da lixeira.
  const origemTela = useRef<Ponto>({ x: 0, y: 0 });
  const areaLixeira = useRef<Area | null>(null);

  // Contagem do "Desfazer": ao chegar a zero, ele e o aviso somem.
  useEffect(() => {
    if (!desfazer || leitorDeTela) return;
    const relogio = setTimeout(() => {
      if (segundosDesfazer > 1) {
        setSegundosDesfazer(segundosDesfazer - 1);
      } else {
        setDesfazer(null);
        setAviso('');
      }
    }, 1000);
    return () => clearTimeout(relogio);
  }, [desfazer, segundosDesfazer, leitorDeTela]);

  // O plano fica salvo no aparelho a cada mudança.
  useEffect(() => {
    try {
      salvarPlanoTerrenos(terrenos);
    } catch {
      // Sem salvar, o plano continua valendo na tela aberta.
    }
  }, [terrenos]);

  const varios = terrenos.length > 1;
  const nomeAtual = `Terreno ${indiceAtual + 1}`;
  const distribuidas = totalMudas(terrenos);
  const faltam = quantidade - distribuidas;
  const capacidade = capacidadeTerreno(atual);
  const capacidadeDoPlano = capacidadeTotal(terrenos);
  const podeAdicionar = terrenos.length < MAXIMO_TERRENOS;
  // Mudas dos terrenos antes do atual: a numeração continua entre terrenos.
  const numeroInicial = terrenos.slice(0, indiceAtual).reduce((s, t) => s + t.mudas.length, 0) + 1;
  // Com os dois lados no máximo, não adianta pedir um terreno maior.
  const atualNoMaximo = atual.larguraM === LADO_MAXIMO_M && atual.comprimentoM === LADO_MAXIMO_M;
  const comoCaberTodas = !podeAdicionar
    ? 'Aumente um dos terrenos para caber todas.'
    : atualNoMaximo
      ? 'Esse é o maior terreno da simulação: adicione outro terreno para as que faltam.'
      : 'Aumente o terreno ou adicione outro para as que faltam.';

  // Um aviso novo substitui o anterior, e com ele some o "Desfazer".
  function avisar(texto: string) {
    setAviso(texto);
    setDesfazer(null);
  }

  function atualizarAtual(mudar: (terreno: TerrenoPlanejado) => TerrenoPlanejado) {
    setTerrenos((lista) => lista.map((t) => (t.id === atual.id ? mudar(t) : t)));
  }

  function mostrarTerreno(terreno: TerrenoPlanejado) {
    setAtualId(terreno.id);
    setTextoLargura(String(terreno.larguraM));
    setTextoComprimento(String(terreno.comprimentoM));
    setLadoInvalido(null);
    setSelecionada(null);
  }

  function adicionarTerreno() {
    const terreno = novoTerreno(terrenos, faltam);
    setTerrenos((lista) => [...lista, terreno]);
    mostrarTerreno(terreno);
    avisar('');
  }

  function tirarTerreno(id: number) {
    const indice = terrenos.findIndex((t) => t.id === id);
    if (indice < 0 || terrenos.length < 2) return;
    const terreno = terrenos[indice];
    const nome = `Terreno ${indice + 1}`;
    const { terrenos: restantes, mudasTiradas } = tirarTerrenos(terrenos, [id], quantidade);
    setTerrenos(restantes);
    mostrarTerreno(restantes.find((t) => t.id === atual.id) ?? restantes[Math.max(0, indice - 1)]);
    avisar(
      mudasTiradas > 0
        ? `O ${nome.toLowerCase()} saiu do plano, com ${mudasTexto(mudasTiradas)}.`
        : `O ${nome.toLowerCase()} saiu do plano.`,
    );
    setDesfazer({ terreno, indice, nome });
    setSegundosDesfazer(PRAZO_DESFAZER_S);
  }

  // Devolve o terreno ao lugar dele. Se, nesse meio-tempo, outras mudas
  // ocuparam as que ele tinha, volta só com as que ainda faltam.
  function desfazerTirada() {
    if (!desfazer) return;
    const { terreno, indice, nome } = desfazer;
    const cabem = Math.max(0, faltam);
    const devolvido = { ...terreno, mudas: terreno.mudas.slice(0, cabem) };
    setTerrenos((lista) => [...lista.slice(0, indice), devolvido, ...lista.slice(indice)]);
    mostrarTerreno(devolvido);
    avisar(`O ${nome.toLowerCase()} voltou ao plano.`);
  }

  // Arraste de um terreno até a lixeira.
  function pontoNaTela(pagina: Ponto): Ponto {
    return { x: pagina.x - origemTela.current.x, y: pagina.y - origemTela.current.y };
  }

  function sobreLixeira(pagina: Ponto): boolean {
    const area = areaLixeira.current;
    return area !== null && dentroDaArea(pontoNaTela(pagina), area, medidas.folgaLixeira);
  }

  function arrastarPara(pagina: Ponto, anterior: ArrasteTerreno): ArrasteTerreno {
    const ponto = pontoNaTela(pagina);
    return {
      ...anterior,
      posicao: { x: ponto.x - anterior.noItem.x, y: ponto.y - anterior.noItem.y },
      sobreLixeira: sobreLixeira(pagina),
    };
  }

  function segurarTerreno(terreno: TerrenoPlanejado, indice: number, { pagina, noItem }: Pegada) {
    setSelecionada(null);
    const comecar = () =>
      setArrasteTerreno(
        arrastarPara(pagina, {
          id: terreno.id,
          nome: `Terreno ${indice + 1}`,
          noItem,
          posicao: { x: 0, y: 0 },
          sobreLixeira: false,
        }),
      );
    comecar();
    // A posição da tela na página só é conhecida medindo; até a resposta, vale a última.
    telaRef.current?.measure?.((_x: number, _y: number, _l: number, _a: number, px: number, py: number) => {
      if (Number.isFinite(px) && Number.isFinite(py)) {
        origemTela.current = { x: px, y: py };
        comecar();
      }
    });
  }

  function soltarTerreno(pagina: Ponto) {
    const arraste = arrasteTerreno;
    setArrasteTerreno(null);
    if (arraste && sobreLixeira(pagina)) tirarTerreno(arraste.id);
  }

  function mudarLado(lado: Lado, texto: string) {
    const digitos = texto.replace(/\D/g, '').slice(0, 3);
    if (lado === 'larguraM') setTextoLargura(digitos);
    else setTextoComprimento(digitos);
    const novo = { ...atual, [lado]: Number(digitos) };
    if (!terrenoValido(novo)) {
      setLadoInvalido(lado);
      return;
    }
    setLadoInvalido(null);
    // Mudas que deixaram de caber saem do terreno.
    const restantes = atual.mudas.filter((m) => posicaoValida(m, [], novo));
    const sairam = atual.mudas.length - restantes.length;
    if (sairam > 0) {
      avisar(`${mudasTexto(sairam)} ${sairam === 1 ? 'saiu' : 'saíram'} porque o terreno diminuiu.`);
    }
    atualizarAtual(() => ({ ...novo, mudas: restantes }));
    setSelecionada(null);
  }

  // Ao sair do campo, um valor inválido volta para o último que valia.
  function confirmarLado() {
    setTextoLargura(String(atual.larguraM));
    setTextoComprimento(String(atual.comprimentoM));
    setLadoInvalido(null);
  }

  function semMudasSobrando(): boolean {
    if (faltam > 0) return false;
    avisar(
      varios
        ? 'Todas as mudas já estão nos terrenos. Arraste para mudar de lugar ou tire de outro terreno.'
        : 'Todas as mudas já estão no terreno. Arraste para mudar de lugar.',
    );
    return true;
  }

  function colocar(posicao: PosicaoMuda) {
    atualizarAtual((t) => ({ ...t, mudas: [...t.mudas, posicao] }));
    setSelecionada(null);
    avisar('');
  }

  function colocarOndeTocou(pontoM: { x: number; y: number }) {
    if (semMudasSobrando()) return;
    const posicao = encaixarNaGrade(pontoM.x, pontoM.y, atual);
    if (!posicaoValida(posicao, atual.mudas, atual)) {
      avisar('Não cabe aí: o espaço da muda encosta no de outra.');
      return;
    }
    colocar(posicao);
  }

  function colocarNoPrimeiroLivre() {
    if (semMudasSobrando()) return;
    const posicao = primeiraPosicaoLivre(atual.mudas, atual);
    if (!posicao) {
      avisar(`Não há mais lugar neste terreno. ${comoCaberTodas}`);
      return;
    }
    colocar(posicao);
  }

  // Preenche o terreno aberto com as mudas que não estão nos outros.
  function distribuir() {
    const pedido = faltam + atual.mudas.length;
    setSelecionada(null);
    if (pedido === 0) {
      avisar('Todas as mudas já estão nos outros terrenos.');
      return;
    }
    const posicoes = distribuirEmLinhas(pedido, atual);
    atualizarAtual((t) => ({ ...t, mudas: posicoes }));
    avisar(
      posicoes.length < pedido
        ? `Couberam ${formatarDecimal(posicoes.length)} de ${mudasTexto(pedido)}. ${comoCaberTodas}`
        : '',
    );
  }

  function soltar(indice: number, posicaoFinal: PosicaoMuda) {
    const outras = atual.mudas.filter((_, i) => i !== indice);
    if (posicaoValida(posicaoFinal, outras, atual)) {
      atualizarAtual((t) => ({
        ...t,
        mudas: t.mudas.map((m, i) => (i === indice ? posicaoFinal : m)),
      }));
      avisar('');
    } else {
      avisar('Não cabe aí: a muda voltou para onde estava.');
    }
  }

  function remover() {
    if (selecionada === null) return;
    atualizarAtual((t) => ({ ...t, mudas: t.mudas.filter((_, i) => i !== selecionada) }));
    setSelecionada(null);
    avisar('');
  }

  const descricaoTerreno =
    `${varios ? `${nomeAtual}, de` : 'Terreno de'} ${atual.larguraM} por ${atual.comprimentoM} metros, ` +
    `com ${formatarDecimal(atual.mudas.length)} de ${formatarDecimal(quantidade)} mudas.`;

  return (
    <SafeAreaView edges={['top']} style={[estilos.tela, { backgroundColor: cores.fundo }]}>
      {/* Na web, arrastar com o mouse selecionaria os textos da tela. */}
      <View
        ref={telaRef}
        style={[estilos.tela, arrasteTerreno ? estilos.semSelecao : null]}
      >
        <ScrollView
          testID="rolagem-da-tela"
          scrollEnabled={!gestoNoTerreno && arrasteTerreno === null}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            paddingHorizontal: margemTela,
            paddingVertical: espacamento.m,
            gap: espacamento.m,
          }}
        >
          <CabecalhoDetalhe titulo="Distribuir no terreno" />
          <Text style={[tipografia.apoio, { color: cores.textoSuave }]}>
            Toque no terreno para colocar uma muda e arraste para mudar de lugar. Cada muda reserva{' '}
            {ESPACO_MUDA.larguraM} m × {ESPACO_MUDA.comprimentoM} m, o espaçamento do plantio de
            mata. Em vermelho, onde não cabe. Em terrenos grandes, aproxime com dois dedos ou com o
            +.
          </Text>

          <Text style={[tipografia.itemForte, { color: cores.texto }]}>
            {varios
              ? `${formatarDecimal(distribuidas)} de ${mudasTexto(quantidade)} em ${terrenos.length} terrenos · cabem até ${formatarDecimal(capacidadeDoPlano)}`
              : `${formatarDecimal(distribuidas)} de ${mudasTexto(quantidade)} no terreno · cabem até ${formatarDecimal(capacidade)}`}
          </Text>
          {capacidadeDoPlano < quantidade ? (
            <Text style={[tipografia.legenda, { color: cores.perigo }]}>
              {varios
                ? `Nesses terrenos cabem no máximo ${mudasTexto(capacidadeDoPlano)}.`
                : `Nesse espaço cabem no máximo ${mudasTexto(capacidade)}.`}{' '}
              {!podeAdicionar
                ? 'Aumente um dos terrenos.'
                : atualNoMaximo && !varios
                  ? 'Esse é o maior terreno da simulação: adicione outro terreno.'
                  : `Aumente a largura ou o comprimento (até ${LADO_MAXIMO_M} m) ou adicione outro terreno.`}
            </Text>
          ) : null}

          <ScrollView
            horizontal
            scrollEnabled={arrasteTerreno === null}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: espacamento.p }}
          >
            <View
              accessibilityRole="radiogroup"
              accessibilityLabel="Terrenos"
              style={[estilos.linha, { gap: espacamento.p }]}
            >
              {terrenos.map((terreno, indice) => (
                <OpcaoTerreno
                  key={terreno.id}
                  nome={`Terreno ${indice + 1}`}
                  detalhe={`${terreno.larguraM} × ${terreno.comprimentoM} m · ${formatarDecimal(terreno.mudas.length)}`}
                  descricao={`Terreno ${indice + 1}, ${terreno.larguraM} por ${terreno.comprimentoM} metros, ${mudasTexto(terreno.mudas.length)}`}
                  escolhido={terreno.id === atual.id}
                  podeTirar={varios}
                  arrastando={arrasteTerreno?.id === terreno.id}
                  aoTocar={() => mostrarTerreno(terreno)}
                  aoSegurar={(pegada) => segurarTerreno(terreno, indice, pegada)}
                  aoArrastar={(pagina) =>
                    setArrasteTerreno((anterior) => (anterior ? arrastarPara(pagina, anterior) : null))
                  }
                  aoSoltar={soltarTerreno}
                  aoCancelar={() => setArrasteTerreno(null)}
                  aoTirar={() => tirarTerreno(terreno.id)}
                />
              ))}
            </View>
            {podeAdicionar ? (
              <BotaoTexto
                rotulo="+ Terreno"
                dica="Adiciona outro terreno, com as próprias medidas"
                onPress={adicionarTerreno}
              />
            ) : null}
          </ScrollView>
          {desfazer ? (
            // Junto da lista de terrenos, onde o dedo soltou o terreno.
            <View style={[estilos.linha, estilos.entre, estilos.quebrar]}>
              <Text
                accessibilityLiveRegion="polite"
                style={[tipografia.legenda, estilos.expandir, { color: cores.textoSuave }]}
              >
                {aviso}
              </Text>
              <BotaoTexto
                rotulo={leitorDeTela ? 'Desfazer' : `Desfazer (${segundosDesfazer} s)`}
                onPress={desfazerTirada}
              />
            </View>
          ) : varios ? (
            <Text style={[tipografia.legenda, { color: cores.textoSuave }]}>
              Para tirar um terreno, segure e arraste até a lixeira.
            </Text>
          ) : null}

          <View style={[estilos.linha, { gap: espacamento.p }]}>
            <CampoLado
              rotulo="Largura"
              nomeTerreno={varios ? nomeAtual : undefined}
              valor={textoLargura}
              invalido={ladoInvalido === 'larguraM'}
              aoMudar={(texto) => mudarLado('larguraM', texto)}
              aoSair={confirmarLado}
            />
            <CampoLado
              rotulo="Comprimento"
              nomeTerreno={varios ? nomeAtual : undefined}
              valor={textoComprimento}
              invalido={ladoInvalido === 'comprimentoM'}
              aoMudar={(texto) => mudarLado('comprimentoM', texto)}
              aoSair={confirmarLado}
            />
          </View>
          {ladoInvalido ? (
            <Text
              accessibilityLiveRegion="polite"
              style={[tipografia.legenda, { color: cores.perigo }]}
            >
              Use um valor inteiro de {LADO_MINIMO_M} a {LADO_MAXIMO_M} m. O terreno continua com{' '}
              {atual.larguraM} m × {atual.comprimentoM} m.
            </Text>
          ) : null}
          {varios ? (
            <Text style={[tipografia.legenda, { color: cores.textoSuave }]}>
              Neste terreno: {mudasTexto(atual.mudas.length)} · cabem até{' '}
              {formatarDecimal(capacidade)}
            </Text>
          ) : null}

          <View testID="area-do-terreno" onLayout={(e) => setLarguraTela(e.nativeEvent.layout.width)}>
            <PlanoTerreno
              // Outro terreno ou outras medidas: o zoom volta a mostrar o terreno inteiro.
              key={`${atual.id}-${atual.larguraM}x${atual.comprimentoM}`}
              terreno={atual}
              mudas={atual.mudas}
              numeroInicial={numeroInicial}
              larguraDisponivel={larguraTela}
              selecionada={selecionada}
              descricao={descricaoTerreno}
              aoTocarNoTerreno={colocarOndeTocou}
              aoColocarSemApontar={colocarNoPrimeiroLivre}
              aoSelecionar={setSelecionada}
              aoSoltar={soltar}
              aoMudarGesto={setGestoNoTerreno}
            />
          </View>

          {aviso && !desfazer ? (
            <Text
              accessibilityLiveRegion="polite"
              style={[tipografia.legenda, { color: cores.textoSuave }]}
            >
              {aviso}
            </Text>
          ) : null}

          <BotaoSecundario rotulo="Distribuir automaticamente" onPress={distribuir} />
          <View style={[estilos.linha, estilos.entre, estilos.quebrar]}>
            {/* Só com mudas no terreno: vazio, não há o que limpar. */}
            {atual.mudas.length > 0 ? (
              <BotaoTexto
                rotulo="Limpar terreno"
                onPress={() => {
                  atualizarAtual((t) => ({ ...t, mudas: [] }));
                  setSelecionada(null);
                  avisar('');
                }}
              />
            ) : null}
            {selecionada !== null ? (
              <BotaoTexto
                rotulo={`Tirar a muda ${numeroInicial + selecionada}`}
                onPress={remover}
              />
            ) : null}
          </View>
        </ScrollView>

        {arrasteTerreno ? (
          <CamadaLixeira
            rotulo={arrasteTerreno.nome}
            posicao={arrasteTerreno.posicao}
            sobreLixeira={arrasteTerreno.sobreLixeira}
            aoMedirLixeira={(area) => {
              areaLixeira.current = area;
            }}
          />
        ) : null}
      </View>
    </SafeAreaView>
  );
}

function CampoLado({
  rotulo,
  nomeTerreno,
  valor,
  invalido,
  aoMudar,
  aoSair,
}: {
  rotulo: string;
  // Com mais de um terreno, o leitor de tela diz de qual é o campo.
  nomeTerreno?: string;
  valor: string;
  invalido: boolean;
  aoMudar: (texto: string) => void;
  aoSair: () => void;
}) {
  const { cores, tipografia, espacamento, raios } = useTema();

  return (
    <View style={[estilos.expandir, { gap: espacamento.pp }]}>
      <Text style={[tipografia.rotulo, { color: cores.texto }]}>{rotulo}</Text>
      <View
        style={[
          estilos.linha,
          {
            minHeight: medidas.alturaCampo,
            gap: espacamento.pp,
            paddingHorizontal: espacamento.m,
            borderWidth: invalido ? medidas.bordaSelecionada : medidas.bordaCartao,
            borderColor: invalido ? cores.perigo : cores.borda,
            borderRadius: raios.linha,
            backgroundColor: cores.superficie,
          },
        ]}
      >
        <TextInput
          accessibilityLabel={`${rotulo} do ${nomeTerreno ? nomeTerreno.toLowerCase() : 'terreno'}, em metros`}
          accessibilityHint={`De ${LADO_MINIMO_M} a ${LADO_MAXIMO_M} metros`}
          value={valor}
          onChangeText={aoMudar}
          onBlur={aoSair}
          keyboardType="number-pad"
          inputMode="numeric"
          style={[tipografia.subtitulo, estilos.expandir, estilos.entrada, { color: cores.texto }]}
        />
        <Text style={[tipografia.linha, { color: cores.textoSuave }]}>m</Text>
      </View>
    </View>
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
  entrada: {
    paddingVertical: 0,
    minWidth: 0,
  },
  semSelecao: {
    userSelect: 'none',
  },
  entre: {
    justifyContent: 'space-between',
  },
  quebrar: {
    flexWrap: 'wrap',
  },
});
