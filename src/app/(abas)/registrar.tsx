import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { calcularEmissoes } from '@/calculo/emissoes';
import type { ConsumosInformados, Perfil, ResultadoEmissoes } from '@/calculo/tipos';
import { lerRegistrosConsumo, salvarRegistroConsumo } from '@/dados/consumos';
import { lerPerfil } from '@/dados/preferencias';
import { BotaoPrimario } from '@/ui/BotaoPrimario';
import { Cartao } from '@/ui/Cartao';
import { formatarEmissaoComUnidade } from '@/ui/formatacao';
import { IconeConsumo } from '@/ui/IconeConsumo';
import { margemTela, medidas, useTema } from '@/ui/tema';

type CampoConsumoProps = {
  nome: string;
  unidade: string;
  icone: 'energia' | 'combustivel' | 'gas';
  valor: string;
  dica?: string;
  aoAlterar: (valor: string) => void;
};

const nomesPerfil: Record<Perfil, string> = {
  pessoa: 'Pessoal',
  residencia: 'Residência',
  comercio: 'Comércio',
};

function CampoConsumo({ nome, unidade, icone, valor, dica, aoAlterar }: CampoConsumoProps) {
  const { cores, tipografia, espacamento, raios } = useTema();

  return (
    <View style={{ gap: espacamento.pp }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: espacamento.pp }}>
        <IconeConsumo nome={icone} />
        <Text style={[tipografia.rotulo, { color: cores.texto }]}>{nome}</Text>
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
      {dica ? <Text style={[tipografia.legenda, { color: cores.textoSuave }]}>{dica}</Text> : null}
    </View>
  );
}

function numeroValido(valor: string): boolean {
  if (valor.trim() === '') return true;
  const numero = Number(valor.replace(',', '.'));
  return Number.isFinite(numero) && numero >= 0;
}

function textoNumero(valor: number): string {
  return String(valor);
}

const formatarNumero = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 4 });

