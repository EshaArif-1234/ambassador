import type { Metadata } from 'next';
import LegalDocumentPage from '@/components/legal/LegalDocumentPage';
import { warrantyPolicyDocument } from '@/content/legal/warranty-policy';

export const metadata: Metadata = {
  title: 'Warranty Policy | Ambassador Kitchen Equipment',
  description:
    'Warranty coverage, claim process, and exclusions for Ambassador commercial kitchen equipment in Pakistan.',
};

export default function WarrantyPolicyPage() {
  return <LegalDocumentPage document={warrantyPolicyDocument} />;
}
