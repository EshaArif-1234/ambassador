'use client';

import { useState } from 'react';

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: "What types of kitchen equipment do you supply?",
      answer: "We supply a comprehensive range of commercial kitchen equipment including cooking ranges, ovens, fryers, refrigerators, freezers, food preparation tables, dishwashers, and storage solutions and many more."
    },
    {
      question: "Do you offer installation and maintenance services?",
      answer: "Yes, we provide professional installation services and ongoing maintenance support for all our equipment. Our team of trained technicians ensures proper setup and optimal performance."
    },
    {
      question: "What is your delivery coverage area?",
      answer: "We deliver across all over Pakistan."
    },
    {
      question: "Do you provide warranty on your products?",
      answer: "Local products (Ambassador manufactured Products) come with manufacturer 1 year warranty ."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept multiple payment methods including bank transfers, credit/debit cards, and online payment platforms. "
    },
    {
      question: "Can I get technical support after purchase?",
      answer: "Absolutely! Our technical support team is available 6 days a week to assist with any product-related questions, troubleshooting, or support needs."
    },
    {
      question: "Do you provide training for equipment usage?",
      answer: "Yes, we offer comprehensive training sessions for your staff on proper equipment operation, maintenance procedures, and safety protocols."
    }
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="py-16 border-t border-gray-200">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Frequently Asked Questions</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Common questions about our products and services
          </p>
        </div>
        
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="border border-gray-300 rounded-lg">
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full text-left p-6 transition-colors focus:outline-none"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-800 pr-2">{faq.question}</h3>
                  <svg
                    className="w-6 h-6 text-black transition-transform duration-200"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    {openIndex === index ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    )}
                  </svg>
                </div>
              </button>
              
              {openIndex === index && (
                <div className="px-6 pb-6">
                  <div className="border-t border-gray-200 pt-4">
                    <p className="text-gray-600 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FAQSection;
