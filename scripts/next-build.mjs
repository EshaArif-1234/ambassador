/**
 * Production build wrapper.
 * Hostinger (and some .env files) set NODE_ENV=development, which breaks `next build`
 * with: TypeError: Cannot read properties of null (reading 'useState')
 */
import { spawnSync } from 'node:child_process';

const env = { ...process.env };

if (env.NODE_ENV && env.NODE_ENV !== 'production') {
  console.warn(
    `[build] Ignoring NODE_ENV=${env.NODE_ENV} from the environment — Next.js requires production for builds.`
  );
}

env.NODE_ENV = 'production';

const result = spawnSync('next', ['build'], {
  stdio: 'inherit',
  env,
  shell: process.platform === 'win32',
});

process.exit(result.status ?? 1);
