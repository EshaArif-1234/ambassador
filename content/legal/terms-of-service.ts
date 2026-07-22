import type { LegalDocument } from '@/content/legal/types';

export const termsOfServiceDocument: LegalDocument = {
  slug: 'terms-of-service',
  title: 'Terms and Conditions',
  subtitle: 'Terms governing your use of Ambassador Commercial Kitchen Equipment services and website.',
  effectiveDate: '22 July 2026',
  lastUpdated: '22 July 2026',
  intro: [
    'These Terms and Conditions (“Terms”) govern your access to and use of the website www.ambassador.pk, your Ambassador customer account, and any products, quotations, custom kitchen design, fabrication, installation, and after-sales services (collectively, the “Services”) provided by Ambassador Commercial Kitchen Equipment (“Ambassador,” “we,” “us,” or “our”), a commercial kitchen equipment manufacturer and supplier based in Lahore, Pakistan.',
    'By accessing our website, creating an account, requesting a quote, or placing an order, you (“you,” “Customer,” or “Client”) agree to be bound by these Terms and our Privacy Policy. If you do not agree to these Terms, please do not use our website or Services.',
  ],
  sections: [
    {
      id: 'definitions',
      title: '1. Definitions',
      bullets: [
        '“Products” means commercial kitchen equipment, appliances, custom kitchen fabrication, and related goods offered for sale by Ambassador.',
        '“Custom Kitchen Services” means the design, fabrication, and installation of bespoke commercial kitchens, including site survey, 2D/3D design, client approval, manufacturing, and on-site installation.',
        '“Account” means the free customer account created on www.ambassador.pk to access B2B pricing, place bulk orders, and track order history.',
        '“Order” means any request to purchase Products or engage Custom Kitchen Services submitted through our website, branches, or authorised sales representatives.',
      ],
    },
    {
      id: 'eligibility',
      title: '2. Eligibility and Account Registration',
      paragraphs: [
        'Our Services are intended for businesses and individuals aged 18 years or older who have the legal capacity to enter into binding commercial agreements in Pakistan. To access certain features, including B2B pricing, bulk order management, and order tracking, you must create an Account by providing accurate and complete information.',
      ],
      bullets: [
        'You are responsible for maintaining the confidentiality of your Account login credentials and for all activity that occurs under your Account;',
        'You must promptly notify us at info@ambassador.pk if you suspect unauthorised use of your Account;',
        'Ambassador reserves the right to suspend or terminate any Account that provides false information, is used fraudulently, or breaches these Terms.',
      ],
    },
    {
      id: 'products-pricing',
      title: '3. Products, Pricing, and Availability',
      paragraphs: ['We make reasonable efforts to display accurate descriptions, images, specifications, and pricing for our Products. However:'],
      bullets: [
        'Product images are for illustrative purposes and actual products (including finish, dimensions, or accessories) may vary slightly;',
        'Prices are quoted in Pakistani Rupees (PKR) unless stated otherwise and are subject to change without prior notice, including promotional “on-sale” pricing;',
        'Registered business Accounts may access exclusive B2B and bulk-order pricing, which is confidential and must not be shared with unauthorised third parties;',
        'Product availability is not guaranteed until an Order is confirmed in writing by Ambassador; we reserve the right to limit quantities or decline any Order at our discretion, including in cases of pricing or listing errors.',
      ],
    },
    {
      id: 'quotations-orders',
      title: '4. Quotations, Orders, and Custom Kitchen Projects',
      subsections: [
        {
          title: '4.1 Standard Orders',
          paragraphs: [
            'Orders placed through our website, branches, WhatsApp, or sales representatives are treated as an offer to purchase, which Ambassador may accept or decline. A contract for sale is formed only when we confirm the Order in writing (including via email, WhatsApp, or invoice).',
          ],
        },
        {
          title: '4.2 Custom Kitchen Services',
          paragraphs: [
            'For turnkey custom kitchen projects, our process generally includes: (a) an on-site survey and measurement of your venue; (b) preparation of 2D and 3D design layouts; (c) your written approval of the final design and specification before any fabrication begins; and (d) fabrication, delivery, and installation by our own trained technicians. No manufacturing will commence until you have approved the design and any applicable deposit has been received. Changes requested after approval may affect cost and delivery timelines and may be subject to additional charges.',
          ],
        },
      ],
    },
    {
      id: 'payment',
      title: '5. Payment Terms',
      bullets: [
        'Payment terms (including any deposit, milestone, or full-payment requirements) will be confirmed at the time of quotation or order confirmation;',
        'We accept payment methods communicated to you by our sales team, which may include bank transfer, cheque, or other methods available at our branches;',
        'For custom kitchen projects, an advance/deposit payment is typically required before design finalisation or fabrication, with the balance payable per the agreed schedule prior to or upon delivery/installation;',
        'Ambassador reserves the right to withhold delivery or installation until payment obligations under the applicable Order are met.',
      ],
    },
    {
      id: 'delivery',
      title: '6. Delivery and Installation',
      bullets: [
        'Ambassador provides nationwide delivery across major cities in Pakistan, including Karachi, Lahore, and Islamabad, and other locations as agreed;',
        'Estimated delivery and installation timelines will be communicated at the time of Order confirmation and are estimates only; Ambassador is not liable for delays caused by circumstances beyond our reasonable control (see Section 11, Force Majeure);',
        'Risk in the Products passes to the Customer upon delivery to the address specified in the Order, or upon completion of installation for turnkey custom kitchen projects;',
        'The Customer is responsible for ensuring safe and adequate access to the installation site, and for any site-readiness requirements (electrical, gas, plumbing, or civil work) communicated by our design team, unless such work is expressly included in the agreed scope.',
      ],
    },
    {
      id: 'warranty',
      title: '7. Warranty',
      paragraphs: [
        'All Ambassador Products carry a standard one-year warranty from the date of delivery or installation, covering manufacturing defects in materials and workmanship under normal commercial use. The warranty does not cover:',
      ],
      bullets: [
        'Damage resulting from misuse, negligence, unauthorised modification, or failure to follow operating instructions;',
        'Normal wear and tear, consumable parts, or damage caused by improper electrical, gas, or water supply;',
        'Products serviced or repaired by anyone other than Ambassador’s authorised technicians without our prior written consent.',
      ],
      closingParagraphs: [
        'To make a warranty claim, please contact our after-sales support team via complaint.ambassador.pk or the contact details in Section 18.',
      ],
    },
    {
      id: 'cancellations',
      title: '8. Cancellations, Returns, and Refunds',
      subsections: [
        {
          title: '8.1 Refund Policy (Ambassador-Made Products)',
          paragraphs: [
            'The following refund policy applies to customized and non-customized products made by Ambassador Commercial Kitchen Equipment:',
          ],
          bullets: [
            'Customers may request a refund by returning the product to an Ambassador showroom;',
            'If the product is sold by Ambassador on the customer’s behalf, a 25% service charge applies to the refund amount;',
            'If the product is not sold within one year, the customer may collect the product back by paying a 10% display rent charge.',
          ],
        },
        {
          title: '8.2 Cancellations and Standard Returns',
          bullets: [
            'Cancellation requests for standard Orders must be submitted in writing before the Order has been dispatched or fabrication has commenced; Ambassador will confirm whether the Order can be cancelled without charge;',
            'Once fabrication of custom or made-to-order equipment has begun, such Orders generally cannot be cancelled, and any deposit paid may be non-refundable, reflecting materials and labour already committed;',
            'Returns of standard (non-custom) Products may be considered on a case-by-case basis where a Product is defective on arrival or does not match the confirmed Order, subject to inspection by Ambassador;',
            'Approved refunds will be processed to the original payment method or as otherwise agreed within a reasonable time.',
          ],
        },
      ],
    },
    {
      id: 'complaints',
      title: '9. Complaints and After-Sales Support',
      paragraphs: [
        'Ambassador maintains a dedicated complaint and support portal at complaint.ambassador.pk where Customers can open a new support ticket, check ticket status, and report product, delivery, or installation issues. We aim to acknowledge and address complaints promptly and in good faith.',
      ],
    },
    {
      id: 'intellectual-property',
      title: '10. Intellectual Property',
      paragraphs: [
        'All content on www.ambassador.pk, including text, graphics, logos, product images, custom kitchen designs, and layouts, is the property of Ambassador Commercial Kitchen Equipment or its licensors and is protected by applicable intellectual property laws. You may not reproduce, distribute, modify, or create derivative works from this content without our prior written consent, except for personal, non-commercial reference in connection with your own Order or project.',
      ],
    },
    {
      id: 'force-majeure',
      title: '11. Force Majeure',
      paragraphs: [
        'Ambassador shall not be liable for any delay or failure to perform its obligations under these Terms where such delay or failure results from circumstances beyond our reasonable control, including but not limited to natural disasters, strikes, fuel or raw-material shortages, import/customs delays, government action, power outages, or other events of force majeure.',
      ],
    },
    {
      id: 'limitation-liability',
      title: '12. Limitation of Liability',
      paragraphs: [
        'To the maximum extent permitted by applicable law, Ambassador’s total liability arising out of or in connection with any Order or these Terms shall not exceed the amount paid by the Customer for the relevant Product or Service giving rise to the claim. Ambassador shall not be liable for any indirect, incidental, special, or consequential loss, including loss of profits, business interruption, or loss of data, arising from the use of our Products, website, or Services, except where such liability cannot be excluded under Pakistani law.',
      ],
    },
    {
      id: 'indemnification',
      title: '13. Indemnification',
      paragraphs: [
        'You agree to indemnify and hold Ambassador, its officers, employees, and authorised representatives harmless from any claims, damages, liabilities, and expenses (including reasonable legal fees) arising from your breach of these Terms, misuse of our Services, or violation of applicable law.',
      ],
    },
    {
      id: 'third-party',
      title: '14. Third-Party Links and Platforms',
      paragraphs: [
        'Our website and communication channels may link to or integrate with third-party platforms, including WhatsApp, Facebook, Instagram, LinkedIn, and YouTube. Ambassador is not responsible for the content, policies, or practices of these third-party platforms, and your use of them is subject to their respective terms.',
      ],
    },
    {
      id: 'termination',
      title: '15. Termination',
      paragraphs: [
        'Ambassador may suspend or terminate your Account or access to the Services at any time, with or without notice, if we reasonably believe you have breached these Terms, engaged in fraudulent activity, or misused confidential B2B pricing information. You may close your Account at any time by contacting us; this will not affect obligations already accrued under confirmed Orders.',
      ],
    },
    {
      id: 'amendments',
      title: '16. Amendments to These Terms',
      paragraphs: [
        'Ambassador may update or revise these Terms from time to time to reflect changes in our business practices or applicable law. The “Last Updated” date at the top of this document reflects the most recent revision. Continued use of our website or Services after changes take effect constitutes your acceptance of the revised Terms. Material changes affecting active Orders will be communicated to affected Customers directly.',
      ],
    },
    {
      id: 'governing-law',
      title: '17. Governing Law and Dispute Resolution',
      paragraphs: [
        'These Terms and any dispute or claim arising out of or in connection with them (including non-contractual disputes) shall be governed by and construed in accordance with the laws of the Islamic Republic of Pakistan. The parties shall first attempt to resolve any dispute through good-faith negotiation. If unresolved, disputes shall be subject to the exclusive jurisdiction of the courts of Lahore, Pakistan.',
      ],
    },
  ],
  contactTitle: '18. Contact Information',
  contactItems: [
    'Ambassador Commercial Kitchen Equipment, 5-A Fazal Elahi Road, Rehman Pura, Link Ferozpur Road, Lahore, Pakistan',
    'Email: info@ambassador.pk',
    'Phone: 0333-1166925 | UAN: 042-111-313-106',
    'Complaint / support portal: complaint.ambassador.pk',
  ],
  disclaimer:
    'This document is a general-purpose Terms and Conditions template prepared for business use and does not constitute legal advice. Ambassador Commercial Kitchen Equipment is encouraged to have this document reviewed by a licensed Pakistani lawyer before publishing it on the live website, particularly regarding payment/refund terms, consumer-protection obligations, and warranty commitments specific to its products.',
  relatedLink: { label: 'Privacy Policy', href: '/privacy-policy' },
};
