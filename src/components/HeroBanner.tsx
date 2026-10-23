import React from 'react';
import { useStore } from '../context/StoreContext';
import { Sparkles, ArrowRight, ShieldCheck, Truck, RefreshCw } from 'lucide-react';

export const HeroBanner: React.FC = () => {
  const { toggleCategoryFilter, setSortBy } = useStore();

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-neutral-100 via-rose-50/25 to-neutral-50 border-b border-neutral-200/80 pt-8 pb-10 text-neutral-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          <div className="lg:col-span-8 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-rose-50 border border-rose-200 text-red-700 text-xs font-semibold tracking-wider mb-3 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-red-600" />
              <span>DHONG (ঢং) COUTURE • COME MEET THE NEW YOU</span>
            </div>

            <h1 className="font-brand text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-neutral-900 leading-[1.18] mb-3">
              Come meet the new you. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-700 via-rose-600 to-red-900">
                Elegance Tailored for Bangladeshi Women.
              </span>
            </h1>

            <p className="text-neutral-600 text-sm sm:text-base max-w-2xl leading-relaxed mb-6 font-normal">
              Come meet the new you with Dhong’s signature party gowns, pure georgette silks, festive anarkalis, and ready-to-wear luxury dresses. Fast Cash on Delivery (COD) across all 64 districts in Bangladesh with easy size exchange.
            </p>

            {/* Storefront Action Buttons */}
            <div className="flex flex-wrap gap-3 items-center">
              <button
                id="hero-explore-collection-btn"
                onClick={() => {
                  document.querySelector('main')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-6 py-3 rounded-full bg-[#e32117] hover:bg-red-700 text-white font-bold text-xs tracking-wider uppercase transition-all shadow-md shadow-red-600/25 flex items-center gap-2 cursor-pointer"
              >
                <span>Explore Exclusive Collection</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              
              <button
                id="hero-deals-btn"
                onClick={() => setSortBy('price-asc')}
                className="px-5 py-3 rounded-full bg-white hover:bg-neutral-100 text-neutral-800 border border-neutral-300 font-semibold text-xs tracking-wider uppercase transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <span>Price: Low to High (৳)</span>
                <ArrowRight className="w-3.5 h-3.5 text-red-600" />
              </button>
            </div>
          </div>

          {/* Bangladeshi Marketing Value Perks */}
          <div className="lg:col-span-4 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-3">
            <div className="p-3.5 rounded-xl bg-white border border-neutral-200/80 shadow-xs flex items-start gap-3">
              <div className="p-2 rounded-lg bg-rose-50 text-red-600 border border-rose-200 shrink-0">
                <Truck className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900">Nationwide Express Delivery</h4>
                <p className="text-[12px] text-neutral-500 mt-0.5">Delivery in 24-48 hrs in Dhaka & 3-5 days across all 64 districts in BD.</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-neutral-200/80 shadow-xs flex items-start gap-3">
              <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900">Cash on Delivery & bKash</h4>
                <p className="text-[12px] text-neutral-500 mt-0.5">Pay after checking parcel at your doorstep or instant bKash/Nagad.</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-neutral-200/80 shadow-xs flex items-start gap-3">
              <div className="p-2 rounded-lg bg-rose-50 text-red-600 border border-rose-200 shrink-0">
                <RefreshCw className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900">Easy 7-Day Size Exchange</h4>
                <p className="text-[12px] text-neutral-500 mt-0.5">Hassle-free size replacement guarantee so you get the perfect fit.</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
