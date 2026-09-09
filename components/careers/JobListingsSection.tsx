'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  JOB_TYPES,
  WORK_ENVIRONMENTS,
  type CareerJob,
} from '@/lib/careers.types';

const PAGE_SIZE = 5;

function FilterSelect({
  label,
  value,
  onChange,
  options,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-gray-700">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 focus:border-[#0F4C69] focus:outline-none focus:ring-2 focus:ring-[#0F4C69]/20"
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}

function JobCard({ job }: { job: CareerJob }) {
  return (
    <article className="rounded-xl border border-gray-200 bg-white p-5 transition-shadow hover:shadow-md">
      <Link href={`/careers/${job.slug}`} className="group block">
        <h3 className="text-base font-bold text-[#0F4C69] group-hover:text-[#E36630] md:text-lg">
          {job.title}
        </h3>
        <div className="mt-2 flex flex-wrap gap-2">
          {job.isHot ? (
            <span className="rounded-full bg-[#FDE8E8] px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-[#B12704]">
              Hot Job
            </span>
          ) : null}
          <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] font-semibold text-gray-600">
            {job.type}
          </span>
          <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] font-semibold text-gray-600">
            {job.department}
          </span>
        </div>
        <p className="mt-3 text-sm font-semibold text-gray-800">{job.location}</p>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-gray-600">{job.summary}</p>
      </Link>
    </article>
  );
}

interface JobListingsSectionProps {
  compactHeader?: boolean;
}

