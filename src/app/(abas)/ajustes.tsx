import { File, Paths } from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';
import * as Sharing from 'expo-sharing';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState, type ReactNode } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { Perfil } from '@/calculo/tipos';
import { apagarRegistrosSalvos, gerarConteudoBackup, restaurarConteudoBackup, TAMANHO_MAXIMO_BACKUP_BYTES, validarConteudoBackup } from '@/dados/backup';
import { apagarPreferenciasPessoais, lerPerfil, salvarPerfil } from '@/dados/preferencias';
import { Icone, type NomeIcone } from '@/ui/Icone';
import { SeletorTema } from '@/ui/SeletorTema';
import { medidas, margemTela, useTema } from '@/ui/tema';

const perfis: { valor: Perfil; rotulo: string }[] = [
  { valor: 'pessoa', rotulo: 'Pessoal' },
  { valor: 'residencia', rotulo: 'Residência' },
  { valor: 'comercio', rotulo: 'Comércio' },
];

const rotuloPerfil: Record<Perfil, string> = {
  pessoa: 'Pessoal',
  residencia: 'Residência',
  comercio: 'Comércio',
};

type LinhaProps = {
  icone: NomeIcone;
  titulo: string;
  descricao?: string;
  corIcone?: 'marcaForte' | 'perigo';
  corTexto?: 'texto' | 'perigo';
  aoPressionar: () => void;
};

function Linha({ icone, titulo, descricao, corIcone = 'marcaForte', corTexto = 'texto', aoPressionar }: LinhaProps) {
  const { cores, tipografia, espacamento } = useTema();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={descricao ? `${titulo}. ${descricao}` : titulo}
      onPress={aoPressionar}
      style={({ pressed }) => [estilos.linha, { gap: espacamento.p, paddingVertical: espacamento.p, opacity: pressed ? medidas.opacidadePressionado : 1 }]}
    >
      <Icone nome={icone} cor={corIcone} />
      <View style={[estilos.textosLinha, descricao ? { gap: espacamento.mini } : undefined]}>
        <Text style={[tipografia.itemForte, { color: cores[corTexto] }]}>{titulo}</Text>
        {descricao ? <Text style={[tipografia.legenda, { color: cores.textoSuave }]}>{descricao}</Text> : null}
      </View>
      <Icone nome="abrir" cor="textoSuave" />
    </Pressable>
  );
}

function Secao({ titulo, children }: { titulo: string; children: ReactNode }) {
  const { cores, tipografia, espacamento } = useTema();
  return (
    <View style={{ gap: espacamento.p }}>
      <Text style={[tipografia.rotulo, { color: cores.textoSuave }]}>{titulo}</Text>
      {children}
    </View>
  );
}

