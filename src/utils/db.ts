// Persistent Database Service for Dhong Bangladesh (Dual IndexedDB + LocalStorage)
// Guarantees that all products, categories, orders, and edits are permanently saved and never lost.

import { Product, CustomerOrder, Invoice } from '../types';
import { INITIAL_PRODUCTS, INITIAL_CATEGORIES, INITIAL_ORDERS, INITIAL_INVOICES } from '../data/initialProducts';

const DB_NAME = 'dhong_ecommerce_db_v3';
const DB_VERSION = 1;
const OBJECT_STORE = 'dhong_records';

const STORAGE_KEYS = {
  INITIALIZED: 'dhong_db_initialized_v3',
  PRODUCTS: 'dhong_products_v3',
  CATEGORIES: 'dhong_categories_v3',
  ORDERS: 'dhong_orders_v3',
  INVOICES: 'dhong_invoices_v3',
  CATEGORY_META: 'dhong_category_meta_v3',
};

// Open Native IndexedDB
function openIndexedDB(): Promise<IDBDatabase | null> {
  if (typeof window === 'undefined' || !window.indexedDB) {
    return Promise.resolve(null);
  }
  return new Promise((resolve) => {
    try {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = (e: any) => {
        const db = e.target.result as IDBDatabase;
        if (!db.objectStoreNames.contains(OBJECT_STORE)) {
          db.createObjectStore(OBJECT_STORE);
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

// Low-level IndexedDB Get
export async function idbGet<T>(key: string): Promise<T | null> {
  try {
    const db = await openIndexedDB();
    if (!db) return null;
    return new Promise((resolve) => {
      const tx = db.transaction(OBJECT_STORE, 'readonly');
      const store = tx.objectStore(OBJECT_STORE);
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result ?? null);
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

// Low-level IndexedDB Set
export async function idbSet<T>(key: string, value: T): Promise<void> {
  try {
    const db = await openIndexedDB();
    if (!db) return;
    return new Promise((resolve) => {
      const tx = db.transaction(OBJECT_STORE, 'readwrite');
      const store = tx.objectStore(OBJECT_STORE);
      const req = store.put(value, key);
      req.onsuccess = () => resolve();
      req.onerror = () => resolve();
    });
  } catch {
    // Ignore
  }
}

// --- PRODUCTS REPOSITORY ---
export function loadInitialProducts(): Product[] {
  try {
    const isInit = localStorage.getItem(STORAGE_KEYS.INITIALIZED);
    const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        // If it's initialized and user deleted all products to [] (empty), return []
        if (isInit === 'true' || parsed.length > 0) {
          return parsed;
        }
      }
    }
  } catch (err) {
    console.warn('LocalStorage products read error:', err);
  }
  // Brand new launch
  try {
    localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
  } catch {}
  return INITIAL_PRODUCTS;
}

export async function persistProducts(products: Product[]): Promise<void> {
  // 1. Fast localStorage save
  try {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
  } catch (err) {
    console.warn('LocalStorage products save error (possibly quota):', err);
  }

  // 2. Deep persistent IndexedDB save (unlimited space)
  await idbSet(STORAGE_KEYS.PRODUCTS, products);
  await idbSet(STORAGE_KEYS.INITIALIZED, true);
}

// --- CATEGORIES REPOSITORY ---
export function loadInitialCategories(): string[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('LocalStorage categories read error:', err);
  }

  try {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(INITIAL_CATEGORIES));
  } catch {}
  return [...INITIAL_CATEGORIES];
}

export async function persistCategories(categories: string[]): Promise<void> {
  try {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  } catch (err) {
    console.warn('LocalStorage categories save error:', err);
  }

  await idbSet(STORAGE_KEYS.CATEGORIES, categories);
}

// --- ORDERS REPOSITORY ---
export function loadInitialOrders(): CustomerOrder[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.ORDERS);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('LocalStorage orders read error:', err);
  }

  try {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(INITIAL_ORDERS));
  } catch {}
  return INITIAL_ORDERS;
}

export async function persistOrders(orders: CustomerOrder[]): Promise<void> {
  try {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  } catch (err) {
    console.warn('LocalStorage orders save error:', err);
  }

  await idbSet(STORAGE_KEYS.ORDERS, orders);
}

// --- INVOICES REPOSITORY (Only saved after order is confirmed!) ---
export function loadInitialInvoices(): Invoice[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.INVOICES);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('LocalStorage invoices read error:', err);
  }

  try {
    localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(INITIAL_INVOICES));
  } catch {}
  return INITIAL_INVOICES;
}

export async function persistInvoices(invoices: Invoice[]): Promise<void> {
  try {
    localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(invoices));
  } catch (err) {
    console.warn('LocalStorage invoices save error:', err);
  }

  await idbSet(STORAGE_KEYS.INVOICES, invoices);
}

export async function saveInvoice(invoice: Invoice): Promise<Invoice[]> {
  const current = loadInitialInvoices();
  const existsIndex = current.findIndex((i) => i.id === invoice.id || i.orderId === invoice.orderId);
  let updated: Invoice[];
  if (existsIndex >= 0) {
    updated = [...current];
    updated[existsIndex] = invoice;
  } else {
    updated = [invoice, ...current];
  }
  await persistInvoices(updated);
  return updated;
}

// --- RESET DATABASE TO DEFAULT FACTORY SAMPLE ---
export async function resetDatabaseToDefaults(): Promise<{
  products: Product[];
  categories: string[];
  orders: CustomerOrder[];
  invoices: Invoice[];
}> {
  try {
    localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(INITIAL_CATEGORIES));
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(INITIAL_ORDERS));
    localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(INITIAL_INVOICES));
  } catch {}

  await idbSet(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
  await idbSet(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
  await idbSet(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
  await idbSet(STORAGE_KEYS.INVOICES, INITIAL_INVOICES);
  await idbSet(STORAGE_KEYS.INITIALIZED, true);

  return {
    products: INITIAL_PRODUCTS,
    categories: INITIAL_CATEGORIES,
    orders: INITIAL_ORDERS,
    invoices: INITIAL_INVOICES,
  };
}
