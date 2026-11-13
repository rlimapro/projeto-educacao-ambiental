import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { calcularEmissoes } from '@/calculo/emissoes';
import type { ConsumosInformados, Perfil } from '@/calculo/tipos';
import { lerRegistrosConsumo, salvarRegistroConsumo, type RegistroConsumo } from '@/dados/consumos';
import { lerPerfil } from '@/dados/preferencias';
import { BotaoPrimario } from '@/ui/BotaoPrimario';
import { AJUDA_CONSUMO, type CampoComAjuda } from '@/ui/ajudaConsumo';
import { BotaoTexto } from '@/ui/BotaoTexto';
import { Cartao } from '@/ui/Cartao';
import { FolhaAjuda } from '@/ui/FolhaAjuda';
import { Icone } from '@/ui/Icone';
import { IconeConsumo } from '@/ui/IconeConsumo';
import { SeletorMesConsumo } from '@/ui/SeletorMesConsumo';
import { margemTela, medidas, useTema } from '@/ui/tema';

type CamposConsumo = {
  energia: string;
  gasolina: string;
  gas: string;
  etanol: string;
  diesel: string;
};

type Periodo = { id: string; ano: number; mes: number };

type EstadoInicial = {
  periodo: Periodo;
  registro: RegistroConsumo | null;
  registros: string[];
  consumos: CamposConsumo;
  erro: string;
};

type CampoConsumoProps = {
  nome: string;
  unidade: string;
  icone: 'energia' | 'combustivel' | 'gas';
  valor: string;
  aoAlterar: (valor: string) => void;
  aoPedirAjuda: () => void;
};

const nomesPerfil: Record<Perfil, string> = {
  pessoa: 'Pessoal',
  residencia: 'Residência',
  comercio: 'Comércio',
};

const consumosVazios: CamposConsumo = { energia: '', gasolina: '', gas: '', etanol: '', diesel: '' };

function periodoPorId(id: string): Periodo {
  const [ano, mes] = id.split('-').map(Number);
  return { id, ano, mes };
}

function consumosParaTela(consumos: ConsumosInformados): CamposConsumo {
  return {
    energia: String(consumos.energiaKwh),
    gasolina: String(consumos.gasolinaLitros),
    gas: String(consumos.glpBotoes13Kg),
    etanol: String(consumos.etanolLitros),
    diesel: String(consumos.dieselLitros),
  };
}

function lerEstadoInicial(): EstadoInicial {
  const data = new Date();
  const id = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`;
  const periodo = periodoPorId(id);
  try {
    const registros = lerRegistrosConsumo();
    const registro = registros.find((item) => item.id === id) ?? null;
    return {
      periodo,
      registro,
      registros: registros.map((item) => item.id),
      consumos: registro ? consumosParaTela(registro.consumos) : consumosVazios,
      erro: '',
    };
  } catch {
    return { periodo, registro: null, registros: [], consumos: consumosVazios, erro: 'Não foi possível ler os consumos salvos neste aparelho.' };
  }
}

function CampoConsumo({ nome, unidade, icone, valor, aoAlterar, aoPedirAjuda }: CampoConsumoProps) {
  const { cores, tipografia, espacamento, raios } = useTema();

  return (
    <View style={{ gap: espacamento.pp }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: espacamento.pp }}>
        <IconeConsumo nome={icone} />
        <Text style={[estilos.nomeCampo, tipografia.rotulo, { color: cores.texto }]}>{nome}</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Como preencher ${nome.toLowerCase()}`}
          hitSlop={espacamento.p}
          onPress={aoPedirAjuda}
          style={({ pressed }) => ({ opacity: pressed ? medidas.opacidadePressionado : 1 })}
        >
          <Icone nome="ajuda" cor="textoSuave" />
        </Pressable>
      </View>
      <View
        style={{
          minHeight: medidas.alturaCampo,
          flexDirection: 'row',
          alignItems: 'center',
          gap: espacamento.pp,
          paddingHorizontal: espacamento.m,
          borderWidth: medidas.bordaCartao,
          borderColor: cores.borda,
          borderRadius: raios.linha,
          backgroundColor: cores.superficie,
        }}
      >
        <TextInput
          accessibilityLabel={`${nome}, consumo em ${unidade}`}
          value={valor}
          onChangeText={aoAlterar}
          keyboardType="decimal-pad"
          inputMode="decimal"
          placeholder="0"
          placeholderTextColor={cores.textoSuave}
          style={[tipografia.subtitulo, estilos.entrada, { color: cores.texto }]}
        />
        <Text style={[tipografia.linha, { color: cores.textoSuave }]}>{unidade}</Text>
      </View>
    </View>
  );
}

function numeroValido(valor: string): boolean {
  if (valor.trim() === '') return true;
  const numero = Number(valor.replace(',', '.'));
  return Number.isFinite(numero) && numero >= 0;
}

