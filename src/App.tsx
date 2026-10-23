import React, { useState } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Header } from './components/Header';
import { HeroBanner } from './components/HeroBanner';
import { ProductCard } from './components/ProductCard';
import { ProductModal } from './components/ProductModal';
import { CartDrawer } from './components/CartDrawer';
import { Footer } from './components/Footer';
import { ContactModal } from './components/ContactModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { AdminPanel } from './components/AdminPanel';
import { Sparkles, RotateCcw, MessageCircle, Phone, MapPin, ArrowUpDown, X } from 'lucide-react';
import { CONTACT_INFO } from './data/contactInfo';
import { SortOption } from './types';

const MainContent: React.FC = () => {
  const {
    products,
    currentView,
    isAdminLoggedIn,
    filteredProducts,
    resetFilters,
    filters,
    setSortBy,
    isProductsLoading,
  } = useStore();

  const [contactModalState, setContactModalState] = useState<{
    isOpen: boolean;
    tab: 'contact' | 'about';
  }>({
    isOpen: false,
    tab: 'contact',
  });

  // If on admin view
  if (currentView === 'admin') {
    if (!isAdminLoggedIn) {
      return <AdminLoginModal />;
    }
    return <AdminPanel />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#fafafa] text-neutral-900 font-sans">
      {/* Dark Luxury Nav Bar */}
      <Header onOpenContact={() => setContactModalState({ isOpen: true, tab: 'contact' })} />
      
      {/* Clean, Simple Bangladesh Storefront Body */}
      <HeroBanner />

      {/* Main Products Grid Section */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {isProductsLoading && products.length === 0 ? (
          <div className="py-20 text-center space-y-4">
            <div className="w-10 h-10 border-2 border-red-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-neutral-500 font-medium tracking-wide">
              Connecting to Cloud Firestore & loading exclusive collection...
            </p>
          </div>
        ) : products.length === 0 ? (
          <div className="py-20 text-center space-y-5 max-w-md mx-auto">
            <div className="w-16 h-16 rounded-full bg-red-50 border border-red-200 text-red-600 flex items-center justify-center mx-auto shadow-sm">
              <Sparkles className="w-7 h-7" />
            </div>
            <h3 className="font-brand text-2xl font-bold text-neutral-900 tracking-tight">
              Exclusive Collection
            </h3>
            <p className="text-xs text-neutral-500 leading-relaxed font-normal">
              Our bespoke bridal, gown, and georgette dress collection is being prepared. Feel free to contact our atelier via WhatsApp or Phone for custom orders.
            </p>
            <div className="pt-2 flex justify-center gap-3">
              <a
                href={CONTACT_INFO.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs tracking-wider uppercase transition-all shadow-md"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Chat on WhatsApp</span>
              </a>
            </div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-20 text-center space-y-4 max-w-md mx-auto">
            <div className="w-16 h-16 rounded-full bg-red-50 border border-red-200 text-red-600 flex items-center justify-center mx-auto">
              <Sparkles className="w-7 h-7" />
            </div>
            <h3 className="font-brand text-xl font-bold text-neutral-900">
              No matching dresses found
            </h3>
            <p className="text-xs text-neutral-500 leading-relaxed font-normal">
              We couldn’t find any dresses matching your criteria
              {filters.searchQuery ? ` ("${filters.searchQuery}")` : ''}.
              Try viewing all dresses to explore the full collection.
            </p>
            <div>
              <button
                id="empty-reset-filters-btn"
                onClick={resetFilters}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-neutral-900 hover:bg-black text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Show All Dresses</span>
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-neutral-200">
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h2 className="text-lg sm:text-xl font-bold text-neutral-900 tracking-tight">
                    Exclusive Collection ({filteredProducts.length})
                  </h2>
                  {filters.selectedCategories.length > 0 && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
                      <span>{filters.selectedCategories.join(', ')}</span>
                      <button
                        type="button"
                        onClick={resetFilters}
                        className="hover:text-red-900 text-red-500 ml-1 cursor-pointer"
                        title="Clear filter"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {filters.searchQuery && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-neutral-100 border border-neutral-300 text-neutral-700 text-xs font-medium">
                      <span>"{filters.searchQuery}"</span>
                      <button
                        type="button"
                        onClick={resetFilters}
                        className="hover:text-neutral-900 text-neutral-500 ml-1 cursor-pointer"
                        title="Clear search"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                </div>
                <p className="text-xs text-neutral-500 mt-1">
                  Showing tailored dresses available for nationwide Cash on Delivery in Bangladesh
                </p>
              </div>

              {/* Storefront Sort Filter */}
              <div className="flex items-center gap-2.5 self-start sm:self-auto shrink-0">
                <span className="text-neutral-500 text-xs font-medium hidden sm:inline">Sort:</span>
                <div className="relative flex items-center">
                  <ArrowUpDown className="w-3.5 h-3.5 text-red-600 absolute left-3 pointer-events-none" />
                  <select
                    id="storefront-sort-select"
                    value={filters.sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="bg-white hover:bg-neutral-50 border border-neutral-300 text-neutral-800 text-xs rounded-full pl-8 pr-8 py-2 appearance-none focus:outline-none focus:border-red-500 font-medium cursor-pointer shadow-xs transition-colors"
                  >
                    <option value="featured">✨ Featured Dresses</option>
                    <option value="price-asc">💵 Price: Low to High (৳)</option>
                    <option value="price-desc">💎 Price: High to Low (৳)</option>
                    <option value="newest">🆕 Newest Arrivals</option>
                  </select>
                </div>
                {(filters.selectedCategories.length > 0 || filters.searchQuery) && (
                  <button
                    onClick={resetFilters}
                    className="inline-flex items-center gap-1 px-3 py-2 rounded-full text-xs font-semibold text-neutral-600 hover:text-red-600 border border-neutral-300 hover:border-red-300 bg-white transition-colors cursor-pointer shadow-xs"
                    title="View all dresses"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>View All</span>
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Floating Instant WhatsApp, Call & Store Location Bar */}
      <div className="fixed bottom-5 right-5 z-40 flex items-center gap-2 print:hidden">
        <button
          type="button"
          onClick={() => setContactModalState({ isOpen: true, tab: 'contact' })}
          className="hidden md:inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-full bg-neutral-900/90 hover:bg-black text-white text-xs font-semibold shadow-xl border border-neutral-700/80 backdrop-blur-sm transition-all hover:scale-105 cursor-pointer"
          title={`Store Location: ${CONTACT_INFO.address}`}
        >
          <MapPin className="w-3.5 h-3.5 text-red-500" />
          <span>Store Map</span>
        </button>

        <a
          href={CONTACT_INFO.phoneTelLink}
          className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-full bg-neutral-900 hover:bg-black text-white text-xs font-semibold shadow-xl border border-neutral-700/80 backdrop-blur-sm transition-all hover:scale-105 font-mono"
          title={`Direct Call: ${CONTACT_INFO.phoneFormatted}`}
        >
          <Phone className="w-3.5 h-3.5 text-red-500" />
          <span>{CONTACT_INFO.phoneFormatted}</span>
        </a>

        <a
          href={CONTACT_INFO.whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xl hover:shadow-emerald-600/30 transition-all hover:scale-105"
          title={`Chat on WhatsApp (${CONTACT_INFO.whatsappInternational})`}
          aria-label="Chat on WhatsApp"
        >
          <MessageCircle className="w-4 h-4 fill-current" />
          <span>WhatsApp</span>
        </a>
      </div>

      <Footer onOpenContact={(tab) => setContactModalState({ isOpen: true, tab })} />
      <ProductModal />
      <CartDrawer />
      <ContactModal
        isOpen={contactModalState.isOpen}
        initialTab={contactModalState.tab}
        onClose={() => setContactModalState((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <MainContent />
    </StoreProvider>
  );
}
