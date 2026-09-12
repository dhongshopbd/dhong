import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CartItem, CustomerOrder, FilterState, DressSize, SortOption } from '../types';
import { INITIAL_PRODUCTS, INITIAL_CATEGORIES, INITIAL_ORDERS } from '../data/initialProducts';

interface StoreContextType {
  products: Product[];
  categories: string[];
  customCategories: string[];
  cart: CartItem[];
  orders: CustomerOrder[];
  filters: FilterState;
  selectedProduct: Product | null;
  isCartOpen: boolean;
  isAdminLoggedIn: boolean;
  currentView: 'store' | 'admin';
  filteredProducts: Product[];
  allTags: string[];
  
  // Actions
  setSelectedProduct: (product: Product | null) => void;
  setIsCartOpen: (open: boolean) => void;
  addToCart: (product: Product, size: DressSize, quantity?: number) => void;
  removeFromCart: (productId: string, size: DressSize) => void;
  updateCartQuantity: (productId: string, size: DressSize, delta: number) => void;
  clearCart: () => void;
  placeOrder: (customerData: {
    customerName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    paymentMethod: 'Cash on Delivery (COD)' | 'bKash / Nagad' | 'Debit/Credit Card';
  }) => CustomerOrder;
  
  // Category management & direct selection
  addCategory: (categoryName: string) => boolean;
  deleteCategory: (categoryName: string) => void;
  selectCategoryOnly: (categoryName: string) => void;

  // Filter actions with tick marks & multi-selection
  toggleCategoryFilter: (category: string) => void;
  clearCategoriesFilter: () => void;
  toggleSizeFilter: (size: DressSize) => void;
  togglePriceRangeFilter: (rangeKey: string) => void;
  toggleTagFilter: (tag: string) => void;
  setSortBy: (sort: SortOption) => void;
  setSearchQuery: (query: string) => void;
  setOnlyInStock: (only: boolean) => void;
  setOnlyDiscounted: (only: boolean) => void;
  resetFilters: () => void;
  
  // Admin actions
  setCurrentView: (view: 'store' | 'admin') => void;
  loginAdmin: (username: string, pass: string) => boolean;
  logoutAdmin: () => void;
  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => Product;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  updateOrderStatus: (orderId: string, status: CustomerOrder['status']) => void;
  deleteOrder: (orderId: string) => void;
  addManualOrder: (order: Omit<CustomerOrder, 'id' | 'createdAt'>) => CustomerOrder;
  resetOrdersToSample: () => void;
  resetToSampleProducts: () => void;
}

