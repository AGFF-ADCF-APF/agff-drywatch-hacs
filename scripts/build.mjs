// Baut den JS-Kern zweimal:
//   custom_components/drywatch/frontend/drywatch-card.js  (Card für Home Assistant, im Repo eingecheckt, weil HACS das Repo lädt)
//   grav/assets/agff-drywatch.js                            (Bedienoberfläche für das Grav-Plugin)
// und legt dist/agff-drywatch/ an; scripts/build.sh packt daraus dist/grav-plugin-agff-drywatch-<version>.zip.
import { build } from 'esbuild';
import { readFileSync, mkdirSync, rmSync, cpSync, existsSync } from 'node:fs';

const paket = JSON.parse(readFileSync('package.json', 'utf8'));
const banner = `/* AGFF DryWatch ${paket.version} · EUPL-1.2 · https://github.com/AGFF-ADCF-APF/agff-drywatch-hacs */`;
const gemeinsam = {
    bundle: true,
    format: 'esm',
    target: 'es2020',
    minify: true,
    legalComments: 'none',
    banner: { js: banner },
    loader: { '.md': 'text', '.csv': 'text' },
    logLevel: 'info'
};

await build({ ...gemeinsam, entryPoints: ['src/card/drywatch-card.js'], outfile: 'custom_components/drywatch/frontend/drywatch-card.js' });
await build({ ...gemeinsam, entryPoints: ['src/grav/eintrag.js'], outfile: 'grav/assets/agff-drywatch.js' });

// Grav-Plugin: Ordner agff-drywatch/ im ZIP (so erwartet es Grav bei der Installation von Hand und mit bin/gpm direct-install)
const ziel = 'dist/agff-drywatch';
rmSync('dist', { recursive: true, force: true });
mkdirSync(ziel, { recursive: true });
cpSync('grav', ziel, { recursive: true });
cpSync('LICENSE', `${ziel}/LICENSE`);
if (existsSync('grav/README.md')) cpSync('grav/README.md', `${ziel}/README.md`);
