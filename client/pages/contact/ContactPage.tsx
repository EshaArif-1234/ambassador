'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import InputField from '@/components/common/InputField';
import FAQSection from '@/components/about/FAQSection';
import SignupBanner from '@/components/common/signup-banner';
import { submitContactForm } from '@/utils/contact.api';

const CONTACT = {
  address: '5-A Fazal Elahi Road, Rehman Pura Link Ferozpur Road, Lahore, Pakistan',
  phone: '0333-1166925',
  phoneHref: 'tel:+923314937412',
  uan: '042-111-313-106',
  uanHref: 'tel:042111313106',
  email: 'info@ambassador.pk',
  emailHref: 'mailto:info@ambassador.pk',
  hours: 'Monday – Saturday: 9:00 AM – 6:00 PM',
  mapQuery: '5-A Fazal Elahi Road, Rehman Pura Link Ferozpur Road, Lahore, Pakistan',
};

const BRANCHES = [
  { name: 'Head Office', city: 'Lahore' },
  { name: 'Fazaia Showroom', city: 'Lahore' },
  { name: 'Raya Showroom', city: 'DHA Lahore' },
  { name: 'Rawalpindi Branch', city: 'Rawalpindi' },
];

const SUBJECTS = [
  { value: 'product-inquiry', label: 'Product Inquiry' },
  { value: 'technical-support', label: 'Technical Support' },
  { value: 'sales', label: 'Sales & Quotation' },
  { value: 'service', label: 'After-Sales Service' },
  { value: 'custom-kitchen', label: 'Custom Kitchen Project' },
  { value: 'other', label: 'Other' },
];

