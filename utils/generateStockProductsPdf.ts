import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export type StockExportProduct = {
  name: string;
  slug?: string;
  price?: number;
  originalPrice?: number;
  stock: number;
  status?: string;
  categories?: Array<{ title?: string } | string>;
};

type StockPdfType = 'in_stock' | 'out_of_stock';

const categoryLabel = (categories?: Array<{ title?: string } | string>) => {
  if (!Array.isArray(categories) || categories.length === 0) return '—';
  return categories
    .map((c) => (typeof c === 'object' && c?.title ? c.title : String(c)))
    .join(', ');
};

export function downloadStockProductsPdf(
  products: StockExportProduct[],
  stockType: StockPdfType
) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const title =
    stockType === 'in_stock' ? 'In Stock Products Report' : 'Out of Stock Products Report';
  const generatedAt = new Date().toLocaleString('en-PK', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  doc.setFontSize(16);
  doc.setTextColor(15, 76, 105);
  doc.text('Ambassador Kitchen Equipment', 14, 14);

  doc.setFontSize(12);
  doc.setTextColor(40, 40, 40);
  doc.text(title, 14, 22);

  doc.setFontSize(9);
  doc.setTextColor(90, 90, 90);
  doc.text(`Generated: ${generatedAt}`, 14, 28);
  doc.text(`Total products: ${products.length}`, 14, 33);

  const rows = products.map((product, index) => {
    const price = Number(product.price ?? product.originalPrice ?? 0);
    return [
      String(index + 1),
      product.name,
      categoryLabel(product.categories),
      `PKR ${price.toLocaleString()}`,
      String(product.stock ?? 0),
      product.status ?? '—',
    ];
  });

  autoTable(doc, {
    startY: 38,
    head: [['#', 'Product', 'Category', 'Price', 'Stock', 'Status']],
    body: rows.length ? rows : [['—', 'No products found', '—', '—', '—', '—']],
    styles: { fontSize: 8, cellPadding: 2.5, textColor: [40, 40, 40] },
    headStyles: {
      fillColor: [15, 76, 105],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    alternateRowStyles: { fillColor: [245, 247, 250] },
    columnStyles: {
      0: { cellWidth: 10 },
      1: { cellWidth: 72 },
      2: { cellWidth: 52 },
      3: { cellWidth: 28 },
      4: { cellWidth: 18 },
      5: { cellWidth: 22 },
    },
    margin: { left: 14, right: 14 },
  });

  const fileName =
    stockType === 'in_stock'
      ? `in-stock-products-${Date.now()}.pdf`
      : `out-of-stock-products-${Date.now()}.pdf`;

  doc.save(fileName);
}
