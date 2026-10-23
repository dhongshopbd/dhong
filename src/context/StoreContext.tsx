import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CartItem, CustomerOrder, FilterState, DressSize, SortOption, Invoice } from '../types';
import { INITIAL_PRODUCTS, INITIAL_CATEGORIES, INITIAL_ORDERS, INITIAL_INVOICES } from '../data/initialProducts';
import {
  loadInitialProducts,
  persistProducts,
  loadInitialCategories,
  persistCategories,
  loadInitialOrders,
  persistOrders,
  loadInitialInvoices,
  persistInvoices,
  resetDatabaseToDefaults,
  idbGet,
  LEGACY_DUMMY_ORDER_IDS,
  LEGACY_DUMMY_INVOICE_IDS,
} from '../utils/db';
import {
  fetchProductsFromFirestore,
  createProductInFirestore,
  updateProductInFirestore,
  deleteProductFromFirestore,
  migrateLocalProductsToFirestore,
  fetchCategoriesFromFirestore,
  saveCategoryToFirestore,
  deleteCategoryFromFirestore,
  saveOrderToFirestore,
  fetchOrdersFromFirestore,
  updateOrderInFirestore,
  deleteOrderFromFirestore,
  saveInvoiceToFirestore,
  fetchInvoicesFromFirestore,
  updateInvoiceInFirestore,
  deleteInvoiceInFirestore,
  auth,
  isUserAdmin,
  signInAdminWithGoogle,
  signOutAdmin,
  isFirebaseConfigured,
  testFirestoreConnection,
  ADMIN_EMAIL,
} from '../utils/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';

interface StoreContextType {
  products: Product[];
  categories: string[];
  customCategories: string[];
  cart: CartItem[];
  orders: CustomerOrder[];
  invoices: Invoice[];
  filters: FilterState;
  selectedProduct: Product | null;
  isCartOpen: boolean;
  isAdminLoggedIn: boolean;
  currentView: 'store' | 'admin';
  filteredProducts: Product[];
  allTags: string[];

  // Firebase Firestore & Auth integration state
  isProductsLoading: boolean;
  firestoreError: string | null;
  isFirebaseActive: boolean;
  firebaseUser: User | null;
  isFirebaseAdmin: boolean;
  adminEmail: string;
  loginAdminWithGoogle: () => Promise<boolean>;
  migrateLocalDataToFirestore: () => Promise<{ migratedCount: number; skippedCount: number; totalInFirestore: number }>;
  refreshProductsFromDb: () => Promise<void>;
  
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
  
  // Invoice & Order Confirmation Management (Only save invoice upon order confirmation!)
  confirmOrderAndCreateInvoice: (orderId: string) => { order: CustomerOrder; invoice: Invoice } | null;
  updateInvoice: (invoiceId: string, updates: Partial<Invoice>) => void;
  deleteInvoice: (invoiceId: string) => void;
  markInvoiceSent: (invoiceId: string, channel: 'whatsapp' | 'email') => void;
  markOrderNumberSent: (orderId: string, channel: 'whatsapp' | 'email') => void;
  getInvoiceByOrderId: (orderId: string) => Invoice | undefined;
  getInvoiceById: (invoiceId: string) => Invoice | undefined;

  // Category management & direct selection
  addCategory: (categoryName: string) => boolean;
  updateCategory: (oldName: string, newName: string) => boolean;
  deleteCategory: (categoryName: string) => void;
  selectCategoryOnly: (categoryName: string) => void;
  selectCategoryWithTag: (categoryName: string, tag?: string) => void;

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
  deleteProduct: (id: string) => Promise<boolean>;
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
  // Products state with dual persistence
  const [products, setProducts] = useState<Product[]>(loadInitialProducts);

  // Categories state with dual persistence
  const [categories, setCategories] = useState<string[]>(loadInitialCategories);
  const [customCategories, setCustomCategories] = useState<string[]>([]);

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

  // Orders state with dual persistence
  const [orders, setOrders] = useState<CustomerOrder[]>(loadInitialOrders);

  // Invoices state with dual persistence (Only generated and saved upon order confirmation)
  const [invoices, setInvoices] = useState<Invoice[]>(loadInitialInvoices);

