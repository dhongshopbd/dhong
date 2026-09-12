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
              <span>DHONG (ঢং) 2026 EID & LUXURY COUTURE</span>
            </div>

            <h1 className="font-brand text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-neutral-900 leading-[1.18] mb-3">
              Elegance for Every Occasion. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-700 via-rose-600 to-red-900">
                Tailored for Bangladeshi Women.
              </span>
            </h1>

            <p className="text-neutral-600 text-sm sm:text-base max-w-2xl leading-relaxed mb-6 font-normal">
              Explore Dhong’s signature party gowns, pure georgette silks, festive anarkalis, and ready-to-wear dresses. Fast Cash on Delivery (COD) across all 64 districts in Bangladesh with easy size exchange.
            </p>

            {/* Quick Filter Buttons */}
            <div className="flex flex-wrap gap-2.5 items-center">
              <button
                id="hero-party-gowns-btn"
                onClick={() => toggleCategoryFilter('Party Gowns')}
                className="px-5 py-2.5 rounded-full bg-[#e32117] hover:bg-red-700 text-white font-semibold text-xs tracking-wider uppercase transition-all shadow-md shadow-red-600/20 flex items-center gap-2"
              >
                <span>Party Gowns</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              
              <button
                id="hero-silk-btn"
                onClick={() => toggleCategoryFilter('Silk & Georgette')}
                className="px-5 py-2.5 rounded-full bg-white hover:bg-neutral-100 text-neutral-800 border border-neutral-300 font-medium text-xs tracking-wider uppercase transition-all shadow-xs"
              >
                Silk & Georgette
              </button>

              <button
                id="hero-anarkali-btn"
                onClick={() => toggleCategoryFilter('Festive Anarkalis')}
                className="px-5 py-2.5 rounded-full bg-white hover:bg-neutral-100 text-neutral-800 border border-neutral-300 font-medium text-xs tracking-wider uppercase transition-all shadow-xs"
              >
                Festive Anarkalis
              </button>

              <button
                id="hero-deals-btn"
                onClick={() => setSortBy('price-asc')}
                className="px-4 py-2.5 rounded-full text-red-700 hover:text-red-900 text-xs font-bold tracking-wider transition-colors"
              >
                Price: Low to High (৳) →
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
