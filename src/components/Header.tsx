import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../context/StoreContext';
import { Search, ShoppingBag, X, ChevronDown, Layers, Sparkles, Check, Tag, MapPin, Phone } from 'lucide-react';
import { CATEGORY_HIERARCHY } from '../data/categoryHierarchy';
import { CONTACT_INFO } from '../data/contactInfo';

interface HeaderProps {
  onOpenContact?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenContact }) => {
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
  const dropdownRef = useRef<HTMLDivElement>(null);
  const catTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const totalCartItems = cart.reduce((total, item) => total + item.quantity, 0);

  // Hover handlers for "Dress Categories" dropdown: opens on cursor hover
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
    }, 280);
  };

  // Close dropdown when clicking outside and cleanup timers
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsCatDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (catTimerRef.current) clearTimeout(catTimerRef.current);
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

    // Scroll to dresses collection if not in view
    const mainSection = document.querySelector('main');
    if (mainSection) {
      mainSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

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
        <span className="text-neutral-300">
          Free delivery on orders over ৳5,000 | Cash on Delivery (COD) | Hotline:{' '}
          <a href={CONTACT_INFO.phoneTelLink} className="text-red-400 hover:text-red-300 font-semibold underline decoration-red-500/40 transition-colors font-mono">
            {CONTACT_INFO.phoneFormatted}
          </a>{' '}
          | WhatsApp:{' '}
          <a
            href={CONTACT_INFO.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors font-mono"
          >
            {CONTACT_INFO.whatsappNumber}
          </a>
        </span>
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
              src="/assets/aistudio/dhong-logo_ce533da6.jpeg"
              onError={(e) => {
                e.currentTarget.src = '/dhong-logo.png';
              }}
              alt="Dhong Brand Logo"
              className="h-11 sm:h-13 w-auto object-contain rounded-lg drop-shadow-[0_2px_8px_rgba(227,33,23,0.35)] transition-transform duration-200 group-hover:scale-105"
            />
            <div className="flex flex-col items-start">
              <div className="flex items-center gap-1">
                <span className="font-brand text-2xl sm:text-3xl font-bold tracking-widest text-neutral-100 group-hover:text-red-500 transition-colors duration-200">
                  DHONG
                </span>
                <span className="text-red-600 font-serif text-xl leading-none font-bold">.</span>
              </div>
              <span className="text-[9px] sm:text-[10px] tracking-[0.2em] sm:tracking-[0.24em] uppercase text-red-400 font-semibold -mt-0.5 group-hover:text-red-300 transition-colors">
                Come meet the new you
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

          {/* Action Buttons: Store Location & Bag */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {onOpenContact && (
              <button
                id="header-location-contact-btn"
                type="button"
                onClick={onOpenContact}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-full bg-neutral-900 border border-neutral-800 hover:border-red-500/50 hover:bg-neutral-850 text-neutral-300 hover:text-white transition-all text-xs font-semibold tracking-wider uppercase cursor-pointer"
                title={`Visit Store at ${CONTACT_INFO.address}`}
              >
                <MapPin className="w-3.5 h-3.5 text-red-500" />
                <span className="hidden md:inline">Location & Contact</span>
                <span className="md:hidden">Contact</span>
              </button>
            )}

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
        <div className="border-t border-neutral-800/80 py-2 flex items-center gap-2.5 text-xs relative">
          
          {/* 1. Main "Dress Categories" Dropdown Button - NOT inside overflow container so flyout will NEVER be clipped */}
          <div 
            className="relative shrink-0" 
            ref={dropdownRef}
            onMouseEnter={handleCatMouseEnter}
            onMouseLeave={handleCatMouseLeave}
          >
            <button
              id="header-categories-dropdown-btn"
              type="button"
              onClick={() => setIsCatDropdownOpen(!isCatDropdownOpen)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all select-none cursor-pointer ${
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

            {/* Categories Dropdown Menu - Drops straight down */}
            {isCatDropdownOpen && (
              <div 
                id="header-categories-dropdown-menu"
                onMouseEnter={handleCatMouseEnter}
                onMouseLeave={handleCatMouseLeave}
                className="absolute left-0 top-full pt-1.5 z-50 animate-fadeIn select-none"
              >
                <div className="w-72 sm:w-80 bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl p-2.5 backdrop-blur-xl border-t-2 border-t-red-600">
                  <div className="px-3 py-2 border-b border-neutral-800 flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                    <span className="flex items-center gap-1.5 text-red-400">
                      <Sparkles className="w-3.5 h-3.5" />
                      Dress Categories (ঢং কালেকশন)
                    </span>
                    <span className="text-[10px] text-neutral-400 bg-neutral-800 px-2 py-0.5 rounded-full font-mono">
                      {categories.length} total
                    </span>
                  </div>

                  <div className="py-1.5 max-h-[380px] overflow-y-auto space-y-1">
                    {/* All Dresses option */}
                    <button
                      type="button"
                      onClick={() => handleSelectCategory('All')}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors cursor-pointer ${
                        isAllSelected
                          ? 'bg-red-600/15 text-red-300 font-semibold border border-red-500/30'
                          : 'text-neutral-300 hover:bg-neutral-800 hover:text-white border border-transparent'
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

                    {/* Dynamic categories - Pure Clean Dropdown List */}
                    {categories.map((cat) => {
                      const isSelected = filters.selectedCategories.includes(cat);
                      const count = getDressCount(cat);
                      const hierarchy = CATEGORY_HIERARCHY[cat];

                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => handleSelectCategory(cat)}
                          className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-red-600/15 text-red-300 font-semibold border border-red-500/30'
                              : 'text-neutral-300 hover:bg-neutral-800/80 hover:text-white border border-transparent'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            {isSelected ? (
                              <Check className="w-3.5 h-3.5 text-red-500 shrink-0" />
                            ) : (
                              <span className="w-1.5 h-1.5 rounded-full shrink-0 bg-neutral-600"></span>
                            )}
                            <div className="flex flex-col min-w-0">
                              <span className="line-clamp-1">{cat}</span>
                              {hierarchy?.nameBn && (
                                <span className="text-[10px] text-neutral-400 font-normal leading-tight line-clamp-1">
                                  {hierarchy.nameBn}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0 ml-2">
                            <span className="text-[10px] font-mono text-neutral-400 bg-neutral-950 px-2 py-0.5 rounded-full">
                              {count}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="pt-2 mt-1 border-t border-neutral-800 px-2 flex items-center justify-between text-[11px] text-neutral-400">
                    <span>Click any category to filter</span>
                    <span className="text-red-400/80 font-medium">Dhong BD</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Separator */}
          <div className="h-4 w-px bg-neutral-800 mx-0.5 shrink-0 hidden sm:block"></div>

          {/* Quick Category Tabs in scrollable container - ALL CATEGORIES, NO "+ MORE" DROPDOWN */}
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto scrollbar-none py-0.5 min-w-0 flex-1">
            {/* All Dresses Tab */}
            <button
              id="header-tab-all"
              type="button"
              onClick={() => handleSelectCategory('All')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium tracking-wide shrink-0 transition-all cursor-pointer ${
                isAllSelected
                  ? 'bg-neutral-850 text-red-400 border border-red-500/40 font-semibold shadow-xs'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
              }`}
            >
              All Dresses
            </button>

            {/* Direct Category Tabs */}
            {categories.map((cat) => {
              const isSelected = filters.selectedCategories.includes(cat);
              const count = getDressCount(cat);
              return (
                <button
                  key={cat}
                  id={`header-tab-${cat.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                  type="button"
                  onClick={() => handleSelectCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium tracking-wide shrink-0 transition-all flex items-center gap-1.5 cursor-pointer ${
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
          </div>

        </div>
      </div>
    </header>
  );
};

