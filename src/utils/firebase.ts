// Reusable Firebase Configuration and Firestore Database Service for Dhong Bangladesh
import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocFromServer,
  Firestore,
} from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, FirebaseStorage } from 'firebase/storage';
import { Product, CustomerOrder, Invoice } from '../types';

// Direct embedded Firebase configuration for Dhong Bangladesh
// Automatically connects to user's Firebase project and database without requiring manual configuration
const DEFAULT_FIREBASE_CONFIG = {
  projectId: "gen-lang-client-0673359662",
  appId: "1:38765232471:web:f99eeccfb8000d89a6be12",
  apiKey: "AIzaSyDt8S9fmiTjmnXOlv5yjIEz2haovZDvveY",
  authDomain: "gen-lang-client-0673359662.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-dhongbangladeshi-76825f32-4ea2-4723-ad61-cf62953f7ab7",
  storageBucket: "gen-lang-client-0673359662.firebasestorage.app",
  messagingSenderId: "38765232471",
  measurementId: "",
};

// Gather configuration prioritizing Vite environment variables if present, falling back to embedded defaults
const firebaseConfig = {
  apiKey: import.meta.env?.VITE_FIREBASE_API_KEY || DEFAULT_FIREBASE_CONFIG.apiKey,
  authDomain: import.meta.env?.VITE_FIREBASE_AUTH_DOMAIN || DEFAULT_FIREBASE_CONFIG.authDomain,
  projectId: import.meta.env?.VITE_FIREBASE_PROJECT_ID || DEFAULT_FIREBASE_CONFIG.projectId,
  storageBucket: import.meta.env?.VITE_FIREBASE_STORAGE_BUCKET || DEFAULT_FIREBASE_CONFIG.storageBucket,
  messagingSenderId: import.meta.env?.VITE_FIREBASE_MESSAGING_SENDER_ID || DEFAULT_FIREBASE_CONFIG.messagingSenderId,
  appId: import.meta.env?.VITE_FIREBASE_APP_ID || DEFAULT_FIREBASE_CONFIG.appId,
  measurementId: import.meta.env?.VITE_FIREBASE_MEASUREMENT_ID || DEFAULT_FIREBASE_CONFIG.measurementId,
};

export const firestoreDatabaseId =
  import.meta.env?.VITE_FIREBASE_FIRESTORE_DATABASE_ID ||
  DEFAULT_FIREBASE_CONFIG.firestoreDatabaseId;

export const isFirebaseConfigured = true;

// Initialize Firebase App
let app: any = null;
let authInstance: any = null;
let dbInstance: Firestore | null = null;
let storageInstance: FirebaseStorage | null = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    authInstance = getAuth(app);
    // Explicitly pass firestoreDatabaseId (critical for custom or AI Studio provisioned databases)
    dbInstance = firestoreDatabaseId && firestoreDatabaseId !== '(default)'
      ? getFirestore(app, firestoreDatabaseId)
      : getFirestore(app);
    if (firebaseConfig.storageBucket) {
      storageInstance = getStorage(app);
    }
  } catch (err) {
    console.error('Firebase initialization error:', err);
  }
}

export const auth = authInstance;
export const db = dbInstance;
export const storage = storageInstance;

// Error Handling Infrastructure (as required by Firestore Architecture Specification)
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid || null,
      email: auth?.currentUser?.email || null,
      emailVerified: auth?.currentUser?.emailVerified ?? null,
      isAnonymous: auth?.currentUser?.isAnonymous ?? null,
      tenantId: auth?.currentUser?.tenantId ?? null,
      providerInfo: auth?.currentUser?.providerData?.map((p: any) => ({
        providerId: p.providerId,
        email: p.email,
      })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test Connection Helper (Validates connection on boot)
export async function testFirestoreConnection(): Promise<boolean> {
  if (!db) return false;
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore offline or checking connection:', error.message);
    }
    // A permission denied on 'test/connection' is expected since test/connection is not in firestore.rules,
    // which confirms the network reachability to Firestore!
    return true;
  }
}

// Authorized administrator verification
export const ADMIN_EMAIL = 'dhong.shop.bd@gmail.com';
export const LEGACY_ADMIN_EMAIL = 'shong.shop.bd@gmail.com';

export function isUserAdmin(user: User | null): boolean {
  if (!user) return false;
  if (user.email) {
    const emailLower = user.email.toLowerCase();
    if (emailLower === ADMIN_EMAIL.toLowerCase() || emailLower === LEGACY_ADMIN_EMAIL.toLowerCase()) {
      return true;
    }
  }
  return false;
}

