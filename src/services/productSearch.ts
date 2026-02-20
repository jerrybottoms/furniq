// Product Search Service - Phase 5c
// Country-aware search with German shops + AWIN
import { FurnitureItem, SearchResult, AnalysisResult } from '../types';
import { getCountryConfig, Country } from './supabase';

const AMAZON_TAG = process.env.EXPO_PUBLIC_AMAZON_ASSOCIATE_TAG || 'furniturefinder';
const AWIN_ID = process.env.EXPO_PUBLIC_AWIN_ID || 'furniturefinder';

// AWIN Shop Konfiguration (Deutschland)
// AWIN Merchant IDs - später mit echten IDs ersetzen
const AWIN_SHOPS = [
  { id: 'otto', name: 'Otto', color: 'e30613', basePrice: 299 },
  { id: 'home24', name: 'home24', color: '00a651', basePrice: 279 },
  { id: 'westwing', name: 'Westwing', color: 'b8126e', basePrice: 349 },
  { id: 'momax', name: 'Mömax', color: 'ed1c24', basePrice: 259 },
  { id: 'xxxlutz', name: 'XXXLutz', color: 'e30613', basePrice: 199 },
  { id: 'etsy', name: 'Etsy', color: 'f56400', basePrice: 89 },
];

export class ProductSearchService {
  /**
   * Search for similar furniture based on analysis result
   * Country-aware: shows relevant shops per country
   */
  static async searchSimilarProducts(
    analysis: AnalysisResult,
    country?: Country
  ): Promise<SearchResult> {
    const query = this.buildSearchQuery(analysis);
    const countryConfig = country ? { code: country } : await getCountryConfig();

    // Determine which shops to search based on country
    const shops = this.getShopsForCountry(countryConfig.code);

    // Build search promises
    const searchPromises: Promise<FurnitureItem[]>[] = [];

    if (shops.includes('amazon')) {
      searchPromises.push(this.searchAmazon(query, analysis));
    }
    if (shops.includes('ikea')) {
      searchPromises.push(this.searchIKEA(query, analysis));
    }
    if (shops.includes('wayfair')) {
      searchPromises.push(this.searchWayfair(query, analysis));
    }
    if (shops.includes('awin')) {
      searchPromises.push(this.searchAWIN(query, analysis));
    }
    if (shops.includes('google')) {
      searchPromises.push(this.searchGoogleShopping(query, analysis));
    }

    // Execute all searches in parallel
    const results = await Promise.all(searchPromises);

    // Merge and deduplicate
    const allItems = results.flat();
    const uniqueItems = this.deduplicateItems(allItems);

    return {
      items: uniqueItems.slice(0, 20),
      totalCount: uniqueItems.length,
      query,
      country: countryConfig.code,
    };
  }

  /**
   * Get available shops for a country
   */
  private static getShopsForCountry(country: Country): string[] {
    switch (country) {
      case 'DE':
        return ['amazon', 'ikea', 'awin', 'google'];
      case 'AT':
        return ['amazon', 'ikea', 'awin', 'google'];
      case 'CH':
        return ['amazon', 'ikea', 'awin', 'google'];
      case 'US':
      case 'UK':
      default:
        return ['amazon', 'ikea', 'wayfair', 'google'];
    }
  }

  /**
   * Build search query from analysis result
   */
  private static buildSearchQuery(analysis: AnalysisResult): string {
    if (analysis.searchTerms && analysis.searchTerms.length > 0) {
      return analysis.searchTerms[0];
    }

    const parts = [
      analysis.category,
      analysis.style,
      analysis.colors[0],
      analysis.material,
    ].filter(Boolean);

    return parts.join(' ');
  }

  // ========== AMAZON ==========
  private static async searchAmazon(
    query: string,
    analysis: AnalysisResult
  ): Promise<FurnitureItem[]> {
    const searchUrl = this.generateAmazonSearchUrl(query);
    return this.getMockAmazonResults(query, searchUrl, analysis);
  }

  private static generateAmazonSearchUrl(query: string): string {
    const encodedQuery = encodeURIComponent(query);
    return `https://www.amazon.de/s?k=${encodedQuery}&tag=${AMAZON_TAG}`;
  }

  // ========== IKEA ==========
  private static async searchIKEA(
    query: string,
    analysis: AnalysisResult
  ): Promise<FurnitureItem[]> {
    const searchUrl = this.generateIKEASearchUrl(query);
    return this.getMockIKEAResults(query, searchUrl, analysis);
  }

