import Link from 'next/link';
import type { LegalDocument } from '@/content/legal/types';
import { COMPLAINT_PORTAL_URL } from '@/lib/siteLinks';

type LegalDocumentPageProps = {
  document: LegalDocument;
};

function renderParagraphs(paragraphs: string[] | undefined) {
  if (!paragraphs?.length) return null;
  return paragraphs.map((text) => (
    <p key={text.slice(0, 48)} className="text-sm leading-relaxed text-gray-700 sm:text-base">
      {text}
    </p>
  ));
}

function renderBullets(bullets: string[] | undefined) {
  if (!bullets?.length) return null;
  return (
    <ul className="mt-3 space-y-2 pl-5 text-sm leading-relaxed text-gray-700 marker:text-[#E36630] sm:text-base">
      {bullets.map((item) => (
        <li key={item.slice(0, 48)} className="list-disc">
          {item}
        </li>
      ))}
    </ul>
  );
}

function renderContactLine(line: string) {
  if (line.includes('complaint.ambassador.pk')) {
    return (
      <a
        href={COMPLAINT_PORTAL_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="text-[#0F4C69] underline decoration-[#0F4C69]/30 underline-offset-2 hover:text-[#E36630]"
      >
        {line}
      </a>
    );
  }
  if (line.includes('info@ambassador.pk')) {
    return (
      <a href="mailto:info@ambassador.pk" className="text-[#0F4C69] hover:text-[#E36630]">
        {line}
      </a>
    );
  }
  if (line.includes('0333-1166925')) {
    return (
      <>
        Phone:{' '}
        <a href="tel:+923331166925" className="text-[#0F4C69] hover:text-[#E36630]">
          0333-1166925
        </a>
        {' | UAN: '}
        <a href="tel:042111313106" className="text-[#0F4C69] hover:text-[#E36630]">
          042-111-313-106
        </a>
      </>
    );
  }
  return line;
}

export default function LegalDocumentPage({ document }: LegalDocumentPageProps) {
  return (
    <div className="min-h-screen bg-[#F4F6F8]">
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0F4C69] via-[#0B3D52] to-[#06131A] text-white">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute -right-20 top-0 h-64 w-64 rounded-full bg-[#E36630] blur-3xl" />
          <div className="absolute bottom-0 left-0 h-48 w-48 rounded-full bg-white blur-3xl" />
        </div>
        <div className="container relative mx-auto px-4 py-12 sm:py-16 md:py-20">
          <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm text-white/70">
            <Link href="/" className="transition-colors hover:text-white">
              Home
            </Link>
            <span aria-hidden>/</span>
            <span className="text-white">{document.title}</span>
          </nav>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#E36630] sm:text-sm">
            Ambassador Commercial Kitchen Equipment
          </p>
          <h1 className="mt-3 max-w-4xl text-3xl font-bold leading-tight sm:text-4xl md:text-5xl">
            {document.title}
          </h1>
          <p className="mt-2 text-sm text-white/80 sm:text-base">www.ambassador.pk</p>
          <div className="mt-6 inline-flex flex-wrap gap-x-6 gap-y-2 rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-white/90 backdrop-blur-sm">
            <span>
              <span className="text-white/60">Effective Date:</span> {document.effectiveDate}
            </span>
            <span>
              <span className="text-white/60">Last Updated:</span> {document.lastUpdated}
            </span>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-10 lg:py-14">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-10">
          <aside className="shrink-0 lg:sticky lg:top-32 lg:w-72">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <h2 className="text-sm font-bold uppercase tracking-wide text-[#0F4C69]">
                On this page
              </h2>
              <ul className="mt-4 max-h-[420px] space-y-2 overflow-y-auto pr-1 text-sm">
                {document.sections.map((section) => (
                  <li key={section.id}>
                    <a
                      href={`#${section.id}`}
                      className="block rounded-lg px-2 py-1.5 text-gray-700 transition-colors hover:bg-[#0F4C69]/5 hover:text-[#0F4C69]"
                    >
                      {section.title}
                    </a>
                  </li>
                ))}
                <li>
                  <a
                    href="#contact"
                    className="block rounded-lg px-2 py-1.5 text-gray-700 transition-colors hover:bg-[#0F4C69]/5 hover:text-[#0F4C69]"
                  >
                    {document.contactTitle}
                  </a>
                </li>
              </ul>
              {document.relatedLink ? (
                <div className="mt-5 border-t border-gray-100 pt-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    Related
                  </p>
                  <Link
                    href={document.relatedLink.href}
                    className="mt-2 inline-flex text-sm font-semibold text-[#E36630] hover:underline"
                  >
                    {document.relatedLink.label}
                  </Link>
                </div>
              ) : null}
            </div>
          </aside>

          <article className="min-w-0 flex-1 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8 lg:p-10">
            <div className="space-y-4 border-b border-gray-100 pb-8">
              {renderParagraphs(document.intro)}
            </div>

            <div className="divide-y divide-gray-100">
              {document.sections.map((section) => (
                <section key={section.id} id={section.id} className="scroll-mt-32 py-8 first:pt-8">
                  <h2 className="text-xl font-bold text-[#0F4C69] sm:text-2xl">{section.title}</h2>
                  <div className="mt-4 space-y-4">
                    {renderParagraphs(section.paragraphs)}
                    {renderBullets(section.bullets)}
                    {section.subsections?.map((sub) => (
                      <div key={sub.title ?? sub.paragraphs?.[0]?.slice(0, 32)} className="mt-4">
                        {sub.title ? (
                          <h3 className="text-base font-semibold text-gray-900 sm:text-lg">
                            {sub.title}
                          </h3>
                        ) : null}
                        <div className={sub.title ? 'mt-3 space-y-3' : 'space-y-3'}>
                          {renderParagraphs(sub.paragraphs)}
                          {renderBullets(sub.bullets)}
                        </div>
                      </div>
                    ))}
                    {renderParagraphs(section.closingParagraphs)}
                  </div>
                </section>
              ))}
            </div>

            <section
              id="contact"
              className="scroll-mt-32 mt-8 rounded-2xl bg-gradient-to-br from-[#0F4C69] to-[#0B3D52] p-6 text-white sm:p-8"
            >
              <h2 className="text-xl font-bold sm:text-2xl">{document.contactTitle}</h2>
              <ul className="mt-4 space-y-3 text-sm leading-relaxed text-white/90 sm:text-base">
                {document.contactItems.map((item) => (
                  <li key={item.slice(0, 40)} className="flex gap-2">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#E36630]" aria-hidden />
                    <span>{renderContactLine(item)}</span>
                  </li>
                ))}
              </ul>
            </section>

            {document.disclaimer ? (
              <p className="mt-8 rounded-xl border border-amber-200 bg-amber-50 px-4 py-4 text-xs leading-relaxed text-amber-900 sm:text-sm">
                {document.disclaimer}
              </p>
            ) : null}
          </article>
        </div>
      </div>
    </div>
  );
}
