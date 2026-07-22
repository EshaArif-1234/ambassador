import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export type OrderPdfRow = {
  orderNumber: string;
  customerName: string;
  customerPhone?: string;
  itemsCount: number;
  totalAmount: number;
  status: string;
  paymentStatus: string;
  orderDate: string;
};

export type OrderPdfFilters = {
  dateRange: 'all' | 'today' | 'week' | 'month' | 'recent';
  orderStatus?: string;
  paymentStatus?: string;
  search?: string;
};

function dateRangeLabel(dateRange: OrderPdfFilters['dateRange']) {
  switch (dateRange) {
    case 'recent':
      return 'Recent Orders (Last 3 Days)';
    case 'today':
      return 'Today';
    case 'week':
      return 'This Week';
    case 'month':
      return 'This Month';
    default:
      return 'All Time';
  }
}

function formatOrderDate(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-PK', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function downloadOrdersPdf(orders: OrderPdfRow[], filters: OrderPdfFilters) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const generatedAt = new Date().toLocaleString('en-PK', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const paidTotal = orders
    .filter((o) => o.paymentStatus === 'paid')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  doc.setFontSize(16);
  doc.setTextColor(15, 76, 105);
  doc.text('Ambassador Commercial Kitchen Equipment', 14, 14);

  doc.setFontSize(12);
  doc.setTextColor(40, 40, 40);
  doc.text('Orders Report', 14, 22);

  doc.setFontSize(9);
  doc.setTextColor(90, 90, 90);
  let metaY = 28;
  doc.text(`Generated: ${generatedAt}`, 14, metaY);
  metaY += 5;
  doc.text(`Date range: ${dateRangeLabel(filters.dateRange)}`, 14, metaY);
  metaY += 5;

  if (filters.orderStatus && filters.orderStatus !== 'all') {
    doc.text(`Order status: ${filters.orderStatus}`, 14, metaY);
    metaY += 5;
  }
  if (filters.paymentStatus && filters.paymentStatus !== 'all') {
    doc.text(`Payment status: ${filters.paymentStatus}`, 14, metaY);
    metaY += 5;
  }
  if (filters.search?.trim()) {
    doc.text(`Search: ${filters.search.trim()}`, 14, metaY);
    metaY += 5;
  }

  doc.text(`Total orders: ${orders.length}`, 14, metaY);
  metaY += 5;
  doc.text(`Paid revenue: PKR ${paidTotal.toLocaleString()}`, 14, metaY);

  const rows = orders.map((order, index) => [
    String(index + 1),
    order.orderNumber,
    order.customerName,
    order.customerPhone || '—',
    String(order.itemsCount),
    `PKR ${order.totalAmount.toLocaleString()}`,
    order.status,
    order.paymentStatus,
    formatOrderDate(order.orderDate),
  ]);

  autoTable(doc, {
    startY: metaY + 5,
    head: [['#', 'Order', 'Customer', 'Phone', 'Items', 'Total', 'Status', 'Payment', 'Date']],
    body: rows.length ? rows : [['—', 'No orders found', '—', '—', '—', '—', '—', '—', '—']],
    styles: { fontSize: 7.5, cellPadding: 2.5, textColor: [40, 40, 40] },
    headStyles: {
      fillColor: [15, 76, 105],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    alternateRowStyles: { fillColor: [245, 247, 250] },
    columnStyles: {
      0: { cellWidth: 8 },
      1: { cellWidth: 32 },
      2: { cellWidth: 38 },
      3: { cellWidth: 28 },
      4: { cellWidth: 14 },
      5: { cellWidth: 26 },
      6: { cellWidth: 22 },
      7: { cellWidth: 20 },
      8: { cellWidth: 24 },
    },
    margin: { left: 14, right: 14 },
  });

  const fileName = `orders-${filters.dateRange}-${Date.now()}.pdf`;
  doc.save(fileName);
}
