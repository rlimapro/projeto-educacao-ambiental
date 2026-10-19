// Substitui o expo-sqlite/kv-store na prévia web (PREVIA_WEB=1). Os dados
// ficam só na memória da aba e somem ao recarregar, então toda abertura é um
// primeiro uso. O parâmetro ?tema=escuro na URL já abre com o tema escuro.
const valores = new Map();

const tema = new URLSearchParams(globalThis.location?.search ?? '').get('tema');
if (tema) {
  valores.set('preferencias.tema', tema);
}

exports.Storage = {
  getItemSync: (chave) => (valores.has(chave) ? valores.get(chave) : null),
  setItemSync: (chave, valor) => {
    valores.set(chave, valor);
  },
};
