import React from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Header } from './components/Header';
import { HeroBanner } from './components/HeroBanner';
import { FilterBar } from './components/FilterBar';
import { ProductCard } from './components/ProductCard';
import { ProductModal } from './components/ProductModal';
import { CartDrawer } from './components/CartDrawer';
import { Footer } from './components/Footer';
import { AdminLoginModal } from './components/AdminLoginModal';
import { AdminPanel } from './components/AdminPanel';
import { Sparkles, RotateCcw } from 'lucide-react';

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
      <Header />
      
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

      <Footer />
      <ProductModal />
      <CartDrawer />
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
