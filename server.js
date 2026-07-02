/**
 * Hostinger production entry — Next.js does NOT read process.env.PORT by itself.
 * Must pass -p explicitly. Hostinger may inject PORT via env or npm args (-p $PORT).
 */
const { spawn } = require('child_process');

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

const port = getPort();
const nextBin = require.resolve('next/dist/bin/next');

console.log(`[server] env PORT=${process.env.PORT ?? 'unset'}`);
console.log(`[server] binding 0.0.0.0:${port}`);

const child = spawn(
  process.execPath,
  [nextBin, 'start', '-H', '0.0.0.0', '-p', port],
  { stdio: 'inherit', env: process.env }
);

child.on('exit', (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  process.exit(code ?? 1);
});