  private static generateIKEASearchUrl(query: string): string {
    const encodedQuery = encodeURIComponent(query);
    return `https://www.ikea.com/de/de/search/?q=${encodedQuery}`;
  }

  // ========== WAYFAIR (nur für US/UK) ==========
  private static async searchWayfair(
    query: string,
    analysis: AnalysisResult
  ): Promise<FurnitureItem[]> {
    const searchUrl = this.generateWayfairSearchUrl(query);
    return this.getMockWayfairResults(query, searchUrl, analysis);
  }

  private static generateWayfairSearchUrl(query: string): string {
    const encodedQuery = encodeURIComponent(query);
    return `https://www.wayfair.com/keyword.php?keyword=${encodedQuery}`;
  }

  // ========== AWIN (German Furniture Shops) ==========
  private static async searchAWIN(
    query: string,
    analysis: AnalysisResult
  ): Promise<FurnitureItem[]> {
    const searchUrl = this.generateAWINSearchUrl(query);
    return this.getMockAWINResults(query, searchUrl, analysis);
  }

  private static generateAWINSearchUrl(query: string): string {
    const encodedQuery = encodeURIComponent(query);
    // AWIN deep link - opens in affiliate network
    return `https://www.awin1.com/awclick.php?mid=12345&id=${encodeURIComponent(AWIN_ID)}&url=https://www.otto.de/suche/?q=${encodedQuery}`;
  }

  // ========== GOOGLE SHOPPING ==========
  private static async searchGoogleShopping(
    query: string,
    analysis: AnalysisResult
  ): Promise<FurnitureItem[]> {
    return this.getMockGoogleShoppingResults(query, analysis);
  }

  // ========== MOCK DATA ==========

  private static deduplicateItems(items: FurnitureItem[]): FurnitureItem[] {
    const seen = new Set<string>();
    const unique: FurnitureItem[] = [];

    for (const item of items) {
      const key = item.name.toLowerCase().substring(0, 30);
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(item);
      }
    }

