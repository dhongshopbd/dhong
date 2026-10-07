import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Layers, Plus, Trash2, Check, Sparkles, Tag, ExternalLink, Edit2, AlertTriangle, X } from 'lucide-react';
import { CATEGORY_HIERARCHY } from '../../data/categoryHierarchy';

export const CategoriesManager: React.FC = () => {
  const {
    categories,
    addCategory,
    updateCategory,
    deleteCategory,
    products,
    selectCategoryOnly,
  } = useStore();

  const [newCatName, setNewCatName] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Editing state
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editCatName, setEditCatName] = useState('');

  // Delete modal state
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);

  const showNotification = (text: string, type: 'success' | 'error' = 'success') => {
    setFeedbackMessage({ text, type });
    setTimeout(() => setFeedbackMessage(null), 4000);
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newCatName.trim();
    if (!trimmed) return;

    if (categories.some((c) => c.toLowerCase() === trimmed.toLowerCase())) {
      showNotification(`Category "${trimmed}" already exists in dropdown.`, 'error');
      return;
    }

    const success = addCategory(trimmed);
    if (success) {
      showNotification(`"${trimmed}" added! It is now live in the top dropdown menu and filters.`);
      setNewCatName('');
    } else {
      showNotification(`Could not add "${trimmed}".`, 'error');
    }
  };

  const handleStartEdit = (cat: string) => {
    setEditingCategory(cat);
    setEditCatName(cat);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;
    const trimmed = editCatName.trim();
    if (!trimmed) return;

    if (trimmed.toLowerCase() !== editingCategory.toLowerCase() &&
        categories.some((c) => c.toLowerCase() === trimmed.toLowerCase())) {
      showNotification(`Category "${trimmed}" already exists.`, 'error');
      return;
    }

    const success = updateCategory(editingCategory, trimmed);
    if (success) {
      showNotification(`Renamed to "${trimmed}"! All dresses and top dropdown updated.`);
      setEditingCategory(null);
    }
  };

  const confirmDeleteCategory = () => {
    if (!categoryToDelete) return;
    const catName = categoryToDelete;
    deleteCategory(catName);
    setCategoryToDelete(null);
    showNotification(`"${catName}" removed from dropdown menu and saved to database.`);
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
            <Layers className="w-6 h-6 text-red-500" />
            Dropdown Menu & Categories ({categories.length})
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Add or delete categories here. Any change is automatically saved to the database and updates the top dropdown menu in real-time.
          </p>
        </div>
      </div>

      {/* Info Notice */}
      <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-start gap-3 text-xs text-neutral-300">
        <Sparkles className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-neutral-100">Live Website Synchronization</p>
          <p className="text-neutral-400 leading-relaxed">
            Categories you add or remove here immediately reflect in the top <strong>"Dress Categories"</strong> hover dropdown, the quick navigation tabs, and the sidebar filter checkmarks.
          </p>
        </div>
      </div>

      {/* Add New Category Form */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-lg">
        <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-200 mb-3 flex items-center gap-2">
          <Plus className="w-4 h-4 text-red-500" />
          Add Category to Dropdown Menu
        </h3>
        
        <form onSubmit={handleAddCategory} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Tag className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3" />
            <input
              type="text"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              placeholder="e.g. Bridal Lehengas, Organza Sarees, Velvet Kaftans, Abayas..."
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-neutral-200 placeholder:text-neutral-500 focus:outline-none focus:border-red-500 transition-colors"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-[#e32117] hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-red-600/20 flex items-center justify-center gap-2 shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add to Dropdown</span>
          </button>
        </form>

        {feedbackMessage && (
          <div
            className={`mt-3 p-3 rounded-xl border text-xs flex items-center gap-2 animate-fadeIn ${
              feedbackMessage.type === 'error'
                ? 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                : 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
            }`}
          >
            <Check className="w-4 h-4 shrink-0" />
            <span>{feedbackMessage.text}</span>
          </div>
        )}
      </div>

      {/* Categories Grid List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => {
          const count = getDressCount(cat);
          const meta = CATEGORY_HIERARCHY[cat];
          const isEditing = editingCategory === cat;

          return (
            <div
              key={cat}
              className="bg-neutral-900 border border-neutral-800 hover:border-neutral-700 rounded-2xl p-4 flex flex-col justify-between transition-all group"
            >
              {isEditing ? (
                <form onSubmit={handleSaveEdit} className="space-y-3">
                  <div className="text-xs font-semibold text-neutral-300">Edit Category Name</div>
                  <input
                    type="text"
                    value={editCatName}
                    onChange={(e) => setEditCatName(e.target.value)}
                    className="w-full bg-neutral-950 border border-red-500/50 rounded-xl p-2 text-xs text-white focus:outline-none"
                    autoFocus
                  />
                  <div className="flex items-center gap-2 justify-end">
                    <button
                      type="button"
                      onClick={() => setEditingCategory(null)}
                      className="px-2.5 py-1 rounded-lg bg-neutral-800 text-neutral-400 text-xs hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs"
                    >
                      Save
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-center text-red-500 font-bold text-xs shrink-0">
                        {cat.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold text-neutral-200 text-sm flex items-center gap-2">
                          <span>{cat}</span>
                          {meta?.nameBn && (
                            <span className="text-[11px] text-neutral-500 font-normal">
                              ({meta.nameBn})
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-neutral-400 mt-0.5">
                          {count} {count === 1 ? 'dress' : 'dresses'} listed
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-neutral-800/80 pt-3 mt-3">
                    <button
                      type="button"
                      onClick={() => selectCategoryOnly(cat)}
                      className="inline-flex items-center gap-1.5 text-[11px] text-neutral-400 hover:text-red-400 transition-colors cursor-pointer"
                      title="View dresses in storefront"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>View in Store</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleStartEdit(cat)}
                        className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors cursor-pointer"
                        title="Edit / Rename Category"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => setCategoryToDelete(cat)}
                        className="p-1.5 rounded-lg bg-neutral-800 hover:bg-rose-950 text-neutral-400 hover:text-rose-400 transition-colors cursor-pointer"
                        title="Delete from dropdown menu"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* IN-APP CONFIRMATION MODAL FOR DELETING CATEGORY (No window.confirm) */}
      {categoryToDelete && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-2xl text-neutral-100 space-y-4 animate-fadeIn">
            <div className="flex items-center gap-3 text-red-500">
              <div className="p-2.5 rounded-xl bg-red-950/50 border border-red-500/30">
                <AlertTriangle className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <h3 className="font-brand text-lg font-bold">Delete Category?</h3>
                <p className="text-xs text-neutral-400">Dropdown Menu & Website Navigation</p>
              </div>
            </div>

            <p className="text-xs text-neutral-300 leading-relaxed">
              Are you sure you want to delete <strong className="text-white">"{categoryToDelete}"</strong>? 
              This will remove it from the top dropdown menu, navigation tabs, and filters. Any dresses currently in this category will be re-assigned.
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-800">
              <button
                type="button"
                onClick={() => setCategoryToDelete(null)}
                className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteCategory}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-lg shadow-red-600/30 cursor-pointer"
              >
                Delete Category
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
