import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Product, DressSize, CustomerOrder } from '../types';
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
    updateOrderStatus,
    logoutAdmin,
    setCurrentView,
    resetToSampleProducts,
  } = useStore();

  const [activeTab, setActiveTab] = useState<'upload' | 'products' | 'orders' | 'categories' | 'metrics'>('upload');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form State for Adding / Uploading Product
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Party Gowns');
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
  const [uploadSuccessMessage, setUploadSuccessMessage] = useState('');

  // Admin search filter for products
  const [adminSearch, setAdminSearch] = useState('');

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
    if (!name.trim()) {
      alert('Please provide a dress name.');
      return;
    }
    if (!price || Number(price) <= 0) {
      alert('Please enter a valid price in BDT (৳).');
      return;
    }
    if (!imageUrl.trim()) {
      alert('Please provide an image address / link for the dress.');
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

    setUploadSuccessMessage(`"${created.name}" uploaded successfully! It is now live on Dhong storefront.`);
    // Reset form
    setName('');
    setPrice('');
    setOriginalPrice('');
    setImageUrl('');
    setDescription('');
    setSku('');
    setCustomCategory('');

    setTimeout(() => {
      setUploadSuccessMessage('');
      setActiveTab('products');
    }, 1800);
  };

  // Editing existing product
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    updateProduct(editingProduct.id, editingProduct);
    setEditingProduct(null);
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
      
      {/* Top Admin Navigation Header (Dark luxury header) */}
      <div className="border-b border-neutral-800 bg-neutral-900/95 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-400 text-neutral-950 flex items-center justify-center font-brand font-bold text-lg shadow-sm">
                D
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-brand font-bold tracking-wider text-base">DHONG</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-widest uppercase bg-amber-400 text-neutral-950">
                    ADMIN
                  </span>
                </div>
                <div className="text-[10px] text-neutral-400 tracking-wider">
                  Dhong Fashion Bangladesh • Master Admin Console
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                id="admin-view-store-btn"
                onClick={() => {
                  setCurrentView('store');
                  window.history.pushState(null, '', '/');
                }}
                className="px-3.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-750 text-neutral-200 text-xs font-medium border border-neutral-700 flex items-center gap-1.5 transition-all"
              >
                <span>View Live Storefront</span>
                <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
              </button>

              <button
                id="admin-logout-btn"
                onClick={logoutAdmin}
                className="p-2 rounded-lg bg-neutral-900 hover:bg-rose-950/60 hover:text-rose-400 text-neutral-400 border border-neutral-800 transition-all"
                title="Sign out of admin"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>

          </div>

          {/* Sub Navigation Tabs */}
          <div className="flex items-center gap-2 border-t border-neutral-800/80 pt-2 pb-2 overflow-x-auto text-xs">
            <button
              onClick={() => setActiveTab('upload')}
              className={`px-3.5 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
                activeTab === 'upload'
                  ? 'bg-amber-400 text-neutral-950 shadow'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
              }`}
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Upload New Dress</span>
            </button>

            <button
              onClick={() => setActiveTab('products')}
              className={`px-3.5 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
                activeTab === 'products'
                  ? 'bg-amber-400 text-neutral-950 shadow'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>Manage & Edit Posts ({products.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className={`px-3.5 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
                activeTab === 'orders'
                  ? 'bg-amber-400 text-neutral-950 shadow'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Orders ({orders.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('categories')}
              className={`px-3.5 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
                activeTab === 'categories'
                  ? 'bg-amber-400 text-neutral-950 shadow'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Categories ({categories.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('metrics')}
              className={`px-3.5 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
                activeTab === 'metrics'
                  ? 'bg-amber-400 text-neutral-950 shadow'
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
          <div className="max-w-4xl mx-auto space-y-6">
            
            <div>
              <h2 className="font-brand text-2xl font-bold tracking-tight text-neutral-100 mb-1">
                Upload New Dress to Dhong Bangladesh
              </h2>
              <p className="text-xs text-neutral-400">
                Provide dress specifications, BDT pricing, image link URL, categories, and fabric details.
              </p>
            </div>

            {uploadSuccessMessage && (
              <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-700/80 text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-medium">{uploadSuccessMessage}</span>
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
                    placeholder="e.g. Saffron Organza Silk Party Gown"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-neutral-300 mb-1.5 font-semibold">
                    SKU Code (Auto or custom)
                  </label>
                  <input
                    type="text"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    placeholder="e.g. DH-BD-102"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Category Selection & Price in BDT */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-neutral-300 mb-1.5 font-semibold">
                    Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-neutral-100 focus:outline-none focus:border-amber-400"
                  >
                    {categories.filter((c) => c !== 'All Dresses').map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                    <option value="New Category">+ Create Custom Category</option>
                  </select>
                </div>

                {category === 'New Category' && (
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-neutral-300 mb-1.5 font-semibold">
                      New Category Name
                    </label>
                    <input
                      type="text"
                      required
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      placeholder="e.g. Velvet Shawl Gowns"
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-amber-400"
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
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Original Price (for Discount) & Available Sizes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-neutral-300 mb-1.5 font-semibold">
                    Original Price in BDT (৳) - For Sale Badge
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(e.target.value)}
                    placeholder="e.g. 5200 (shows discount)"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-amber-400"
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
                          className={`w-9 h-9 rounded-lg text-xs font-bold transition-all ${
                            isSelected
                              ? 'bg-amber-400 text-neutral-950 shadow-md'
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
                  <span>Image Address / Link URL *</span>
                  <span className="text-[10px] text-neutral-400 lowercase font-normal">
                    (Paste direct web link e.g. https://...)
                  </span>
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <ImageIcon className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3" />
                    <input
                      type="url"
                      required
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="Paste image address: https://images.unsplash.com/..."
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                {/* Quick Sample Image links for effortless testing */}
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <span className="text-[11px] text-neutral-500">Quick Test Images:</span>
                  {sampleImages.map((s) => (
                    <button
                      type="button"
                      key={s.label}
                      onClick={() => setImageUrl(s.url)}
                      className="text-[11px] px-2.5 py-1 rounded bg-neutral-800 text-neutral-300 hover:text-amber-300 hover:bg-neutral-750 transition-colors"
                    >
                      {s.label}
                    </button>
                  ))}
                </div>

                {/* Live Image URL Preview Box */}
                {imageUrl && (
                  <div className="mt-3 p-3 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center gap-4">
                    <div className="w-20 h-24 rounded-lg bg-neutral-900 border border-neutral-800 overflow-hidden shrink-0">
                      <img
                        src={imageUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLElement).classList.add('hidden');
                        }}
                      />
                    </div>
                    <div className="text-xs space-y-1">
                      <div className="text-emerald-400 font-medium flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        <span>Image address verified</span>
                      </div>
                      <p className="text-neutral-400 text-[11px] line-clamp-1">{imageUrl}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Tags Input */}
              <div>
                <label className="block text-xs uppercase tracking-wider text-neutral-300 mb-1.5 font-semibold">
                  Tags & Fabric Details (Comma separated)
                </label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="e.g. Georgette, Silk, Festive, Floor Length, Party, Dhaka"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs uppercase tracking-wider text-neutral-300 mb-1.5 font-semibold">
                  Dress Description & Cut Specifications
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Details regarding drape, embroidery, lining, and sizing advice..."
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Switches: In Stock & Featured */}
              <div className="flex flex-wrap items-center gap-6 pt-2 border-t border-neutral-800">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-neutral-300">
                  <input
                    type="checkbox"
                    checked={inStock}
                    onChange={(e) => setInStock(e.target.checked)}
                    className="rounded bg-neutral-950 border-neutral-700 text-amber-500 focus:ring-0"
                  />
                  <span>Product is In Stock</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs text-neutral-300">
                  <input
                    type="checkbox"
                    checked={featured}
                    onChange={(e) => setFeatured(e.target.checked)}
                    className="rounded bg-neutral-950 border-neutral-700 text-amber-500 focus:ring-0"
                  />
                  <span>Mark as "Featured / Couture Pick"</span>
                </label>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  id="admin-submit-dress-btn"
                  type="submit"
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2"
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
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-brand text-2xl font-bold tracking-tight text-neutral-100">
                  Manage & Edit Posts ({products.length})
                </h2>
                <p className="text-xs text-neutral-400">
                  You can edit details, change prices in BDT, update images, or delete posts.
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
                    className="bg-neutral-900 border border-neutral-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-neutral-200 placeholder:text-neutral-500 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <button
                  onClick={resetToSampleProducts}
                  className="px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 text-xs flex items-center gap-1.5 transition-all"
                  title="Reset to default Bangladesh couture collection"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Reset Demo Items</span>
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
                            <div className="w-12 h-14 rounded-lg bg-neutral-950 border border-neutral-800 overflow-hidden shrink-0">
                              <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                            </div>
                            <div>
                              <div className="font-semibold text-neutral-200 line-clamp-1">{p.name}</div>
                              <div className="text-[10px] text-neutral-400 font-mono mt-0.5">{p.sku}</div>
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="py-3 px-4 text-neutral-300">
                          <span className="px-2.5 py-1 rounded-full bg-neutral-800 border border-neutral-700 text-[11px]">
                            {p.category}
                          </span>
                        </td>

                        {/* Sizes */}
                        <td className="py-3 px-4">
                          <div className="flex flex-wrap gap-1">
                            {p.sizes.map((s) => (
                              <span key={s} className="px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-300 text-[10px] font-bold">
                                {s}
                              </span>
                            ))}
                          </div>
                        </td>

                        {/* Price in BDT */}
                        <td className="py-3 px-4 font-bold text-amber-300">
                          {formatBDT(p.price)}
                        </td>

                        {/* In Stock Toggle */}
                        <td className="py-3 px-4">
                          <button
                            onClick={() => updateProduct(p.id, { inStock: !p.inStock })}
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${
                              p.inStock
                                ? 'bg-emerald-950 border border-emerald-800 text-emerald-400'
                                : 'bg-rose-950 border border-rose-800 text-rose-400'
                            }`}
                          >
                            {p.inStock ? 'In Stock' : 'Out of Stock'}
                          </button>
                        </td>

                        {/* Actions: Edit & Delete Posts */}
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              id={`admin-edit-${p.id}`}
                              onClick={() => setEditingProduct(p)}
                              className="px-2.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-amber-300 hover:text-white transition-all flex items-center gap-1"
                              title="Edit post"
                            >
                              <Edit className="w-3.5 h-3.5" />
                              <span className="text-[11px] font-medium">Edit</span>
                            </button>
                            <button
                              id={`admin-delete-${p.id}`}
                              onClick={() => {
                                if (confirm(`Are you sure you want to delete post "${p.name}"?`)) {
                                  deleteProduct(p.id);
                                }
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-rose-950 text-neutral-400 hover:text-rose-400 transition-all flex items-center gap-1"
                              title="Delete post"
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
          <div className="space-y-6">
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
                <div className="text-3xl font-bold font-brand text-amber-300 mt-2">{products.length}</div>
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
                <div className="text-3xl font-bold font-brand text-amber-400 mt-2">
                  {formatBDT(orders.reduce((sum, o) => sum + o.total, 0))}
                </div>
                <div className="text-[11px] text-neutral-400 mt-1">From checkout purchases</div>
              </div>

              <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800">
                <div className="text-neutral-400 text-xs uppercase tracking-wider">Active Categories</div>
                <div className="text-3xl font-bold font-brand text-neutral-100 mt-2">{categories.length}</div>
                <div className="text-[11px] text-neutral-400 mt-1">Gowns, Silks, Anarkalis</div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* EDIT PRODUCT POST MODAL */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-2xl text-neutral-100 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="font-brand text-lg font-bold">Edit Post: {editingProduct.name}</h3>
              <button onClick={() => setEditingProduct(null)} className="text-neutral-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div>
                <label className="block text-neutral-400 uppercase tracking-wider mb-1">Dress Name</label>
                <input
                  type="text"
                  required
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-neutral-100 focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-400 uppercase tracking-wider mb-1">Price (৳ BDT)</label>
                  <input
                    type="number"
                    required
                    value={editingProduct.price}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-neutral-100 focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 uppercase tracking-wider mb-1">Category</label>
                  <select
                    value={editingProduct.category}
                    onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-neutral-100 focus:border-amber-400 focus:outline-none"
                  >
                    {categories.filter((c) => c !== 'All Dresses').map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-neutral-400 uppercase tracking-wider mb-1">Image Address Link URL</label>
                <input
                  type="url"
                  required
                  value={editingProduct.imageUrl}
                  onChange={(e) => setEditingProduct({ ...editingProduct, imageUrl: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-neutral-100 focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-neutral-400 uppercase tracking-wider mb-1">Description</label>
                <textarea
                  rows={3}
                  value={editingProduct.description}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-neutral-100 focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingProduct.inStock}
                    onChange={(e) => setEditingProduct({ ...editingProduct, inStock: e.target.checked })}
                    className="rounded bg-neutral-950 border-neutral-700 text-amber-500"
                  />
                  <span>In Stock</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingProduct.featured || false}
                    onChange={(e) => setEditingProduct({ ...editingProduct, featured: e.target.checked })}
                    className="rounded bg-neutral-950 border-neutral-700 text-amber-500"
                  />
                  <span>Featured Post</span>
                </label>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2 rounded-lg bg-neutral-800 text-neutral-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-amber-400 text-neutral-950 font-bold"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
