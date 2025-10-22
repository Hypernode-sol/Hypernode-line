import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import metadata from '../package.json';

// Obter o caminho do diretório atual em ambientes ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const command = path.join(__dirname, '..', 'node_modules', '.bin', 'electron-windows-store.cmd');
const args = [
  '--input-directory',
  path.join(__dirname, '..', 'out', 'ElectronAPIDemos-win32-ia32'),
  '--output-directory',
  path.join(__dirname, '..', 'out', 'windows-store'),
  '--flatten',
  true,
  '--package-version',
  `${metadata.version}.0`,
  '--package-name',
  metadata.name,
  '--package-display-name',
  metadata.productName,
  '--assets',
  path.join(__dirname, '..', 'assets', 'tiles'),
  '--package-description',
  metadata.description
];

const windowsStore = spawn(command, args, { stdio: 'inherit' });

windowsStore.on('close', (code) => {
  process.exit(code);
});
