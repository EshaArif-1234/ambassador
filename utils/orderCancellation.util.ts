/** Extract admin cancellation reason stored on the order record. */
export function getCancellationReason(order: {
  notes?: string;
  failedReason?: string;
}): string | null {
  const failed = order.failedReason?.trim();
  if (failed) return failed;

  const notes = order.notes?.trim();
  if (!notes) return null;

  const lines = notes.split('\n').map((l) => l.trim()).filter(Boolean);
  for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i];
    const prefixed = line.match(/^Cancelled:\s*(.+)$/i);
    if (prefixed) return prefixed[1].trim();
  }

  return notes;
}

export function fmtCancellationDate(d?: string) {
  if (!d) return '—';
  return new Date(d).toLocaleString('en-PK', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
