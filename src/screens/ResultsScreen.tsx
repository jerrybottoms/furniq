// Results Screen - Redesigned konsistent mit Discover Grid
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  Share,
  ActivityIndicator,
  useWindowDimensions,
  Alert,
} from 'react-native';
import { FurnitureItem, AnalysisResult } from '../types';
import { addFavorite } from '../services/supabase';
import { PriceTrackerService } from '../services/priceTracker';
import { getBudget, isWithinBudget } from '../services/budget';
import { useTheme } from '../context/ThemeContext';
import { typography, spacing, borderRadius, shadows } from '../theme';

type SortOption = 'relevance' | 'price-low' | 'price-high';

interface ResultsScreenProps {
  route: {
    params: {
      image: string;
      analysis: AnalysisResult;
      products: FurnitureItem[];
      analyzedImages?: number;
    };
  };
  navigation: any;
}

function formatPrice(price: number, currency: string): string {
  const symbol = currency === 'EUR' ? '€' : currency === 'USD' ? '$' : currency === 'GBP' ? '£' : currency;
  if (currency === 'EUR') return `${price.toFixed(2).replace('.', ',')} €`;
  return `${symbol}${price.toFixed(2)}`;
}

function getAvailableShops(products: FurnitureItem[]): string[] {
  const shops = new Set(products.map(p => p.shop));
  return Array.from(shops).sort();
}

