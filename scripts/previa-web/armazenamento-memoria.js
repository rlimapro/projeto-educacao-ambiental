// Substitui o expo-sqlite/kv-store na prévia web (PREVIA_WEB=1). Os dados
// ficam só na memória da aba e somem ao recarregar, então toda abertura é um
// primeiro uso. Parâmetros na URL:
//   ?tema=escuro            abre com o tema escuro
//   ?boas-vindas=vistas     pula as boas-vindas, para conferir as outras telas
const valores = new Map();

const parametros = new URLSearchParams(globalThis.location?.search ?? '');
const tema = parametros.get('tema');
if (tema) {
  valores.set('preferencias.tema', tema);
}
if (parametros.get('boas-vindas') === 'vistas') {
  valores.set('preferencias.boasVindasConcluidas', 'sim');
}

exports.Storage = {
  getItemSync: (chave) => (valores.has(chave) ? valores.get(chave) : null),
  setItemSync: (chave, valor) => {
    valores.set(chave, valor);
  },
};
