import { readFile, access } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
const root = resolve(import.meta.dirname, '..');
for (const path of ['index.html', 'css/styles.css', 'assets/qtec-logo.png', 'js/config.js', 'js/drive.js', 'js/recordings.js', 'js/app.js', 'js/demo.js', 'README.md', '.nojekyll']) await access(resolve(root, path));
for (const name of ['config', 'drive', 'recordings', 'app', 'demo']) execFileSync(process.execPath, ['--check', resolve(root, `js/${name}.js`)]);
const html = await readFile(resolve(root, 'index.html'), 'utf8');
for (const match of html.matchAll(/(?:src|href)="(\.\/[^"#]+)"/g)) await access(resolve(root, match[1]));
console.log('Verificación correcta: sintaxis y archivos estáticos. No se requiere compilación para GitHub Pages.');
