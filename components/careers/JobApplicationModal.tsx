'use client';

import { useEffect, useState } from 'react';
import type { CareerJob } from '@/lib/careers.types';
import { submitJobApplication } from '@/utils/careers.api';

interface JobApplicationModalProps {
  job: CareerJob | null;
  onClose: () => void;
}

const inputClass =
  'w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#0F4C69] focus:outline-none focus:ring-2 focus:ring-[#0F4C69]/20';

const JobApplicationModal = ({ job, onClose }: JobApplicationModalProps) => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    experience: '',
    linkedIn: '',
    coverLetter: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    if (!job) return;
    setForm({
      name: '',
      email: '',
      phone: '',
      city: '',
      experience: '',
      linkedIn: '',
      coverLetter: '',
    });
    setErrors({});
    setMessage('');
    setIsError(false);
  }, [job]);

  useEffect(() => {
    if (!job) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [job, onClose]);

  if (!job) return null;

  const update = (field: keyof typeof form, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');
    setIsError(false);
    setErrors({});

    try {
      const result = await submitJobApplication({
        jobId: job.id,
        jobSlug: job.slug,
        jobTitle: job.title,
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        city: form.city.trim(),
        experience: form.experience.trim() || undefined,
        linkedIn: form.linkedIn.trim() || undefined,
        coverLetter: form.coverLetter.trim(),
      });
      setMessage(result.message);
    } catch (err) {
      setIsError(true);
      setMessage((err as Error).message || 'Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="job-application-title"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-gray-100 bg-white px-5 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#0F4C69]">Job Application</p>
            <h2 id="job-application-title" className="mt-1 text-lg font-bold text-gray-900">
              Apply for this role
            </h2>
            <p className="mt-1 text-sm text-gray-600">{job.title}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700"
            aria-label="Close"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {message && !isError ? (
          <div className="px-5 py-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-50 text-green-600">
              <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-sm leading-relaxed text-gray-700">{message}</p>
            <button
              type="button"
              onClick={onClose}
              className="mt-6 rounded-xl bg-[#0F4C69] px-6 py-2.5 text-sm font-bold text-white hover:bg-[#0d4259]"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 px-5 py-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs font-semibold text-gray-700">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => update('name', e.target.value)}
                  className={inputClass}
                  placeholder="Your full name"
                  required
                />
                {errors.name ? <p className="mt-1 text-xs text-red-600">{errors.name}</p> : null}
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-gray-700">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => update('email', e.target.value)}
                  className={inputClass}
                  placeholder="you@email.com"
                  required
                />
                {errors.email ? <p className="mt-1 text-xs text-red-600">{errors.email}</p> : null}
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-gray-700">
                  Phone <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => update('phone', e.target.value)}
                  className={inputClass}
                  placeholder="03XX XXXXXXX"
                  required
                />
                {errors.phone ? <p className="mt-1 text-xs text-red-600">{errors.phone}</p> : null}
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-gray-700">
                  City <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.city}
                  onChange={(e) => update('city', e.target.value)}
                  className={inputClass}
                  placeholder="Lahore"
                  required
                />
                {errors.city ? <p className="mt-1 text-xs text-red-600">{errors.city}</p> : null}
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-gray-700">Experience</label>
                <input
                  type="text"
                  value={form.experience}
                  onChange={(e) => update('experience', e.target.value)}
                  className={inputClass}
                  placeholder="e.g. 2 years in sales"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs font-semibold text-gray-700">LinkedIn / Portfolio URL</label>
                <input
                  type="url"
                  value={form.linkedIn}
                  onChange={(e) => update('linkedIn', e.target.value)}
                  className={inputClass}
                  placeholder="https://linkedin.com/in/yourprofile"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs font-semibold text-gray-700">
                  Cover Letter <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={form.coverLetter}
                  onChange={(e) => update('coverLetter', e.target.value)}
                  rows={5}
                  className={`${inputClass} resize-y min-h-[120px]`}
                  placeholder="Tell us why you're a good fit for this role..."
                  required
                />
                {errors.coverLetter ? (
                  <p className="mt-1 text-xs text-red-600">{errors.coverLetter}</p>
                ) : null}
              </div>
            </div>

            {isError && message ? (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{message}</p>
            ) : null}

            <div className="flex flex-col-reverse gap-2 border-t border-gray-100 pt-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="rounded-xl bg-[#E36630] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#cc5a2a] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? 'Submitting…' : 'Submit Application'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default JobApplicationModal;