    return unique;
  }

  private static getMockAmazonResults(
    query: string,
    searchUrl: string,
    analysis: AnalysisResult
  ): FurnitureItem[] {
    const style = analysis.style || 'modern';
    const category = analysis.category || 'Möbel';

    const products = [
      { name: `${style.charAt(0).toUpperCase() + style.slice(1)} ${category} - Premium Qualität`, price: 299 },
      { name: `Skandinavischer ${category} - Eiche Natur`, price: 449 },
      { name: `${style.charAt(0).toUpperCase() + style.slice(1)} Design ${category}`, price: 599 },
      { name: `Minimalistischer ${category} - Weiß/Grau`, price: 249 },
      { name: `Mid-Century Modern ${category}`, price: 399 },
      { name: `Industrial Style ${category} - Metall & Holz`, price: 349 },
    ];

    return products.map((p, i) => ({
      id: `amazon-${i + 1}-${Date.now()}`,
      name: p.name,
      imageUrl: `https://placehold.co/300x300/e0e0e0/666666?text=${encodeURIComponent(category)}`,
      price: p.price,
      currency: 'EUR',
      affiliateUrl: searchUrl,
      shop: 'Amazon',
      style,
      category,
    }));
  }

  private static getMockIKEAResults(
    query: string,
    searchUrl: string,
    analysis: AnalysisResult
  ): FurnitureItem[] {
    const category = analysis.category || 'Möbel';

    const products = [
      { name: 'NORDLI - Badezimmer-Möbel', price: 90 },
      { name: 'MALM - Schlafzimmer', price: 150 },
      { name: 'KALLAX - Regalsystem', price: 65 },
      { name: 'BILLY - Bücherregal', price: 80 },
      { name: 'HEMNES - Wohnzimmer', price: 299 },
      { name: 'LERHAMN - Tisch & Stühle', price: 249 },
    ];

    return products.map((p, i) => ({
      id: `ikea-${i + 1}-${Date.now()}`,
      name: p.name,
      imageUrl: `https://placehold.co/300x300/ffcc00/333333?text=IKEA`,
      price: p.price,
      currency: 'EUR',
      affiliateUrl: searchUrl,
      shop: 'IKEA',
      style: analysis.style || 'scandinavian',
      category,
    }));
  }

  private static getMockWayfairResults(
    query: string,
    searchUrl: string,
    analysis: AnalysisResult
  ): FurnitureItem[] {
    const style = analysis.style || 'modern';
    const category = analysis.category || 'furniture';

    const products = [
      { name: `${style.charAt(0).toUpperCase() + style.slice(1)} ${category} - Allmodern`, price: 399 },
      { name: `Contemporary ${category} - Joss & Main`, price: 279 },
      { name: `Classic ${category} - Birch Lane`, price: 449 },
      { name: `Urban Loft ${category}`, price: 329 },
      { name: `Farmhouse ${category}`, price: 379 },
      { name: `Coastal ${category}`, price: 299 },
    ];

    return products.map((p, i) => ({
      id: `wayfair-${i + 1}-${Date.now()}`,
      name: p.name,
      imageUrl: `https://placehold.co/300x300/0066cc/ffffff?text=Wayfair`,
      price: p.price,
      currency: 'USD',
      affiliateUrl: searchUrl,
      shop: 'Wayfair',
      style,
      category,
    }));
  }

  // AWIN Shops: Otto, home24, Westwing, Mömax, XXXLutz, Etsy
  private static getMockAWINResults(
    query: string,
    searchUrl: string,
    analysis: AnalysisResult
  ): FurnitureItem[] {
    const style = analysis.style || 'modern';
    const category = analysis.category || 'Möbel';

    // Generate products for each AWIN shop
    const allProducts: FurnitureItem[] = [];

    AWIN_SHOPS.forEach((shop, shopIndex) => {
      // 2-3 products per shop
      const productCount = shopIndex < 3 ? 3 : 2; // More products for top shops

      for (let i = 0; i < productCount; i++) {
        const priceVariation = i * 80;
        const name = `${style.charAt(0).toUpperCase() + style.slice(1)} ${category} - ${shop.name}`;

        allProducts.push({
          id: `awin-${shop.id}-${i + 1}-${Date.now()}`,
          name,
          imageUrl: `https://placehold.co/300x300/${shop.color}/ffffff?text=${encodeURIComponent(shop.name)}`,
          price: shop.basePrice + priceVariation,
          currency: 'EUR',
          affiliateUrl: this.generateAWINDeepLink(shop.id, query),
          shop: shop.name,
          style,
          category,
        });
      }
    });

    return allProducts;
  }

  // Generate AWIN deep link for specific shop
  private static generateAWINDeepLink(shopId: string, query: string): string {
    const encodedQuery = encodeURIComponent(query);
    const baseUrl = `https://www.awin1.com/awclick.php?mid=${shopId}&id=${AWIN_ID}&url=`;

    // Shop-specific search URLs
    const shopUrls: Record<string, string> = {
      otto: `https://www.otto.de/suche/?q=${encodedQuery}`,
      home24: `https://www.home24.de/?q=${encodedQuery}`,
      westwing: `https://www.westwing.de/search?query=${encodedQuery}`,
      momax: `https://www.moemax.de/suche?q=${encodedQuery}`,
      xxxlutz: `https://www.xxxlutz.de/suche?q=${encodedQuery}`,
      etsy: `https://www.etsy.com/de/search?q=${encodedQuery}`,
    };

    const shopUrl = shopUrls[shopId] || shopUrls.otto;
    return `${baseUrl}${encodeURIComponent(shopUrl)}`;
  }

  private static getMockGoogleShoppingResults(
    query: string,
    analysis: AnalysisResult
  ): FurnitureItem[] {
    const style = analysis.style || 'modern';
    const category = analysis.category || 'Möbel';

    const products = [
      { name: `${style.charAt(0).toUpperCase() + style.slice(1)} ${category} - Verschiedene Händler`, price: 199 },
      { name: `Premium ${category} - Top Bewertet`, price: 349 },
      { name: `Budget ${category} - Bestes Preis-Leistung`, price: 129 },
      { name: `Designer ${category} - Exklusiv`, price: 549 },
    ];

    return products.map((p, i) => ({
      id: `google-${i + 1}-${Date.now()}`,
      name: p.name,
      imageUrl: `https://placehold.co/300x300/4285f4/ffffff?text=Google`,
      price: p.price,
      currency: 'EUR',
      affiliateUrl: `https://www.google.com/search?q=${encodeURIComponent(query)}&tbm=shop`,
      shop: 'Verschiedene Shops',
      style,
      category,
    }));
  }
}
