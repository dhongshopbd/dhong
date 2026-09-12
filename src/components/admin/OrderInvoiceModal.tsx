import React from 'react';
import { CustomerOrder } from '../../types';
import { formatBDT } from '../../utils/currency';
import { X, Printer, CheckCircle2, Truck, Phone, Mail, MapPin } from 'lucide-react';

interface OrderInvoiceModalProps {
  order: CustomerOrder;
  onClose: () => void;
}

export const OrderInvoiceModal: React.FC<OrderInvoiceModalProps> = ({ order, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div 
        className="relative w-full max-w-2xl bg-white text-neutral-900 rounded-2xl shadow-2xl overflow-hidden print:m-0 print:shadow-none print:w-full print:max-w-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Actions (Hidden when printing) */}
        <div className="p-4 bg-neutral-900 text-white flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <span className="font-brand font-bold text-red-500 tracking-wider">DHONG BD</span>
            <span className="text-xs text-neutral-400">• Official Order Invoice</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg bg-[#e32117] hover:bg-red-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm shadow-red-600/30"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Invoice</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Body */}
        <div className="p-6 sm:p-8 space-y-6 print:p-8">
          
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
                  <span className="font-brand text-2xl font-bold tracking-widest text-neutral-950">
                    DHONG
                  </span>
                  <span className="text-xs text-red-600 font-semibold ml-2">ঢং ফ্যাশন</span>
                </div>
              </div>
              <p className="text-xs text-neutral-500 tracking-wider mt-1 uppercase">
                High Fashion & Designer Dresses • Bangladesh
              </p>
              <p className="text-[11px] text-neutral-400 mt-1">
                Dhaka, Bangladesh • Helpline: +880 1711-223344 • support@dhongfashion.com
              </p>
            </div>

            <div className="text-right">
              <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400">
                INVOICE / MEMO
              </span>
              <div className="font-mono font-bold text-lg text-neutral-900">{order.id}</div>
              <div className="text-xs text-neutral-500 mt-0.5">
                Date: {new Date(order.createdAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
              </div>
              <div className="mt-1">
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                  order.status === 'Delivered'
                    ? 'bg-emerald-100 text-emerald-800'
                    : order.status === 'Shipped'
                    ? 'bg-purple-100 text-purple-800'
                    : order.status === 'Confirmed'
                    ? 'bg-blue-100 text-blue-800'
                    : order.status === 'Cancelled'
                    ? 'bg-rose-100 text-rose-800'
                    : 'bg-rose-100 text-red-800'
                }`}>
                  Status: {order.status}
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
              <p className="font-bold text-neutral-900 text-sm">{order.customerName}</p>
              <p className="text-neutral-600 mt-1 leading-relaxed">{order.address}</p>
              <p className="text-neutral-700 font-medium">{order.city}</p>
            </div>

            <div>
              <h4 className="font-bold text-neutral-900 uppercase tracking-wider text-[10px] mb-2 flex items-center gap-1 text-red-700">
                <Phone className="w-3.5 h-3.5" />
                Contact & Payment
              </h4>
              <p className="text-neutral-700">
                <strong>Phone:</strong> {order.phone}
              </p>
              {order.email && (
                <p className="text-neutral-700 mt-0.5">
                  <strong>Email:</strong> {order.email}
                </p>
              )}
              <p className="text-neutral-700 mt-1">
                <strong>Payment:</strong> <span className="font-semibold text-neutral-900">{order.paymentMethod}</span>
              </p>
              {order.courier && (
                <p className="text-neutral-700 mt-0.5">
                  <strong>Courier:</strong> {order.courier} {order.trackingCode ? `(#${order.trackingCode})` : ''}
                </p>
              )}
            </div>
          </div>

          {/* Order Items Table */}
          <div>
            <h4 className="font-bold text-neutral-900 text-xs uppercase tracking-wider mb-2">
              Ordered Items
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
                  {order.items.map((item, idx) => (
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
                <span className="font-semibold text-neutral-900">{formatBDT(order.subtotal)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-neutral-200">
                <span>Nationwide Shipping:</span>
                <span>{order.shipping === 0 ? 'FREE' : formatBDT(order.shipping)}</span>
              </div>
              <div className="flex justify-between py-2 text-sm font-bold text-neutral-950 border-b-2 border-neutral-900">
                <span>Grand Total (BDT):</span>
                <span className="text-red-700 font-brand text-base">{formatBDT(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Notes if any */}
          {order.notes && (
            <div className="p-3 bg-neutral-100 border border-neutral-300 rounded-xl text-xs text-neutral-800">
              <strong>Order Notes / Special Instructions:</strong> {order.notes}
            </div>
          )}

          {/* Footer Notice */}
          <div className="border-t border-neutral-200 pt-4 text-center text-[10px] text-neutral-400 space-y-1">
            <p>Thank you for choosing Dhong Bangladesh for exclusive couture & designer wear.</p>
            <p>For exchanges or support within Bangladesh, call 01711-000000 or WhatsApp with Order ID {order.id}.</p>
          </div>

        </div>
      </div>
    </div>
  );
};
