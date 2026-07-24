'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { compressImage, uploadMedia } from '@/utils/uploadMedia';
import { SPARE_PARTS_PATH } from '@/lib/siteRoutes';

export interface SparePartFormData {
  name: string;
  originalPrice: number;
  stock: number;
  description?: string;
  images?: string[];
  imagePublicIds?: string[];
}

export type SparePartSavePayload = SparePartFormData | FormData;

interface SparePartModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'add' | 'edit' | 'view';
  sparePart?: {
    _id?: string;
    name?: string;
    slug?: string;
    originalPrice?: number;
    price?: number;
    stock?: number;
    status?: 'active' | 'inactive';
    description?: string;
    images?: string[];
    imagePublicIds?: string[];
  } | null;
  onSave?: (data: SparePartSavePayload) => Promise<void>;
}

const inputCls = (hasError: boolean) =>
  `w-full px-3 py-2 border rounded-lg text-sm text-gray-900 outline-none transition-shadow focus:ring-2 focus:ring-[#0F4C69]/25 focus:border-[#0F4C69] ${
    hasError ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white'
  }`;

const SparePartModal: React.FC<SparePartModalProps> = ({
  isOpen,
  onClose,
  mode,
  sparePart,
  onSave,
}) => {
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    stock: '0',
  });

  const [imagePreview, setImagePreview] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imagePublicId, setImagePublicId] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  useEffect(() => {
    if (!isOpen || mode === 'view') return;
    const sp = sparePart;
    setForm({
      name: sp?.name ?? '',
      description: sp?.description ?? '',
      price: String(sp?.originalPrice ?? sp?.price ?? ''),
      stock: String(sp?.stock ?? 0),
    });
    setImagePreview(sp?.images?.[0] ?? '');
    setImageUrl(sp?.images?.[0] ?? '');
    setImagePublicId(sp?.imagePublicIds?.[0] ?? '');
    setImageFile(null);
    setErrors({});
    setUploadStatus('');
    setUploadProgress(null);
    setSaving(false);
  }, [isOpen, mode, sparePart?._id]);

  const handleImageChange = (file: File | undefined) => {
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview('');
    setImageUrl('');
    setImagePublicId('');
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Spare part title is required';
    if (!form.price.trim() || Number(form.price) <= 0) e.price = 'Valid price is required';
    if (!imageFile && !imageUrl && !imagePreview) e.image = 'Image is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (mode === 'view' || !onSave) return;
    if (!validate()) return;
    setSaving(true);
    setErrors({});
    try {
      if (mode === 'add' && imageFile) {
        setUploadStatus('Creating spare part…');
        const prepared = await compressImage(imageFile, 1200, 0.85);
        const fd = new FormData();
        fd.append('file', prepared);
        fd.append('name', form.name.trim());
        fd.append('originalPrice', form.price);
        fd.append('stock', form.stock || '0');
        fd.append('description', form.description.trim());
        await onSave(fd);
        onClose();
        return;
      }

      let finalUrl = imageUrl;
      let finalPublicId = imagePublicId;
      const imageChanged =
        mode === 'add' ||
        Boolean(imageFile) ||
        imageUrl !== (sparePart?.images?.[0] ?? '');

      if (imageFile) {
        setUploadStatus('Uploading image…');
        const up = await uploadMedia(imageFile, undefined, { preferServer: true });
        finalUrl = up.url;
        finalPublicId = up.publicId;
        setUploadStatus('Saving…');
      } else {
        setUploadStatus('Saving…');
      }

      const payload: SparePartFormData = {
        name: form.name.trim(),
        originalPrice: Number(form.price),
        stock: Number(form.stock || 0),
        description: form.description.trim(),
      };

      if (imageChanged) {
        if (!finalUrl) {
          throw new Error('Image is required.');
        }
        payload.images = [finalUrl];
        payload.imagePublicIds = finalPublicId ? [finalPublicId] : [];
      }

      await onSave(payload);
      onClose();
    } catch (err) {
      setErrors({ submit: (err as Error).message || 'Save failed. Please try again.' });
    } finally {
      setSaving(false);
      setUploadStatus('');
      setUploadProgress(null);
    }
  };

  if (!isOpen) return null;

  if (mode === 'view' && sparePart) {
    const displayPrice =
      sparePart.price != null && sparePart.price > 0 ? sparePart.price : sparePart.originalPrice ?? 0;
    const image = sparePart.images?.[0];
    const description = sparePart.description?.trim();

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
        <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl">
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-6 py-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">View Spare Part</h2>
              <p className="mt-0.5 text-xs text-gray-400">Read-only details</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-xl leading-none text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          <div className="space-y-5 p-6">
            <div className="rounded-xl bg-gray-50 p-4">
              <h3 className="mb-3 text-sm font-semibold text-gray-700">Image</h3>
              {image ? (
                <div className="relative mx-auto h-40 w-40 overflow-hidden rounded-lg border border-gray-200 bg-white">
                  <Image src={image} alt={sparePart.name ?? ''} fill className="object-contain p-2" sizes="160px" />
                </div>
              ) : (
                <p className="text-sm italic text-gray-400">No image</p>
              )}
            </div>

            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-xs font-medium text-gray-500">Title</dt>
                <dd className="mt-0.5 font-medium text-gray-900">{sparePart.name ?? '—'}</dd>
              </div>
              {sparePart.slug ? (
                <div>
                  <dt className="text-xs font-medium text-gray-500">Slug</dt>
                  <dd className="mt-0.5 text-gray-600">{sparePart.slug}</dd>
                </div>
              ) : null}
              <div>
                <dt className="text-xs font-medium text-gray-500">Price</dt>
                <dd className="mt-0.5 font-medium text-[#E36630]">PKR {Number(displayPrice).toLocaleString()}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-gray-500">Stock</dt>
                <dd className="mt-0.5 text-gray-900">{sparePart.stock ?? 0}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-gray-500">Status</dt>
                <dd className="mt-1">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
                      sparePart.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {sparePart.status ?? 'active'}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-gray-500">Description</dt>
                <dd className="mt-1 whitespace-pre-wrap text-gray-600">
                  {description || <span className="italic text-gray-400">No description provided.</span>}
                </dd>
              </div>
            </dl>
          </div>

          <div className="sticky bottom-0 flex flex-wrap items-center justify-end gap-2 border-t border-gray-100 bg-white px-6 py-4">
            <Link
              href={SPARE_PARTS_PATH}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              View on website
            </Link>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg bg-[#0F4C69] px-4 py-2 text-sm font-medium text-white hover:bg-[#0d3f59]"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {mode === 'add' ? 'Add New Spare Part' : 'Edit Spare Part'}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Listed on the public spare parts page — not linked to products or categories.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors text-xl leading-none"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-5">
          {errors.submit && (
            <div className="px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
              {errors.submit}
            </div>
          )}

          <div className="bg-gray-50 p-4 rounded-xl">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Image</h3>
            {!imagePreview ? (
              <div className="relative flex items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#0F4C69] hover:bg-[#0F4C69]/5 transition-colors bg-white">
                <input
                  type="file"
                  accept="image/*"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={(e) => {
                    handleImageChange(e.target.files?.[0]);
                    e.target.value = '';
                  }}
                />
                <span className="text-xs text-gray-500 font-medium">+ Add image</span>
              </div>
            ) : (
              <div className="flex items-start gap-3">
                <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={clearImage}
                    className="absolute top-0.5 right-0.5 w-5 h-5 bg-red-500 text-white rounded-full text-xs"
                  >
                    ✕
                  </button>
                </div>
                <label className="flex flex-1 h-20 items-center justify-center border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#0F4C69] bg-white text-xs text-gray-500">
                  Replace
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      handleImageChange(e.target.files?.[0]);
                      e.target.value = '';
                    }}
                  />
                </label>
              </div>
            )}
            {errors.image && <p className="text-red-500 text-xs mt-1">{errors.image}</p>}
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Heating Element for Pressure Fryer"
                className={inputCls(!!errors.name)}
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Brief details about this spare part…"
                rows={4}
                maxLength={5000}
                className={`${inputCls(false)} resize-y min-h-[5rem]`}
              />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Price (PKR) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min={0}
                  value={form.price}
                  onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                  className={inputCls(!!errors.price)}
                />
                {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Stock</label>
                <input
                  type="number"
                  min={0}
                  value={form.stock}
                  onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))}
                  className={inputCls(false)}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 sticky bottom-0 bg-white">
          <div className="text-xs text-gray-400">{uploadStatus}</div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={saving}
              className="px-5 py-2 text-sm bg-[#0F4C69] text-white rounded-lg hover:bg-[#0d3f59] disabled:opacity-60 min-w-[140px]"
            >
              {saving ? uploadStatus || 'Saving…' : mode === 'add' ? 'Add Spare Part' : 'Update'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SparePartModal;