export default function Registrar() {
  const { cores, tipografia, espacamento } = useTema();
  const [perfil] = useState(() => lerPerfil());
  const [periodoAtual] = useState(() => {
    const data = new Date();
    return { ano: data.getFullYear(), mes: data.getMonth() + 1 };
  });
  const idPeriodo = `${periodoAtual.ano}-${String(periodoAtual.mes).padStart(2, '0')}`;
  const [estadoInicial] = useState(() => {
    try {
      const registro = lerRegistrosConsumo().find((item) => item.id === idPeriodo);
      return {
        registro,
        erro: '',
        consumos: registro
          ? {
              energia: textoNumero(registro.consumos.energiaKwh),
              gasolina: textoNumero(registro.consumos.gasolinaLitros),
              gas: textoNumero(registro.consumos.glpBotoes13Kg),
              etanol: textoNumero(registro.consumos.etanolLitros),
              diesel: textoNumero(registro.consumos.dieselLitros),
            }
          : { energia: '', gasolina: '', gas: '', etanol: '', diesel: '' },
      };
    } catch {
      return { registro: undefined, erro: 'Não foi possível ler os consumos salvos neste aparelho.', consumos: { energia: '', gasolina: '', gas: '', etanol: '', diesel: '' } };
    }
  });
  const [consumos, setConsumos] = useState(estadoInicial.consumos);
  const [dieselVisivel, setDieselVisivel] = useState((estadoInicial.registro?.consumos.dieselLitros ?? 0) > 0);
  const [mensagem, setMensagem] = useState(estadoInicial.erro);
  const [resultado, setResultado] = useState<ResultadoEmissoes | null>(estadoInicial.registro?.calculo ?? null);
  const referencia = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(
    new Date(periodoAtual.ano, periodoAtual.mes - 1, 1),
  );
  const perfilRotulo = nomesPerfil[perfil];

  function alterar(campo: keyof typeof consumos, valor: string) {
    setConsumos((atual) => ({ ...atual, [campo]: valor.replace(/[^0-9,.-]/g, '') }));
    setMensagem('');
    setResultado(null);
  }

  function calcular() {
    const valores = Object.values(consumos).filter((valor) => valor.trim() !== '');
    if (valores.length === 0) {
      setMensagem('Informe ao menos um consumo para continuar.');
      return;
    }
    if (valores.some((valor) => !numeroValido(valor))) {
      setMensagem('Confira os valores: use números iguais ou maiores que zero.');
      return;
    }
    const converter = (valor: string) => (valor.trim() === '' ? 0 : Number(valor.replace(',', '.')));
    const consumosInformados: ConsumosInformados = {
      energiaKwh: converter(consumos.energia),
      gasolinaLitros: converter(consumos.gasolina),
      glpBotoes13Kg: converter(consumos.gas),
      etanolLitros: converter(consumos.etanol),
      dieselLitros: converter(consumos.diesel),
    };
    try {
      const calculo = calcularEmissoes(consumosInformados, periodoAtual.ano, periodoAtual.mes);
      salvarRegistroConsumo({
        id: idPeriodo,
        ano: periodoAtual.ano,
        mes: periodoAtual.mes,
        perfil,
        consumos: consumosInformados,
        calculo,
        criadoEm: estadoInicial.registro?.criadoEm ?? new Date().toISOString(),
      });
      setResultado(calculo);
      setMensagem('Consumos registrados neste aparelho.');
    } catch {
      setMensagem('Não foi possível calcular e salvar. Seus registros anteriores foram mantidos.');
    }
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
          <Text style={[tipografia.legenda, { color: cores.textoSuave }]}>
            {referencia.charAt(0).toLocaleUpperCase('pt-BR') + referencia.slice(1)} · {perfilRotulo}
          </Text>
        </View>

        <CampoConsumo
          nome="Energia elétrica"
          unidade="kWh"
          icone="energia"
          valor={consumos.energia}
          dica="Está na conta de luz, como consumo do mês."
          aoAlterar={(valor) => alterar('energia', valor)}
        />
        <CampoConsumo
          nome="Gasolina"
          unidade="litros"
          icone="combustivel"
          valor={consumos.gasolina}
          aoAlterar={(valor) => alterar('gasolina', valor)}
        />
        <CampoConsumo
          nome="Gás de cozinha"
          unidade="botijão de 13 kg"
          icone="gas"
          valor={consumos.gas}
          aoAlterar={(valor) => alterar('gas', valor)}
        />
        <CampoConsumo
          nome="Etanol"
          unidade="litros"
          icone="combustivel"
          valor={consumos.etanol}
          aoAlterar={(valor) => alterar('etanol', valor)}
        />

        {dieselVisivel ? (
          <CampoConsumo
            nome="Diesel"
            unidade="litros"
            icone="combustivel"
            valor={consumos.diesel}
            aoAlterar={(valor) => alterar('diesel', valor)}
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
          <Text accessibilityLiveRegion="polite" style={[tipografia.legenda, { color: mensagem.startsWith('Não foi') ? cores.textoSuave : cores.marcaForte }]}>
            {mensagem}
          </Text>
        ) : null}

        {resultado ? (
          <Cartao style={{ gap: espacamento.p }}>
            <Text accessibilityRole="header" style={[tipografia.subtitulo, { color: cores.texto }]}>
              Emissões calculadas
            </Text>
            <Text style={[tipografia.numeroCartao, { color: cores.marcaForte }]}>
              {formatarEmissaoComUnidade(resultado.totalKgCo2e)} CO₂e
            </Text>
            {resultado.fontes.map((fonte) => (
              <View key={fonte.id} style={{ gap: espacamento.mini }}>
                <Text style={[tipografia.itemForte, { color: cores.texto }]}>
                  {fonte.nome}: {formatarNumero.format(fonte.consumoInformado)} {fonte.unidadeInformada}
                </Text>
                {fonte.conversao ? (
                  <Text style={[tipografia.nota, { color: cores.textoSuave }]}>
                    {formatarNumero.format(fonte.consumoInformado)} × {formatarNumero.format(fonte.conversao.multiplicador)} kg = {formatarNumero.format(fonte.consumoAplicado)} {fonte.conversao.unidadeResultado}
                  </Text>
                ) : null}
                <Text style={[tipografia.nota, { color: cores.textoSuave }]}>
                  {formatarNumero.format(fonte.consumoAplicado)} × {formatarNumero.format(fonte.fator.valor)} {fonte.fator.unidadeFator} = {formatarEmissaoComUnidade(fonte.emissaoKgCo2e)} CO₂e
                </Text>
                <Text style={[tipografia.nota, { color: cores.textoSuave }]}>
                  {fonte.fator.fonte} · {fonte.fator.ano} · versão {fonte.fator.versao}
                </Text>
              </View>
            ))}
          </Cartao>
        ) : null}

        <View style={estilos.espaco} />
        <BotaoPrimario rotulo="Calcular emissões" onPress={calcular} />
      </ScrollView>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1 },
  entrada: { flex: 1, paddingVertical: 0, minWidth: 0 },
  adicionar: { flexDirection: 'row', alignItems: 'center' },
  espaco: { flexGrow: 1, minHeight: 0 },
});
