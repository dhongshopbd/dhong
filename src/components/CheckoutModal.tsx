import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { CustomerOrder } from '../types';
import { X, CheckCircle, ShieldCheck, CreditCard, Banknote, ShoppingBag, Truck } from 'lucide-react';
import { formatBDT } from '../utils/currency';

interface CheckoutModalProps {
  onClose: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ onClose }) => {
  const { cart, placeOrder, setIsCartOpen } = useStore();

  const [formData, setFormData] = useState({
    customerName: '',
    email: '',
    phone: '',
    address: '',
    city: 'Dhaka',
    district: 'Dhaka',
    paymentMethod: 'Cash on Delivery (COD)' as 'Cash on Delivery (COD)' | 'bKash / Nagad' | 'Debit/Credit Card',
  });

  const [completedOrder, setCompletedOrder] = useState<CustomerOrder | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const subtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const isFreeShipping = subtotal >= 5000;
  const isInsideDhaka = formData.city.toLowerCase().includes('dhaka');
  const shipping = isFreeShipping ? 0 : (isInsideDhaka ? 80 : 130);
  const total = subtotal + shipping;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerName || !formData.phone || !formData.address) {
      alert('Please fill in your name, phone number, and delivery address.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const order = placeOrder({
        customerName: formData.customerName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        city: `${formData.city}, ${formData.district}`,
        paymentMethod: formData.paymentMethod,
      });
      setCompletedOrder(order);
      setIsSubmitting(false);
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fadeIn text-neutral-900">
      <div 
        className="relative w-full max-w-2xl bg-white border border-neutral-200 rounded-3xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-neutral-200 flex items-center justify-between bg-neutral-50">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-amber-600" />
            <h3 className="font-brand text-lg font-bold tracking-wider text-neutral-900">
              {completedOrder ? 'Order Confirmed' : 'Complete Your Order (Bangladesh)'}
            </h3>
          </div>
          <button
            id="close-checkout-modal"
            onClick={() => {
              if (completedOrder) {
                setIsCartOpen(false);
              }
              onClose();
            }}
            className="p-2 rounded-full text-neutral-500 hover:text-black hover:bg-neutral-200 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {completedOrder ? (
          <div className="p-6 sm:p-8 text-center space-y-5">
            <div className="w-16 h-16 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8" />
            </div>

            <div>
              <h2 className="font-brand text-2xl font-bold text-neutral-900 mb-1">
                Dhonnobad! Your Dhong Order is Placed
              </h2>
              <p className="text-xs text-neutral-500 max-w-md mx-auto">
                Your luxury dress order has been received. Our Dhaka customer support team will call you to confirm delivery details.
              </p>
            </div>

            <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-4 text-left max-w-md mx-auto space-y-2 text-xs">
              <div className="flex justify-between border-b border-neutral-200 pb-2">
                <span className="text-neutral-500">Order ID:</span>
                <span className="font-mono font-bold text-amber-800">{completedOrder.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Customer:</span>
                <span className="text-neutral-900 font-medium">{completedOrder.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Phone:</span>
                <span className="text-neutral-900 font-medium">{completedOrder.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Delivery Address:</span>
                <span className="text-neutral-900 text-right font-medium">{completedOrder.address}, {completedOrder.city}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Payment Mode:</span>
                <span className="text-emerald-700 font-semibold">{completedOrder.paymentMethod}</span>
              </div>
              <div className="flex justify-between font-bold text-sm pt-2 border-t border-neutral-200">
                <span className="text-neutral-800">Total Payable Amount:</span>
                <span className="text-amber-800 font-extrabold">{formatBDT(completedOrder.total)}</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => {
                  setIsCartOpen(false);
                  onClose();
                }}
                className="px-6 py-3 rounded-full bg-neutral-900 hover:bg-black text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5">
            {/* Customer Details Form */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800">
                  1. Delivery & Contact Details
                </h4>
                <span className="text-[11px] text-neutral-500">Nationwide across 64 districts</span>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-600 mb-1">
                    Customer Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    placeholder="e.g. Nusrat Jahan"
                    className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-2.5 text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-600 mb-1">
                    Phone Number (BD) *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="e.g. 01712345678"
                    className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-2.5 text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-600 mb-1">
                  Email Address (Optional)
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="For invoice and parcel tracking"
                  className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-2.5 text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-600 mb-1">
                    Full Delivery Address / House / Road *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="e.g. House 42, Road 11, Banani"
                    className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-2.5 text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-600 mb-1">
                    City / Division *
                  </label>
                  <select
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-2.5 text-xs text-neutral-900 focus:outline-none focus:border-amber-500"
                  >
                    <option value="Dhaka">Dhaka (৳80)</option>
                    <option value="Chittagong">Chittagong (৳130)</option>
                    <option value="Sylhet">Sylhet (৳130)</option>
                    <option value="Rajshahi">Rajshahi (৳130)</option>
                    <option value="Khulna">Khulna (৳130)</option>
                    <option value="Barisal">Barisal (৳130)</option>
                    <option value="Rangpur">Rangpur (৳130)</option>
                    <option value="Mymensingh">Mymensingh (৳130)</option>
                    <option value="Other District">Other District (৳130)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800">
                2. Select Preferred Payment Method
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, paymentMethod: 'Cash on Delivery (COD)' })}
                  className={`p-3 rounded-2xl border text-left flex items-start gap-2.5 transition-all ${
                    formData.paymentMethod === 'Cash on Delivery (COD)'
                      ? 'bg-amber-50 border-amber-500 ring-2 ring-amber-400/40 text-neutral-900'
                      : 'bg-white border-neutral-200 text-neutral-600 hover:border-neutral-300'
                  }`}
                >
                  <Banknote className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-neutral-900">Cash on Delivery</div>
                    <div className="text-[10px] text-neutral-500 mt-0.5">Pay upon checking dress</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, paymentMethod: 'bKash / Nagad' })}
                  className={`p-3 rounded-2xl border text-left flex items-start gap-2.5 transition-all ${
                    formData.paymentMethod === 'bKash / Nagad'
                      ? 'bg-amber-50 border-amber-500 ring-2 ring-amber-400/40 text-neutral-900'
                      : 'bg-white border-neutral-200 text-neutral-600 hover:border-neutral-300'
                  }`}
                >
                  <div className="w-4 h-4 rounded-full bg-pink-600 text-white text-[9px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    ৳
                  </div>
                  <div>
                    <div className="text-xs font-bold text-neutral-900">bKash / Nagad</div>
                    <div className="text-[10px] text-neutral-500 mt-0.5">Instant mobile banking</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, paymentMethod: 'Debit/Credit Card' })}
                  className={`p-3 rounded-2xl border text-left flex items-start gap-2.5 transition-all ${
                    formData.paymentMethod === 'Debit/Credit Card'
                      ? 'bg-amber-50 border-amber-500 ring-2 ring-amber-400/40 text-neutral-900'
                      : 'bg-white border-neutral-200 text-neutral-600 hover:border-neutral-300'
                  }`}
                >
                  <CreditCard className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-neutral-900">Debit / Credit Card</div>
                    <div className="text-[10px] text-neutral-500 mt-0.5">Visa, Mastercard, Amex</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Order Total Overview in BDT */}
            <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-1.5 text-xs">
              <div className="flex justify-between text-neutral-600">
                <span>Items ({cart.reduce((s, i) => s + i.quantity, 0)}):</span>
                <span className="text-neutral-900 font-semibold">{formatBDT(subtotal)}</span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>Delivery Charge ({isInsideDhaka ? 'Inside Dhaka' : 'Outside Dhaka'}):</span>
                <span className={shipping === 0 ? 'text-emerald-700 font-bold' : 'text-neutral-800'}>
                  {shipping === 0 ? 'FREE (Over ৳5,000)' : formatBDT(shipping)}
                </span>
              </div>
              <div className="flex justify-between text-sm font-bold text-neutral-900 pt-2 border-t border-neutral-200">
                <span>Total Amount Due:</span>
                <span className="text-amber-800 text-base font-extrabold">{formatBDT(total)}</span>
              </div>
            </div>

            {/* Submit */}
            <button
              id="submit-order-btn"
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md disabled:opacity-50"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{isSubmitting ? 'Confirming Order...' : `Confirm & Place Order (${formatBDT(total)})`}</span>
            </button>
          </form>
        )}

      </div>
    </div>
  );
};
