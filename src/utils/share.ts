// Share utilities for Furniq app
import { Share } from 'react-native';
import { FurnitureItem } from '../types';

/**
 * Format price based on currency
 */
function formatPrice(price: number, currency: string): string {
  const symbol = currency === 'EUR' ? '€' : currency === 'USD' ? '$' : '£';
  if (currency === 'EUR') {
    return `${price.toFixed(2).replace('.', ',')} €`;
  }
  return `${symbol}${price.toFixed(2)}`;
}

/**
 * Share all favorites as a formatted list
 */
export async function shareFavorites(favorites: FurnitureItem[]): Promise<void> {
  if (favorites.length === 0) {
    return;
  }

  const listText = favorites
    .map((item, index) => `${index + 1}. ${item.name} - ${formatPrice(item.price, item.currency)} (${item.shop})`)
    .join('\n');

  const message = `🛋️ Meine Möbel-Wunschliste von Furniq

❤️ Favoriten:
${listText}

➡️ Entdeckt mit Furniq – Die Möbel-Such-App`;

  try {
    await Share.share({
      message,
      title: 'Meine Möbel-Wunschliste',
    });
  } catch (error) {
    console.error('Error sharing favorites:', error);
    throw error;
  }
}

/**
 * Share a single product
 */
export async function shareProduct(product: FurnitureItem): Promise<void> {
  const message = `🛋️ ${product.name}

💰 ${formatPrice(product.price, product.currency)} bei ${product.shop}

➡️ Entdeckt mit Furniq – Die Möbel-Such-App`;

  try {
    await Share.share({
      message,
      title: product.name,
    });
  } catch (error) {
    console.error('Error sharing product:', error);
    throw error;
  }
}
