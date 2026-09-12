import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../context/StoreContext';
import { Search, ShoppingBag, X, ChevronDown, Layers, Sparkles, Check, Tag } from 'lucide-react';

export const Header: React.FC = () => {
  const { 
    cart, 
    setIsCartOpen, 
    filters, 
    setSearchQuery, 
    setCurrentView,
    resetFilters,
    categories,
    selectCategoryOnly,
    products
  } = useStore();

  const [localSearch, setLocalSearch] = useState(filters.searchQuery);
  const [isCatDropdownOpen, setIsCatDropdownOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const moreRef = useRef<HTMLDivElement>(null);
  const catTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const moreTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const totalCartItems = cart.reduce((total, item) => total + item.quantity, 0);

  // Hover handlers for "Dress Categories" dropdown: opens on cursor hover with zero click needed
  const handleCatMouseEnter = () => {
    if (catTimerRef.current) {
      clearTimeout(catTimerRef.current);
      catTimerRef.current = null;
    }
    setIsCatDropdownOpen(true);
  };

  const handleCatMouseLeave = () => {
    if (catTimerRef.current) {
      clearTimeout(catTimerRef.current);
    }
    catTimerRef.current = setTimeout(() => {
      setIsCatDropdownOpen(false);
    }, 220);
  };

  // Hover handlers for "+ More Categories" dropdown
  const handleMoreMouseEnter = () => {
    if (moreTimerRef.current) {
      clearTimeout(moreTimerRef.current);
      moreTimerRef.current = null;
    }
    setIsMoreOpen(true);
  };

  const handleMoreMouseLeave = () => {
    if (moreTimerRef.current) {
      clearTimeout(moreTimerRef.current);
    }
    moreTimerRef.current = setTimeout(() => {
      setIsMoreOpen(false);
    }, 220);
  };

  // Close dropdowns when clicking outside and cleanup timers
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsCatDropdownOpen(false);
      }
      if (moreRef.current && !moreRef.current.contains(event.target as Node)) {
        setIsMoreOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (catTimerRef.current) clearTimeout(catTimerRef.current);
      if (moreTimerRef.current) clearTimeout(moreTimerRef.current);
    };
  }, []);

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
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        setCurrentView('admin');
        return;
      }

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

  // Handle category selection
  const handleSelectCategory = (cat: string) => {
    selectCategoryOnly(cat);
    setIsCatDropdownOpen(false);
    setIsMoreOpen(false);

    // Scroll to dresses collection if not in view
    const mainSection = document.querySelector('main');
    if (mainSection) {
      mainSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Categories partition: show first 5 directly as tabs, others in "+ More"
  const primaryTabs = categories.slice(0, 5);
  const overflowTabs = categories.slice(5);

  // Helper to count dresses per category
  const getDressCount = (cat: string) => {
    return products.filter((p) => p.category.toLowerCase() === cat.toLowerCase()).length;
  };

  const isAllSelected = filters.selectedCategories.length === 0;

  return (
    <header className="sticky top-0 z-40 bg-neutral-950/95 backdrop-blur-md border-b border-neutral-800/80 shadow-lg">
      {/* Top Announcement Bar - Bangladeshi Marketing Perks */}
      <div className="bg-neutral-900 border-b border-neutral-800/60 px-4 py-1.5 text-center text-xs tracking-wider text-neutral-400 font-light flex items-center justify-center gap-2 flex-wrap">
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
        <span className="text-red-400 font-semibold uppercase tracking-wider">BANGLADESH NATIONWIDE DELIVERY:</span>
        <span className="text-neutral-300">Free delivery on orders over ৳5,000 | Cash on Delivery (COD) Available | bKash / Nagad</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Header Row: Logo, Search, Bag */}
        <div className="flex items-center justify-between h-18 sm:h-20 gap-3 sm:gap-4">
          
          {/* Logo Brand with Official Crest / Insignia */}
          <div 
            id="brand-logo"
            onClick={() => {
              setCurrentView('store');
              resetFilters();
              window.history.pushState(null, '', '/');
            }}
            className="cursor-pointer group flex items-center gap-2.5 sm:gap-3.5 select-none shrink-0"
          >
            <img
              src="/dhong-logo.png"
              onError={(e) => {
                e.currentTarget.src = 'https://i.ibb.co.com/zVVGNSpd/bg.png';
              }}
              alt="Dhong Brand Logo"
              className="h-10 sm:h-12 w-auto object-contain drop-shadow-[0_2px_8px_rgba(227,33,23,0.35)] transition-transform duration-200 group-hover:scale-105"
            />
            <div className="flex flex-col items-start">
              <div className="flex items-center gap-1">
                <span className="font-brand text-2xl sm:text-3xl font-bold tracking-widest text-neutral-100 group-hover:text-red-500 transition-colors duration-200">
                  DHONG
                </span>
                <span className="text-red-600 font-serif text-xl leading-none font-bold">.</span>
              </div>
              <span className="text-[9px] sm:text-[10px] tracking-[0.24em] sm:tracking-[0.28em] uppercase text-neutral-400 font-light -mt-0.5 group-hover:text-neutral-300 transition-colors">
                High Fashion & Dresses
              </span>
            </div>
          </div>

          {/* Search Bar - Center */}
          <div className="flex-1 max-w-xl mx-1 sm:mx-6">
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <div className="relative flex items-center">
                <Search className="absolute left-3.5 w-4 h-4 text-neutral-400 pointer-events-none" />
                <input
                  id="search-dresses-input"
                  type="text"
                  value={localSearch}
                  onChange={handleSearchChange}
                  placeholder="Search dresses by name, style, size (e.g. Silk, S, Crimson)..."
                  className="w-full bg-neutral-900/90 border border-neutral-800 text-neutral-200 text-xs sm:text-sm rounded-full pl-9 sm:pl-10 pr-9 sm:pr-10 py-2 sm:py-2.5 placeholder:text-neutral-500 focus:outline-none focus:border-red-500/70 focus:ring-1 focus:ring-red-500/30 transition-all"
                />
                {localSearch && (
                  <button
                    id="clear-search-btn"
                    type="button"
                    onClick={clearSearch}
                    className="absolute right-3 text-neutral-400 hover:text-neutral-200 p-1"
                    aria-label="Clear search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Action / Bag Button */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              id="shopping-bag-btn"
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 sm:p-2.5 rounded-full bg-neutral-900 border border-neutral-800 hover:border-red-500/50 hover:bg-neutral-850 text-neutral-200 hover:text-red-400 transition-all group flex items-center gap-2 px-3 sm:px-4"
              aria-label="View Shopping Bag"
            >
              <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-300 group-hover:text-red-400 transition-colors" />
              <span className="hidden sm:inline text-xs font-medium tracking-wider uppercase text-neutral-300">
                Bag
              </span>
              {totalCartItems > 0 && (
                <span className="inline-flex items-center justify-center min-w-[18px] sm:min-w-[20px] h-4 sm:h-5 px-1 sm:px-1.5 text-[11px] font-bold bg-red-600 text-white rounded-full shadow-xs">
                  {totalCartItems}
                </span>
              )}
            </button>
          </div>

        </div>

        {/* TOP CATEGORIES NAVIGATION BAR (Dropdown + Tabs) */}
        <div className="border-t border-neutral-800/80 py-2 flex items-center justify-between gap-3 text-xs">
          
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto scrollbar-none py-0.5 w-full">
            
            {/* 1. Main "Dress Categories" Dropdown Button - Opens on hover when cursor is kept over it */}
            <div 
              className="relative shrink-0 group" 
              ref={dropdownRef}
              onMouseEnter={handleCatMouseEnter}
              onMouseLeave={handleCatMouseLeave}
            >
              <button
                id="header-categories-dropdown-btn"
                type="button"
                onClick={() => setIsCatDropdownOpen(!isCatDropdownOpen)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all select-none ${
                  isCatDropdownOpen
                    ? 'bg-red-600 text-white border-red-600 font-bold shadow-xs'
                    : 'bg-neutral-900 hover:bg-neutral-850 text-neutral-200 hover:text-red-400 border-neutral-800'
                }`}
                aria-haspopup="true"
                aria-expanded={isCatDropdownOpen}
                title="Hover cursor to view all dress categories"
              >
                <Layers className="w-3.5 h-3.5 text-red-500 group-hover:text-white transition-colors" />
                <span className="font-semibold uppercase tracking-wider text-[11px]">Dress Categories</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isCatDropdownOpen ? 'rotate-180 text-white' : 'text-neutral-400'}`} />
              </button>

              {/* Categories Mega Dropdown Menu - Drops down on hover */}
              {isCatDropdownOpen && (
                <div 
                  id="header-categories-dropdown-menu"
                  onMouseEnter={handleCatMouseEnter}
                  onMouseLeave={handleCatMouseLeave}
                  className="absolute left-0 top-full pt-1.5 w-72 sm:w-84 z-50 animate-fadeIn"
                >
                  <div className="bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl p-2.5 backdrop-blur-xl border-t-2 border-t-red-600">
                    <div className="px-3 py-2 border-b border-neutral-800 flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                      <span className="flex items-center gap-1.5 text-red-400">
                        <Sparkles className="w-3.5 h-3.5" />
                        Dress Categories (ঢং কালেকশন)
                      </span>
                      <span className="text-[10px] text-neutral-400 bg-neutral-800 px-2 py-0.5 rounded-full font-mono">
                        {categories.length} total
                      </span>
                    </div>

                    <div className="py-1.5 max-h-80 overflow-y-auto space-y-1">
                      {/* All Dresses option */}
                      <button
                        type="button"
                        onClick={() => handleSelectCategory('All')}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors ${
                          isAllSelected
                            ? 'bg-red-600/15 text-red-300 font-semibold border border-red-500/30'
                            : 'text-neutral-300 hover:bg-neutral-800 hover:text-white'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <Tag className="w-3.5 h-3.5 text-red-500" />
                          <span>All Collections / সমস্ত পোশাক</span>
                        </span>
                        <span className="text-[10px] font-mono text-neutral-400">
                          {products.length} dresses
                        </span>
                      </button>

                      {/* Dynamic categories (Automatically updates whenever a category is added!) */}
                      {categories.map((cat) => {
                        const isSelected = filters.selectedCategories.includes(cat);
                        const count = getDressCount(cat);
                        return (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => handleSelectCategory(cat)}
                            className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors ${
                              isSelected
                                ? 'bg-red-600/15 text-red-300 font-semibold border border-red-500/30'
                                : 'text-neutral-300 hover:bg-neutral-800 hover:text-white'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              {isSelected ? (
                                <Check className="w-3.5 h-3.5 text-red-500 shrink-0" />
                              ) : (
                                <span className="w-1.5 h-1.5 rounded-full bg-neutral-600 shrink-0"></span>
                              )}
                              <span className="line-clamp-1">{cat}</span>
                            </div>
                            <span className="text-[10px] font-mono text-neutral-400 bg-neutral-950 px-2 py-0.5 rounded-full">
                              {count} {count === 1 ? 'dress' : 'dresses'}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    <div className="pt-2 mt-1 border-t border-neutral-800 px-2 flex items-center justify-between text-[11px] text-neutral-400">
                      <span>Click to filter collection</span>
                      <span className="text-red-400/80 font-medium">Dhong BD</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Separator */}
            <div className="h-4 w-px bg-neutral-800 mx-1 shrink-0 hidden sm:block"></div>

            {/* 2. "All Dresses" Tab */}
            <button
              id="header-tab-all"
              type="button"
              onClick={() => handleSelectCategory('All')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium tracking-wide shrink-0 transition-all ${
                isAllSelected
                  ? 'bg-neutral-850 text-red-400 border border-red-500/40 font-semibold shadow-xs'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
              }`}
            >
              All Dresses
            </button>

            {/* 3. Primary Category Tabs (Dynamic) */}
            {primaryTabs.map((cat) => {
              const isSelected = filters.selectedCategories.includes(cat);
              const count = getDressCount(cat);
              return (
                <button
                  key={cat}
                  id={`header-tab-${cat.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                  type="button"
                  onClick={() => handleSelectCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium tracking-wide shrink-0 transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-neutral-850 text-red-400 border border-red-500/40 font-semibold shadow-xs'
                      : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
                  }`}
                >
                  <span>{cat}</span>
                  {count > 0 && (
                    <span className="text-[10px] text-neutral-400 font-mono opacity-80">
                      ({count})
                    </span>
                  )}
                </button>
              );
            })}

            {/* 4. "+ More Categories" Dropdown Tab - Also opens on hover when cursor is kept over it */}
            {overflowTabs.length > 0 && (
              <div 
                className="relative shrink-0 group" 
                ref={moreRef}
                onMouseEnter={handleMoreMouseEnter}
                onMouseLeave={handleMoreMouseLeave}
              >
                <button
                  id="header-more-categories-btn"
                  type="button"
                  onClick={() => setIsMoreOpen(!isMoreOpen)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium tracking-wide shrink-0 transition-all flex items-center gap-1 border border-transparent ${
                    isMoreOpen || overflowTabs.some((c) => filters.selectedCategories.includes(c))
                      ? 'bg-neutral-850 text-red-400 border-neutral-700 font-semibold'
                      : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
                  }`}
                  title="Hover cursor to view remaining dress categories"
                >
                  <span>+{overflowTabs.length} More</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isMoreOpen ? 'rotate-180' : ''}`} />
                </button>

                {isMoreOpen && (
                  <div 
                    onMouseEnter={handleMoreMouseEnter}
                    onMouseLeave={handleMoreMouseLeave}
                    className="absolute left-0 top-full pt-1.5 w-64 z-50 animate-fadeIn"
                  >
                    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl p-2 border-t-2 border-t-red-600">
                      <div className="px-3 py-1.5 border-b border-neutral-800 text-[10px] uppercase font-bold text-neutral-400 tracking-wider flex items-center justify-between">
                        <span>More Categories</span>
                        <span className="text-red-400 font-mono">{overflowTabs.length}</span>
                      </div>
                      <div className="py-1 max-h-60 overflow-y-auto space-y-1">
                        {overflowTabs.map((cat) => {
                          const isSelected = filters.selectedCategories.includes(cat);
                          const count = getDressCount(cat);
                          return (
                            <button
                              key={cat}
                              type="button"
                              onClick={() => handleSelectCategory(cat)}
                              className={`w-full text-left px-3 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                                isSelected
                                  ? 'bg-red-600/15 text-red-300 font-semibold'
                                  : 'text-neutral-300 hover:bg-neutral-800 hover:text-white'
                              }`}
                            >
                              <span className="line-clamp-1">{cat}</span>
                              <span className="text-[10px] font-mono text-neutral-400">
                                ({count})
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>

        </div>
      </div>
    </header>
  );
};

