import type { Metadata } from 'next';
import HomePage from '../client/pages/home/HomePage';
import { canonicalMetadata } from '@/lib/siteUrl';

export const metadata: Metadata = {
  title: 'Ambassador Kitchen Equipment | Commercial Kitchen Equipment Pakistan',
  description:
    'Premium commercial kitchen equipment in Pakistan — fryers, refrigeration, custom kitchens, and professional food service solutions since 1999.',
  ...canonicalMetadata('/'),
};

export default function Home() {
  return <HomePage />;
}
