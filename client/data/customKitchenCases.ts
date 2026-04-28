/**
 * Custom Kitchen portfolio — single source for listing + detail.
 *
 * Shape is aligned with a future API resource, e.g.
 * `GET /api/case-studies`, `GET /api/case-studies/:slug`
 * (stable `id`, `slug`, `gallerySections[]`, `sortOrder`, `published`).
 */

export type GalleryKind = '2d' | '3d' | 'installed';

export interface CaseStudyGalleryImage {
  src: string;
  alt: string;
  caption?: string;
}

export interface CaseStudyGallerySection {
  /** Stable key for CMS / React lists */
  id: string;
  kind: GalleryKind;
  title: string;
  subtitle?: string;
  images: CaseStudyGalleryImage[];
}

export interface CustomKitchenCaseStudy {
  /** Stable UUID or numeric id from CMS — do not change once published */
  id: string;
  slug: string;
  /** Listing order (ascending). Defaults applied in getter if omitted */
  sortOrder: number;
  published?: boolean;

  cardTitle: string;
  cardDescription: string;
  cardImage: string;
  cardAlt: string;

  heroTitle: string;
  heroSubtitle: string;
  heroImage: string;

  clientName?: string;
  location?: string;
  sector?: string;
  completedYear?: string;

  /** Long-form narrative */
  overview: string;
  /** Bullet list — scope & deliverables */
  scope?: string[];

  challenge?: string;
  solution?: string;

  highlights: { value: string; label: string }[];

  /** Grouped: 2D drawings, 3D renders, as-built photos — each project owns its own assets */
  gallerySections: CaseStudyGallerySection[];
}

/** Example gallery split — replace `src` values with real project files when available */
function sectionsFromPool(
  pairs: [GalleryKind, string, string, CaseStudyGalleryImage[]][]
): CaseStudyGallerySection[] {
  const titles: Record<GalleryKind, { title: string; subtitle: string }> = {
    '2d': {
      title: '2D layout & working drawings',
      subtitle: 'Plans, elevations, and equipment schedules used for approval and fabrication.',
    },
    '3d': {
      title: '3D design visualization',
      subtitle: 'Spatial clarity for stakeholders before stainless and MEP go to site.',
    },
    installed: {
      title: 'Installed kitchen — as built',
      subtitle: 'Commissioned equipment, stainless, hoods, and ergonomics in daily service.',
    },
  };

  return pairs.map(([kind, idSuffix, id, images]) => ({
    id: `${id}-${idSuffix}`,
    kind,
    title: titles[kind].title,
    subtitle: titles[kind].subtitle,
    images,
  }));
}

const IMG = {
  a: '/Images/home/card1.jpg',
  b: '/Images/home/card2.webp',
  c: '/Images/home/card3.jpg',
  d: '/Images/home/ratio.jpg',
};

