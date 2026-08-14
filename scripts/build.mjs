import { cp, mkdir, readFile, readdir, rm, stat, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const manifest = JSON.parse(await readFile(path.join(root, 'LEGAL_SITES.json'), 'utf8'));
const checkOnly = process.argv.includes('--check');
const syncLegacy = process.argv.includes('--sync-legacy');

async function assertDirectory(relativePath) {
  const details = await stat(path.join(root, relativePath));
  if (!details.isDirectory()) throw new Error(`${relativePath} must be a directory`);
}

function assertUnique(products, field) {
  const values = new Set();
  for (const product of products) {
    const value = product[field];
    if (values.has(value)) throw new Error(`Duplicate ${field}: ${value}`);
    values.add(value);
  }
}

async function legacyCheckout(repository) {
  const name = repository.split('/').at(-1);
  const candidates = [
    path.join(root, '.legacy-checkouts', name),
    path.join(root, '.legacy-checkouts', `${name}-public`),
    path.join(root, '..', name),
    path.join(root, '..', `${name}-public`),
  ];
  for (const candidate of candidates) {
    try {
      await stat(path.join(candidate, '.git'));
      const remote = execFileSync('git', ['remote', 'get-url', 'origin'], {
        cwd: candidate,
        encoding: 'utf8',
      }).trim();
      if (!remote.includes(repository)) {
        throw new Error(`${candidate} origin does not match ${repository}: ${remote}`);
      }
      return candidate;
    } catch (error) {
      if (error?.code !== 'ENOENT') throw error;
    }
  }
  throw new Error(`No local checkout found for ${repository}`);
}

async function syncLegacySites() {
  for (const product of manifest.products.filter((item) => item.legacyRepository)) {
    const checkout = await legacyCheckout(product.legacyRepository);
    const dirty = execFileSync('git', ['status', '--porcelain'], {
      cwd: checkout,
      encoding: 'utf8',
    }).trim();
    if (dirty) throw new Error(`Legacy checkout is not clean: ${checkout}`);
    const source = path.join(root, product.sourcePath);
    for (const entry of await readdir(source)) {
      await cp(path.join(source, entry), path.join(checkout, entry), {
        recursive: true,
        force: true,
      });
    }
    await writeFile(
      path.join(checkout, '.generated-from-legal-sites'),
      `Generated from YoungseokOh/legal-sites/${product.sourcePath}. Do not edit here.\n`,
      'utf8',
    );
    console.log(`Synced ${product.id} to ${product.legacyRepository}.`);
  }
}

if (manifest.schemaVersion !== 2) throw new Error('Unsupported LEGAL_SITES schema version.');
assertUnique(manifest.products, 'id');
assertUnique(manifest.products, 'sourcePath');
assertUnique(manifest.products, 'publicPath');

for (const product of manifest.products) {
  await assertDirectory(product.sourcePath);
  const index = await stat(path.join(root, product.sourcePath, 'index.html'));
  if (!index.isFile()) throw new Error(`${product.id} must provide index.html`);
  const indexText = await readFile(path.join(root, product.sourcePath, 'index.html'), 'utf8');
  if (/http-equiv=["']refresh["']/i.test(indexText)) {
    throw new Error(`${product.id} must publish policy content, not a client-side redirect.`);
  }
  for (const url of [...(product.legacyUrls ?? []), ...(product.registeredPolicyUrls ?? [])]) {
    if (new URL(url).protocol !== 'https:') throw new Error(`${product.id} has a non-HTTPS policy URL.`);
  }
}

if (syncLegacy) {
  await syncLegacySites();
  process.exit(0);
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
