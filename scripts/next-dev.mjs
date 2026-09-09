/**
 * Dev server wrapper — uses .next-dev when the default .next cache is corrupted or locked.
 */
import { spawnSync } from 'node:child_process';

const env = { ...process.env, NEXT_DIST_DIR: '.next-dev' };

const result = spawnSync('next', ['dev', ...process.argv.slice(2)], {
  stdio: 'inherit',
  env,
  shell: process.platform === 'win32',
});

process.exit(result.status ?? 1);