export default function ResultsScreen({ route, navigation }: ResultsScreenProps) {
  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  const { image, analysis, products } = route.params;

  const COLUMN_WIDTH = (width - spacing.md * 3) / 2;

  const [sortBy, setSortBy] = useState<SortOption>('relevance');
  const [activeShops, setActiveShops] = useState<Set<string>>(new Set(getAvailableShops(products)));
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [savingId, setSavingId] = useState<string | null>(null);
  const [priceRange, setPriceRange] = useState<{ min: string; max: string }>({ min: '', max: '' });
  const [showPriceFilter, setShowPriceFilter] = useState(false);
  const [trackedIds, setTrackedIds] = useState<Set<string>>(new Set());
  const [budgetMax, setBudgetMax] = useState<number | null>(null);

  useEffect(() => {
    PriceTrackerService.getTrackedProducts().then(tracked => {
      setTrackedIds(new Set(tracked.map(t => t.id)));
    });
    getBudget().then(budget => {
      if (budget.maxBudget !== null && budget.maxBudget > 0) {
        setBudgetMax(budget.maxBudget);
      }
    });
  }, []);

  const priceLimits = useMemo(() => {
    if (products.length === 0) return { min: 0, max: 1000 };
    const prices = products.map(p => p.price);
    return { min: Math.floor(Math.min(...prices)), max: Math.ceil(Math.max(...prices)) };
  }, [products]);

  const availableShops = useMemo(() => getAvailableShops(products), [products]);

  const filteredProducts = useMemo(() => {
    let result = products.filter(p => activeShops.has(p.shop));
    
    if (budgetMax !== null && budgetMax > 0) {
      result = result.filter(p => isWithinBudget(p.price, budgetMax));
    }
    
    const minPrice = priceRange.min ? parseFloat(priceRange.min) : null;
    const maxPrice = priceRange.max ? parseFloat(priceRange.max) : null;
    if (minPrice !== null) result = result.filter(p => p.price >= minPrice);
    if (maxPrice !== null) result = result.filter(p => p.price <= maxPrice);
    switch (sortBy) {
      case 'price-low': return [...result].sort((a, b) => a.price - b.price);
      case 'price-high': return [...result].sort((a, b) => b.price - a.price);
      default: return result;
    }
  }, [products, activeShops, sortBy, priceRange, budgetMax]);

  const toggleShop = useCallback((shop: string) => {
    setActiveShops(prev => {
      const next = new Set(prev);
      if (next.has(shop)) { if (next.size > 1) next.delete(shop); }
      else next.add(shop);
      return next;
    });
  }, []);

  const openProduct = (item: FurnitureItem) => {
    navigation.navigate('ProductDetail' as any, { productId: item.id });
  };

  const shareProduct = async (item: FurnitureItem) => {
    try {
      const message = `🔥 Schau mal dieses Möbelstück: ${item.name} - ${formatPrice(item.price, item.currency)}\n\nVia Furniture Finder App`;
      await Share.share({ message: item.affiliateUrl ? `${message}\n\n${item.affiliateUrl}` : message, title: item.name, url: item.affiliateUrl });
    } catch (error) { console.error('Error sharing:', error); }
  };

  const toggleFavorite = async (item: FurnitureItem) => {
    if (favoriteIds.has(item.id)) {
      setFavoriteIds(prev => { const next = new Set(prev); next.delete(item.id); return next; });
      return;
    }
    setSavingId(item.id);
    const { success, error } = await addFavorite(item);
    setSavingId(null);
    if (success) setFavoriteIds(prev => new Set(prev).add(item.id));
    else Alert.alert('Fehler', error || 'Konnte nicht gespeichert werden.');
  };

  const toggleTrack = async (item: FurnitureItem) => {
    if (trackedIds.has(item.id)) {
      await PriceTrackerService.untrackProduct(item.id);
      setTrackedIds(prev => { const next = new Set(prev); next.delete(item.id); return next; });
    } else {
      await PriceTrackerService.trackProduct(item);
      setTrackedIds(prev => new Set(prev).add(item.id));
    }
  };

  const renderShopFilter = () => (
    <View style={styles.filterRow}>
      {availableShops.map(shop => (
        <TouchableOpacity
          key={shop}
          style={[
            styles.filterChip,
            { 
              backgroundColor: activeShops.has(shop) ? theme.primary : theme.surface,
              borderRadius: borderRadius.full,
              paddingHorizontal: spacing.md,
              paddingVertical: spacing.xs + 2,
            },
          ]}
          onPress={() => toggleShop(shop)}
        >
          <Text style={[
            typography.subhead, 
            { color: activeShops.has(shop) ? '#FFF' : theme.textSecondary }
          ]}>
            {shop}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderSortBar = () => (
    <View style={styles.sortBar}>
      {([
        { key: 'relevance', label: 'Relevanz' },
        { key: 'price-low', label: 'Preis ↑' },
        { key: 'price-high', label: 'Preis ↓' },
      ] as { key: SortOption; label: string }[]).map(option => (
        <TouchableOpacity
          key={option.key}
          style={[
            styles.sortButton,
            {
              backgroundColor: sortBy === option.key ? theme.surface : theme.background,
              borderColor: sortBy === option.key ? theme.primary : theme.border,
              borderRadius: borderRadius.full,
              borderWidth: 1,
            },
          ]}
          onPress={() => setSortBy(option.key)}
        >
          <Text style={[
            typography.footnote, 
            { color: sortBy === option.key ? theme.primary : theme.textSecondary }
          ]}>
            {option.label}
          </Text>
        </TouchableOpacity>
      ))}
      <TouchableOpacity style={styles.priceFilterToggle} onPress={() => setShowPriceFilter(!showPriceFilter)}>
        <Text style={[typography.footnote, { color: theme.primary }]}>
          {showPriceFilter ? '▲' : '💰 Preis'} {priceRange.min || priceRange.max ? '✓' : ''}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderPriceFilter = () => {
    if (!showPriceFilter) return null;
    return (
      <View style={[
        styles.priceFilterPanel, 
        { backgroundColor: theme.surface, borderRadius: borderRadius.medium }
      ]}>
        <View style={styles.priceInputRow}>
          {(['min', 'max'] as const).map((key) => (
            <React.Fragment key={key}>
              {key === 'max' && <Text style={[typography.body, { color: theme.textSecondary }]}>—</Text>}
              <View style={[styles.priceInputContainer, { backgroundColor: theme.card, borderColor: theme.border, borderRadius: borderRadius.small }]}>
                <Text style={[typography.caption2, { color: theme.textSecondary }]}>{key === 'min' ? 'Min' : 'Max'}</Text>
                <TextInput
                  style={[styles.priceInput, { color: theme.text }]}
                  value={priceRange[key]}
                  onChangeText={(text) => setPriceRange(prev => ({ ...prev, [key]: text }))}
                  placeholder={key === 'min' ? priceLimits.min.toString() : priceLimits.max.toString()}
                  keyboardType="numeric"
                  placeholderTextColor={theme.textMuted}
                />
                <Text style={[typography.caption2, { color: theme.textSecondary }]}>€</Text>
              </View>
            </React.Fragment>
          ))}
        </View>
        <View style={styles.priceFilterButtons}>
          <TouchableOpacity
            style={[styles.priceFilterButton, { backgroundColor: theme.border }]}
            onPress={() => setPriceRange({ min: '', max: '' })}
          >
            <Text style={[typography.footnote, { color: theme.textSecondary }]}>Zurücksetzen</Text>
          </TouchableOpacity>
        </View>
        <Text style={[typography.caption2, { color: theme.textMuted, textAlign: 'center' }]}>
          Bereich: {priceLimits.min}€ - {priceLimits.max}€
        </Text>
      </View>
    );
  };

  const renderProduct = ({ item }: { item: FurnitureItem }) => {
    const isFavorite = favoriteIds.has(item.id);
    const isSaving = savingId === item.id;
    const isTracked = trackedIds.has(item.id);

    return (
      <TouchableOpacity
        style={[
          styles.productCard, 
          { 
            backgroundColor: theme.card, 
            borderRadius: borderRadius.medium,
            width: COLUMN_WIDTH,
            ...shadows.card,
          }
        ]}
        onPress={() => openProduct(item)}
        activeOpacity={0.7}
      >
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: item.imageUrl }} 
            style={[
              styles.productImage, 
              { 
                backgroundColor: theme.surface,
                width: '100%',
                height: COLUMN_WIDTH * 0.75,
              }
            ]} 
            resizeMode="cover"
          />
          
          <View style={styles.actionButtonsOverlay}>
            <TouchableOpacity 
              style={[styles.actionButton, { width: 28, height: 28, borderRadius: 14 }]} 
              onPress={() => toggleFavorite(item)} 
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              {isSaving ? <ActivityIndicator size="small" color="#FF6B6B" /> : <Text style={styles.favoriteIcon}>{isFavorite ? '❤️' : '🤍'}</Text>}
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionButton, { width: 28, height: 28, borderRadius: 14 }]} 
              onPress={() => toggleTrack(item)} 
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.trackIcon}>{isTracked ? '🔔' : '🔕'}</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionButton, { width: 28, height: 28, borderRadius: 14 }]} 
              onPress={() => shareProduct(item)} 
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.shareIcon}>📤</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.productInfo, { padding: spacing.sm }]}>
          <Text style={[typography.caption2, { color: theme.textTertiary }]}>{item.shop}</Text>
          <Text 
            style={[
              typography.subhead, 
              { color: theme.text, fontWeight: '600', marginTop: 2, numberOfLines: 2 }
            ]}
            numberOfLines={2}
          >
            {item.name}
          </Text>
          <Text style={[
            typography.body, 
            { color: theme.primary, fontWeight: '700', marginTop: spacing.xs }
          ]}>
            {formatPrice(item.price, item.currency)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[
        styles.header, 
        { 
          backgroundColor: theme.card, 
          padding: spacing.md,
          ...shadows.card,
        }
      ]}>
        <View style={styles.headerRow}>
          <Image 
            source={{ uri: image }} 
            style={[
              styles.headerImage, 
              { 
                backgroundColor: theme.surface,
                borderRadius: borderRadius.medium,
              }
            ]} 
          />
          <View style={styles.analysisContainer}>
            <Text style={[typography.subhead, { color: theme.textSecondary, fontWeight: '600' }]}>
              Erkannt:
            </Text>
            <View style={styles.tags}>
              {[
                `📦 ${analysis.category}`,
                `🎨 ${analysis.style}`,
                `🪵 ${analysis.material}`,
              ].map(tag => (
                <View 
                  key={tag} 
                  style={[
                    styles.tag, 
                    { 
                      backgroundColor: theme.primaryLight, 
                      borderRadius: borderRadius.small,
                      paddingVertical: spacing.xs / 2,
                      paddingHorizontal: spacing.sm,
                    }
                  ]}
                >
                  <Text style={[typography.caption1, { color: theme.primary }]}>{tag}</Text>
                </View>
              ))}
            </View>
            <Text style={[typography.caption1, { color: theme.textSecondary, fontStyle: 'italic' }]} numberOfLines={2}>
              {analysis.description}
            </Text>
          </View>
        </View>
        <View style={[
          styles.confidenceBar, 
          { 
            backgroundColor: theme.surface, 
            borderRadius: borderRadius.full,
            marginTop: spacing.sm,
            height: 20,
          }
        ]}>
          <View style={[
            styles.confidenceFill, 
            { 
              width: `${analysis.confidence * 100}%`, 
              backgroundColor: theme.success,
              borderRadius: borderRadius.full,
            }
          ]} />
          <Text style={[
            typography.caption2, 
            { color: theme.text, fontWeight: '600', textAlign: 'center' }
          ]}>
            {Math.round(analysis.confidence * 100)}% sicher
          </Text>
        </View>
      </View>

      {/* Filter & Sort */}
      <View style={[
        styles.filterContainer, 
        { 
          backgroundColor: theme.background, 
          paddingHorizontal: spacing.md,
          paddingBottom: spacing.sm,
        }
      ]}>
        <View style={styles.resultsHeader}>
          <Text style={[typography.headline, { color: theme.text }]}>
            {filteredProducts.length} Ergebnisse
          </Text>
          <View style={styles.resultsRight}>
            {budgetMax !== null && budgetMax > 0 && (
              <View style={[styles.budgetBadge, { backgroundColor: theme.primary, borderRadius: borderRadius.full }]}>
                <Text style={[typography.caption2, { color: '#FFF', fontWeight: '600' }]}>
                  💰 bis {budgetMax}€
                </Text>
              </View>
            )}
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={[typography.subhead, { color: theme.primary }]}>🔄 Neue Suche</Text>
            </TouchableOpacity>
          </View>
        </View>
        {renderShopFilter()}
        {renderSortBar()}
        {renderPriceFilter()}
      </View>

      <FlatList
        data={filteredProducts}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={{ padding: spacing.md, paddingTop: spacing.sm }}
        showsVerticalScrollIndicator={false}
        columnWrapperStyle={styles.row}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[typography.headline, { color: theme.textMuted, textAlign: 'center' }]}>
              🔍 Keine Produkte gefunden
            </Text>
            <Text style={[typography.subhead, { color: theme.textMuted, textAlign: 'center', marginTop: spacing.sm }]}>
              Versuche es mit einem anderen Bild
            </Text>
            <TouchableOpacity 
              style={[styles.retryButton, { backgroundColor: theme.primary, marginTop: spacing.md }]} 
              onPress={() => navigation.goBack()}
            >
              <Text style={[typography.subhead, { color: '#FFF' }]}>Neues Bild versuchen</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {},
  headerRow: { flexDirection: 'row', gap: spacing.sm },
  headerImage: { width: 80, height: 80 },
  analysisContainer: { flex: 1 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginTop: spacing.xs },
  tag: {},
  confidenceBar: { overflow: 'hidden', justifyContent: 'center' },
  confidenceFill: { position: 'absolute', left: 0, top: 0, bottom: 0 },
  filterContainer: {},
  resultsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: spacing.sm },
  resultsRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginTop: spacing.sm },
  filterChip: {},
  sortBar: { flexDirection: 'row', gap: spacing.xs, marginTop: spacing.sm },
  sortButton: { paddingVertical: spacing.xs, paddingHorizontal: spacing.sm },
  priceFilterToggle: { marginLeft: 'auto', paddingVertical: spacing.xs },
  priceFilterPanel: { padding: spacing.sm, marginTop: spacing.sm },
  priceInputRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.xs },
  priceInputContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, paddingHorizontal: spacing.sm },
  priceInput: { width: 60, paddingVertical: spacing.xs, fontSize: 14 },
  priceFilterButtons: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.sm, gap: spacing.xs },
  priceFilterButton: { paddingVertical: spacing.xs, paddingHorizontal: spacing.sm, borderRadius: borderRadius.small },
  row: { gap: spacing.md },
  productCard: { overflow: 'hidden' },
  imageContainer: { position: 'relative' },
  productImage: {},
  actionButtonsOverlay: { 
    position: 'absolute', 
    top: spacing.xs, 
    right: spacing.xs, 
    flexDirection: 'row', 
    gap: spacing.xs / 2 
  },
  actionButton: { 
    backgroundColor: 'rgba(255,255,255,0.9)', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  favoriteIcon: { fontSize: 12 },
  trackIcon: { fontSize: 12 },
  shareIcon: { fontSize: 12 },
  productInfo: {},
  retryButton: { paddingVertical: spacing.sm, paddingHorizontal: spacing.md, borderRadius: borderRadius.medium, alignSelf: 'center' },
  emptyContainer: { padding: spacing.xl, alignItems: 'center' },
});
