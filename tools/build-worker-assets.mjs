import { cp, mkdir, mkdtemp, rename, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const output = join(root, 'dist');
const scratch = join(root, '.wrangler');
const publicFiles = [
  '_headers',
  'app.js',
  'assets',
  'bottom-nav.css',
  'fixtures.mjs',
  'hover.css',
  'index.html',
  'manifest.webmanifest',
  'match-notifications.mjs',
  'notifications-ui.mjs',
  'player-statistics.mjs',
  'player-match-history.mjs',
  'player-playing-time.mjs',
  'fa-playing-time.mjs',
  'portal-language.mjs',
  'portal-data-sync.mjs',
  'published-data.json',
  'style.css',
  'sw.js',
];

await mkdir(scratch, { recursive: true });
const staging = await mkdtemp(join(scratch, 'assets-'));
try {
  await Promise.all(publicFiles.map(file =>
    cp(join(root, file), join(staging, file), { recursive: true })
  ));
  await rm(output, { recursive: true, force: true });
  await rename(staging, output);
} finally {
  await rm(staging, { recursive: true, force: true });
}