const defaultFilters: FilterState = {
  selectedCategories: [],
  selectedSizes: [],
  selectedPriceRanges: [],
  selectedTags: [],
  minPrice: 0,
  maxPrice: 20000,
  sortBy: 'featured',
  searchQuery: '',
  onlyInStock: false,
  onlyDiscounted: false,
};

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const PRODUCTS_STORAGE_KEY = 'dhong_bd_products_v2';
const ORDERS_STORAGE_KEY = 'dhong_bd_orders_v2';
const CART_STORAGE_KEY = 'dhong_bd_cart_v2';
const CATEGORIES_STORAGE_KEY = 'dhong_bd_categories_v2';
const ADMIN_AUTH_KEY = 'dhong_admin_auth';

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Products state with localStorage persistence
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(PRODUCTS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return INITIAL_PRODUCTS;
  });

  // Custom Categories state (persisted so any added category sticks automatically)
  const [customCategories, setCustomCategories] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(CATEGORIES_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore
    }
    return [];
  });

  // Cart state
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [];
  });

  // Orders state - includes realistic Bangladesh sample orders across all statuses if fresh
  const [orders, setOrders] = useState<CustomerOrder[]>(() => {
    try {
      const saved = localStorage.getItem(ORDERS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return INITIAL_ORDERS;
  });

  // Filters state
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Check if current URL indicates admin page (/admin, /admin/, #admin, ?admin)
  const checkIsAdminRoute = (): boolean => {
    if (typeof window === 'undefined') return false;
    const pathname = (window.location.pathname || '').toLowerCase();
    const hash = (window.location.hash || '').toLowerCase();
    const search = (window.location.search || '').toLowerCase();
    
    // Strip trailing slashes, e.g. '/admin/' -> '/admin'
    const cleanPath = pathname.replace(/\/+$/, '');

    return (
      cleanPath === '/admin' ||
      cleanPath.endsWith('/admin') ||
      cleanPath.includes('/admin') ||
      pathname.startsWith('/admin') ||
      hash === '#admin' ||
      hash === '#/admin' ||
      hash.includes('admin') ||
      search.includes('admin')
    );
  };

  // Admin state - check both localStorage & sessionStorage
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    try {
      return (
        localStorage.getItem(ADMIN_AUTH_KEY) === 'true' ||
        sessionStorage.getItem(ADMIN_AUTH_KEY) === 'true'
      );
    } catch {
      return false;
    }
  });

  const [currentView, setCurrentView] = useState<'store' | 'admin'>(() => {
    return checkIsAdminRoute() ? 'admin' : 'store';
  });

  // Listen for navigation changes (popstate, hashchange, and URL changes)
  useEffect(() => {
    const handleUrlChange = () => {
      if (checkIsAdminRoute()) {
        setCurrentView('admin');
      } else {
        setCurrentView('store');
      }
    };

    // Initial check on mount
    handleUrlChange();

    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);

    // Watch for URL changes (e.g. manual history manipulation or in-page navigation)
    const interval = setInterval(() => {
      const isAdmin = checkIsAdminRoute();
      setCurrentView((prev) => {
        if (isAdmin && prev !== 'admin') return 'admin';
        if (!isAdmin && prev === 'admin' && (window.location.pathname === '/' || window.location.pathname === '')) {
          return 'store';
        }
        return prev;
      });
    }, 400);

    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
      clearInterval(interval);
    };
  }, []);

  // Save products when changed
  useEffect(() => {
    localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
  }, [products]);

  // Save cart when changed
  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  }, [cart]);

  // Save orders when changed
  useEffect(() => {
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
  }, [orders]);

  // Save custom categories when changed
  useEffect(() => {
    localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(customCategories));
  }, [customCategories]);

  // Dynamic list of categories from initial list + custom categories + products
  const categories = React.useMemo(() => {
    const set = new Set<string>(INITIAL_CATEGORIES);
    customCategories.forEach((c) => {
      if (c && c.trim()) set.add(c.trim());
    });
    products.forEach((p) => {
      if (p.category && p.category.trim()) set.add(p.category.trim());
    });
    return Array.from(set);
  }, [products, customCategories]);

  // Category management & direct selection
  const addCategory = (categoryName: string): boolean => {
    const trimmed = categoryName.trim();
    if (!trimmed) return false;
    if (!categories.includes(trimmed)) {
      setCustomCategories((prev) => [...prev, trimmed]);
    }
    return true;
  };

  const deleteCategory = (categoryName: string) => {
    setCustomCategories((prev) => prev.filter((c) => c !== categoryName));
    setFilters((prev) => ({
      ...prev,
      selectedCategories: prev.selectedCategories.filter((c) => c !== categoryName),
    }));
  };

  const selectCategoryOnly = (categoryName: string) => {
    if (!categoryName || categoryName === 'All' || categoryName === 'All Dresses') {
      setFilters((prev) => ({ ...prev, selectedCategories: [] }));
    } else {
      setFilters((prev) => ({ ...prev, selectedCategories: [categoryName] }));
    }
    handleSetCurrentView('store');
  };

  // Dynamic list of tags from products
  const allTags = React.useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      p.tags?.forEach((t) => set.add(t));
    });
    return Array.from(set);
  }, [products]);

  // Cart operations
  const addToCart = (product: Product, size: DressSize, quantity: number = 1) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.product.id === product.id && item.selectedSize === size
      );
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      }
      return [...prev, { product, selectedSize: size, quantity }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: string, size: DressSize) => {
    setCart((prev) => prev.filter((item) => !(item.product.id === productId && item.selectedSize === size)));
  };

  const updateCartQuantity = (productId: string, size: DressSize, delta: number) => {
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.product.id === productId && item.selectedSize === size) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const clearCart = () => {
    setCart([]);
  };

  // Free shipping in Bangladesh if order >= ৳5000, else ৳80 inside Dhaka / ৳130 outside Dhaka
  const placeOrder = (customerData: {
    customerName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    paymentMethod: 'Cash on Delivery (COD)' | 'bKash / Nagad' | 'Debit/Credit Card';
  }): CustomerOrder => {
    const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const isFreeShipping = subtotal >= 5000;
    const isInsideDhaka = customerData.city.toLowerCase().includes('dhaka');
    const shipping = isFreeShipping ? 0 : (isInsideDhaka ? 80 : 130);
    const total = subtotal + shipping;

    const newOrder: CustomerOrder = {
      id: 'DH-BD-' + Math.floor(100000 + Math.random() * 900000),
      createdAt: new Date().toISOString(),
      customerName: customerData.customerName,
      email: customerData.email,
      phone: customerData.phone,
      address: customerData.address,
      city: customerData.city,
      items: cart.map((item) => ({
        productId: item.product.id,
        name: item.product.name,
        price: item.product.price,
        size: item.selectedSize,
        quantity: item.quantity,
        imageUrl: item.product.imageUrl,
      })),
      subtotal,
      shipping,
      total,
      status: 'Pending',
      paymentMethod: customerData.paymentMethod,
    };

    setOrders((prev) => [newOrder, ...prev]);
    clearCart();
    return newOrder;
  };

  // Tick Mark Filter Actions
  const toggleCategoryFilter = (category: string) => {
    setFilters((prev) => {
      const exists = prev.selectedCategories.includes(category);
      return {
        ...prev,
        selectedCategories: exists
          ? prev.selectedCategories.filter((c) => c !== category)
          : [...prev.selectedCategories, category],
      };
    });
  };

  const clearCategoriesFilter = () => {
    setFilters((prev) => ({ ...prev, selectedCategories: [] }));
  };

  const toggleSizeFilter = (size: DressSize) => {
    setFilters((prev) => {
      const exists = prev.selectedSizes.includes(size);
      return {
        ...prev,
        selectedSizes: exists
          ? prev.selectedSizes.filter((s) => s !== size)
          : [...prev.selectedSizes, size],
      };
    });
  };

  const togglePriceRangeFilter = (rangeKey: string) => {
    setFilters((prev) => {
      const exists = prev.selectedPriceRanges.includes(rangeKey);
      return {
        ...prev,
        selectedPriceRanges: exists
          ? prev.selectedPriceRanges.filter((r) => r !== rangeKey)
          : [...prev.selectedPriceRanges, rangeKey],
      };
    });
  };

  const toggleTagFilter = (tag: string) => {
    setFilters((prev) => {
      const exists = prev.selectedTags.includes(tag);
      return {
        ...prev,
        selectedTags: exists
          ? prev.selectedTags.filter((t) => t !== tag)
          : [...prev.selectedTags, tag],
      };
    });
  };

  const setSortBy = (sortBy: SortOption) => {
    setFilters((prev) => ({ ...prev, sortBy }));
  };

  const setSearchQuery = (query: string) => {
    const trimmed = query.trim().toLowerCase();
    if (trimmed === '/admin' || trimmed === 'admin') {
      setCurrentView('admin');
      window.history.pushState(null, '', '/admin');
      return;
    }
    setFilters((prev) => ({ ...prev, searchQuery: query }));
  };

  const setOnlyInStock = (onlyInStock: boolean) => {
    setFilters((prev) => ({ ...prev, onlyInStock }));
  };

  const setOnlyDiscounted = (onlyDiscounted: boolean) => {
    setFilters((prev) => ({ ...prev, onlyDiscounted }));
  };

  const resetFilters = () => {
    setFilters(defaultFilters);
  };

  // Admin authentication and view switching
  const handleSetCurrentView = (view: 'store' | 'admin') => {
    setCurrentView(view);
    if (view === 'admin') {
      window.history.pushState(null, '', '/admin');
    } else {
      window.history.pushState(null, '', '/');
    }
  };

  const loginAdmin = (username: string, pass: string): boolean => {
    if (username.trim() === 'admin' && pass === 'dhongin') {
      setIsAdminLoggedIn(true);
      try {
        localStorage.setItem(ADMIN_AUTH_KEY, 'true');
        sessionStorage.setItem(ADMIN_AUTH_KEY, 'true');
      } catch {
        // ignore
      }
      return true;
    }
    return false;
  };

  const logoutAdmin = () => {
    setIsAdminLoggedIn(false);
    try {
      localStorage.removeItem(ADMIN_AUTH_KEY);
      sessionStorage.removeItem(ADMIN_AUTH_KEY);
    } catch {
      // ignore
    }
    handleSetCurrentView('store');
  };

  // Product management (Upload, Edit, Delete)
  const addProduct = (productData: Omit<Product, 'id' | 'createdAt'>): Product => {
    if (productData.category && !categories.includes(productData.category.trim())) {
      addCategory(productData.category.trim());
    }
    const newProduct: Product = {
      ...productData,
      id: 'dhong-' + Date.now().toString(36),
      createdAt: new Date().toISOString(),
      sku: productData.sku || `DH-${Date.now().toString().slice(-4)}`,
    };
    setProducts((prev) => [newProduct, ...prev]);
    return newProduct;
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    if (updates.category && !categories.includes(updates.category.trim())) {
      addCategory(updates.category.trim());
    }
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const updateOrderStatus = (orderId: string, status: CustomerOrder['status']) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status } : o))
    );
  };

  const deleteOrder = (orderId: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
  };

  const addManualOrder = (orderData: Omit<CustomerOrder, 'id' | 'createdAt'>): CustomerOrder => {
    const newOrder: CustomerOrder = {
      ...orderData,
      id: 'DH-BD-' + Math.floor(100000 + Math.random() * 900000),
      createdAt: new Date().toISOString(),
    };
    setOrders((prev) => [newOrder, ...prev]);
    return newOrder;
  };

  const resetOrdersToSample = () => {
    setOrders(INITIAL_ORDERS);
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(INITIAL_ORDERS));
  };

  const resetToSampleProducts = () => {
    setProducts(INITIAL_PRODUCTS);
    localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(INITIAL_PRODUCTS));
  };

  // Computed filtered & sorted products with tick mark multi-selection
  const filteredProducts = React.useMemo(() => {
    let list = [...products];

    // Category tick marks filter (if any categories checked, match any)
    if (filters.selectedCategories.length > 0) {
      list = list.filter((p) => filters.selectedCategories.includes(p.category));
    }

    // Size tick marks filter (if any sizes checked, dress must have at least one)
    if (filters.selectedSizes.length > 0) {
      list = list.filter((p) =>
        filters.selectedSizes.some((size) => p.sizes.includes(size))
      );
    }

    // Price range brackets tick marks filter
    if (filters.selectedPriceRanges.length > 0) {
      list = list.filter((p) => {
        return filters.selectedPriceRanges.some((rangeKey) => {
          if (rangeKey === 'under-2500') return p.price < 2500;
          if (rangeKey === '2500-4000') return p.price >= 2500 && p.price <= 4000;
          if (rangeKey === '4000-6000') return p.price >= 4000 && p.price <= 6000;
          if (rangeKey === 'above-6000') return p.price > 6000;
          return true;
        });
      });
    }

    // Tag filter
    if (filters.selectedTags.length > 0) {
      list = list.filter((p) =>
        filters.selectedTags.every((tag) => p.tags.includes(tag))
      );
    }

    // Stock availability
    if (filters.onlyInStock) {
      list = list.filter((p) => p.inStock);
    }

    // Discounted only filter
    if (filters.onlyDiscounted) {
      list = list.filter((p) => p.originalPrice && p.originalPrice > p.price);
    }

    // Search query filter (searches across name, description, category, tags, sizes, sku)
    if (filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase().trim();
      list = list.filter((p) => {
        const matchName = p.name.toLowerCase().includes(q);
        const matchDesc = p.description.toLowerCase().includes(q);
        const matchCat = p.category.toLowerCase().includes(q);
        const matchTags = p.tags.some((t) => t.toLowerCase().includes(q));
        const matchSizes = p.sizes.some((s) => s.toLowerCase() === q);
        const matchSku = p.sku.toLowerCase().includes(q);
        return matchName || matchDesc || matchCat || matchTags || matchSizes || matchSku;
      });
    }

    // Sorting: Price Low to High, High to Low, Newest, Featured
    switch (filters.sortBy) {
      case 'price-asc':
        list.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        list.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        list.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
      case 'featured':
      default:
        list.sort((a, b) => {
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
        break;
    }

    return list;
  }, [products, filters]);

  return (
    <StoreContext.Provider
      value={{
        products,
        categories,
        customCategories,
        cart,
        orders,
        filters,
        selectedProduct,
        isCartOpen,
        isAdminLoggedIn,
        currentView,
        filteredProducts,
        allTags,
        setSelectedProduct,
        setIsCartOpen,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        placeOrder,
        addCategory,
        deleteCategory,
        selectCategoryOnly,
        toggleCategoryFilter,
        clearCategoriesFilter,
        toggleSizeFilter,
        togglePriceRangeFilter,
        toggleTagFilter,
        setSortBy,
        setSearchQuery,
        setOnlyInStock,
        setOnlyDiscounted,
        resetFilters,
        setCurrentView: handleSetCurrentView,
        loginAdmin,
        logoutAdmin,
        addProduct,
        updateProduct,
        deleteProduct,
        updateOrderStatus,
        deleteOrder,
        addManualOrder,
        resetOrdersToSample,
        resetToSampleProducts,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = (): StoreContextType => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
