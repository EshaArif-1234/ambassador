import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  displayText,
  formatFullShippingAddress,
  formatOrderDateTime,
  formatPaymentMethodLabel,
} from '@/utils/orderDisplay.util';

export type OrderDetailExportItem = {
  productName: string;
  sku?: string;
  quantity: number;
  price: number;
  total: number;
};

export type OrderDetailMnpEvent = {
  status: string;
  narration: string;
  location?: string;
  time?: string;
};

export type OrderDetailExport = {
  orderNumber: string;
  orderDate: string;
  updatedAt?: string;
  deliveryDate?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  paymentStatus: string;
  paymentId?: string;
  transactionId?: string;
  paymentMethod: string;
  paidAt?: string;
  currency: string;
  subtotal: number;
  deliveryCharges: number;
  totalAmount: number;
  shippingAddress: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  deliveryNotes?: string;
  mnpStatus: string;
  mnpConsignment?: string;
  mnpBookedAt?: string;
  mnpBookingMessage?: string;
  mnpBookingError?: string;
  mnpTrackingEvents?: OrderDetailMnpEvent[];
  items: OrderDetailExportItem[];
  notes?: string;
  failedReason?: string;
};

function formatMoney(amount: number, currency = 'PKR') {
  return `${currency} ${amount.toLocaleString('en-PK')}`;
}

