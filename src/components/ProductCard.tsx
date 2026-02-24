// ProductCard - Bild-dominante Card im Pinterest-Stil
import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { FurnitureItem } from '../types';
import { useTheme } from '../context/ThemeContext';
import { borderRadius, spacing, shadows, typography } from '../theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - spacing.md * 3) / 2;

interface ProductCardProps {
  item: FurnitureItem;
  onPress: (item: FurnitureItem) => void;
  onFavoritePress?: (item: FurnitureItem) => void;
  isFavorite?: boolean;
  showShopBadge?: boolean;
}

export default function ProductCard({
  item,
  onPress,
  onFavoritePress,
  isFavorite = false,
  showShopBadge = true,
}: ProductCardProps) {
  const { theme } = useTheme();
  const shopColor = theme.shopColors[item.shop] || '#666';

  const formatPrice = (price: number, currency: string) => {
    if (currency === 'EUR') {
      return `${price.toFixed(2).replace('.', ',')} €`;
    }
    return `${price} ${currency}`;
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { backgroundColor: theme.card },
        shadows.card,
      ]}
      onPress={() => onPress(item)}
      activeOpacity={0.7}
    >
      {/* Image - 70% of card height */}
      <View style={[styles.imageContainer, { backgroundColor: theme.surface }]}>
        <Image
          source={{ uri: item.imageUrl }}
          style={styles.image}
          resizeMode="cover"
        />
        
        {/* Favorite Button */}
        {onFavoritePress && (
          <TouchableOpacity
            style={[styles.favoriteButton, { backgroundColor: theme.background }]}
            onPress={() => onFavoritePress(item)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.favoriteIcon}>
              {isFavorite ? '❤️' : '🤍'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Shop */}
        {showShopBadge && (
          <Text style={[styles.shop, { color: theme.textTertiary }]}>
            {item.shop}
          </Text>
        )}

        {/* Title */}
        <Text
          style={[styles.title, { color: theme.text }]}
          numberOfLines={2}
        >
          {item.name}
        </Text>

        {/* Price */}
        <Text style={[styles.price, { color: theme.primary }]}>
          {formatPrice(item.price, item.currency)}
        </Text>

        {/* Meta (Rating, Category) */}
        <View style={styles.meta}>
          <Text style={[styles.metaText, { color: theme.textTertiary }]}>
            {item.category}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    borderRadius: borderRadius.medium,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  imageContainer: {
    width: '100%',
    height: CARD_WIDTH * 0.7, // 70% for image
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  favoriteButton: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoriteIcon: {
    fontSize: 16,
  },
  content: {
    padding: spacing.sm,
  },
  shop: {
    ...typography.caption2,
    marginBottom: 2,
  },
  title: {
    ...typography.subhead,
    fontWeight: '600',
    marginBottom: spacing.xxs,
  },
  price: {
    ...typography.body,
    fontWeight: '700',
    marginBottom: spacing.xxs,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    ...typography.caption1,
  },
});
