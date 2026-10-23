import React, { useState } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Header } from './components/Header';
import { HeroBanner } from './components/HeroBanner';
import { FilterBar } from './components/FilterBar';
import { ProductCard } from './components/ProductCard';
import { ProductModal } from './components/ProductModal';
import { CartDrawer } from './components/CartDrawer';
import { Footer } from './components/Footer';
import { ContactModal } from './components/ContactModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { AdminPanel } from './components/AdminPanel';
import { Sparkles, RotateCcw, MessageCircle, Phone, MapPin } from 'lucide-react';
import { CONTACT_INFO } from './data/contactInfo';

const MainContent: React.FC = () => {
  const {
    products,
    currentView,
    setCurrentView,
    isAdminLoggedIn,
    filteredProducts,
    resetFilters,
    filters,
    isProductsLoading,
    firestoreError,
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
      
      {/* Tick-Mark Filter Bar (Dark Nav Bar Extension with Tick Marks) */}
      <FilterBar />

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
              Dress Collection is Ready
            </h3>
            <p className="text-xs text-neutral-500 leading-relaxed font-normal">
              Your Cloud Firestore database is connected and active. The dress catalog is empty until you add your first luxury dresses from the Admin Panel.
            </p>
            <div className="pt-2">
              <button
                id="empty-go-admin-btn"
                onClick={() => {
                  setCurrentView('admin');
                  window.history.pushState(null, '', '/admin');
                }}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer hover:shadow-lg"
              >
                <span>Open Admin Panel to Add Dresses</span>
              </button>
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
              We couldn’t find any dresses matching your selected tick marks or search keyword
              {filters.searchQuery ? ` ("${filters.searchQuery}")` : ''}.
              Try clearing some filter checkmarks to see more dresses.
            </p>
            <div>
              <button
                id="empty-reset-filters-btn"
                onClick={resetFilters}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-neutral-900 hover:bg-black text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset All Filters</span>
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-neutral-900 tracking-tight">
                  Exclusive Collection ({filteredProducts.length})
                </h2>
                <p className="text-xs text-neutral-500">
                  Showing tailored dresses available for nationwide Cash on Delivery in Bangladesh
                </p>
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