const JobListingsSection = ({ compactHeader = false }: JobListingsSectionProps) => {
  const [jobs, setJobs] = useState<CareerJob[]>([]);
  const [filterOptions, setFilterOptions] = useState<{
    cities: string[];
    departments: string[];
    educationLevels: string[];
  }>({ cities: [], departments: [], educationLevels: [] });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [keyword, setKeyword] = useState('');
  const [city, setCity] = useState('');
  const [department, setDepartment] = useState('');
  const [jobType, setJobType] = useState('');
  const [workEnvironment, setWorkEnvironment] = useState('');
  const [education, setEducation] = useState('');
  const [hotOnly, setHotOnly] = useState(false);
  const [sort, setSort] = useState<'newest' | 'title'>('newest');
  const [page, setPage] = useState(1);

  const loadJobs = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await fetch('/api/careers');
      const json = await res.json();
      if (!json.success) throw new Error(json.message || 'Failed to load jobs.');
      setJobs(Array.isArray(json.data) ? json.data : []);
      if (json.filters) {
        setFilterOptions({
          cities: json.filters.cities ?? [],
          departments: json.filters.departments ?? [],
          educationLevels: json.filters.educationLevels ?? [],
        });
      }
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : 'Failed to load jobs.');
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  const filtered = useMemo(() => {
    const q = keyword.trim().toLowerCase();
    let list = jobs.filter((job) => {
      if (q && !`${job.title} ${job.summary} ${job.department} ${job.city}`.toLowerCase().includes(q)) {
        return false;
      }
      if (city && job.city !== city) return false;
      if (department && job.department !== department) return false;
      if (jobType && job.type !== jobType) return false;
      if (workEnvironment && job.workEnvironment !== workEnvironment) return false;
      if (education && job.educationLevel !== education) return false;
      if (hotOnly && !job.isHot) return false;
      return true;
    });

    if (sort === 'title') {
      list = [...list].sort((a, b) => a.title.localeCompare(b.title));
    }

    return list;
  }, [jobs, keyword, city, department, jobType, workEnvironment, education, hotOnly, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const resetPage = () => setPage(1);

  return (
    <section className="bg-white py-10 md:py-14">
      <div className="container mx-auto px-4">
        {!compactHeader ? (
          <div className="mb-8 text-center md:mb-10">
            <span className="mb-4 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-[#0F4C69]">
              <span className="h-px w-8 bg-[#0F4C69]" />
              Open Positions
              <span className="h-px w-8 bg-[#0F4C69]" />
            </span>
            <h2 className="text-3xl font-bold text-gray-900 md:text-4xl">
              Current <span className="text-[#E36630]">Job Openings</span>
            </h2>
            <div className="mx-auto mt-4 h-1 w-16 rounded-full bg-[#E36630]" />
          </div>
        ) : null}

        {loadError ? (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {loadError}{' '}
            <button type="button" onClick={loadJobs} className="font-semibold underline">
              Retry
            </button>
          </div>
        ) : null}

        <div className="mb-6 rounded-xl border border-gray-200 bg-[#FAFAFA] p-4 md:p-5">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_1fr_auto]">
            <input
              type="search"
              value={keyword}
              onChange={(e) => {
                setKeyword(e.target.value);
                resetPage();
              }}
              placeholder="Search by keyword"
              className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm focus:border-[#0F4C69] focus:outline-none focus:ring-2 focus:ring-[#0F4C69]/20"
            />
            <select
              value={city}
              onChange={(e) => {
                setCity(e.target.value);
                resetPage();
              }}
              className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm focus:border-[#0F4C69] focus:outline-none focus:ring-2 focus:ring-[#0F4C69]/20"
            >
              <option value="">All cities</option>
              {filterOptions.cities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => resetPage()}
              className="rounded-lg bg-[#0F4C69] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#0d4259]"
            >
              Search
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[260px_1fr]">
          <aside className="space-y-4">
            <h3 className="text-sm font-bold text-gray-900">Filter Jobs</h3>
            <FilterSelect
              label="Department"
              value={department}
              onChange={(v) => {
                setDepartment(v);
                resetPage();
              }}
              options={filterOptions.departments}
              placeholder="All departments"
            />
            <FilterSelect
              label="Position Type"
              value={jobType}
              onChange={(v) => {
                setJobType(v);
                resetPage();
              }}
              options={[...JOB_TYPES]}
              placeholder="All types"
            />
            <FilterSelect
              label="Work Environment"
              value={workEnvironment}
              onChange={(v) => {
                setWorkEnvironment(v);
                resetPage();
              }}
              options={[...WORK_ENVIRONMENTS]}
              placeholder="All environments"
            />
            <FilterSelect
              label="Education Level"
              value={education}
              onChange={(v) => {
                setEducation(v);
                resetPage();
              }}
              options={filterOptions.educationLevels}
              placeholder="All levels"
            />
            <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm">
              <input
                type="checkbox"
                checked={hotOnly}
                onChange={(e) => {
                  setHotOnly(e.target.checked);
                  resetPage();
                }}
                className="rounded border-gray-300 text-[#0F4C69] focus:ring-[#0F4C69]"
              />
              <span className="font-medium text-gray-700">Hot jobs only</span>
            </label>

            <div className="rounded-xl border border-[#0F4C69]/20 bg-[#0F4C69]/5 p-4">
              <p className="text-sm font-bold text-[#0F4C69]">Can&apos;t find what you&apos;re looking for?</p>
              <p className="mt-2 text-xs leading-relaxed text-gray-600">
                Join our talent community and we&apos;ll reach out when a matching role opens.
              </p>
              <a
                href="mailto:info@ambassador.pk?subject=Join%20Talent%20Community"
                className="mt-3 inline-flex w-full items-center justify-center rounded-lg bg-[#0F4C69] px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-[#0d4259]"
              >
                Join Talent Community
              </a>
            </div>
          </aside>

          <div>
            <div className="mb-4 flex flex-col gap-3 border-b border-gray-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-semibold text-gray-800">
                {loading ? 'Loading…' : `${filtered.length} Result${filtered.length !== 1 ? 's' : ''}`}
              </p>
              <select
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value as 'newest' | 'title');
                  resetPage();
                }}
                className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-[#0F4C69] focus:outline-none focus:ring-2 focus:ring-[#0F4C69]/20"
              >
                <option value="newest">Sort: Newest</option>
                <option value="title">Sort: Title A–Z</option>
              </select>
            </div>

            {loading ? (
              <div className="rounded-xl border border-dashed border-gray-200 bg-[#FAFAFA] px-6 py-12 text-center text-sm text-gray-500">
                Loading job openings…
              </div>
            ) : paginated.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-200 bg-[#FAFAFA] px-6 py-12 text-center">
                <p className="font-semibold text-gray-800">No job openings right now</p>
                <p className="mt-2 text-sm text-gray-500">
                  Check back soon or join our talent community to hear about new roles.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {paginated.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
            )}

            {filtered.length > PAGE_SIZE ? (
              <div className="mt-6 flex flex-col items-center justify-between gap-3 border-t border-gray-100 pt-4 sm:flex-row">
                <p className="text-xs text-gray-500">
                  Showing {(currentPage - 1) * PAGE_SIZE + 1}–
                  {Math.min(currentPage * PAGE_SIZE, filtered.length)} of {filtered.length}
                </p>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={currentPage <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm disabled:opacity-40"
                  >
                    Prev
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setPage(n)}
                      className={`rounded-lg px-3 py-1.5 text-sm ${
                        n === currentPage
                          ? 'bg-[#0F4C69] font-semibold text-white'
                          : 'border border-gray-200 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                  <button
                    type="button"
                    disabled={currentPage >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
};

export default JobListingsSection;