const inputClass =
  'w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E36630]/40 focus:border-[#E36630] transition-colors';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [submitIsError, setSubmitIsError] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage('');
    setSubmitIsError(false);

    if (!formData.subject) {
      setSubmitIsError(true);
      setSubmitMessage('Please select a subject.');
      setIsSubmitting(false);
      return;
    }
    if (formData.message.trim().length < 10) {
      setSubmitIsError(true);
      setSubmitMessage('Message must be at least 10 characters.');
      setIsSubmitting(false);
      return;
    }

    try {
      const result = await submitContactForm({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        subject: formData.subject,
        message: formData.message.trim(),
      });
      setSubmitMessage(result.message);
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (err) {
      setSubmitIsError(true);
      setSubmitMessage((err as Error).message || 'Please try again or email info@ambassador.pk directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative h-96 md:h-[560px] overflow-hidden bg-[#06131A]">
        <Image
          src="/Images/Contact-Us-Banner-1.png"
          alt="Contact Ambassador Commercial Kitchen Equipment"
          fill
          className="object-cover object-center"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/50 to-black/30" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="container mx-auto px-4 text-center text-white">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-white/90 backdrop-blur-sm mb-6">
              <span className="h-1.5 w-1.5 rounded-full bg-[#E36630]" />
              We&apos;re Here to Help
            </span>
            <h1
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-5 leading-tight"
              style={{ textShadow: '0 4px 24px rgba(0,0,0,0.5)' }}
            >
              Get in <span className="text-[#E36630]">Touch</span>
            </h1>
            <p className="text-lg md:text-xl text-white/75 max-w-2xl mx-auto leading-relaxed">
              Questions about equipment, custom kitchens, or after-sales support — our Lahore team is ready to assist you across Pakistan.
            </p>
          </div>
        </div>
      </section>

      {/* Quick contact strip */}
      <section className="bg-[#0F4C69] py-6 md:py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
            <a
              href={CONTACT.phoneHref}
              className="group flex items-center gap-4 rounded-xl border border-white/15 bg-white/5 px-5 py-4 backdrop-blur-sm transition-colors hover:bg-white/10"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#E36630]/20 text-[#E36630] group-hover:bg-[#E36630] group-hover:text-white transition-colors">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-white/50">Call Us</p>
                <p className="text-sm md:text-base font-semibold text-white">{CONTACT.phone}</p>
                <p className="text-xs text-white/60">UAN: {CONTACT.uan}</p>
              </div>
            </a>

            <a
              href={CONTACT.emailHref}
              className="group flex items-center gap-4 rounded-xl border border-white/15 bg-white/5 px-5 py-4 backdrop-blur-sm transition-colors hover:bg-white/10"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#E36630]/20 text-[#E36630] group-hover:bg-[#E36630] group-hover:text-white transition-colors">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-white/50">Email</p>
                <p className="text-sm md:text-base font-semibold text-white">{CONTACT.email}</p>
                <p className="text-xs text-white/60">We reply within 24 hours</p>
              </div>
            </a>

            <div className="flex items-center gap-4 rounded-xl border border-white/15 bg-white/5 px-5 py-4 backdrop-blur-sm">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#E36630]/20 text-[#E36630]">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-white/50">Business Hours</p>
                <p className="text-sm md:text-base font-semibold text-white">Mon – Sat</p>
                <p className="text-xs text-white/60">9:00 AM – 6:00 PM</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Form + contact info */}
      <section className="py-12 md:py-20 bg-[#FAFAFA]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 md:mb-16">
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#0F4C69] uppercase tracking-widest mb-4">
              <span className="w-8 h-px bg-[#0F4C69]" />
              Contact Us
              <span className="w-8 h-px bg-[#0F4C69]" />
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
              Send a <span className="text-[#E36630]">Message</span>
            </h2>
            <p className="text-gray-500 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
              Tell us about your kitchen requirements and we&apos;ll connect you with the right specialist.
            </p>
            <div className="mt-5 w-16 h-1 bg-[#E36630] mx-auto rounded-full" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
            {/* Form */}
            <div className="lg:col-span-7">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_8px_40px_rgba(0,0,0,0.08)] overflow-hidden">
                <div className="p-6 md:p-8 lg:p-10">
                  {submitMessage && (
                    <div
                      className={`mb-6 flex items-start gap-3 rounded-xl border px-4 py-3 text-sm ${
                        submitIsError
                          ? 'border-red-200 bg-red-50 text-red-700'
                          : 'border-green-200 bg-green-50 text-green-800'
                      }`}
                    >
                      <svg className="h-5 w-5 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {submitMessage}
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <InputField
                        id="name"
                        label="Full Name"
                        type="text"
                        value={formData.name}
                        onChange={(value) => setFormData((prev) => ({ ...prev, name: value }))}
                        placeholder="Your full name"
                      />
                      <InputField
                        id="email"
                        label="Email Address"
                        type="email"
                        value={formData.email}
                        onChange={(value) => setFormData((prev) => ({ ...prev, email: value }))}
                        placeholder="you@email.com"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <InputField
                        id="phone"
                        label="Phone Number"
                        type="text"
                        value={formData.phone}
                        onChange={(value) => setFormData((prev) => ({ ...prev, phone: value }))}
                        placeholder="+92 3XX XXXXXXX"
                      />
                      <div className="space-y-2">
                        <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
                          Subject
                        </label>
                        <select
                          id="subject"
                          name="subject"
                          value={formData.subject}
                          onChange={handleChange}
                          required
                          className={inputClass}
                        >
                          <option value="">Select a subject</option>
                          {SUBJECTS.map((s) => (
                            <option key={s.value} value={s.value}>
                              {s.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                        Message
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        minLength={10}
                        rows={5}
                        placeholder="Describe your kitchen setup, equipment needs, or service request..."
                        className={`${inputClass} resize-none`}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full rounded-xl bg-[#E36630] py-3.5 px-6 font-semibold text-white shadow-lg shadow-[#E36630]/25 transition-all hover:bg-[#cc5a2a] hover:shadow-[#E36630]/40 disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Sending...
                        </>
                      ) : (
                        <>
                          Send Message
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-5 space-y-6">
              {/* Address card */}
              <div className="group rounded-2xl border border-gray-100 bg-white p-6 shadow-[0_4px_24px_rgba(0,0,0,0.06)] transition-all hover:border-[#E36630]/40 hover:shadow-[0_8px_32px_rgba(0,0,0,0.1)]">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#E36630]/10 text-[#E36630] group-hover:bg-[#E36630] group-hover:text-white transition-colors">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Head Office — Lahore</h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-4">{CONTACT.address}</p>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(CONTACT.mapQuery)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#E36630] hover:text-[#cc5a2a] transition-colors"
                >
                  Open in Google Maps
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>

              {/* Branches */}
              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
                <h3 className="text-lg font-bold text-gray-900 mb-1">Our Branches</h3>
                <p className="text-sm text-gray-500 mb-4">4 locations across Pakistan</p>
                <ul className="space-y-3 mb-5">
                  {BRANCHES.map((branch) => (
                    <li key={branch.name} className="flex items-center gap-3 text-sm">
                      <span className="h-2 w-2 shrink-0 rounded-full bg-[#E36630]" />
                      <span className="font-medium text-gray-800">{branch.name}</span>
                      <span className="text-gray-400">·</span>
                      <span className="text-gray-500">{branch.city}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/branches"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border-2 border-[#0F4C69] px-4 py-2.5 text-sm font-semibold text-[#0F4C69] transition-colors hover:bg-[#0F4C69] hover:text-white"
                >
                  View All Branches
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>
              </div>

              {/* Social */}
              <div className="rounded-2xl bg-[#0F4C69] p-6 text-white">
                <h3 className="text-lg font-bold mb-1">Follow Us</h3>
                <p className="text-sm text-white/60 mb-5">Stay updated on products, projects & kitchen tips</p>
                <div className="flex gap-3">
                  {[
                    { href: 'https://www.facebook.com/AmbassadorcommercialKitchen/', label: 'Facebook', icon: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z' },
                    { href: 'https://www.instagram.com/ambassador_acke/', label: 'Instagram', icon: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM5.838 12a6.162 6.162 0 1112.324 0 6.162 6.162 0 01-12.324 0zM12 16a4 4 0 110-8 4 4 0 010 8zm4.965-10.405a1.44 1.44 0 112.881.001 1.44 1.44 0 01-2.881-.001z' },
                    { href: 'https://www.youtube.com/@ambassador.official', label: 'YouTube', icon: 'M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z' },
                    { href: 'https://www.tiktok.com/@ambassador.official', label: 'TikTok', icon: 'M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.11-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z' },
                  ].map((social) => (
                    <a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.label}
                      className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 border border-white/20 text-white transition-colors hover:bg-[#E36630] hover:border-[#E36630]"
                    >
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d={social.icon} />
                      </svg>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map */}
      <section className="py-12 md:py-16 bg-[#E3E6E6] border-t border-gray-200">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
              Find Us in <span className="text-[#E36630]">Lahore</span>
            </h2>
            <p className="text-gray-500 mt-2 max-w-xl mx-auto">
              Visit our head office showroom to explore commercial kitchen equipment in person.
            </p>
          </div>
          <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-xl aspect-[16/7] md:aspect-[21/7]">
            <iframe
              title="Ambassador Head Office Location"
              src={`https://maps.google.com/maps?q=${encodeURIComponent(CONTACT.mapQuery)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
              className="w-full h-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>

      <FAQSection />
      <SignupBanner />
    </div>
  );
};

export default ContactPage;
