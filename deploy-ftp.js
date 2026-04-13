import { config as loadEnv } from 'dotenv';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { readFileSync } from 'node:fs';
import ftpDeployLib from 'ftp-deploy';

// Load .env if present (optional)
loadEnv();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const ftpDeploy = new ftpDeployLib();

// Load config from deploy-ftp.config.json (NOT committed) or from env vars as fallback
const configPath = resolve(__dirname, 'deploy-ftp.config.json');

let cfg = {};
try {
  const raw = readFileSync(configPath, 'utf8');
  cfg = JSON.parse(raw);
} catch {
  // no local config file, rely on env vars
}

const user = cfg.user || process.env.FTP_USER;
const password = cfg.password || process.env.FTP_PASSWORD;
const host = cfg.host || process.env.FTP_HOST;
const port = cfg.port || Number(process.env.FTP_PORT || 21);
const remoteRoot = cfg.remoteRoot || process.env.FTP_REMOTE_ROOT || '/';

if (!user || !password || !host) {
  console.error('❌ Config FTP manquante. Renseigne deploy-ftp.config.json ou les variables FTP_USER / FTP_PASSWORD / FTP_HOST.');
  process.exit(1);
}

const distPath = resolve(__dirname, 'dist');

const config = {
  user,
  password,
  host,
  port,
  localRoot: distPath,
  remoteRoot,
  include: ['*', '**/*'],
  deleteRemote: false,
  forcePasv: true
};

(async () => {
  try {
    console.log('📦 Build du projet...');
    execSync('npm run build', { stdio: 'inherit' });

    console.log('🚀 Déploiement FTP vers', host, '...');
    await ftpDeploy.deploy(config);

    console.log('✅ Déploiement terminé avec succès.');
  } catch (err) {
    console.error('❌ Erreur de déploiement FTP:', err.message || err);
    process.exit(1);
  }
})();
