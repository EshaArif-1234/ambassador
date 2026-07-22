import type { LegalDocument } from '@/content/legal/types';

export const privacyPolicyDocument: LegalDocument = {
  slug: 'privacy-policy',
  title: 'Privacy Policy',
  subtitle: 'How Ambassador Commercial Kitchen Equipment collects, uses, and protects your information.',
  effectiveDate: '22 July 2026',
  lastUpdated: '22 July 2026',
  intro: [
    'Ambassador Commercial Kitchen Equipment (“Ambassador,” “we,” “us,” or “our”) operates the website www.ambassador.pk and related services, including our online product catalogue, customer accounts, custom kitchen consultation requests, order and quote system, and our complaint portal at complaint.ambassador.pk (collectively, the “Services”). This Privacy Policy explains what personal information we collect from visitors, customers, and business clients, how we use and protect it, who we share it with, and the choices and rights available to you.',
    'Ambassador is a Lahore-based supplier and manufacturer of commercial kitchen equipment serving restaurants, hotels, institutions, and food-service businesses across Pakistan. By visiting our website, creating an account, placing an order, requesting a quote, subscribing to our newsletter, or otherwise using our Services, you agree to the collection and use of information as described in this Privacy Policy. If you do not agree with this Policy, please do not use our Services.',
  ],
  sections: [
    {
      id: 'information-we-collect',
      title: '1. Information We Collect',
      subsections: [
        {
          title: '1.1 Information You Provide to Us',
          paragraphs: [
            'We collect information that you voluntarily provide when you interact with our Services, including:',
          ],
          bullets: [
            'Account details: full name, company/business name, email address, phone number, delivery address, city, and password when you register for a free account or B2B/bulk-pricing access;',
            'Order and quotation information: products or product categories of interest, order quantities, billing and shipping addresses, and any special requirements for custom kitchen design, fabrication, or installation projects;',
            'Payment-related information: billing details and payment confirmation data necessary to process orders (Ambassador does not store full card numbers; payments are processed through our banking partners or payment gateway providers);',
            'Communications: information you provide when you contact us by phone, email, our WhatsApp business chat, contact forms, or the complaint/support portal, including the content of your messages and attachments;',
            'Site-visit and consultation data: measurements, layout preferences, and site photographs shared with our design team when arranging a custom kitchen consultation;',
            'Newsletter subscription: your email address if you opt in to receive product updates and promotional communications.',
          ],
        },
        {
          title: '1.2 Information Collected Automatically',
          paragraphs: [
            'When you browse www.ambassador.pk, we and our service providers may automatically collect:',
          ],
          bullets: [
            'Device and log information such as IP address, browser type, operating system, referring URLs, and pages viewed;',
            'Usage data such as products viewed, time spent on pages, and interactions with the “On Sale” and product-catalogue features;',
            'Cookies and similar tracking technologies, described further in Section 4 below.',
          ],
        },
        {
          title: '1.3 Information from Third Parties',
          paragraphs: [
            'We may receive limited information from third-party platforms you use to interact with us, such as your WhatsApp profile name and number when you message us via WhatsApp, or public profile information if you contact us through Facebook, Instagram, LinkedIn, or YouTube.',
          ],
        },
      ],
    },
    {
      id: 'how-we-use',
      title: '2. How We Use Your Information',
      paragraphs: ['We use the information we collect for the following purposes:'],
      bullets: [
        'To create and administer your Ambassador account and provide B2B pricing, bulk-order management, and order-tracking features;',
        'To process and fulfil orders, quotations, and custom kitchen design and installation projects, including site surveys, 2D/3D design approval, fabrication, delivery, and after-sales support;',
        'To communicate with you about your orders, enquiries, complaints/support tickets, and account activity;',
        'To provide nationwide delivery and coordinate installation and warranty service across our branches;',
        'To send you the newsletter and promotional offers, where you have opted in, and to allow you to opt out at any time;',
        'To improve our website, products, and customer experience, including analysing usage trends;',
        'To detect, investigate, and prevent fraud, abuse, or security incidents;',
        'To comply with applicable Pakistani laws, tax and accounting obligations, and to respond to lawful requests from public authorities.',
      ],
    },
    {
      id: 'legal-basis',
      title: '3. Legal Basis for Processing',
      paragraphs: [
        'We process your personal information on the basis of: (a) your consent, such as when you subscribe to our newsletter or register an account; (b) the necessity of processing to perform a contract with you, such as fulfilling an order or a custom kitchen project; (c) our legitimate business interests in operating and improving the Services, provided these interests do not override your rights; and (d) compliance with our legal obligations under Pakistani law.',
      ],
    },
    {
      id: 'cookies',
      title: '4. Cookies and Similar Technologies',
      paragraphs: [
        'Our website uses cookies and similar technologies to keep you signed in, remember your preferences, understand how visitors use our site, and support features such as the WhatsApp chat widget and the online product catalogue. Cookies may be:',
      ],
      bullets: [
        'Strictly necessary cookies required for core site functionality, such as maintaining your login session and shopping/quote cart;',
        'Performance and analytics cookies that help us understand site traffic and usage patterns;',
        'Functionality cookies that remember your preferences; and',
        'Third-party cookies set by tools we use for chat, analytics, or advertising.',
      ],
      closingParagraphs: [
        'You can control or disable cookies through your browser settings. Disabling certain cookies may affect the functionality of your account, cart, or checkout process.',
      ],
    },
    {
      id: 'sharing',
      title: '5. How We Share Your Information',
      paragraphs: ['Ambassador does not sell your personal information. We may share information with:'],
      bullets: [
        'Logistics and delivery partners engaged to deliver equipment and complete installations at your premises nationwide;',
        'Payment processors and banks that process payments on our behalf;',
        'Service providers who support our website hosting, IT infrastructure, customer support, complaint-ticketing system, and marketing/newsletter tools, under confidentiality obligations;',
        'WhatsApp/Meta Platforms, Inc. and other social platforms, to the extent you choose to contact us through those channels, subject to that platform’s own privacy practices;',
        'Professional advisors (auditors, lawyers) and government or regulatory authorities where required by law, court order, or to protect our legal rights;',
        'A successor entity in the event of a merger, acquisition, restructuring, or sale of some or all of Ambassador’s business assets, subject to this Privacy Policy or a policy offering comparable protection.',
      ],
    },
    {
      id: 'security',
      title: '6. Data Storage and Security',
      paragraphs: [
        'We implement reasonable administrative, technical, and physical safeguards designed to protect personal information against unauthorised access, alteration, disclosure, or destruction, including restricted access to customer and order data, secure hosting, and staff confidentiality obligations. However, no method of transmission over the internet or electronic storage is completely secure, and we cannot guarantee absolute security.',
      ],
    },
    {
      id: 'retention',
      title: '7. Data Retention',
      paragraphs: [
        'We retain personal information for as long as necessary to fulfil the purposes described in this Policy, including maintaining your account, honouring product warranties (currently one year on all products), complying with tax, accounting, and other legal obligations, and resolving disputes or complaints. When information is no longer needed, we take reasonable steps to delete, anonymise, or securely archive it.',
      ],
    },
    {
      id: 'your-rights',
      title: '8. Your Rights and Choices',
      paragraphs: ['Depending on your relationship with us, you may have the right to:'],
      bullets: [
        'Access, review, or request a copy of the personal information we hold about you;',
        'Request correction of inaccurate or incomplete information, including through your account settings;',
        'Request deletion of your account and associated personal information, subject to legal or contractual retention requirements (for example, order and warranty records);',
        'Withdraw consent to marketing communications at any time by using the “unsubscribe” link in our emails or contacting us directly;',
        'Object to or request that we restrict certain processing of your information.',
      ],
      closingParagraphs: [
        'To exercise any of these rights, please contact us using the details in Section 14 below, or through our complaint portal at complaint.ambassador.pk. We will respond within a reasonable time and may need to verify your identity before actioning a request.',
      ],
    },
    {
      id: 'children',
      title: '9. Children’s Privacy',
      paragraphs: [
        'Our Services are intended for businesses and individuals aged 18 years or older who are capable of entering into commercial transactions. We do not knowingly collect personal information from children, and if we become aware that we have inadvertently done so, we will take steps to delete it.',
      ],
    },
    {
      id: 'third-party-links',
      title: '10. Third-Party Links',
      paragraphs: [
        'Our website and social media pages may contain links to third-party websites, including our social channels (Facebook, Instagram, LinkedIn, YouTube) and WhatsApp. This Privacy Policy does not apply to, and we are not responsible for, the privacy practices of any third-party sites or services. We encourage you to review the privacy policy of any third-party site you visit.',
      ],
    },
    {
      id: 'international-transfers',
      title: '11. International Data Transfers',
      paragraphs: [
        'Where we use hosting, cloud, analytics, or communication service providers located outside Pakistan, your information may be processed on servers located in other countries. Where this occurs, we take reasonable steps to ensure such providers offer an appropriate level of protection consistent with this Privacy Policy.',
      ],
    },
    {
      id: 'changes',
      title: '12. Changes to This Privacy Policy',
      paragraphs: [
        'We may update this Privacy Policy from time to time to reflect changes in our practices, technology, legal requirements, or for other operational reasons. The “Last Updated” date at the top of this Policy indicates when it was last revised. We encourage you to review this page periodically. Continued use of our Services after changes take effect constitutes acceptance of the revised Policy.',
      ],
    },
    {
      id: 'governing-law',
      title: '13. Governing Law',
      paragraphs: [
        'This Privacy Policy is governed by the laws of the Islamic Republic of Pakistan, including the Electronic Transactions Ordinance, 2002 and the Prevention of Electronic Crimes Act, 2016, without regard to conflict-of-law principles. Any disputes arising out of or relating to this Privacy Policy shall be subject to the exclusive jurisdiction of the courts of Lahore, Pakistan.',
      ],
    },
  ],
  contactTitle: '14. Contact Us',
  contactItems: [
    'Ambassador Commercial Kitchen Equipment, 5-A Fazal Elahi Road, Rehman Pura, Link Ferozpur Road, Lahore, Pakistan',
    'Email: info@ambassador.pk',
    'Phone: 0333-1166925 | UAN: 042-111-313-106',
    'Complaint / support portal: complaint.ambassador.pk',
  ],
  disclaimer:
    'This document is a general-purpose Privacy Policy template prepared for business use and does not constitute legal advice. Ambassador Commercial Kitchen Equipment is encouraged to have this Policy reviewed by a licensed Pakistani lawyer before publishing it on the live website, particularly regarding payment-processor obligations and any sector-specific regulations that may apply.',
  relatedLink: { label: 'Terms of Service', href: '/terms-of-service' },
};
