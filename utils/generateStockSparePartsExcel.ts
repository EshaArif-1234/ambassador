import * as XLSX from 'xlsx';
import type { StockExportSparePart } from '@/utils/generateStockSparePartsPdf';
import { dedupeExportProducts } from '@/utils/dedupeExportProducts';

export type StockSparePartExcelType = 'in_stock' | 'out_of_stock' | 'all' | 'selected';

const EXCEL_TITLES: Record<StockSparePartExcelType, string> = {
  in_stock: 'In Stock Spare Parts',
  out_of_stock: 'Out of Stock Spare Parts',
  all: 'All Spare Parts',
  selected: 'Selected Spare Parts',
};

const EXCEL_FILENAMES: Record<StockSparePartExcelType, string> = {
  in_stock: 'in-stock-spare-parts',
  out_of_stock: 'out-of-stock-spare-parts',
  all: 'all-spare-parts',
  selected: 'selected-spare-parts',
};

export function downloadStockSparePartsExcel(
  spareParts: StockExportSparePart[],
  stockType: StockSparePartExcelType,
) {
  const uniqueParts = dedupeExportProducts(spareParts);

  const generatedAt = new Date().toLocaleString('en-PK', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const rows = uniqueParts.map((part, index) => ({
    '#': index + 1,
    'Spare Part': part.name,
    Slug: part.slug ?? '',
    'Price (PKR)': Number(part.price ?? part.originalPrice ?? 0),
    Stock: Number(part.stock ?? 0),
    Status: part.status ?? '',
  }));

  const sheetRows =
    rows.length > 0
      ? rows
      : [{ '#': '', 'Spare Part': 'No spare parts found', Slug: '', 'Price (PKR)': '', Stock: '', Status: '' }];

  const worksheet = XLSX.utils.json_to_sheet(sheetRows);
  worksheet['!cols'] = [
    { wch: 5 },
    { wch: 42 },
    { wch: 28 },
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
    [`Total spare parts: ${uniqueParts.length}`],
  ]);
  XLSX.utils.book_append_sheet(workbook, metaSheet, 'Info');

  XLSX.writeFile(workbook, `${EXCEL_FILENAMES[stockType]}-${Date.now()}.xlsx`);
}
