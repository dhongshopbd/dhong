import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { Search, ShoppingBag, X } from 'lucide-react';

export const Header: React.FC = () => {
  const { 
    cart, 
    setIsCartOpen, 
    filters, 
    setSearchQuery, 
    setCurrentView,
    resetFilters
  } = useStore();

  const [localSearch, setLocalSearch] = useState(filters.searchQuery);
  const totalCartItems = cart.reduce((total, item) => total + item.quantity, 0);

  // Sync search input with filter search query
  useEffect(() => {
    setLocalSearch(filters.searchQuery);
  }, [filters.searchQuery]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocalSearch(val);
    setSearchQuery(val);
  };

  const clearSearch = () => {
    setLocalSearch('');
    setSearchQuery('');
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (localSearch.trim().toLowerCase() === '/admin' || localSearch.trim().toLowerCase() === 'admin') {
      setCurrentView('admin');
      clearSearch();
    }
  };

  // Keyboard shortcut listener: typing '/admin' anywhere or Ctrl+Shift+A
  useEffect(() => {
    let keyBuffer = '';
    const handleKeyDown = (e: KeyboardEvent) => {
      // Secret key combination: Ctrl+Shift+A
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        setCurrentView('admin');
        return;
      }

      // Check if typing /admin
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
        return;
      }

      keyBuffer += e.key;
      if (keyBuffer.length > 10) {
        keyBuffer = keyBuffer.slice(-10);
      }
      if (keyBuffer.toLowerCase().endsWith('/admin')) {
        setCurrentView('admin');
        keyBuffer = '';
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setCurrentView]);

  return (
    <header className="sticky top-0 z-40 bg-neutral-950/95 backdrop-blur-md border-b border-neutral-800/80">
      {/* Top Announcement Bar - Bangladeshi Marketing Perks */}
      <div className="bg-neutral-900 border-b border-neutral-800/60 px-4 py-1.5 text-center text-xs tracking-wider text-neutral-400 font-light flex items-center justify-center gap-2 flex-wrap">
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
        <span className="text-amber-300 font-semibold uppercase tracking-wider">BANGLADESH NATIONWIDE DELIVERY:</span>
        <span className="text-neutral-300">Free delivery on orders over ৳5,000 | Cash on Delivery (COD) Available | bKash / Nagad</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          
          {/* Logo Brand */}
          <div 
            id="brand-logo"
            onClick={() => {
              setCurrentView('store');
              resetFilters();
              window.history.pushState(null, '', '/');
            }}
            className="cursor-pointer group flex flex-col items-start select-none"
          >
            <div className="flex items-center gap-1.5">
              <span className="font-brand text-3xl sm:text-4xl font-bold tracking-widest text-neutral-100 group-hover:text-amber-300 transition-colors duration-200">
                DHONG
              </span>
              <span className="text-amber-500 font-serif text-lg leading-none font-bold">.</span>
            </div>
            <span className="text-[10px] tracking-[0.28em] uppercase text-neutral-400 font-light -mt-1 group-hover:text-neutral-300 transition-colors">
              High Fashion & Dresses
            </span>
          </div>

          {/* Search Bar - Center */}
          <div className="flex-1 max-w-xl mx-2 sm:mx-6">
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <div className="relative flex items-center">
                <Search className="absolute left-3.5 w-4 h-4 text-neutral-400 pointer-events-none" />
                <input
                  id="search-dresses-input"
                  type="text"
                  value={localSearch}
                  onChange={handleSearchChange}
                  placeholder="Search dresses by name, style, size (e.g. Silk, S, Emerald)..."
                  className="w-full bg-neutral-900/90 border border-neutral-800 text-neutral-200 text-sm rounded-full pl-10 pr-10 py-2.5 placeholder:text-neutral-500 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/30 transition-all"
                />
                {localSearch && (
                  <button
                    id="clear-search-btn"
                    type="button"
                    onClick={clearSearch}
                    className="absolute right-3 text-neutral-400 hover:text-neutral-200 p-1"
                    aria-label="Clear search"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Action / Bag Button */}
          <div className="flex items-center gap-3">
            <button
              id="shopping-bag-btn"
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 rounded-full bg-neutral-900 border border-neutral-800 hover:border-amber-500/50 hover:bg-neutral-850 text-neutral-200 hover:text-amber-300 transition-all group flex items-center gap-2.5 px-4"
              aria-label="View Shopping Bag"
            >
              <ShoppingBag className="w-5 h-5 text-neutral-300 group-hover:text-amber-400 transition-colors" />
              <span className="hidden sm:inline text-xs font-medium tracking-wider uppercase text-neutral-300">
                Bag
              </span>
              {totalCartItems > 0 && (
                <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-bold bg-amber-500 text-neutral-950 rounded-full">
                  {totalCartItems}
                </span>
              )}
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