  // Firebase Firestore & Authentication state
  const [isProductsLoading, setIsProductsLoading] = useState<boolean>(true);
  const [firestoreError, setFirestoreError] = useState<string | null>(null);
  const [isFirebaseActive, setIsFirebaseActive] = useState<boolean>(isFirebaseConfigured);
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [isFirebaseAdmin, setIsFirebaseAdmin] = useState<boolean>(false);

  // Deep hydration from Firestore and IndexedDB on startup
  useEffect(() => {
    let isMounted = true;

    // 1. Test connection to Cloud Firestore
    testFirestoreConnection().then((connected) => {
      if (isMounted) setIsFirebaseActive(connected);
    });

    // 2. Fetch products permanently from Cloud Firestore
    setIsProductsLoading(true);
    fetchProductsFromFirestore()
      .then((firestoreProducts) => {
        if (!isMounted) return;
        if (firestoreProducts && firestoreProducts.length > 0) {
          setProducts(firestoreProducts);
          persistProducts(firestoreProducts);
          setFirestoreError(null);
        } else {
          // Collection is kept empty unless the user adds a dress
          setProducts([]);
          persistProducts([]);
        }
      })
      .catch((err: any) => {
        if (!isMounted) return;
        console.warn('Could not read from Firestore:', err);
        setFirestoreError(err?.message || 'Firestore connection notice');
        setProducts([]);
      })
      .finally(() => {
        if (isMounted) setIsProductsLoading(false);
      });

    // 3. Hydrate Categories from Firestore
    fetchCategoriesFromFirestore()
      .then((dbCats) => {
        if (isMounted && dbCats && dbCats.length > 0) {
          setCategories(dbCats);
          persistCategories(dbCats);
        } else {
          idbGet<string[]>('dhong_categories_v3').then((idbCats) => {
            if (isMounted && Array.isArray(idbCats) && idbCats.length > 0) {
              setCategories(idbCats);
            }
          });
        }
      })
      .catch(() => {});

    // 4. Hydrate local orders and invoices
    idbGet<CustomerOrder[]>('dhong_orders_v3').then((idbOrders) => {
      if (isMounted && Array.isArray(idbOrders)) {
        const realOrders = idbOrders.filter((o) => !LEGACY_DUMMY_ORDER_IDS.has(o.id));
        setOrders(realOrders);
        if (realOrders.length !== idbOrders.length) {
          persistOrders(realOrders);
        }
      }
    });

    idbGet<Invoice[]>('dhong_invoices_v3').then((idbInvoices) => {
      if (isMounted && Array.isArray(idbInvoices)) {
        const realInvoices = idbInvoices.filter((i) => !LEGACY_DUMMY_INVOICE_IDS.has(i.id));
        setInvoices(realInvoices);
        if (realInvoices.length !== idbInvoices.length) {
          persistInvoices(realInvoices);
        }
      }
    });

    // 5. Listen for Firebase Auth state changes
    if (auth) {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (!isMounted) return;
        setFirebaseUser(user);
        if (user) {
          const admin = isUserAdmin(user);
          setIsFirebaseAdmin(admin);
          if (admin) {
            setIsAdminLoggedIn(true);
            try {
              localStorage.setItem(ADMIN_AUTH_KEY, 'true');
            } catch {}
            // Admin can also fetch protected customer orders and invoices
            fetchOrdersFromFirestore().then((dbOrders) => {
              if (isMounted && dbOrders && dbOrders.length > 0) setOrders(dbOrders);
            }).catch(() => {});
            fetchInvoicesFromFirestore().then((dbInvs) => {
              if (isMounted && dbInvs && dbInvs.length > 0) setInvoices(dbInvs);
            }).catch(() => {});
          }
        } else {
          setIsFirebaseAdmin(false);
        }
      });

      return () => {
        isMounted = false;
        unsubscribe();
      };
    }