export default function Registrar() {
  const { cores, tipografia, espacamento } = useTema();
  const [perfil, setPerfil] = useState(lerPerfil);
  const [estadoInicial] = useState(lerEstadoInicial);
  const [periodo, setPeriodo] = useState(estadoInicial.periodo);
  const [registroAtual, setRegistroAtual] = useState(estadoInicial.registro);
  const [periodosRegistrados, setPeriodosRegistrados] = useState(estadoInicial.registros);
  const [consumos, setConsumos] = useState(estadoInicial.consumos);
  const [rascunhos, setRascunhos] = useState<Record<string, CamposConsumo>>({});
  const [dieselVisivel, setDieselVisivel] = useState((estadoInicial.registro?.consumos.dieselLitros ?? 0) > 0);
  const [mensagem, setMensagem] = useState(estadoInicial.erro);
  const [seletorVisivel, setSeletorVisivel] = useState(false);
  const [confirmarSubstituicao, setConfirmarSubstituicao] = useState(false);
  const [campoAjuda, setCampoAjuda] = useState<CampoComAjuda | null>(null);

  useFocusEffect(useCallback(() => {
    setPerfil(lerPerfil());
  }, []));
  const idPeriodo = periodo.id;
  const referencia = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(
    new Date(periodo.ano, periodo.mes - 1, 1),
  );
  const referenciaMaiuscula = referencia.charAt(0).toLocaleUpperCase('pt-BR') + referencia.slice(1);

  function escolherPeriodo(id: string) {
    try {
      const registros = lerRegistrosConsumo();
      const registro = registros.find((item) => item.id === id) ?? null;
      const consumosDoRegistro = registro ? consumosParaTela(registro.consumos) : consumosVazios;
      const rascunho = rascunhos[id];
      const valores = rascunho ?? consumosDoRegistro;
      setPeriodo(periodoPorId(id));
      setRegistroAtual(registro);
      setPeriodosRegistrados(registros.map((item) => item.id));
      setConsumos(valores);
      setDieselVisivel((Number(valores.diesel) || 0) > 0);
      setMensagem(registro ? 'Este mês já tem um registro. Ao calcular, você poderá confirmar a substituição.' : '');
      setSeletorVisivel(false);
    } catch {
      setMensagem('Não foi possível carregar os registros. Seus dados salvos foram mantidos.');
      setSeletorVisivel(false);
    }
  }

  function alterar(campo: keyof CamposConsumo, valor: string) {
    const novosConsumos = { ...consumos, [campo]: valor.replace(/[^0-9,.-]/g, '') };
    setConsumos(novosConsumos);
    setRascunhos((atuais) => ({ ...atuais, [idPeriodo]: novosConsumos }));
    setMensagem('');
  }

  function validarFormulario(): boolean {
    const valores = Object.values(consumos).filter((valor) => valor.trim() !== '');
    if (valores.length === 0) {
      setMensagem('Informe ao menos um consumo para continuar.');
      return false;
    }
    if (valores.some((valor) => !numeroValido(valor))) {
      setMensagem('Confira os valores: use números iguais ou maiores que zero.');
      return false;
    }
    return true;
  }

  function calcularESalvar() {
    if (!validarFormulario()) return;

    const converter = (valor: string) => (valor.trim() === '' ? 0 : Number(valor.replace(',', '.')));
    const consumosInformados: ConsumosInformados = {
      energiaKwh: converter(consumos.energia),
      gasolinaLitros: converter(consumos.gasolina),
      glpBotoes13Kg: converter(consumos.gas),
      etanolLitros: converter(consumos.etanol),
      dieselLitros: converter(consumos.diesel),
    };

    try {
      const calculo = calcularEmissoes(consumosInformados, periodo.ano, periodo.mes);
      const registro: RegistroConsumo = {
        id: idPeriodo,
        ano: periodo.ano,
        mes: periodo.mes,
        perfil,
        consumos: consumosInformados,
        calculo,
        criadoEm: registroAtual?.criadoEm ?? new Date().toISOString(),
      };
      salvarRegistroConsumo(registro);
      setRegistroAtual(registro);
      setPeriodosRegistrados((atuais) => atuais.includes(idPeriodo) ? atuais : [...atuais, idPeriodo]);
      setMensagem('');
      setRascunhos((atuais) => {
        const novos = { ...atuais };
        delete novos[idPeriodo];
        return novos;
      });
      // O resultado aparece na Início, já no mês registrado; de lá, cada fonte
      // abre a memória de cálculo (RF04).
      router.navigate({ pathname: '/', params: { periodo: idPeriodo } });
    } catch {
      setMensagem('Não foi possível calcular e salvar. Seus registros anteriores foram mantidos.');
    }
  }

  function solicitarCalculo() {
    if (!validarFormulario()) return;
    if (registroAtual) {
      setConfirmarSubstituicao(true);
      return;
    }
    calcularESalvar();
  }

  return (
    <SafeAreaView edges={['top']} style={[estilos.tela, { backgroundColor: cores.fundo }]}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: margemTela,
          paddingTop: espacamento.m,
          paddingBottom: espacamento.m,
          gap: espacamento.m,
        }}
      >
        <View style={{ gap: espacamento.mini }}>
          <Text accessibilityRole="header" style={[tipografia.tituloTela, { color: cores.texto }]}>
            Registrar consumo
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Mês do consumo: ${referenciaMaiuscula}`}
            accessibilityHint="Abre o seletor de mês. Você pode escolher meses passados."
            onPress={() => setSeletorVisivel(true)}
            style={({ pressed }) => [estilos.periodo, { minHeight: medidas.areaToqueMinima, gap: espacamento.mini, opacity: pressed ? medidas.opacidadePressionado : 1 }]}
          >
            <Text style={[tipografia.legenda, { color: cores.textoSuave }]}>
              {referenciaMaiuscula} · {nomesPerfil[perfil]}
            </Text>
            <Icone nome="abrirPeriodo" cor="textoSuave" />
          </Pressable>
        </View>

        <CampoConsumo
          nome="Energia elétrica"
          unidade="kWh"
          icone="energia"
          valor={consumos.energia}
          aoAlterar={(valor) => alterar('energia', valor)}
          aoPedirAjuda={() => setCampoAjuda('energia')}
        />
        <CampoConsumo
          nome="Gasolina"
          unidade="litros"
          icone="combustivel"
          valor={consumos.gasolina}
          aoAlterar={(valor) => alterar('gasolina', valor)}
          aoPedirAjuda={() => setCampoAjuda('gasolina')}
        />
        <CampoConsumo
          nome="Gás de cozinha"
          unidade="botijão de 13 kg"
          icone="gas"
          valor={consumos.gas}
          aoAlterar={(valor) => alterar('gas', valor)}
          aoPedirAjuda={() => setCampoAjuda('gas')}
        />
        <CampoConsumo
          nome="Etanol"
          unidade="litros"
          icone="combustivel"
          valor={consumos.etanol}
          aoAlterar={(valor) => alterar('etanol', valor)}
          aoPedirAjuda={() => setCampoAjuda('etanol')}
        />

        {dieselVisivel ? (
          <CampoConsumo
            nome="Diesel"
            unidade="litros"
            icone="combustivel"
            valor={consumos.diesel}
            aoAlterar={(valor) => alterar('diesel', valor)}
            aoPedirAjuda={() => setCampoAjuda('diesel')}
          />
        ) : (
          <Pressable
            accessibilityRole="button"
            onPress={() => setDieselVisivel(true)}
            style={({ pressed }) => [estilos.adicionar, { minHeight: medidas.areaToqueMinima, gap: espacamento.pp, opacity: pressed ? medidas.opacidadePressionado : 1 }]}
          >
            <IconeConsumo nome="adicionar" />
            <Text style={[tipografia.itemForte, { color: cores.marcaForte }]}>Adicionar outra fonte</Text>
          </Pressable>
        )}

        {mensagem ? (
          <Text accessibilityLiveRegion="polite" style={[tipografia.legenda, { color: mensagem.startsWith('Não foi') || mensagem.startsWith('Confira') || mensagem.startsWith('Informe') ? cores.textoSuave : cores.marcaForte }]}>
            {mensagem}
          </Text>
        ) : null}

        <View style={estilos.espaco} />
        <BotaoPrimario rotulo="Calcular emissões" onPress={solicitarCalculo} />
      </ScrollView>

      <SeletorMesConsumo
        key={`${seletorVisivel}-${idPeriodo}`}
        visivel={seletorVisivel}
        selecionado={idPeriodo}
        periodosRegistrados={periodosRegistrados}
        aoEscolher={escolherPeriodo}
        aoFechar={() => setSeletorVisivel(false)}
      />

      <FolhaAjuda
        ajuda={campoAjuda ? AJUDA_CONSUMO[campoAjuda] : null}
        aoFechar={() => setCampoAjuda(null)}
      />

      <Modal visible={confirmarSubstituicao} transparent animationType="fade" onRequestClose={() => setConfirmarSubstituicao(false)}>
        <View style={[estilos.fundoConfirmacao, { backgroundColor: cores.veu, paddingHorizontal: margemTela }]}>
          <Cartao style={{ gap: espacamento.m }}>
            <Text accessibilityRole="header" style={[tipografia.subtitulo, { color: cores.texto }]}>
              Substituir registro?
            </Text>
            <Text style={[tipografia.corpo, { color: cores.textoSuave }]}>
              Já existe um registro para {referencia}. Se continuar, os dados e o cálculo desse mês serão atualizados.
            </Text>
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: espacamento.p }}>
              <BotaoTexto rotulo="Cancelar" onPress={() => setConfirmarSubstituicao(false)} />
              <BotaoPrimario rotulo="Substituir registro" onPress={() => { setConfirmarSubstituicao(false); calcularESalvar(); }} />
            </View>
          </Cartao>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1 },
  entrada: { flex: 1, paddingVertical: 0, minWidth: 0 },
  nomeCampo: { flex: 1 },
  periodo: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start' },
  adicionar: { flexDirection: 'row', alignItems: 'center' },
  espaco: { flexGrow: 1, minHeight: 0 },
  fundoConfirmacao: { flex: 1, justifyContent: 'center' },
});
