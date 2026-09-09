import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import connectDB from '@/backend/config/db';
import CareerJob from '@/backend/models/CareerJob.model';
import { toCareerJob } from '@/backend/lib/careerJobs';
import JobDetailPage from '@/client/pages/careers/JobDetailPage';
import { absoluteUrl, canonicalMetadata } from '@/lib/siteUrl';

export const dynamic = 'force-dynamic';

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  await connectDB();
  const { slug } = await params;
  const doc = await CareerJob.findOne({ slug: slug.trim().toLowerCase(), status: 'active' }).lean();
  if (!doc) return { title: 'Job Not Found' };

  const job = toCareerJob(doc as never);
  const path = `/careers/${job.slug}`;
  return {
    title: `${job.title} | Careers | Ambassador`,
    description: job.summary,
    ...canonicalMetadata(path),
    openGraph: {
      url: absoluteUrl(path),
      title: job.title,
      description: job.summary,
    },
  };
}

export default async function CareerJobPage({ params }: PageProps) {
  await connectDB();
  const { slug } = await params;
  const doc = await CareerJob.findOne({ slug: slug.trim().toLowerCase(), status: 'active' }).lean();
  if (!doc) notFound();

  return <JobDetailPage job={toCareerJob(doc as never)} />;
}
