// Results Screen - Phase 5b: Filter, Sort, Favorites, UI Polish
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  Linking,
  ScrollView,
  Alert,
  ActivityIndicator,
  Share,
} from 'react-native';
import { FurnitureItem, AnalysisResult } from '../types';
import { addFavorite } from '../services/supabase';
// getSimilarProducts removed – shown only in ProductDetail now
import { PriceTrackerService, TrackedProduct } from '../services/priceTracker';
import { getBudget, isWithinBudget } from '../services/budget';
import { useTheme } from '../context/ThemeContext';

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
  const { image, analysis, products } = route.params;

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
    // Load budget
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
    
    // Apply budget filter from settings
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
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
      {availableShops.map(shop => (
        <TouchableOpacity
          key={shop}
          style={[
            styles.filterChip,
            { backgroundColor: activeShops.has(shop) ? theme.primary : theme.surface },
          ]}
          onPress={() => toggleShop(shop)}
        >
          <Text style={[styles.filterChipText, { color: activeShops.has(shop) ? '#FFF' : theme.textSecondary }]}>
            {shop}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
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
            },
          ]}
          onPress={() => setSortBy(option.key)}
        >
          <Text style={[styles.sortButtonText, { color: sortBy === option.key ? theme.primary : theme.textSecondary }]}>
            {option.label}
          </Text>
        </TouchableOpacity>
      ))}
      <TouchableOpacity style={styles.priceFilterToggle} onPress={() => setShowPriceFilter(!showPriceFilter)}>
        <Text style={[styles.priceFilterToggleText, { color: theme.primary }]}>
          {showPriceFilter ? '▲' : '💰 Preis'} {priceRange.min || priceRange.max ? '✓' : ''}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderPriceFilter = () => {
    if (!showPriceFilter) return null;
    return (
      <View style={[styles.priceFilterPanel, { backgroundColor: theme.surface }]}>
        <View style={styles.priceInputRow}>
          {(['min', 'max'] as const).map((key) => (
            <React.Fragment key={key}>
              {key === 'max' && <Text style={[styles.priceInputSeparator, { color: theme.textSecondary }]}>—</Text>}
              <View style={[styles.priceInputContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <Text style={[styles.priceInputLabel, { color: theme.textSecondary }]}>{key === 'min' ? 'Min' : 'Max'}</Text>
                <TextInput
                  style={[styles.priceInput, { color: theme.text }]}
                  value={priceRange[key]}
                  onChangeText={(text) => setPriceRange(prev => ({ ...prev, [key]: text }))}
                  placeholder={key === 'min' ? priceLimits.min.toString() : priceLimits.max.toString()}
                  keyboardType="numeric"
                  placeholderTextColor={theme.textMuted}
                />
                <Text style={[styles.priceInputSuffix, { color: theme.textSecondary }]}>€</Text>
              </View>
            </React.Fragment>
          ))}
        </View>
        <View style={styles.priceFilterButtons}>
          <TouchableOpacity
            style={[styles.priceFilterButton, { backgroundColor: theme.border }]}
            onPress={() => setPriceRange({ min: '', max: '' })}
          >
            <Text style={[styles.priceFilterButtonText, { color: theme.textSecondary }]}>Zurücksetzen</Text>
          </TouchableOpacity>
        </View>
        <Text style={[styles.priceRangeHint, { color: theme.textMuted }]}>
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
        style={[styles.productCard, { backgroundColor: theme.card }]}
        onPress={() => openProduct(item)}
        activeOpacity={0.7}
      >
        <Image source={{ uri: item.imageUrl }} style={[styles.productImage, { backgroundColor: theme.surface }]} />

        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton} onPress={() => toggleFavorite(item)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            {isSaving ? <ActivityIndicator size="small" color="#FF6B6B" /> : <Text style={styles.favoriteIcon}>{isFavorite ? '❤️' : '🤍'}</Text>}
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => toggleTrack(item)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Text style={styles.trackIcon}>{isTracked ? '🔔' : '🔕'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => shareProduct(item)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Text style={styles.shareIcon}>📤</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.productInfo}>
          <Text style={[styles.productName, { color: theme.text }]} numberOfLines={2}>{item.name}</Text>
          <View style={styles.productMeta}>
            <Text style={[styles.productPrice, { color: theme.success }]}>{formatPrice(item.price, item.currency)}</Text>
            <View style={[styles.shopBadge, { backgroundColor: theme.surface }]}>
              <Text style={[styles.shopBadgeText, { color: theme.primary }]}>{item.shop}</Text>
            </View>
          </View>
          <TouchableOpacity style={[styles.buyButton, { backgroundColor: theme.primary }]} onPress={() => openProduct(item)}>
            <Text style={styles.buyButtonText}>Zum Shop →</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.surface }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
        <View style={styles.headerRow}>
          <Image source={{ uri: image }} style={[styles.headerImage, { backgroundColor: theme.surface }]} />
          <View style={styles.analysisContainer}>
            <Text style={[styles.analysisTitle, { color: theme.textSecondary }]}>Erkannt:</Text>
            <View style={styles.tags}>
              {[
                `📦 ${analysis.category}`,
                `🎨 ${analysis.style}`,
                `🪵 ${analysis.material}`,
              ].map(tag => (
                <View key={tag} style={[styles.tag, { backgroundColor: theme.surface }]}>
                  <Text style={[styles.tagText, { color: theme.primary }]}>{tag}</Text>
                </View>
              ))}
            </View>
            <Text style={[styles.description, { color: theme.textSecondary }]} numberOfLines={2}>{analysis.description}</Text>
          </View>
        </View>
        <View style={[styles.confidenceBar, { backgroundColor: theme.surface }]}>
          <View style={[styles.confidenceFill, { width: `${analysis.confidence * 100}%`, backgroundColor: theme.success }]} />
          <Text style={[styles.confidenceText, { color: theme.text }]}>{Math.round(analysis.confidence * 100)}% sicher</Text>
        </View>
      </View>

      {/* Filter & Sort */}
      <View style={[styles.filterContainer, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
        <View style={styles.resultsHeader}>
          <Text style={[styles.resultsTitle, { color: theme.text }]}>{filteredProducts.length} Ergebnisse</Text>
          <View style={styles.resultsRight}>
            {budgetMax !== null && budgetMax > 0 && (
              <View style={[styles.budgetBadge, { backgroundColor: theme.primary }]}>
                <Text style={styles.budgetBadgeText}>💰 bis {budgetMax}€</Text>
              </View>
            )}
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={[styles.searchAgainText, { color: theme.primary }]}>🔄 Neue Suche</Text>
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
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>🔍</Text>
            <Text style={[styles.emptyText, { color: theme.textMuted }]}>Keine Produkte gefunden.</Text>
            <TouchableOpacity style={[styles.retryButton, { backgroundColor: theme.primary }]} onPress={() => navigation.goBack()}>
              <Text style={styles.retryButtonText}>Neues Bild versuchen</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* Similar products moved to ProductDetail screen */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 16, borderBottomWidth: 1 },
  headerRow: { flexDirection: 'row', gap: 12 },
  headerImage: { width: 80, height: 80, borderRadius: 12 },
  analysisContainer: { flex: 1 },
  analysisTitle: { fontSize: 13, fontWeight: '600', marginBottom: 6 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 6 },
  tag: { paddingVertical: 3, paddingHorizontal: 8, borderRadius: 8 },
  tagText: { fontSize: 11, fontWeight: '500' },
  description: { fontSize: 13, fontStyle: 'italic' },
  confidenceBar: { marginTop: 10, height: 20, borderRadius: 10, overflow: 'hidden', justifyContent: 'center' },
  confidenceFill: { position: 'absolute', left: 0, top: 0, bottom: 0, borderRadius: 10 },
  confidenceText: { fontSize: 11, fontWeight: '600', textAlign: 'center' },
  filterContainer: { paddingBottom: 8, borderBottomWidth: 1 },
  resultsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },
  resultsTitle: { fontSize: 16, fontWeight: 'bold' },
  resultsRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  searchAgainText: { fontSize: 13, fontWeight: '500' },
  budgetBadge: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 12 },
  budgetBadgeText: { color: '#FFF', fontSize: 12, fontWeight: '600' },
  filterRow: { paddingHorizontal: 12, marginBottom: 8 },
  filterChip: { paddingVertical: 6, paddingHorizontal: 14, borderRadius: 16, marginHorizontal: 4 },
  filterChipText: { fontSize: 13, fontWeight: '500' },
  sortBar: { flexDirection: 'row', paddingHorizontal: 16, gap: 8 },
  sortButton: { paddingVertical: 5, paddingHorizontal: 12, borderRadius: 12, borderWidth: 1 },
  sortButtonText: { fontSize: 12, fontWeight: '500' },
  priceFilterToggle: { marginLeft: 'auto', paddingVertical: 5, paddingHorizontal: 10 },
  priceFilterToggleText: { fontSize: 12, fontWeight: '500' },
  priceFilterPanel: { paddingHorizontal: 16, paddingVertical: 12, marginTop: 8, marginHorizontal: 16, borderRadius: 8 },
  priceInputRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  priceInputContainer: { flexDirection: 'row', alignItems: 'center', borderRadius: 8, borderWidth: 1, paddingHorizontal: 10 },
  priceInputLabel: { fontSize: 12, marginRight: 6 },
  priceInput: { width: 60, paddingVertical: 8, fontSize: 14 },
  priceInputSuffix: { fontSize: 14 },
  priceInputSeparator: { fontSize: 16 },
  priceFilterButtons: { flexDirection: 'row', justifyContent: 'center', marginTop: 10, gap: 10 },
  priceFilterButton: { paddingVertical: 6, paddingHorizontal: 14, borderRadius: 6 },
  priceFilterButtonText: { fontSize: 12 },
  priceRangeHint: { fontSize: 11, textAlign: 'center', marginTop: 8 },
  listContent: { padding: 12, gap: 12 },
  productCard: { borderRadius: 12, overflow: 'hidden', flexDirection: 'row', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 4 },
  productImage: { width: 110, height: 130 },
  favoriteIcon: { fontSize: 16 },
  actionButtons: { position: 'absolute', top: 6, left: 6, flexDirection: 'row', gap: 4 },
  actionButton: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.9)', justifyContent: 'center', alignItems: 'center' },
  shareIcon: { fontSize: 14 },
  trackIcon: { fontSize: 14 },
  productInfo: { flex: 1, padding: 12, justifyContent: 'space-between' },
  productName: { fontSize: 14, fontWeight: '600', marginBottom: 4 },
  productMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  productPrice: { fontSize: 18, fontWeight: 'bold' },
  shopBadge: { paddingVertical: 2, paddingHorizontal: 8, borderRadius: 8 },
  shopBadgeText: { fontSize: 11, fontWeight: '500' },
  buyButton: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 8, alignSelf: 'flex-start' },
  buyButtonText: { color: '#FFF', fontSize: 13, fontWeight: '600' },
  emptyContainer: { padding: 40, alignItems: 'center' },
  emptyEmoji: { fontSize: 48, marginBottom: 16 },
  emptyText: { fontSize: 16, textAlign: 'center', marginBottom: 16 },
  retryButton: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8 },
  retryButtonText: { color: '#FFF', fontSize: 14, fontWeight: '600' },
});
