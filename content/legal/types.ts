export type LegalSubsection = {
  title?: string;
  paragraphs?: string[];
  bullets?: string[];
};

export type LegalSection = {
  id: string;
  title: string;
  paragraphs?: string[];
  bullets?: string[];
  subsections?: LegalSubsection[];
  closingParagraphs?: string[];
};

export type LegalDocument = {
  slug: 'privacy-policy' | 'terms-of-service';
  title: string;
  subtitle: string;
  effectiveDate: string;
  lastUpdated: string;
  intro: string[];
  sections: LegalSection[];
  contactTitle: string;
  contactItems: string[];
  disclaimer?: string;
  relatedLink?: { label: string; href: string };
};
