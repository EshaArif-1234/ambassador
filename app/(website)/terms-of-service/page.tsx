import type { Metadata } from 'next';
import LegalDocumentPage from '@/components/legal/LegalDocumentPage';
import { termsOfServiceDocument } from '@/content/legal/terms-of-service';

export const metadata: Metadata = {
  title: 'Terms and Conditions | Ambassador Commercial Kitchen Equipment',
  description:
    'Terms and conditions for using www.ambassador.pk, placing orders, and engaging Ambassador Commercial Kitchen Equipment services.',
};

export default function TermsOfServicePage() {
  return <LegalDocumentPage document={termsOfServiceDocument} />;
}
