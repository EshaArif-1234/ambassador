/**
 * Production start wrapper (used by npm start).
 * Next.js ignores process.env.PORT unless -p is passed explicitly.
 */
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

function getPort() {
  const flagIndex = process.argv.indexOf('-p');
  if (flagIndex !== -1 && process.argv[flagIndex + 1]) {
    return String(process.argv[flagIndex + 1]);
  }
  if (process.env.PORT) {
    return String(process.env.PORT);
  }
  return '3000';
}

let nextBin;
try {
  nextBin = require.resolve('next/dist/bin/next');
} catch {
  console.error('[start] next is not installed — run npm install && npm run build first.');
  process.exit(1);
}

const port = getPort();
const env = {
  ...process.env,
  NODE_ENV: 'production',
  HOSTNAME: '0.0.0.0',
};

console.log(`[start] env PORT=${process.env.PORT ?? 'unset'}`);
console.log(`[start] binding 0.0.0.0:${port}`);

const child = spawn(process.execPath, [nextBin, 'start', '-H', '0.0.0.0', '-p', port], {
  stdio: 'inherit',
  env,
});

child.on('exit', (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  process.exit(code ?? 1);
});
