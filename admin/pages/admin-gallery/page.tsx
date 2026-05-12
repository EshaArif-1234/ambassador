'use client';

import { useCallback, useEffect, useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { adminIconActionBtn, adminIconActionBtnDanger } from '@/admin/lib/adminTableActionStyles';

interface Review {
  id: string;
  name: string;
  role: string;
  review: string;
  videoUrl?: string;
  status: 'active' | 'inactive';
}

interface GalleryReviewDoc {
  _id: string;
  name: string;
  role: string;
  review?: string;
  videoUrl?: string;
  status?: string;
}

function mapDocToReview(doc: GalleryReviewDoc): Review {
  return {
    id: String(doc._id),
    name: doc.name,
    role: doc.role,
    review: doc.review ?? '',
    videoUrl: doc.videoUrl ?? '',
    status: doc.status === 'inactive' ? 'inactive' : 'active',
  };
}

async function uploadGalleryVideo(file: File): Promise<string> {
  const fd = new FormData();
  fd.append('file', file);
  const res = await fetch('/api/upload', {
    method: 'POST',
    body: fd,
    credentials: 'include',
  });
  const json = await res.json();
  if (!json.success || typeof json.url !== 'string') {
    throw new Error(typeof json.message === 'string' ? json.message : 'Video upload failed.');
  }
  return json.url;
}

const modalInputClass =
  'w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 shadow-sm transition-colors focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20';

function isYoutubeVideoUrl(url: string): boolean {
  const u = url.trim().toLowerCase();
  return (
    u.includes('youtube.com/') ||
    u.includes('youtu.be/') ||
    u.includes('youtube-nocookie.com/')
  );
}

function videoPreviewKind(url: string | undefined): 'youtube' | 'direct' | 'none' {
  if (!url?.trim()) return 'none';
  if (isYoutubeVideoUrl(url)) return 'youtube';
  return 'direct';
}

const AdminGalleryPage = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const loadReviews = useCallback(async () => {
    setListLoading(true);
    setListError(null);
    try {
      const res = await fetch('/api/admin/gallery-reviews', { credentials: 'include' });
      const json = await res.json();
      if (!json.success) {
        throw new Error(typeof json.message === 'string' ? json.message : 'Failed to load gallery reviews.');
      }
      const rows: GalleryReviewDoc[] = Array.isArray(json.data) ? json.data : [];
      setReviews(rows.map(mapDocToReview));
    } catch (e) {
      setListError(e instanceof Error ? e.message : 'Failed to load gallery reviews.');
      setReviews([]);
    } finally {
      setListLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [formData, setFormData] = useState<Review>({
    id: '',
    name: '',
    role: '',
    review: '',
    videoUrl: '',
    status: 'active'
  });
  const [videoFile, setVideoFile] = useState<File | null>(null);
  /** Video source in create/edit modal: file upload vs pasted URL */
  const [videoInputMode, setVideoInputMode] = useState<'gallery' | 'link'>('link');
  const [formError, setFormError] = useState<string | null>(null);

  const reviewsPerPage = 10;
  const indexOfLastReview = currentPage * reviewsPerPage;
  const indexOfFirstReview = indexOfLastReview - reviewsPerPage;
  
  const filteredReviews = reviews.filter(review =>
    review.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    review.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    review.review.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const currentReviews = filteredReviews.slice(indexOfFirstReview, indexOfLastReview);
  const totalPages = Math.max(1, Math.ceil(filteredReviews.length / reviewsPerPage));

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [filteredReviews.length, currentPage, totalPages]);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const handleAddReview = () => {
    setFormError(null);
    setVideoFile(null);
    setVideoInputMode('link');
    setFormData({
      id: '',
      name: '',
      role: '',
      review: '',
      videoUrl: '',
      status: 'active'
    });
    setShowAddModal(true);
  };

  const handleEditReview = (review: Review) => {
    setFormError(null);
    setVideoFile(null);
    const v = review.videoUrl || '';
    setVideoInputMode(v && isYoutubeVideoUrl(v) ? 'link' : 'gallery');
    setSelectedReview(review);
    setFormData({
      id: review.id,
      name: review.name,
      role: review.role,
      review: review.review,
      videoUrl: v,
      status: review.status
    });
    setShowEditModal(true);
  };

  const handleViewReview = (review: Review) => {
    setSelectedReview(review);
    setShowViewModal(true);
  };

  const handleDeleteReview = (review: Review) => {
    setSelectedReview(review);
    setShowDeleteModal(true);
  };

  const handleSubmitAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const name = formData.name.trim();
    const role = formData.role.trim();
    if (!name || !role) {
      setFormError('Please enter name and role.');
      return;
    }
    let videoUrl = '';
    if (videoInputMode === 'gallery') {
      if (!videoFile) {
        setFormError('Upload a video from gallery, or switch to YouTube / link.');
        return;
      }
    } else {
      videoUrl = (formData.videoUrl ?? '').trim();
      if (!videoUrl) {
        setFormError('Paste a YouTube or video URL.');
        return;
      }
    }

    setFormSubmitting(true);
    try {
      if (videoInputMode === 'gallery' && videoFile) {
        videoUrl = await uploadGalleryVideo(videoFile);
      }
      const res = await fetch('/api/admin/gallery-reviews', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          role,
          review: formData.review.trim(),
          videoUrl,
          status: formData.status,
        }),
      });
      const json = await res.json();
      if (!json.success) {
        throw new Error(typeof json.message === 'string' ? json.message : 'Could not create review.');
      }
      await loadReviews();
      setShowAddModal(false);
      setFormData({
        id: '',
        name: '',
        role: '',
        review: '',
        videoUrl: '',
        status: 'active',
      });
      setVideoFile(null);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Request failed.');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(file);
      setFormError(null);
      setVideoInputMode('gallery');
      const objectUrl = URL.createObjectURL(file);
      setFormData((prev) => ({ ...prev, videoUrl: objectUrl }));
    }
  };

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!selectedReview) return;
    const name = formData.name.trim();
    const role = formData.role.trim();
    if (!name || !role) {
      setFormError('Please enter name and role.');
      return;
    }

    let videoUrl = '';
    if (videoInputMode === 'gallery') {
      if (videoFile) {
        /* resolved after upload below */
      } else {
        videoUrl = (selectedReview.videoUrl ?? '').trim();
        if (!videoUrl) {
          setFormError('Upload a video or switch to YouTube / link and paste a URL.');
          return;
        }
      }
    } else {
      videoUrl = (formData.videoUrl ?? '').trim();
      if (!videoUrl) {
        setFormError('Paste a YouTube or video URL.');
        return;
      }
    }

    setFormSubmitting(true);
    try {
      if (videoInputMode === 'gallery' && videoFile) {
        videoUrl = await uploadGalleryVideo(videoFile);
      }
      const res = await fetch(`/api/admin/gallery-reviews/${selectedReview.id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          role,
          review: formData.review.trim(),
          videoUrl,
          status: formData.status,
        }),
      });
      const json = await res.json();
      if (!json.success) {
        throw new Error(typeof json.message === 'string' ? json.message : 'Could not update review.');
      }
      await loadReviews();
      setShowEditModal(false);
      setSelectedReview(null);
      setVideoFile(null);
      setFormData({
        id: '',
        name: '',
        role: '',
        review: '',
        videoUrl: '',
        status: 'active',
      });
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Request failed.');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedReview) return;
    setFormSubmitting(true);
    setListError(null);
    try {
      const res = await fetch(`/api/admin/gallery-reviews/${selectedReview.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const json = await res.json();
      if (!json.success) {
        throw new Error(typeof json.message === 'string' ? json.message : 'Could not delete review.');
      }
      await loadReviews();
      setShowDeleteModal(false);
      setSelectedReview(null);
    } catch (err) {
      setListError(err instanceof Error ? err.message : 'Delete failed.');
      setShowDeleteModal(false);
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleToggleStatus = async (review: Review) => {
    const next = review.status === 'active' ? 'inactive' : 'active';
    setTogglingId(review.id);
    setListError(null);
    try {
      const res = await fetch(`/api/admin/gallery-reviews/${review.id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: next }),
      });
      const json = await res.json();
      if (!json.success) {
        throw new Error(typeof json.message === 'string' ? json.message : 'Could not update status.');
      }
      await loadReviews();
    } catch (err) {
      setListError(err instanceof Error ? err.message : 'Could not update status.');
    } finally {
      setTogglingId(null);
    }
  };

  const getYouTubeEmbedUrl = (url: string) => {
    const videoId = url.includes('youtube.com/watch?v=')
      ? url.split('v=')[1]?.split('&')[0]
      : url.includes('youtu.be/')
        ? url.split('youtu.be/')[1]?.split('?')[0]
        : url.includes('youtube.com/shorts/')
          ? url.split('/shorts/')[1]?.split('?')[0]
          : null;

    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Gallery Management</h1>
          <p className="text-gray-600">Manage customer reviews and testimonials</p>
        </div>

        {listError ? (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            <span>{listError}</span>
            <button
              type="button"
              onClick={() => loadReviews()}
              className="shrink-0 rounded-md bg-white px-3 py-1.5 text-red-800 shadow-sm ring-1 ring-red-200 hover:bg-red-100"
            >
              Retry
            </button>
          </div>
        ) : null}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 rounded-lg">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Reviews</p>
                <p className="text-2xl font-semibold text-gray-900">{reviews.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Video Reviews</p>
                <p className="text-2xl font-semibold text-gray-900">{reviews.filter(r => r.videoUrl).length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {reviews.filter((r) => r.status === 'active').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">With description</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {reviews.filter((r) => (r.review ?? '').trim()).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search reviews..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64 px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 placeholder:text-gray-400"
              />
              <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          <button
            onClick={handleAddReview}
            className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Review
          </button>
        </div>

        {/* Reviews Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Video
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Toggle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {listLoading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-14 text-center text-sm text-gray-500">
                      Loading gallery reviews…
                    </td>
                  </tr>
                ) : currentReviews.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-14 text-center text-sm text-gray-500">
                      No reviews match your filters. Add a review or clear search.
                    </td>
                  </tr>
                ) : (
                  currentReviews.map((review) => (
                  <tr key={review.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{review.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{review.role}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {review.review?.trim() ? review.review : '—'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {review.videoUrl ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Yes
                        </span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                          No
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        review.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {review.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button 
                        type="button"
                        disabled={togglingId === review.id}
                        onClick={() => handleToggleStatus(review)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${
                          review.status === 'active' 
                              ? 'bg-green-600 hover:bg-green-700' 
                              : 'bg-gray-200 hover:bg-gray-300'
                          }`}
                        title={review.status === 'active' ? 'Deactivate Review' : 'Activate Review'}
                      >
                        <span className="sr-only">{review.status === 'active' ? 'Deactivate' : 'Activate'}</span>
                        <span 
                          className={`inline-block h-4 w-4 transform rounded-full transition-transform ${
                              review.status === 'active' ? 'translate-x-6 bg-white' : 'translate-x-1 bg-white'
                            }`}
                          />
                        </button>
                      </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex flex-wrap items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleViewReview(review)}
                          title="View details"
                          aria-label="View details"
                          className={adminIconActionBtn}
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleEditReview(review)}
                          title="Edit review"
                          aria-label="Edit review"
                          className={adminIconActionBtn}
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteReview(review)}
                          title="Delete review"
                          aria-label="Delete review"
                          className={adminIconActionBtnDanger}
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing{' '}
                  <span className="font-medium">
                    {filteredReviews.length === 0 ? 0 : indexOfFirstReview + 1}
                  </span>{' '}
                  to{' '}
                  <span className="font-medium">
                    {filteredReviews.length === 0
                      ? 0
                      : Math.min(indexOfLastReview, filteredReviews.length)}
                  </span>{' '}
                  of <span className="font-medium">{filteredReviews.length}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Previous</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => paginate(page)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        currentPage === page
                          ? 'z-10 bg-orange-500 border-orange-500 text-white'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Next</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </div>

        {/* Add Review Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <div className="flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
              <div className="flex shrink-0 items-start justify-between gap-4 border-b border-gray-100 px-6 py-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#0F4C69]/10">
                    <svg className="h-5 w-5 text-[#0F4C69]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Create review</h3>
                    <p className="text-sm text-gray-500">
                      Name, role, description, and video (gallery upload or YouTube / URL).
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  aria-label="Close"
                  onClick={() => {
                    setShowAddModal(false);
                    setFormError(null);
                    setVideoFile(null);
                  }}
                  className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmitAdd} className="flex min-h-0 flex-1 flex-col">
                <div className="flex-1 overflow-y-auto px-6 py-5">
                  {formError ? (
                    <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                      {formError}
                    </div>
                  ) : null}

                  <div className="space-y-5">
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        autoComplete="off"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Chef Name"
                        className={modalInputClass}
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Role <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        autoComplete="off"
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        placeholder="e.g. Restaurant Owner, Celebrity Chef"
                        className={modalInputClass}
                      />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Description
                      </label>
                      <textarea
                        rows={4}
                        value={formData.review}
                        onChange={(e) => setFormData({ ...formData, review: e.target.value })}
                        placeholder="Testimonial or quote shown with this review…"
                        className={`${modalInputClass} resize-y min-h-[100px]`}
                      />
                      <p className="mt-1.5 text-xs text-gray-500">Optional short description or full testimonial text.</p>
                    </div>

                    <div>
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Video <span className="text-red-500">*</span>
                      </label>
                      <div className="flex rounded-lg border border-gray-200 bg-gray-50 p-1">
                        <button
                          type="button"
                          onClick={() => {
                            setFormError(null);
                            setVideoInputMode('gallery');
                          }}
                          className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                            videoInputMode === 'gallery'
                              ? 'bg-white text-[#0F4C69] shadow-sm ring-1 ring-gray-200'
                              : 'text-gray-600 hover:text-gray-900'
                          }`}
                        >
                          Gallery upload
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setFormError(null);
                            setVideoFile(null);
                            setFormData((prev) =>
                              (prev.videoUrl ?? '').startsWith('blob:') ? { ...prev, videoUrl: '' } : prev
                            );
                            setVideoInputMode('link');
                          }}
                          className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                            videoInputMode === 'link'
                              ? 'bg-white text-[#0F4C69] shadow-sm ring-1 ring-gray-200'
                              : 'text-gray-600 hover:text-gray-900'
                          }`}
                        >
                          YouTube / link
                        </button>
                      </div>

                      {videoInputMode === 'gallery' ? (
                        <div className="mt-3">
                          <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 px-4 py-8 transition-colors hover:border-orange-300 hover:bg-orange-50/30">
                            <svg className="mb-2 h-10 w-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            <span className="text-sm font-medium text-gray-700">Choose video file</span>
                            <span className="mt-1 text-xs text-gray-500">MP4, WebM, MOV — max size per your server policy</span>
                            <input type="file" accept="video/*" className="hidden" onChange={handleVideoUpload} />
                          </label>
                          {videoFile ? (
                            <p className="mt-2 text-sm text-gray-600">
                              Selected: <span className="font-medium text-gray-900">{videoFile.name}</span>
                            </p>
                          ) : null}
                        </div>
                      ) : (
                        <div className="mt-3">
                          <input
                            type="url"
                            value={(formData.videoUrl ?? '').startsWith('blob:') ? '' : (formData.videoUrl ?? '')}
                            onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                            placeholder="https://www.youtube.com/watch?v=… or direct video URL"
                            className={modalInputClass}
                          />
                          <p className="mt-2 text-xs text-gray-500">
                            Paste a YouTube watch / Shorts link, or a direct link to a video file hosted elsewhere.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex shrink-0 justify-end gap-3 border-t border-gray-100 bg-gray-50/80 px-6 py-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setFormError(null);
                      setVideoFile(null);
                    }}
                    className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={formSubmitting}
                    className="rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {formSubmitting ? 'Saving…' : 'Create review'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Review Modal */}
        {showEditModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <div className="flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
              <div className="flex shrink-0 items-start justify-between gap-4 border-b border-gray-100 px-6 py-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#0F4C69]/10">
                    <svg className="h-5 w-5 text-[#0F4C69]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Edit review</h3>
                    <p className="text-sm text-gray-500">Update name, role, description, video, or visibility.</p>
                  </div>
                </div>
                <button
                  type="button"
                  aria-label="Close"
                  onClick={() => {
                    setShowEditModal(false);
                    setFormError(null);
                    setVideoFile(null);
                    setSelectedReview(null);
                  }}
                  className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmitEdit} className="flex min-h-0 flex-1 flex-col">
                <div className="flex-1 overflow-y-auto px-6 py-5">
                  {formError ? (
                    <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                      {formError}
                    </div>
                  ) : null}

                  <div className="space-y-5">
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Status
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) =>
                          setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })
                        }
                        className={modalInputClass}
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className={modalInputClass}
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Role <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        className={modalInputClass}
                      />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Description
                      </label>
                      <textarea
                        rows={4}
                        value={formData.review}
                        onChange={(e) => setFormData({ ...formData, review: e.target.value })}
                        placeholder="Testimonial or quote shown with this review…"
                        className={`${modalInputClass} resize-y min-h-[100px]`}
                      />
                      <p className="mt-1.5 text-xs text-gray-500">Optional short description or full testimonial text.</p>
                    </div>

                    <div>
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Video <span className="text-red-500">*</span>
                      </label>
                      <div className="flex rounded-lg border border-gray-200 bg-gray-50 p-1">
                        <button
                          type="button"
                          onClick={() => {
                            setFormError(null);
                            setVideoInputMode('gallery');
                          }}
                          className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                            videoInputMode === 'gallery'
                              ? 'bg-white text-[#0F4C69] shadow-sm ring-1 ring-gray-200'
                              : 'text-gray-600 hover:text-gray-900'
                          }`}
                        >
                          Gallery upload
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setFormError(null);
                            setVideoFile(null);
                            setFormData((prev) =>
                              (prev.videoUrl ?? '').startsWith('blob:') ? { ...prev, videoUrl: '' } : prev
                            );
                            setVideoInputMode('link');
                          }}
                          className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                            videoInputMode === 'link'
                              ? 'bg-white text-[#0F4C69] shadow-sm ring-1 ring-gray-200'
                              : 'text-gray-600 hover:text-gray-900'
                          }`}
                        >
                          YouTube / link
                        </button>
                      </div>

                      {videoInputMode === 'gallery' ? (
                        <div className="mt-3">
                          <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 px-4 py-8 transition-colors hover:border-orange-300 hover:bg-orange-50/30">
                            <span className="text-sm font-medium text-gray-700">Replace video file</span>
                            <span className="mt-1 text-xs text-gray-500">Leave unchanged if you don&apos;t pick a new file</span>
                            <input type="file" accept="video/*" className="hidden" onChange={handleVideoUpload} />
                          </label>
                          {videoFile ? (
                            <p className="mt-2 text-sm text-gray-600">
                              New file: <span className="font-medium text-gray-900">{videoFile.name}</span>
                            </p>
                          ) : formData.videoUrl &&
                            !(formData.videoUrl ?? '').startsWith('blob:') &&
                            !isYoutubeVideoUrl(formData.videoUrl) ? (
                            <p className="mt-2 text-xs text-gray-500">Current video URL kept until you upload a replacement.</p>
                          ) : null}
                        </div>
                      ) : (
                        <div className="mt-3">
                          <input
                            type="url"
                            value={(formData.videoUrl ?? '').startsWith('blob:') ? '' : (formData.videoUrl ?? '')}
                            onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                            placeholder="YouTube or video URL"
                            className={modalInputClass}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex shrink-0 justify-end gap-3 border-t border-gray-100 bg-gray-50/80 px-6 py-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setFormError(null);
                      setVideoFile(null);
                      setSelectedReview(null);
                    }}
                    className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={formSubmitting}
                    className="rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {formSubmitting ? 'Saving…' : 'Save changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* View Review Modal */}
        {showViewModal && selectedReview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <div className="flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
              <div className="flex shrink-0 items-start justify-between gap-4 border-b border-gray-100 px-6 py-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#0F4C69]/10">
                    <svg className="h-5 w-5 text-[#0F4C69]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Review details</h3>
                    <p className="text-sm text-gray-500">Preview video and testimonial copy.</p>
                  </div>
                </div>
                <button
                  type="button"
                  aria-label="Close"
                  onClick={() => setShowViewModal(false)}
                  className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-5">
                <div className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Name</p>
                      <p className="mt-1 text-sm font-medium text-gray-900">{selectedReview.name}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Role</p>
                      <p className="mt-1 text-sm font-medium text-gray-900">{selectedReview.role}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Description</p>
                    <p className="mt-1 text-sm leading-relaxed text-gray-700">
                      {selectedReview.review?.trim() ? selectedReview.review : '—'}
                    </p>
                  </div>
                  {selectedReview.videoUrl ? (
                    <div>
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Video</p>
                      {videoPreviewKind(selectedReview.videoUrl) === 'youtube' &&
                      getYouTubeEmbedUrl(selectedReview.videoUrl) ? (
                        <div className="overflow-hidden rounded-xl border border-gray-200 bg-black shadow-inner">
                          <iframe
                            title="Review video"
                            src={getYouTubeEmbedUrl(selectedReview.videoUrl)!}
                            className="aspect-video h-auto min-h-[200px] w-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        </div>
                      ) : (
                        <video
                          src={selectedReview.videoUrl}
                          className="w-full rounded-xl border border-gray-200 bg-black"
                          controls
                          preload="metadata"
                        />
                      )}
                      <p className="mt-2 truncate text-xs text-gray-400">{selectedReview.videoUrl}</p>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No video attached.</p>
                  )}
                </div>
              </div>

              <div className="flex shrink-0 justify-end border-t border-gray-100 bg-gray-50/80 px-6 py-4">
                <button
                  type="button"
                  onClick={() => setShowViewModal(false)}
                  className="rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-orange-600"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && selectedReview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
              <div className="border-b border-gray-100 px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                    <svg className="h-5 w-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Delete review</h3>
                    <p className="text-sm text-gray-500">This cannot be undone.</p>
                  </div>
                </div>
              </div>
              <div className="px-6 py-4">
                <p className="text-sm text-gray-700">
                  Remove the review from <span className="font-semibold">{selectedReview.name}</span>?
                </p>
              </div>
              <div className="flex justify-end gap-3 border-t border-gray-100 bg-gray-50/80 px-6 py-4">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={formSubmitting}
                  onClick={handleConfirmDelete}
                  className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {formSubmitting ? 'Deleting…' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminGalleryPage;
