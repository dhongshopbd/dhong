import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { X, Trash2, ArrowRight, ShoppingBag, Truck } from 'lucide-react';
import { CheckoutModal } from './CheckoutModal';
import { formatBDT } from '../utils/currency';

export const CartDrawer: React.FC = () => {
  const { isCartOpen, setIsCartOpen, cart, updateCartQuantity, removeFromCart } = useStore();
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  if (!isCartOpen) return null;

  const subtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const freeShippingThreshold = 5000;
  const progressToFreeShipping = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));
  const amountNeeded = Math.max(0, freeShippingThreshold - subtotal);

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-hidden">
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
          onClick={() => setIsCartOpen(false)}
        />

        <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
          <div className="w-screen max-w-md bg-white border-l border-neutral-200 text-neutral-900 shadow-2xl flex flex-col">
            
            {/* Header */}
            <div className="p-5 border-b border-neutral-200 flex items-center justify-between bg-white">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-amber-600" />
                <h3 className="font-brand text-lg font-bold tracking-wider text-neutral-900">Your Shopping Bag</h3>
                <span className="text-xs text-neutral-500 font-normal">
                  ({cart.reduce((sum, item) => sum + item.quantity, 0)} items)
                </span>
              </div>
              <button
                id="close-cart-drawer"
                onClick={() => setIsCartOpen(false)}
                className="p-2 rounded-full text-neutral-500 hover:text-black hover:bg-neutral-100 transition-all"
                aria-label="Close Bag"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Free Shipping Progress Indicator (BDT) */}
            <div className="px-5 py-3 bg-amber-50/60 border-b border-amber-100 text-xs">
              <div className="flex items-center justify-between text-neutral-800 mb-1.5 font-medium">
                <span className="flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-amber-700" />
                  {amountNeeded > 0 ? (
                    <span>
                      Add <strong className="text-amber-900">{formatBDT(amountNeeded)}</strong> more for <strong>FREE Delivery</strong> anywhere in Bangladesh!
                    </span>
                  ) : (
                    <span className="text-emerald-700 font-bold">
                      🎉 You have unlocked Free Nationwide Delivery!
                    </span>
                  )}
                </span>
              </div>
              <div className="w-full h-1.5 bg-amber-200/60 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 transition-all duration-300 rounded-full"
                  style={{ width: `${progressToFreeShipping}%` }}
                />
              </div>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-neutral-50/40">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-neutral-500">
                  <div className="w-16 h-16 rounded-full bg-neutral-100 border border-neutral-200 flex items-center justify-center mb-4 text-neutral-400">
                    <ShoppingBag className="w-8 h-8" />
                  </div>
                  <h4 className="font-brand text-lg font-bold text-neutral-900 mb-1">Your bag is empty</h4>
                  <p className="text-xs text-neutral-500 max-w-xs mb-6">
                    Discover exclusive party gowns, silk couture, and Eid specials to elevate your collection.
                  </p>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="px-6 py-2.5 rounded-full bg-neutral-900 text-white text-xs font-bold uppercase tracking-wider hover:bg-black transition-all shadow-md"
                  >
                    Browse Collection
                  </button>
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={`${item.product.id}-${item.selectedSize}`}
                    className="flex gap-4 p-3.5 rounded-2xl bg-white border border-neutral-200/90 shadow-xs hover:border-neutral-300 transition-all"
                  >
                    {/* Item Thumbnail */}
                    <div className="w-20 h-24 rounded-xl overflow-hidden bg-neutral-100 shrink-0 border border-neutral-200">
                      <img
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Item Info */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-xs sm:text-sm font-semibold text-neutral-900 line-clamp-1">
                            {item.product.name}
                          </h4>
                          <button
                            onClick={() => removeFromCart(item.product.id, item.selectedSize)}
                            className="text-neutral-400 hover:text-rose-600 p-1 transition-colors"
                            title="Remove item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="flex items-center gap-2 mt-1">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-neutral-100 border border-neutral-200 text-neutral-800">
                            Size: {item.selectedSize}
                          </span>
                          <span className="text-[11px] text-neutral-500 font-medium">
                            {formatBDT(item.product.price)} each
                          </span>
                        </div>
                      </div>

                      {/* Quantity & Subtotal */}
                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center border border-neutral-200 rounded-lg bg-neutral-50">
                          <button
                            onClick={() => updateCartQuantity(item.product.id, item.selectedSize, -1)}
                            className="px-2.5 py-0.5 text-neutral-700 hover:bg-neutral-200 text-xs font-bold"
                          >
                            -
                          </button>
                          <span className="px-2 text-xs font-bold text-neutral-900 min-w-[20px] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateCartQuantity(item.product.id, item.selectedSize, 1)}
                            className="px-2.5 py-0.5 text-neutral-700 hover:bg-neutral-200 text-xs font-bold"
                          >
                            +
                          </button>
                        </div>

                        <span className="text-sm font-bold text-neutral-900">
                          {formatBDT(item.product.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer / Summary */}
            {cart.length > 0 && (
              <div className="p-5 border-t border-neutral-200 bg-white space-y-4">
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-neutral-600">
                    <span>Subtotal</span>
                    <span className="text-neutral-900 font-bold">{formatBDT(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-neutral-600">
                    <span>Estimated Shipping (BD)</span>
                    <span className={subtotal >= freeShippingThreshold ? 'text-emerald-700 font-bold' : 'text-neutral-700'}>
                      {subtotal >= freeShippingThreshold ? 'FREE' : '৳80 - ৳130'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-neutral-900 pt-2 border-t border-neutral-200">
                    <span>Subtotal Due</span>
                    <span className="text-amber-800 text-base font-extrabold">
                      {formatBDT(subtotal)}
                    </span>
                  </div>
                </div>

                <button
                  id="cart-checkout-btn"
                  onClick={() => setIsCheckoutOpen(true)}
                  className="w-full py-3.5 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs tracking-wider uppercase flex items-center justify-center gap-2 transition-all shadow-md"
                >
                  <span>Checkout with Cash on Delivery / bKash</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

          </div>
        </div>
      </div>

      {isCheckoutOpen && (
        <CheckoutModal onClose={() => setIsCheckoutOpen(false)} />
      )}
    </>
  );
};