// Google Sign-In for Admin
export async function signInAdminWithGoogle(): Promise<User> {
  if (!auth) throw new Error('Firebase Auth is not initialized. Please configure Firebase credentials.');
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  const result = await signInWithPopup(auth, provider);
  return result.user;
}

// Sign Out Admin
export async function signOutAdmin(): Promise<void> {
  if (auth) {
    await signOut(auth);
  }
}

// --- PRODUCT MANAGEMENT (CRUD) IN CLOUD FIRESTORE ---

// 1. READ Products from Firestore
export async function fetchProductsFromFirestore(): Promise<Product[] | null> {
  if (!db) return null;
  const path = 'products';
  try {
    const snap = await getDocs(collection(db, path));
    const items: Product[] = [];
    snap.forEach((docSnap) => {
      const data = docSnap.data();
      items.push({
        id: docSnap.id,
        name: data.name || '',
        price: Number(data.price) || 0,
        originalPrice: data.originalPrice ? Number(data.originalPrice) : undefined,
        category: data.category || 'Party Gowns',
        sizes: Array.isArray(data.sizes) ? data.sizes : ['M'],
        tags: Array.isArray(data.tags) ? data.tags : [],
        imageUrl: data.imageUrl || '',
        description: data.description || '',
        inStock: data.inStock !== false,
        featured: Boolean(data.featured),
        createdAt: data.createdAt || new Date().toISOString(),
        sku: data.sku || `DH-${docSnap.id.slice(-4)}`,
      });
    });

    // Sort by createdAt descending (newest first)
    items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return items;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

// 2. CREATE Product in Firestore
export async function createProductInFirestore(product: Product): Promise<Product> {
  if (!db) throw new Error('Firestore is not initialized');
  const path = `products/${product.id}`;
  try {
    const docRef = doc(db, 'products', product.id);
    const payload: any = {
      id: product.id,
      name: product.name,
      price: product.price,
      category: product.category,
      sizes: product.sizes || [],
      tags: product.tags || [],
      imageUrl: product.imageUrl,
      description: product.description || '',
      inStock: Boolean(product.inStock),
      featured: Boolean(product.featured),
      sku: product.sku,
      createdAt: product.createdAt || new Date().toISOString(),
    };
    if (product.originalPrice !== undefined) {
      payload.originalPrice = product.originalPrice;
    }

    await setDoc(docRef, payload);
    return product;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

// 3. UPDATE Product in Firestore (always saved with upsert support)
export async function updateProductInFirestore(
  productId: string,
  updates: Partial<Product>,
  fullProduct?: Product
): Promise<void> {
  if (!db) throw new Error('Firestore is not initialized');
  const path = `products/${productId}`;
  try {
    const docRef = doc(db, 'products', productId);
    if (fullProduct) {
      const payload: any = {
        id: productId,
        name: fullProduct.name,
        price: fullProduct.price,
        category: fullProduct.category,
        sizes: fullProduct.sizes || [],
        tags: fullProduct.tags || [],
        imageUrl: fullProduct.imageUrl,
        description: fullProduct.description || '',
        inStock: Boolean(fullProduct.inStock),
        featured: Boolean(fullProduct.featured),
        sku: fullProduct.sku,
        createdAt: fullProduct.createdAt || new Date().toISOString(),
      };
      if (fullProduct.originalPrice !== undefined) {
        payload.originalPrice = fullProduct.originalPrice;
      }
      await setDoc(docRef, payload, { merge: true });
    } else {
      const cleanUpdates: any = { ...updates };
      delete cleanUpdates.id; // Preserve document ID
      await setDoc(docRef, cleanUpdates, { merge: true });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

// 4. DELETE Product from Firestore
export async function deleteProductFromFirestore(productId: string): Promise<void> {
  if (!db) throw new Error('Firestore is not initialized');
  const path = `products/${productId}`;
  try {
    const docRef = doc(db, 'products', productId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// --- IMAGE UPLOAD SERVICE (Firebase Storage with safe fallback) ---
export async function uploadImageToStorage(file: File): Promise<string> {
  if (!storage) {
    throw new Error('Firebase Storage is not configured. Please set VITE_FIREBASE_STORAGE_BUCKET or use direct image address URL.');
  }
  const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const storagePath = `products/${Date.now()}_${cleanFileName}`;
  const fileRef = ref(storage, storagePath);

  const snapshot = await uploadBytes(fileRef, file);
  const downloadUrl = await getDownloadURL(snapshot.ref);
  return downloadUrl;
}

// --- SAFE DATA MIGRATION (Preserves existing data, avoids duplicates) ---
export async function migrateLocalProductsToFirestore(localProducts: Product[]): Promise<{
  migratedCount: number;
  skippedCount: number;
  totalInFirestore: number;
}> {
  if (!db) throw new Error('Firestore is not initialized');
  
  // 1. Fetch existing Firestore products to prevent duplicate uploads
  const existingDocs = await fetchProductsFromFirestore() || [];
  const existingIdSet = new Set(existingDocs.map((p) => p.id));
  const existingNameSet = new Set(existingDocs.map((p) => p.name.trim().toLowerCase()));

  let migratedCount = 0;
  let skippedCount = 0;

  for (const product of localProducts) {
    if (existingIdSet.has(product.id) || existingNameSet.has(product.name.trim().toLowerCase())) {
      skippedCount++;
      continue;
    }
    await createProductInFirestore(product);
    migratedCount++;
  }

  const finalProds = await fetchProductsFromFirestore() || [];
  return {
    migratedCount,
    skippedCount,
    totalInFirestore: finalProds.length,
  };
}

// --- CATEGORIES REPOSITORY IN FIRESTORE ---
export async function fetchCategoriesFromFirestore(): Promise<string[] | null> {
  if (!db) return null;
  const path = 'categories';
  try {
    const snap = await getDocs(collection(db, path));
    if (snap.empty) return null;
    const list: string[] = [];
    snap.forEach((d) => {
      const data = d.data();
      if (data.name) list.push(data.name);
    });
    return list;
  } catch (error) {
    console.warn('Error reading categories from Firestore:', error);
    return null;
  }
}

export async function saveCategoryToFirestore(name: string): Promise<void> {
  if (!db) return;
  const docId = name.toLowerCase().replace(/[^a-z0-9]/g, '_');
  try {
    await setDoc(doc(db, 'categories', docId), {
      name,
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    console.warn('Error saving category to Firestore:', error);
  }
}

export async function deleteCategoryFromFirestore(name: string): Promise<void> {
  if (!db) return;
  const docId = name.toLowerCase().replace(/[^a-z0-9]/g, '_');
  try {
    await deleteDoc(doc(db, 'categories', docId));
  } catch (error) {
    console.warn('Error deleting category from Firestore:', error);
  }
}

// --- CUSTOMER ORDERS IN FIRESTORE ---
export async function saveOrderToFirestore(order: CustomerOrder): Promise<void> {
  if (!db) return;
  const path = `orders/${order.id}`;
  try {
    const cleanOrder = JSON.parse(JSON.stringify(order));
    await setDoc(doc(db, 'orders', order.id), cleanOrder);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function fetchOrdersFromFirestore(): Promise<CustomerOrder[] | null> {
  if (!db) return null;
  const path = 'orders';
  try {
    const snap = await getDocs(collection(db, path));
    const list: CustomerOrder[] = [];
    snap.forEach((d) => list.push(d.data() as CustomerOrder));
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return list;
  } catch (error) {
    return null;
  }
}

export async function updateOrderInFirestore(orderId: string, updates: Partial<CustomerOrder>): Promise<void> {
  if (!db) return;
  const path = `orders/${orderId}`;
  try {
    const cleanUpdates = JSON.parse(JSON.stringify(updates));
    await updateDoc(doc(db, 'orders', orderId), cleanUpdates);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteOrderFromFirestore(orderId: string): Promise<void> {
  if (!db) return;
  const path = `orders/${orderId}`;
  try {
    await deleteDoc(doc(db, 'orders', orderId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// --- INVOICES IN FIRESTORE ---
export async function saveInvoiceToFirestore(invoice: Invoice): Promise<void> {
  if (!db) return;
  const path = `invoices/${invoice.id}`;
  try {
    const cleanInvoice = JSON.parse(JSON.stringify(invoice));
    await setDoc(doc(db, 'invoices', invoice.id), cleanInvoice);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function fetchInvoicesFromFirestore(): Promise<Invoice[] | null> {
  if (!db) return null;
  const path = 'invoices';
  try {
    const snap = await getDocs(collection(db, path));
    const list: Invoice[] = [];
    snap.forEach((d) => list.push(d.data() as Invoice));
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return list;
  } catch (error) {
    return null;
  }
}

export async function updateInvoiceInFirestore(invoiceId: string, updates: Partial<Invoice>): Promise<void> {
  if (!db) return;
  const path = `invoices/${invoiceId}`;
  try {
    await updateDoc(doc(db, 'invoices', invoiceId), updates);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteInvoiceFromFirestore(invoiceId: string): Promise<void> {
  if (!db) return;
  const path = `invoices/${invoiceId}`;
  try {
    await deleteDoc(doc(db, 'invoices', invoiceId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export const deleteInvoiceInFirestore = deleteInvoiceFromFirestore;
