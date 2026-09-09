'use client';

import {
  JOB_DEPARTMENT_OPTIONS,
  JOB_TYPES,
  WORK_ENVIRONMENTS,
  type CareerJob,
  type JobType,
  type WorkEnvironment,
} from '@/lib/careers.types';

export type AdminJobForm = {
  title: string;
  department: string;
  location: string;
  city: string;
  type: JobType;
  workEnvironment: WorkEnvironment;
  educationLevel: string;
  isHot: boolean;
  summary: string;
  description: string;
  responsibilities: string;
  requirements: string;
  status: 'active' | 'inactive';
};

export const emptyJobForm = (): AdminJobForm => ({
  title: '',
  department: '',
  location: '',
  city: '',
  type: 'Full Time',
  workEnvironment: 'On-site',
  educationLevel: '',
  isHot: false,
  summary: '',
  description: '',
  responsibilities: '',
  requirements: '',
  status: 'active',
});

export function jobToForm(job: CareerJob): AdminJobForm {
  return {
    title: job.title,
    department: job.department,
    location: job.location,
    city: job.city,
    type: job.type,
    workEnvironment: job.workEnvironment,
    educationLevel: job.educationLevel,
    isHot: job.isHot,
    summary: job.summary,
    description: job.description,
    responsibilities: job.responsibilities.join('\n'),
    requirements: job.requirements.join('\n'),
    status: job.status === 'inactive' ? 'inactive' : 'active',
  };
}

const inputClass =
  'w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20';

interface AdminJobModalProps {
  open: boolean;
  mode: 'add' | 'edit' | 'view';
  form: AdminJobForm;
  formError: string | null;
  submitting: boolean;
  canChangeStatus: boolean;
  onClose: () => void;
  onChange: (patch: Partial<AdminJobForm>) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const AdminJobModal = ({
  open,
  mode,
  form,
  formError,
  submitting,
  canChangeStatus,
  onClose,
  onChange,
  onSubmit,
}: AdminJobModalProps) => {
  if (!open) return null;

  const readOnly = mode === 'view';
  const title =
    mode === 'add' ? 'Add Job Opening' : mode === 'edit' ? 'Edit Job Opening' : 'View Job Opening';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-gray-100 px-6 py-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-500">
              {readOnly ? 'Job details (read-only)' : 'Fill in the job information shown on the careers page.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
            aria-label="Close"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="flex-1 overflow-y-auto px-6 py-5">
            {formError ? (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {formError}
              </div>
            ) : null}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs font-semibold uppercase text-gray-500">
                  Job Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => onChange({ title: e.target.value })}
                  readOnly={readOnly}
                  className={inputClass}
                  placeholder="e.g. Sales Executive — Commercial Kitchen Equipment"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase text-gray-500">
                  Department <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.department}
                  onChange={(e) => onChange({ department: e.target.value })}
                  disabled={readOnly}
                  className={inputClass}
                >
                  <option value="">Select department</option>
                  {JOB_DEPARTMENT_OPTIONS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase text-gray-500">
                  City <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.city}
                  onChange={(e) => onChange({ city: e.target.value })}
                  readOnly={readOnly}
                  className={inputClass}
                  placeholder="Lahore"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs font-semibold uppercase text-gray-500">
                  Location <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) => onChange({ location: e.target.value })}
                  readOnly={readOnly}
                  className={inputClass}
                  placeholder="Head Office — Lahore, Punjab"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase text-gray-500">
                  Position Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.type}
                  onChange={(e) => onChange({ type: e.target.value as JobType })}
                  disabled={readOnly}
                  className={inputClass}
                >
                  {JOB_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase text-gray-500">
                  Work Environment <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.workEnvironment}
                  onChange={(e) => onChange({ workEnvironment: e.target.value as WorkEnvironment })}
                  disabled={readOnly}
                  className={inputClass}
                >
                  {WORK_ENVIRONMENTS.map((w) => (
                    <option key={w} value={w}>
                      {w}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase text-gray-500">
                  Education Level <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.educationLevel}
                  onChange={(e) => onChange({ educationLevel: e.target.value })}
                  readOnly={readOnly}
                  className={inputClass}
                  placeholder="Bachelor's Degree"
                />
              </div>

              {canChangeStatus ? (
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase text-gray-500">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => onChange({ status: e.target.value as 'active' | 'inactive' })}
                    disabled={readOnly}
                    className={inputClass}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              ) : null}

              <div className="flex items-center gap-2 sm:col-span-2">
                <input
                  id="isHot"
                  type="checkbox"
                  checked={form.isHot}
                  onChange={(e) => onChange({ isHot: e.target.checked })}
                  disabled={readOnly}
                  className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                />
                <label htmlFor="isHot" className="text-sm font-medium text-gray-700">
                  Mark as Hot Job
                </label>
              </div>

              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs font-semibold uppercase text-gray-500">
                  Summary <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={2}
                  value={form.summary}
                  onChange={(e) => onChange({ summary: e.target.value })}
                  readOnly={readOnly}
                  className={`${inputClass} resize-y`}
                  placeholder="Short summary shown in job listings"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs font-semibold uppercase text-gray-500">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  value={form.description}
                  onChange={(e) => onChange({ description: e.target.value })}
                  readOnly={readOnly}
                  className={`${inputClass} resize-y min-h-[100px]`}
                />
              </div>

              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs font-semibold uppercase text-gray-500">
                  Responsibilities <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={5}
                  value={form.responsibilities}
                  onChange={(e) => onChange({ responsibilities: e.target.value })}
                  readOnly={readOnly}
                  className={`${inputClass} resize-y font-mono text-xs`}
                  placeholder="One responsibility per line"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs font-semibold uppercase text-gray-500">
                  Requirements <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={5}
                  value={form.requirements}
                  onChange={(e) => onChange({ requirements: e.target.value })}
                  readOnly={readOnly}
                  className={`${inputClass} resize-y font-mono text-xs`}
                  placeholder="One requirement per line"
                />
              </div>
            </div>
          </div>

          <div className="flex shrink-0 justify-end gap-3 border-t border-gray-100 bg-gray-50/80 px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              {readOnly ? 'Close' : 'Cancel'}
            </button>
            {!readOnly ? (
              <button
                type="submit"
                disabled={submitting}
                className="rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-60"
              >
                {submitting ? 'Saving…' : mode === 'add' ? 'Create Job' : 'Save Changes'}
              </button>
            ) : null}
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminJobModal;
