import type { Metadata } from 'next';
import LegalDocumentPage from '@/components/legal/LegalDocumentPage';
import { privacyPolicyDocument } from '@/content/legal/privacy-policy';

export const metadata: Metadata = {
  title: 'Privacy Policy | Ambassador Commercial Kitchen Equipment',
  description:
    'Read how Ambassador Commercial Kitchen Equipment collects, uses, and protects your personal information on www.ambassador.pk.',
};

export default function PrivacyPolicyPage() {
  return <LegalDocumentPage document={privacyPolicyDocument} />;
}
