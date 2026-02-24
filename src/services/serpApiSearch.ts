/**
 * SerpAPI Google Shopping Search Service
 * Provides real product search via SerpAPI Google Shopping engine
 * 
 * Endpoint: https://serpapi.com/search.json?engine=google_shopping
 * Localized for Germany (hl=de, gl=de, location=Germany)
 */

import { FurnitureItem, AnalysisResult } from '../types';

// SerpAPI API Key - from environment
const getSerpApiKey = (): string | undefined => {
  return process.env.EXPO_PUBLIC_SERPAPI_KEY;
};

// SerpAPI Response Types
interface SerpApiShoppingResult {
  position: number;
  title: string;
  link: string;
  product_link: string;
  source: string;
  price: string;
  extracted_price: number;
  thumbnail: string;
  rating?: number;
  reviews?: number;
}

interface SerpApiResponse {
  shopping_results?: SerpApiShoppingResult[];
  error?: string;
}

export interface SearchOptions {
  category?: string;
  style?: string;
  material?: string;
  maxResults?: number;
}

/**
 * Search products using SerpAPI Google Shopping
 * @param query - Search query string
 * @param options - Optional parameters (category, style, material)
 * @returns Array of FurnitureItem objects
 */
export async function searchWithSerpApi(
  query: string,
  options?: SearchOptions
): Promise<FurnitureItem[]> {
  const apiKey = getSerpApiKey();
  
  // If no API key, return empty array (will use fallback)
  if (!apiKey) {
    console.log('[SerpAPI] No API key configured');
    return [];
  }

  try {
    // Build the SerpAPI URL with German localization
    const encodedQuery = encodeURIComponent(query);
    const apiUrl = `https://serpapi.com/search.json?engine=google_shopping&q=${encodedQuery}&location=Germany&hl=de&gl=de&api_key=${apiKey}&num=20`;

    console.log('[SerpAPI] Searching for:', query);

    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error(`SerpAPI HTTP error: ${response.status}`);
    }

    const data: SerpApiResponse = await response.json();

    if (data.error) {
      console.error('[SerpAPI] API error:', data.error);
      return [];
    }

    if (!data.shopping_results || data.shopping_results.length === 0) {
      console.log('[SerpAPI] No results found');
      return [];
    }

    // Map SerpAPI results to FurnitureItem format
    const items: FurnitureItem[] = data.shopping_results.map((result) => ({
      id: `serp_${result.position}`,
      name: result.title,
      price: result.extracted_price || 0,
      currency: 'EUR',
      shop: result.source || 'Unknown',
      imageUrl: result.thumbnail || '',
      affiliateUrl: result.link || result.product_link || '',
      rating: result.rating,
      reviews: result.reviews,
      category: options?.category,
      style: options?.style,
      material: options?.material,
    }));

    // Limit results if maxResults specified
    const maxResults = options?.maxResults || 20;
    const limitedItems = items.slice(0, maxResults);

    console.log(`[SerpAPI] Found ${limitedItems.length} products`);
    return limitedItems;

  } catch (error) {
    console.error('[SerpAPI] Search error:', error);
    // Return empty array on error - will use fallback
    return [];
  }
}

/**
 * Check if SerpAPI is configured and available
 */
export function isSerpApiConfigured(): boolean {
  const apiKey = getSerpApiKey();
  return !!apiKey && apiKey.length > 0;
}

/**
 * Build search query from analysis result
 * Uses searchTerms[0] if available, otherwise builds from category/style/material
 */
export function buildSerpApiQuery(analysis: AnalysisResult): string {
  if (analysis.searchTerms && analysis.searchTerms.length > 0) {
    return analysis.searchTerms[0];
  }

  const parts = [
    analysis.category,
    analysis.style,
    analysis.material,
  ].filter(Boolean);

  return parts.join(' ');
}
