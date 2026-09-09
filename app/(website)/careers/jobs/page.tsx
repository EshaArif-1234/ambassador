import type { Metadata } from 'next';
import JobOpportunitiesPage from '@/client/pages/careers/JobOpportunitiesPage';
import { canonicalMetadata } from '@/lib/siteUrl';

export const metadata: Metadata = {
  title: 'Job Opportunities | Careers | Ambassador',
  description:
    'Browse current job openings at Ambassador — sales, service, showroom, warehouse, marketing, and finance roles in Pakistan.',
  ...canonicalMetadata('/careers/jobs'),
};

export default function CareerJobsPage() {
  return <JobOpportunitiesPage />;
}
