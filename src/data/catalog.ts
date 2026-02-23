// Mock Catalog Data for Discover Screen
import { FurnitureItem } from '../types';

export { FurnitureItem } from '../types';

export const STYLES = [
  'Skandinavisch',
  'Modern',
  'Industrial',
  'Vintage',
  'Boho',
  'Minimalistisch',
] as const;

export const CATEGORIES = [
  'Sofa',
  'Stuhl',
  'Tisch',
  'Schrank',
  'Regal',
  'Lampe',
  'Bett',
] as const;

export type FurnitureStyle = typeof STYLES[number];
export type FurnitureCategory = typeof CATEGORIES[number];

// Mock catalog with 50+ products
export const MOCK_CATALOG: FurnitureItem[] = [
  // Skandinavisch - Sofa
  { id: 'cat-1', name: 'Norsborg 3-Sitzer Sofa', imageUrl: 'https://placehold.co/300x300/e8e4d9/333333?text=Sofa', price: 599, currency: 'EUR', affiliateUrl: '', shop: 'IKEA', style: 'Skandinavisch', category: 'Sofa' },
  { id: 'cat-2', name: 'Vimle Recamiere', imageUrl: 'https://placehold.co/300x300/e8e4d9/333333?text=Sofa', price: 449, currency: 'EUR', affiliateUrl: '', shop: 'IKEA', style: 'Skandinavisch', category: 'Sofa' },
  { id: 'cat-3', name: 'Landskrona Sofa', imageUrl: 'https://placehold.co/300x300/e8e4d9/333333?text=Sofa', price: 899, currency: 'EUR', affiliateUrl: '', shop: 'IKEA', style: 'Skandinavisch', category: 'Sofa' },
  
  // Modern - Sofa
  { id: 'cat-4', name: 'Milano Ledersofa', imageUrl: 'https://placehold.co/300x300/2d2d2d/ffffff?text=Sofa', price: 1299, currency: 'EUR', affiliateUrl: '', shop: 'home24', style: 'Modern', category: 'Sofa' },
  { id: 'cat-5', name: 'Tokio Webstoff Sofa', imageUrl: 'https://placehold.co/300x300/2d2d2d/ffffff?text=Sofa', price: 749, currency: 'EUR', affiliateUrl: '', shop: 'home24', style: 'Modern', category: 'Sofa' },
  
  // Industrial - Sofa
  { id: 'cat-6', name: 'Brooklyn Sofa 2-Sitzer', imageUrl: 'https://placehold.co/300x300/4a4a4a/ffffff?text=Sofa', price: 549, currency: 'EUR', affiliateUrl: '', shop: 'Westwing', style: 'Industrial', category: 'Sofa' },
  { id: 'cat-7', name: 'Factory Loft Sofa', imageUrl: 'https://placehold.co/300x300/4a4a4a/ffffff?text=Sofa', price: 699, currency: 'EUR', affiliateUrl: '', shop: 'Westwing', style: 'Industrial', category: 'Sofa' },

  // Skandinavisch - Stuhl
  { id: 'cat-8', name: 'POÄNG Sessel', imageUrl: 'https://placehold.co/300x300/e8e4d9/333333?text=Stuhl', price: 149, currency: 'EUR', affiliateUrl: '', shop: 'IKEA', style: 'Skandinavisch', category: 'Stuhl' },
  { id: 'cat-9', name: 'STRANDMON Wingchair', imageUrl: 'https://placehold.co/300x300/e8e4d9/333333?text=Stuhl', price: 199, currency: 'EUR', affiliateUrl: '', shop: 'IKEA', style: 'Skandinavisch', category: 'Stuhl' },
  { id: 'cat-10', name: 'Nordic Essstuhl', imageUrl: 'https://placehold.co/300x300/e8e4d9/333333?text=Stuhl', price: 89, currency: 'EUR', affiliateUrl: '', shop: 'Otto', style: 'Skandinavisch', category: 'Stuhl' },

  // Modern - Stuhl
  { id: 'cat-11', name: 'Designer Lederstuhl', imageUrl: 'https://placehold.co/300x300/2d2d2d/ffffff?text=Stuhl', price: 299, currency: 'EUR', affiliateUrl: '', shop: 'home24', style: 'Modern', category: 'Stuhl' },
  { id: 'cat-12', name: 'Milano Stuhl', imageUrl: 'https://placehold.co/300x300/2d2d2d/ffffff?text=Stuhl', price: 179, currency: 'EUR', affiliateUrl: '', shop: 'XXXLutz', style: 'Modern', category: 'Stuhl' },

  // Vintage - Stuhl
  { id: 'cat-13', name: 'Antik Stil Stuhl', imageUrl: 'https://placehold.co/300x300/8b7355/ffffff?text=Stuhl', price: 149, currency: 'EUR', affiliateUrl: '', shop: 'Etsy', style: 'Vintage', category: 'Stuhl' },
  { id: 'cat-14', name: 'Retro Barhocker', imageUrl: 'https://placehold.co/300x300/8b7355/ffffff?text=Stuhl', price: 89, currency: 'EUR', affiliateUrl: '', shop: 'Westwing', style: 'Vintage', category: 'Stuhl' },

  // Skandinavisch - Tisch
  { id: 'cat-15', name: 'LERHAMN Tisch', imageUrl: 'https://placehold.co/300x300/e8e4d9/333333?text=Tisch', price: 249, currency: 'EUR', affiliateUrl: '', shop: 'IKEA', style: 'Skandinavisch', category: 'Tisch' },
  { id: 'cat-16', name: 'MELLTORP Tisch', imageUrl: 'https://placehold.co/300x300/e8e4d9/333333?text=Tisch', price: 79, currency: 'EUR', affiliateUrl: '', shop: 'IKEA', style: 'Skandinavisch', category: 'Tisch' },
  { id: 'cat-17', name: 'Nordic Couchtisch', imageUrl: 'https://placehold.co/300x300/e8e4d9/333333?text=Tisch', price: 189, currency: 'EUR', affiliateUrl: '', shop: 'Otto', style: 'Skandinavisch', category: 'Tisch' },

  // Modern - Tisch
  { id: 'cat-18', name: 'Design Couchtisch', imageUrl: 'https://placehold.co/300x300/2d2d2d/ffffff?text=Tisch', price: 349, currency: 'EUR', affiliateUrl: '', shop: 'home24', style: 'Modern', category: 'Tisch' },
  { id: 'cat-19', name: 'Glastisch Modern', imageUrl: 'https://placehold.co/300x300/2d2d2d/ffffff?text=Tisch', price: 279, currency: 'EUR', affiliateUrl: '', shop: 'XXXLutz', style: 'Modern', category: 'Tisch' },

  // Industrial - Tisch
  { id: 'cat-20', name: 'Loft Tisch', imageUrl: 'https://placehold.co/300x300/4a4a4a/ffffff?text=Tisch', price: 299, currency: 'EUR', affiliateUrl: '', shop: 'Westwing', style: 'Industrial', category: 'Tisch' },
  { id: 'cat-21', name: 'Metall & Holz Tisch', imageUrl: 'https://placehold.co/300x300/4a4a4a/ffffff?text=Tisch', price: 199, currency: 'EUR', affiliateUrl: '', shop: 'Mömax', style: 'Industrial', category: 'Tisch' },

  // Minimalistisch - Tisch
  { id: 'cat-22', name: 'White Minimal Tisch', imageUrl: 'https://placehold.co/300x300/f5f5f5/333333?text=Tisch', price: 159, currency: 'EUR', affiliateUrl: '', shop: 'Otto', style: 'Minimalistisch', category: 'Tisch' },

  // Boho - Regal
  { id: 'cat-23', name: 'Boho Wandregal', imageUrl: 'https://placehold.co/300x300/d4c4a8/333333?text=Regal', price: 49, currency: 'EUR', affiliateUrl: '', shop: 'Etsy', style: 'Boho', category: 'Regal' },
  { id: 'cat-24', name: 'Rattan Regal', imageUrl: 'https://placehold.co/300x300/d4c4a8/333333?text=Regal', price: 129, currency: 'EUR', affiliateUrl: '', shop: 'Westwing', style: 'Boho', category: 'Regal' },

  // Modern - Regal
  { id: 'cat-25', name: 'KALLAX Regal', imageUrl: 'https://placehold.co/300x300/2d2d2d/ffffff?text=Regal', price: 65, currency: 'EUR', affiliateUrl: '', shop: 'IKEA', style: 'Modern', category: 'Regal' },
  { id: 'cat-26', name: 'BILLY Bücherregal', imageUrl: 'https://placehold.co/300x300/2d2d2d/ffffff?text=Regal', price: 80, currency: 'EUR', affiliateUrl: '', shop: 'IKEA', style: 'Modern', category: 'Regal' },
  { id: 'cat-27', name: 'Design Regal Weiß', imageUrl: 'https://placehold.co/300x300/2d2d2d/ffffff?text=Regal', price: 199, currency: 'EUR', affiliateUrl: '', shop: 'home24', style: 'Modern', category: 'Regal' },

  // Industrial - Schrank
  { id: 'cat-28', name: 'Metallschrank Industrial', imageUrl: 'https://placehold.co/300x300/4a4a4a/ffffff?text=Schrank', price: 349, currency: 'EUR', affiliateUrl: '', shop: 'Westwing', style: 'Industrial', category: 'Schrank' },
  { id: 'cat-29', name: 'Old Factory Schrank', imageUrl: 'https://placehold.co/300x300/4a4a4a/ffffff?text=Schrank', price: 499, currency: 'EUR', affiliateUrl: '', shop: 'Mömax', style: 'Industrial', category: 'Schrank' },

  // Modern - Schrank
  { id: 'cat-30', name: 'HEMNES Kleiderschrank', imageUrl: 'https://placehold.co/300x300/2d2d2d/ffffff?text=Schrank', price: 399, currency: 'EUR', affiliateUrl: '', shop: 'IKEA', style: 'Modern', category: 'Schrank' },
  { id: 'cat-31', name: 'MALM Schrank', imageUrl: 'https://placehold.co/300x300/2d2d2d/ffffff?text=Schrank', price: 150, currency: 'EUR', affiliateUrl: '', shop: 'IKEA', style: 'Modern', category: 'Schrank' },

  // Vintage - Schrank
  { id: 'cat-32', name: 'Antik Kommode', imageUrl: 'https://placehold.co/300x300/8b7355/ffffff?text=Schrank', price: 299, currency: 'EUR', affiliateUrl: '', shop: 'Etsy', style: 'Vintage', category: 'Schrank' },

  // Skandinavisch - Lampe
  { id: 'cat-33', name: 'HEKTAR Stehlampe', imageUrl: 'https://placehold.co/300x300/e8e4d9/333333?text=Lampe', price: 79, currency: 'EUR', affiliateUrl: '', shop: 'IKEA', style: 'Skandinavisch', category: 'Lampe' },
  { id: 'cat-34', name: 'RANARP Arbeitslampe', imageUrl: 'https://placehold.co/300x300/e8e4d9/333333?text=Lampe', price: 35, currency: 'EUR', affiliateUrl: '', shop: 'IKEA', style: 'Skandinavisch', category: 'Lampe' },
  { id: 'cat-35', name: 'Nordic Pendelleuchte', imageUrl: 'https://placehold.co/300x300/e8e4d9/333333?text=Lampe', price: 89, currency: 'EUR', affiliateUrl: '', shop: 'Otto', style: 'Skandinavisch', category: 'Lampe' },

  // Modern - Lampe
  { id: 'cat-36', name: 'Design Pendelleuchte', imageUrl: 'https://placehold.co/300x300/2d2d2d/ffffff?text=Lampe', price: 149, currency: 'EUR', affiliateUrl: '', shop: 'home24', style: 'Modern', category: 'Lampe' },
  { id: 'cat-37', name: 'LED Deckenlampe', imageUrl: 'https://placehold.co/300x300/2d2d2d/ffffff?text=Lampe', price: 99, currency: 'EUR', affiliateUrl: '', shop: 'XXXLutz', style: 'Modern', category: 'Lampe' },

  // Boho - Lampe
  { id: 'cat-38', name: 'Boho Flechtlampe', imageUrl: 'https://placehold.co/300x300/d4c4a8/333333?text=Lampe', price: 59, currency: 'EUR', affiliateUrl: '', shop: 'Westwing', style: 'Boho', category: 'Lampe' },
  { id: 'cat-39', name: 'Rattan Pendellicht', imageUrl: 'https://placehold.co/300x300/d4c4a8/333333?text=Lampe', price: 79, currency: 'EUR', affiliateUrl: '', shop: 'Etsy', style: 'Boho', category: 'Lampe' },

  // Minimalistisch - Lampe
  { id: 'cat-40', name: 'Minimal Deckenlampe', imageUrl: 'https://placehold.co/300x300/f5f5f5/333333?text=Lampe', price: 69, currency: 'EUR', affiliateUrl: '', shop: 'Otto', style: 'Minimalistisch', category: 'Lampe' },

  // Skandinavisch - Bett
  { id: 'cat-41', name: 'MALM Bett', imageUrl: 'https://placehold.co/300x300/e8e4d9/333333?text=Bett', price: 150, currency: 'EUR', affiliateUrl: '', shop: 'IKEA', style: 'Skandinavisch', category: 'Bett' },
  { id: 'cat-42', name: 'HEMNES Bett', imageUrl: 'https://placehold.co/300x300/e8e4d9/333333?text=Bett', price: 299, currency: 'EUR', affiliateUrl: '', shop: 'IKEA', style: 'Skandinavisch', category: 'Bett' },
  { id: 'cat-43', name: 'Nordic Polsterbett', imageUrl: 'https://placehold.co/300x300/e8e4d9/333333?text=Bett', price: 449, currency: 'EUR', affiliateUrl: '', shop: 'Otto', style: 'Skandinavisch', category: 'Bett' },

  // Modern - Bett
  { id: 'cat-44', name: 'Design Polsterbett', imageUrl: 'https://placehold.co/300x300/2d2d2d/ffffff?text=Bett', price: 599, currency: 'EUR', affiliateUrl: '', shop: 'home24', style: 'Modern', category: 'Bett' },
  { id: 'cat-45', name: 'Boxspringbett Comfort', imageUrl: 'https://placehold.co/300x300/2d2d2d/ffffff?text=Bett', price: 899, currency: 'EUR', affiliateUrl: '', shop: 'Mömax', style: 'Modern', category: 'Bett' },

  // Vintage - Bett
  { id: 'cat-46', name: 'Romantisches Bett', imageUrl: 'https://placehold.co/300x300/8b7355/ffffff?text=Bett', price: 399, currency: 'EUR', affiliateUrl: '', shop: 'Etsy', style: 'Vintage', category: 'Bett' },

  // Boho - Diverse
  { id: 'cat-47', name: 'Boho Hängemöbel', imageUrl: 'https://placehold.co/300x300/d4c4a8/333333?text=Deko', price: 199, currency: 'EUR', affiliateUrl: '', shop: 'Westwing', style: 'Boho', category: 'Regal' },
  
  // Industrial - Lampe
  { id: 'cat-48', name: 'Edison Vintage Lampe', imageUrl: 'https://placehold.co/300x300/4a4a4a/ffffff?text=Lampe', price: 89, currency: 'EUR', affiliateUrl: '', shop: 'Westwing', style: 'Industrial', category: 'Lampe' },
  
  // Minimalistisch - Stuhl
  { id: 'cat-49', name: 'Mono Stuhl', imageUrl: 'https://placehold.co/300x300/f5f5f5/333333?text=Stuhl', price: 129, currency: 'EUR', affiliateUrl: '', shop: 'home24', style: 'Minimalistisch', category: 'Stuhl' },
  
  // Vintage - Tisch
  { id: 'cat-50', name: 'Antik Router Tisch', imageUrl: 'https://placehold.co/300x300/8b7355/ffffff?text=Tisch', price: 249, currency: 'EUR', affiliateUrl: '', shop: 'Etsy', style: 'Vintage', category: 'Tisch' },
];

