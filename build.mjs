import * as esbuild from 'esbuild';
import { readFile, writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';

const TEMPLATE = 'src/template.html';
const WORKER_SRC = 'src/worker.js';
const WORKER_DIST = 'dist/worker.js';

async function main() {
  const js = await esbuild.build({
    entryPoints: ['src/client.js'],
    bundle: true,
    minify: true,
    write: false,
    format: 'iife',
    target: 'es2020',
    globalName: 'MDReader',
  });

  const css = await readFile('src/styles.css', 'utf-8');
  let html = await readFile(TEMPLATE, 'utf-8');
  html = html.replace('__INLINE_CSS__', css.replace(/\n/g, ''));
  html = html.replace('__INLINE_JS__', js.outputFiles[0].text);

  let worker = await readFile(WORKER_SRC, 'utf-8');
  worker = worker.replace('__INLINED_HTML__', JSON.stringify(html));

  if (!existsSync('dist')) await mkdir('dist');
  await writeFile(WORKER_DIST, worker, 'utf-8');
  console.log('✓ dist/worker.js 构建完成');
}

main().catch((e) => { console.error(e); process.exit(1); });
