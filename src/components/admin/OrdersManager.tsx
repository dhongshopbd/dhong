import React, { useState, useMemo } from 'react';
import { useStore } from '../../context/StoreContext';
import { CustomerOrder, DressSize } from '../../types';
import { formatBDT } from '../../utils/currency';
import { OrderInvoiceModal } from './OrderInvoiceModal';
import {
  ShoppingBag,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Truck,
  XCircle,
  Phone,
  Printer,
  Trash2,
  Plus,
  RotateCcw,
  ExternalLink,
  MessageCircle,
  ChevronDown,
  AlertCircle,
  FileText,
  MapPin,
  Calendar,
  CreditCard,
} from 'lucide-react';

export const OrdersManager: React.FC = () => {
  const {
    orders,
    updateOrderStatus,
    deleteOrder,
    addManualOrder,
    resetOrdersToSample,
    products,
  } = useStore();

  const [statusFilter, setStatusFilter] = useState<'ALL' | CustomerOrder['status']>('ALL');
  const [paymentFilter, setPaymentFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<CustomerOrder | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Manual Order Form State
  const [manualName, setManualName] = useState('');
  const [manualPhone, setManualPhone] = useState('');
  const [manualCity, setManualCity] = useState('Dhaka');
  const [manualAddress, setManualAddress] = useState('');
  const [manualPayment, setManualPayment] = useState<'Cash on Delivery (COD)' | 'bKash / Nagad' | 'Debit/Credit Card'>('Cash on Delivery (COD)');
  const [manualCourier, setManualCourier] = useState('Steadfast Courier');
  const [manualTracking, setManualTracking] = useState('');
  const [manualNotes, setManualNotes] = useState('');
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || '');
  const [manualItemSize, setManualItemSize] = useState<DressSize>('M');
  const [manualItemQty, setManualItemQty] = useState(1);

  // Status Counts
  const counts = useMemo(() => {
    return {
      all: orders.length,
      pending: orders.filter((o) => o.status === 'Pending').length,
      confirmed: orders.filter((o) => o.status === 'Confirmed').length,
      shipped: orders.filter((o) => o.status === 'Shipped').length,
      delivered: orders.filter((o) => o.status === 'Delivered').length,
      cancelled: orders.filter((o) => o.status === 'Cancelled').length,
      totalRevenue: orders
        .filter((o) => o.status !== 'Cancelled')
        .reduce((sum, o) => sum + o.total, 0),
    };
  }, [orders]);

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // Status Filter
      if (statusFilter !== 'ALL' && order.status !== statusFilter) {
        return false;
      }

      // Payment Filter
      if (paymentFilter !== 'ALL' && order.paymentMethod !== paymentFilter) {
        return false;
      }

      // Search Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesId = order.id.toLowerCase().includes(q);
        const matchesName = order.customerName.toLowerCase().includes(q);
        const matchesPhone = order.phone.toLowerCase().includes(q);
        const matchesCity = order.city.toLowerCase().includes(q);
        const matchesAddress = order.address.toLowerCase().includes(q);
        const matchesItem = order.items.some((item) =>
          item.name.toLowerCase().includes(q)
        );
        if (!matchesId && !matchesName && !matchesPhone && !matchesCity && !matchesAddress && !matchesItem) {
          return false;
        }
      }

      return true;
    });
  }, [orders, statusFilter, paymentFilter, searchQuery]);

  // Handle Manual Order Submission
  const handleCreateManualOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualName.trim() || !manualPhone.trim() || !manualAddress.trim()) {
      alert('Please fill out Customer Name, Phone, and Address.');
      return;
    }

    const chosenProduct = products.find((p) => p.id === selectedProductId) || products[0];
    const itemPrice = chosenProduct ? chosenProduct.price : 4500;
    const itemSubtotal = itemPrice * manualItemQty;
    const shipping = manualCity.toLowerCase().includes('dhaka') ? 70 : 130;
    const total = itemSubtotal + (itemSubtotal > 5000 ? 0 : shipping);

    addManualOrder({
      customerName: manualName.trim(),
      email: '',
      phone: manualPhone.trim(),
      city: manualCity,
      address: manualAddress.trim(),
      paymentMethod: manualPayment,
      status: 'Confirmed',
      courier: manualCourier,
      trackingCode: manualTracking.trim() || undefined,
      notes: manualNotes.trim() || 'Phone / WhatsApp order recorded by Admin.',
      subtotal: itemSubtotal,
      shipping: itemSubtotal > 5000 ? 0 : shipping,
      total,
      items: [
        {
          productId: chosenProduct ? chosenProduct.id : 'custom',
          name: chosenProduct ? chosenProduct.name : 'Designer Dress',
          price: itemPrice,
          size: manualItemSize,
          quantity: manualItemQty,
          imageUrl: chosenProduct ? chosenProduct.imageUrl : 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=800&q=80',
        },
      ],
    });

    // Reset
    setManualName('');
    setManualPhone('');
    setManualAddress('');
    setManualTracking('');
    setManualNotes('');
    setIsAddModalOpen(false);
  };

  const getStatusBadge = (status: CustomerOrder['status']) => {
    switch (status) {
      case 'Pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
            <Clock className="w-3.5 h-3.5" />
            Pending
          </span>
        );
      case 'Confirmed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Confirmed
          </span>
        );
      case 'Shipped':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
            <Truck className="w-3.5 h-3.5" />
            Shipped
          </span>
        );
      case 'Delivered':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Delivered
          </span>
        );
      case 'Cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
            <XCircle className="w-3.5 h-3.5" />
            Cancelled
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header & Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-brand text-2xl font-bold tracking-tight text-neutral-100 flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-red-500" />
            Master Orders Management ({orders.length})
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Track, filter, verify, and fulfill every customer order across Bangladesh.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-[#e32117] hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-red-600/20 flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Record Order</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (confirm('Reload sample Bangladeshi demonstration orders? This will add preset test orders.')) {
                resetOrdersToSample();
              }
            }}
            className="px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-xs border border-neutral-800 flex items-center gap-1.5 transition-colors"
            title="Reset sample orders for demonstration"
          >
            <RotateCcw className="w-3.5 h-3.5 text-neutral-400" />
            <span className="hidden sm:inline">Reset Demo Orders</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Counter Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div 
          onClick={() => setStatusFilter('ALL')}
          className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
            statusFilter === 'ALL'
              ? 'bg-neutral-850 border-red-500 shadow-md'
              : 'bg-neutral-900 border-neutral-800 hover:border-neutral-700'
          }`}
        >
          <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Total Orders</div>
          <div className="text-xl font-bold text-neutral-100 mt-1">{counts.all}</div>
          <div className="text-[10px] text-red-400 font-mono mt-0.5">{formatBDT(counts.totalRevenue)}</div>
        </div>

        <div 
          onClick={() => setStatusFilter('Pending')}
          className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
            statusFilter === 'Pending'
              ? 'bg-amber-950/40 border-amber-400 shadow-md'
              : 'bg-neutral-900 border-neutral-800 hover:border-neutral-700'
          }`}
        >
          <div className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Pending
          </div>
          <div className="text-xl font-bold text-amber-300 mt-1">{counts.pending}</div>
          <div className="text-[10px] text-neutral-400 mt-0.5">Need Verification</div>
        </div>

        <div 
          onClick={() => setStatusFilter('Confirmed')}
          className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
            statusFilter === 'Confirmed'
              ? 'bg-blue-950/40 border-blue-400 shadow-md'
              : 'bg-neutral-900 border-neutral-800 hover:border-neutral-700'
          }`}
        >
          <div className="text-[10px] font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            Confirmed
          </div>
          <div className="text-xl font-bold text-blue-300 mt-1">{counts.confirmed}</div>
          <div className="text-[10px] text-neutral-400 mt-0.5">Ready for packing</div>
        </div>

        <div 
          onClick={() => setStatusFilter('Shipped')}
          className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
            statusFilter === 'Shipped'
              ? 'bg-purple-950/40 border-purple-400 shadow-md'
              : 'bg-neutral-900 border-neutral-800 hover:border-neutral-700'
          }`}
        >
          <div className="text-[10px] font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1">
            <Truck className="w-3 h-3" />
            Shipped
          </div>
          <div className="text-xl font-bold text-purple-300 mt-1">{counts.shipped}</div>
          <div className="text-[10px] text-neutral-400 mt-0.5">With Courier</div>
        </div>

        <div 
          onClick={() => setStatusFilter('Delivered')}
          className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
            statusFilter === 'Delivered'
              ? 'bg-emerald-950/40 border-emerald-400 shadow-md'
              : 'bg-neutral-900 border-neutral-800 hover:border-neutral-700'
          }`}
        >
          <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            Delivered
          </div>
          <div className="text-xl font-bold text-emerald-300 mt-1">{counts.delivered}</div>
          <div className="text-[10px] text-neutral-400 mt-0.5">Completed</div>
        </div>

        <div 
          onClick={() => setStatusFilter('Cancelled')}
          className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
            statusFilter === 'Cancelled'
              ? 'bg-rose-950/40 border-rose-400 shadow-md'
              : 'bg-neutral-900 border-neutral-800 hover:border-neutral-700'
          }`}
        >
          <div className="text-[10px] font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1">
            <XCircle className="w-3 h-3" />
            Cancelled
          </div>
          <div className="text-xl font-bold text-rose-300 mt-1">{counts.cancelled}</div>
          <div className="text-[10px] text-neutral-400 mt-0.5">Void / Returned</div>
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 flex flex-col md:flex-row gap-3 items-center justify-between">
        
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by ID, client, phone 017..., address..."
            className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-10 pr-4 py-2 text-xs text-neutral-200 placeholder:text-neutral-500 focus:outline-none focus:border-red-500 transition-colors"
          />
        </div>

        {/* Status Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto scrollbar-none py-1">
          {(['ALL', 'Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium tracking-wide transition-all shrink-0 ${
                statusFilter === st
                  ? 'bg-[#e32117] text-white font-bold shadow-md shadow-red-600/20'
                  : 'bg-neutral-950 text-neutral-400 hover:text-neutral-200 border border-neutral-800'
              }`}
            >
              {st === 'ALL' ? 'All Orders' : st}
            </button>
          ))}
        </div>

        {/* Payment Method Filter */}
        <div className="w-full md:w-auto shrink-0">
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="w-full md:w-auto bg-neutral-950 border border-neutral-800 text-xs rounded-xl px-3 py-2 text-neutral-200 focus:outline-none focus:border-red-500"
          >
            <option value="ALL">All Payment Types</option>
            <option value="Cash on Delivery (COD)">Cash on Delivery (COD)</option>
            <option value="bKash / Nagad">bKash / Nagad</option>
            <option value="Debit/Credit Card">Debit/Credit Card</option>
          </select>
        </div>

      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="p-12 text-center bg-neutral-900 border border-neutral-800 rounded-2xl space-y-3">
          <ShoppingBag className="w-10 h-10 text-neutral-600 mx-auto" />
          <h3 className="font-brand text-lg font-semibold text-neutral-300">No Orders Found</h3>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto">
            {orders.length === 0
              ? 'No customer orders have been recorded yet.'
              : 'No orders match your filter criteria or search query.'}
          </p>
          {(statusFilter !== 'ALL' || paymentFilter !== 'ALL' || searchQuery) && (
            <button
              onClick={() => {
                setStatusFilter('ALL');
                setPaymentFilter('ALL');
                setSearchQuery('');
              }}
              className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold"
            >
              Clear Order Filters
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const cleanPhone = order.phone.replace(/[^0-9]/g, '');
            const waPhone = cleanPhone.startsWith('88') ? cleanPhone : `88${cleanPhone}`;

            return (
              <div
                key={order.id}
                className="bg-neutral-900 border border-neutral-800 hover:border-neutral-700 rounded-2xl p-5 space-y-4 transition-all shadow-lg"
              >
                {/* Header: ID, Date, Status selector, Total */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800 pb-3.5">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-mono font-bold text-red-400 text-sm tracking-wider">
                      {order.id}
                    </span>
                    <span className="text-xs text-neutral-500 font-mono">
                      {new Date(order.createdAt).toLocaleDateString('en-US', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    {getStatusBadge(order.status)}
                  </div>

                  <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                    {/* Status Update Selector */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] text-neutral-400">Update:</span>
                      <select
                        value={order.status}
                        onChange={(e) =>
                          updateOrderStatus(order.id, e.target.value as CustomerOrder['status'])
                        }
                        className="bg-neutral-950 border border-neutral-700 text-xs font-semibold rounded-lg px-2.5 py-1.5 text-neutral-200 focus:outline-none focus:border-red-500"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>

                    {/* Total */}
                    <div className="font-brand font-bold text-base text-red-400 px-3 py-1 rounded-lg bg-neutral-950 border border-neutral-800">
                      {formatBDT(order.total)}
                    </div>

                    {/* Invoice Button */}
                    <button
                      type="button"
                      onClick={() => setSelectedInvoiceOrder(order)}
                      className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs flex items-center gap-1.5 transition-colors"
                      title="View and print invoice"
                    >
                      <Printer className="w-3.5 h-3.5 text-red-400" />
                      <span className="hidden sm:inline">Invoice</span>
                    </button>

                    {/* Delete Order Button */}
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Delete order ${order.id}? This action cannot be undone.`)) {
                          deleteOrder(order.id);
                        }
                      }}
                      className="p-1.5 rounded-lg bg-neutral-950 hover:bg-rose-950/80 text-neutral-500 hover:text-rose-400 border border-neutral-800 transition-colors"
                      title="Delete this order"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Customer & Courier Information Banner */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3.5 rounded-xl bg-neutral-950/80 border border-neutral-800/80 text-xs">
                  {/* Customer Info */}
                  <div>
                    <div className="text-[10px] uppercase font-bold tracking-wider text-neutral-500 mb-1">
                      Customer Info
                    </div>
                    <div className="font-semibold text-neutral-200 text-sm">{order.customerName}</div>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <a
                        href={`tel:${order.phone}`}
                        className="inline-flex items-center gap-1 text-red-400 hover:underline font-mono"
                      >
                        <Phone className="w-3 h-3" />
                        {order.phone}
                      </a>
                      <a
                        href={`https://wa.me/${waPhone}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 hover:bg-emerald-900 text-[11px]"
                      >
                        <MessageCircle className="w-3 h-3" />
                        WhatsApp
                      </a>
                    </div>
                  </div>

                  {/* Delivery Address */}
                  <div>
                    <div className="text-[10px] uppercase font-bold tracking-wider text-neutral-500 mb-1">
                      Delivery Location
                    </div>
                    <div className="text-neutral-300 leading-relaxed">
                      {order.address}
                    </div>
                    <div className="font-medium text-red-300 mt-1 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {order.city}, Bangladesh
                    </div>
                  </div>

                  {/* Payment & Logistics */}
                  <div>
                    <div className="text-[10px] uppercase font-bold tracking-wider text-neutral-500 mb-1">
                      Payment & Logistics
                    </div>
                    <div className="text-neutral-300">
                      Method: <strong className="text-red-400">{order.paymentMethod}</strong>
                    </div>
                    {order.courier && (
                      <div className="text-neutral-400 mt-0.5 flex items-center gap-1">
                        <Truck className="w-3 h-3 text-neutral-400" />
                        <span>Courier: {order.courier}</span>
                        {order.trackingCode && (
                          <span className="text-neutral-300 font-mono">({order.trackingCode})</span>
                        )}
                      </div>
                    )}
                    {order.notes && (
                      <div className="text-[11px] text-red-400/80 mt-1 italic line-clamp-2">
                        "{order.notes}"
                      </div>
                    )}
                  </div>
                </div>

                {/* Ordered Items Grid */}
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-2">
                    Dresses in this Order ({order.items.length})
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {order.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-3 p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs"
                      >
                        <div className="w-12 h-14 rounded-lg bg-neutral-900 overflow-hidden shrink-0 border border-neutral-800">
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-neutral-600">
                              <ShoppingBag className="w-4 h-4" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-neutral-200 truncate">{item.name}</div>
                          <div className="text-[11px] text-neutral-400 mt-0.5 flex items-center gap-2">
                            <span>
                              Size: <strong className="text-red-300">{item.size}</strong>
                            </span>
                            <span>•</span>
                            <span>Qty: <strong>{item.quantity}</strong></span>
                          </div>
                          <div className="text-xs font-mono font-medium text-red-400 mt-1">
                            {formatBDT(item.price * item.quantity)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Invoice Modal */}
      {selectedInvoiceOrder && (
        <OrderInvoiceModal
          order={selectedInvoiceOrder}
          onClose={() => setSelectedInvoiceOrder(null)}
        />
      )}

      {/* Record Order Modal (For phone / WhatsApp orders) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="font-brand text-lg font-bold text-neutral-100 flex items-center gap-2">
                <Plus className="w-5 h-5 text-red-500" />
                Record Customer Order
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-neutral-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateManualOrder} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-400 font-semibold mb-1">Customer Full Name *</label>
                  <input
                    type="text"
                    required
                    value={manualName}
                    onChange={(e) => setManualName(e.target.value)}
                    placeholder="e.g. Nusrat Jahan"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-neutral-200 focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 font-semibold mb-1">Mobile Number (BD) *</label>
                  <input
                    type="tel"
                    required
                    value={manualPhone}
                    onChange={(e) => setManualPhone(e.target.value)}
                    placeholder="017XXXXXXXX"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-neutral-200 focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-400 font-semibold mb-1">City / Region *</label>
                  <select
                    value={manualCity}
                    onChange={(e) => setManualCity(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-neutral-200 focus:outline-none focus:border-red-500"
                  >
                    <option value="Dhaka">Dhaka (৳70 delivery)</option>
                    <option value="Chittagong">Chittagong (৳130 delivery)</option>
                    <option value="Sylhet">Sylhet (৳130 delivery)</option>
                    <option value="Rajshahi">Rajshahi (৳130 delivery)</option>
                    <option value="Khulna">Khulna (৳130 delivery)</option>
                    <option value="Barisal">Barisal (৳130 delivery)</option>
                    <option value="Rangpur">Rangpur (৳130 delivery)</option>
                    <option value="Mymensingh">Mymensingh (৳130 delivery)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-neutral-400 font-semibold mb-1">Payment Method</label>
                  <select
                    value={manualPayment}
                    onChange={(e) => setManualPayment(e.target.value as any)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-neutral-200 focus:outline-none focus:border-red-500"
                  >
                    <option value="Cash on Delivery (COD)">Cash on Delivery (COD)</option>
                    <option value="bKash / Nagad">bKash / Nagad</option>
                    <option value="Debit/Credit Card">Debit/Credit Card</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-neutral-400 font-semibold mb-1">Detailed Delivery Address *</label>
                <textarea
                  required
                  rows={2}
                  value={manualAddress}
                  onChange={(e) => setManualAddress(e.target.value)}
                  placeholder="House, Road, Area, Landmark..."
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-neutral-200 focus:outline-none focus:border-red-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-neutral-800 pt-3">
                <div className="sm:col-span-2">
                  <label className="block text-neutral-400 font-semibold mb-1">Select Dress</label>
                  <select
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-neutral-200 focus:outline-none focus:border-red-500"
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} — {formatBDT(p.price)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-neutral-400 font-semibold mb-1">Size</label>
                  <select
                    value={manualItemSize}
                    onChange={(e) => setManualItemSize(e.target.value as DressSize)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-neutral-200 focus:outline-none focus:border-red-500"
                  >
                    <option value="XS">XS</option>
                    <option value="S">S</option>
                    <option value="M">M</option>
                    <option value="L">L</option>
                    <option value="XL">XL</option>
                    <option value="XXL">XXL</option>
                    <option value="Custom Fit">Custom Fit</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-400 font-semibold mb-1">Courier Partner</label>
                  <select
                    value={manualCourier}
                    onChange={(e) => setManualCourier(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-neutral-200 focus:outline-none focus:border-red-500"
                  >
                    <option value="Steadfast Courier">Steadfast Courier</option>
                    <option value="Pathao Courier">Pathao Courier</option>
                    <option value="RedX Logistics">RedX Logistics</option>
                    <option value="Paperfly">Paperfly</option>
                    <option value="Sundarban Courier">Sundarban Courier</option>
                  </select>
                </div>

                <div>
                  <label className="block text-neutral-400 font-semibold mb-1">Tracking Code (Optional)</label>
                  <input
                    type="text"
                    value={manualTracking}
                    onChange={(e) => setManualTracking(e.target.value)}
                    placeholder="e.g. STF-8921"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-neutral-200 focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-400 font-semibold mb-1">Internal Notes</label>
                <input
                  type="text"
                  value={manualNotes}
                  onChange={(e) => setManualNotes(e.target.value)}
                  placeholder="e.g. Confirmed on WhatsApp, client requested urgent Friday evening delivery"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-neutral-200 focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#e32117] hover:bg-red-700 text-white font-bold uppercase tracking-wider shadow-md shadow-red-600/20"
                >
                  Save & Log Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
