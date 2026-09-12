'use client';

import type { BlogContentBlock } from '@/lib/blogContent';

type BlogArticleBodyProps = {
  blocks: BlogContentBlock[];
};

export default function BlogArticleBody({ blocks }: BlogArticleBodyProps) {
  return (
    <div className="space-y-6">
      {blocks.map((block, index) => {
        if (block.type === 'heading') {
          const Tag = block.level === 2 ? 'h2' : 'h3';
          return (
            <Tag
              key={`${block.id}-${index}`}
              id={block.id}
              className={
                block.level === 2
                  ? 'scroll-mt-28 pt-4 text-xl font-bold text-[#0F4C69] md:text-2xl'
                  : 'scroll-mt-28 pt-2 text-lg font-semibold text-gray-900 md:text-xl'
              }
            >
              {block.text}
            </Tag>
          );
        }

        if (block.type === 'list') {
          return (
            <ul
              key={`list-${index}`}
              className="space-y-2 pl-5 text-sm leading-relaxed text-gray-700 marker:text-[#E36630] md:text-base"
            >
              {block.items.map((item) => (
                <li key={item.slice(0, 40)} className="list-disc">
                  {item}
                </li>
              ))}
            </ul>
          );
        }

        if (block.type === 'callout') {
          const isNote = block.variant === 'note';
          return (
            <div
              key={`callout-${index}`}
              className={`rounded-xl border-l-4 px-4 py-3 md:px-5 md:py-4 ${
                isNote
                  ? 'border-[#0F4C69] bg-[#0F4C69]/5 text-[#0F4C69]'
                  : 'border-[#E36630] bg-[#E36630]/5 text-gray-800'
              }`}
            >
              <p className="text-sm leading-relaxed md:text-base">{block.text}</p>
            </div>
          );
        }

        return (
          <p key={`p-${index}`} className="text-sm leading-relaxed text-gray-700 md:text-base md:leading-8">
            {block.text}
          </p>
        );
      })}
    </div>
  );
}
