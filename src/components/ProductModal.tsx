import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { DressSize } from '../types';
import { X, ShoppingBag, Check, Shield, Sparkles, Tag, Truck } from 'lucide-react';
import { formatBDT } from '../utils/currency';

export const ProductModal: React.FC = () => {
  const { selectedProduct, setSelectedProduct, addToCart, setIsCartOpen } = useStore();
  
  if (!selectedProduct) return null;

  const [selectedSize, setSelectedSize] = useState<DressSize>(selectedProduct.sizes[0] || 'M');
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const [imgError, setImgError] = useState(false);

  const handleAddToCart = () => {
    if (!selectedProduct.inStock) return;
    addToCart(selectedProduct, selectedSize, quantity);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);
  };

  const handleBuyNow = () => {
    if (!selectedProduct.inStock) return;
    addToCart(selectedProduct, selectedSize, quantity);
    setSelectedProduct(null);
    setIsCartOpen(true);
  };

  const fallbackImage = 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=800&q=80';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div 
        className="relative w-full max-w-4xl bg-white border border-neutral-200 rounded-3xl overflow-hidden shadow-2xl text-neutral-900 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          id="close-product-modal"
          onClick={() => setSelectedProduct(null)}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/90 text-neutral-600 hover:text-black border border-neutral-300 hover:bg-neutral-100 transition-all shadow-sm"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-0">
          
          {/* Left: Dress Image Visual */}
          <div className="md:col-span-6 relative aspect-[3/4] md:aspect-auto md:min-h-[500px] bg-neutral-100 overflow-hidden">
            <img
              src={imgError ? fallbackImage : selectedProduct.imageUrl}
              alt={selectedProduct.name}
              onError={() => setImgError(true)}
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/95 backdrop-blur-md border border-neutral-200 text-neutral-900 shadow-sm">
                {selectedProduct.category}
              </span>
              {selectedProduct.featured && (
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-red-600 text-white shadow-sm">
                  Featured Pick
                </span>
              )}
            </div>
          </div>

          {/* Right: Dress Details & Action Controls */}
          <div className="md:col-span-6 p-6 sm:p-8 flex flex-col justify-between overflow-y-auto max-h-[85vh] bg-white">
            <div>
              <div className="flex items-center justify-between text-xs text-neutral-500 uppercase tracking-wider mb-2">
                <span>SKU: {selectedProduct.sku}</span>
                <span className={selectedProduct.inStock ? 'text-emerald-700 font-semibold' : 'text-rose-600 font-semibold'}>
                  {selectedProduct.inStock ? '● In Stock & Ready to Dispatch in BD' : '● Currently Out of Stock'}
                </span>
              </div>

              <h2 className="font-brand text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 mb-3">
                {selectedProduct.name}
              </h2>

              {/* Pricing in BDT */}
              <div className="flex items-baseline gap-3 mb-4">
                <span className="text-3xl font-extrabold text-neutral-900">
                  {formatBDT(selectedProduct.price)}
                </span>
                {selectedProduct.originalPrice && selectedProduct.originalPrice > selectedProduct.price && (
                  <span className="text-base text-neutral-400 line-through">
                    {formatBDT(selectedProduct.originalPrice)}
                  </span>
                )}
                {selectedProduct.originalPrice && selectedProduct.originalPrice > selectedProduct.price && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-700 border border-rose-200">
                    Save {formatBDT(selectedProduct.originalPrice - selectedProduct.price)}
                  </span>
                )}
              </div>

              {/* Bangladesh Delivery Badge */}
              <div className="mb-5 p-2.5 rounded-xl bg-rose-50 border border-rose-200/80 flex items-center gap-2.5 text-xs text-red-950">
                <Truck className="w-4 h-4 text-red-600 shrink-0" />
                <span>Nationwide delivery in Bangladesh. Cash on Delivery (COD) & bKash available.</span>
              </div>

              {/* Description */}
              <p className="text-neutral-600 text-sm leading-relaxed mb-6 font-normal">
                {selectedProduct.description}
              </p>

              {/* Tags */}
              {selectedProduct.tags && selectedProduct.tags.length > 0 && (
                <div className="mb-6">
                  <div className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-2 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-red-600" />
                    <span>Fabric & Silhouette</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedProduct.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2.5 py-1 rounded-full bg-neutral-100 border border-neutral-200 text-neutral-700 text-xs font-medium"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Size Selection */}
              <div className="mb-6">
                <div className="flex items-center justify-between text-xs uppercase tracking-wider text-neutral-700 mb-2.5">
                  <span className="font-bold">Select Exact Size:</span>
                  <span className="text-neutral-500 font-normal">Available: {selectedProduct.sizes.join(', ')}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedProduct.sizes.map((size) => {
                    const isCurrent = selectedSize === size;
                    return (
                      <button
                        key={size}
                        id={`modal-size-${size}`}
                        onClick={() => setSelectedSize(size)}
                        className={`w-11 h-11 rounded-xl text-xs font-bold tracking-wider border transition-all flex items-center justify-center ${
                          isCurrent
                            ? 'bg-red-600 border-red-600 text-white shadow-sm scale-105'
                            : 'bg-white border-neutral-200 text-neutral-800 hover:border-neutral-400 hover:bg-neutral-50'
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quantity Picker */}
              <div className="flex items-center gap-4 mb-6">
                <span className="text-xs uppercase tracking-wider text-neutral-600 font-semibold">Quantity:</span>
                <div className="flex items-center border border-neutral-300 rounded-xl bg-neutral-50 overflow-hidden">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3.5 py-1.5 text-neutral-700 hover:bg-neutral-200 text-sm font-bold transition-colors"
                  >
                    -
                  </button>
                  <span className="px-4 py-1.5 text-xs font-bold text-neutral-900 min-w-[32px] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3.5 py-1.5 text-neutral-700 hover:bg-neutral-200 text-sm font-bold transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-4 border-t border-neutral-200">
              <div className="grid grid-cols-2 gap-3">
                <button
                  id="modal-add-to-bag-btn"
                  disabled={!selectedProduct.inStock}
                  onClick={handleAddToCart}
                  className={`w-full py-3.5 px-4 rounded-xl font-bold text-xs tracking-wider uppercase flex items-center justify-center gap-2 transition-all ${
                    !selectedProduct.inStock
                      ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
                      : isAdded
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white hover:bg-neutral-100 text-neutral-900 border border-neutral-300 shadow-xs'
                  }`}
                >
                  {isAdded ? (
                    <>
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>Added to Bag</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4 text-red-600" />
                      <span>Add to Bag</span>
                    </>
                  )}
                </button>

                <button
                  id="modal-buy-now-btn"
                  disabled={!selectedProduct.inStock}
                  onClick={handleBuyNow}
                  className={`w-full py-3.5 px-4 rounded-xl font-bold text-xs tracking-wider uppercase flex items-center justify-center gap-2 transition-all shadow-md shadow-red-600/20 ${
                    !selectedProduct.inStock
                      ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
                      : 'bg-[#e32117] hover:bg-red-700 text-white'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-white" />
                  <span>Buy Now</span>
                </button>
              </div>

              {/* Guarantee Note */}
              <div className="flex items-center justify-center gap-2 text-[11px] text-neutral-500 pt-1">
                <Shield className="w-3.5 h-3.5 text-red-600" />
                <span>100% Genuine fabric guarantee & easy 7-day size exchange across Bangladesh</span>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};
