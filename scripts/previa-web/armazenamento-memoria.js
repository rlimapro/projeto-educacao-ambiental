// Substitui o expo-sqlite/kv-store na prévia web (PREVIA_WEB=1). Os dados
// ficam só na memória da aba e somem ao recarregar, então toda abertura é um
// primeiro uso. Parâmetros na URL:
//   ?tema=escuro            abre com o tema escuro
//   ?boas-vindas=vistas     pula as boas-vindas, para conferir as outras telas
//   ?consumos=exemplo       registra outubro e setembro de 2026 com consumos de
//                           exemplo, calculados pela mesma função do app
//   ?consumos=historico     registra de outubro de 2025 a outubro de 2026, sem
//                           março, para conferir o histórico (gráfico, troca
//                           de meses e mês sem registro)
const { calcularEmissoes } = require('../../src/calculo/emissoes');

const valores = new Map();

const parametros = new URLSearchParams(globalThis.location?.search ?? '');
const tema = parametros.get('tema');
if (tema) {
  valores.set('preferencias.tema', tema);
}
if (parametros.get('boas-vindas') === 'vistas') {
  valores.set('preferencias.boasVindasConcluidas', 'sim');
}

const exemploConsumos = parametros.get('consumos');
if (exemploConsumos === 'exemplo' || exemploConsumos === 'historico') {
  const registrar = (ano, mes, consumos) => ({
    id: `${ano}-${String(mes).padStart(2, '0')}`,
    ano,
    mes,
    perfil: 'residencia',
    consumos,
    calculo: calcularEmissoes(consumos, ano, mes),
    criadoEm: new Date(ano, mes - 1, 28).toISOString(),
  });
  const vazio = { energiaKwh: 0, gasolinaLitros: 0, etanolLitros: 0, dieselLitros: 0, glpBotoes13Kg: 0 };
  const registros =
    exemploConsumos === 'exemplo'
      ? [
          registrar(2026, 10, { ...vazio, energiaKwh: 200, gasolinaLitros: 90, glpBotoes13Kg: 1 }),
          registrar(2026, 9, { ...vazio, energiaKwh: 180, gasolinaLitros: 100, glpBotoes13Kg: 1 }),
        ]
      : [
          // [ano, mês, litros de gasolina]; energia e gás iguais em todos.
          [2025, 10, 110], [2025, 11, 125], [2025, 12, 140], [2026, 1, 120], [2026, 2, 115],
          [2026, 4, 118], [2026, 5, 122], [2026, 6, 116], [2026, 7, 110], [2026, 8, 119],
          [2026, 9, 108], [2026, 10, 94],
        ]
          .map(([ano, mes, gasolinaLitros]) =>
            registrar(ano, mes, { ...vazio, energiaKwh: 180, gasolinaLitros, glpBotoes13Kg: 1 }),
          )
          .reverse();
  valores.set('consumos.registrados.v1', JSON.stringify(registros));
}

exports.Storage = {
  getItemSync: (chave) => (valores.has(chave) ? valores.get(chave) : null),
  setItemSync: (chave, valor) => {
    valores.set(chave, valor);
  },
};
