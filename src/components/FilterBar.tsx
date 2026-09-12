import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { ALL_SIZES } from '../data/initialProducts';
import { DressSize, SortOption } from '../types';
import { SlidersHorizontal, ArrowUpDown, X, Check, Tag, CheckSquare, Square, RotateCcw } from 'lucide-react';

export const FilterBar: React.FC = () => {
  const {
    categories,
    filters,
    toggleCategoryFilter,
    clearCategoriesFilter,
    toggleSizeFilter,
    togglePriceRangeFilter,
    toggleTagFilter,
    setSortBy,
    setOnlyInStock,
    setOnlyDiscounted,
    resetFilters,
    filteredProducts,
    allTags,
  } = useStore();

  const [showTickModal, setShowTickModal] = useState(false);

  const priceOptions = [
    { key: 'under-2500', label: 'Under ৳2,500' },
    { key: '2500-4000', label: '৳2,500 – ৳4,000' },
    { key: '4000-6000', label: '৳4,000 – ৳6,000' },
    { key: 'above-6000', label: 'Above ৳6,000' },
  ];

  const totalActiveTicks =
    filters.selectedCategories.length +
    filters.selectedSizes.length +
    filters.selectedPriceRanges.length +
    filters.selectedTags.length +
    (filters.onlyInStock ? 1 : 0) +
    (filters.onlyDiscounted ? 1 : 0);

  const hasActiveFilters = totalActiveTicks > 0 || filters.searchQuery !== '';

  return (
    <div className="bg-neutral-900 border-b border-neutral-800 text-neutral-100 sticky top-20 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        
        {/* Main Controls Row */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          
          {/* Left: Category Tick Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-neutral-400 text-xs font-semibold uppercase tracking-wider shrink-0 mr-1 hidden sm:inline">
              Categories:
            </span>

            <button
              id="filter-cat-all"
              onClick={clearCategoriesFilter}
              className={`px-3 py-1.5 rounded-full text-xs font-medium tracking-wide flex items-center gap-1.5 shrink-0 transition-all ${
                filters.selectedCategories.length === 0
                  ? 'bg-red-600 text-white font-bold shadow-sm'
                  : 'bg-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-750 border border-neutral-700/60'
              }`}
            >
              {filters.selectedCategories.length === 0 ? (
                <CheckSquare className="w-3.5 h-3.5 text-white" />
              ) : (
                <Square className="w-3.5 h-3.5 text-neutral-400" />
              )}
              <span>All Collection</span>
            </button>

            {categories.map((cat) => {
              const isChecked = filters.selectedCategories.includes(cat);
              return (
                <button
                  key={cat}
                  id={`tick-cat-${cat.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                  onClick={() => toggleCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium tracking-wide flex items-center gap-1.5 shrink-0 transition-all ${
                    isChecked
                      ? 'bg-red-600 text-white font-bold shadow-sm'
                      : 'bg-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-750 border border-neutral-700/60'
                  }`}
                >
                  {isChecked ? (
                    <CheckSquare className="w-3.5 h-3.5 text-white" />
                  ) : (
                    <Square className="w-3.5 h-3.5 text-neutral-400" />
                  )}
                  <span>{cat}</span>
                </button>
              );
            })}
          </div>

          {/* Right: Quick Sort & Detailed Tick Mark Filter Drawer Toggle */}
          <div className="flex items-center justify-between lg:justify-end gap-3 shrink-0 pt-1 lg:pt-0 border-t border-neutral-800/80 lg:border-t-0">
            
            {/* Sort Filter (low to high, high to low, etc.) */}
            <div className="flex items-center gap-2">
              <span className="text-neutral-400 text-xs font-medium hidden sm:inline">Sort:</span>
              <div className="relative flex items-center">
                <ArrowUpDown className="w-3.5 h-3.5 text-red-500 absolute left-3 pointer-events-none" />
                <select
                  id="sort-select-bdt"
                  value={filters.sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="bg-neutral-800 hover:bg-neutral-750 border border-neutral-700 text-neutral-100 text-xs rounded-full pl-8 pr-7 py-1.5 appearance-none focus:outline-none focus:border-red-500 font-medium cursor-pointer transition-colors"
                >
                  <option value="featured">✨ Featured Dresses</option>
                  <option value="price-asc">💵 Price: Low to High (৳)</option>
                  <option value="price-desc">💎 Price: High to Low (৳)</option>
                  <option value="newest">🆕 Newest Arrivals</option>
                </select>
              </div>
            </div>

            {/* Tick Mark Filter Toggle Button */}
            <button
              id="open-tick-filters-btn"
              onClick={() => setShowTickModal(!showTickModal)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-2 border transition-all ${
                showTickModal || totalActiveTicks > 0
                  ? 'bg-red-600 text-white border-red-600 shadow-sm'
                  : 'bg-neutral-800 text-neutral-200 border-neutral-700 hover:bg-neutral-750'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Tick Filters</span>
              {totalActiveTicks > 0 && (
                <span className="w-4 h-4 rounded-full bg-white text-red-600 text-[10px] font-bold flex items-center justify-center">
                  {totalActiveTicks}
                </span>
              )}
            </button>

            {/* Active reset link */}
            {hasActiveFilters && (
              <button
                id="quick-reset-filters-btn"
                onClick={resetFilters}
                className="text-neutral-400 hover:text-red-400 text-xs flex items-center gap-1 transition-colors"
                title="Reset all filters"
              >
                <RotateCcw className="w-3 h-3" />
                <span className="hidden sm:inline">Reset</span>
              </button>
            )}

          </div>

        </div>

        {/* Row 2: Secondary Quick Filter Bar (Sizes & Price Brackets with Tick Marks) */}
        <div className="pt-2.5 mt-2.5 border-t border-neutral-800/60 flex flex-wrap items-center justify-between gap-3 text-xs">
          
          {/* Size Multi-Select Tick Toggles */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-neutral-400 text-[11px] font-semibold uppercase tracking-wider">
              Sizes:
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {ALL_SIZES.map((sz) => {
                const isChecked = filters.selectedSizes.includes(sz as DressSize);
                return (
                  <button
                    key={sz}
                    id={`size-tick-${sz}`}
                    onClick={() => toggleSizeFilter(sz as DressSize)}
                    className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1 transition-all ${
                      isChecked
                        ? 'bg-red-600 text-white shadow-sm'
                        : 'bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-700/80 hover:border-neutral-600'
                    }`}
                  >
                    {isChecked ? (
                      <Check className="w-3 h-3 text-white stroke-[3]" />
                    ) : (
                      <span className="w-2.5 h-2.5 rounded-[2px] border border-neutral-500 inline-block" />
                    )}
                    <span>{sz}</span>
                  </button>
                );
              })}
            </div>

            <div className="h-4 w-[1px] bg-neutral-800 mx-1 hidden md:block" />

            {/* Price Range Brackets (BDT) Tick Marks */}
            <div className="hidden md:flex items-center gap-1.5 flex-wrap">
              <span className="text-neutral-400 text-[11px] font-semibold uppercase tracking-wider">
                Price (BDT):
              </span>
              {priceOptions.map((opt) => {
                const isChecked = filters.selectedPriceRanges.includes(opt.key);
                return (
                  <button
                    key={opt.key}
                    id={`price-tick-${opt.key}`}
                    onClick={() => togglePriceRangeFilter(opt.key)}
                    className={`px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1 transition-all ${
                      isChecked
                        ? 'bg-red-600 text-white font-bold shadow-sm'
                        : 'bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-700/80 hover:border-neutral-600'
                    }`}
                  >
                    {isChecked ? (
                      <Check className="w-3 h-3 text-white stroke-[3]" />
                    ) : (
                      <span className="w-2.5 h-2.5 rounded-[2px] border border-neutral-500 inline-block" />
                    )}
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>

          </div>

          {/* Product Count Display */}
          <div className="text-xs text-neutral-400 ml-auto flex items-center gap-2">
            <span>
              Showing <strong className="text-red-400 font-bold">{filteredProducts.length}</strong> dresses
            </span>
          </div>

        </div>

        {/* Detailed Tick Mark Filters Drawer */}
        {showTickModal && (
          <div className="mt-3 pt-3 border-t border-neutral-800 bg-neutral-950/90 p-4 sm:p-5 rounded-2xl space-y-4 animate-fadeIn">
            
            <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-red-500" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-200">
                  Detailed Filter Criteria (Tick what you want)
                </h4>
              </div>
              <button
                onClick={() => setShowTickModal(false)}
                className="p-1 rounded text-neutral-400 hover:text-white hover:bg-neutral-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Column 1: Category Checkboxes */}
              <div>
                <h5 className="text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>Categories</span>
                  {filters.selectedCategories.length > 0 && (
                    <button
                      onClick={clearCategoriesFilter}
                      className="text-[11px] text-red-400 hover:underline lowercase font-normal"
                    >
                      clear
                    </button>
                  )}
                </h5>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {categories.map((cat) => {
                    const isChecked = filters.selectedCategories.includes(cat);
                    return (
                      <label
                        key={cat}
                        className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg cursor-pointer text-xs transition-colors ${
                          isChecked ? 'bg-neutral-800 text-red-400 font-semibold' : 'text-neutral-300 hover:bg-neutral-900'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleCategoryFilter(cat)}
                          className="w-4 h-4 rounded border-neutral-700 bg-neutral-900 text-red-600 focus:ring-red-500/30 accent-red-600 cursor-pointer"
                        />
                        <span>{cat}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Column 2: Price Brackets (BDT) & Deals */}
              <div>
                <h5 className="text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2">
                  Price in BDT (৳)
                </h5>
                <div className="space-y-1.5">
                  {priceOptions.map((opt) => {
                    const isChecked = filters.selectedPriceRanges.includes(opt.key);
                    return (
                      <label
                        key={opt.key}
                        className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg cursor-pointer text-xs transition-colors ${
                          isChecked ? 'bg-neutral-800 text-red-400 font-semibold' : 'text-neutral-300 hover:bg-neutral-900'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => togglePriceRangeFilter(opt.key)}
                          className="w-4 h-4 rounded border-neutral-700 bg-neutral-900 text-red-600 focus:ring-red-500/30 accent-red-600 cursor-pointer"
                        />
                        <span>{opt.label}</span>
                      </label>
                    );
                  })}
                </div>

                <div className="pt-3 mt-3 border-t border-neutral-800 space-y-1.5">
                  <label className="flex items-center gap-2 px-2.5 py-1 rounded-lg cursor-pointer text-xs text-neutral-300 hover:bg-neutral-900">
                    <input
                      type="checkbox"
                      checked={filters.onlyDiscounted}
                      onChange={(e) => setOnlyDiscounted(e.target.checked)}
                      className="w-4 h-4 rounded border-neutral-700 bg-neutral-900 text-red-600 focus:ring-red-500/30 accent-red-600 cursor-pointer"
                    />
                    <span className="text-red-400 font-medium">On Sale / Discounted only</span>
                  </label>

                  <label className="flex items-center gap-2 px-2.5 py-1 rounded-lg cursor-pointer text-xs text-neutral-300 hover:bg-neutral-900">
                    <input
                      type="checkbox"
                      checked={filters.onlyInStock}
                      onChange={(e) => setOnlyInStock(e.target.checked)}
                      className="w-4 h-4 rounded border-neutral-700 bg-neutral-900 text-red-600 focus:ring-red-500/30 accent-red-600 cursor-pointer"
                    />
                    <span>In Stock items only</span>
                  </label>
                </div>
              </div>

              {/* Column 3: Fabric & Style Tags */}
              <div>
                <h5 className="text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-red-500" />
                  <span>Fabric & Silhouette Tags</span>
                </h5>
                <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto pr-1">
                  {allTags.map((tag) => {
                    const isChecked = filters.selectedTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        onClick={() => toggleTagFilter(tag)}
                        className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all flex items-center gap-1 ${
                          isChecked
                            ? 'bg-red-600 text-white font-bold border-red-600'
                            : 'bg-neutral-900 border-neutral-750 text-neutral-300 hover:border-neutral-600 hover:text-white'
                        }`}
                      >
                        {isChecked ? (
                          <Check className="w-3 h-3 text-white stroke-[3]" />
                        ) : (
                          <span className="w-2 h-2 rounded-full bg-neutral-600 inline-block" />
                        )}
                        <span>{tag}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Footer actions of filter modal */}
            <div className="flex items-center justify-between pt-3 border-t border-neutral-800">
              <button
                onClick={resetFilters}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-neutral-400 hover:text-red-400 transition-colors"
              >
                Clear all tick marks
              </button>
              <button
                onClick={() => setShowTickModal(false)}
                className="px-6 py-2 rounded-lg bg-[#e32117] hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-red-600/20"
              >
                Apply ({filteredProducts.length} Results)
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
