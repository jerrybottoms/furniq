// Furniture types for the app

export type FurnitureStyle = 'Skandinavisch' | 'Modern' | 'Industrial' | 'Vintage' | 'Boho' | 'Minimalistisch';

export interface FurnitureItem {
  id: string;
  name: string;
  imageUrl: string;
  price: number;
  currency: string;
  affiliateUrl: string;
  shop: string;
  style?: string;
  category?: string;
  color?: string;
  material?: string;
  description?: string;
}

export interface AnalysisResult {
  category: string;
  style: string;
  colors: string[];
  material: string;
  description: string;
  confidence: number;
  searchTerms: string[];
}

export interface SearchResult {
  items: FurnitureItem[];
  totalCount: number;
  query: string;
  country?: string;
}

export interface UserPreferences {
  favoriteStyle?: string;
  priceRange?: {
    min: number;
    max: number;
  };
}

export interface Settings {
  country: 'DE' | 'AT' | 'CH' | 'US' | 'UK';
  darkMode: boolean;
  notificationsEnabled: boolean;
}

// ========== Quiz Types ==========

export type QuizOptionKey = 'A' | 'B' | 'C' | 'D';

export interface QuizAnswer {
  questionId: number;
  selectedOption: QuizOptionKey;
}

export interface QuizResult {
  style: FurnitureStyle;
  answers: QuizAnswer[];
  timestamp: number;
}

export interface QuizQuestion {
  id: number;
  question: string;
  subtitle?: string;
  options: {
    key: QuizOptionKey;
    imageUrl: string;
    style: FurnitureStyle;
    label: string;
  }[];
}
