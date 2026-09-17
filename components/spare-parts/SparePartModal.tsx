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

type VariantRow = {
  id: string;
  name: string;
  price: string;
  stock: string;
  imagePreview: string;
  imageUrl: string;
  imagePublicId: string;
  imageFile: File | null;
};

function emptyVariantRow(): VariantRow {
  return {
    id: crypto.randomUUID(),
    name: '',
    price: '',
    stock: '0',
    imagePreview: '',
    imageUrl: '',
    imagePublicId: '',
    imageFile: null,
  };
}

function sparePartToVariantRows(sp: SparePartModalProps['sparePart']): VariantRow[] {
  if (Array.isArray(sp?.variants) && sp!.variants!.length > 0) {
    return sp!.variants!.map((v) => ({
      id: v.id,
      name: v.name,
      price: String(v.price ?? v.originalPrice ?? ''),
      stock: String(v.stock ?? 0),
      imagePreview: v.image ?? '',
      imageUrl: v.image ?? '',
      imagePublicId: v.imagePublicId ?? '',
      imageFile: null,
    }));
  }
  if (sp?.name || sp?.originalPrice) {
    return [
      {
        id: crypto.randomUUID(),
        name: 'Standard',
        price: String(sp.originalPrice ?? sp.price ?? ''),
        stock: String(sp.stock ?? 0),
        imagePreview: sp.images?.[0] ?? '',
        imageUrl: sp.images?.[0] ?? '',
        imagePublicId: sp.imagePublicIds?.[0] ?? '',
        imageFile: null,
      },
    ];
  }
  return [emptyVariantRow()];
}

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
    weightKg: '',
  });

  const [variantRows, setVariantRows] = useState<VariantRow[]>([emptyVariantRow()]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [exportLoading, setExportLoading] = useState<'print' | 'pdf' | null>(null);

  useEffect(() => {
    if (!isOpen || mode === 'view') return;
    const sp = sparePart;
    setForm({
      name: sp?.name ?? '',
      description: sp?.description ?? '',
      weightKg: sp?.weightKg != null ? String(sp.weightKg) : '',
    });
    setVariantRows(mode === 'add' && !sp?._id ? [emptyVariantRow()] : sparePartToVariantRows(sp));
    setErrors({});
    setUploadStatus('');
    setUploadProgress(null);
    setSaving(false);
  }, [isOpen, mode, sparePart?._id]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Spare part title is required';
    if (!form.weightKg.trim() || Number(form.weightKg) <= 0) e.weightKg = 'Weight (kg) is required';
    if (variantRows.length === 0) e.variants = 'Add at least one variation.';
    variantRows.forEach((row) => {
      if (!row.name.trim()) e[`variant-${row.id}-name`] = 'Name is required';
      if (!row.price.trim() || Number(row.price) <= 0) e[`variant-${row.id}-price`] = 'Valid price required';
      if (Number(row.stock) < 0) e[`variant-${row.id}-stock`] = 'Invalid stock';
    });
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const addVariantRow = () => {
    setVariantRows((prev) => [...prev, emptyVariantRow()]);
  };

  const updateVariantRow = (id: string, patch: Partial<VariantRow>) => {
    setVariantRows((prev) => prev.map((v) => (v.id === id ? { ...v, ...patch } : v)));
  };

  const removeVariantRow = (id: string) => {
    setVariantRows((prev) => (prev.length <= 1 ? prev : prev.filter((v) => v.id !== id)));
  };

  const setVariantImage = (id: string, file: File | undefined) => {
    if (!file) return;
    updateVariantRow(id, {
      imageFile: file,
      imagePreview: URL.createObjectURL(file),
    });
  };

  const clearVariantImage = (id: string) => {
    updateVariantRow(id, {
      imageFile: null,
      imagePreview: '',
      imageUrl: '',
      imagePublicId: '',
    });
  };

  const handleSubmit = async () => {
    if (mode === 'view' || !onSave) return;
    if (!validate()) return;
    setSaving(true);
    setErrors({});
    try {
      setUploadStatus('Uploading variation images…');
      const variantsPayload: SparePartVariant[] = [];

      for (let i = 0; i < variantRows.length; i++) {
        const row = variantRows[i];
        let image = row.imageUrl.trim();
        let imagePublicId = row.imagePublicId.trim();

        if (row.imageFile) {
          setUploadStatus(`Uploading image ${i + 1} of ${variantRows.length}…`);
          const prepared = await compressImage(row.imageFile, 1200, 0.85);
          const up = await uploadMedia(prepared, undefined, { preferServer: true });
          image = up.url;
          imagePublicId = up.publicId;
        }

        variantsPayload.push({
          id: row.id,
          name: row.name.trim(),
          price: Number(row.price),
          stock: Math.max(0, Number(row.stock) || 0),
          ...(image ? { image, ...(imagePublicId ? { imagePublicId } : {}) } : {}),
        });
      }

      setUploadStatus('Saving…');

      const payload: SparePartFormData = {
        name: form.name.trim(),
        originalPrice: Math.min(...variantsPayload.map((v) => v.price ?? v.originalPrice ?? 0)),
        stock: variantsPayload.reduce((sum, v) => sum + v.stock, 0),
        weightKg: Number(form.weightKg),
        description: form.description.trim(),
        variants: variantsPayload,
      };

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-gray-100 bg-white px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {mode === 'add' ? 'Create Spare Part' : 'Edit Spare Part'}
            </h2>
            <p className="mt-0.5 text-xs text-gray-500">
              Each variation has its own name, price, stock, and optional image.
            </p>
          </div>
          <button
            type="button"
            onClick={addVariantRow}
            className="shrink-0 rounded-lg bg-[#0F4C69] px-3 py-2 text-xs font-semibold text-white hover:bg-[#0d3f59]"
          >
            + Add variation
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto p-6">
          {errors.submit ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {errors.submit}
            </div>
          ) : null}
          {errors.variants ? <p className="text-sm text-red-600">{errors.variants}</p> : null}

          <div className="space-y-4">
            {variantRows.map((row, index) => (
              <div
                key={row.id}
                className="rounded-xl border border-gray-200 bg-gray-50/80 p-4 shadow-sm"
              >
                <div className="mb-3 flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#0F4C69]">
                    Variation {index + 1}
                  </p>
                  {variantRows.length > 1 ? (
                    <button
                      type="button"
                      onClick={() => removeVariantRow(row.id)}
                      className="text-xs font-medium text-red-600 hover:text-red-700"
                    >
                      Remove
                    </button>
                  ) : null}
                </div>

                <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                  <div className="shrink-0 sm:w-32">
                    <p className="mb-1.5 text-[11px] font-medium text-gray-600">Image (optional)</p>
                    {!row.imagePreview ? (
                      <label className="relative flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-white text-center hover:border-[#0F4C69] hover:bg-[#0F4C69]/5">
                        <span className="px-2 text-[11px] font-medium text-gray-500">+ Add image</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                          onChange={(e) => {
                            setVariantImage(row.id, e.target.files?.[0]);
                            e.target.value = '';
                          }}
                        />
                      </label>
                    ) : (
                      <div className="relative h-32 w-full overflow-hidden rounded-lg border border-gray-200 bg-white">
                        <img src={row.imagePreview} alt="" className="h-full w-full object-contain p-1" />
                        <button
                          type="button"
                          onClick={() => clearVariantImage(row.id)}
                          className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs text-white"
                          aria-label="Remove image"
                        >
                          ✕
                        </button>
                        <label className="absolute bottom-1 left-1 right-1 cursor-pointer rounded bg-black/50 py-0.5 text-center text-[10px] text-white">
                          Replace
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              setVariantImage(row.id, e.target.files?.[0]);
                              e.target.value = '';
                            }}
                          />
                        </label>
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1 space-y-3">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-[11px] font-medium text-gray-600">
                          Variation name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={row.name}
                          onChange={(e) => updateVariantRow(row.id, { name: e.target.value })}
                          placeholder="e.g. 220V / Model A"
                          className={inputCls(!!errors[`variant-${row.id}-name`])}
                        />
                        {errors[`variant-${row.id}-name`] ? (
                          <p className="mt-1 text-xs text-red-500">{errors[`variant-${row.id}-name`]}</p>
                        ) : null}
                      </div>
                      <div>
                        <label className="mb-1 block text-[11px] font-medium text-gray-600">
                          Price (PKR) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          min={0}
                          value={row.price}
                          onChange={(e) => updateVariantRow(row.id, { price: e.target.value })}
                          className={inputCls(!!errors[`variant-${row.id}-price`])}
                        />
                        {errors[`variant-${row.id}-price`] ? (
                          <p className="mt-1 text-xs text-red-500">{errors[`variant-${row.id}-price`]}</p>
                        ) : null}
                      </div>
                    </div>
                    <div>
                      <label className="mb-1 block text-[11px] font-medium text-gray-600">
                        Stock <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={row.stock}
                        onChange={(e) => updateVariantRow(row.id, { stock: e.target.value })}
                        className={inputCls(!!errors[`variant-${row.id}-stock`])}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-700">General description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Shared details for this spare part (fits all variations)…"
              rows={5}
              maxLength={5000}
              className={`${inputCls(false)} min-h-[7rem] resize-y`}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-700">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Heating Element for Pressure Fryer"
                className={inputCls(!!errors.name)}
              />
              {errors.name ? <p className="mt-1 text-xs text-red-500">{errors.name}</p> : null}
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-700">
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
              <p className="mt-1 text-[11px] text-gray-500">Used for shipping quotes (not shown on storefront).</p>
              {errors.weightKg ? <p className="mt-1 text-xs text-red-500">{errors.weightKg}</p> : null}
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 flex items-center justify-between gap-3 border-t border-gray-100 bg-white px-6 py-4">
          <div className="text-xs text-gray-400">{uploadStatus}</div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={saving}
              className="min-w-[120px] rounded-lg bg-[#0F4C69] px-5 py-2 text-sm font-semibold text-white hover:bg-[#0d3f59] disabled:opacity-60"
            >
              {saving ? uploadStatus || 'Saving…' : mode === 'add' ? 'Create' : 'Update'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SparePartModal;
