// Favorites Screen — Grid-Layout, konsistent mit Discover
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { FurnitureItem } from '../types';
import { getFavorites, removeFavorite } from '../services/supabase';
import { useTheme } from '../context/ThemeContext';
import { shareFavorites } from '../utils/share';
import { typography, spacing, borderRadius, shadows } from '../theme';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width - spacing.md * 3) / 2;

function formatPrice(price: number, currency: string): string {
  if (currency === 'EUR') return `${price.toFixed(2).replace('.', ',')} €`;
  const symbol = currency === 'USD' ? '$' : currency === 'GBP' ? '£' : currency;
  return `${symbol}${price.toFixed(2)}`;
}

export default function FavoritesScreen({ navigation }: any) {
  const { theme } = useTheme();
  const [favorites, setFavorites] = useState<FurnitureItem[]>([]);
  const [loading, setLoading] = useState(true);

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
    if (favorites.length === 0) {
      Alert.alert('Keine Favoriten', 'Du hast noch keine Favoriten zum Teilen.', [{ text: 'OK' }]);
      return;
    }
    try {
      await shareFavorites(favorites);
    } catch (error) {
      Alert.alert('Fehler', 'Teilen war nicht möglich.');
    }
  };

  const renderItem = ({ item, index }: { item: FurnitureItem; index: number }) => (
    <TouchableOpacity
      style={[
        styles.productCard,
        { backgroundColor: theme.card },
        shadows.card,
        // Right-side cards get no right margin (grid alignment)
        index % 2 === 0 ? { marginRight: spacing.md } : {},
      ]}
      onPress={() => openProduct(item)}
      onLongPress={() => deleteFavorite(item)}
      activeOpacity={0.75}
    >
      {/* Image area — 70% of card */}
      <View style={[styles.imageWrap, { backgroundColor: theme.surface }]}>
        <Image source={{ uri: item.imageUrl }} style={styles.productImage} resizeMode="cover" />
        {/* Heart overlay */}
        <TouchableOpacity
          style={[styles.heartBtn, { backgroundColor: theme.background }]}
          onPress={() => deleteFavorite(item)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.heartIcon}>❤️</Text>
        </TouchableOpacity>
      </View>

      {/* Text info */}
      <View style={styles.productInfo}>
        <Text style={[styles.shopLabel, { color: theme.textTertiary }]}>{item.shop}</Text>
        <Text style={[styles.productName, { color: theme.text }]} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={[styles.productPrice, { color: theme.primary }]}>
          {formatPrice(item.price, item.currency)}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (favorites.length === 0 && !loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
        <View style={styles.pageHeader}>
          <Text style={[styles.largeTitle, { color: theme.text }]}>Favoriten</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>❤️</Text>
          <Text style={[styles.emptyTitle, { color: theme.text }]}>Keine Favoriten</Text>
          <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
            Speichere Produkte, die du{'\n'}später kaufen möchtest.
          </Text>
          <TouchableOpacity
            style={[styles.searchButton, { backgroundColor: theme.primary }]}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.searchButtonText}>Jetzt suchen</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      {/* Page header */}
      <View style={styles.pageHeader}>
        <View>
          <Text style={[styles.largeTitle, { color: theme.text }]}>Favoriten</Text>
          {favorites.length > 0 && (
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              {favorites.length} gespeicherte Produkte
            </Text>
          )}
        </View>
        {favorites.length > 0 && (
          <TouchableOpacity
            style={[styles.shareBtn, { backgroundColor: theme.primaryLight }]}
            onPress={shareAllFavorites}
          >
            <Text style={[styles.shareBtnText, { color: theme.primary }]}>📤 Teilen</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={favorites}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshing={loading}
        onRefresh={loadFavorites}
        columnWrapperStyle={styles.row}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  pageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  largeTitle: {
    fontSize: 34,
    fontWeight: '700',
    letterSpacing: 0.37,
  },
  subtitle: {
    fontSize: 15,
    marginTop: 2,
  },
  shareBtn: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.medium,
  },
  shareBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },

  // Grid
  listContent: { paddingHorizontal: spacing.md, paddingBottom: spacing.xxl },
  row: { marginBottom: spacing.md },

  productCard: {
    width: COLUMN_WIDTH,
    borderRadius: borderRadius.medium,
    overflow: 'hidden',
  },
  imageWrap: {
    width: '100%',
    height: COLUMN_WIDTH,
    position: 'relative',
  },
  productImage: { width: '100%', height: '100%' },
  heartBtn: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heartIcon: { fontSize: 14 },

  productInfo: { padding: spacing.sm },
  shopLabel: { fontSize: 11, letterSpacing: 0.07, marginBottom: 2 },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 18,
    marginBottom: spacing.xxs,
    minHeight: 36,
  },
  productPrice: { fontSize: 15, fontWeight: '700' },

  // Empty state
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  emptyEmoji: { fontSize: 64, marginBottom: spacing.md },
  emptyTitle: { fontSize: 22, fontWeight: '700', marginBottom: spacing.xs },
  emptyText: { fontSize: 15, textAlign: 'center', lineHeight: 22, marginBottom: spacing.lg },
  searchButton: {
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.medium,
  },
  searchButtonText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
});