    return () => {
      isMounted = false;
    };
  }, []);

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

  // Auto-persist changes to both IndexedDB and LocalStorage
  useEffect(() => {
    persistProducts(products);
  }, [products]);

  useEffect(() => {
    persistCategories(categories);
  }, [categories]);

  useEffect(() => {
    persistOrders(orders);
  }, [orders]);

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  }, [cart]);

  // Category management & direct selection (always saved to Firestore)
  const addCategory = (categoryName: string): boolean => {
    const trimmed = categoryName.trim();
    if (!trimmed) return false;
    if (!categories.some((c) => c.toLowerCase() === trimmed.toLowerCase())) {
      const next = [...categories, trimmed];
      setCategories(next);
      persistCategories(next);
      saveCategoryToFirestore(trimmed).catch((err) => {
        console.warn('Failed to save category to Firestore:', err);
      });
      return true;
    }
    return false;
  };

  const updateCategory = (oldName: string, newName: string): boolean => {
    const trimmedNew = newName.trim();
    if (!trimmedNew || oldName === trimmedNew) return false;
    const nextCats = categories.map((c) => (c === oldName ? trimmedNew : c));
    setCategories(nextCats);
    persistCategories(nextCats);

    // Sync Firestore categories
    deleteCategoryFromFirestore(oldName).catch(() => {});
    saveCategoryToFirestore(trimmedNew).catch(() => {});

    const nextProds = products.map((p) => {
      if (p.category === oldName) {
        const updated = { ...p, category: trimmedNew };
        updateProductInFirestore(p.id, { category: trimmedNew }, updated).catch(() => {});
        return updated;
      }
      return p;
    });
    setProducts(nextProds);
    persistProducts(nextProds);

    setFilters((prev) => ({
      ...prev,
      selectedCategories: prev.selectedCategories.map((c) => (c === oldName ? trimmedNew : c)),
    }));
    return true;
  };

  const deleteCategory = (categoryName: string) => {
    const nextCats = categories.filter((c) => c !== categoryName);
    setCategories(nextCats);
    persistCategories(nextCats);
    deleteCategoryFromFirestore(categoryName).catch((err) => {
      console.warn('Failed to delete category from Firestore:', err);
    });

    // Reassign any products in the deleted category to the first remaining category
    const fallbackCategory = nextCats[0] || 'Dhong Haute Couture';
    const nextProds = products.map((p) => {
      if (p.category === categoryName) {
        const updated = { ...p, category: fallbackCategory };
        updateProductInFirestore(p.id, { category: fallbackCategory }, updated).catch(() => {});
        return updated;
      }
      return p;
    });
    setProducts(nextProds);
    persistProducts(nextProds);

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

  const selectCategoryWithTag = (categoryName: string, tag?: string) => {
    if (!categoryName || categoryName === 'All' || categoryName === 'All Dresses') {
      setFilters((prev) => ({
        ...prev,
        selectedCategories: [],
        selectedTags: tag ? [tag] : [],
      }));
    } else {
      setFilters((prev) => ({
        ...prev,
        selectedCategories: [categoryName],
        selectedTags: tag ? [tag] : [],
      }));
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

    const nextOrders = [newOrder, ...orders];
    setOrders(nextOrders);
    persistOrders(nextOrders);
    clearCart();

    // Persist order permanently in Cloud Firestore
    saveOrderToFirestore(newOrder).catch((err) => {
      console.warn('Firestore order save info:', err);
    });

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

  const loginAdminWithGoogle = async (): Promise<boolean> => {
    try {
      const user = await signInAdminWithGoogle();
      const admin = isUserAdmin(user);
      setFirebaseUser(user);
      setIsFirebaseAdmin(admin);
      if (admin) {
        setIsAdminLoggedIn(true);
        try {
          localStorage.setItem(ADMIN_AUTH_KEY, 'true');
          sessionStorage.setItem(ADMIN_AUTH_KEY, 'true');
        } catch {}
        return true;
      } else {
        throw new Error(
          `Signed in as ${user.email}, but this account is not in the authorized administrator list (${ADMIN_EMAIL}).`
        );
      }
    } catch (err: any) {
      console.error('Google admin login error:', err);
      throw err;
    }
  };

  const logoutAdmin = () => {
    setIsAdminLoggedIn(false);
    setIsFirebaseAdmin(false);
    signOutAdmin().catch(() => {});
    try {
      localStorage.removeItem(ADMIN_AUTH_KEY);
      sessionStorage.removeItem(ADMIN_AUTH_KEY);
    } catch {
      // ignore
    }
    handleSetCurrentView('store');
  };

  // Product management (Upload, Edit, Delete) with permanent Firestore synchronization
  const addProduct = (productData: Omit<Product, 'id' | 'createdAt'>): Product => {
    const cat = productData.category.trim();
    if (cat && !categories.some((c) => c.toLowerCase() === cat.toLowerCase())) {
      addCategory(cat);
      saveCategoryToFirestore(cat).catch(() => {});
    }
    const newProduct: Product = {
      ...productData,
      id: 'dhong-' + Date.now().toString(36),
      createdAt: new Date().toISOString(),
      sku: productData.sku || `DH-${Date.now().toString().slice(-4)}`,
    };
    const nextProds = [newProduct, ...products];
    setProducts(nextProds);
    persistProducts(nextProds);

    // Save permanently to Cloud Firestore
    createProductInFirestore(newProduct).catch((err) => {
      console.error('Failed to create product in Firestore:', err);
    });

    return newProduct;
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    if (updates.category) {
      const cat = updates.category.trim();
      if (cat && !categories.some((c) => c.toLowerCase() === cat.toLowerCase())) {
        addCategory(cat);
        saveCategoryToFirestore(cat).catch(() => {});
      }
    }
    const current = products.find((p) => p.id === id);
    const updated: Product = current
      ? { ...current, ...updates }
      : ({
          id,
          name: updates.name || 'Dhong Exclusive Dress',
          price: updates.price || 0,
          category: updates.category || 'Party Gowns',
          ...updates,
        } as Product);

    const nextProds = products.map((p) => (p.id === id ? updated : p));
    setProducts(nextProds);
    persistProducts(nextProds);

    // Save permanently to Cloud Firestore with full upsert payload
    updateProductInFirestore(id, updates, updated).catch((err) => {
      console.error('Failed to update product in Firestore:', err);
    });
  };

  const deleteProduct = async (id: string): Promise<boolean> => {
    try {
      // 1. Delete document from Firestore
      await deleteProductFromFirestore(id);

      // 2. Remove product from UI and local storage ONLY after deletion succeeds
      const nextProds = products.filter((p) => p.id !== id);
      setProducts(nextProds);
      await persistProducts(nextProds);
      setCart((prev) => prev.filter((item) => item.product.id !== id));
      if (selectedProduct?.id === id) {
        setSelectedProduct(null);
      }
      return true;
    } catch (err: any) {
      console.error('Failed to delete product from Firestore:', err);
      // If offline or Firestore not initialized, clean up locally
      if (!isFirebaseConfigured || err?.message?.includes('offline')) {
        const nextProds = products.filter((p) => p.id !== id);
        setProducts(nextProds);
        await persistProducts(nextProds);
        setCart((prev) => prev.filter((item) => item.product.id !== id));
        return true;
      }
      throw err;
    }
  };

  const migrateLocalDataToFirestore = async () => {
    const res = await migrateLocalProductsToFirestore(products);
    const updated = await fetchProductsFromFirestore();
    if (updated && updated.length > 0) {
      setProducts(updated);
      await persistProducts(updated);
    }
    return res;
  };

  const refreshProductsFromDb = async () => {
    setIsProductsLoading(true);
    try {
      const dbProds = await fetchProductsFromFirestore();
      if (dbProds && dbProds.length > 0) {
        setProducts(dbProds);
        await persistProducts(dbProds);
        setFirestoreError(null);
      }
    } catch (err: any) {
      setFirestoreError(err?.message || 'Error loading from Firestore');
    } finally {
      setIsProductsLoading(false);
    }
  };

  // --- INVOICE MANAGEMENT (Only created and saved upon order confirmation!) ---
  const confirmOrderAndCreateInvoice = (orderId: string): { order: CustomerOrder; invoice: Invoice } | null => {
    const targetOrder = orders.find((o) => o.id === orderId);
    if (!targetOrder) return null;

    let invoice = invoices.find((inv) => inv.orderId === orderId);
    const nowIso = new Date().toISOString();

    if (!invoice) {
      // Generate clean unique invoice number, e.g. INV-2026-8942
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const invoiceNum = `INV-${new Date().getFullYear()}-${randomSuffix}`;

      invoice = {
        id: invoiceNum,
        orderId: targetOrder.id,
        createdAt: nowIso,
        orderDate: targetOrder.createdAt,
        customerName: targetOrder.customerName,
        email: targetOrder.email,
        phone: targetOrder.phone,
        address: targetOrder.address,
        city: targetOrder.city,
        items: targetOrder.items,
        subtotal: targetOrder.subtotal,
        shipping: targetOrder.shipping,
        total: targetOrder.total,
        status: 'Confirmed',
        paymentMethod: targetOrder.paymentMethod,
        courier: targetOrder.courier || 'Steadfast Courier',
        trackingCode: targetOrder.trackingCode,
        notes: targetOrder.notes,
      };
    } else {
      invoice = {
        ...invoice,
        status: 'Confirmed',
      };
    }

    const updatedInvoices = [invoice, ...invoices.filter((inv) => inv.id !== invoice!.id && inv.orderId !== orderId)];
    setInvoices(updatedInvoices);
    persistInvoices(updatedInvoices);

    const updatedOrder: CustomerOrder = {
      ...targetOrder,
      status: 'Confirmed',
      invoiceId: invoice.id,
      invoiceSavedAt: nowIso,
    };
    const updatedOrders = orders.map((o) => (o.id === orderId ? updatedOrder : o));
    setOrders(updatedOrders);
    persistOrders(updatedOrders);

    // Save permanently to Firestore
    saveInvoiceToFirestore(invoice).catch((err) => {
      console.warn('Firestore invoice save info:', err);
    });
    updateOrderInFirestore(targetOrder.id, {
      status: 'Confirmed',
      invoiceId: invoice.id,
      invoiceSavedAt: nowIso,
    }).catch(() => {});

    return { order: updatedOrder, invoice };
  };

  const updateInvoice = (invoiceId: string, updates: Partial<Invoice>) => {
    const nextInvs = invoices.map((inv) => (inv.id === invoiceId ? { ...inv, ...updates } : inv));
    setInvoices(nextInvs);
    persistInvoices(nextInvs);
    updateInvoiceInFirestore(invoiceId, updates).catch((err) => {
      console.warn('Failed to update invoice in Firestore:', err);
    });
  };

  const deleteInvoice = (invoiceId: string) => {
    const target = invoices.find((inv) => inv.id === invoiceId);
    const nextInvs = invoices.filter((inv) => inv.id !== invoiceId);
    setInvoices(nextInvs);
    persistInvoices(nextInvs);
    deleteInvoiceInFirestore(invoiceId).catch((err) => {
      console.warn('Failed to delete invoice from Firestore:', err);
    });

    // If order was pointing to this invoice, clear invoiceId
    if (target?.orderId) {
      const nextOrders = orders.map((o) => (o.id === target.orderId ? { ...o, invoiceId: undefined } : o));
      setOrders(nextOrders);
      persistOrders(nextOrders);
      updateOrderInFirestore(target.orderId, { invoiceId: undefined }).catch(() => {});
    }
  };

  const markInvoiceSent = (invoiceId: string, channel: 'whatsapp' | 'email') => {
    const nowIso = new Date().toISOString();
    const nextInvs = invoices.map((inv) => {
      if (inv.id === invoiceId) {
        return {
          ...inv,
          ...(channel === 'whatsapp' ? { whatsappSentAt: nowIso } : { emailSentAt: nowIso }),
        };
      }
      return inv;
    });
    setInvoices(nextInvs);
    persistInvoices(nextInvs);
    updateInvoiceInFirestore(invoiceId, {
      ...(channel === 'whatsapp' ? { whatsappSentAt: nowIso } : { emailSentAt: nowIso }),
    }).catch(() => {});
  };

  const markOrderNumberSent = (orderId: string, channel: 'whatsapp' | 'email') => {
    const nowIso = new Date().toISOString();
    const nextOrders = orders.map((o) => {
      if (o.id === orderId) {
        return {
          ...o,
          ...(channel === 'whatsapp' ? { orderNumberSentAt: nowIso } : { orderNumberSentAt: nowIso }),
        };
      }
      return o;
    });
    setOrders(nextOrders);
    persistOrders(nextOrders);
    updateOrderInFirestore(orderId, {
      ...(channel === 'whatsapp' ? { orderNumberSentAt: nowIso } : { orderNumberSentAt: nowIso }),
    }).catch(() => {});
  };

  const getInvoiceByOrderId = (orderId: string): Invoice | undefined => {
    return invoices.find((inv) => inv.orderId === orderId);
  };

  const getInvoiceById = (invoiceId: string): Invoice | undefined => {
    return invoices.find((inv) => inv.id.toLowerCase() === invoiceId.toLowerCase());
  };

  const updateOrderStatus = (orderId: string, status: CustomerOrder['status']) => {
    if (status === 'Confirmed') {
      confirmOrderAndCreateInvoice(orderId);
      return;
    }

    const next = orders.map((o) => (o.id === orderId ? { ...o, status } : o));
    setOrders(next);
    persistOrders(next);
    updateOrderInFirestore(orderId, { status }).catch((err) => {
      console.warn('Failed to update order status in Firestore:', err);
    });

    // Sync invoice status if one already exists
    const matchingInvoice = invoices.find((inv) => inv.orderId === orderId);
    if (matchingInvoice && status !== 'Pending') {
      const updatedInv: Invoice = { ...matchingInvoice, status };
      const nextInvs = invoices.map((inv) => (inv.orderId === orderId ? updatedInv : inv));
      setInvoices(nextInvs);
      persistInvoices(nextInvs);
      updateInvoiceInFirestore(matchingInvoice.id, { status }).catch(() => {});
    }
  };

  const deleteOrder = (orderId: string) => {
    const next = orders.filter((o) => o.id !== orderId);
    setOrders(next);
    persistOrders(next);
    deleteOrderFromFirestore(orderId).catch((err) => {
      console.warn('Failed to delete order from Firestore:', err);
    });

    // Also remove associated invoice
    const matchingInvoice = invoices.find((inv) => inv.orderId === orderId);
    if (matchingInvoice) {
      deleteInvoiceInFirestore(matchingInvoice.id).catch(() => {});
    }
    const nextInvs = invoices.filter((inv) => inv.orderId !== orderId);
    setInvoices(nextInvs);
    persistInvoices(nextInvs);
  };

  const addManualOrder = (orderData: Omit<CustomerOrder, 'id' | 'createdAt'>): CustomerOrder => {
    const newOrder: CustomerOrder = {
      ...orderData,
      id: 'DH-BD-' + Math.floor(100000 + Math.random() * 900000),
      createdAt: new Date().toISOString(),
    };
    const next = [newOrder, ...orders];
    setOrders(next);
    persistOrders(next);
    saveOrderToFirestore(newOrder).catch((err) => {
      console.warn('Failed to save manual order to Firestore:', err);
    });

    // If manual order is created as Confirmed, generate invoice immediately
    if (newOrder.status === 'Confirmed') {
      setTimeout(() => {
        confirmOrderAndCreateInvoice(newOrder.id);
      }, 0);
    }

    return newOrder;
  };

  const resetOrdersToSample = async () => {
    setOrders([]);
    setInvoices([]);
    await persistOrders([]);
    await persistInvoices([]);
  };

  const resetToSampleProducts = async () => {
    // Preserve whatever products and categories the user has in memory/database
    const res = await resetDatabaseToDefaults(products, categories);
    setProducts(res.products);
    setCategories(res.categories);
    setOrders([]);
    setInvoices([]);
    await persistOrders([]);
    await persistInvoices([]);
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
        invoices,
        filters,
        selectedProduct,
        isCartOpen,
        isAdminLoggedIn,
        currentView,
        filteredProducts,
        allTags,
        isProductsLoading,
        firestoreError,
        isFirebaseActive,
        firebaseUser,
        isFirebaseAdmin,
        adminEmail: ADMIN_EMAIL,
        loginAdminWithGoogle,
        migrateLocalDataToFirestore,
        refreshProductsFromDb,
        setSelectedProduct,
        setIsCartOpen,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        placeOrder,
        confirmOrderAndCreateInvoice,
        updateInvoice,
        deleteInvoice,
        markInvoiceSent,
        markOrderNumberSent,
        getInvoiceByOrderId,
        getInvoiceById,
        addCategory,
        updateCategory,
        deleteCategory,
        selectCategoryOnly,
        selectCategoryWithTag,
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