export const getFilteredCatalog = (
  style?: FurnitureStyle,
  category?: FurnitureCategory,
  minPrice?: number,
  maxPrice?: number
): FurnitureItem[] => {
  let filtered = [...MOCK_CATALOG];
  
  if (style) {
    filtered = filtered.filter(item => item.style === style);
  }
  
  if (category) {
    filtered = filtered.filter(item => item.category === category);
  }
  
  if (minPrice !== undefined) {
    filtered = filtered.filter(item => item.price >= minPrice);
  }
  
  if (maxPrice !== undefined) {
    filtered = filtered.filter(item => item.price <= maxPrice);
  }
  
  return filtered;
};

// Get single product by ID
export const getProductById = (id: string): FurnitureItem | undefined => {
  return MOCK_CATALOG.find(item => item.id === id);
};

// Get similar products based on category, style, and price
export const getSimilarProducts = (
  item: FurnitureItem,
  limit: number = 6
): FurnitureItem[] => {
  const allProducts = [...MOCK_CATALOG];
  
  // Score each product based on similarity
  const scored = allProducts
    .filter(p => p.id !== item.id) // Exclude current item
    .map(p => {
      let score = 0;
      
      // Same category: +3 points
      if (p.category === item.category) score += 3;
      
      // Same style: +2 points
      if (p.style === item.style) score += 2;
      
      // Similar price (±30%): +2 points
      if (item.price > 0) {
        const priceDiff = Math.abs(p.price - item.price) / item.price;
        if (priceDiff <= 0.3) score += 2;
      }
      
      // Same shop: +1 point
      if (p.shop === item.shop) score += 1;
      
      return { product: p, score };
    });
  
  // Sort by score and return top results
  scored.sort((a, b) => b.score - a.score);
  
  return scored
    .slice(0, limit)
    .map(s => s.product);
};