export default function Ajustes() {
  const { cores, tipografia, espacamento, raios, definirPreferencia } = useTema();
  const [perfil, setPerfil] = useState<Perfil>(lerPerfil);
  const [mensagem, setMensagem] = useState('');

  useFocusEffect(useCallback(() => {
    setPerfil(lerPerfil());
  }, []));

  function escolherPerfil() {
    Alert.alert('Tipo de uso', 'Escolha para quem você registra os consumos.', [
      ...perfis.map((opcao) => ({
        text: `${opcao.valor === perfil ? '✓ ' : ''}${opcao.rotulo}`,
        onPress: () => {
          salvarPerfil(opcao.valor);
          setPerfil(opcao.valor);
        },
      })),
      { text: 'Cancelar', style: 'cancel' },
    ]);
  }

  async function exportarBackup() {
    try {
      if (!(await Sharing.isAvailableAsync())) {
        setMensagem('O compartilhamento não está disponível neste aparelho.');
        return;
      }
      const arquivo = new File(Paths.cache, 'backup-emissoes.json');
      if (arquivo.exists) arquivo.delete();
      arquivo.create();
      await arquivo.write(gerarConteudoBackup());
      await Sharing.shareAsync(arquivo.uri, {
        mimeType: 'application/json',
        dialogTitle: 'Guardar backup das emissões',
        UTI: 'public.json',
      });
      setMensagem('Backup pronto para guardar.');
    } catch {
      setMensagem('Não foi possível gerar o backup neste aparelho.');
    }
  }

  async function importarBackup() {
    try {
      const escolha = await DocumentPicker.getDocumentAsync({
        type: ['application/json', 'public.json'],
        copyToCacheDirectory: true,
        multiple: false,
      });
      if (escolha.canceled) return;

      const arquivoEscolhido = escolha.assets[0];
      const arquivoLocal = new File(arquivoEscolhido.uri);
      const tamanhoArquivo = arquivoEscolhido.size ?? arquivoLocal.size ?? 0;
      if (tamanhoArquivo > TAMANHO_MAXIMO_BACKUP_BYTES) {
        setMensagem('O arquivo de backup é maior que o limite permitido.');
        return;
      }
      const conteudo = await arquivoLocal.text();
      const quantidade = validarConteudoBackup(conteudo).length;

      Alert.alert(
        'Importar backup?',
        `Os registros atuais serão substituídos pelos ${quantidade} períodos deste arquivo.`,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Importar',
            onPress: () => {
              try {
                const importados = restaurarConteudoBackup(conteudo);
                setMensagem(`${importados} períodos importados.`);
              } catch {
                setMensagem('Não foi possível importar. Os registros atuais foram mantidos.');
              }
            },
          },
        ],
      );
    } catch (erro) {
      setMensagem(erro instanceof Error ? erro.message : 'Não foi possível ler esse arquivo.');
    }
  }

  function confirmarApagamento() {
    Alert.alert(
      'Apagar todos os dados?',
      'Seus registros, o perfil e as preferências salvas neste aparelho serão apagados. Essa ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Apagar dados',
          style: 'destructive',
          onPress: () => {
            try {
              apagarRegistrosSalvos();
              apagarPreferenciasPessoais();
              definirPreferencia('claro');
              setPerfil('residencia');
              setMensagem('Dados apagados deste aparelho.');
            } catch {
              setMensagem('Não foi possível apagar os dados. Tente novamente.');
            }
          },
        },
      ],
    );
  }

  function mostrarFontes() {
    Alert.alert('Fatores de emissão e fontes', 'Cada cálculo mostra o consumo registrado, o fator aplicado, a fonte consultada e o ano de referência. Abra a memória de cálculo de um período para conferir esses detalhes.');
  }

  function mostrarSobre() {
    Alert.alert('Sobre o app', 'Este app ajuda você a acompanhar suas emissões e encontrar formas de reduzi-las. Seus dados ficam neste aparelho; o backup só sai quando você escolhe exportá-lo.');
  }

  return (
    <SafeAreaView edges={['top']} style={[estilos.tela, { backgroundColor: cores.fundo }]}>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: margemTela,
          paddingTop: espacamento.m,
          paddingBottom: espacamento.m,
          gap: espacamento.p,
        }}
      >
        <Text accessibilityRole="header" style={[tipografia.tituloTela, { color: cores.texto }]}>Ajustes</Text>

        <Secao titulo="Aparência">
          <SeletorTema />
        </Secao>

        <Secao titulo="Perfil">
          <View style={[estilos.cartao, { borderColor: cores.borda, backgroundColor: cores.superficie, borderRadius: raios.cartao, paddingHorizontal: espacamento.m }]}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Tipo de uso: ${rotuloPerfil[perfil]}`}
              onPress={escolherPerfil}
              style={({ pressed }) => [estilos.linha, { gap: espacamento.p, paddingVertical: espacamento.p, opacity: pressed ? medidas.opacidadePressionado : 1 }]}
            >
              <Icone nome="tipoUso" />
              <Text style={[tipografia.itemForte, estilos.textosLinha, { color: cores.texto }]}>Tipo de uso</Text>
              <Text style={[tipografia.apoio, { color: cores.textoSuave }]}>{rotuloPerfil[perfil]}</Text>
              <Icone nome="abrir" cor="textoSuave" />
            </Pressable>
          </View>
        </Secao>

        <Secao titulo="Seus dados">
          <View style={[estilos.cartao, { borderColor: cores.borda, backgroundColor: cores.superficie, borderRadius: raios.cartao, paddingHorizontal: espacamento.m }]}>
            <Linha icone="exportar" titulo="Exportar backup" descricao="Gera um arquivo para guardar onde quiser" aoPressionar={exportarBackup} />
            <View style={[estilos.divisor, { backgroundColor: cores.borda }]} />
            <Linha icone="importar" titulo="Importar backup" descricao="Recupera os dados de outro aparelho" aoPressionar={importarBackup} />
            <View style={[estilos.divisor, { backgroundColor: cores.borda }]} />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Apagar todos os dados"
              onPress={confirmarApagamento}
              style={({ pressed }) => [estilos.linha, { minHeight: medidas.areaToqueMinima, gap: espacamento.p, opacity: pressed ? medidas.opacidadePressionado : 1 }]}
            >
              <Icone nome="apagar" cor="perigo" />
              <Text style={[tipografia.itemForte, estilos.textosLinha, { color: cores.perigo }]}>Apagar todos os dados</Text>
            </Pressable>
          </View>
        </Secao>

        <Secao titulo="Sobre">
          <View style={[estilos.cartao, { borderColor: cores.borda, backgroundColor: cores.superficie, borderRadius: raios.cartao, paddingHorizontal: espacamento.m }]}>
            <Linha icone="fontes" titulo="Fatores de emissão e fontes" aoPressionar={mostrarFontes} />
            <View style={[estilos.divisor, { backgroundColor: cores.borda }]} />
            <Linha icone="sobre" titulo="Sobre o app" aoPressionar={mostrarSobre} />
          </View>
        </Secao>

        {mensagem ? (
          <Text accessibilityLiveRegion="polite" style={[tipografia.legenda, { color: cores.textoSuave }]}>{mensagem}</Text>
        ) : null}
        <View style={estilos.espaco} />
      </ScrollView>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1 },
  cartao: {
    borderWidth: medidas.bordaCartao,
    overflow: 'hidden',
  },
  linha: {
    minHeight: medidas.areaToqueMinima,
    flexDirection: 'row',
    alignItems: 'center',
  },
  textosLinha: { flex: 1, minWidth: 0 },
  divisor: { height: medidas.bordaCartao },
  espaco: { flexGrow: 1, minHeight: 0 },
});
