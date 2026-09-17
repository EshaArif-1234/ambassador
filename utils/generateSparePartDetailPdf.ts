import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { resolveProductImages } from '@/utils/productMedia.util';

const PDF_MARGIN = 14;
const PDF_LEFT_COL_MM = 110;
const PDF_IMAGE_HEIGHT_MM = PDF_LEFT_COL_MM * 0.75;
const PDF_RIGHT_COL_X = 128;
const PDF_RIGHT_COL_W = 62;
const PDF_PAGE_BOTTOM = 285;

type JsPdfWithAutoTable = jsPDF & { lastAutoTable?: { finalY: number } };

export type SparePartDetailExport = {
  name: string;
  slug?: string;
  status: string;
  price: number;
  stock: number;
  weightKg?: number;
  description: string;
  image?: string;
  variants: { name: string; price: number; stock: number }[];
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatMoney(amount: number) {
  return `PKR ${amount.toLocaleString('en-PK')}`;
}

async function loadImage(url: string): Promise<string | null> {
  if (typeof window === 'undefined') return null;
  try {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    const loaded = await new Promise<HTMLImageElement | null>((resolve) => {
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = url;
    });
    if (!loaded?.naturalWidth) return null;
    const maxSide = 1200;
    const scale = Math.min(1, maxSide / Math.max(loaded.naturalWidth, loaded.naturalHeight));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(loaded.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(loaded.naturalHeight * scale));
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.drawImage(loaded, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.9);
  } catch {
    return null;
  }
}

function variantsTableHtml(variants: SparePartDetailExport['variants']): string {
  if (!variants.length) return '';
  const rows = variants
    .map(
      (v) =>
        `<tr>
          <td>${escapeHtml(v.name)}</td>
          <td>${escapeHtml(formatMoney(v.price))}</td>
          <td>${escapeHtml(String(v.stock))}</td>
        </tr>`,
    )
    .join('');
  return `<table class="variant-table">
    <thead><tr><th>Name</th><th>Price</th><th>Stock</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>`;
}

function buildPrintHtml(part: SparePartDetailExport): string {
  const statusClass = part.status === 'Active' ? 'badge-active' : 'badge-inactive';
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(part.name)} — Spare Part</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: Arial, sans-serif; color: #1f2937; margin: 20px; font-size: 13px; line-height: 1.5; background: #fffdf8; }
    .book { border: 3px double #0F4C69; padding: 20px 24px; max-width: 980px; margin: 0 auto; box-shadow: inset 0 0 0 1px #E36630; }
    .layout { display: grid; grid-template-columns: 1fr 340px; gap: 24px; align-items: start; }
    .section-title { font-size: 14px; font-weight: 700; color: #111827; margin: 0 0 10px; display: flex; align-items: center; gap: 8px; }
    .section-title span { width: 4px; height: 16px; background: #0F4C69; border-radius: 999px; display: inline-block; }
    .image-wrap { width: 100%; aspect-ratio: 4 / 3; border-radius: 12px; overflow: hidden; border: 1px solid #e5e7eb; background: #ffffff; }
    .image-wrap img { width: 100%; height: 100%; object-fit: contain; display: block; background: #fff; }
    .right { background: #fafafa; padding: 20px; border-radius: 12px; }
    .name { font-size: 18px; font-weight: 700; color: #111827; margin: 0; }
    .slug { font-size: 11px; color: #9ca3af; font-family: monospace; margin-top: 4px; word-break: break-all; }
    .badge { display: inline-block; padding: 4px 10px; border-radius: 999px; font-size: 11px; font-weight: 600; margin-top: 8px; }
    .badge-active { background: #dcfce7; color: #166534; }
    .badge-inactive { background: #e5e7eb; color: #4b5563; }
    .price-card { border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; margin-top: 16px; }
    .price-head { background: #0F4C69; color: white; padding: 12px 16px; }
    .price-head .label { font-size: 11px; opacity: 0.75; text-transform: uppercase; letter-spacing: 0.08em; }
    .price-head .amount { font-size: 24px; font-weight: 700; margin-top: 4px; }
    .meta-row { display: flex; justify-content: space-between; margin-top: 12px; font-size: 13px; }
    .meta-label { color: #6b7280; }
    .block { margin-top: 24px; }
    .muted { color: #6b7280; }
    .variant-table { width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 8px; }
    .variant-table th, .variant-table td { border: 1px solid #d1d5db; padding: 8px 10px; text-align: left; }
    .variant-table th { background: #f3f4f6; font-weight: 600; }
    @media print { body { margin: 10px; background: white; } }
    @media (max-width: 900px) { .layout { grid-template-columns: 1fr; } }
  </style>
</head>
<body>
  <div class="book">
    <h1 style="font-size:20px;color:#0F4C69;margin:0 0 4px;">${escapeHtml(part.name)}</h1>
    <p class="muted" style="margin:0 0 20px;font-size:12px;">Ambassador Commercial Kitchen Equipment · Spare Part Details</p>

    <div class="layout">
      <div>
        <div class="image-wrap">
          ${
            part.image
              ? `<img src="${escapeHtml(part.image)}" alt="${escapeHtml(part.name)}" />`
              : '<div style="height:100%;display:flex;align-items:center;justify-content:center;color:#9ca3af;">No image</div>'
          }
        </div>

        <div class="block">
          <h2 class="section-title"><span></span>Description</h2>
          <p class="muted" style="margin:0;white-space:pre-wrap;">${escapeHtml(part.description || 'No description provided.')}</p>
        </div>

        ${
          part.variants.length
            ? `<div class="block">
                <h2 class="section-title"><span></span>Variants</h2>
                ${variantsTableHtml(part.variants)}
              </div>`
            : ''
        }
      </div>

      <div class="right">
        <p class="name">${escapeHtml(part.name)}</p>
        ${part.slug ? `<p class="slug">${escapeHtml(part.slug)}</p>` : ''}
        <span class="badge ${statusClass}">${escapeHtml(part.status)}</span>

        <div class="price-card">
          <div class="price-head">
            <div class="label">Price</div>
            <div class="amount">${escapeHtml(formatMoney(part.price))}</div>
          </div>
        </div>

        <div class="meta-row"><span class="meta-label">Stock</span><strong>${part.stock}</strong></div>
        ${
          part.weightKg != null
            ? `<div class="meta-row"><span class="meta-label">Weight</span><strong>${part.weightKg} kg</strong></div>`
            : ''
        }
      </div>
    </div>
  </div>
</body>
</html>`;
}

export function printSparePartDetail(part: SparePartDetailExport) {
  const html = buildPrintHtml(part);
  const win = window.open('', '_blank', 'noopener,noreferrer,width=980,height=900');
  if (!win) {
    throw new Error('Pop-up blocked. Allow pop-ups to print this spare part.');
  }
  win.document.open();
  win.document.write(html);
  win.document.close();
  win.focus();
  win.onload = () => {
    win.print();
  };
}

export async function downloadSparePartDetailPdf(part: SparePartDetailExport): Promise<void> {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  let y = PDF_MARGIN;

  const ensureSpace = (needed: number) => {
    if (y + needed > PDF_PAGE_BOTTOM) {
      doc.addPage();
      y = PDF_MARGIN;
    }
  };

  doc.setFontSize(11);
  doc.setTextColor(15, 76, 105);
  doc.text('Ambassador Commercial Kitchen Equipment', PDF_MARGIN, y);
  y += 6;
  doc.setFontSize(9);
  doc.setTextColor(90, 90, 90);
  doc.text('Spare Part Details', PDF_MARGIN, y);
  y += 8;

  const imageData = part.image ? await loadImage(part.image) : null;
  const imageTopY = y;

  if (imageData) {
    doc.addImage(imageData, 'JPEG', PDF_MARGIN, y, PDF_LEFT_COL_MM, PDF_IMAGE_HEIGHT_MM);
  } else {
    doc.setDrawColor(229, 231, 235);
    doc.setFillColor(249, 250, 251);
    doc.roundedRect(PDF_MARGIN, y, PDF_LEFT_COL_MM, PDF_IMAGE_HEIGHT_MM, 2, 2, 'FD');
    doc.setFontSize(9);
    doc.setTextColor(156, 163, 175);
    doc.text('No image', PDF_MARGIN + PDF_LEFT_COL_MM / 2, y + PDF_IMAGE_HEIGHT_MM / 2, {
      align: 'center',
      baseline: 'middle',
    });
  }

  let rightY = imageTopY;
  doc.setFontSize(11);
  doc.setTextColor(17, 24, 39);
  const nameLines = doc.splitTextToSize(part.name, PDF_RIGHT_COL_W);
  doc.text(nameLines, PDF_RIGHT_COL_X, rightY);
  rightY += nameLines.length * 5 + 2;

  if (part.slug) {
    doc.setFontSize(8);
    doc.setTextColor(156, 163, 175);
    const slugLines = doc.splitTextToSize(part.slug, PDF_RIGHT_COL_W);
    doc.text(slugLines, PDF_RIGHT_COL_X, rightY);
    rightY += slugLines.length * 4 + 2;
  }

  doc.setFontSize(8);
  doc.setTextColor(part.status === 'Active' ? 22 : 75, part.status === 'Active' ? 101 : 85, part.status === 'Active' ? 52 : 99);
  doc.text(part.status, PDF_RIGHT_COL_X, rightY);
  rightY += 8;

  doc.setFillColor(15, 76, 105);
  doc.roundedRect(PDF_RIGHT_COL_X, rightY, PDF_RIGHT_COL_W, 22, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7);
  doc.text('PRICE', PDF_RIGHT_COL_X + 3, rightY + 5);
  doc.setFontSize(14);
  doc.text(formatMoney(part.price), PDF_RIGHT_COL_X + 3, rightY + 13);
  rightY += 26;

  doc.setFontSize(8);
  doc.setTextColor(107, 114, 128);
  doc.text('Stock', PDF_RIGHT_COL_X, rightY);
  doc.setTextColor(31, 41, 55);
  doc.text(String(part.stock), PDF_RIGHT_COL_X + PDF_RIGHT_COL_W, rightY, { align: 'right' });
  rightY += 5;

  if (part.weightKg != null) {
    doc.setTextColor(107, 114, 128);
    doc.text('Weight (kg)', PDF_RIGHT_COL_X, rightY);
    doc.setTextColor(31, 41, 55);
    doc.text(String(part.weightKg), PDF_RIGHT_COL_X + PDF_RIGHT_COL_W, rightY, { align: 'right' });
    rightY += 5;
  }

  y = Math.max(y + PDF_IMAGE_HEIGHT_MM, rightY) + 8;

  ensureSpace(12);
  doc.setFontSize(10);
  doc.setTextColor(15, 76, 105);
  doc.text('DESCRIPTION', PDF_MARGIN, y);
  y += 6;
  doc.setFontSize(9);
  doc.setTextColor(55, 65, 81);
  const descLines = doc.splitTextToSize(part.description || 'No description provided.', 210 - PDF_MARGIN * 2);
  ensureSpace(descLines.length * 4.5 + 2);
  doc.text(descLines, PDF_MARGIN, y);
  y += descLines.length * 4.5 + 6;

  if (part.variants.length) {
    ensureSpace(14);
    doc.setFontSize(10);
    doc.setTextColor(15, 76, 105);
    doc.text('VARIANTS', PDF_MARGIN, y);
    y += 4;

    autoTable(doc, {
      startY: y,
      head: [['Name', 'Price', 'Stock']],
      body: part.variants.map((v) => [v.name, formatMoney(v.price), String(v.stock)]),
      margin: { left: PDF_MARGIN, right: PDF_MARGIN },
      styles: { fontSize: 9, cellPadding: 2.5 },
      headStyles: { fillColor: [15, 76, 105], textColor: [255, 255, 255] },
      alternateRowStyles: { fillColor: [245, 247, 250] },
    });
    y = ((doc as JsPdfWithAutoTable).lastAutoTable?.finalY ?? y) + 4;
  }

  const slugPart = part.slug?.replace(/[^a-z0-9-]+/gi, '-').replace(/-+/g, '-').slice(0, 60) || 'spare-part';
  doc.save(`spare-part-${slugPart}-${Date.now()}.pdf`);
}

export function sparePartToDetailExport(sparePart: {
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
  variants?: {
    id: string;
    name: string;
    price?: number;
    originalPrice?: number;
    stock: number;
    image?: string;
    imagePublicId?: string;
  }[];
}): SparePartDetailExport {
  const displayPrice =
    sparePart.price != null && sparePart.price > 0
      ? sparePart.price
      : Number(sparePart.originalPrice ?? 0);
  const urls = resolveProductImages({
    images: sparePart.images,
    imagePublicIds: sparePart.imagePublicIds,
  });
  const firstVariantImage = (sparePart.variants ?? []).map((v) => v.image?.trim()).find(Boolean);
  const variants = (sparePart.variants ?? []).map((v) => ({
    name: v.name,
    price: Number(v.price ?? v.originalPrice ?? displayPrice),
    stock: v.stock ?? 0,
  }));

  return {
    name: sparePart.name?.trim() || 'Spare Part',
    slug: sparePart.slug,
    status: sparePart.status === 'inactive' ? 'Inactive' : 'Active',
    price: displayPrice,
    stock: sparePart.stock ?? 0,
    weightKg: sparePart.weightKg != null ? Number(sparePart.weightKg) : undefined,
    description: sparePart.description?.trim() ?? '',
    image: firstVariantImage || urls[0],
    variants,
  };
}
