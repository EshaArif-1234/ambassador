'use client';

import { useState, useEffect } from 'react';
import { uploadMedia } from '@/utils/uploadMedia';
import {
  cloudinaryUrlFromPublicId,
  cloudinaryVideoThumbnail,
  normalizeMediaUrl,
  resolveProductImages,
  resolveProductVideos,
} from '@/utils/productMedia.util';
import { orderProductSpecifications } from '@/lib/productSpecifications';
import { useDashboardPermissions } from '@/hooks/useDashboardPermissions';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Category    { _id: string; title: string; status: string; }
interface MediaSlot   { url: string; file: File | null; preview: string; publicId: string; thumbnail?: string; }

export interface ProductFormData {
  name: string;
  categories: string[];
  price: string | number;
  originalPrice: string | number;
  stock: string | number;
  status?: 'active' | 'inactive';
  about: string;
  specifications: Record<string, string>;
  specificationOrder?: string[];
  images: string[];
  imagePublicIds: string[];
  videos: string[];
  videoPublicIds: string[];
  metaTitle: string;
  metaDescription: string;
  /** Marketing feature flags (multi-select) */
  features: string[];
  /** Brand tags (multi-select) */
  brands: string[];
}

export const PRODUCT_FEATURE_OPTIONS = [
  { id: 'free_shipping', label: 'Free Shipping' },
  { id: 'on_sale', label: 'On Sale' },
  { id: 'new_arrival', label: 'New Arrival' },
  { id: 'best_seller', label: 'Best Seller' },
] as const;

export const PRODUCT_BRAND_OPTIONS = [
  { id: 'ambassador', label: 'Ambassador' },
  { id: 'imported', label: 'Imported' },
] as const;

const FEATURE_ID_SET: Set<string> = new Set(PRODUCT_FEATURE_OPTIONS.map((o) => o.id));
const BRAND_ID_SET: Set<string> = new Set(PRODUCT_BRAND_OPTIONS.map((o) => o.id));

function normalizeFeaturesFromProduct(p: any): string[] {
  const raw = p?.features;
  if (!Array.isArray(raw)) return [];
  return [...new Set(raw.filter((x): x is string => typeof x === 'string' && FEATURE_ID_SET.has(x)))];
}

function normalizeBrandsFromProduct(p: any): string[] {
  const raw = p?.brands;
  if (!Array.isArray(raw)) return [];
  return [...new Set(raw.filter((x): x is string => typeof x === 'string' && BRAND_ID_SET.has(x)))];
}

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'add' | 'edit' | 'view';
  product?: any;
  onSave?: (data: ProductFormData) => Promise<void>;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const getId    = (v: any): string => (v && typeof v === 'object' && v._id) ? String(v._id) : String(v || '');
const getTitle = (v: any): string => (v && typeof v === 'object' && v.title) ? v.title : '';

const categoryIdsFromProduct = (p: any): string[] => {
  if (Array.isArray(p?.categories) && p.categories.length)
    return p.categories.map(getId).filter(Boolean);
  if (p?.category) return [getId(p.category)].filter(Boolean);
  return [];
};
const initMediaSlots = (
  urls: string[],
  pids: string[],
  count: number,
  kind: 'image' | 'video'
): MediaSlot[] =>
  Array.from({ length: count }, (_, i) => {
    const url =
      normalizeMediaUrl(urls[i]) || cloudinaryUrlFromPublicId(pids[i], kind) || '';
    return {
      url,
      file: null,
      preview: url,
      publicId: pids[i] || '',
      ...(kind === 'video' && url ? { thumbnail: cloudinaryVideoThumbnail(url) } : {}),
    };
  });

const isActiveMediaSlot = (slot: MediaSlot) => Boolean(slot.file || slot.url || slot.publicId);

function buildSpecRows(
  specs: Record<string, unknown> | null | undefined,
  productOrder?: string[] | null,
) {
  const ordered = orderProductSpecifications(
    (specs ?? {}) as Record<string, string>,
    productOrder,
  );
  return Object.entries(ordered).map(([k, v]) => ({
    id: Math.random().toString(36).slice(2),
    key: k,
    value: String(v ?? ''),
  }));
}

// ─── View Modal ───────────────────────────────────────────────────────────────

