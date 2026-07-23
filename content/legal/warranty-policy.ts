import type { LegalDocument } from '@/content/legal/types';

export const warrantyPolicyDocument: LegalDocument = {
  slug: 'warranty-policy',
  title: 'Warranty Policy',
  subtitle: 'Warranty coverage, claims process, and exclusions for Ambassador commercial kitchen equipment.',
  effectiveDate: '22 July 2026',
  lastUpdated: '22 July 2026',
  intro: [
    'Ambassador Commercial Kitchen Equipment (“Ambassador,” “we,” “us,” or “the Company”) is committed to providing reliable, high-quality commercial kitchen equipment backed by dependable after-sales support. This Warranty Policy sets out the terms and conditions under which Ambassador provides warranty coverage on locally manufactured and imported equipment, the claims process, and the exclusions that apply.',
  ],
  sections: [
    {
      id: 'effective-date',
      title: '1. Warranty Effective Date',
      paragraphs: [
        'This warranty becomes effective from the date of delivery of the equipment to the customer. The delivery date, as recorded on the invoice or delivery note, shall be treated as the official start date of the warranty period for all purposes under this Policy.',
      ],
    },
    {
      id: 'manufactured-equipment',
      title: '2. Manufactured by Ambassador Commercial Kitchen Equipment',
      paragraphs: [
        'The Company provides a one (1) year Parts warranty on all equipment manufactured by Ambassador Commercial Kitchen Equipment in Pakistan. During this period:',
      ],
      bullets: [
        'Any manufacturing defect will be repaired, or the affected part replaced, free of cost;',
        'Travel and site-visit charges for warranty service calls will be borne by the customer;',
        'Parts replaced under warranty are covered only for the remainder of the original warranty period, and do not carry a fresh one-year term of their own.',
      ],
      closingParagraphs: [
        'This warranty does not cover damage caused by misuse, negligence, unauthorised repairs, or modifications carried out by third-party technicians. Any such action will render the warranty void with immediate effect.',
      ],
    },
    {
      id: 'imported-equipment',
      title: '3. Imported Equipment',
      paragraphs: [
        'Warranty coverage on imported equipment differs depending on the country of origin, as set out below.',
      ],
      bullets: [
        'China-imported products: a three (3) day checking warranty applies from the date of delivery. Customers must inspect and test the equipment within this period and report any issue in writing. After the 3-day checking period has elapsed, no warranty or guarantee shall apply.',
        'Italy, Germany, USA, and other international brands: warranty coverage, where applicable, is provided strictly in accordance with the original manufacturer\'s warranty policy. As an authorised dealer/distributor, Ambassador Commercial Kitchen Equipment will pass on the manufacturer\'s warranty only to the extent that such coverage is officially provided to us by the manufacturer. If no manufacturer warranty is available or provided to Ambassador, no warranty can be extended by Ambassador Commercial Kitchen Equipment on that equipment.',
      ],
    },
    {
      id: 'claim-process',
      title: '4. Warranty Claim Process',
      paragraphs: ['To claim warranty service, customers must provide:'],
      bullets: [
        'Valid proof of purchase (invoice, receipt, or delivery note); and',
        'A brief written description of the issue or defect.',
      ],
      closingParagraphs: [
        'Service requests may be made via phone or email during our normal business hours. Upon receipt of a claim, the Company will inspect the equipment and determine, at its discretion, whether the reported issue qualifies as a manufacturing defect covered under this Policy.',
      ],
    },
    {
      id: 'exclusions',
      title: '5. Exclusions',
      paragraphs: ['This Warranty Policy does not cover:'],
      bullets: [
        'Damage caused by misuse, negligence, accident, or improper operation;',
        'Unauthorized repairs, servicing, or modifications carried out by third-party technicians not approved by Ambassador;',
        'Normal wear and tear, consumable parts, or cosmetic damage that does not affect equipment performance;',
        'Damage arising from improper electrical, gas, or water supply, or from failure to follow the manufacturer\'s or Company\'s operating instructions;',
        'Imported equipment beyond the applicable checking period or outside the coverage of the original manufacturer\'s warranty, as described in Section 3.',
      ],
    },
    {
      id: 'company-rights',
      title: '6. Company\'s Rights',
      paragraphs: [
        'Ambassador Commercial Kitchen Equipment reserves the right to inspect, repair, replace, or reject any warranty claim that does not comply with the terms and conditions set out in this Policy. Any exception to this Policy must be confirmed in writing by the Company to be valid; verbal assurances or representations shall not override the written terms of this Warranty Policy.',
      ],
    },
    {
      id: 'acknowledgement',
      title: '7. Acknowledgement',
      paragraphs: [
        'This warranty reflects Ambassador\'s commitment to quality and reliable after-sales support. By purchasing our equipment, the customer acknowledges and accepts the terms stated in this Warranty Policy.',
      ],
    },
  ],
  contactTitle: '8. Contact for Warranty Service',
  contactItems: [
    'Ambassador Commercial Kitchen Equipment, 5-A Fazal Elahi Road, Rehman Pura, Link Ferozpur Road, Lahore, Pakistan',
    'Email: aftersale@ambassador.pk',
    'Phone: 0333-1166925 | UAN: 042-111-313-106',
    'Complaint / support portal: complaint.ambassador.pk',
  ],
  relatedLink: { label: 'Terms of Service', href: '/terms-of-service' },
};
