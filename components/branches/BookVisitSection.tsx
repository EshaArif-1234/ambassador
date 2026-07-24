'use client';

import { useState } from 'react';
import Link from 'next/link';
import { submitContactForm } from '@/utils/contact.api';

interface Branch {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  email: string;
  manager: string;
  hours: string;
  services: string[];
  image: string;
  coordinates: { lat: number; lng: number };
}

interface BookVisitSectionProps {
  branches: Branch[];
}

const inputClass =
  'w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E36630]/40 focus:border-[#E36630] transition-colors';

const TIME_SLOTS = [
  { value: '09:00-10:00', label: '9:00 AM – 10:00 AM' },
  { value: '10:00-11:00', label: '10:00 AM – 11:00 AM' },
  { value: '11:00-12:00', label: '11:00 AM – 12:00 PM' },
  { value: '12:00-13:00', label: '12:00 PM – 1:00 PM' },
  { value: '13:00-14:00', label: '1:00 PM – 2:00 PM' },
  { value: '14:00-15:00', label: '2:00 PM – 3:00 PM' },
  { value: '15:00-16:00', label: '3:00 PM – 4:00 PM' },
  { value: '16:00-17:00', label: '4:00 PM – 5:00 PM' },
  { value: '17:00-18:00', label: '5:00 PM – 6:00 PM' },
];

const EMPTY_FORM = { name: '', email: '', phone: '', branchId: '', date: '', timeSlot: '' };

const BookVisitSection = ({ branches }: BookVisitSectionProps) => {
  const [form, setForm] = useState(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');
    setIsError(false);

    const branch = branches.find((b) => b.id === form.branchId);
    const branchLabel = branch ? `${branch.name} — ${branch.city}` : '';
    const slotLabel = TIME_SLOTS.find((s) => s.value === form.timeSlot)?.label ?? '';

    if (!branchLabel || !form.date || !slotLabel) {
      setIsError(true);
      setMessage('Please select a branch, date, and time slot.');
      setIsSubmitting(false);
      return;
    }

    try {
      const result = await submitContactForm({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        subject: 'showroom-visit',
        message: '',
        visitBranch: branchLabel,
        visitDate: form.date,
        visitTimeSlot: slotLabel,
      });
      setMessage(result.message);
      setForm(EMPTY_FORM);
    } catch (err) {
      setIsError(true);
      setMessage((err as Error).message || 'Please try again or email info@ambassador.pk directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-12 md:py-20 bg-[#FAFAFA] border-t border-gray-200">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#0F4C69] uppercase tracking-widest mb-4">
            <span className="w-8 h-px bg-[#0F4C69]" />
            Visit Us
            <span className="w-8 h-px bg-[#0F4C69]" />
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
            Book a <span className="text-[#E36630]">Showroom Visit</span>
          </h2>
          <p className="text-gray-500 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            See our commercial kitchen equipment in person. Schedule a tour at your nearest branch.
          </p>
        </div>

        <div className="max-w-5xl mx-auto rounded-2xl border border-gray-100 bg-white shadow-[0_8px_40px_rgba(0,0,0,0.08)] overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            <div className="bg-[#0F4C69] p-8 md:p-10 text-white">
              <h3 className="text-xl font-bold mb-6">Why visit in person?</h3>
              <ul className="space-y-6">
                {[
                  {
                    title: 'Live Product Demos',
                    desc: 'See cooking ranges, fryers, refrigeration and more operating before you buy.',
                    icon: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
                  },
                  {
                    title: 'Expert Consultation',
                    desc: 'Our specialists help you choose equipment for your kitchen layout and menu.',
                    icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
                  },
                  {
                    title: 'Flexible Scheduling',
                    desc: 'Pick your branch, date, and time slot — we confirm within 24 hours.',
                    icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
                  },
                ].map((item) => (
                  <li key={item.title} className="flex gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 border border-white/20">
                      <svg className="h-5 w-5 text-[#E36630]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={item.icon} />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-white">{item.title}</p>
                      <p className="text-sm text-white/60 mt-0.5 leading-relaxed">{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
              <p className="mt-8 text-sm text-white/50">
                Prefer to call?{' '}
                <a href="tel:+923314937412" className="text-[#E36630] font-medium hover:underline">
                  0333-1166925
                </a>
              </p>
            </div>

            <div className="p-8 md:p-10">
              {message && (
                <div
                  className={`mb-6 rounded-xl border px-4 py-3 text-sm ${
                    isError ? 'border-red-200 bg-red-50 text-red-700' : 'border-green-200 bg-green-50 text-green-800'
                  }`}
                >
                  {message}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="visit-name" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Full Name
                  </label>
                  <input
                    id="visit-name"
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                    className={inputClass}
                    placeholder="Your full name"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="visit-email" className="block text-sm font-medium text-gray-700 mb-1.5">
                      Email
                    </label>
                    <input
                      id="visit-email"
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                      className={inputClass}
                      placeholder="you@email.com"
                    />
                  </div>
                  <div>
                    <label htmlFor="visit-phone" className="block text-sm font-medium text-gray-700 mb-1.5">
                      Phone
                    </label>
                    <input
                      id="visit-phone"
                      type="tel"
                      required
                      value={form.phone}
                      onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                      className={inputClass}
                      placeholder="+92 3XX XXXXXXX"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="visit-branch" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Select Branch
                  </label>
                  <select
                    id="visit-branch"
                    required
                    value={form.branchId}
                    onChange={(e) => setForm((p) => ({ ...p, branchId: e.target.value }))}
                    className={inputClass}
                  >
                    <option value="">Choose a branch</option>
                    {branches.map((branch) => (
                      <option key={branch.id} value={branch.id}>
                        {branch.name} — {branch.city}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="visit-date" className="block text-sm font-medium text-gray-700 mb-1.5">
                      Preferred Date
                    </label>
                    <input
                      id="visit-date"
                      type="date"
                      required
                      min={new Date().toISOString().split('T')[0]}
                      value={form.date}
                      onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label htmlFor="visit-time" className="block text-sm font-medium text-gray-700 mb-1.5">
                      Preferred Time Slot
                    </label>
                    <select
                      id="visit-time"
                      required
                      value={form.timeSlot}
                      onChange={(e) => setForm((p) => ({ ...p, timeSlot: e.target.value }))}
                      className={inputClass}
                    >
                      <option value="">Select a time</option>
                      {TIME_SLOTS.map((slot) => (
                        <option key={slot.value} value={slot.value}>
                          {slot.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <p className="text-xs text-gray-400 -mt-2">Showroom hours: Mon–Sat, 9:00 AM – 6:00 PM</p>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-xl bg-[#E36630] py-3.5 px-6 font-semibold text-white shadow-lg shadow-[#E36630]/25 hover:bg-[#cc5a2a] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Sending Request...' : 'Book Appointment'}
                </button>
              </form>

              <p className="mt-4 text-center text-xs text-gray-400">
                Or{' '}
                <Link href="/contact-us" className="text-[#E36630] font-medium hover:underline">
                  send us a message
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BookVisitSection;
