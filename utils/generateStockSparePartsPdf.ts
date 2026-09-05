import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { resolveProductImages } from '@/utils/productMedia.util';
import { dedupeExportProducts } from '@/utils/dedupeExportProducts';

export type StockExportSparePart = {
  _id?: string;
  name: string;
  slug?: string;
  price?: number;
  originalPrice?: number;
  stock: number;
  status?: string;
  images?: string[];
  imagePublicIds?: string[];
};

type StockPdfType = 'in_stock' | 'out_of_stock' | 'all' | 'selected';

const PDF_TITLES: Record<StockPdfType, string> = {
  in_stock: 'In Stock Spare Parts Report',
  out_of_stock: 'Out of Stock Spare Parts Report',
  all: 'All Spare Parts Report',
  selected: 'Selected Spare Parts Report',
};

const PDF_FILENAMES: Record<StockPdfType, string> = {
  in_stock: 'in-stock-spare-parts',
  out_of_stock: 'out-of-stock-spare-parts',
  all: 'all-spare-parts',
  selected: 'selected-spare-parts',
};

const IMAGE_COL_WIDTH = 18;
const IMAGE_CELL_HEIGHT = 18;

function sparePartImageUrl(part: StockExportSparePart): string | undefined {
  const urls = resolveProductImages({
    images: part.images,
    imagePublicIds: part.imagePublicIds,
  });
  return urls[0];
}

function loadImageAsDataUrl(url: string): Promise<string | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const maxSide = 120;
        const scale = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight));
        const width = Math.max(1, Math.round(img.naturalWidth * scale));
        const height = Math.max(1, Math.round(img.naturalHeight * scale));
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(null);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.85));
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

export async function downloadStockSparePartsPdf(
  spareParts: StockExportSparePart[],
  stockType: StockPdfType,
) {
  const uniqueParts = dedupeExportProducts(spareParts);

  const imageDataList = await Promise.all(
    uniqueParts.map(async (part) => {
      const url = sparePartImageUrl(part);
      if (!url) return null;
      return loadImageAsDataUrl(url);
    }),
  );

  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const title = PDF_TITLES[stockType];
  const generatedAt = new Date().toLocaleString('en-PK', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  doc.setFontSize(16);
  doc.setTextColor(15, 76, 105);
  doc.text('Ambassador Commercial Kitchen Equipment', 14, 14);

  doc.setFontSize(12);
  doc.setTextColor(40, 40, 40);
  doc.text(title, 14, 22);

  doc.setFontSize(9);
  doc.setTextColor(90, 90, 90);
  doc.text(`Generated: ${generatedAt}`, 14, 28);
  doc.text(`Total spare parts: ${uniqueParts.length}`, 14, 33);

  const rows = uniqueParts.map((part, index) => {
    const price = Number(part.price ?? part.originalPrice ?? 0);
    return [
      '',
      String(index + 1),
      part.name,
      part.slug ?? '—',
      `PKR ${price.toLocaleString()}`,
      String(part.stock ?? 0),
      part.status ?? '—',
    ];
  });

  autoTable(doc, {
    startY: 38,
    head: [['Image', '#', 'Spare Part', 'Slug', 'Price', 'Stock', 'Status']],
    body: rows.length ? rows : [['—', '—', 'No spare parts found', '—', '—', '—', '—']],
    styles: { fontSize: 8, cellPadding: 2.5, textColor: [40, 40, 40], valign: 'middle' },
    headStyles: {
      fillColor: [15, 76, 105],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    alternateRowStyles: { fillColor: [245, 247, 250] },
    bodyStyles: { minCellHeight: IMAGE_CELL_HEIGHT },
    columnStyles: {
      0: { cellWidth: IMAGE_COL_WIDTH },
      1: { cellWidth: 10 },
      2: { cellWidth: 68 },
      3: { cellWidth: 52 },
      4: { cellWidth: 28 },
      5: { cellWidth: 18 },
      6: { cellWidth: 22 },
    },
    margin: { left: 14, right: 14 },
    didDrawCell: (data) => {
      if (data.section !== 'body' || data.column.index !== 0) return;

      const imgData = imageDataList[data.row.index];
      const pad = 1.5;
      const boxW = data.cell.width - pad * 2;
      const boxH = data.cell.height - pad * 2;

      if (imgData) {
        doc.addImage(imgData, 'JPEG', data.cell.x + pad, data.cell.y + pad, boxW, boxH);
        return;
      }

      doc.setDrawColor(210, 210, 210);
      doc.setFillColor(245, 245, 245);
      doc.roundedRect(data.cell.x + pad, data.cell.y + pad, boxW, boxH, 1, 1, 'FD');
      doc.setFontSize(6);
      doc.setTextColor(140, 140, 140);
      doc.text('No image', data.cell.x + data.cell.width / 2, data.cell.y + data.cell.height / 2, {
        align: 'center',
        baseline: 'middle',
      });
    },
  });

  doc.save(`${PDF_FILENAMES[stockType]}-${Date.now()}.pdf`);
}