const ProductViewModal: React.FC<{ product: any; onClose: () => void }> = ({ product: p = {}, onClose }) => {
  const [activeImg, setActiveImg] = useState(0);

  const catItems = Array.isArray(p.categories) && p.categories.length
    ? p.categories
    : p.category
      ? [p.category]
      : [];
  const categoryLabels    = catItems.map((c: any) => getTitle(c) || getId(c) || '—');
  const specs  = orderProductSpecifications(
    (p.specifications || {}) as Record<string, string>,
    Array.isArray(p.specificationOrder) ? p.specificationOrder : undefined,
  ) as Record<string, unknown>;
  const imgs = resolveProductImages({
    images: p.images,
    imagePublicIds: p.imagePublicIds,
  });
  const vids = resolveProductVideos({
    videos: p.videos,
    videoPublicIds: p.videoPublicIds,
  });

  const hasDiscount = p.price != null && p.price !== '' && Number(p.price) < Number(p.originalPrice);
  const savings     = hasDiscount ? Number(p.originalPrice) - Number(p.price) : 0;
  const discountPct = hasDiscount ? Math.round((savings / Number(p.originalPrice)) * 100) : 0;

  const createdAt = p.createdAt
    ? new Date(p.createdAt).toLocaleDateString('en-PK', { day: 'numeric', month: 'long', year: 'numeric' })
    : null;

  const viewFeatures = normalizeFeaturesFromProduct(p);
  const viewBrands = normalizeBrandsFromProduct(p);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden">

        {/* ── Sticky Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#0F4C69]/10 flex items-center justify-center">
              <svg className="w-4 h-4 text-[#0F4C69]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10l8 4" />
              </svg>
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900">Product Details</h2>
              <p className="text-xs text-gray-400">Read-only · saved data</p>
            </div>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* ── Body ── */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px]">

            {/* ── LEFT COLUMN ── */}
            <div className="p-6 space-y-6 border-r border-gray-100">

              {/* Image Gallery */}
              <div>
                {/* Primary image */}
                <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                  {imgs[activeImg] ? (
                    <img
                      src={imgs[activeImg]}
                      alt={`${p.name} — image ${activeImg + 1}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                      <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-xs text-gray-400">No image uploaded</span>
                    </div>
                  )}
                  {imgs.length > 1 && (
                    <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-0.5 rounded-full">
                      {activeImg + 1} / {imgs.length}
                    </div>
                  )}
                </div>

                {/* Thumbnail strip */}
                {imgs.length > 1 && (
                  <div className="flex gap-2 mt-3">
                    {imgs.map((img, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveImg(i)}
                        className={`w-14 h-14 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${
                          i === activeImg ? 'border-[#0F4C69] shadow-md' : 'border-gray-200 hover:border-gray-400'
                        }`}
                      >
                        <img src={img} alt={`thumb-${i}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <h3 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
                  <span className="w-1 h-4 bg-[#0F4C69] rounded-full inline-block" />
                  Description
                </h3>
                {p.about ? (
                  <p className="text-sm text-gray-600 leading-relaxed">{p.about}</p>
                ) : (
                  <p className="text-sm text-gray-400 italic">No description provided.</p>
                )}
              </div>

              {/* Specifications */}
              <div>
                <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <span className="w-1 h-4 bg-[#0F4C69] rounded-full inline-block" />
                  Technical Specifications
                </h3>
                {Object.keys(specs).length === 0 ? (
                  <div className="flex items-center gap-3 py-5 px-4 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <span className="text-sm text-gray-400">No specifications added for this product.</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(specs).map(([key, val]) => (
                      <div key={key} className="flex items-start gap-3 bg-gray-50 px-3 py-2.5 rounded-lg border border-gray-100">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#0F4C69] mt-1.5 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide leading-tight">{key}</p>
                          <p className="text-sm text-gray-900 font-semibold mt-0.5 truncate">{String(val || '—')}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Videos */}
              {vids.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <span className="w-1 h-4 bg-[#0F4C69] rounded-full inline-block" />
                    Product Videos
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {vids.map((vid, i) => (
                      <video
                        key={i}
                        src={vid}
                        controls
                        className="w-full rounded-xl border border-gray-200 bg-black aspect-video object-cover"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* SEO Preview */}
              {(p.metaTitle || p.metaDescription) && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <span className="w-1 h-4 bg-[#0F4C69] rounded-full inline-block" />
                    SEO — Google Preview
                  </h3>
                  <div className="border border-gray-200 rounded-xl overflow-hidden">
                    {/* Google-style preview */}
                    <div className="bg-white px-4 py-3 border-b border-gray-100">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-4 h-4 rounded-full bg-gray-200" />
                        <span className="text-xs text-gray-500">ambassador.pk › products › {p.slug || p.name?.toLowerCase().replace(/\s+/g, '-')}</span>
                      </div>
                      <p className="text-base font-medium text-blue-700 hover:underline cursor-pointer line-clamp-1">
                        {p.metaTitle || p.name}
                      </p>
                      {p.metaDescription && (
                        <p className="text-xs text-gray-600 mt-0.5 line-clamp-2 leading-relaxed">
                          {p.metaDescription}
                        </p>
                      )}
                    </div>
                    <div className="bg-gray-50 px-4 py-2 flex items-center justify-between text-xs text-gray-400">
                      <span>Meta Title: {(p.metaTitle || p.name || '').length} chars</span>
                      {p.metaDescription && <span>Meta Desc: {p.metaDescription.length} chars</span>}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ── RIGHT COLUMN ── */}
            <div className="p-6 space-y-5 bg-gray-50/50">

              {/* Product Name + Status */}
              <div>
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h1 className="text-lg font-bold text-gray-900 leading-tight">{p.name || 'Unnamed Product'}</h1>
                  <span className={`px-2.5 py-1 text-xs font-semibold rounded-full flex-shrink-0 ${
                    p.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {p.status === 'active' ? '● Active' : '○ Inactive'}
                  </span>
                </div>
                {p.slug && (
                  <p className="text-xs text-gray-400 font-mono">{p.slug}</p>
                )}
              </div>

              {/* Pricing Card */}
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="bg-[#0F4C69] px-4 py-3">
                  <p className="text-xs text-white/70 font-medium uppercase tracking-wider mb-1">Price</p>
                  {hasDiscount ? (
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-white">PKR {Number(p.price).toLocaleString()}</span>
                      <span className="text-sm text-white/60 line-through">PKR {Number(p.originalPrice).toLocaleString()}</span>
                    </div>
                  ) : (
                    <span className="text-2xl font-bold text-white">PKR {Number(p.originalPrice || 0).toLocaleString()}</span>
                  )}
                </div>
                <div className="px-4 py-3 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Original Price</span>
                    <span className="font-medium text-gray-800">PKR {Number(p.originalPrice || 0).toLocaleString()}</span>
                  </div>
                  {hasDiscount ? (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Discounted Price</span>
                        <span className="font-semibold text-orange-500">PKR {Number(p.price).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between pt-1 border-t border-gray-100">
                        <span className="text-gray-500">You Save</span>
                        <span className="font-semibold text-green-600">
                          PKR {savings.toLocaleString()} ({discountPct}% off)
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Discount</span>
                      <span className="text-gray-400 text-xs italic">No discount</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Stock */}
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-2">Stock & Availability</p>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    Number(p.stock) === 0 ? 'bg-red-50' : 'bg-green-50'
                  }`}>
                    <svg className={`w-5 h-5 ${Number(p.stock) === 0 ? 'text-red-500' : 'text-green-600'}`}
                      fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10l8 4" />
                    </svg>
                  </div>
                  <div>
                    <p className={`text-lg font-bold ${Number(p.stock) === 0 ? 'text-red-600' : 'text-gray-900'}`}>
                      {p.stock ?? 0} units
                    </p>
                    <p className="text-xs text-gray-400">
                      {Number(p.stock) === 0 ? 'Out of stock' : Number(p.stock) < 10 ? 'Low stock' : 'In stock'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Category Info */}
              <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
                <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Classification</p>
                <div>
                  <span className="text-sm text-gray-500 block mb-1.5">Categories</span>
                  <div className="flex flex-wrap gap-1 justify-end">
                    {categoryLabels.length ? categoryLabels.map((t: string, i: number) => (
                      <span key={i} className="px-2.5 py-0.5 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">{t}</span>
                    )) : <span className="text-xs text-gray-400">—</span>}
                  </div>
                </div>
              </div>

              {/* Features & brand */}
              <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
                <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Features & brand</p>
                <div>
                  <span className="text-sm text-gray-500 block mb-1.5">Features</span>
                  <div className="flex flex-wrap gap-1 justify-end">
                    {viewFeatures.length ? viewFeatures.map((id) => {
                      const label = PRODUCT_FEATURE_OPTIONS.find((o) => o.id === id)?.label ?? id;
                      return (
                        <span key={id} className="px-2.5 py-0.5 bg-orange-50 text-[#E36630] text-xs font-medium rounded-full">
                          {label}
                        </span>
                      );
                    }) : <span className="text-xs text-gray-400">None selected</span>}
                  </div>
                </div>
                <div>
                  <span className="text-sm text-gray-500 block mb-1.5">Brand</span>
                  <div className="flex flex-wrap gap-1 justify-end">
                    {viewBrands.length ? viewBrands.map((id) => {
                      const label = PRODUCT_BRAND_OPTIONS.find((o) => o.id === id)?.label ?? id;
                      return (
                        <span key={id} className="px-2.5 py-0.5 bg-[#0F4C69]/10 text-[#0F4C69] text-xs font-medium rounded-full">
                          {label}
                        </span>
                      );
                    }) : <span className="text-xs text-gray-400">None selected</span>}
                  </div>
                </div>
              </div>

              {/* Media Count */}
              <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-2">
                <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">Media</p>
                <div className="flex gap-3">
                  <div className="flex-1 flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01" />
                    </svg>
                    <span className="text-sm font-semibold text-gray-700">{imgs.length}</span>
                    <span className="text-xs text-gray-400">image{imgs.length !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex-1 flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14" />
                    </svg>
                    <span className="text-sm font-semibold text-gray-700">{vids.length}</span>
                    <span className="text-xs text-gray-400">video{vids.length !== 1 ? 's' : ''}</span>
                  </div>
                </div>
              </div>

              {/* Dates */}
              {createdAt && (
                <div className="flex items-center gap-2 text-xs text-gray-400 px-1">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Added {createdAt}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="flex justify-end px-6 py-4 border-t border-gray-100 flex-shrink-0 bg-white">
          <button onClick={onClose}
            className="px-5 py-2 text-sm font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Component ────────────────────────────────────────────────────────────────

const ProductModal: React.FC<ProductModalProps> = ({ isOpen, onClose, mode, product, onSave }) => {
  const { canChangeStatus } = useDashboardPermissions();

  // ── Data ──
  const [categories,    setCategories]    = useState<Category[]>([]);

  // ── Media: 3 image slots + 2 video slots ──
  const [imageSlots, setImageSlots] = useState<MediaSlot[]>(() =>
    initMediaSlots(product?.images || [], product?.imagePublicIds || [], 3, 'image')
  );
  const [videoSlots, setVideoSlots] = useState<MediaSlot[]>(() =>
    initMediaSlots(product?.videos || [], product?.videoPublicIds || [], 2, 'video')
  );

  // ── Form ──
  const [form, setForm] = useState({
    name:            product?.name            || '',
    categoryIds:     categoryIdsFromProduct(product),
    price:           product?.price           ?? '',
    originalPrice:   product?.originalPrice   || '',
    stock:           product?.stock           ?? 0,
    status:          (product?.status || 'active') as 'active' | 'inactive',
    about:           product?.about           || '',
    specifications:  (product?.specifications || {}) as Record<string, string>,
    metaTitle:       product?.metaTitle       || '',
    metaDescription: product?.metaDescription || '',
    features:        normalizeFeaturesFromProduct(product),
    brands:          normalizeBrandsFromProduct(product),
  });

  // ── Specs ──
  const [specRows, setSpecRows] = useState<{ id: string; key: string; value: string }[]>(() =>
    buildSpecRows(product?.specifications as Record<string, unknown>, product?.specificationOrder),
  );

  // ── UI state ──
  const [errors,       setErrors]       = useState<Record<string, string>>({});
  const [saving,       setSaving]       = useState(false);
  // key: `img-0`, `img-1`, `vid-0` … → 0–100 progress during upload
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [uploadStatus, setUploadStatus] = useState('');
  const [productCategoryFilter,    setProductCategoryFilter]    = useState('');
  const [specDragId, setSpecDragId] = useState<string | null>(null);

  // ── Fetch categories (add/edit only) ──
  useEffect(() => {
    if (!isOpen || mode === 'view') return;
    fetch('/api/admin/categories', { credentials: 'include' })
      .then(r => r.json())
      .then(d => { if (d.success) setCategories(d.data); });
  }, [isOpen, mode]);

  // ── Reset form when opening add/edit or switching product ──
  useEffect(() => {
    if (!isOpen || mode === 'view') return;
    const p = product;
    setProductCategoryFilter('');
    setForm({
      name: p?.name ?? '',
      categoryIds: categoryIdsFromProduct(p),
      price: p?.price ?? '',
      originalPrice: p?.originalPrice ?? '',
      stock: p?.stock ?? 0,
      status: (p?.status || 'active') as 'active' | 'inactive',
      about: p?.about ?? '',
      specifications: (p?.specifications || {}) as Record<string, string>,
      metaTitle: p?.metaTitle ?? '',
      metaDescription: p?.metaDescription ?? '',
      features: normalizeFeaturesFromProduct(p),
      brands: normalizeBrandsFromProduct(p),
    });
    setSpecRows(buildSpecRows(p?.specifications as Record<string, unknown>, p?.specificationOrder));
    setImageSlots(initMediaSlots(p?.images || [], p?.imagePublicIds || [], 3, 'image'));
    setVideoSlots(initMediaSlots(p?.videos || [], p?.videoPublicIds || [], 2, 'video'));
    setErrors({});
  }, [isOpen, mode, product?._id]);

  const toggleProductCategory = (id: string) => {
    setForm(f => ({
      ...f,
      categoryIds: f.categoryIds.includes(id)
        ? f.categoryIds.filter(x => x !== id)
        : [...f.categoryIds, id],
    }));
  };

  const toggleFormFeature = (id: (typeof PRODUCT_FEATURE_OPTIONS)[number]['id']) => {
    setForm((f) => ({
      ...f,
      features: f.features.includes(id) ? f.features.filter((x) => x !== id) : [...f.features, id],
    }));
  };

  const toggleFormBrand = (id: (typeof PRODUCT_BRAND_OPTIONS)[number]['id']) => {
    setForm((f) => ({
      ...f,
      brands: f.brands.includes(id) ? f.brands.filter((x) => x !== id) : [...f.brands, id],
    }));
  };

  // ── Spec helpers ──
  const syncSpecs = (rows: typeof specRows) => {
    const specs: Record<string, string> = {};
    rows.forEach(r => { if (r.key.trim()) specs[r.key.trim()] = r.value; });
    setForm(f => ({ ...f, specifications: specs }));
  };
  const addSpec    = () => setSpecRows(p => [...p, { id: Date.now().toString(), key: '', value: '' }]);
  const removeSpec = (id: string) => setSpecRows(p => { const u = p.filter(r => r.id !== id); syncSpecs(u); return u; });
  const updateSpec = (id: string, field: 'key' | 'value', val: string) =>
    setSpecRows(p => { const u = p.map(r => r.id === id ? { ...r, [field]: val } : r); syncSpecs(u); return u; });

  const handleSpecDragStart = (id: string) => setSpecDragId(id);
  const handleSpecDragOver = (e: React.DragEvent) => e.preventDefault();
  const handleSpecDrop = (targetId: string) => {
    if (!specDragId || specDragId === targetId) return;
    setSpecRows((prev) => {
      const fromIdx = prev.findIndex((r) => r.id === specDragId);
      const toIdx = prev.findIndex((r) => r.id === targetId);
      if (fromIdx < 0 || toIdx < 0) return prev;
      const next = [...prev];
      const [moved] = next.splice(fromIdx, 1);
      next.splice(toIdx, 0, moved);
      syncSpecs(next);
      return next;
    });
    setSpecDragId(null);
  };

  // ── Media helpers ──
  const setImageFile = (index: number, file: File) =>
    setImageSlots(p => p.map((s, i) => i === index ? { ...s, file, preview: URL.createObjectURL(file) } : s));
  const clearImageSlot = (index: number) =>
    setImageSlots(p => p.map((s, i) => i === index ? { url: '', file: null, preview: '', publicId: '' } : s));

  const generateVideoThumbnail = (file: File): Promise<string> =>
    new Promise((resolve) => {
      const video    = document.createElement('video');
      const objectUrl = URL.createObjectURL(file);
      video.src       = objectUrl;
      video.muted     = true;
      video.playsInline = true;
      video.crossOrigin = 'anonymous';

      const capture = () => {
        const canvas = document.createElement('canvas');
        canvas.width  = 320;
        canvas.height = 180;
        const ctx = canvas.getContext('2d');
        if (ctx) ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(objectUrl);
        resolve(canvas.toDataURL('image/jpeg', 0.85));
      };

      video.addEventListener('seeked',  capture, { once: true });
      video.addEventListener('error',   () => { URL.revokeObjectURL(objectUrl); resolve(''); }, { once: true });
      video.addEventListener('loadedmetadata', () => { video.currentTime = 0.5; }, { once: true });
      video.load();
    });

  const setVideoFile = async (index: number, file: File) => {
    const preview   = URL.createObjectURL(file);
    const thumbnail = await generateVideoThumbnail(file);
    setVideoSlots(p => p.map((s, i) => i === index ? { ...s, file, preview, thumbnail } : s));
  };
  const clearVideoSlot = (index: number) =>
    setVideoSlots(p => p.map((s, i) => i === index ? { url: '', file: null, preview: '', publicId: '', thumbnail: '' } : s));

  // ── Upload one media slot with progress tracking ──
  const uploadSlot = async (
    slot: MediaSlot,
    key: string,
    kind: 'image' | 'video'
  ): Promise<{ url: string; publicId: string }> => {
    if (!slot.file) {
      const url = slot.url || cloudinaryUrlFromPublicId(slot.publicId, kind) || '';
      return { url, publicId: slot.publicId };
    }
    setUploadProgress(p => ({ ...p, [key]: 0 }));
    const result = await uploadMedia(slot.file, (pct) =>
      setUploadProgress(p => ({ ...p, [key]: pct }))
    );
    setUploadProgress(p => { const n = { ...p }; delete n[key]; return n; });
    return result;
  };

  // ── Validate ──
  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim())                                      e.name             = 'Product name is required';
    if (!form.categoryIds.length)                               e.categoryIds    = 'Select at least one category';
    if (!form.originalPrice || Number(form.originalPrice) <= 0) e.originalPrice = 'Original price is required';
    if (form.price !== '' && Number(form.price) < 0)            e.price         = 'Discounted price cannot be negative';
    if (form.price !== '' && Number(form.originalPrice) > 0 && Number(form.price) > Number(form.originalPrice))
                                                                e.price         = 'Discounted price cannot exceed original price';
    if (!form.about.trim())                                     e.about         = 'Product description is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Submit ──
  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const activeImages = imageSlots.filter(isActiveMediaSlot);
      const activeVideos = videoSlots.filter(isActiveMediaSlot);

      const newImageCount = activeImages.filter(s => s.file).length;
      const newVideoCount = activeVideos.filter(s => s.file).length;
      const newTotal      = newImageCount + newVideoCount;

      if (newTotal > 0) {
        setUploadStatus(
          `Uploading ${newImageCount > 0 ? `${newImageCount} image${newImageCount > 1 ? 's' : ''}` : ''}${newImageCount > 0 && newVideoCount > 0 ? ' & ' : ''}${newVideoCount > 0 ? `${newVideoCount} video${newVideoCount > 1 ? 's' : ''}` : ''}…`
        );
      }

      // Upload all images and videos in parallel, tracking per-slot progress
      const [imageResults, videoResults] = await Promise.all([
        Promise.all(activeImages.map((slot, i) => uploadSlot(slot, `img-${i}`, 'image'))),
        Promise.all(activeVideos.map((slot, i) => uploadSlot(slot, `vid-${i}`, 'video'))),
      ]);

      setUploadStatus('');

      await onSave?.({
        name:            form.name.trim(),
        categories:      form.categoryIds,
        price:           form.price,
        originalPrice:   form.originalPrice,
        stock:           form.stock,
        ...(canChangeStatus
          ? { status: form.status }
          : mode === 'add'
            ? { status: 'active' as const }
            : {}),
        about:           form.about.trim(),
        specifications:  form.specifications,
        specificationOrder: specRows.map((r) => r.key.trim()).filter(Boolean),
        images:          imageResults.map(r => r.url),
        imagePublicIds:  imageResults.map(r => r.publicId),
        videos:          videoResults.map(r => r.url),
        videoPublicIds:  videoResults.map(r => r.publicId),
        metaTitle:       form.metaTitle.trim(),
        metaDescription: form.metaDescription.trim(),
        features:        form.features,
        brands:          form.brands,
      });
      onClose();
    } catch (err) {
      setErrors({ submit: (err as Error).message });
    } finally {
      setSaving(false);
      setUploadStatus('');
    }
  };

  if (!isOpen) return null;

  // ─── View Mode ──────────────────────────────────────────────────────────────
  if (mode === 'view') {
    return <ProductViewModal product={product} onClose={onClose} />;
  }

  // ─── Add / Edit Mode ────────────────────────────────────────────────────────

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {mode === 'add' ? 'Add New Product' : 'Edit Product'}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {mode === 'add' ? 'Fill in the details to list a new product' : 'Update the saved product information'}
            </p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors text-xl leading-none">✕</button>
        </div>

        <div className="p-6 space-y-5">

          {/* Global submit error */}
          {errors.submit && (
            <div className="px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
              {errors.submit}
            </div>
          )}

          {/* ── Media Upload: 3 images + 2 videos ── */}
          <div className="bg-gray-50 p-4 rounded-xl">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Media Upload</h3>

            <div className="flex gap-6">
              {/* ── Images (3 slots) ── */}
              <div className="flex-1">
                <p className="text-xs font-medium text-gray-600 mb-2">Product Images <span className="text-gray-400">(max 3)</span></p>

                {/* Drop zone */}
                <div className="relative flex items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#0F4C69] hover:bg-[#0F4C69]/5 transition-colors bg-white">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={e => {
                      const files = Array.from(e.target.files || []);
                      files.forEach(file => {
                        const emptyIdx = imageSlots.findIndex(s => !s.preview);
                        if (emptyIdx !== -1) setImageFile(emptyIdx, file);
                      });
                      e.target.value = '';
                    }}
                  />
                  <div className="flex flex-col items-center justify-center pointer-events-none">
                    <svg className="w-7 h-7 text-gray-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-xs text-gray-500 font-medium">+ Add Images</span>
                    <span className="text-xs text-gray-400">JPEG · PNG · WebP · max 5 MB</span>
                  </div>
                </div>

                {/* Image thumbnails */}
                {imageSlots.some(s => s.preview) && (
                  <div className="mt-3 flex gap-2">
                    {imageSlots.map((slot, i) => slot.preview ? (
                      <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-200 group flex-shrink-0">
                        <img src={slot.preview} alt={`img-${i}`} className="w-full h-full object-cover" />
                        {uploadProgress[`img-${i}`] != null && (
                          <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center">
                            <span className="text-white text-[10px] font-bold">{uploadProgress[`img-${i}`]}%</span>
                            <div className="w-10 h-1 mt-1 bg-white/30 rounded-full overflow-hidden">
                              <div className="h-full bg-[#E36630] rounded-full transition-all duration-150" style={{ width: `${uploadProgress[`img-${i}`]}%` }} />
                            </div>
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => clearImageSlot(i)}
                          className="absolute top-0.5 right-0.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                        >✕</button>
                      </div>
                    ) : null)}
                  </div>
                )}
              </div>

              {/* ── Videos (2 slots) ── */}
              <div className="flex-1">
                <p className="text-xs font-medium text-gray-600 mb-2">Product Videos <span className="text-gray-400">(max 2)</span></p>

                {/* Drop zone */}
                <div className="relative flex items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#0F4C69] hover:bg-[#0F4C69]/5 transition-colors bg-white">
                  <input
                    type="file"
                    multiple
                    accept="video/*"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={async e => {
                      const files = Array.from(e.target.files || []);
                      for (const file of files) {
                        const emptyIdx = videoSlots.findIndex(s => !s.preview);
                        if (emptyIdx !== -1) await setVideoFile(emptyIdx, file);
                      }
                      e.target.value = '';
                    }}
                  />
                  <div className="flex flex-col items-center justify-center pointer-events-none">
                    <svg className="w-7 h-7 text-gray-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <span className="text-xs text-gray-500 font-medium">+ Add Videos</span>
                    <span className="text-xs text-gray-400">MP4 · WebM · MOV · max 50 MB</span>
                  </div>
                </div>

                {/* Video thumbnails */}
                {videoSlots.some(s => s.preview) && (
                  <div className="mt-3 flex gap-2">
                    {videoSlots.map((slot, i) => {
                      /* For existing Cloudinary videos derive thumbnail from the URL */
                      const cloudinaryThumb = slot.url && !slot.thumbnail
                        ? slot.url.replace('/upload/', '/upload/so_0,w_320,h_180,c_fill,f_jpg/')
                            .replace(/\.[^.]+$/, '.jpg')
                        : null;
                      const thumbSrc = slot.thumbnail || cloudinaryThumb || null;

                      return slot.preview ? (
                        <div key={i} className="relative w-20 h-14 rounded-lg overflow-hidden border border-gray-200 bg-gray-900 flex items-center justify-center group flex-shrink-0">
                          {thumbSrc ? (
                            <img
                              src={thumbSrc}
                              alt={`video-thumb-${i}`}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          )}
                          {/* Upload progress overlay */}
                          {uploadProgress[`vid-${i}`] != null ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60">
                              <span className="text-white text-[10px] font-bold">{uploadProgress[`vid-${i}`]}%</span>
                              <div className="w-12 h-1 mt-1 bg-white/30 rounded-full overflow-hidden">
                                <div className="h-full bg-[#E36630] rounded-full transition-all duration-150" style={{ width: `${uploadProgress[`vid-${i}`]}%` }} />
                              </div>
                            </div>
                          ) : (
                            /* Play overlay */
                            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                              <div className="w-7 h-7 rounded-full bg-white/80 flex items-center justify-center shadow">
                                <svg className="w-3.5 h-3.5 text-gray-800 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M8 5v14l11-7z" />
                                </svg>
                              </div>
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={() => clearVideoSlot(i)}
                            className="absolute top-0.5 right-0.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 z-10"
                          >✕</button>
                        </div>
                      ) : null;
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Basic Info ── */}
          <div className="bg-gray-50 p-4 rounded-xl space-y-3">
            <h3 className="text-sm font-semibold text-gray-700">Basic Information</h3>

            {/* Name */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Product Name <span className="text-red-500">*</span></label>
              <input type="text" value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Stainless Steel Commercial Fryer"
                className={inputCls(!!errors.name)} />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            {/* Categories */}
            <div>
              <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
                <label className="text-xs font-medium text-gray-600">
                  Categories <span className="text-red-500">*</span>
                  <span className="font-normal text-gray-400"> · multi</span>
                </label>
                {form.categoryIds.length > 0 && (
                  <span className="rounded-full bg-[#0F4C69]/10 px-2 py-0.5 text-[11px] font-medium text-[#0F4C69]">
                    {form.categoryIds.length} selected
                  </span>
                )}
              </div>
              {categories.length > 0 && (
                <input
                  type="search"
                  value={productCategoryFilter}
                  onChange={(e) => setProductCategoryFilter(e.target.value)}
                  placeholder="Filter…"
                  className="mb-2 w-full rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs outline-none placeholder:text-gray-400 focus:border-[#0F4C69]/40 focus:ring-1 focus:ring-[#0F4C69]/20"
                />
              )}
              <div
                className={`max-h-[min(14rem,34svh)] overflow-y-auto overscroll-contain rounded-lg border bg-white ${
                  errors.categoryIds ? 'border-red-400' : 'border-gray-200'
                }`}
              >
                {categories.length === 0 ? (
                  <p className="px-3 py-4 text-center text-xs text-gray-400">No categories.</p>
                ) : (
                  (() => {
                    const q = productCategoryFilter.trim().toLowerCase();
                    const filtered = q
                      ? categories.filter((c) => c.title.toLowerCase().includes(q))
                      : categories;
                    if (!filtered.length) {
                      return <p className="px-3 py-4 text-center text-xs text-gray-400">No matches.</p>;
                    }
                    return (
                      <ul className="grid grid-cols-1 gap-0.5 p-1.5 sm:grid-cols-2">
                        {filtered.map((c) => (
                          <li key={c._id}>
                            <label className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 text-xs hover:bg-[#0F4C69]/5 sm:text-[13px] sm:py-1.5">
                              <input
                                type="checkbox"
                                checked={form.categoryIds.includes(c._id)}
                                onChange={() => toggleProductCategory(c._id)}
                                className="h-3.5 w-3.5 shrink-0 rounded border-gray-400 text-[#0F4C69] focus:ring-[#0F4C69]/30"
                              />
                              <span className="min-w-0 text-gray-400 truncate" title={c.title}>
                                {c.title}
                              </span>
                            </label>
                          </li>
                        ))}
                      </ul>
                    );
                  })()
                )}
              </div>
              {errors.categoryIds && <p className="mt-1 text-xs text-red-500">{errors.categoryIds}</p>}
            </div>

            {/* Features & brand (multi-select) */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-xs font-medium text-gray-600">Features</label>
                <p className="mb-2 text-[11px] text-gray-400">Select any that apply</p>
                <ul className="space-y-1.5 rounded-lg border border-gray-200 bg-white p-2">
                  {PRODUCT_FEATURE_OPTIONS.map((opt) => (
                    <li key={opt.id}>
                      <label className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-xs hover:bg-[#0F4C69]/5 sm:text-[13px]">
                        <input
                          type="checkbox"
                          checked={form.features.includes(opt.id)}
                          onChange={() => toggleFormFeature(opt.id)}
                          className="h-3.5 w-3.5 shrink-0 rounded border-gray-300 text-[#0F4C69] focus:ring-[#0F4C69]/30"
                        />
                        <span className="text-gray-400">{opt.label}</span>
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">
                  Brand <span className="text-red-400">*</span>
                </label>
                <p className="mb-2 text-[11px] text-gray-400">Select one or both</p>
                <div className="flex flex-col gap-2">
                  {PRODUCT_BRAND_OPTIONS.map((opt) => {
                    const selected = form.brands.includes(opt.id);
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => toggleFormBrand(opt.id)}
                        className={`flex items-center gap-3 rounded-xl border-2 px-3 py-2.5 text-left transition-all duration-150 ${
                          selected
                            ? 'border-[#E36630] bg-[#E36630]/8 shadow-sm'
                            : 'border-gray-200 bg-white hover:border-[#E36630]/50 hover:bg-gray-50'
                        }`}
                      >
                        <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border-2 transition-colors ${
                          selected ? 'border-[#E36630] bg-[#E36630]' : 'border-gray-300'
                        }`}>
                          {selected && (
                            <svg className="h-2.5 w-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </span>
                        <span className={`text-sm font-semibold ${selected ? 'text-[#E36630]' : 'text-gray-700'}`}>
                          {opt.label}
                        </span>
                        {selected && (
                          <span className="ml-auto rounded-full bg-[#E36630] px-1.5 py-0.5 text-[9px] font-bold text-white">✓</span>
                        )}
                      </button>
                    );
                  })}
                </div>
                {form.brands.length === 0 && (
                  <p className="mt-1.5 text-[11px] text-amber-500 font-medium">⚠ Please select at least one brand so it appears in filters</p>
                )}
              </div>
            </div>
          </div>

          {/* ── Pricing & Stock ── */}
          <div className="bg-gray-50 p-4 rounded-xl space-y-3">
            <h3 className="text-sm font-semibold text-gray-700">Pricing & Stock</h3>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Original Price (PKR) <span className="text-red-500">*</span>
                </label>
                <input type="number" min={0} value={form.originalPrice}
                  onChange={e => setForm(f => ({ ...f, originalPrice: e.target.value }))}
                  placeholder="55000"
                  className={inputCls(!!errors.originalPrice)} />
                {errors.originalPrice && <p className="text-red-500 text-xs mt-1">{errors.originalPrice}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Discounted Price (PKR)
                  <span className="ml-1 text-gray-400 font-normal">(optional)</span>
                </label>
                <input type="number" min={0} value={form.price}
                  onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                  placeholder="Leave blank if no discount"
                  className={inputCls(!!errors.price)} />
                {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Stock (units)</label>
                <input type="number" min={0} value={form.stock}
                  onChange={e => setForm(f => ({ ...f, stock: e.target.value }))}
                  placeholder="0"
                  className={inputCls(false)} />
              </div>
            </div>
          </div>

          {/* ── Description ── */}
          <div className="bg-gray-50 p-4 rounded-xl">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea rows={4} value={form.about}
              onChange={e => setForm(f => ({ ...f, about: e.target.value }))}
              placeholder="Describe the product — features, use cases, highlights…"
              className={inputCls(!!errors.about)} />
            {errors.about && <p className="text-red-500 text-xs mt-1">{errors.about}</p>}
          </div>

          {/* ── Specifications ── */}
          <div className="bg-gray-50 p-4 rounded-xl">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-semibold text-gray-700">Technical Specifications</h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Add specs for this product. Drag rows to set the order shown on the product page.
                </p>
              </div>
              <button type="button" onClick={addSpec}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-[#0F4C69] text-white rounded-lg hover:bg-[#0d3f59] transition-colors">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
                Add Spec
              </button>
            </div>

            {specRows.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-7 border-2 border-dashed border-gray-200 rounded-xl bg-white">
                <svg className="w-7 h-7 text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p className="text-sm text-gray-400">No specifications yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="grid grid-cols-[28px_1fr_1fr_32px] gap-2 px-1">
                  <span aria-hidden />
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Name</span>
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Value</span>
                  <span />
                </div>
                {specRows.map(row => (
                  <div
                    key={row.id}
                    onDragOver={handleSpecDragOver}
                    onDrop={() => handleSpecDrop(row.id)}
                    className={`grid grid-cols-[28px_1fr_1fr_32px] gap-2 items-center bg-white p-2 rounded-lg border border-gray-200 transition-opacity ${
                      specDragId === row.id ? 'opacity-50' : ''
                    }`}
                  >
                    <span
                      draggable
                      onDragStart={() => handleSpecDragStart(row.id)}
                      onDragEnd={() => setSpecDragId(null)}
                      className="flex h-8 w-7 cursor-grab items-center justify-center text-gray-400 active:cursor-grabbing"
                      title="Drag to reorder"
                      aria-label="Drag to reorder"
                    >
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M7 2a2 2 0 11-.001 4.001A2 2 0 017 2zm0 6a2 2 0 11-.001 4.001A2 2 0 017 8zm0 6a2 2 0 11-.001 4.001A2 2 0 017 14zm6-8a2 2 0 11-.001 4.001A2 2 0 0113 6zm0 2a2 2 0 11-.001 4.001A2 2 0 0113 8zm0 6a2 2 0 11-.001 4.001A2 2 0 0113 14z" />
                      </svg>
                    </span>
                    <input type="text" value={row.key}
                      onChange={e => updateSpec(row.id, 'key', e.target.value)}
                      placeholder="e.g. Material"
                      draggable={false}
                      className={inputCls(false) + ' text-xs cursor-text'} />
                    <input type="text" value={row.value}
                      onChange={e => updateSpec(row.id, 'value', e.target.value)}
                      placeholder="e.g. Stainless Steel"
                      draggable={false}
                      className={inputCls(false) + ' text-xs cursor-text'} />
                    <button type="button" onClick={() => removeSpec(row.id)}
                      draggable={false}
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))}
                <p className="text-xs text-gray-400 pt-1">{specRows.length} spec{specRows.length !== 1 ? 's' : ''} added</p>
              </div>
            )}
          </div>

          {/* ── SEO ── */}
          <div className="bg-gray-50 p-4 rounded-xl space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <h3 className="text-sm font-semibold text-gray-700">SEO</h3>
              <span className="text-xs text-gray-400 font-normal">— optional, improves search ranking</span>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-medium text-gray-600">Meta Title</label>
                <span className={`text-xs ${form.metaTitle.length > 140 ? 'text-red-500' : 'text-gray-400'}`}>
                  {form.metaTitle.length} / 160
                </span>
              </div>
              <input
                type="text"
                value={form.metaTitle}
                maxLength={160}
                onChange={e => setForm(f => ({ ...f, metaTitle: e.target.value }))}
                placeholder="e.g. Buy Stainless Steel Commercial Fryer — Ambassador"
                className={inputCls(false)}
              />
              <p className="text-xs text-gray-400 mt-1">
                Shown as the page title in Google results. Leave blank to use the product name.
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-medium text-gray-600">Meta Description</label>
                <span className={`text-xs ${form.metaDescription.length > 290 ? 'text-red-500' : 'text-gray-400'}`}>
                  {form.metaDescription.length} / 320
                </span>
              </div>
              <textarea
                rows={3}
                value={form.metaDescription}
                maxLength={320}
                onChange={e => setForm(f => ({ ...f, metaDescription: e.target.value }))}
                placeholder="e.g. High-capacity commercial fryer ideal for restaurants — durable stainless steel, fast heat-up, easy clean."
                className={inputCls(false)}
              />
              <p className="text-xs text-gray-400 mt-1">
                Shown below the title in Google results. Aim for 120–160 characters.
              </p>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 sticky bottom-0 bg-white">
          <div className="text-xs text-gray-400">{uploadStatus}</div>
          <div className="flex gap-3">
            <button onClick={onClose} disabled={saving}
              className="px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50">
              Cancel
            </button>
            <button onClick={handleSubmit} disabled={saving}
              className="px-5 py-2 text-sm bg-[#0F4C69] text-white rounded-lg hover:bg-[#0d3f59] transition-colors disabled:opacity-60 min-w-[140px] text-center">
              {saving
                ? (uploadStatus || 'Saving…')
                : mode === 'add' ? 'Add Product' : 'Update Product'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

// ─── Input class helper ───────────────────────────────────────────────────────

const inputCls = (hasError: boolean) =>
  `w-full px-3 py-2 border rounded-lg text-sm text-gray-900 outline-none transition-shadow focus:ring-2 focus:ring-[#0F4C69]/25 focus:border-[#0F4C69] ${hasError ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white'}`;

export default ProductModal;
