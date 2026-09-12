import { Product } from '../types';

export const INITIAL_CATEGORIES = [
  'Party Gowns',
  'Silk & Georgette',
  'Festive Anarkalis',
  'Maxi Dresses',
  'Cocktail & Western',
  'Casual Kurti Frocks'
];

export const ALL_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'] as const;

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'dhong-001',
    name: 'Aurelia Midnight Silk Evening Gown',
    sku: 'DH-EVE-001',
    price: 4850,
    originalPrice: 5800,
    category: 'Party Gowns',
    sizes: ['XS', 'S', 'M', 'L'],
    tags: ['Silk', 'Evening', 'Floor Length', 'Backless'],
    imageUrl: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=800&q=80',
    description: 'Sculpted from midnight-blue mulberry silk, the Aurelia Gown features a daring plunging cowl neckline, cross-back straps, and a sweeping train tailored for weddings and gala celebrations in Bangladesh.',
    inStock: true,
    featured: true,
    createdAt: '2026-02-15T10:00:00Z'
  },
  {
    id: 'dhong-002',
    name: 'Solstice Emerald Velvet Cocktail Dress',
    sku: 'DH-CKT-002',
    price: 3450,
    originalPrice: 4200,
    category: 'Cocktail & Western',
    sizes: ['S', 'M', 'L', 'XL'],
    tags: ['Velvet', 'Cocktail', 'Emerald', 'Bodycon'],
    imageUrl: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=800&q=80',
    description: 'An alluring midi-length dress crafted in lush deep emerald velvet. Features gathered side draping, structured shoulder padding, and an asymmetrical hem for contemporary Dhaka nightouts.',
    inStock: true,
    featured: true,
    createdAt: '2026-02-18T12:30:00Z'
  },
  {
    id: 'dhong-003',
    name: 'Celeste Crimson High-Slit Gala Gown',
    sku: 'DH-EVE-003',
    price: 5900,
    category: 'Party Gowns',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    tags: ['Crimson', 'High Slit', 'Formal', 'Corset'],
    imageUrl: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=800&q=80',
    description: 'Vibrant crimson crepe with an internal corset bodice providing posture and structure. Finished with a daring thigh-high leg slit and handcrafted drapery.',
    inStock: true,
    featured: true,
    createdAt: '2026-02-20T14:15:00Z'
  },
  {
    id: 'dhong-004',
    name: 'Seraphina Champagne Satin Slip Dress',
    sku: 'DH-SLK-004',
    price: 2650,
    originalPrice: 3200,
    category: 'Silk & Georgette',
    sizes: ['XS', 'S', 'M'],
    tags: ['Satin', 'Champagne', 'Minimalist', 'Summer'],
    imageUrl: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80',
    description: 'Fluid bias-cut satin in warm champagne that drapes effortlessly. Adjustable delicate straps and French seams, perfect for summer soirees.',
    inStock: true,
    featured: false,
    createdAt: '2026-02-22T09:00:00Z'
  },
  {
    id: 'dhong-005',
    name: 'Nocturne Noir Sequin Party Mini',
    sku: 'DH-CKT-005',
    price: 3800,
    category: 'Cocktail & Western',
    sizes: ['S', 'M', 'L'],
    tags: ['Sequin', 'Party', 'Mini', 'Sparkle'],
    imageUrl: 'https://images.unsplash.com/photo-1502716119720-b23a93e5fe1b?auto=format&fit=crop&w=800&q=80',
    description: 'Infused with high-shine jet black sequins that catch the spotlight. Fully lined with ultra-soft stretch modal for comfortable all-night celebrations.',
    inStock: true,
    featured: true,
    createdAt: '2026-02-25T16:45:00Z'
  },
  {
    id: 'dhong-006',
    name: 'Riviera Terracotta Pleated Maxi',
    sku: 'DH-MAX-006',
    price: 2950,
    originalPrice: 3500,
    category: 'Maxi Dresses',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    tags: ['Pleated', 'Maxi', 'Resort', 'Boho Luxury'],
    imageUrl: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=800&q=80',
    description: 'Airy accordion-pleated chiffon dress in sun-warmed terracotta. Cinched at the waist with an ornate gold-accent cord, ideal for destination vacation wear.',
    inStock: true,
    featured: false,
    createdAt: '2026-02-28T11:20:00Z'
  },
  {
    id: 'dhong-007',
    name: 'Valeria Hand-Embroidered Zari Festive Anarkali',
    sku: 'DH-FST-007',
    price: 6850,
    originalPrice: 7950,
    category: 'Festive Anarkalis',
    sizes: ['M', 'L', 'XL', 'XXL'],
    tags: ['Embroidered', 'Festive', 'Zari', 'Handcrafted', 'Eid Special'],
    imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
    description: 'Exquisite Bangladeshi Eid and wedding festive dress with intricate antique gold zari needlework across the yoke. Pure royal mulberry georgette.',
    inStock: true,
    featured: true,
    createdAt: '2026-03-01T15:00:00Z'
  },
  {
    id: 'dhong-008',
    name: 'Elysian Floral Linen Kurti Dress',
    sku: 'DH-CSL-008',
    price: 1950,
    originalPrice: 2400,
    category: 'Casual Kurti Frocks',
    sizes: ['XS', 'S', 'M', 'L'],
    tags: ['Linen', 'Floral', 'Casual', 'Daywear', 'Cotton'],
    imageUrl: 'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?auto=format&fit=crop&w=800&q=80',
    description: 'Breathable European linen blend featuring subtle botanical prints. Tailored with mother-of-pearl buttons and matching sash belt for daily comfort in Bangladesh climate.',
    inStock: true,
    featured: false,
    createdAt: '2026-03-03T08:30:00Z'
  },
  {
    id: 'dhong-009',
    name: 'Onyx Draped One-Shoulder Column Dress',
    sku: 'DH-EVE-009',
    price: 4600,
    category: 'Party Gowns',
    sizes: ['S', 'M', 'L'],
    tags: ['One Shoulder', 'Black Dress', 'Column', 'Minimalist'],
    imageUrl: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=800&q=80',
    description: 'Modern sculptural silhouette. The single draped shoulder falls gracefully into a column cut in weighted stretch crepe.',
    inStock: true,
    featured: false,
    createdAt: '2026-03-05T13:40:00Z'
  },
  {
    id: 'dhong-010',
    name: 'Zahra Royal Blue Cutout Maxi',
    sku: 'DH-MAX-010',
    price: 3650,
    originalPrice: 4200,
    category: 'Maxi Dresses',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    tags: ['Cutout', 'Royal Blue', 'Maxi', 'Summer'],
    imageUrl: 'https://images.unsplash.com/photo-1550614000-4895a10e1bfd?auto=format&fit=crop&w=800&q=80',
    description: 'Striking cobalt royal blue with subtle geometric waist cutouts. Breezy tiered skirt movement with an open back tie fastening.',
    inStock: true,
    featured: true,
    createdAt: '2026-03-07T17:10:00Z'
  },
  {
    id: 'dhong-011',
    name: 'Florence Ivory Jacquard Cocktail Frock',
    sku: 'DH-CKT-011',
    price: 3950,
    category: 'Cocktail & Western',
    sizes: ['S', 'M', 'L'],
    tags: ['Jacquard', 'Ivory', 'Fit and Flare', 'Party'],
    imageUrl: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80',
    description: 'Textured floral woven jacquard with a structured fit-and-flare skirt and hidden in-seam pockets. Perfect for bridal events, dawat, or receptions.',
    inStock: true,
    featured: false,
    createdAt: '2026-03-08T10:15:00Z'
  },
  {
    id: 'dhong-012',
    name: 'Mirage Bronze Shimmer Halter Dress',
    sku: 'DH-SLK-012',
    price: 4400,
    originalPrice: 5200,
    category: 'Silk & Georgette',
    sizes: ['XS', 'S', 'M', 'L'],
    tags: ['Metallic', 'Halter', 'Bronze', 'Evening'],
    imageUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80',
    description: 'High-gloss metallic micro-pleated fabric that catches candlelight with liquid bronze shimmer. Features a secure halter collar and dramatic open back.',
    inStock: true,
    featured: true,
    createdAt: '2026-03-09T19:00:00Z'
  }
];

