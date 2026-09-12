import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Layers, Plus, Trash2, Check, Sparkles, Tag, ExternalLink, Info } from 'lucide-react';

export const CategoriesManager: React.FC = () => {
  const {
    categories,
    customCategories,
    addCategory,
    deleteCategory,
    products,
    selectCategoryOnly,
  } = useStore();

  const [newCatName, setNewCatName] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newCatName.trim();
    if (!trimmed) return;

    if (categories.some((c) => c.toLowerCase() === trimmed.toLowerCase())) {
      setFeedbackMessage(`Category "${trimmed}" already exists.`);
      setTimeout(() => setFeedbackMessage(''), 3000);
      return;
    }

    const success = addCategory(trimmed);
    if (success) {
      setFeedbackMessage(`Category "${trimmed}" added! It now appears on the top website dropdown & tabs.`);
      setNewCatName('');
      setTimeout(() => setFeedbackMessage(''), 4000);
    }
  };

  const getDressCount = (cat: string) => {
    return products.filter((p) => p.category.toLowerCase() === cat.toLowerCase()).length;
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-brand text-2xl font-bold tracking-tight text-neutral-100 flex items-center gap-2">
            <Layers className="w-6 h-6 text-amber-400" />
            Categories Management ({categories.length})
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Every category you create or upload here automatically updates the top website dropdown tabs and storefront filters in real-time.
          </p>
        </div>
      </div>

      {/* Info Notice */}
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-xs text-amber-200">
        <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-amber-300">Automatic Real-Time Synchronization</p>
          <p className="text-neutral-300 leading-relaxed">
            Whenever you add a category here or assign a new category while uploading a dress in "Upload New Dress", Dhong instantly appends it to the top navigation bar, the category dropdown menus, and the sidebar filter checkmarks without any page reload.
          </p>
        </div>
      </div>

      {/* Add New Category Form */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-lg">
        <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-200 mb-3 flex items-center gap-2">
          <Plus className="w-4 h-4 text-amber-400" />
          Add New Category
        </h3>
        
        <form onSubmit={handleAddCategory} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Tag className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3" />
            <input
              type="text"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              placeholder="e.g. Bridal Lehengas, Organza Sarees, Velvet Kaftans, Abayas..."
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-neutral-200 placeholder:text-neutral-500 focus:outline-none focus:border-amber-400 transition-colors"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Create Category</span>
          </button>
        </form>

        {feedbackMessage && (
          <div className="mt-3 p-2.5 rounded-xl bg-neutral-950 border border-emerald-500/40 text-emerald-400 text-xs flex items-center gap-2 animate-fadeIn">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{feedbackMessage}</span>
          </div>
        )}
      </div>

      {/* Categories Grid List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => {
          const count = getDressCount(cat);
          const isCustom = customCategories.includes(cat);

          return (
            <div
              key={cat}
              className="bg-neutral-900 border border-neutral-800 hover:border-neutral-700 rounded-2xl p-4 flex items-center justify-between transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-center text-amber-400 font-bold text-sm">
                  {cat.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="font-semibold text-neutral-200 text-sm flex items-center gap-2">
                    <span>{cat}</span>
                    {isCustom && (
                      <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        Custom
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-neutral-400 mt-0.5">
                    {count} {count === 1 ? 'dress' : 'dresses'} listed
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => selectCategoryOnly(cat)}
                  className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-amber-300 transition-colors"
                  title="View this category in storefront"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>

                {isCustom && (
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`Remove custom category "${cat}"? Products with this category won't be deleted.`)) {
                        deleteCategory(cat);
                      }
                    }}
                    className="p-2 rounded-lg bg-neutral-800 hover:bg-rose-950 text-neutral-400 hover:text-rose-400 transition-colors"
                    title="Delete custom category"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
