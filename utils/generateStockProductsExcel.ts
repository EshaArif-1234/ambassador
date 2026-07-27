import * as XLSX from 'xlsx';
import type { StockExportProduct } from '@/utils/generateStockProductsPdf';
import { dedupeExportProducts } from '@/utils/dedupeExportProducts';

export type StockExcelType = 'in_stock' | 'out_of_stock' | 'all' | 'selected';

const EXCEL_TITLES: Record<StockExcelType, string> = {
  in_stock: 'In Stock Products',
  out_of_stock: 'Out of Stock Products',
  all: 'All Products',
  selected: 'Selected Products',
};

const EXCEL_FILENAMES: Record<StockExcelType, string> = {
  in_stock: 'in-stock-products',
  out_of_stock: 'out-of-stock-products',
  all: 'all-products',
  selected: 'selected-products',
};

const categoryLabel = (categories?: Array<{ title?: string } | string>) => {
  if (!Array.isArray(categories) || categories.length === 0) return '';
  return categories
    .map((c) => (typeof c === 'object' && c?.title ? c.title : String(c)))
    .join(', ');
};

export function downloadStockProductsExcel(
  products: StockExportProduct[],
  stockType: StockExcelType,
) {
  const uniqueProducts = dedupeExportProducts(products);

  const generatedAt = new Date().toLocaleString('en-PK', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const rows = uniqueProducts.map((product, index) => ({
    '#': index + 1,
    Product: product.name,
    Slug: product.slug ?? '',
    Category: categoryLabel(product.categories),
    'Price (PKR)': Number(product.price ?? product.originalPrice ?? 0),
    Stock: Number(product.stock ?? 0),
    Status: product.status ?? '',
  }));

  const sheetRows =
    rows.length > 0
      ? rows
      : [{ '#': '', Product: 'No products found', Slug: '', Category: '', 'Price (PKR)': '', Stock: '', Status: '' }];

  const worksheet = XLSX.utils.json_to_sheet(sheetRows);
  worksheet['!cols'] = [
    { wch: 5 },
    { wch: 42 },
    { wch: 28 },
    { wch: 24 },
    { wch: 14 },
    { wch: 8 },
    { wch: 10 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, EXCEL_TITLES[stockType].slice(0, 31));

  const metaSheet = XLSX.utils.aoa_to_sheet([
    ['Ambassador Commercial Kitchen Equipment'],
    [EXCEL_TITLES[stockType]],
    [`Generated: ${generatedAt}`],
    [`Total products: ${uniqueProducts.length}`],
  ]);
  XLSX.utils.book_append_sheet(workbook, metaSheet, 'Info');

  const fileName = `${EXCEL_FILENAMES[stockType]}-${Date.now()}.xlsx`;
  XLSX.writeFile(workbook, fileName);
}