export const CUSTOM_KITCHEN_CASES: CustomKitchenCaseStudy[] = [
  {
    id: 'case-cheezious-001',
    slug: 'cheezious-restaurant',
    sortOrder: 10,
    published: true,
    cardTitle: 'Cheezious — Custom kitchen rollout',
    cardAlt: 'Cheezious restaurant kitchen installation by Ambassador',
    cardImage: IMG.b,
    cardDescription:
      'Fast-casual pizza & burgers: coordinated cookline, refrigerated prep, grill line, and exhaust sized for peak-hour throughput — from CAD approval to turnkey install.',
    heroTitle: 'Cheezious restaurant kitchen',
    heroSubtitle:
      'Branded fast-casual concept: optimised hot-line and prep zoning, grease-rated ventilation, cold chain beside the cookline, and a handover tuned for franchise consistency.',
    heroImage: IMG.b,
    clientName: 'Cheezious',
    location: 'Pakistan',
    sector: 'Fast-casual restaurant',
    completedYear: '2024',
    overview:
      'We partnered on the back-of-house for a high-volume casual dining brand where ticket time and repetitive layout across sites matter as much as equipment spec. Scope included cookline zoning (griddle, fryers, conveyor oven interface), fabricated stainless benches and risers, exhaust duty matched to branded equipment, and commissioning with kitchen leads before soft launch.',
    scope: [
      'Site survey & as-built verification in live trading window',
      '2D CAD layout + equipment schedule aligned with franchisor standards',
      '3D visualization for ops sign-off',
      'Custom stainless — counters, shelving, splashbacks',
      'Hood & duct fabrication; make-up air coordination',
      'Install, balance, snagging, and operator training',
    ],
    challenge:
      'Tight shell dimensions and existing MEP stubs that could not move without programme risk — plus the need to protect dine-in ambience with controlled noise and odour paths.',
    solution:
      'We re-sequenced the cookline in CAD, reduced horizontal duct runs where possible, specified inverter-friendly exhaust, and staged installs after hours so trading impact stayed minimal.',
    highlights: [
      { value: '500+', label: 'peak-hour covers (design basis)' },
      { value: '100%', label: 'Drawings signed before fab' },
      { value: 'Turnkey', label: 'Survey → install → commission' },
      { value: '✓', label: 'Handover & training completed' },
    ],
    gallerySections: sectionsFromPool([
      [
        '2d',
        'g2d',
        'cheezious',
        [
          {
            src: IMG.a,
            alt: 'Cheezious kitchen CAD floor plan',
            caption: 'Cookline / prep / dish geometry',
          },
          {
            src: IMG.d,
            alt: 'Service elevation schematic',
            caption: 'Bench & hood elevations',
          },
        ],
      ],
      [
        '3d',
        'g3d',
        'cheezious',
        [
          {
            src: IMG.b,
            alt: '3D render of kitchen layout',
            caption: 'Client review — spatial flow before fabrication',
          },
          {
            src: IMG.c,
            alt: 'Equipment placement visualization',
            caption: 'Stainless zones & refrigeration adjacency',
          },
        ],
      ],
      [
        'installed',
        'gfb',
        'cheezious',
        [
          {
            src: IMG.c,
            alt: 'Finished Cheezious cookline stainless',
            caption: 'Installed stainless & cookline ready for ops',
          },
          {
            src: IMG.a,
            alt: 'Exhaust hoods and line in service',
            caption: 'Hoods commissioned with design duty',
          },
          {
            src: IMG.d,
            alt: 'Back-of-house overview',
            caption: 'As-built — handover pack reference',
          },
        ],
      ],
    ]),
  },
  {
    id: 'case-ff-002',
    slug: 'fast-food-kitchen',
    sortOrder: 20,
    published: true,
    cardTitle: 'Fast food kitchen installation',
    cardAlt: 'Fast food commercial kitchen',
    cardImage: IMG.a,
    cardDescription:
      'High-throughput fast food: CAD layout, fabricated stainless benches and hoods, ventilation, commissioning, and handover.',
    heroTitle: 'Fast food kitchen installation',
    heroSubtitle:
      'Counters, grills, frying lines, extraction, cold storage — engineered for speed, hygiene, and brand consistency.',
    heroImage: IMG.a,
    clientName: 'QSR operator',
    location: 'Pakistan',
    sector: 'Quick-service restaurant',
    completedYear: '2023',
    overview:
      'Turnkey project for an operator pushing heavy daily volume. We surveyed the shell, optimised cookline vs. prep vs. plating flow, fabricated grease-rated hoods linked to efficient exhaust, and staged installation to limit downtime.',
    scope: [
      'Throughput-based cookline sizing',
      'Stainless fabrication to approved drawings',
      'Kitchen ventilation & filtration',
      'Cold storage integration',
      'Commissioning & snag closure',
    ],
    challenge: 'Peak-hour surge without expanding footprint.',
    solution:
      'Tighter zoning in CAD, elevation tweaks on hoods, and phased install windows so trading continued.',
    highlights: [
      { value: '950', label: 'sq ft fitted footprint' },
      { value: '18', label: 'major equipment nodes' },
      { value: '28', label: 'days phased install' },
      { value: '✓', label: 'Sign-off before weld & install' },
    ],
    gallerySections: sectionsFromPool([
      [
        '2d',
        'g2d',
        'ff',
        [
          { src: IMG.a, alt: 'CAD kitchen floor plan', caption: 'Layout & equipment blocks' },
          { src: IMG.d, alt: 'Elevation drawings', caption: 'Hood & counter elevations' },
        ],
      ],
      [
        '3d',
        'g3d',
        'ff',
        [
          { src: IMG.b, alt: '3D kitchen visualization', caption: 'Stakeholder review model' },
        ],
      ],
      [
        'installed',
        'gfb',
        'ff',
        [
          { src: IMG.a, alt: 'Installed cookline', caption: 'Line in operation' },
          { src: IMG.c, alt: 'Stainless benches', caption: 'Fabrication as drawn' },
        ],
      ],
    ]),
  },
  {
    id: 'case-rest-003',
    slug: 'restaurant-kitchen',
    sortOrder: 30,
    published: true,
    cardTitle: 'Full-service restaurant kitchen',
    cardAlt: 'Fine dining restaurant kitchen',
    cardImage: IMG.b,
    cardDescription:
      'À la carte and banquet peaks: refrigerated prep, hot line, pastry & dish — AutoCAD plus 3D sign-off.',
    heroTitle: 'Restaurant kitchen setup',
    heroSubtitle:
      'Separate hot, cold & pastry zoning, expo alignment, grease management, controlled exhaust.',
    heroImage: IMG.b,
    clientName: 'Independent restaurant group',
    location: 'Pakistan',
    sector: 'Full-service dining',
    completedYear: '2023',
    overview:
      'Designed for dual lunch and dinner service plus weekend banquets. Raw intake, mise en place, and plate-up stay distinct; exhaust matches sauté and wok bursts; dish return isolated from ingress.',
    scope: ['Zoned BOH layout', 'Refrigeration & hot equipment matrix', 'Dish & pot wash alignment', 'Chef walkthrough before civils lock'],
    challenge: 'Dining room adjacency — noise and odour control.',
    solution: 'Acoustic attenuation on duct paths, makeup air balancing, and sealed cold prep rooms.',
    highlights: [
      { value: '1,050', label: 'sq ft back-of-house' },
      { value: '9', label: 'zones in one flow' },
      { value: '35', label: 'days fab + assembly' },
      { value: '✓', label: 'Chef sign-off before tile' },
    ],
    gallerySections: sectionsFromPool([
      [
        '2d',
        'g2d',
        'rest',
        [
          { src: IMG.b, alt: 'Restaurant CAD plan', caption: 'BOH zoning' },
          { src: IMG.d, alt: 'Workflow diagram', caption: 'Service alignment' },
        ],
      ],
      [
        '3d',
        'g3d',
        'rest',
        [
          { src: IMG.c, alt: '3D BOH render', caption: 'Design review' },
          { src: IMG.a, alt: 'Alternate angle', caption: 'Pass & expo' },
        ],
      ],
      [
        'installed',
        'gfb',
        'rest',
        [
          { src: IMG.b, alt: 'Finished hot line', caption: 'As built' },
          { src: IMG.c, alt: 'Prep & cold', caption: 'Cold chain in place' },
        ],
      ],
    ]),
  },
  {
    id: 'case-ind-004',
    slug: 'industrial-kitchen',
    sortOrder: 40,
    published: true,
    cardTitle: 'Industrial / central kitchen',
    cardAlt: 'Industrial production kitchen',
    cardImage: IMG.c,
    cardDescription:
      'Central prep, combi lines, blast chill, QA stations — hygienic stainless and auditor-ready handover.',
    heroTitle: 'Industrial kitchen solutions',
    heroSubtitle:
      'Hygienic drains, HACCP-friendly separation, equipment sized for batch uplift — documented for compliance.',
    heroImage: IMG.c,
    clientName: 'Food production facility',
    location: 'Pakistan',
    sector: 'Industrial / institutional',
    completedYear: '2022',
    overview:
      'High-volume production: hygienic partitioning, cold-chain integrity, segregated flows, labelled risers per line, then fabrication locked to BIM/CAD. Installation on swing shifts with site leads.',
    scope: ['HACCP zoning', 'Blast chill & hot hold', 'Stainless to export finish', 'Compliance documentation pack'],
    challenge: 'Auditor expectations vs. legacy slab and drains.',
    solution: 'Trench and floor finish upgrades sequenced with equipment sets; traceable install log.',
    highlights: [
      { value: '2,600', label: 'sq ft production' },
      { value: '40+', label: 'equipment tie-ins' },
      { value: '45', label: 'calendar days turnkey' },
      { value: '✓', label: 'Compliance pack at handover' },
    ],
    gallerySections: sectionsFromPool([
      [
        '2d',
        'g2d',
        'ind',
        [
          { src: IMG.c, alt: 'Industrial layout CAD', caption: 'Line layout' },
          { src: IMG.d, alt: 'Drainage & zones', caption: 'Hygienic zoning' },
        ],
      ],
      [
        '3d',
        'g3d',
        'ind',
        [{ src: IMG.a, alt: '3D production hall', caption: 'Volume & height study' }],
      ],
      [
        'installed',
        'gfb',
        'ind',
        [
          { src: IMG.c, alt: 'Installed production line', caption: 'Commissioned' },
          { src: IMG.b, alt: 'Stainless runs', caption: 'As built' },
        ],
      ],
    ]),
  },
];

export function getPublishedCaseStudies(): CustomKitchenCaseStudy[] {
  return CUSTOM_KITCHEN_CASES.filter((c) => c.published !== false).sort(
    (a, b) => a.sortOrder - b.sortOrder
  );
}

export function getCaseStudyBySlug(slug: string): CustomKitchenCaseStudy | undefined {
  return CUSTOM_KITCHEN_CASES.find((c) => c.slug === slug && c.published !== false);
}

export function getCaseStudySlugs(): string[] {
  return getPublishedCaseStudies().map((c) => c.slug);
}
