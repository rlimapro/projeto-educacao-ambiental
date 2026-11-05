import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { Perfil } from '@/calculo/tipos';
import { lerPerfil, salvarPerfil } from '@/dados/preferencias';
import { Cartao } from '@/ui/Cartao';
import { LinhaAcao } from '@/ui/LinhaAcao';
import { OpcaoCartao } from '@/ui/OpcaoCartao';
import { SeletorTema } from '@/ui/SeletorTema';
import { margemTela, useTema } from '@/ui/tema';

const opcoesPerfil: { valor: Perfil; titulo: string; descricao: string }[] = [
  { valor: 'pessoa', titulo: 'Para mim', descricao: 'Deslocamentos e consumo pessoal' },
  { valor: 'residencia', titulo: 'Minha residência', descricao: 'Energia, gás e veículos da casa' },
  { valor: 'comercio', titulo: 'Meu comércio', descricao: 'Energia, gás, combustível e entregas' },
];

export default function Ajustes() {
  const { cores, tipografia, espacamento } = useTema();
  const [perfil, setPerfil] = useState<Perfil>(() => lerPerfil());

  function atualizarPerfil(novoPerfil: Perfil) {
    setPerfil(novoPerfil);
    salvarPerfil(novoPerfil);
  }

  return (
    <SafeAreaView style={[estilos.tela, { backgroundColor: cores.fundo }]}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: margemTela,
          paddingVertical: espacamento.m,
          gap: espacamento.m,
        }}
      >
        <Text accessibilityRole="header" style={[tipografia.subtitulo, { color: cores.texto }]}>
          Ajustes
        </Text>

        <View style={{ gap: espacamento.p }}>
          <Text style={[tipografia.rotulo, { color: cores.textoSuave }]}>Perfil</Text>
          <View accessibilityRole="radiogroup" style={{ gap: espacamento.p }}>
            {opcoesPerfil.map((opcao) => (
              <OpcaoCartao
                key={opcao.valor}
                icone={opcao.valor}
                titulo={opcao.titulo}
                descricao={opcao.descricao}
                selecionada={perfil === opcao.valor}
                onPress={() => atualizarPerfil(opcao.valor)}
              />
            ))}
          </View>
        </View>

        <View style={{ gap: espacamento.p }}>
          <Text style={[tipografia.rotulo, { color: cores.textoSuave }]}>Aparência</Text>
          <Cartao style={{ paddingVertical: espacamento.p }}>
            <SeletorTema />
          </Cartao>
        </View>

        <View style={{ gap: espacamento.p }}>
          <Text style={[tipografia.rotulo, { color: cores.textoSuave }]}>Dados</Text>
          <LinhaAcao
            icone="backup"
            titulo="Exportar backup"
            descricao="Salvar dados em um arquivo do aparelho"
          />
          <LinhaAcao
            icone="backup"
            titulo="Importar backup"
            descricao="Restaurar dados de outro aparelho"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  tela: {
    flex: 1,
  },
});
