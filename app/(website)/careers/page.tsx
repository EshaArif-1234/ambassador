import type { Metadata } from 'next';
import CareersPage from '@/client/pages/careers/CareersPage';
import { canonicalMetadata } from '@/lib/siteUrl';

export const metadata: Metadata = {
  title: 'Careers | Ambassador Commercial Kitchen Equipment',
  description:
    'Join Ambassador — explore careers in sales, service, operations, and more across our commercial kitchen equipment showrooms in Pakistan.',
  ...canonicalMetadata('/careers'),
};

export default function Careers() {
  return <CareersPage />;
}
