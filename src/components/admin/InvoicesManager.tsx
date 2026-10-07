import React, { useState, useMemo } from 'react';
import { useStore } from '../../context/StoreContext';
import { Invoice } from '../../types';
import { formatBDT } from '../../utils/currency';
import { triggerInvoiceNumberNotification } from '../../utils/notifications';
import { OrderInvoiceModal } from './OrderInvoiceModal';
import {
  FileText,
  Search,
  Filter,
  CheckCircle2,
  Printer,
  Trash2,
  MessageCircle,
  Mail,
  Copy,
  Check,
  Send,
  Calendar,
  DollarSign,
  AlertCircle,
  Truck,
  MapPin,
  ExternalLink,
  ShoppingBag,
} from 'lucide-react';

export const InvoicesManager: React.FC = () => {
  const { invoices, deleteInvoice, markInvoiceSent, orders } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | Invoice['status']>('ALL');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [invoiceToDelete, setInvoiceToDelete] = useState<Invoice | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const showNotice = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 4000);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleSendWhatsApp = (inv: Invoice) => {
    markInvoiceSent(inv.id, 'whatsapp');
    const notif = triggerInvoiceNumberNotification(inv);
    showNotice(`Invoice ${inv.id} dispatched via WhatsApp to ${inv.phone}`);
    window.open(notif.whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  const handleSendGmail = (inv: Invoice) => {
    markInvoiceSent(inv.id, 'email');
    const notif = triggerInvoiceNumberNotification(inv);
    showNotice(`Invoice ${inv.id} prepared for Gmail dispatch to ${inv.email}`);
    const targetUrl = notif.gmailUrl || notif.mailtoUrl;
    if (targetUrl) {
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleConfirmDelete = () => {
    if (!invoiceToDelete) return;
    const invId = invoiceToDelete.id;
    deleteInvoice(invId);
    setInvoiceToDelete(null);
    showNotice(`Invoice ${invId} deleted from database.`);
  };

  // Metrics from saved invoices
  const metrics = useMemo(() => {
    const total = invoices.length;
    const totalAmount = invoices
      .filter((i) => i.status !== 'Cancelled')
      .reduce((sum, i) => sum + i.total, 0);
    const sentWhatsApp = invoices.filter((i) => Boolean(i.whatsappSentAt)).length;
    const sentEmail = invoices.filter((i) => Boolean(i.emailSentAt)).length;

    return {
      total,
      totalAmount,
      sentWhatsApp,
      sentEmail,
    };
  }, [invoices]);

  // Filtered & searched invoices
  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      // Status filter
      if (statusFilter !== 'ALL' && inv.status !== statusFilter) {
        return false;
      }

      // Search query across all invoice and customer attributes
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesInvoiceNum = inv.id.toLowerCase().includes(q);
        const matchesOrderRef = inv.orderId.toLowerCase().includes(q);
        const matchesName = inv.customerName.toLowerCase().includes(q);
        const matchesPhone = inv.phone.toLowerCase().includes(q);
        const matchesEmail = (inv.email || '').toLowerCase().includes(q);
        const matchesCity = inv.city.toLowerCase().includes(q);
        const matchesAddress = inv.address.toLowerCase().includes(q);
        const matchesItems = inv.items.some((it) => it.name.toLowerCase().includes(q));

        if (
          !matchesInvoiceNum &&
          !matchesOrderRef &&
          !matchesName &&
          !matchesPhone &&
          !matchesEmail &&
          !matchesCity &&
          !matchesAddress &&
          !matchesItems
        ) {
          return false;
        }
      }

      return true;
    });
  }, [invoices, statusFilter, searchQuery]);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-brand text-2xl font-bold tracking-tight text-neutral-100 flex items-center gap-2">
            <FileText className="w-6 h-6 text-red-500" />
            Saved Invoices & Billing Database ({invoices.length})
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Official tax invoices are saved here immediately after you confirm an order. Search any previous invoice by Invoice #, Order #, Phone, or Customer Name.
          </p>
        </div>
      </div>

      {actionNotice && (
        <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4">
          <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Total Saved Invoices</div>
          <div className="font-brand text-2xl font-bold text-neutral-100 mt-1">{metrics.total}</div>
          <div className="text-[10px] text-neutral-500 mt-0.5">Stored permanently in database</div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4">
          <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Invoiced Revenue</div>
          <div className="font-brand text-xl font-bold text-red-400 mt-1">{formatBDT(metrics.totalAmount)}</div>
          <div className="text-[10px] text-neutral-500 mt-0.5">Confirmed & active billing</div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4">
          <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">WhatsApp Dispatches</div>
          <div className="font-brand text-2xl font-bold text-emerald-400 mt-1">{metrics.sentWhatsApp}</div>
          <div className="text-[10px] text-neutral-500 mt-0.5">Invoices sent to customer WhatsApp</div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4">
          <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Gmail Dispatches</div>
          <div className="font-brand text-2xl font-bold text-rose-400 mt-1">{metrics.sentEmail}</div>
          <div className="text-[10px] text-neutral-500 mt-0.5">Invoices sent to customer email</div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 flex flex-col md:flex-row gap-3 items-center justify-between shadow-lg">
        {/* Search Input */}
        <div className="relative w-full md:max-w-md">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search saved invoices by INV-..., Order #, Customer, Phone, or City..."
            className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-neutral-200 placeholder:text-neutral-500 focus:outline-none focus:border-red-500 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-neutral-500 hover:text-neutral-300 text-xs"
            >
              Clear
            </button>
          )}
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {(['ALL', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium tracking-wide transition-all shrink-0 cursor-pointer ${
                statusFilter === st
                  ? 'bg-[#e32117] text-white font-bold shadow-md shadow-red-600/20'
                  : 'bg-neutral-950 text-neutral-400 hover:text-neutral-200 border border-neutral-800'
              }`}
            >
              {st === 'ALL' ? 'All Invoices' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Invoices List */}
      {filteredInvoices.length === 0 ? (
        <div className="p-12 text-center bg-neutral-900 border border-neutral-800 rounded-2xl space-y-3">
          <FileText className="w-10 h-10 text-neutral-600 mx-auto" />
          <h3 className="font-brand text-lg font-semibold text-neutral-300">No Saved Invoices Found</h3>
          <p className="text-xs text-neutral-500 max-w-md mx-auto">
            {invoices.length === 0
              ? 'No invoices have been saved yet. As per your store model, invoices are saved automatically into the database as soon as you confirm an order.'
              : `No invoices match "${searchQuery || statusFilter}". Try searching with a different Invoice Number or Customer Phone.`}
          </p>
          {(searchQuery || statusFilter !== 'ALL') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('ALL');
              }}
              className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold cursor-pointer"
            >
              Clear Search & Show All
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3.5">
          {filteredInvoices.map((inv) => {
            const isCopied = copiedId === inv.id;
            return (
              <div
                key={inv.id}
                className="bg-neutral-900 border border-neutral-800 hover:border-neutral-700 rounded-2xl p-4.5 space-y-3 transition-all shadow-md group"
              >
                {/* Header: Invoice ID, Order Ref, Date, Status, Total */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800 pb-3">
                  <div className="flex items-center gap-3 flex-wrap">
                    {/* Invoice ID badge with copy */}
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-950/60 border border-red-500/40 text-red-300 font-mono font-bold text-xs">
                      <span>{inv.id}</span>
                      <button
                        onClick={() => handleCopy(inv.id)}
                        className="p-0.5 hover:text-white transition-colors cursor-pointer"
                        title="Copy Invoice ID"
                      >
                        {isCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-red-400" />}
                      </button>
                    </div>

                    {/* Order Ref */}
                    <span className="text-xs text-neutral-400 font-mono flex items-center gap-1">
                      Order Ref: <strong className="text-neutral-200">{inv.orderId}</strong>
                    </span>

                    {/* Confirmed Date */}
                    <span className="text-[11px] text-neutral-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(inv.createdAt).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>

                    {/* Status badge */}
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      inv.status === 'Delivered'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : inv.status === 'Shipped'
                        ? 'bg-purple-950 text-purple-300 border border-purple-800'
                        : inv.status === 'Confirmed'
                        ? 'bg-blue-950 text-blue-300 border border-blue-800'
                        : inv.status === 'Cancelled'
                        ? 'bg-rose-950 text-rose-300 border border-rose-800'
                        : 'bg-amber-950 text-amber-300 border border-amber-800'
                    }`}>
                      {inv.status}
                    </span>
                  </div>

                  {/* Actions & Total */}
                  <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                    <div className="font-brand font-bold text-base text-red-400 px-3 py-1 rounded-xl bg-neutral-950 border border-neutral-800">
                      {formatBDT(inv.total)}
                    </div>

                    {/* Send WhatsApp Button */}
                    <button
                      onClick={() => handleSendWhatsApp(inv)}
                      className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                        inv.whatsappSentAt
                          ? 'bg-emerald-950/70 border border-emerald-600/50 text-emerald-400 hover:bg-emerald-900'
                          : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm'
                      }`}
                      title={inv.whatsappSentAt ? `Sent on ${new Date(inv.whatsappSentAt).toLocaleTimeString()} - Click to resend` : 'Send Invoice # via WhatsApp'}
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">{inv.whatsappSentAt ? 'WhatsApp Sent' : 'Send WhatsApp'}</span>
                    </button>

                    {/* Send Gmail Button */}
                    {inv.email && (
                      <button
                        onClick={() => handleSendGmail(inv)}
                        className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                          inv.emailSentAt
                            ? 'bg-red-950/70 border border-red-600/50 text-red-300 hover:bg-red-900'
                            : 'bg-red-600 hover:bg-red-500 text-white shadow-sm'
                        }`}
                        title={inv.emailSentAt ? `Sent on ${new Date(inv.emailSentAt).toLocaleTimeString()} - Click to resend` : 'Send Invoice # via Gmail'}
                      >
                        <Mail className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">{inv.emailSentAt ? 'Gmail Sent' : 'Send Gmail'}</span>
                      </button>
                    )}

                    {/* View / Print Invoice */}
                    <button
                      onClick={() => setSelectedInvoice(inv)}
                      className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="View & Print Official Invoice"
                    >
                      <Printer className="w-3.5 h-3.5 text-red-400" />
                      <span>Invoice</span>
                    </button>

                    {/* Delete Invoice */}
                    <button
                      onClick={() => setInvoiceToDelete(inv)}
                      className="p-1.5 rounded-xl bg-neutral-950 hover:bg-rose-950/80 text-neutral-500 hover:text-rose-400 border border-neutral-800 transition-colors cursor-pointer"
                      title="Delete this saved invoice"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Customer Details & Items Summary */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-neutral-950/70 p-3 rounded-xl border border-neutral-800/80">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-neutral-500 block mb-0.5">Billed Customer</span>
                    <span className="font-semibold text-neutral-200">{inv.customerName}</span>
                    <span className="text-neutral-400 block font-mono text-[11px] mt-0.5">{inv.phone}</span>
                    {inv.email && <span className="text-neutral-400 block text-[11px]">{inv.email}</span>}
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-neutral-500 block mb-0.5">Shipping Destination</span>
                    <span className="text-neutral-300 line-clamp-1">{inv.address}</span>
                    <span className="text-red-400/90 font-medium text-[11px] flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3" />
                      {inv.city}, Bangladesh
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-neutral-500 block mb-0.5">
                      Items Invoiced ({inv.items.length})
                    </span>
                    <div className="text-neutral-300 space-y-0.5">
                      {inv.items.map((it, idx) => (
                        <div key={idx} className="line-clamp-1 text-[11px] text-neutral-400">
                          • {it.name} (x{it.quantity}, {it.size})
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* View & Print Invoice Modal */}
      {selectedInvoice && (
        <OrderInvoiceModal
          invoice={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
        />
      )}

      {/* Delete Confirmation Modal (Safe inline dialog, never window.confirm) */}
      {invoiceToDelete && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-500">
              <div className="w-10 h-10 rounded-full bg-rose-950/60 border border-rose-500/40 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <h3 className="font-brand text-lg font-bold text-neutral-100">Delete Saved Invoice?</h3>
                <p className="text-xs text-neutral-400">Permanent database action</p>
              </div>
            </div>

            <p className="text-xs text-neutral-300 leading-relaxed">
              Are you sure you want to delete invoice <strong className="text-red-400 font-mono">{invoiceToDelete.id}</strong> (Order Ref: {invoiceToDelete.orderId}) for <strong>{invoiceToDelete.customerName}</strong>? This record will be removed from your saved database.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setInvoiceToDelete(null)}
                className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
              >
                Yes, Delete Invoice
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
