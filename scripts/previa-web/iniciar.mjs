// Inicia o servidor web do Expo com PREVIA_WEB=1 (ver metro.config.js).
// Fica num script para funcionar igual no Linux, no macOS e no Windows. Usa a
// porta 8099 para não disputar a 8081 com o `npx expo start` do Expo Go.
import { spawn } from 'node:child_process';

const expo = spawn('npx', ['expo', 'start', '--web', '--port', '8099', ...process.argv.slice(2)], {
  stdio: 'inherit',
  shell: process.platform === 'win32',
  env: { ...process.env, PREVIA_WEB: '1' },
});
expo.on('exit', (codigo) => process.exit(codigo ?? 0));
