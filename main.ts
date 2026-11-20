import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-app.ts';

// VICE NIGHTS entry program: hands the cover maker in. It copies app/ and
// screenshots/ into the output directory and writes the dossier that
// buildDossier derives from them, so the scorer can verify the hand-in
// byte for byte. Node standard library only; no install, no network.
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
const here = dirname(fileURLToPath(import.meta.url));

// Start from a clean output directory so both grader runs write the
// same bytes even when the directory already exists.
rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });

for (const name of ['app', 'screenshots']) {
  const src = join(here, name);
  if (!existsSync(src)) throw new Error(`${name}/ is missing next to main.ts`);
  cpSync(src, join(outDir, name), { recursive: true });
}

const dossier = buildDossier(outDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
});
writeFileSync(join(outDir, 'dossier.json'), dossier);
