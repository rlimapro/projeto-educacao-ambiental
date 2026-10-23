// Tira capturas de uma tela da prévia web, no tamanho do protótipo (390 × 844),
// nos temas claro e escuro, tocando em botões entre uma captura e outra.
//
// Uso (com `npm run previa:web` rodando em outro terminal):
//   npm run previa:capturar -- /boas-vindas Continuar Continuar Continuar
//
// Gera .previa/<rota>-<tema>-<n>.png. Precisa do Google Chrome instalado.
// Só acessa o servidor local de desenvolvimento; não faz parte do app.
import { spawn } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const ENDERECO = process.env.PREVIA_ENDERECO ?? 'http://localhost:8099';
const PORTA_DEPURACAO = 9333;
const [rota = '/', ...toques] = process.argv.slice(2);
const pasta = '.previa';
mkdirSync(pasta, { recursive: true });

const espera = (ms) => new Promise((resolver) => setTimeout(resolver, ms));

// Confere antes se a prévia está no ar, para não fotografar uma página de erro.
try {
  const resposta = await fetch(`${ENDERECO}${rota}`);
  if (!resposta.ok) {
    console.error(`A prévia respondeu ${resposta.status} em ${ENDERECO}${rota}. Veja o terminal do npm run previa:web.`);
    process.exit(1);
  }
} catch {
  console.error(`A prévia não está no ar em ${ENDERECO}. Rode npm run previa:web em outro terminal.`);
  process.exit(1);
}

async function capturarTema(esquema) {
  const perfil = mkdtempSync(join(tmpdir(), 'previa-chrome-'));
  const chrome = spawn(
    'google-chrome',
    [
      '--headless=new',
      `--remote-debugging-port=${PORTA_DEPURACAO}`,
      `--user-data-dir=${perfil}`,
      '--no-first-run',
      '--hide-scrollbars',
      'about:blank',
    ],
    { stdio: 'ignore' },
  );

  try {
    let alvo;
    for (let i = 0; i < 50 && !alvo; i++) {
      await espera(300);
      try {
        const abas = await (await fetch(`http://127.0.0.1:${PORTA_DEPURACAO}/json`)).json();
        alvo = abas.find((aba) => aba.type === 'page');
      } catch {
        // Chrome ainda abrindo.
      }
    }
    if (!alvo) throw new Error('O Chrome não abriu a porta de depuração.');

    const ws = new WebSocket(alvo.webSocketDebuggerUrl);
    await new Promise((resolver) => ws.addEventListener('open', resolver));
    let id = 0;
    const pendentes = new Map();
    const avisos = [];
    ws.addEventListener('message', (evento) => {
      const msg = JSON.parse(evento.data);
      if (pendentes.has(msg.id)) {
        pendentes.get(msg.id)(msg.result);
        pendentes.delete(msg.id);
      }
      if (msg.method === 'Runtime.consoleAPICalled' && ['error', 'warning'].includes(msg.params.type)) {
        // Encaixa os argumentos nos %s da mensagem, como o console do navegador faz.
        const [modelo, ...valores] = msg.params.args.map((a) => String(a.value ?? a.description));
        let texto = modelo ?? '';
        for (const valor of valores) texto = texto.replace(/%[sdo]/, valor);
        avisos.push(texto.split('\n')[0].slice(0, 300));
      }
    });
    const cdp = (metodo, parametros = {}) =>
      new Promise((resolver) => {
        const n = ++id;
        pendentes.set(n, resolver);
        ws.send(JSON.stringify({ id: n, method: metodo, params: parametros }));
      });

    await cdp('Runtime.enable');
    await cdp('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
    // Fora das boas-vindas, abre como se elas já tivessem sido vistas.
    const pularBoasVindas = rota.startsWith('/boas-vindas') ? '' : '&boas-vindas=vistas';
    await cdp('Page.navigate', { url: `${ENDERECO}${rota}?tema=${esquema}${pularBoasVindas}` });
    // Espera o título da tela ou a barra de abas aparecer: o primeiro carregamento depois de
    // subir o servidor compila o app e pode levar bem mais que alguns segundos.
    let pronta = false;
    for (let i = 0; i < 120 && !pronta; i++) {
      await espera(500);
      const r = await cdp('Runtime.evaluate', {
        expression: "!!document.querySelector('[role=heading],[role=tablist]')",
        returnByValue: true,
      });
      pronta = r?.result?.value === true;
    }
    if (!pronta) console.warn(`A tela ${rota} não terminou de carregar em 60 s (${esquema}).`);
    await espera(1500);

    const nomeBase = rota.replace(/^\//, '').replace(/\//g, '-') || 'inicio';
    const fotografar = async (n) => {
      const r = await cdp('Page.captureScreenshot', { format: 'png' });
      const arquivo = join(pasta, `${nomeBase}-${esquema}-${n}.png`);
      writeFileSync(arquivo, Buffer.from(r.data, 'base64'));
      console.log(arquivo);
    };
    const tocar = (texto) =>
      cdp('Runtime.evaluate', {
        expression: `(() => {
          const el = [...document.querySelectorAll('[role=button],[role=radio],[role=link]')]
            .find((e) => e.textContent.trim() === ${JSON.stringify(texto)});
          if (el) { el.click(); return true; }
          return false;
        })()`,
        returnByValue: true,
      });

    await fotografar(1);
    for (const [i, texto] of toques.entries()) {
      const r = await tocar(texto);
      if (!r?.result?.value) console.warn(`Botão "${texto}" não encontrado.`);
      await espera(1500);
      await fotografar(i + 2);
    }

    if (avisos.length > 0) {
      console.warn(`\nAvisos no console (${esquema}):`);
      for (const aviso of avisos) console.warn(`- ${aviso}`);
    }
    ws.close();
  } finally {
    chrome.kill();
    await espera(500);
    rmSync(perfil, { recursive: true, force: true });
  }
}

await capturarTema('claro');
await capturarTema('escuro');
