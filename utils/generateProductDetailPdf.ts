import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

/** Matches modal left-column image: full width of left col, aspect 4/3 */
const PDF_LEFT_COL_MM = 110;
const PDF_IMAGE_WIDTH_MM = PDF_LEFT_COL_MM;
const PDF_IMAGE_HEIGHT_MM = PDF_IMAGE_WIDTH_MM * 0.75;
const PDF_THUMB_MM = 14;
const PDF_RIGHT_COL_X = 128;
const PDF_RIGHT_COL_W = 62;
const PDF_MARGIN = 14;
const PDF_CONTENT_WIDTH = 210 - PDF_MARGIN * 2;
const PDF_SPEC_BORDER = 0.2;
const PDF_SPEC_BORDER_COLOR: [number, number, number] = [209, 213, 219];

type JsPdfWithAutoTable = jsPDF & { lastAutoTable?: { finalY: number } };

export type ProductDetailExport = {
  name: string;
  slug?: string;
  status: string;
  categories: string[];
  features: string[];
  brands: string[];
  originalPrice: number;
  price?: number;
  stock: number;
  stockLabel: string;
  weightKg?: number;
  about: string;
  specifications: Record<string, string>;
  createdAt?: string;
  images: string[];
  videos: string[];
  imageCount: number;
  videoCount: number;
  metaTitle?: string;
  metaDescription?: string;
  savings?: number;
  discountPct?: number;
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

function hasDiscount(product: ProductDetailExport) {
  return product.price != null && !Number.isNaN(product.price) && product.price < product.originalPrice;
}

type LoadedImage = {
  dataUrl: string;
  width: number;
  height: number;
};

async function loadImage(url: string): Promise<LoadedImage | null> {
  if (typeof window === 'undefined') return null;
  try {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    const loaded = await new Promise<HTMLImageElement | null>((resolve) => {
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = url;
    });
    if (!loaded || !loaded.naturalWidth || !loaded.naturalHeight) return null;

    const canvas = document.createElement('canvas');
    canvas.width = loaded.naturalWidth;
    canvas.height = loaded.naturalHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.drawImage(loaded, 0, 0);
    return {
      dataUrl: canvas.toDataURL('image/jpeg', 0.92),
      width: loaded.naturalWidth,
      height: loaded.naturalHeight,
    };
  } catch {
    return null;
  }
}

/** Fill a box without stretching (same as object-fit: cover). */
function fitImageCover(
  imgW: number,
  imgH: number,
  boxW: number,
  boxH: number,
): { drawW: number; drawH: number; offsetX: number; offsetY: number } {
  const scale = Math.max(boxW / imgW, boxH / imgH);
  const drawW = imgW * scale;
  const drawH = imgH * scale;
  return {
    drawW,
    drawH,
    offsetX: (boxW - drawW) / 2,
    offsetY: (boxH - drawH) / 2,
  };
}

function buildSpecTableRows(entries: [string, string][]): string[][] {
  const rows: string[][] = [];
  for (let i = 0; i < entries.length; i += 2) {
    const [k1, v1] = entries[i];
    const pair2 = entries[i + 1];
    rows.push([
      k1,
      v1 || '—',
      pair2 ? pair2[0] : '',
      pair2 ? (pair2[1] || '—') : '',
    ]);
  }
  return rows;
}

function buildSpecTableHtml(specifications: Record<string, string>): string {
  const entries = Object.entries(specifications) as [string, string][];
  if (!entries.length) return '';

  const rows = buildSpecTableRows(entries)
    .map(
      ([k1, v1, k2, v2]) =>
        `<tr>
          <td class="spec-key">${escapeHtml(k1)}</td>
          <td class="spec-val">${escapeHtml(v1)}</td>
          <td class="spec-key">${escapeHtml(k2)}</td>
          <td class="spec-val">${escapeHtml(v2)}</td>
        </tr>`,
    )
    .join('');

  return `<table class="spec-table"><tbody>${rows}</tbody></table>`;
}

function buildPrintHtml(product: ProductDetailExport): string {
  const discounted = hasDiscount(product);
  const primaryImage = product.images[0];
  const specTable = buildSpecTableHtml(product.specifications);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(product.name)} — Product Details</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: Arial, sans-serif; color: #1f2937; margin: 20px; font-size: 13px; line-height: 1.5; background: #fffdf8; }
    .book { border: 3px double #0F4C69; padding: 20px 24px; max-width: 980px; margin: 0 auto; box-shadow: inset 0 0 0 1px #E36630; }
    .layout { display: grid; grid-template-columns: 1fr 340px; gap: 24px; align-items: start; }
    .section-title { font-size: 14px; font-weight: 700; color: #111827; margin: 0 0 10px; display: flex; align-items: center; gap: 8px; }
    .section-title span { width: 4px; height: 16px; background: #0F4C69; border-radius: 999px; display: inline-block; }
    .image-wrap { width: 100%; aspect-ratio: 4 / 3; border-radius: 12px; overflow: hidden; border: 1px solid #e5e7eb; background: #ffffff; }
    .image-wrap img { width: 100%; height: 100%; object-fit: cover; display: block; }
    .thumbs { display: flex; gap: 8px; margin-top: 12px; flex-wrap: wrap; }
    .thumbs img { width: 56px; height: 56px; object-fit: cover; border-radius: 8px; border: 2px solid #e5e7eb; background: #ffffff; }
    .right { background: #fafafa; padding: 20px; border-radius: 12px; }
    .name { font-size: 18px; font-weight: 700; color: #111827; margin: 0; }
    .slug { font-size: 11px; color: #9ca3af; font-family: monospace; margin-top: 4px; }
    .badge { display: inline-block; padding: 4px 10px; border-radius: 999px; font-size: 11px; font-weight: 600; }
    .badge-active { background: #dcfce7; color: #166534; }
    .badge-inactive { background: #e5e7eb; color: #4b5563; }
    .price-card { border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; margin-top: 16px; }
    .price-head { background: #0F4C69; color: white; padding: 12px 16px; }
    .price-head .label { font-size: 11px; opacity: 0.75; text-transform: uppercase; letter-spacing: 0.08em; }
    .price-head .amount { font-size: 24px; font-weight: 700; margin-top: 4px; }
    .price-body { background: white; padding: 12px 16px; font-size: 13px; }
    .price-row { display: flex; justify-content: space-between; margin-bottom: 6px; }
    .card { background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 14px 16px; margin-top: 14px; }
    .card-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: #6b7280; font-weight: 600; margin-bottom: 8px; }
    .pill { display: inline-block; margin: 0 4px 4px 0; padding: 3px 10px; border-radius: 999px; font-size: 11px; font-weight: 600; }
    .pill-blue { background: #eff6ff; color: #1d4ed8; }
    .pill-orange { background: #fff7ed; color: #E36630; }
    .pill-navy { background: #0F4C6914; color: #0F4C69; }
    .spec-title { font-size: 10px; font-weight: 700; color: #0F4C69; margin: 0 0 10px; text-transform: uppercase; letter-spacing: 0.08em; }
    .spec-table { width: 100%; border-collapse: collapse; table-layout: fixed; }
    .spec-table td { border: 1px solid #d1d5db; padding: 8px 10px; text-align: center; vertical-align: middle; word-break: break-word; }
    .spec-table .spec-key { font-size: 12px; font-weight: 700; color: #000000; }
    .spec-table .spec-val { font-size: 13px; font-weight: 400; color: #111827; }
    .block { margin-top: 24px; }
    .muted { color: #6b7280; }
    .seo-box { border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; }
    .seo-preview { padding: 12px 16px; background: white; border-bottom: 1px solid #f3f4f6; }
    .seo-url { font-size: 11px; color: #6b7280; }
    .seo-title { font-size: 16px; color: #1d4ed8; font-weight: 500; margin-top: 4px; }
    .seo-desc { font-size: 12px; color: #4b5563; margin-top: 4px; }
    .video-list a { color: #0F4C69; word-break: break-all; }
    @media print { body { margin: 10px; background: white; } }
    @media (max-width: 900px) { .layout { grid-template-columns: 1fr; } }
  </style>
</head>
<body>
  <div class="book">
    <h1 style="font-size:20px;color:#0F4C69;margin:0 0 4px;">${escapeHtml(product.name)}</h1>
    <p class="muted" style="margin:0 0 20px;font-size:12px;">Ambassador Commercial Kitchen Equipment · Product Details</p>

    <div class="layout">
      <div>
        <div class="image-wrap">
          ${
            primaryImage
              ? `<img src="${escapeHtml(primaryImage)}" alt="${escapeHtml(product.name)}" />`
              : '<div style="height:100%;display:flex;align-items:center;justify-content:center;color:#9ca3af;">No image uploaded</div>'
          }
        </div>
        ${
          product.images.length > 1
            ? `<div class="thumbs">${product.images
                .map(
                  (img, i) =>
                    `<img src="${escapeHtml(img)}" alt="Image ${i + 1}" />`,
                )
                .join('')}</div>`
            : ''
        }

        <div class="block">
          <h2 class="section-title"><span></span>Description</h2>
          <p class="muted" style="margin:0;">${escapeHtml(product.about || 'No description provided.')}</p>
        </div>

        <div class="block">
          <h2 class="spec-title">Specification</h2>
          ${
            specTable
              ? specTable
              : '<p class="muted" style="margin:0;">No specifications added for this product.</p>'
          }
        </div>

        ${
          product.videos.length
            ? `<div class="block">
                <h2 class="section-title"><span></span>Product Videos</h2>
                <ul class="video-list">${product.videos
                  .map((v, i) => `<li><a href="${escapeHtml(v)}">Video ${i + 1}: ${escapeHtml(v)}</a></li>`)
                  .join('')}</ul>
              </div>`
            : ''
        }

        ${
          product.metaTitle || product.metaDescription
            ? `<div class="block">
                <h2 class="section-title"><span></span>SEO — Google Preview</h2>
                <div class="seo-box">
                  <div class="seo-preview">
                    <div class="seo-url">ambassador.pk › products › ${escapeHtml(product.slug || product.name.toLowerCase().replace(/\s+/g, '-'))}</div>
                    <div class="seo-title">${escapeHtml(product.metaTitle || product.name)}</div>
                    ${product.metaDescription ? `<div class="seo-desc">${escapeHtml(product.metaDescription)}</div>` : ''}
                  </div>
                  <div style="padding:8px 16px;background:#f9fafb;font-size:11px;color:#9ca3af;display:flex;justify-content:space-between;">
                    <span>Meta Title: ${(product.metaTitle || product.name).length} chars</span>
                    ${product.metaDescription ? `<span>Meta Desc: ${product.metaDescription.length} chars</span>` : ''}
                  </div>
                </div>
              </div>`
            : ''
        }
      </div>

      <div class="right">
        <div style="display:flex;justify-content:space-between;gap:8px;align-items:flex-start;">
          <div>
            <h2 class="name">${escapeHtml(product.name)}</h2>
            ${product.slug ? `<p class="slug">${escapeHtml(product.slug)}</p>` : ''}
          </div>
          <span class="badge ${product.status === 'Active' ? 'badge-active' : 'badge-inactive'}">${escapeHtml(product.status)}</span>
        </div>

        <div class="price-card">
          <div class="price-head">
            <div class="label">Price</div>
            <div class="amount">${discounted ? formatMoney(product.price!) : formatMoney(product.originalPrice)}</div>
            ${discounted ? `<div style="font-size:13px;opacity:0.65;text-decoration:line-through;margin-top:2px;">${formatMoney(product.originalPrice)}</div>` : ''}
          </div>
          <div class="price-body">
            <div class="price-row"><span class="muted">Original Price</span><strong>${formatMoney(product.originalPrice)}</strong></div>
            ${
              discounted
                ? `<div class="price-row"><span class="muted">Discounted Price</span><strong style="color:#E36630;">${formatMoney(product.price!)}</strong></div>
                   <div class="price-row" style="border-top:1px solid #f3f4f6;padding-top:6px;"><span class="muted">You Save</span><strong style="color:#16a34a;">${formatMoney(product.savings ?? 0)} (${product.discountPct ?? 0}% off)</strong></div>`
                : '<div class="price-row"><span class="muted">Discount</span><em style="color:#9ca3af;font-size:12px;">No discount</em></div>'
            }
          </div>
        </div>

        <div class="card">
          <div class="card-label">Stock & Availability</div>
          <strong style="font-size:18px;">${product.stock} units</strong>
          <div class="muted" style="font-size:12px;margin-top:2px;">${escapeHtml(product.stockLabel)}</div>
        </div>

        <div class="card">
          <div class="card-label">Classification</div>
          <div><span class="muted" style="font-size:12px;">Categories</span></div>
          <div style="margin-top:6px;">
            ${
              product.categories.length
                ? product.categories.map((c) => `<span class="pill pill-blue">${escapeHtml(c)}</span>`).join('')
                : '<span class="muted">—</span>'
            }
          </div>
        </div>

        <div class="card">
          <div class="card-label">Features & Brand</div>
          <div><span class="muted" style="font-size:12px;">Features</span></div>
          <div style="margin-top:6px;margin-bottom:10px;">
            ${
              product.features.length
                ? product.features.map((f) => `<span class="pill pill-orange">${escapeHtml(f)}</span>`).join('')
                : '<span class="muted">None selected</span>'
            }
          </div>
          <div><span class="muted" style="font-size:12px;">Brand</span></div>
          <div style="margin-top:6px;">
            ${
              product.brands.length
                ? product.brands.map((b) => `<span class="pill pill-navy">${escapeHtml(b)}</span>`).join('')
                : '<span class="muted">None selected</span>'
            }
          </div>
        </div>

        <div class="card">
          <div class="card-label">Media</div>
          <div class="price-row"><span class="muted">${product.imageCount} image${product.imageCount !== 1 ? 's' : ''}</span></div>
          <div class="price-row" style="margin:0;"><span class="muted">${product.videoCount} video${product.videoCount !== 1 ? 's' : ''}</span></div>
        </div>

        ${product.createdAt ? `<p class="muted" style="font-size:11px;margin-top:14px;">Added ${escapeHtml(product.createdAt)}</p>` : ''}
        ${product.weightKg != null ? `<p class="muted" style="font-size:11px;margin-top:4px;">Weight: ${product.weightKg} kg</p>` : ''}
      </div>
    </div>
  </div>
</body>
</html>`;
}

function drawSpecificationsTable(
  doc: jsPDF,
  entries: [string, string][],
  startY: number,
): number {
  autoTable(doc, {
    startY,
    body: buildSpecTableRows(entries),
    theme: 'grid',
    margin: { left: PDF_MARGIN, right: PDF_MARGIN },
    styles: {
      fontSize: 9,
      cellPadding: 2.5,
      lineColor: PDF_SPEC_BORDER_COLOR,
      lineWidth: PDF_SPEC_BORDER,
      halign: 'center',
      valign: 'middle',
      textColor: [17, 24, 39],
      fontStyle: 'normal',
    },
    columnStyles: {
      0: { fontStyle: 'bold', textColor: [0, 0, 0], fontSize: 8 },
      1: { fontStyle: 'normal', textColor: [17, 24, 39], fontSize: 9 },
      2: { fontStyle: 'bold', textColor: [0, 0, 0], fontSize: 8 },
      3: { fontStyle: 'normal', textColor: [17, 24, 39], fontSize: 9 },
    },
  });

  const finalY = (doc as JsPdfWithAutoTable).lastAutoTable?.finalY ?? startY;
  return finalY + 4;
}

export function printProductDetail(product: ProductDetailExport) {
  const html = buildPrintHtml(product);
  const win = window.open('', '_blank', 'noopener,noreferrer,width=980,height=900');
  if (!win) {
    throw new Error('Pop-up blocked. Allow pop-ups to print this product.');
  }
  win.document.open();
  win.document.write(html);
  win.document.close();
  win.focus();
  win.onload = () => {
    win.print();
  };
}

export async function downloadProductDetailPdf(product: ProductDetailExport): Promise<void> {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  let y = PDF_MARGIN;
  const discounted = hasDiscount(product);

  const PDF_PAGE_BOTTOM = 285;

  const ensureSpace = (needed: number) => {
    if (y + needed > PDF_PAGE_BOTTOM) {
      doc.addPage();
      y = PDF_MARGIN;
    }
  };

  const sectionTitle = (title: string) => {
    ensureSpace(10);
    doc.setFontSize(10);
    doc.setTextColor(15, 76, 105);
    doc.text(title.toUpperCase(), PDF_MARGIN, y);
    y += 6;
  };

  const bodyText = (text: string, maxW = PDF_LEFT_COL_MM) => {
    doc.setFontSize(9);
    doc.setTextColor(55, 65, 81);
    const lines = doc.splitTextToSize(text, maxW);
    ensureSpace(lines.length * 4.5 + 2);
    doc.text(lines, PDF_MARGIN, y);
    y += lines.length * 4.5 + 3;
  };

  // ── Right column header (top aligned with image) ──
  let rightY = PDF_MARGIN;

  doc.setFontSize(11);
  doc.setTextColor(17, 24, 39);
  const nameLines = doc.splitTextToSize(product.name, PDF_RIGHT_COL_W);
  doc.text(nameLines, PDF_RIGHT_COL_X, rightY);
  rightY += nameLines.length * 5 + 2;

  if (product.slug) {
    doc.setFontSize(8);
    doc.setTextColor(156, 163, 175);
    doc.text(product.slug, PDF_RIGHT_COL_X, rightY);
    rightY += 5;
  }

  doc.setFontSize(8);
  doc.setTextColor(product.status === 'Active' ? 22 : 75, product.status === 'Active' ? 101 : 85, product.status === 'Active' ? 52 : 99);
  doc.text(product.status, PDF_RIGHT_COL_X, rightY);
  rightY += 8;

  // Price block
  doc.setFillColor(15, 76, 105);
  doc.roundedRect(PDF_RIGHT_COL_X, rightY, PDF_RIGHT_COL_W, 22, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7);
  doc.text('PRICE', PDF_RIGHT_COL_X + 3, rightY + 5);
  doc.setFontSize(14);
  doc.text(discounted ? formatMoney(product.price!) : formatMoney(product.originalPrice), PDF_RIGHT_COL_X + 3, rightY + 13);
  if (discounted) {
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text(formatMoney(product.originalPrice), PDF_RIGHT_COL_X + 3, rightY + 18);
  }
  rightY += 26;

  doc.setFontSize(8);
  doc.setTextColor(107, 114, 128);
  doc.text('Original Price', PDF_RIGHT_COL_X, rightY);
  doc.setTextColor(31, 41, 55);
  doc.text(formatMoney(product.originalPrice), PDF_RIGHT_COL_X + PDF_RIGHT_COL_W, rightY, { align: 'right' });
  rightY += 5;

  if (discounted) {
    doc.setTextColor(107, 114, 128);
    doc.text('Discounted Price', PDF_RIGHT_COL_X, rightY);
    doc.setTextColor(227, 102, 48);
    doc.text(formatMoney(product.price!), PDF_RIGHT_COL_X + PDF_RIGHT_COL_W, rightY, { align: 'right' });
    rightY += 5;
    doc.setTextColor(107, 114, 128);
    doc.text('You Save', PDF_RIGHT_COL_X, rightY);
    doc.setTextColor(22, 163, 74);
    doc.text(`${formatMoney(product.savings ?? 0)} (${product.discountPct ?? 0}% off)`, PDF_RIGHT_COL_X + PDF_RIGHT_COL_W, rightY, { align: 'right' });
    rightY += 7;
  } else {
    rightY += 3;
  }

  const addRightLine = (text: string) => {
    doc.setFontSize(8);
    doc.setTextColor(55, 65, 81);
    const lines = doc.splitTextToSize(text, PDF_RIGHT_COL_W);
    doc.text(lines, PDF_RIGHT_COL_X, rightY);
    rightY += lines.length * 4 + 2;
  };

  addRightLine(`Stock: ${product.stock} units (${product.stockLabel})`);
  addRightLine(`Categories: ${product.categories.length ? product.categories.join(', ') : '—'}`);
  addRightLine(`Features: ${product.features.length ? product.features.join(', ') : 'None'}`);
  addRightLine(`Brands: ${product.brands.length ? product.brands.join(', ') : 'None'}`);
  addRightLine(`Media: ${product.imageCount} image(s), ${product.videoCount} video(s)`);
  if (product.weightKg != null) addRightLine(`Weight: ${product.weightKg} kg`);
  if (product.createdAt) addRightLine(`Added: ${product.createdAt}`);

  // ── Left column: primary image (4:3 frame, image contained without stretch) ──
  const imageTopY = PDF_MARGIN;
  if (product.images[0]) {
    const primary = await loadImage(product.images[0]);
    if (primary) {
      doc.setDrawColor(229, 231, 235);
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(PDF_MARGIN, imageTopY, PDF_IMAGE_WIDTH_MM, PDF_IMAGE_HEIGHT_MM, 2, 2, 'FD');
      const fit = fitImageCover(primary.width, primary.height, PDF_IMAGE_WIDTH_MM, PDF_IMAGE_HEIGHT_MM);
      try {
        doc.addImage(
          primary.dataUrl,
          'JPEG',
          PDF_MARGIN + fit.offsetX,
          imageTopY + fit.offsetY,
          fit.drawW,
          fit.drawH,
          undefined,
          'FAST',
        );
      } catch {
        bodyText('Product image could not be embedded in PDF.');
      }
      y = imageTopY + PDF_IMAGE_HEIGHT_MM + 4;

      // Thumbnails (modal: 56px ≈ 14mm)
      if (product.images.length > 1) {
        let thumbX = PDF_MARGIN;
        for (let i = 0; i < product.images.length; i++) {
          const thumb = await loadImage(product.images[i]);
          if (thumb) {
            doc.setFillColor(255, 255, 255);
            doc.roundedRect(thumbX, y, PDF_THUMB_MM, PDF_THUMB_MM, 1, 1, 'F');
            const thumbFit = fitImageCover(thumb.width, thumb.height, PDF_THUMB_MM, PDF_THUMB_MM);
            try {
              doc.addImage(
                thumb.dataUrl,
                'JPEG',
                thumbX + thumbFit.offsetX,
                y + thumbFit.offsetY,
                thumbFit.drawW,
                thumbFit.drawH,
                undefined,
                'FAST',
              );
            } catch {
              /* skip thumb */
            }
          }
          thumbX += PDF_THUMB_MM + 2;
        }
        y += PDF_THUMB_MM + 6;
      } else {
        y += 4;
      }
    } else {
      y = imageTopY + 12;
      bodyText('Product image unavailable for PDF export.');
    }
  } else {
    y = imageTopY + 8;
    bodyText('No image uploaded.');
  }

  const leftContentStartY = Math.max(y, rightY + 4);
  y = leftContentStartY;

  sectionTitle('Description');
  bodyText(product.about || 'No description provided.');

  sectionTitle('Specification');

  const specEntries = Object.entries(product.specifications) as [string, string][];
  if (specEntries.length === 0) {
    bodyText('No specifications added for this product.', PDF_CONTENT_WIDTH);
  } else {
    y = drawSpecificationsTable(doc, specEntries, y);
  }

  if (product.videos.length) {
    sectionTitle('Product Videos');
    product.videos.forEach((vid, i) => {
      bodyText(`Video ${i + 1}: ${vid}`, PDF_LEFT_COL_MM + PDF_RIGHT_COL_W + (PDF_RIGHT_COL_X - PDF_MARGIN - PDF_LEFT_COL_MM));
    });
  }

  if (product.metaTitle || product.metaDescription) {
    sectionTitle('SEO — Google Preview');
    bodyText(`URL: ambassador.pk › products › ${product.slug || product.name.toLowerCase().replace(/\s+/g, '-')}`);
    bodyText(`Meta Title: ${product.metaTitle || product.name}`);
    if (product.metaDescription) bodyText(`Meta Description: ${product.metaDescription}`);
  }

  const safeName = product.name.replace(/[^\w-]+/g, '_').slice(0, 60);
  doc.save(`product-${safeName || 'details'}.pdf`);
}
