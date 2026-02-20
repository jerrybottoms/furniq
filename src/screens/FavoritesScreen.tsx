// Favorites Screen - Phase 5d
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Alert,
  Share,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { FurnitureItem } from '../types';
import { getFavorites, removeFavorite } from '../services/supabase';

// ========== HELPER ==========
function formatPrice(price: number, currency: string): string {
  const symbol = currency === 'EUR' ? '€' : currency === 'USD' ? '$' : '€';
  if (currency === 'EUR') {
    return `${price.toFixed(2).replace('.', ',')} €`;
  }
  return `${symbol}${price.toFixed(2)}`;
}

// ========== SCREEN ==========
export default function FavoritesScreen({ navigation }: any) {
  const [favorites, setFavorites] = useState<FurnitureItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Load favorites on screen focus
  useFocusEffect(
    useCallback(() => {
      loadFavorites();
    }, [])
  );

  const loadFavorites = async () => {
    setLoading(true);
    try {
      const items = await getFavorites();
      setFavorites(items);
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const openProduct = (item: FurnitureItem) => {
    navigation.navigate('ProductDetail' as any, { productId: item.id });
  };

  const deleteFavorite = async (item: FurnitureItem) => {
    Alert.alert(
      'Entfernen',
      'Aus Favoriten löschen?',
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Löschen',
          style: 'destructive',
          onPress: async () => {
            await removeFavorite(item.id);
            loadFavorites();
          },
        },
      ]
    );
  };

  const shareAllFavorites = async () => {
    if (favorites.length === 0) return;
    
    const listText = favorites
      .map((item, index) => `${index + 1}. ${item.name} - ${formatPrice(item.price, item.currency)} (${item.shop})`)
      .join('\n');
    
    const message = `🛋️ Meine Möbel-Wunschliste\n\n${listText}\n\n➡️ Entdeckt mit Furniq`;
    
    try {
      await Share.share({
        message,
        title: 'Meine Möbel-Wunschliste',
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const renderItem = ({ item }: { item: FurnitureItem }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => openProduct(item)}
      onLongPress={() => deleteFavorite(item)}
    >
      <Image
        source={{ uri: item.imageUrl }}
        style={styles.productImage}
      />
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>
          {item.name}
        </Text>
        <View style={styles.productMeta}>
          <Text style={styles.productPrice}>
            {formatPrice(item.price, item.currency)}
          </Text>
          <View style={styles.shopBadge}>
            <Text style={styles.shopBadgeText}>{item.shop}</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.buyButton}
          onPress={() => openProduct(item)}
        >
          <Text style={styles.buyButtonText}>Zum Shop →</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {favorites.length === 0 && !loading ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>❤️</Text>
          <Text style={styles.emptyTitle}>Keine Favoriten</Text>
          <Text style={styles.emptyText}>
            Speichere Produkte, die du später kaufen möchtest.
          </Text>
          <TouchableOpacity
            style={styles.searchButton}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.searchButtonText}>Jetzt suchen</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {/* Share Button */}
          <TouchableOpacity
            style={styles.shareAllButton}
            onPress={shareAllFavorites}
          >
            <Text style={styles.shareAllButtonText}>📤 Wunschliste teilen</Text>
          </TouchableOpacity>
          
          <FlatList
            data={favorites}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshing={loading}
            onRefresh={loadFavorites}
          />
        </>
      )}
    </View>
  );
}

// ========== STYLES ==========
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  listContent: {
    padding: 12,
    gap: 12,
  },
  productCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    overflow: 'hidden',
    flexDirection: 'row',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  productImage: {
    width: 110,
    height: 130,
    backgroundColor: '#F0F0F0',
  },
  productInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  productMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10B981',
  },
  shopBadge: {
    backgroundColor: '#F0F4FF',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  shopBadgeText: {
    fontSize: 11,
    color: '#4A6FA5',
    fontWeight: '500',
  },
  buyButton: {
    backgroundColor: '#1A5F5A',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  buyButtonText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  searchButton: {
    backgroundColor: '#1A5F5A',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  searchButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  shareAllButton: {
    backgroundColor: '#1A5F5A',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  shareAllButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
