import { readFileSync, writeFileSync, copyFileSync, unlinkSync } from 'fs';
import { execSync } from 'child_process';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const manifestPath = resolve(__dirname, '../public/manifest.json');
const backupPath = resolve(__dirname, '../public/manifest._personal_backup.json');

const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));

manifest.oauth2.scopes = manifest.oauth2.scopes.map(s =>
  s === 'https://www.googleapis.com/auth/gmail.readonly'
    ? 'https://www.googleapis.com/auth/gmail.metadata'
    : s
);

copyFileSync(manifestPath, backupPath);
writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

console.log('Building store edition (gmail.metadata scope)...');

try {
  execSync('pnpm exec vite build --outDir dist-store', {
    stdio: 'inherit',
    env: { ...process.env, VITE_EDITION: 'store' }
  });
  console.log('\nStore build complete → dist-store/');
} finally {
  copyFileSync(backupPath, manifestPath);
  unlinkSync(backupPath);
  console.log('Manifest restored.');
}
