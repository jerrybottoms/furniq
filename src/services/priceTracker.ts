// Price Tracker Service - tracks products for price changes
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FurnitureItem } from '../types';

const TRACKED_PRODUCTS_KEY = '@furniq_tracked_products';

export interface TrackedProduct {
  id: string;
  name: string;
  imageUrl: string;
  originalPrice: number;
  currentPrice: number;
  shop: string;
  affiliateUrl: string;
  trackedAt: number;
}

export const PriceTrackerService = {
  // Track a product
  async trackProduct(product: FurnitureItem): Promise<void> {
    try {
      const tracked = await this.getTrackedProducts();
      
      // Check if already tracked
      if (tracked.some(p => p.id === product.id)) {
        return;
      }
      
      const newTracked: TrackedProduct = {
        id: product.id,
        name: product.name,
        imageUrl: product.imageUrl,
        originalPrice: product.price,
        currentPrice: product.price,
        shop: product.shop,
        affiliateUrl: product.affiliateUrl,
        trackedAt: Date.now(),
      };
      
      tracked.push(newTracked);
      await AsyncStorage.setItem(TRACKED_PRODUCTS_KEY, JSON.stringify(tracked));
    } catch (error) {
      console.error('Error tracking product:', error);
    }
  },

  // Untrack a product
  async untrackProduct(productId: string): Promise<void> {
    try {
      const tracked = await this.getTrackedProducts();
      const filtered = tracked.filter(p => p.id !== productId);
      await AsyncStorage.setItem(TRACKED_PRODUCTS_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error untracking product:', error);
    }
  },

  // Get all tracked products
  async getTrackedProducts(): Promise<TrackedProduct[]> {
    try {
      const data = await AsyncStorage.getItem(TRACKED_PRODUCTS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting tracked products:', error);
      return [];
    }
  },

  // Check if a product is being tracked
  async isTracked(productId: string): Promise<boolean> {
    const tracked = await this.getTrackedProducts();
    return tracked.some(p => p.id === productId);
  },

  // Get products with price drops
  async getPriceDrops(): Promise<TrackedProduct[]> {
    const tracked = await this.getTrackedProducts();
    return tracked.filter(p => p.currentPrice < p.originalPrice);
  },

  // Get count of products with price drops (for badge)
  async getPriceDropCount(): Promise<number> {
    const drops = await this.getPriceDrops();
    return drops.length;
  },

  // Update a tracked product's price (simulated - in real app would fetch from API)
  async updatePrice(productId: string, newPrice: number): Promise<void> {
    try {
      const tracked = await this.getTrackedProducts();
      const index = tracked.findIndex(p => p.id === productId);
      
      if (index !== -1) {
        tracked[index].currentPrice = newPrice;
        await AsyncStorage.setItem(TRACKED_PRODUCTS_KEY, JSON.stringify(tracked));
      }
    } catch (error) {
      console.error('Error updating price:', error);
    }
  },

  // Clear all tracked products
  async clearAll(): Promise<void> {
    try {
      await AsyncStorage.removeItem(TRACKED_PRODUCTS_KEY);
    } catch (error) {
      console.error('Error clearing tracked products:', error);
    }
  },
};
