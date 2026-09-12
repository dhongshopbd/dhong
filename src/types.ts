export type DressSize = 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL';

export interface Product {
  id: string;
  name: string;
  price: number; // In BDT (৳)
  originalPrice?: number; // In BDT (৳)
  category: string;
  sizes: DressSize[];
  tags: string[];
  imageUrl: string;
  description: string;
  inStock: boolean;
  featured?: boolean;
  createdAt: string;
  sku: string;
}

export interface CartItem {
  product: Product;
  selectedSize: DressSize;
  quantity: number;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  size: DressSize;
  quantity: number;
  imageUrl: string;
}

export interface CustomerOrder {
  id: string;
  createdAt: string;
  customerName: string;
  email: string;
  phone: string;
  address: string;
  city: string; // e.g. Dhaka, Chittagong, Sylhet, etc.
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  status: 'Pending' | 'Confirmed' | 'Shipped' | 'Delivered';
  paymentMethod: 'Cash on Delivery (COD)' | 'bKash / Nagad' | 'Debit/Credit Card';
}

export type SortOption = 'featured' | 'price-asc' | 'price-desc' | 'newest';

export interface FilterState {
  selectedCategories: string[]; // multi-select with tick marks!
  selectedSizes: DressSize[]; // multi-select with tick marks!
  selectedPriceRanges: string[]; // multi-select price range brackets with tick marks!
  selectedTags: string[];
  minPrice: number;
  maxPrice: number;
  sortBy: SortOption; // low to high, high to low, etc.
  searchQuery: string;
  onlyInStock: boolean;
  onlyDiscounted: boolean;
}

