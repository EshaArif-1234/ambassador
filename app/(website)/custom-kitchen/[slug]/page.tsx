import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import CaseStudyDetailView from '@/client/pages/custom-kitchen/case-study-detailpage';
import { getCaseStudyBySlug, getCaseStudySlugs } from '@/client/data/customKitchenCases';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const study = getCaseStudyBySlug(slug);
  if (!study) {
    return { title: 'Case study' };
  }
  const title = `${study.cardTitle} | Custom kitchen`;
  const description = study.cardDescription;
  return {
    title,
    description,
    openGraph: { title, description },
  };
}

export function generateStaticParams() {
  return getCaseStudySlugs().map((slug) => ({ slug }));
}

export default async function CustomKitchenCaseStudyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const study = getCaseStudyBySlug(slug);
  if (!study) notFound();
  return <CaseStudyDetailView study={study} />;
}
