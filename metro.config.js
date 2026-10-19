// Configuração do Metro. Sem a variável PREVIA_WEB, é a configuração padrão do
// Expo. Com PREVIA_WEB=1 (npm run previa:web), a versão web troca o
// armazenamento do expo-sqlite, que não roda no navegador sem configuração
// extra, por uma simulação em memória. A versão web serve só para conferir
// telas contra o protótipo (ver scripts/previa-web/README.md); o app é
// publicado apenas para Android e iOS.
const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

if (process.env.PREVIA_WEB === '1') {
  const resolverOriginal = config.resolver.resolveRequest;
  config.resolver.resolveRequest = (context, nomeModulo, plataforma) => {
    if (plataforma === 'web' && nomeModulo === 'expo-sqlite/kv-store') {
      return {
        type: 'sourceFile',
        filePath: path.join(__dirname, 'scripts/previa-web/armazenamento-memoria.js'),
      };
    }
    return (resolverOriginal ?? context.resolveRequest)(context, nomeModulo, plataforma);
  };
}

module.exports = config;
