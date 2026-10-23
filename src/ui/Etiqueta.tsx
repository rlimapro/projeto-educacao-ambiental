import { Text, View } from 'react-native';

import { medidas, useTema } from './tema';

// Pílula com um texto curto, como o perfil ("Residência") no topo do Início.
export function Etiqueta({ texto }: { texto: string }) {
  const { cores, tipografia, espacamento, raios } = useTema();

  return (
    <View
      style={{
        paddingHorizontal: espacamento.p,
        paddingVertical: espacamento.mini,
        borderRadius: raios.pilula,
        borderWidth: medidas.bordaCartao,
        borderColor: cores.borda,
        backgroundColor: cores.superficie,
      }}
    >
      <Text style={[tipografia.etiqueta, { color: cores.textoSuave }]}>{texto}</Text>
    </View>
  );
}
