import { Product, CustomerOrder, Invoice } from '../types';

export const INITIAL_CATEGORIES = [
  'Party Gowns',
  'Silk & Georgette',
  'Festive Anarkalis',
  'Maxi Dresses',
  'Cocktail & Western',
  'Casual Kurti Frocks'
];

export const ALL_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'] as const;

// The dress collection is kept completely empty unless the admin adds dresses
export const INITIAL_PRODUCTS: Product[] = [];

export const INITIAL_ORDERS: CustomerOrder[] = [];

export const INITIAL_INVOICES: Invoice[] = [];
