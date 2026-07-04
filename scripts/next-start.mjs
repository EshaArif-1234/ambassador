/**
 * Hostinger production start — must bind 0.0.0.0 and process.env.PORT.
 * Without this, deploy shows "running" but the site returns 503.
 */
import { spawnSync } from 'node:child_process';

const port = String(process.env.PORT || '3000');
const env = {
  ...process.env,
  NODE_ENV: 'production',
  HOSTNAME: '0.0.0.0',
};

console.log(`[start] Next.js → http://0.0.0.0:${port}`);

const result = spawnSync('next', ['start', '-H', '0.0.0.0', '-p', port], {
  stdio: 'inherit',
  env,
  shell: process.platform === 'win32',
});

process.exit(result.status ?? 1);
