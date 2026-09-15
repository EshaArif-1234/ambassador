'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { compressImage, uploadMedia } from '@/utils/uploadMedia';
import { SPARE_PARTS_PATH } from '@/lib/siteRoutes';
import type { SparePartVariant } from '@/lib/sparePartVariants.util';
import {
  downloadSparePartDetailPdf,
  printSparePartDetail,
  sparePartToDetailExport,
} from '@/utils/generateSparePartDetailPdf';

const exportBtnClass =
  'inline-flex items-center justify-center gap-2 rounded-lg border border-[#0F4C69]/25 bg-white px-3 py-2 text-sm font-medium text-[#0F4C69] transition-colors hover:bg-[#0F4C69]/5 disabled:cursor-not-allowed disabled:opacity-50';

export interface SparePartFormData {
  name: string;
  originalPrice: number;
  stock: number;
  weightKg: number;
  description?: string;
  images?: string[];
  imagePublicIds?: string[];
  variants?: SparePartVariant[];
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
    weightKg?: number;
    status?: 'active' | 'inactive';
    description?: string;
    images?: string[];
    imagePublicIds?: string[];
    variants?: SparePartVariant[];
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
    weightKg: '',
  });

  const [imagePreview, setImagePreview] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imagePublicId, setImagePublicId] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [variants, setVariants] = useState<SparePartVariant[]>([]);
  const [exportLoading, setExportLoading] = useState<'print' | 'pdf' | null>(null);

  useEffect(() => {
    if (!isOpen || mode === 'view') return;
    const sp = sparePart;
    setForm({
      name: sp?.name ?? '',
      description: sp?.description ?? '',
      price: String(sp?.originalPrice ?? sp?.price ?? ''),
      stock: String(sp?.stock ?? 0),
      weightKg: sp?.weightKg != null ? String(sp.weightKg) : '',
    });
    setVariants(Array.isArray(sp?.variants) ? sp!.variants!.map((v) => ({ ...v })) : []);
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
    if (!form.weightKg.trim() || Number(form.weightKg) <= 0) e.weightKg = 'Weight (kg) is required';
    if (!imageFile && !imageUrl && !imagePreview) e.image = 'Image is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const addVariantRow = () => {
    setVariants((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        name: '',
        stock: 0,
      },
    ]);
  };

  const updateVariantRow = (id: string, patch: Partial<SparePartVariant>) => {
    setVariants((prev) => prev.map((v) => (v.id === id ? { ...v, ...patch } : v)));
  };

  const removeVariantRow = (id: string) => {
    setVariants((prev) => prev.filter((v) => v.id !== id));
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
        fd.append('weightKg', form.weightKg);
        fd.append('description', form.description.trim());
        fd.append('variants', JSON.stringify(variants.filter((v) => v.name.trim())));
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
        weightKg: Number(form.weightKg),
        description: form.description.trim(),
        variants: variants.filter((v) => v.name.trim()),
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
    const exportData = sparePartToDetailExport(sparePart);
    const image = exportData.image;
    const description = exportData.description;

    const handlePrint = () => {
      setExportLoading('print');
      try {
        printSparePartDetail(exportData);
      } catch (error) {
        alert(error instanceof Error ? error.message : 'Unable to print this spare part.');
      } finally {
        setExportLoading(null);
      }
    };

    const handleDownloadPdf = async () => {
      setExportLoading('pdf');
      try {
        await downloadSparePartDetailPdf(exportData);
      } catch (error) {
        alert(error instanceof Error ? error.message : 'Unable to generate PDF.');
      } finally {
        setExportLoading(null);
      }
    };

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
        <div className="relative flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
          <div className="relative z-10 flex flex-shrink-0 flex-wrap items-center justify-between gap-3 border-b border-gray-100 bg-white px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-md border border-[#0F4C69]/20 bg-[#0F4C69]/5">
                <svg className="h-4 w-4 text-[#0F4C69]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-base font-semibold text-[#0F4C69]">Spare Part Details</h2>
                <p className="text-xs text-gray-500">Preview matches PDF &amp; print layout</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button type="button" onClick={handlePrint} disabled={exportLoading !== null} className={exportBtnClass}>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                {exportLoading === 'print' ? 'Opening…' : 'Print'}
              </button>
              <button type="button" onClick={handleDownloadPdf} disabled={exportLoading !== null} className={exportBtnClass}>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                {exportLoading === 'pdf' ? 'Generating…' : 'Download PDF'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
                aria-label="Close"
              >
                ✕
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px]">
              <div className="space-y-6 border-r border-gray-100 p-6">
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-gray-200 bg-white">
                  {image ? (
                    <Image
                      src={image}
                      alt={exportData.name}
                      fill
                      className="object-contain p-2"
                      sizes="(max-width: 1024px) 100vw, 640px"
                      priority
                    />
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center gap-2 text-gray-400">
                      <span className="text-sm">No image</span>
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-800">
                    <span className="inline-block h-4 w-1 rounded-full bg-[#0F4C69]" />
                    Description
                  </h3>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-600">
                    {description || <span className="italic text-gray-400">No description provided.</span>}
                  </p>
                </div>

                {exportData.variants.length > 0 ? (
                  <div>
                    <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-800">
                      <span className="inline-block h-4 w-1 rounded-full bg-[#0F4C69]" />
                      Variants
                    </h3>
                    <div className="overflow-x-auto rounded-lg border border-gray-200">
                      <table className="min-w-full text-sm">
                        <thead className="bg-gray-50 text-left text-xs text-gray-500">
                          <tr>
                            <th className="px-3 py-2 font-medium">Name</th>
                            <th className="px-3 py-2 font-medium">Price</th>
                            <th className="px-3 py-2 font-medium">Stock</th>
                          </tr>
                        </thead>
                        <tbody>
                          {exportData.variants.map((variant, index) => (
                            <tr key={`${variant.name}-${index}`} className="border-t border-gray-100">
                              <td className="px-3 py-2 text-gray-900">{variant.name}</td>
                              <td className="px-3 py-2 text-gray-700">PKR {variant.price.toLocaleString()}</td>
                              <td className="px-3 py-2 text-gray-700">{variant.stock}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="bg-[#fafafa] p-6">
                <h3 className="text-lg font-bold text-gray-900">{exportData.name}</h3>
                {exportData.slug ? (
                  <p className="mt-1 break-all font-mono text-xs text-gray-400">{exportData.slug}</p>
                ) : null}
                <span
                  className={`mt-3 inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    exportData.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {exportData.status}
                </span>

                <div className="mt-4 overflow-hidden rounded-xl border border-gray-200">
                  <div className="bg-[#0F4C69] px-4 py-3 text-white">
                    <p className="text-[11px] uppercase tracking-wide opacity-75">Price</p>
                    <p className="text-2xl font-bold">PKR {exportData.price.toLocaleString()}</p>
                  </div>
                </div>

                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Stock</span>
                    <span className="font-medium text-gray-900">{exportData.stock}</span>
                  </div>
                  {exportData.weightKg != null ? (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Weight</span>
                      <span className="font-medium text-gray-900">{exportData.weightKg} kg</span>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-shrink-0 flex-wrap items-center justify-end gap-2 border-t border-gray-100 bg-white px-6 py-4">
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

            <div className="rounded-xl border-2 border-dashed border-[#0F4C69]/25 bg-[#0F4C69]/5 p-4">
              <div className="mb-3 flex items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-semibold text-[#0F4C69]">Variants (optional)</h3>
                  <p className="text-[11px] text-gray-600 mt-0.5">
                    Add different models, sizes, or voltages — each with its own price and stock. Variant prices can be higher or lower than the base price.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addVariantRow}
                  className="shrink-0 rounded-lg bg-[#0F4C69] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#0d3f59]"
                >
                  + Add variant
                </button>
              </div>

              {variants.length === 0 ? (
                <p className="text-xs text-gray-600">
                  No variants yet. Click <strong>+ Add variant</strong> to let customers choose options on the website.
                </p>
              ) : (
                <div className="space-y-3">
                  {variants.map((variant, index) => (
                    <div
                      key={variant.id}
                      className="rounded-lg border border-gray-200 bg-white p-3 space-y-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-semibold text-gray-700">Variant {index + 1}</p>
                        <button
                          type="button"
                          onClick={() => removeVariantRow(variant.id)}
                          className="text-xs font-medium text-red-600 hover:text-red-700"
                        >
                          Remove
                        </button>
                      </div>
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                        <div className="sm:col-span-1">
                          <label className="block text-[11px] font-medium text-gray-600 mb-1">Name *</label>
                          <input
                            type="text"
                            value={variant.name}
                            onChange={(e) => updateVariantRow(variant.id, { name: e.target.value })}
                            placeholder="e.g. 220V"
                            className={inputCls(false)}
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-medium text-gray-600 mb-1">Price (PKR)</label>
                          <input
                            type="number"
                            min={0}
                            value={variant.price ?? ''}
                            onChange={(e) =>
                              updateVariantRow(variant.id, {
                                price: e.target.value === '' ? undefined : Number(e.target.value),
                              })
                            }
                            placeholder="Leave blank for base price"
                            className={inputCls(false)}
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-medium text-gray-600 mb-1">Stock *</label>
                          <input
                            type="number"
                            min={0}
                            value={variant.stock}
                            onChange={(e) =>
                              updateVariantRow(variant.id, { stock: Math.max(0, Number(e.target.value) || 0) })
                            }
                            className={inputCls(false)}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  {variants.length > 0 ? 'Base price (PKR)' : 'Price (PKR)'}{' '}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min={0}
                  value={form.price}
                  onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                  className={inputCls(!!errors.price)}
                />
                {variants.length > 0 ? (
                  <p className="mt-1 text-[11px] text-gray-500">Used when a variant has no own price.</p>
                ) : null}
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
                  disabled={variants.length > 0}
                />
                {variants.length > 0 ? (
                  <p className="mt-1 text-[11px] text-gray-500">Stock is set per variant above.</p>
                ) : null}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Weight (kg) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min={0.001}
                  step={0.001}
                  value={form.weightKg}
                  onChange={(e) => setForm((f) => ({ ...f, weightKg: e.target.value }))}
                  className={inputCls(!!errors.weightKg)}
                />
                {errors.weightKg && <p className="text-red-500 text-xs mt-1">{errors.weightKg}</p>}
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