export const INITIAL_ORDERS = [
  {
    id: 'DH-BD-928174',
    createdAt: '2026-03-11T14:22:00Z',
    customerName: 'Tasnim Farzana',
    email: 'tasnim.f@gmail.com',
    phone: '01711-482910',
    address: 'House 42, Road 11, Block D, Banani',
    city: 'Banani, Dhaka',
    items: [
      {
        productId: 'dhong-001',
        name: 'Aurelia Midnight Silk Evening Gown',
        price: 4850,
        size: 'M' as const,
        quantity: 1,
        imageUrl: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=800&q=80'
      }
    ],
    subtotal: 4850,
    shipping: 80,
    total: 4930,
    status: 'Pending' as const,
    paymentMethod: 'Cash on Delivery (COD)' as const,
    notes: 'Please call before delivery. Deliver between 2 PM - 6 PM.'
  },
  {
    id: 'DH-BD-819302',
    createdAt: '2026-03-10T18:45:00Z',
    customerName: 'Nusrat Jahan Chowdhury',
    email: 'nusrat.j@yahoo.com',
    phone: '01819-338291',
    address: 'Apt 5B, Mehedibag Tower, Nasirabad',
    city: 'Nasirabad, Chittagong',
    items: [
      {
        productId: 'dhong-003',
        name: 'Celeste Crimson High-Slit Gala Gown',
        price: 5900,
        size: 'S' as const,
        quantity: 1,
        imageUrl: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=800&q=80'
      },
      {
        productId: 'dhong-002',
        name: 'Solstice Emerald Velvet Cocktail Dress',
        price: 3450,
        size: 'S' as const,
        quantity: 1,
        imageUrl: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=800&q=80'
      }
    ],
    subtotal: 9350,
    shipping: 0, // Free delivery for 5000+
    total: 9350,
    status: 'Confirmed' as const,
    paymentMethod: 'bKash / Nagad' as const,
    courier: 'Steadfast Courier',
    trackingCode: 'STF-CTG-88219'
  },
  {
    id: 'DH-BD-736281',
    createdAt: '2026-03-09T11:15:00Z',
    customerName: 'Sadia Rahman',
    email: 'sadia.rahman@outlook.com',
    phone: '01972-910283',
    address: 'Shahi Eidgah Road, Subidbazar',
    city: 'Sylhet Sadar, Sylhet',
    items: [
      {
        productId: 'dhong-007',
        name: 'Saffron Organza Tiered Gown',
        price: 5600,
        size: 'L' as const,
        quantity: 1,
        imageUrl: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80'
      }
    ],
    subtotal: 5600,
    shipping: 0,
    total: 5600,
    status: 'Shipped' as const,
    paymentMethod: 'Cash on Delivery (COD)' as const,
    courier: 'Pathao Courier',
    trackingCode: 'PTH-SYL-49201'
  },
  {
    id: 'DH-BD-625109',
    createdAt: '2026-03-08T09:30:00Z',
    customerName: 'Samira Akter',
    email: 'samira.dhaka@gmail.com',
    phone: '01683-119284',
    address: 'Flat 4A, Plot 18, Road 3, Dhanmondi',
    city: 'Dhanmondi, Dhaka',
    items: [
      {
        productId: 'dhong-006',
        name: 'Nocturne Noir Satin Slip Dress',
        price: 2950,
        size: 'M' as const,
        quantity: 1,
        imageUrl: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80'
      }
    ],
    subtotal: 2950,
    shipping: 80,
    total: 3030,
    status: 'Delivered' as const,
    paymentMethod: 'Debit/Credit Card' as const,
    courier: 'RedX Express',
    trackingCode: 'RDX-DHK-99120'
  },
  {
    id: 'DH-BD-510928',
    createdAt: '2026-03-07T16:20:00Z',
    customerName: 'Mehnaz Kabir',
    email: 'mehnaz.k@gmail.com',
    phone: '01755-992812',
    address: 'Kandirpar Main Road, Comilla',
    city: 'Comilla Sadar, Comilla',
    items: [
      {
        productId: 'dhong-010',
        name: 'Cobalt Cutout Tiered Maxi Dress',
        price: 3650,
        size: 'XL' as const,
        quantity: 1,
        imageUrl: 'https://images.unsplash.com/photo-1550614000-4895a10e1bfd?auto=format&fit=crop&w=800&q=80'
      }
    ],
    subtotal: 3650,
    shipping: 130,
    total: 3780,
    status: 'Cancelled' as const,
    paymentMethod: 'Cash on Delivery (COD)' as const,
    notes: 'Customer changed event date. Order cancelled upon phone confirmation.'
  }
];


