export interface SubcategoryItem {
  id: string;
  name: string;
  nameBn?: string;
  tag?: string;
  description?: string;
}

export interface CategoryHierarchyItem {
  name: string;
  nameBn: string;
  description: string;
  subcategories?: SubcategoryItem[];
}

export const CATEGORY_HIERARCHY: Record<string, CategoryHierarchyItem> = {
  'Party Gowns': {
    name: 'Party Gowns',
    nameBn: 'পার্টি গাউন',
    description: 'Glamorous evening gowns & red-carpet gala dresses for weddings & celebrations.',
    subcategories: [
      { id: 'silk-evening', name: 'Silk Evening Gowns', nameBn: 'সিল্ক গাউন', tag: 'Silk', description: 'Mulberry silk with graceful train' },
      { id: 'high-slit', name: 'High-Slit Gala Gowns', nameBn: 'হাই-স্লিট গাউন', tag: 'High Slit', description: 'Contemporary daring cuts & corset drape' },
      { id: 'velvet-gowns', name: 'Velvet Reception Gowns', nameBn: 'ভেলভেট গাউন', tag: 'Velvet', description: 'Lush royal velvet & shoulder structure' },
      { id: 'floor-length', name: 'Floor Length Gowns', nameBn: 'ফ্লোর লেন্থ গাউন', tag: 'Floor Length', description: 'Sweeping ballroom silhouettes' },
      { id: 'corset-gowns', name: 'Corset Bodice Gowns', nameBn: 'কোরসেট গাউন', tag: 'Corset', description: 'Internal posture support & sculpted fit' }
    ]
  },
  'Silk & Georgette': {
    name: 'Silk & Georgette',
    nameBn: 'সিল্ক ও জর্জেট',
    description: 'Pure silks, satin drapes, and flowing georgette ensembles crafted for elegance.',
    subcategories: [
      { id: 'satin-slip', name: 'Satin Slip Dresses', nameBn: 'স্যাটিন স্লিপ ড্রেস', tag: 'Satin', description: 'Fluid bias-cut satin silhouettes' },
      { id: 'shimmer-halter', name: 'Metallic Shimmer Halters', nameBn: 'মেটালিক শিমার', tag: 'Metallic', description: 'High-gloss micro-pleated candlelight glow' },
      { id: 'pure-silk', name: 'Mulberry Silk Ensembles', nameBn: 'মালবেরি সিল্ক', tag: 'Silk', description: 'Premium natural silk drape' },
      { id: 'summer-silk', name: 'Lightweight Summer Silk', nameBn: 'সামার সিল্ক', tag: 'Summer', description: 'Breezy luxury day-to-evening wear' }
    ]
  },
  'Festive Anarkalis': {
    name: 'Festive Anarkalis',
    nameBn: 'উৎসবের আনারকলি',
    description: 'Heritage hand-embroidered zari, kalidar flares, and royal wedding anarkalis.',
    subcategories: [
      { id: 'zari-anarkali', name: 'Hand-Embroidered Zari', nameBn: 'জরির কাজ আনারকলি', tag: 'Zari', description: 'Antique gold needlework yoke & flares' },
      { id: 'eid-special', name: 'Eid & Wedding Specials', nameBn: 'ঈদ স্পেশাল আনারকলি', tag: 'Eid Special', description: 'Festive occasion masterworks' },
      { id: 'handcrafted-anarkali', name: 'Artisan Handcrafted', nameBn: 'হ্যান্ডক্রাফটেড', tag: 'Handcrafted', description: 'Delicate needlework & hand-finished trims' }
    ]
  },
  'Maxi Dresses': {
    name: 'Maxi Dresses',
    nameBn: 'ম্যাক্সি ড্রেস',
    description: 'Effortless flowing floor-length frocks, pleated resort wear, and boho styles.',
    subcategories: [
      { id: 'pleated-maxi', name: 'Accordion Pleated Maxis', nameBn: 'প্লিটেড ম্যাক্সি', tag: 'Pleated', description: 'Airy chiffon with gold-cord waist' },
      { id: 'cutout-maxi', name: 'Geometric Cutout Maxis', nameBn: 'কাট-আউট ম্যাক্সি', tag: 'Cutout', description: 'Modern waistline accents & open back tie' },
      { id: 'resort-maxi', name: 'Resort & Vacation Maxis', nameBn: 'রিসোর্ট ম্যাক্সি', tag: 'Resort', description: 'Breezy destination holiday wear' },
      { id: 'boho-maxi', name: 'Boho Luxury Maxis', nameBn: 'বোহো ম্যাক্সি', tag: 'Boho Luxury', description: 'Tiered skirt movement & effortless charm' }
    ]
  },
  'Cocktail & Western': {
    name: 'Cocktail & Western',
    nameBn: 'ককটেল ও ওয়েস্টার্ন',
    description: 'Midi dresses, fit-and-flare jacquards, sequins, and contemporary Dhaka chic.',
    subcategories: [
      { id: 'velvet-cocktail', name: 'Emerald Velvet Cocktails', nameBn: 'ভেলভেট ককটেল', tag: 'Velvet', description: 'Structured shoulders & side drape' },
      { id: 'sequin-party', name: 'Noir Sequin Sparkle Minis', nameBn: 'সিকুইন মিনি', tag: 'Sequin', description: 'High-shine party glamour & stretch lining' },
      { id: 'jacquard-frocks', name: 'Woven Jacquard Frocks', nameBn: 'জ্যাকুয়ার্ড ফ্রক', tag: 'Jacquard', description: 'Fit-and-flare textured dresses with pockets' },
      { id: 'bodycon-party', name: 'Bodycon Evening Fits', nameBn: 'বডিকন ড্রেস', tag: 'Bodycon', description: 'Sculpting curves with all-night comfort' }
    ]
  },
  'Casual Kurti Frocks': {
    name: 'Casual Kurti Frocks',
    nameBn: 'ক্যাজুয়াল কুর্তি ফ্রক',
    description: 'Pure breathable linen & cotton kurtis tailored for everyday elegance in Bangladesh.',
    subcategories: [
      { id: 'linen-kurti', name: 'Floral Linen Blend Kurtis', nameBn: 'লিনেন কুর্তি ফ্রক', tag: 'Linen', description: 'Breathable botanical prints with sash' },
      { id: 'cotton-daywear', name: 'Cotton Daywear Dresses', nameBn: 'কটন ড্রেস', tag: 'Cotton', description: 'Everyday casual comfort for BD climate' },
      { id: 'casual-frocks', name: 'Casual Tunic Frocks', nameBn: 'ক্যাজুয়াল টিউনিস', tag: 'Casual', description: 'Mother-of-pearl button accents' }
    ]
  }
};
