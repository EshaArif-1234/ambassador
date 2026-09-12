/** Structured blocks parsed from admin “content” text (see AdminBlogModal help). */

export type BlogHeading = {
  level: 2 | 3;
  text: string;
  id: string;
};

export type BlogContentBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'heading'; level: 2 | 3; text: string; id: string }
  | { type: 'list'; items: string[] }
  | { type: 'callout'; variant: 'tip' | 'note'; text: string };

export function slugifyBlogHeading(text: string): string {
  const base = text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
  return base.slice(0, 80) || 'section';
}

export function estimateReadMinutes(content: string): number {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

function parseListBlock(block: string): string[] | null {
  const lines = block.split('\n').map((l) => l.trim()).filter(Boolean);
  if (!lines.length || !lines.every((l) => /^[-*•]\s+/.test(l))) return null;
  return lines.map((l) => l.replace(/^[-*•]\s+/, '').trim());
}

export function parseBlogContent(content: string): BlogContentBlock[] {
  const chunks = content
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  const blocks: BlogContentBlock[] = [];
  const usedIds = new Map<string, number>();

  const uniqueId = (text: string) => {
    const base = slugifyBlogHeading(text);
    const count = usedIds.get(base) ?? 0;
    usedIds.set(base, count + 1);
    return count === 0 ? base : `${base}-${count + 1}`;
  };

  for (const chunk of chunks) {
    if (chunk.startsWith('### ')) {
      const text = chunk.slice(4).split('\n')[0].trim();
      blocks.push({ type: 'heading', level: 3, text, id: uniqueId(text) });
      continue;
    }
    if (chunk.startsWith('## ')) {
      const text = chunk.slice(3).split('\n')[0].trim();
      blocks.push({ type: 'heading', level: 2, text, id: uniqueId(text) });
      continue;
    }
    if (chunk.startsWith('> ')) {
      const body = chunk
        .split('\n')
        .map((l) => l.replace(/^>\s?/, '').trim())
        .join(' ')
        .trim();
      const variant = body.toLowerCase().startsWith('note:') ? 'note' : 'tip';
      blocks.push({ type: 'callout', variant, text: body });
      continue;
    }

    const listItems = parseListBlock(chunk);
    if (listItems?.length) {
      blocks.push({ type: 'list', items: listItems });
      continue;
    }

    blocks.push({ type: 'paragraph', text: chunk.replace(/\n/g, ' ') });
  }

  return blocks;
}

export function extractBlogHeadings(blocks: BlogContentBlock[]): BlogHeading[] {
  return blocks
    .filter((b): b is BlogContentBlock & { type: 'heading' } => b.type === 'heading')
    .map((b) => ({ level: b.level, text: b.text, id: b.id }));
}
