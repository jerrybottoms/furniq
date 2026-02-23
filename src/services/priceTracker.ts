// Price Tracker Service - tracks products for price changes
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FurnitureItem } from '../types';

const TRACKED_PRODUCTS_KEY = '@furniq_tracked_products';
const PRICE_ALERTS_KEY = '@furniq_price_alerts';

export interface PriceAlert {
  id: string;
  productId: string;
  productName: string;
  productImageUrl: string;
  shop: string;
  currentPrice: number;
  targetPrice: number;
  affiliateUrl: string;
  createdAt: number;
  triggered: boolean;
}

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

  // ===== Price Alerts (with target price) =====

  // Add a price alert for a product
  async addAlert(product: FurnitureItem, targetPrice: number): Promise<PriceAlert> {
    try {
      const alerts = await this.getAlerts();
      
      // Check if alert already exists for this product
      const existing = alerts.find(a => a.productId === product.id);
      if (existing) {
        // Update existing alert
        existing.targetPrice = targetPrice;
        existing.currentPrice = product.price;
        existing.triggered = product.price <= targetPrice;
        await AsyncStorage.setItem(PRICE_ALERTS_KEY, JSON.stringify(alerts));
        return existing;
      }
      
      const newAlert: PriceAlert = {
        id: `alert_${Date.now()}_${product.id}`,
        productId: product.id,
        productName: product.name,
        productImageUrl: product.imageUrl,
        shop: product.shop,
        currentPrice: product.price,
        targetPrice: targetPrice,
        affiliateUrl: product.affiliateUrl,
        createdAt: Date.now(),
        triggered: product.price <= targetPrice,
      };
      
      alerts.push(newAlert);
      await AsyncStorage.setItem(PRICE_ALERTS_KEY, JSON.stringify(alerts));
      return newAlert;
    } catch (error) {
      console.error('Error adding price alert:', error);
      throw error;
    }
  },

  // Get all price alerts
  async getAlerts(): Promise<PriceAlert[]> {
    try {
      const data = await AsyncStorage.getItem(PRICE_ALERTS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting price alerts:', error);
      return [];
    }
  },

  // Get a specific alert for a product
  async getAlertForProduct(productId: string): Promise<PriceAlert | null> {
    const alerts = await this.getAlerts();
    return alerts.find(a => a.productId === productId) || null;
  },

  // Delete a price alert
  async deleteAlert(alertId: string): Promise<void> {
    try {
      const alerts = await this.getAlerts();
      const filtered = alerts.filter(a => a.id !== alertId);
      await AsyncStorage.setItem(PRICE_ALERTS_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error deleting price alert:', error);
    }
  },

  // Delete alert for a specific product
  async deleteAlertForProduct(productId: string): Promise<void> {
    try {
      const alerts = await this.getAlerts();
      const filtered = alerts.filter(a => a.productId !== productId);
      await AsyncStorage.setItem(PRICE_ALERTS_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error deleting price alert:', error);
    }
  },

  // Check if product has an alert
  async hasAlert(productId: string): Promise<boolean> {
    const alerts = await this.getAlerts();
    return alerts.some(a => a.productId === productId);
  },

  // Get triggered alerts (price dropped below target)
  async getTriggeredAlerts(): Promise<PriceAlert[]> {
    const alerts = await this.getAlerts();
    return alerts.filter(a => a.triggered);
  },

  // Get count of triggered alerts
  async getTriggeredAlertsCount(): Promise<number> {
    const triggered = await this.getTriggeredAlerts();
    return triggered.length;
  },

  // Clear all price alerts
  async clearAllAlerts(): Promise<void> {
    try {
      await AsyncStorage.removeItem(PRICE_ALERTS_KEY);
    } catch (error) {
      console.error('Error clearing price alerts:', error);
    }
  },
};
