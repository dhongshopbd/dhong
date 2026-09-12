import React, { useState } from 'react';
import { Product, DressSize } from '../types';
import { useStore } from '../context/StoreContext';
import { ShoppingBag, Eye, Check } from 'lucide-react';
import { formatBDT } from '../utils/currency';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { setSelectedProduct, addToCart } = useStore();
  const [selectedQuickSize, setSelectedQuickSize] = useState<DressSize>(product.sizes[0] || 'M');
  const [isAddedAnim, setIsAddedAnim] = useState(false);
  const [imgError, setImgError] = useState(false);

  const discountPercent = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!product.inStock) return;
    addToCart(product, selectedQuickSize, 1);
    setIsAddedAnim(true);
    setTimeout(() => setIsAddedAnim(false), 1200);
  };

  const handleCardClick = () => {
    setSelectedProduct(product);
  };

  const fallbackImage = 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=800&q=80';

  return (
    <div
      id={`product-card-${product.id}`}
      onClick={handleCardClick}
      className="group flex flex-col bg-white border border-neutral-200 hover:border-red-500/50 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-red-950/10 relative text-neutral-900"
    >
      {/* Dress Image Showcase */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-neutral-100">
        <img
          src={imgError ? fallbackImage : product.imageUrl}
          alt={product.name}
          onError={() => setImgError(true)}
          loading="lazy"
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
        />

        {/* Gradient overlay for badges and quick view */}
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/60 via-transparent to-black/10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />

        {/* Marketing Badges on Top */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
          {product.featured && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-600 text-white shadow-sm">
              Featured Pick
            </span>
          )}
          {discountPercent && discountPercent > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-600 text-white shadow-sm">
              Save {discountPercent}%
            </span>
          )}
        </div>

        {/* In-Stock status indicator */}
        <div className="absolute top-2.5 right-2.5 z-10">
          {!product.inStock ? (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-neutral-900/80 text-neutral-300 backdrop-blur-sm border border-neutral-700">
              Sold Out
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wider bg-white/90 text-emerald-700 border border-neutral-200 backdrop-blur-sm shadow-xs">
              In Stock
            </span>
          )}
        </div>

        {/* Quick View Button on Hover */}
        <div className="absolute inset-x-3 bottom-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedProduct(product);
            }}
            className="flex-1 py-2 px-3 bg-neutral-900/90 hover:bg-black text-white text-xs font-semibold uppercase tracking-wider rounded-xl backdrop-blur-md flex items-center justify-center gap-1.5 transition-all shadow-md hover:text-red-400"
          >
            <Eye className="w-3.5 h-3.5 text-red-500" />
            <span>Quick View</span>
          </button>
        </div>
      </div>

      {/* Dress Info Section */}
      <div className="p-4 flex-1 flex flex-col justify-between bg-white">
        <div>
          {/* Category & SKU */}
          <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-neutral-500 mb-1">
            <span className="text-red-700 font-bold">{product.category}</span>
            <span className="text-neutral-400 font-mono text-[10px]">{product.sku}</span>
          </div>

          {/* Product Title */}
          <h3 className="text-sm sm:text-base font-semibold text-neutral-900 group-hover:text-red-700 transition-colors line-clamp-1 mb-1.5">
            {product.name}
          </h3>

          {/* Available Sizes List */}
          <div className="flex items-center gap-1 my-2" onClick={(e) => e.stopPropagation()}>
            <span className="text-[10px] text-neutral-500 uppercase tracking-wider mr-1">Size:</span>
            <div className="flex flex-wrap gap-1">
              {product.sizes.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setSelectedQuickSize(size)}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-semibold transition-all ${
                    selectedQuickSize === size
                      ? 'bg-red-600 text-white font-bold'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 border border-neutral-200'
                  }`}
                  title={`Select size ${size}`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Pricing in BDT & Add to Bag */}
        <div className="pt-2 border-t border-neutral-100 mt-2 flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-neutral-900 tracking-tight">
              {formatBDT(product.price)}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-xs text-neutral-400 line-through">
                {formatBDT(product.originalPrice)}
              </span>
            )}
          </div>

          <button
            type="button"
            disabled={!product.inStock}
            onClick={handleQuickAdd}
            className={`p-2 rounded-xl text-xs font-semibold tracking-wider transition-all flex items-center gap-1.5 ${
              !product.inStock
                ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
                : isAddedAnim
                ? 'bg-emerald-600 text-white'
                : 'bg-[#e32117] hover:bg-red-700 text-white shadow-sm shadow-red-600/20'
            }`}
            title={product.inStock ? `Add size ${selectedQuickSize} to Bag` : 'Out of stock'}
          >
            {isAddedAnim ? (
              <>
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span className="hidden sm:inline">Added</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Add</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
