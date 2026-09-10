'use client';

import { useCallback, useEffect, useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import AdminJobModal, {
  emptyJobForm,
  jobToForm,
  type AdminJobForm,
} from '@/components/careers/AdminJobModal';
import { adminIconActionBtn, adminIconActionBtnDanger } from '@/admin/lib/adminTableActionStyles';
import { useDashboardPermissions } from '@/hooks/useDashboardPermissions';
import type { CareerJob } from '@/lib/careers.types';

const CareersJobsAdminPage = () => {
  const { canDelete, canChangeStatus } = useDashboardPermissions();
  const [jobs, setJobs] = useState<CareerJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalMode, setModalMode] = useState<'add' | 'edit' | 'view' | null>(null);
  const [selectedJob, setSelectedJob] = useState<CareerJob | null>(null);
  const [form, setForm] = useState<AdminJobForm>(emptyJobForm());
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const loadJobs = useCallback(async () => {
    setLoading(true);
    setListError(null);
    try {
      const res = await fetch('/api/admin/careers', { credentials: 'include' });
      const json = await res.json();
      if (!json.success) throw new Error(json.message || 'Failed to load jobs.');
      setJobs(Array.isArray(json.data) ? json.data : []);
    } catch (e) {
      setListError(e instanceof Error ? e.message : 'Failed to load jobs.');
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  const filtered = jobs.filter(
    (job) =>
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.city.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const openAdd = () => {
    setForm(emptyJobForm());
    setFormError(null);
    setSelectedJob(null);
    setModalMode('add');
  };

  const openEdit = (job: CareerJob) => {
    setSelectedJob(job);
    setForm(jobToForm(job));
    setFormError(null);
    setModalMode('edit');
  };

  const openView = (job: CareerJob) => {
    setSelectedJob(job);
    setForm(jobToForm(job));
    setFormError(null);
    setModalMode('view');
  };

  const closeModal = () => {
    setModalMode(null);
    setSelectedJob(null);
    setFormError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (modalMode !== 'add' && modalMode !== 'edit') return;

    setSubmitting(true);
    setFormError(null);

    const payload = {
      ...form,
      ...(modalMode === 'add' ? { status: 'active' as const } : {}),
    };

    try {
      const url = modalMode === 'add' ? '/api/admin/careers' : `/api/admin/careers/${selectedJob!.id}`;
      const method = modalMode === 'add' ? 'POST' : 'PATCH';
      const res = await fetch(url, {
        method,
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message || 'Save failed.');
      await loadJobs();
      closeModal();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Save failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedJob) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/careers/${selectedJob.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message || 'Delete failed.');
      await loadJobs();
      setShowDeleteModal(false);
      setSelectedJob(null);
    } catch (err) {
      setListError(err instanceof Error ? err.message : 'Delete failed.');
      setShowDeleteModal(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (job: CareerJob) => {
    const next = job.status === 'active' ? 'inactive' : 'active';
    setTogglingId(job.id);
    try {
      const res = await fetch(`/api/admin/careers/${job.id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: next }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message || 'Status update failed.');
      await loadJobs();
    } catch (err) {
      setListError(err instanceof Error ? err.message : 'Status update failed.');
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">Careers / Jobs</h1>
          <p className="text-gray-600">Create and manage job openings shown on the public careers page.</p>
        </div>

        {listError ? (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            <span>{listError}</span>
            <button type="button" onClick={() => loadJobs()} className="rounded-md bg-white px-3 py-1.5 ring-1 ring-red-200">
              Retry
            </button>
          </div>
        ) : null}

        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-lg bg-white p-5 shadow">
            <p className="text-sm text-gray-600">Total Jobs</p>
            <p className="text-2xl font-semibold text-gray-900">{jobs.length}</p>
          </div>
          <div className="rounded-lg bg-white p-5 shadow">
            <p className="text-sm text-gray-600">Active</p>
            <p className="text-2xl font-semibold text-green-700">
              {jobs.filter((j) => j.status !== 'inactive').length}
            </p>
          </div>
          <div className="rounded-lg bg-white p-5 shadow">
            <p className="text-sm text-gray-600">Hot Jobs</p>
            <p className="text-2xl font-semibold text-[#E36630]">{jobs.filter((j) => j.isHot).length}</p>
          </div>
        </div>

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <input
            type="search"
            placeholder="Search jobs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full max-w-xs rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 sm:w-64"
          />
          <button
            type="button"
            onClick={openAdd}
            className="flex items-center justify-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600"
          >
            <span>+</span> Add Job
          </button>
        </div>

        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Department</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">City</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-500">
                      Loading jobs…
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-500">
                      No jobs yet. Click <strong>Add Job</strong> to create your first opening.
                    </td>
                  </tr>
                ) : (
                  filtered.map((job) => (
                    <tr key={job.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{job.title}</div>
                        {job.isHot ? (
                          <span className="mt-1 inline-block rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-bold uppercase text-red-700">
                            Hot
                          </span>
                        ) : null}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{job.department}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{job.city}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{job.type}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${
                              job.status !== 'inactive'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {job.status !== 'inactive' ? 'Active' : 'Inactive'}
                          </span>
                          {canChangeStatus ? (
                            <button
                              type="button"
                              disabled={togglingId === job.id}
                              onClick={() => handleToggleStatus(job)}
                              aria-label={job.status !== 'inactive' ? 'Set inactive' : 'Set active'}
                              className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
                                job.status !== 'inactive' ? 'bg-green-600' : 'bg-gray-300'
                              } disabled:opacity-60`}
                            >
                              <span
                                className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                                  job.status !== 'inactive' ? 'translate-x-6' : 'translate-x-1'
                                }`}
                              />
                            </button>
                          ) : null}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-1">
                          <button type="button" onClick={() => openView(job)} className={adminIconActionBtn} title="View" aria-label="View">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          <button type="button" onClick={() => openEdit(job)} className={adminIconActionBtn} title="Edit" aria-label="Edit">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          {canDelete ? (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedJob(job);
                                setShowDeleteModal(true);
                              }}
                              className={adminIconActionBtnDanger}
                              title="Delete"
                              aria-label="Delete"
                            >
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <AdminJobModal
          open={modalMode !== null}
          mode={modalMode === 'view' ? 'view' : modalMode === 'edit' ? 'edit' : 'add'}
          form={form}
          formError={formError}
          submitting={submitting}
          onClose={closeModal}
          onChange={(patch) => setForm((f) => ({ ...f, ...patch }))}
          onSubmit={handleSubmit}
        />

        {showDeleteModal && selectedJob ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
              <h3 className="text-lg font-semibold text-gray-900">Delete job?</h3>
              <p className="mt-2 text-sm text-gray-600">
                Remove <strong>{selectedJob.title}</strong>? This cannot be undone.
              </p>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  className="rounded-lg border border-gray-200 px-4 py-2 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={handleDelete}
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
                >
                  {submitting ? 'Deleting…' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </DashboardLayout>
  );
};

export default CareersJobsAdminPage;