function buildPrintHtml(order: OrderDetailExport): string {
  const paymentMethod = formatPaymentMethodLabel(order.paymentMethod);
  const itemRows = order.items
    .map(
      (item) => `
      <tr>
        <td>${escapeHtml(displayText(item.productName))}</td>
        <td>${escapeHtml(item.sku?.trim() || '—')}</td>
        <td style="text-align:right">${item.quantity}</td>
        <td style="text-align:right">${formatMoney(item.price, order.currency)}</td>
        <td style="text-align:right">${formatMoney(item.total, order.currency)}</td>
      </tr>`,
    )
    .join('');

  const mnpEvents =
    order.mnpTrackingEvents && order.mnpTrackingEvents.length > 0
      ? `<ul>${order.mnpTrackingEvents
          .map(
            (e) =>
              `<li><strong>${escapeHtml(e.status || 'Update')}</strong>${e.location ? ` · ${escapeHtml(e.location)}` : ''}${e.time ? ` · ${escapeHtml(formatOrderDateTime(e.time))}` : ''}${e.narration ? `<br/><span style="color:#555">${escapeHtml(e.narration)}</span>` : ''}</li>`,
          )
          .join('')}</ul>`
      : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Order ${escapeHtml(order.orderNumber)}</title>
  <style>
    body { font-family: Arial, sans-serif; color: #222; margin: 24px; font-size: 13px; line-height: 1.45; }
    h1 { font-size: 20px; margin: 0 0 4px; color: #0F4C69; }
    .meta { color: #666; margin-bottom: 20px; font-size: 12px; }
    .badges { margin: 12px 0 20px; }
    .badge { display: inline-block; padding: 4px 10px; border-radius: 999px; font-size: 11px; margin-right: 8px; background: #eef2f7; }
    section { margin-bottom: 18px; border: 1px solid #e5e7eb; border-radius: 8px; padding: 14px; }
    h2 { font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 10px; color: #374151; }
    table { width: 100%; border-collapse: collapse; margin-top: 8px; }
    th, td { border: 1px solid #e5e7eb; padding: 8px; text-align: left; vertical-align: top; }
    th { background: #f9fafb; font-size: 11px; text-transform: uppercase; color: #6b7280; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px 24px; }
    .row { display: flex; justify-content: space-between; gap: 12px; margin-bottom: 6px; }
    .label { color: #6b7280; }
    .value { font-weight: 600; text-align: right; }
    tfoot td { background: #f9fafb; font-weight: 600; }
    @media print { body { margin: 12px; } }
  </style>
</head>
<body>
  <h1>Order ${escapeHtml(displayText(order.orderNumber))}</h1>
  <p class="meta">Placed ${escapeHtml(formatOrderDateTime(order.orderDate))} · Ambassador Commercial Kitchen Equipment</p>
  <div class="badges">
    <span class="badge">M&P: ${escapeHtml(order.mnpStatus)}</span>
    <span class="badge">Payment: ${escapeHtml(order.paymentStatus)}</span>
    <span class="badge"><strong>${escapeHtml(formatMoney(order.totalAmount, order.currency))} total</strong></span>
  </div>

  <div class="grid">
    <section>
      <h2>Order</h2>
      <div class="row"><span class="label">Order number</span><span class="value">${escapeHtml(displayText(order.orderNumber))}</span></div>
      <div class="row"><span class="label">Ordered on</span><span class="value">${escapeHtml(formatOrderDateTime(order.orderDate))}</span></div>
      ${order.updatedAt ? `<div class="row"><span class="label">Last updated</span><span class="value">${escapeHtml(formatOrderDateTime(order.updatedAt))}</span></div>` : ''}
      ${order.deliveryDate ? `<div class="row"><span class="label">Delivered on</span><span class="value">${escapeHtml(formatOrderDateTime(order.deliveryDate))}</span></div>` : ''}
    </section>
    <section>
      <h2>Customer</h2>
      <div class="row"><span class="label">Name</span><span class="value">${escapeHtml(displayText(order.customerName))}</span></div>
      <div class="row"><span class="label">Email</span><span class="value">${escapeHtml(displayText(order.customerEmail))}</span></div>
      <div class="row"><span class="label">Phone</span><span class="value">${escapeHtml(displayText(order.customerPhone))}</span></div>
    </section>
  </div>

  <section>
    <h2>Payment</h2>
    ${order.paymentId ? `<div class="row"><span class="label">Payment ID</span><span class="value">${escapeHtml(order.paymentId)}</span></div>` : ''}
    ${order.transactionId ? `<div class="row"><span class="label">Transaction ID</span><span class="value">${escapeHtml(order.transactionId)}</span></div>` : ''}
    <div class="row"><span class="label">Payment method</span><span class="value">${escapeHtml(paymentMethod)}</span></div>
    <div class="row"><span class="label">Payment status</span><span class="value">${escapeHtml(order.paymentStatus)}</span></div>
    <div class="row"><span class="label">Total amount</span><span class="value">${escapeHtml(formatMoney(order.totalAmount, order.currency))}</span></div>
    ${order.paidAt ? `<div class="row"><span class="label">Paid at</span><span class="value">${escapeHtml(formatOrderDateTime(order.paidAt))}</span></div>` : ''}
  </section>

  <section>
    <h2>Shipping address</h2>
    <p>${escapeHtml(formatFullShippingAddress(order.shippingAddress))}</p>
    ${order.deliveryNotes?.trim() ? `<p><strong>Delivery notes:</strong> ${escapeHtml(order.deliveryNotes.trim())}</p>` : ''}
  </section>

  <section>
    <h2>M&P Courier</h2>
    ${order.mnpBookingError?.trim() ? `<p style="color:#92400e">Booking note: ${escapeHtml(order.mnpBookingError.trim())}</p>` : ''}
    <div class="row"><span class="label">Current status</span><span class="value">${escapeHtml(order.mnpStatus)}</span></div>
    <div class="row"><span class="label">Consignment #</span><span class="value">${escapeHtml(displayText(order.mnpConsignment))}</span></div>
    ${order.mnpBookedAt ? `<div class="row"><span class="label">Booked at</span><span class="value">${escapeHtml(formatOrderDateTime(order.mnpBookedAt))}</span></div>` : ''}
    ${order.mnpBookingMessage?.trim() ? `<p><strong>M&P message:</strong> ${escapeHtml(order.mnpBookingMessage.trim())}</p>` : ''}
    ${mnpEvents ? `<div><strong>Tracking history</strong>${mnpEvents}</div>` : ''}
  </section>

  <section>
    <h2>Line items</h2>
    <table>
      <thead>
        <tr><th>Product</th><th>SKU</th><th>Qty</th><th>Unit</th><th>Line total</th></tr>
      </thead>
      <tbody>${itemRows}</tbody>
      <tfoot>
        <tr><td colspan="4" style="text-align:right">Subtotal</td><td style="text-align:right">${formatMoney(order.subtotal, order.currency)}</td></tr>
        <tr><td colspan="4" style="text-align:right">Delivery charges</td><td style="text-align:right">${formatMoney(order.deliveryCharges, order.currency)}</td></tr>
        <tr><td colspan="4" style="text-align:right">Total amount</td><td style="text-align:right">${formatMoney(order.totalAmount, order.currency)}</td></tr>
      </tfoot>
    </table>
  </section>

  ${order.failedReason?.trim() ? `<section><h2>Failure reason</h2><p>${escapeHtml(order.failedReason.trim())}</p></section>` : ''}
  ${order.notes?.trim() ? `<section><h2>Notes</h2><p>${escapeHtml(order.notes.trim())}</p></section>` : ''}
</body>
</html>`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function printOrderDetail(order: OrderDetailExport) {
  const html = buildPrintHtml(order);
  const win = window.open('', '_blank', 'noopener,noreferrer,width=900,height=700');
  if (!win) {
    throw new Error('Pop-up blocked. Allow pop-ups to print this order.');
  }
  win.document.open();
  win.document.write(html);
  win.document.close();
  win.focus();
  win.onload = () => {
    win.print();
  };
}

export function downloadOrderDetailPdf(order: OrderDetailExport) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const margin = 14;
  let y = 14;

  doc.setFontSize(16);
  doc.setTextColor(15, 76, 105);
  doc.text('Ambassador Commercial Kitchen Equipment', margin, y);
  y += 8;

  doc.setFontSize(13);
  doc.setTextColor(30, 30, 30);
  doc.text(`Order ${displayText(order.orderNumber)}`, margin, y);
  y += 6;

  doc.setFontSize(9);
  doc.setTextColor(90, 90, 90);
  doc.text(`Placed ${formatOrderDateTime(order.orderDate)}`, margin, y);
  y += 5;
  doc.text(`M&P: ${order.mnpStatus}  ·  Payment: ${order.paymentStatus}  ·  ${formatMoney(order.totalAmount, order.currency)}`, margin, y);
  y += 8;

  const addSection = (title: string, lines: string[]) => {
    if (y > 260) {
      doc.addPage();
      y = 14;
    }
    doc.setFontSize(10);
    doc.setTextColor(15, 76, 105);
    doc.text(title.toUpperCase(), margin, y);
    y += 5;
    doc.setFontSize(9);
    doc.setTextColor(50, 50, 50);
    for (const line of lines) {
      const wrapped = doc.splitTextToSize(line, 182);
      doc.text(wrapped, margin, y);
      y += wrapped.length * 4.5 + 1;
    }
    y += 3;
  };

  addSection('Customer', [
    `Name: ${displayText(order.customerName)}`,
    `Email: ${displayText(order.customerEmail)}`,
    `Phone: ${displayText(order.customerPhone)}`,
  ]);

  addSection('Payment', [
    ...(order.paymentId ? [`Payment ID: ${order.paymentId}`] : []),
    ...(order.transactionId ? [`Transaction ID: ${order.transactionId}`] : []),
    `Method: ${formatPaymentMethodLabel(order.paymentMethod)}`,
    `Status: ${order.paymentStatus}`,
    `Total: ${formatMoney(order.totalAmount, order.currency)}`,
    ...(order.paidAt ? [`Paid at: ${formatOrderDateTime(order.paidAt)}`] : []),
  ]);

  addSection('Shipping', [
    formatFullShippingAddress(order.shippingAddress),
    ...(order.deliveryNotes?.trim() ? [`Notes: ${order.deliveryNotes.trim()}`] : []),
  ]);

  addSection('M&P Courier', [
    `Status: ${order.mnpStatus}`,
    `Consignment: ${displayText(order.mnpConsignment)}`,
    ...(order.mnpBookedAt ? [`Booked at: ${formatOrderDateTime(order.mnpBookedAt)}`] : []),
    ...(order.mnpBookingMessage?.trim() ? [`Message: ${order.mnpBookingMessage.trim()}`] : []),
    ...(order.mnpBookingError?.trim() ? [`Booking note: ${order.mnpBookingError.trim()}`] : []),
  ]);

  const rows = order.items.map((item) => [
    displayText(item.productName),
    item.sku?.trim() || '—',
    String(item.quantity),
    formatMoney(item.price, order.currency),
    formatMoney(item.total, order.currency),
  ]);

  autoTable(doc, {
    startY: y,
    head: [['Product', 'SKU', 'Qty', 'Unit', 'Total']],
    body: rows,
    foot: [
      ['', '', '', 'Subtotal', formatMoney(order.subtotal, order.currency)],
      ['', '', '', 'Delivery', formatMoney(order.deliveryCharges, order.currency)],
      ['', '', '', 'Total', formatMoney(order.totalAmount, order.currency)],
    ],
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [15, 76, 105], textColor: 255 },
    margin: { left: margin, right: margin },
  });

  const safeName = order.orderNumber.replace(/[^\w-]+/g, '_');
  doc.save(`order-${safeName}.pdf`);
}
