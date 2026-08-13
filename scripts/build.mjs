import { cp, mkdir, readFile, rm, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const manifest = JSON.parse(await readFile(path.join(root, 'LEGAL_SITES.json'), 'utf8'));
const checkOnly = process.argv.includes('--check');

async function assertDirectory(relativePath) {
  const details = await stat(path.join(root, relativePath));
  if (!details.isDirectory()) throw new Error(`${relativePath} must be a directory`);
}

for (const product of manifest.products) {
  await assertDirectory(product.sourcePath);
  const index = await stat(path.join(root, product.sourcePath, 'index.html'));
  if (!index.isFile()) throw new Error(`${product.id} must provide index.html`);
}

if (checkOnly) {
  console.log(`Validated ${manifest.products.length} hosted products.`);
  process.exit(0);
}

const output = path.join(root, 'dist');
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
await cp(path.join(root, 'public'), output, { recursive: true });
for (const product of manifest.products) {
  await cp(path.join(root, product.sourcePath), path.join(output, product.id), { recursive: true });
}
console.log(`Built ${manifest.products.length} product sites in dist/.`);
