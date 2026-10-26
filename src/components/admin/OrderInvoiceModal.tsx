import React, { useState } from 'react';
import { CustomerOrder, Invoice } from '../../types';
import { formatBDT } from '../../utils/currency';
import { useStore } from '../../context/StoreContext';
import { triggerInvoiceNumberNotification } from '../../utils/notifications';
import { X, Printer, CheckCircle2, Truck, Phone, Mail, MapPin, MessageCircle, Send, Copy, Check, Sparkles, FileDown, Loader2 } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface OrderInvoiceModalProps {
  order?: CustomerOrder;
  invoice?: Invoice;
  onClose: () => void;
}

export const OrderInvoiceModal: React.FC<OrderInvoiceModalProps> = ({ order, invoice: propInvoice, onClose }) => {
  const { getInvoiceByOrderId, markInvoiceSent } = useStore();
  const [copied, setCopied] = useState(false);
  const [sentStatus, setSentStatus] = useState<string | null>(null);
  const [isExportingPDF, setIsExportingPDF] = useState(false);

  // Determine effective invoice and order data
  const invoice = propInvoice || (order ? getInvoiceByOrderId(order.id) : undefined);

  // Normalized display fields
  const invoiceNumber = invoice?.id || order?.invoiceId || `INV-${new Date().getFullYear()}-${order?.id?.slice(-4) || 'PREVIEW'}`;
  const orderId = invoice?.orderId || order?.id || 'DH-ORDER';
  const customerName = invoice?.customerName || order?.customerName || 'Customer';
  const phone = invoice?.phone || order?.phone || '';
  const email = invoice?.email || order?.email || '';
  const address = invoice?.address || order?.address || '';
  const city = invoice?.city || order?.city || '';
  const status = invoice?.status || order?.status || 'Confirmed';
  const paymentMethod = invoice?.paymentMethod || order?.paymentMethod || 'Cash on Delivery (COD)';
  const courier = invoice?.courier || order?.courier;
  const trackingCode = invoice?.trackingCode || order?.trackingCode;
  const notes = invoice?.notes || order?.notes;
  const items = invoice?.items || order?.items || [];
  const subtotal = invoice?.subtotal ?? order?.subtotal ?? 0;
  const shipping = invoice?.shipping ?? order?.shipping ?? 0;
  const total = invoice?.total ?? order?.total ?? 0;
  const invoiceDate = invoice?.createdAt || order?.invoiceSavedAt || order?.createdAt || new Date().toISOString();

  // Virtual invoice object for notification generator
  const effectiveInvoice: Invoice = invoice || {
    id: invoiceNumber,
    orderId,
    createdAt: invoiceDate,
    orderDate: order?.createdAt || invoiceDate,
    customerName,
    email,
    phone,
    address,
    city,
    items,
    subtotal,
    shipping,
    total,
    status: (status === 'Pending' ? 'Confirmed' : status) as any,
    paymentMethod,
    courier,
    trackingCode,
    notes,
  };

  const notif = triggerInvoiceNumberNotification(effectiveInvoice);

  const handlePrint = () => {
    const invoiceEl = document.getElementById('printable-invoice');
    if (!invoiceEl) {
      window.print();
      return;
    }

    // Clean up any lingering print iframes
    const oldFrame = document.getElementById('dhong-isolated-print-frame');
    if (oldFrame) oldFrame.remove();

    const iframe = document.createElement('iframe');
    iframe.id = 'dhong-isolated-print-frame';
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) {
      window.print();
      return;
    }

    // Clone invoice content and strip UI controls
    const clone = invoiceEl.cloneNode(true) as HTMLElement;
    clone.querySelectorAll('.print\\:hidden').forEach((el) => el.remove());

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>Invoice ${invoiceNumber}</title>
        <style>
          @page {
            size: A4 portrait;
            margin: 8mm 10mm;
          }
          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            background: #ffffff !important;
            color: #111827 !important;
            margin: 0;
            padding: 0;
            font-size: 11px;
            line-height: 1.35;
          }
          .invoice-page {
            width: 100%;
            max-width: 190mm;
            margin: 0 auto;
            page-break-inside: avoid;
          }
          table {
            width: 100%;
            border-collapse: collapse;
          }
          th, td {
            padding: 5px 8px;
          }
          img {
            max-height: 40px;
            object-fit: contain;
          }
          .flex { display: flex; }
          .justify-between { justify-content: space-between; }
          .justify-end { justify-content: flex-end; }
          .items-start { align-items: flex-start; }
          .items-center { align-items: center; }
          .grid { display: grid; }
          .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .gap-1 { gap: 4px; }
          .gap-2 { gap: 8px; }
          .gap-3 { gap: 12px; }
          .gap-4 { gap: 14px; }
          .space-y-3 > * + * { margin-top: 10px; }
          .space-y-4 > * + * { margin-top: 12px; }
          .space-y-5 > * + * { margin-top: 14px; }
          .space-y-6 > * + * { margin-top: 16px; }
          .space-y-1\\.5 > * + * { margin-top: 5px; }
          .space-y-1 > * + * { margin-top: 3px; }
          .border-b { border-bottom: 1px solid #e5e7eb; }
          .border-t { border-top: 1px solid #e5e7eb; }
          .border { border: 1px solid #e5e7eb; }
          .border-b-2 { border-bottom: 2px solid #111827; }
          .border-red-200 { border-color: #fecaca; }
          .rounded-lg { border-radius: 6px; }
          .rounded-xl { border-radius: 10px; }
          .text-right { text-align: right; }
          .text-center { text-align: center; }
          .font-bold { font-weight: 700; }
          .font-semibold { font-weight: 600; }
          .font-medium { font-weight: 500; }
          .font-mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; }
          .text-xs { font-size: 11px; }
          .text-sm { font-size: 12px; }
          .text-base { font-size: 14px; }
          .text-lg { font-size: 16px; }
          .text-2xl { font-size: 20px; }
          .text-neutral-950 { color: #030712; }
          .text-neutral-900 { color: #111827; }
          .text-neutral-800 { color: #1f2937; }
          .text-neutral-700 { color: #374151; }
          .text-neutral-600 { color: #4b5563; }
          .text-neutral-500 { color: #6b7280; }
          .text-neutral-400 { color: #9ca3af; }
          .text-red-600 { color: #dc2626; }
          .text-red-700 { color: #b91c1c; }
          .text-red-800 { color: #991b1b; }
          .text-emerald-700 { color: #047857; }
          .text-emerald-800 { color: #065f46; }
          .bg-neutral-50 { background-color: #f9fafb; }
          .bg-neutral-100 { background-color: #f3f4f6; }
          .bg-red-50 { background-color: #fef2f2; }
          .bg-emerald-100 { background-color: #d1fae5; }
          .bg-white { background-color: #ffffff; }
          .w-64 { width: 230px; }
          .w-full { width: 100%; }
          .py-1 { padding-top: 3px; padding-bottom: 3px; }
          .py-2 { padding-top: 5px; padding-bottom: 5px; }
          .py-2\\.5 { padding-top: 6px; padding-bottom: 6px; }
          .px-2\\.5 { padding-left: 8px; padding-right: 8px; }
          .px-3 { padding-left: 10px; padding-right: 10px; }
          .p-3 { padding: 8px 10px; }
          .p-4 { padding: 10px 12px; }
          .pb-3 { padding-bottom: 8px; }
          .pb-4 { padding-bottom: 10px; }
          .pb-5 { padding-bottom: 12px; }
          .pt-3 { padding-top: 8px; }
          .pt-4 { padding-top: 10px; }
          .uppercase { text-transform: uppercase; }
          .tracking-wider { letter-spacing: 0.05em; }
          .tracking-widest { letter-spacing: 0.08em; }
          .inline-flex { display: inline-flex; }
          .no-print, .print\\:hidden { display: none !important; }
        </style>
      </head>
      <body>
        <div class="invoice-page">
          ${clone.innerHTML}
        </div>
      </body>
      </html>
    `);
    doc.close();

    setTimeout(() => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch (err) {
        console.error('Print iframe error:', err);
        window.print();
      } finally {
        setTimeout(() => {
          if (document.body.contains(iframe)) {
            iframe.remove();
          }
        }, 1500);
      }
    }, 250);
  };

  const handleExportPDF = async () => {
    const invoiceEl = document.getElementById('printable-invoice');
    if (!invoiceEl) return;

    setIsExportingPDF(true);
    try {
      const hiddenEls = invoiceEl.querySelectorAll('.print\\:hidden');
      hiddenEls.forEach((el) => ((el as HTMLElement).style.display = 'none'));

      const canvas = await html2canvas(invoiceEl, {
        scale: 2.5,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      hiddenEls.forEach((el) => ((el as HTMLElement).style.display = ''));

      const imgData = canvas.toDataURL('image/jpeg', 0.98);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 8;
      const printWidth = pageWidth - margin * 2;
      const printHeight = (canvas.height * printWidth) / canvas.width;

      if (printHeight <= pageHeight - margin * 2) {
        pdf.addImage(imgData, 'JPEG', margin, margin, printWidth, printHeight);
      } else {
        let heightLeft = printHeight;
        let position = margin;
        pdf.addImage(imgData, 'JPEG', margin, position, printWidth, printHeight);
        heightLeft -= (pageHeight - margin * 2);

        while (heightLeft > 0) {
          position = position - (pageHeight - margin * 2);
          pdf.addPage();
          pdf.addImage(imgData, 'JPEG', margin, position, printWidth, printHeight);
          heightLeft -= (pageHeight - margin * 2);
        }
      }

      pdf.save(`Dhong_Invoice_${invoiceNumber}.pdf`);
    } catch (err) {
      console.error('Error generating PDF:', err);
      alert('PDF generation could not complete. Please use Print Invoice -> Save as PDF.');
    } finally {
      setIsExportingPDF(false);
    }
  };

  const handleCopyInvoiceNumber = () => {
    navigator.clipboard?.writeText(invoiceNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleWhatsAppSend = () => {
    if (invoice?.id) {
      markInvoiceSent(invoice.id, 'whatsapp');
    }
    setSentStatus('Invoice sent via WhatsApp!');
    setTimeout(() => setSentStatus(null), 3500);
    window.open(notif.whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  const handleGmailSend = () => {
    if (invoice?.id) {
      markInvoiceSent(invoice.id, 'email');
    }
    setSentStatus('Invoice sent via Gmail!');
    setTimeout(() => setSentStatus(null), 3500);
    const targetUrl = notif.gmailUrl || notif.mailtoUrl;
    if (targetUrl) {
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fadeIn text-neutral-900">
      <div 
        className="relative w-full max-w-2xl bg-white text-neutral-900 rounded-3xl shadow-2xl overflow-hidden print:m-0 print:shadow-none print:w-full print:max-w-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Actions (Hidden when printing) */}
        <div className="p-4 bg-neutral-950 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800 print:hidden">
          <div className="flex items-center gap-2">
            <span className="font-brand font-bold text-red-500 tracking-wider">DHONG BD</span>
            <span className="text-xs text-neutral-400">• Official Tax Invoice</span>
            <span className="font-mono text-xs px-2 py-0.5 rounded bg-neutral-800 text-neutral-200 border border-neutral-700 font-bold">
              {invoiceNumber}
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* WhatsApp Send Action */}
            <button
              onClick={handleWhatsAppSend}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
              title="Send official invoice number to customer's WhatsApp"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Send WhatsApp</span>
            </button>

            {/* Gmail Send Action */}
            {email && (
              <button
                onClick={handleGmailSend}
                className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                title="Send official invoice number to customer's Gmail"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Send Gmail</span>
              </button>
            )}

            {/* Convert to PDF Button */}
            <button
              id="top-pdf-invoice-btn"
              onClick={handleExportPDF}
              disabled={isExportingPDF}
              className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
              title="Download official invoice as A4 PDF document"
            >
              {isExportingPDF ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Converting...</span>
                </>
              ) : (
                <>
                  <FileDown className="w-3.5 h-3.5" />
                  <span>Convert to PDF</span>
                </>
              )}
            </button>

            {/* Print Action */}
            <button
              id="top-print-invoice-btn"
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-neutral-100 text-neutral-900 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer border border-neutral-300"
              title="Print official invoice (A4 1-Page)"
            >
              <Printer className="w-3.5 h-3.5 text-red-600" />
              <span>Print Invoice</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {sentStatus && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-4 py-2 text-xs text-emerald-800 flex items-center justify-between print:hidden">
            <span className="flex items-center gap-1.5 font-medium">
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              {sentStatus}
            </span>
            <span className="text-[11px] text-emerald-700">Dispatched automatically to customer</span>
          </div>
        )}

        {/* Printable Invoice Body */}
        <div id="printable-invoice" className="p-5 sm:p-6 space-y-4 print:p-6 bg-white max-w-[210mm] mx-auto text-neutral-900">
          
          {/* Header */}
          <div className="flex justify-between items-start border-b border-neutral-200 pb-5">
            <div>
              <div className="flex items-center gap-2.5">
                <img
                  src="https://i.ibb.co.com/zVVGNSpd/bg.png"
                  alt="Dhong"
                  className="h-10 w-auto object-contain"
                />
                <div>
                  <div className="flex items-center gap-1">
                    <span className="font-brand text-2xl font-bold tracking-widest text-neutral-950">
                      DHONG
                    </span>
                    <span className="text-xs text-red-600 font-semibold ml-2">ঢং ফ্যাশন</span>
                  </div>
                  <p className="text-[10px] text-red-600 font-bold uppercase tracking-[0.2em] -mt-0.5">
                    "Come meet the new you"
                  </p>
                </div>
              </div>
              <p className="text-xs text-neutral-500 tracking-wider mt-1.5 uppercase">
                High Fashion & Designer Dresses • Bangladesh
              </p>
              <p className="text-[11px] text-neutral-400 mt-0.5">
                Asiatic Shopping Complex, Konapara, Al-Amin Road, Demra, Dhaka-1362 • Helpline: <a href="tel:01790141399" className="hover:underline text-neutral-600 font-medium">01790141399</a> • <a href="mailto:dhong.shop.bd@gmail.com" className="hover:underline text-neutral-600 font-medium">dhong.shop.bd@gmail.com</a>
              </p>
            </div>

            <div className="text-right">
              <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-50 border border-red-200 text-red-800 font-mono font-bold text-sm mb-1">
                <span>{invoiceNumber}</span>
                <button
                  type="button"
                  onClick={handleCopyInvoiceNumber}
                  className="text-red-500 hover:text-red-700 p-0.5 print:hidden cursor-pointer"
                  title="Copy Invoice Number"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <div className="text-[10px] text-neutral-500 font-mono">
                Order Ref: <strong className="text-neutral-800">{orderId}</strong>
              </div>
              <div className="text-xs text-neutral-500 mt-0.5">
                Date: {new Date(invoiceDate).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
              </div>
              <div className="mt-1">
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                  status === 'Delivered'
                    ? 'bg-emerald-100 text-emerald-800'
                    : status === 'Shipped'
                    ? 'bg-purple-100 text-purple-800'
                    : status === 'Confirmed'
                    ? 'bg-blue-100 text-blue-800'
                    : status === 'Cancelled'
                    ? 'bg-rose-100 text-rose-800'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  Status: {status}
                </span>
              </div>
            </div>
          </div>

          {/* Customer & Shipping Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-neutral-50 border border-neutral-200 text-xs">
            <div>
              <h4 className="font-bold text-neutral-900 uppercase tracking-wider text-[10px] mb-2 flex items-center gap-1 text-red-700">
                <MapPin className="w-3.5 h-3.5" />
                Delivery Information
              </h4>
              <p className="font-bold text-neutral-900 text-sm">{customerName}</p>
              <p className="text-neutral-600 mt-1 leading-relaxed">{address}</p>
              <p className="text-neutral-700 font-medium">{city}, Bangladesh</p>
            </div>

            <div>
              <h4 className="font-bold text-neutral-900 uppercase tracking-wider text-[10px] mb-2 flex items-center gap-1 text-red-700">
                <Phone className="w-3.5 h-3.5" />
                Contact & Logistics
              </h4>
              <p className="text-neutral-700">
                <strong>WhatsApp / Phone:</strong> <span className="font-mono">{phone}</span>
              </p>
              {email && (
                <p className="text-neutral-700 mt-0.5">
                  <strong>Gmail / Email:</strong> {email}
                </p>
              )}
              <p className="text-neutral-700 mt-1">
                <strong>Payment:</strong> <span className="font-semibold text-neutral-900">{paymentMethod}</span>
              </p>
              {courier && (
                <p className="text-neutral-700 mt-0.5">
                  <strong>Courier:</strong> {courier} {trackingCode ? `(#${trackingCode})` : ''}
                </p>
              )}
            </div>
          </div>

          {/* Order Items Table */}
          <div>
            <h4 className="font-bold text-neutral-900 text-xs uppercase tracking-wider mb-2">
              Dresses in this Invoice
            </h4>
            <div className="border border-neutral-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-100 border-b border-neutral-200 text-neutral-600 text-[10px] uppercase font-bold tracking-wider">
                  <tr>
                    <th className="py-2.5 px-3">Item Description</th>
                    <th className="py-2.5 px-3 text-center">Size</th>
                    <th className="py-2.5 px-3 text-center">Qty</th>
                    <th className="py-2.5 px-3 text-right">Unit Price</th>
                    <th className="py-2.5 px-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-neutral-50">
                      <td className="py-2.5 px-3 flex items-center gap-2">
                        {item.imageUrl && (
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-9 h-11 rounded object-cover border border-neutral-200 print:hidden"
                          />
                        )}
                        <span className="font-medium text-neutral-900">{item.name}</span>
                      </td>
                      <td className="py-2.5 px-3 text-center font-bold">{item.size}</td>
                      <td className="py-2.5 px-3 text-center">{item.quantity}</td>
                      <td className="py-2.5 px-3 text-right text-neutral-600">{formatBDT(item.price)}</td>
                      <td className="py-2.5 px-3 text-right font-semibold text-neutral-900">
                        {formatBDT(item.price * item.quantity)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals Summary */}
          <div className="flex justify-end">
            <div className="w-64 space-y-1.5 text-xs text-neutral-700">
              <div className="flex justify-between py-1 border-b border-neutral-200">
                <span>Subtotal:</span>
                <span className="font-semibold text-neutral-900">{formatBDT(subtotal)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-neutral-200">
                <span>Nationwide Shipping:</span>
                <span>{shipping === 0 ? 'FREE' : formatBDT(shipping)}</span>
              </div>
              <div className="flex justify-between py-2 text-sm font-bold text-neutral-950 border-b-2 border-neutral-900">
                <span>Grand Total (BDT):</span>
                <span className="text-red-700 font-brand text-base">{formatBDT(total)}</span>
              </div>
            </div>
          </div>

          {/* Notes if any */}
          {notes && (
            <div className="p-3 bg-neutral-100 border border-neutral-300 rounded-xl text-xs text-neutral-800">
              <strong>Order Notes / Special Instructions:</strong> {notes}
            </div>
          )}

          {/* Footer Notice */}
          <div className="border-t border-neutral-200 pt-4 text-center text-[10px] text-neutral-400 space-y-1">
            <p className="font-medium text-neutral-600">Dhong Bangladesh (ঢং) — "Come meet the new you"</p>
            <p>Thank you for choosing Dhong for exclusive couture & designer wear.</p>
            <p>For inquiries within Bangladesh, call <a href="tel:01790141399" className="font-semibold text-neutral-700 hover:underline">01790141399</a> or WhatsApp <a href="https://wa.me/8801790141399" target="_blank" rel="noopener noreferrer" className="font-semibold text-emerald-700 hover:underline">+8801790141399</a> with Invoice #{invoiceNumber}.</p>
          </div>

        </div>

        {/* Modal Bottom Actions Bar (Hidden when printing) */}
        <div className="p-4 bg-neutral-50 border-t border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 print:hidden">
          <div className="text-xs text-neutral-500 font-medium">
            Official Invoice: <strong className="text-neutral-900 font-mono">{invoiceNumber}</strong>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              id="bottom-pdf-invoice-btn"
              onClick={handleExportPDF}
              disabled={isExportingPDF}
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-2 shadow-md transition-all cursor-pointer"
              title="Download official invoice as A4 PDF document"
            >
              {isExportingPDF ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Converting PDF...</span>
                </>
              ) : (
                <>
                  <FileDown className="w-4 h-4" />
                  <span>Convert to PDF</span>
                </>
              )}
            </button>

            <button
              id="bottom-print-invoice-btn"
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-black text-white text-xs font-bold flex items-center gap-2 shadow-md transition-all cursor-pointer"
              title="Print official invoice (A4 1-Page)"
            >
              <Printer className="w-4 h-4 text-red-400" />
              <span>Print Invoice</span>
            </button>

            <button
              onClick={handleWhatsAppSend}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Send WhatsApp</span>
            </button>

            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white hover:bg-neutral-100 text-neutral-700 text-xs font-semibold border border-neutral-300 transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
