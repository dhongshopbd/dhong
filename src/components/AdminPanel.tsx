import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Product, DressSize } from '../types';
import { ALL_SIZES } from '../data/initialProducts';
import {
  PlusCircle,
  Package,
  ShoppingBag,
  BarChart3,
  ExternalLink,
  LogOut,
  Trash2,
  Edit,
  Check,
  X,
  Image as ImageIcon,
  Search,
  RefreshCw,
  Layers,
  AlertTriangle,
  Sparkles,
  Tag,
} from 'lucide-react';
import { formatBDT } from '../utils/currency';
import { OrdersManager } from './admin/OrdersManager';
import { CategoriesManager } from './admin/CategoriesManager';

export const AdminPanel: React.FC = () => {
  const {
    products,
    categories,
    orders,
    addProduct,
    updateProduct,
    deleteProduct,
    logoutAdmin,
    setCurrentView,
    resetToSampleProducts,
  } = useStore();

  const [activeTab, setActiveTab] = useState<'upload' | 'products' | 'orders' | 'categories' | 'metrics'>('products');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  // Global toast notification
  const [globalToast, setGlobalToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Form State for Adding / Uploading Product
  const [name, setName] = useState('');
  const [category, setCategory] = useState(categories[0] || 'Party Gowns');
  const [customCategory, setCustomCategory] = useState('');
  const [price, setPrice] = useState<string>('');
  const [originalPrice, setOriginalPrice] = useState<string>('');
  const [selectedSizes, setSelectedSizes] = useState<DressSize[]>(['S', 'M', 'L']);
  const [tagsInput, setTagsInput] = useState('Georgette, Silk, Festive, Party, Dhaka');
  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState('');
  const [inStock, setInStock] = useState(true);
  const [featured, setFeatured] = useState(false);
  const [sku, setSku] = useState('');
  const [formError, setFormError] = useState('');

  // Admin search filter for products
  const [adminSearch, setAdminSearch] = useState('');

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setGlobalToast({ message, type });
    setTimeout(() => setGlobalToast(null), 4500);
  };

  const sampleImages = [
    { label: 'Royal Anarkali', url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80' },
    { label: 'Silk Cowl Gown', url: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=800&q=80' },
    { label: 'Velvet Evening', url: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=800&q=80' },
    { label: 'Emerald Cocktail', url: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=800&q=80' },
    { label: 'Golden Georgette', url: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80' },
  ];

  const handleToggleSize = (size: DressSize) => {
    if (selectedSizes.includes(size)) {
      if (selectedSizes.length > 1) {
        setSelectedSizes(selectedSizes.filter((s) => s !== size));
      }
    } else {
      setSelectedSizes([...selectedSizes, size]);
    }
  };

  const handleAddProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!name.trim()) {
      setFormError('Please enter a dress name.');
      return;
    }
    if (!price || Number(price) <= 0) {
      setFormError('Please enter a valid price in BDT (৳ Taka).');
      return;
    }
    if (!imageUrl.trim()) {
      setFormError('Please provide an image link URL for the dress.');
      return;
    }

    const finalCategory = customCategory.trim() || category;
    const finalTags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const created = addProduct({
      name: name.trim(),
      category: finalCategory,
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : undefined,
      sizes: selectedSizes,
      tags: finalTags,
      imageUrl: imageUrl.trim(),
      description: description.trim() || 'Exclusively crafted designer dress by Dhong Bangladesh.',
      inStock,
      featured,
      sku: sku.trim() || `DH-BD-${Date.now().toString().slice(-4)}`,
    });

    showToast(`"${created.name}" published! Automatically live on website storefront and saved to database.`);

    // Reset form
    setName('');
    setPrice('');
    setOriginalPrice('');
    setImageUrl('');
    setDescription('');
    setSku('');
    setCustomCategory('');

    setActiveTab('products');
  };

  // Editing existing product
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    updateProduct(editingProduct.id, editingProduct);
    const savedName = editingProduct.name;
    setEditingProduct(null);
    showToast(`Saved changes for "${savedName}"! Website updated automatically.`);
  };

  // Confirm delete product
  const handleConfirmDelete = () => {
    if (!productToDelete) return;
    const pName = productToDelete.name;
    deleteProduct(productToDelete.id);
    setProductToDelete(null);
    showToast(`"${pName}" deleted from storefront and database.`);
  };

  // Filtered admin products list
  const filteredAdminProducts = products.filter((p) => {
    if (!adminSearch.trim()) return true;
    const q = adminSearch.toLowerCase().trim();
    return (
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q) ||
      p.tags.some((t) => t.toLowerCase().includes(q))
    );
  });

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans">
      
      {/* Global Toast Alert */}
      {globalToast && (
        <div className="fixed top-4 right-4 z-50 animate-fadeIn max-w-md">
          <div
            className={`p-4 rounded-2xl shadow-2xl border text-xs flex items-center gap-3 backdrop-blur-xl ${
              globalToast.type === 'error'
                ? 'bg-rose-950/90 border-rose-500/50 text-rose-200'
                : 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200'
            }`}
          >
            <Check className="w-5 h-5 shrink-0 text-emerald-400" />
            <span className="font-semibold">{globalToast.message}</span>
            <button onClick={() => setGlobalToast(null)} className="ml-auto text-neutral-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Top Admin Navigation Header (Dark luxury header) */}
      <div className="border-b border-neutral-800 bg-neutral-900/95 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            <div className="flex items-center gap-3">
              <img
                src="/dhong-logo.png"
                onError={(e) => {
                  e.currentTarget.src = 'https://i.ibb.co.com/zVVGNSpd/bg.png';
                }}
                alt="Dhong Logo"
                className="h-10 w-auto object-contain brightness-110"
              />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-brand font-bold tracking-wider text-base">DHONG</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-widest uppercase bg-[#e32117] text-white">
                    ADMIN
                  </span>
                </div>
                <div className="text-[10px] text-red-400 font-medium tracking-wider">
                  Come meet the new you • Live Database Console
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                id="admin-view-store-btn"
                onClick={() => {
                  setCurrentView('store');
                  window.history.pushState(null, '', '/');
                }}
                className="px-3.5 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-750 text-neutral-200 text-xs font-semibold border border-neutral-700 flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
              >
                <span>View Live Website</span>
                <ExternalLink className="w-3.5 h-3.5 text-red-500" />
              </button>

              <button
                id="admin-logout-btn"
                onClick={logoutAdmin}
                className="p-2 rounded-xl bg-neutral-900 hover:bg-rose-950/60 hover:text-rose-400 text-neutral-400 border border-neutral-800 transition-all cursor-pointer"
                title="Sign out of admin"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>

          </div>

          {/* Sub Navigation Tabs */}
          <div className="flex items-center gap-2 border-t border-neutral-800/80 pt-2 pb-2 overflow-x-auto text-xs">
            <button
              onClick={() => setActiveTab('products')}
              className={`px-3.5 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'products'
                  ? 'bg-[#e32117] text-white shadow-md shadow-red-600/20'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>Dresses & Posts ({products.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('upload')}
              className={`px-3.5 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'upload'
                  ? 'bg-[#e32117] text-white shadow-md shadow-red-600/20'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
              }`}
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>+ Add New Dress</span>
            </button>

            <button
              onClick={() => setActiveTab('categories')}
              className={`px-3.5 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'categories'
                  ? 'bg-[#e32117] text-white shadow-md shadow-red-600/20'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Dropdown Categories ({categories.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className={`px-3.5 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'orders'
                  ? 'bg-[#e32117] text-white shadow-md shadow-red-600/20'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Customer Orders ({orders.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('metrics')}
              className={`px-3.5 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'metrics'
                  ? 'bg-[#e32117] text-white shadow-md shadow-red-600/20'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Business Overview</span>
            </button>
          </div>

        </div>
      </div>

      {/* Main Admin Content */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* TAB 1: UPLOAD PRODUCT FORM */}
        {activeTab === 'upload' && (
          <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
            
            <div>
              <h2 className="font-brand text-2xl font-bold tracking-tight text-neutral-100 mb-1">
                Upload New Dress to Storefront
              </h2>
              <p className="text-xs text-neutral-400">
                Any dress you add here automatically saves to the database and appears instantly on your live website.
              </p>
            </div>

            {formError && (
              <div className="p-4 rounded-xl bg-rose-950/80 border border-rose-700/80 text-rose-300 text-xs flex items-center gap-2 animate-fadeIn">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span className="font-medium">{formError}</span>
              </div>
            )}

            <form onSubmit={handleAddProductSubmit} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 sm:p-8 space-y-6">
              
              {/* Product Title & SKU */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs uppercase tracking-wider text-neutral-300 mb-1.5 font-semibold">
                    Dress Name / Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Royal Maroon Velvet Reception Gown"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-neutral-300 mb-1.5 font-semibold">
                    SKU Code (Optional)
                  </label>
                  <input
                    type="text"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    placeholder="e.g. DH-VEL-009"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              {/* Category & Custom Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-neutral-300 mb-1.5 font-semibold">
                    Category (In Dropdown Menu) *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => {
                      setCategory(e.target.value);
                      if (e.target.value !== '__custom__') {
                        setCustomCategory('');
                      }
                    }}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-neutral-100 focus:outline-none focus:border-red-500"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                    <option value="__custom__">+ Add Brand New Category...</option>
                  </select>
                </div>

                {category === '__custom__' && (
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-red-400 mb-1.5 font-semibold">
                      New Category Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      placeholder="e.g. Bridal Lehengas"
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-red-500"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs uppercase tracking-wider text-neutral-300 mb-1.5 font-semibold">
                    Price in BDT (৳ Taka) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="e.g. 4500"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              {/* Original Price & Sizes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-neutral-300 mb-1.5 font-semibold">
                    Original Price in BDT (৳) - For Sale Discount Badge
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(e.target.value)}
                    placeholder="e.g. 5200 (shows discount)"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-neutral-300 mb-1.5 font-semibold">
                    Available Sizes (Click to toggle) *
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {ALL_SIZES.map((size) => {
                      const isSelected = selectedSizes.includes(size);
                      return (
                        <button
                          type="button"
                          key={size}
                          onClick={() => handleToggleSize(size)}
                          className={`w-9 h-9 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-[#e32117] text-white shadow-md shadow-red-600/20'
                              : 'bg-neutral-950 border border-neutral-800 text-neutral-400 hover:border-neutral-700'
                          }`}
                        >
                          {size}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Image URL Address Input with Live Preview */}
              <div>
                <label className="block text-xs uppercase tracking-wider text-neutral-300 mb-1.5 font-semibold flex items-center justify-between">
                  <span>Image Address Link URL *</span>
                  <span className="text-[10px] text-neutral-400 lowercase font-normal">
                    (Paste direct web link or Unsplash photo)
                  </span>
                </label>
                <div className="flex gap-3 items-center">
                  <div className="relative flex-1">
                    <ImageIcon className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3" />
                    <input
                      type="url"
                      required
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="Paste image address: https://..."
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-red-500"
                    />
                  </div>
                  {imageUrl && (
                    <img
                      src={imageUrl}
                      alt="Preview"
                      className="w-10 h-12 object-cover rounded-lg border border-neutral-800 shrink-0"
                    />
                  )}
                </div>

                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <span className="text-[11px] text-neutral-500">Quick Test Photos:</span>
                  {sampleImages.map((s) => (
                    <button
                      type="button"
                      key={s.label}
                      onClick={() => setImageUrl(s.url)}
                      className="text-[11px] px-2.5 py-1 rounded bg-neutral-800 text-neutral-300 hover:text-red-400 hover:bg-neutral-750 transition-colors cursor-pointer"
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tags & Description */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-neutral-300 mb-1.5 font-semibold">
                    Tags (Comma-separated)
                  </label>
                  <input
                    type="text"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    placeholder="Silk, Georgette, Festive, Halter"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-neutral-300 mb-1.5 font-semibold">
                    Description
                  </label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Drape, embroidery, lining, and styling notes..."
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              {/* Switches */}
              <div className="flex flex-wrap items-center gap-6 pt-2 border-t border-neutral-800">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-neutral-300">
                  <input
                    type="checkbox"
                    checked={inStock}
                    onChange={(e) => setInStock(e.target.checked)}
                    className="rounded bg-neutral-950 border-neutral-700 text-red-600 focus:ring-0"
                  />
                  <span>Product is In Stock</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs text-neutral-300">
                  <input
                    type="checkbox"
                    checked={featured}
                    onChange={(e) => setFeatured(e.target.checked)}
                    className="rounded bg-neutral-950 border-neutral-700 text-red-600 focus:ring-0"
                  />
                  <span>Mark as "Featured / Couture Pick"</span>
                </label>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  id="admin-submit-dress-btn"
                  type="submit"
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#e32117] hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-red-600/20 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Publish Dress to Storefront</span>
                </button>
              </div>

            </form>
          </div>
        )}

        {/* TAB 2: PRODUCTS INVENTORY TABLE (EDIT & DELETE POSTS) */}
        {activeTab === 'products' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-brand text-2xl font-bold tracking-tight text-neutral-100">
                  Manage & Edit Dresses ({products.length})
                </h2>
                <p className="text-xs text-neutral-400">
                  Edit prices, change categories, update images, or delete dresses. All changes save permanently to the database.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={adminSearch}
                    onChange={(e) => setAdminSearch(e.target.value)}
                    placeholder="Search by title, SKU, tag..."
                    className="bg-neutral-900 border border-neutral-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-neutral-200 placeholder:text-neutral-500 focus:outline-none focus:border-red-500"
                  />
                </div>

                <button
                  onClick={resetToSampleProducts}
                  className="px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                  title="Reset to default Bangladesh couture collection"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Reset Demo Collection</span>
                </button>
              </div>
            </div>

            {/* Inventory Table */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-lg">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-neutral-950/80 border-b border-neutral-800 text-neutral-400 uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-3.5 px-4">Dress</th>
                      <th className="py-3.5 px-4">Category</th>
                      <th className="py-3.5 px-4">Sizes</th>
                      <th className="py-3.5 px-4">Price (BDT)</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-right">Actions (Edit / Delete)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800/80">
                    {filteredAdminProducts.map((p) => (
                      <tr key={p.id} className="hover:bg-neutral-850/50 transition-colors">
                        
                        {/* Dress Image & Info */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={p.imageUrl}
                              alt={p.name}
                              className="w-10 h-14 object-cover rounded-lg border border-neutral-800 shrink-0"
                            />
                            <div>
                              <div className="font-semibold text-neutral-200 line-clamp-1">{p.name}</div>
                              <div className="text-[10px] text-neutral-500 font-mono mt-0.5">
                                SKU: {p.sku}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4 text-neutral-300">
                          <span className="px-2 py-0.5 rounded-full bg-neutral-950 border border-neutral-800 text-[11px]">
                            {p.category}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-neutral-400">
                          <div className="flex gap-1 flex-wrap">
                            {p.sizes.map((s) => (
                              <span key={s} className="px-1.5 py-0.5 bg-neutral-800 text-neutral-300 rounded text-[10px] font-bold">
                                {s}
                              </span>
                            ))}
                          </div>
                        </td>

                        <td className="py-3 px-4 font-semibold text-neutral-200">
                          {formatBDT(p.price)}
                          {p.originalPrice && p.originalPrice > p.price && (
                            <span className="text-[10px] text-neutral-500 line-through ml-1.5">
                              {formatBDT(p.originalPrice)}
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-4">
                          {p.inStock ? (
                            <span className="inline-flex items-center gap-1 text-emerald-400 text-[11px]">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                              In Stock
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-rose-400 text-[11px]">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                              Sold Out
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              id={`admin-edit-${p.id}`}
                              onClick={() => setEditingProduct(p)}
                              className="px-2.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-red-400 hover:text-white transition-all flex items-center gap-1 cursor-pointer"
                              title="Edit dress post"
                            >
                              <Edit className="w-3.5 h-3.5" />
                              <span className="text-[11px] font-medium">Edit</span>
                            </button>
                            <button
                              id={`admin-delete-${p.id}`}
                              onClick={() => setProductToDelete(p)}
                              className="px-2.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-rose-950 text-neutral-400 hover:text-rose-400 transition-all flex items-center gap-1 cursor-pointer"
                              title="Delete dress post"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span className="text-[11px] font-medium">Delete</span>
                            </button>
                          </div>
                        </td>

                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: MASTER CUSTOMER ORDERS MANAGEMENT */}
        {activeTab === 'orders' && <OrdersManager />}

        {/* TAB 4: DYNAMIC CATEGORIES MANAGEMENT */}
        {activeTab === 'categories' && <CategoriesManager />}

        {/* TAB 5: STORE METRICS */}
        {activeTab === 'metrics' && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h2 className="font-brand text-2xl font-bold tracking-tight text-neutral-100">
                Dhong Business Overview (BDT)
              </h2>
              <p className="text-xs text-neutral-400">
                Real-time operational stats and revenue in Bangladeshi Taka.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800">
                <div className="text-neutral-400 text-xs uppercase tracking-wider">Total Dresses</div>
                <div className="text-3xl font-bold font-brand text-red-400 mt-2">{products.length}</div>
                <div className="text-[11px] text-emerald-400 mt-1">
                  {products.filter((p) => p.inStock).length} in stock
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800">
                <div className="text-neutral-400 text-xs uppercase tracking-wider">Total Orders</div>
                <div className="text-3xl font-bold font-brand text-neutral-100 mt-2">{orders.length}</div>
                <div className="text-[11px] text-neutral-400 mt-1">Confirmed client orders</div>
              </div>

              <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800">
                <div className="text-neutral-400 text-xs uppercase tracking-wider">Gross Sales (BDT)</div>
                <div className="text-3xl font-bold font-brand text-red-500 mt-2">
                  {formatBDT(orders.reduce((sum, o) => sum + o.total, 0))}
                </div>
                <div className="text-[11px] text-neutral-400 mt-1">From checkout purchases</div>
              </div>

              <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800">
                <div className="text-neutral-400 text-xs uppercase tracking-wider">Active Categories</div>
                <div className="text-3xl font-bold font-brand text-neutral-100 mt-2">{categories.length}</div>
                <div className="text-[11px] text-neutral-400 mt-1">In dropdown & storefront</div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* EDIT PRODUCT POST MODAL */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-neutral-100 space-y-5 animate-fadeIn max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
              <div>
                <h3 className="font-brand text-xl font-bold flex items-center gap-2">
                  <Edit className="w-5 h-5 text-red-500" />
                  <span>Edit Dress: {editingProduct.name}</span>
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Changes automatically save to database and update website immediately.
                </p>
              </div>
              <button
                onClick={() => setEditingProduct(null)}
                className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div>
                <label className="block text-neutral-300 uppercase tracking-wider mb-1 font-semibold">
                  Dress Name / Title *
                </label>
                <input
                  type="text"
                  required
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-neutral-100 focus:border-red-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-neutral-300 uppercase tracking-wider mb-1 font-semibold">
                    Category (In Dropdown Menu) *
                  </label>
                  <select
                    value={editingProduct.category}
                    onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-neutral-100 focus:border-red-500 focus:outline-none"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-neutral-300 uppercase tracking-wider mb-1 font-semibold">
                    SKU Code
                  </label>
                  <input
                    type="text"
                    value={editingProduct.sku}
                    onChange={(e) => setEditingProduct({ ...editingProduct, sku: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-neutral-100 focus:border-red-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-neutral-300 uppercase tracking-wider mb-1 font-semibold">
                    Price in BDT (৳) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={editingProduct.price}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-neutral-100 focus:border-red-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-neutral-300 uppercase tracking-wider mb-1 font-semibold">
                    Original Price (৳) - For Sale Discount Badge
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editingProduct.originalPrice || ''}
                    onChange={(e) => setEditingProduct({
                      ...editingProduct,
                      originalPrice: e.target.value ? Number(e.target.value) : undefined
                    })}
                    placeholder="e.g. 5500"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-neutral-100 focus:border-red-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Sizes Pill Selection */}
              <div>
                <label className="block text-neutral-300 uppercase tracking-wider mb-1.5 font-semibold">
                  Available Sizes (Click to toggle)
                </label>
                <div className="flex flex-wrap gap-2">
                  {ALL_SIZES.map((size) => {
                    const isSelected = editingProduct.sizes.includes(size);
                    return (
                      <button
                        type="button"
                        key={size}
                        onClick={() => {
                          const current = editingProduct.sizes;
                          const next = isSelected
                            ? current.length > 1 ? current.filter((s) => s !== size) : current
                            : [...current, size];
                          setEditingProduct({ ...editingProduct, sizes: next });
                        }}
                        className={`w-10 h-10 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                            : 'bg-neutral-950 border border-neutral-800 text-neutral-400 hover:border-neutral-700'
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Image URL & Preview */}
              <div>
                <label className="block text-neutral-300 uppercase tracking-wider mb-1 font-semibold">
                  Image Address Link URL *
                </label>
                <div className="flex gap-3 items-center">
                  <input
                    type="url"
                    required
                    value={editingProduct.imageUrl}
                    onChange={(e) => setEditingProduct({ ...editingProduct, imageUrl: e.target.value })}
                    className="flex-1 bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-neutral-100 focus:border-red-500 focus:outline-none"
                  />
                  {editingProduct.imageUrl && (
                    <img
                      src={editingProduct.imageUrl}
                      alt="Preview"
                      className="w-12 h-14 object-cover rounded-lg border border-neutral-800 shrink-0"
                    />
                  )}
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-neutral-300 uppercase tracking-wider mb-1 font-semibold">
                  Tags (Comma-separated)
                </label>
                <input
                  type="text"
                  value={editingProduct.tags.join(', ')}
                  onChange={(e) => setEditingProduct({
                    ...editingProduct,
                    tags: e.target.value.split(',').map((t) => t.trim()).filter(Boolean)
                  })}
                  placeholder="Silk, Evening, Floor Length, Velvet"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-neutral-100 focus:border-red-500 focus:outline-none"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-neutral-300 uppercase tracking-wider mb-1 font-semibold">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={editingProduct.description}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-neutral-100 focus:border-red-500 focus:outline-none"
                />
              </div>

              {/* Status Switches */}
              <div className="flex items-center gap-6 pt-2 border-t border-neutral-800">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingProduct.inStock}
                    onChange={(e) => setEditingProduct({ ...editingProduct, inStock: e.target.checked })}
                    className="rounded bg-neutral-950 border-neutral-700 text-red-600 w-4 h-4"
                  />
                  <span className="text-neutral-200">In Stock for Ordering</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingProduct.featured || false}
                    onChange={(e) => setEditingProduct({ ...editingProduct, featured: e.target.checked })}
                    className="rounded bg-neutral-950 border-neutral-700 text-red-600 w-4 h-4"
                  />
                  <span className="text-neutral-200">Featured / Couture Pick</span>
                </label>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-5 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-750 text-neutral-300 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-7 py-2.5 rounded-xl bg-[#e32117] hover:bg-red-700 text-white font-bold shadow-lg shadow-red-600/30 flex items-center gap-2 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Save & Update Website</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE PRODUCT POST CONFIRMATION MODAL (No window.confirm) */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-2xl text-neutral-100 space-y-4 animate-fadeIn">
            <div className="flex items-center gap-3 text-red-500">
              <div className="p-2.5 rounded-xl bg-red-950/50 border border-red-500/30">
                <AlertTriangle className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <h3 className="font-brand text-lg font-bold">Delete Dress Post?</h3>
                <p className="text-xs text-neutral-400">Storefront & Database Removal</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-neutral-950 rounded-xl border border-neutral-800">
              <img
                src={productToDelete.imageUrl}
                alt={productToDelete.name}
                className="w-12 h-16 object-cover rounded-lg border border-neutral-800 shrink-0"
              />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-white truncate">{productToDelete.name}</p>
                <p className="text-[11px] text-neutral-400">{productToDelete.category} • {formatBDT(productToDelete.price)}</p>
                <p className="text-[10px] text-neutral-500 font-mono">SKU: {productToDelete.sku}</p>
              </div>
            </div>

            <p className="text-xs text-neutral-300 leading-relaxed">
              Are you sure you want to permanently delete this dress? It will be removed immediately from the website storefront and deleted from the database.
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-800">
              <button
                type="button"
                onClick={() => setProductToDelete(null)}
                className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-lg shadow-red-600/30 cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
