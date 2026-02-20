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
import { getSimilarProducts } from '../data/catalog';
import { PriceTrackerService, TrackedProduct } from '../services/priceTracker';

// ========== TYPES ==========

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

// ========== HELPERS ==========

function formatPrice(price: number, currency: string): string {
  const symbol = currency === 'EUR' ? '€' : currency === 'USD' ? '$' : currency === 'GBP' ? '£' : currency;
  if (currency === 'EUR') {
    return `${price.toFixed(2).replace('.', ',')} €`;
  }
  return `${symbol}${price.toFixed(2)}`;
}

// All available shops from products
function getAvailableShops(products: FurnitureItem[]): string[] {
  const shops = new Set(products.map(p => p.shop));
  return Array.from(shops).sort();
}

// ========== COMPONENT ==========

export default function ResultsScreen({ route, navigation }: ResultsScreenProps) {
  const { image, analysis, products } = route.params;

  // State
  const [sortBy, setSortBy] = useState<SortOption>('relevance');
  const [activeShops, setActiveShops] = useState<Set<string>>(new Set(getAvailableShops(products)));
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [savingId, setSavingId] = useState<string | null>(null);
  const [priceRange, setPriceRange] = useState<{ min: string; max: string }>({ min: '', max: '' });
  const [showPriceFilter, setShowPriceFilter] = useState(false);
  const [trackedIds, setTrackedIds] = useState<Set<string>>(new Set());

  // Similar products (based on first result or analysis)
  const similarProducts = useMemo(() => {
    if (products.length === 0) return [];
    // Use first product as reference for similar products
    return getSimilarProducts(products[0], 6);
  }, [products]);

  // Load tracked products on mount
  useEffect(() => {
    PriceTrackerService.getTrackedProducts().then(tracked => {
      const ids = new Set(tracked.map(t => t.id));
      setTrackedIds(ids);
    });
  }, []);

  // Price range from products
  const priceLimits = useMemo(() => {
    if (products.length === 0) return { min: 0, max: 1000 };
    const prices = products.map(p => p.price);
    return {
      min: Math.floor(Math.min(...prices)),
      max: Math.ceil(Math.max(...prices)),
    };
  }, [products]);

  // Available shops
  const availableShops = useMemo(() => getAvailableShops(products), [products]);

  // Filtered & sorted products
  const filteredProducts = useMemo(() => {
    let result = products.filter(p => activeShops.has(p.shop));

    // Price filter
    const minPrice = priceRange.min ? parseFloat(priceRange.min) : null;
    const maxPrice = priceRange.max ? parseFloat(priceRange.max) : null;
    
    if (minPrice !== null) {
      result = result.filter(p => p.price >= minPrice);
    }
    if (maxPrice !== null) {
      result = result.filter(p => p.price <= maxPrice);
    }

    // Sort
    switch (sortBy) {
      case 'price-low':
        result = [...result].sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        result = [...result].sort((a, b) => b.price - a.price);
        break;
      case 'relevance':
      default:
        break;
    }

    return result;
  }, [products, activeShops, sortBy, priceRange]);

  // Toggle shop filter
  const toggleShop = useCallback((shop: string) => {
    setActiveShops(prev => {
      const next = new Set(prev);
      if (next.has(shop)) {
        if (next.size > 1) next.delete(shop); // Don't allow empty
      } else {
        next.add(shop);
      }
      return next;
    });
  }, []);

  // Open product detail
  const openProduct = (item: FurnitureItem) => {
    navigation.navigate('ProductDetail' as any, { productId: item.id });
  };

  // Share product
  const shareProduct = async (item: FurnitureItem) => {
    try {
      const message = `🔥 Schau mal dieses Möbelstück: ${item.name} - ${formatPrice(item.price, item.currency)}\n\nVia Furniture Finder App`;
      
      await Share.share({
        message: item.affiliateUrl ? `${message}\n\n${item.affiliateUrl}` : message,
        title: item.name,
        url: item.affiliateUrl,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  // Save to favorites
  const toggleFavorite = async (item: FurnitureItem) => {
    if (favoriteIds.has(item.id)) {
      setFavoriteIds(prev => {
        const next = new Set(prev);
        next.delete(item.id);
        return next;
      });
      return;
    }

    setSavingId(item.id);
    const { success, error } = await addFavorite(item);
    setSavingId(null);

    if (success) {
      setFavoriteIds(prev => new Set(prev).add(item.id));
    } else {
      Alert.alert('Fehler', error || 'Konnte nicht gespeichert werden.');
    }
  };

  // Toggle price tracking
  const toggleTrack = async (item: FurnitureItem) => {
    if (trackedIds.has(item.id)) {
      await PriceTrackerService.untrackProduct(item.id);
      setTrackedIds(prev => {
        const next = new Set(prev);
        next.delete(item.id);
        return next;
      });
    } else {
      await PriceTrackerService.trackProduct(item);
      setTrackedIds(prev => new Set(prev).add(item.id));
    }
  };

  // ========== RENDER ==========

  const renderShopFilter = () => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
      {availableShops.map(shop => (
        <TouchableOpacity
          key={shop}
          style={[styles.filterChip, activeShops.has(shop) && styles.filterChipActive]}
          onPress={() => toggleShop(shop)}
        >
          <Text style={[styles.filterChipText, activeShops.has(shop) && styles.filterChipTextActive]}>
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
          style={[styles.sortButton, sortBy === option.key && styles.sortButtonActive]}
          onPress={() => setSortBy(option.key)}
        >
          <Text style={[styles.sortButtonText, sortBy === option.key && styles.sortButtonTextActive]}>
            {option.label}
          </Text>
        </TouchableOpacity>
      ))}
      <TouchableOpacity
        style={styles.priceFilterToggle}
        onPress={() => setShowPriceFilter(!showPriceFilter)}
      >
        <Text style={styles.priceFilterToggleText}>
          {showPriceFilter ? '▲' : '💰 Preis'} {priceRange.min || priceRange.max ? '✓' : ''}
        </Text>
      </TouchableOpacity>
    </View>
  );

  // Price filter panel
  const renderPriceFilter = () => {
    if (!showPriceFilter) return null;
    
    return (
      <View style={styles.priceFilterPanel}>
        <View style={styles.priceInputRow}>
          <View style={styles.priceInputContainer}>
            <Text style={styles.priceInputLabel}>Min</Text>
            <TextInput
              style={styles.priceInput}
              value={priceRange.min}
              onChangeText={(text) => setPriceRange(prev => ({ ...prev, min: text }))}
              placeholder={priceLimits.min.toString()}
              keyboardType="numeric"
              placeholderTextColor="#999"
            />
            <Text style={styles.priceInputSuffix}>€</Text>
          </View>
          <Text style={styles.priceInputSeparator}>—</Text>
          <View style={styles.priceInputContainer}>
            <Text style={styles.priceInputLabel}>Max</Text>
            <TextInput
              style={styles.priceInput}
              value={priceRange.max}
              onChangeText={(text) => setPriceRange(prev => ({ ...prev, max: text }))}
              placeholder={priceLimits.max.toString()}
              keyboardType="numeric"
              placeholderTextColor="#999"
            />
            <Text style={styles.priceInputSuffix}>€</Text>
          </View>
        </View>
        <View style={styles.priceFilterButtons}>
          <TouchableOpacity
            style={styles.priceFilterButton}
            onPress={() => setPriceRange({ min: '', max: '' })}
          >
            <Text style={styles.priceFilterButtonText}>Zurücksetzen</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.priceRangeHint}>
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
        style={styles.productCard}
        onPress={() => openProduct(item)}
        activeOpacity={0.7}
      >
        <Image
          source={{ uri: item.imageUrl }}
          style={styles.productImage}
        />

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => toggleFavorite(item)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color="#FF6B6B" />
            ) : (
              <Text style={styles.favoriteIcon}>{isFavorite ? '❤️' : '🤍'}</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => toggleTrack(item)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.trackIcon}>{isTracked ? '🔔' : '🔕'}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => shareProduct(item)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.shareIcon}>📤</Text>
          </TouchableOpacity>
        </View>

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
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Image source={{ uri: image }} style={styles.headerImage} />
          <View style={styles.analysisContainer}>
            <Text style={styles.analysisTitle}>Erkannt:</Text>
            <View style={styles.tags}>
              <View style={styles.tag}>
                <Text style={styles.tagText}>📦 {analysis.category}</Text>
              </View>
              <View style={styles.tag}>
                <Text style={styles.tagText}>🎨 {analysis.style}</Text>
              </View>
              <View style={styles.tag}>
                <Text style={styles.tagText}>🪵 {analysis.material}</Text>
              </View>
            </View>
            <Text style={styles.description} numberOfLines={2}>
              {analysis.description}
            </Text>
          </View>
        </View>

        {/* Confidence */}
        <View style={styles.confidenceBar}>
          <View style={[styles.confidenceFill, { width: `${(analysis.confidence * 100)}%` }]} />
          <Text style={styles.confidenceText}>
            {Math.round(analysis.confidence * 100)}% sicher
          </Text>
        </View>
      </View>

      {/* Filter & Sort */}
      <View style={styles.filterContainer}>
        <View style={styles.resultsHeader}>
          <Text style={styles.resultsTitle}>
            {filteredProducts.length} Ergebnisse
          </Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.searchAgainText}>🔄 Neue Suche</Text>
          </TouchableOpacity>
        </View>
        {renderShopFilter()}
        {renderSortBar()}
        {renderPriceFilter()}
      </View>

      {/* Product list */}
      <FlatList
        data={filteredProducts}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>🔍</Text>
            <Text style={styles.emptyText}>
              Keine Produkte gefunden.
            </Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.retryButtonText}>Neues Bild versuchen</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* Similar Products Section */}
      {similarProducts.length > 0 && (
        <View style={styles.similarSection}>
          <Text style={styles.similarTitle}>Das könnte dir auch gefallen</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.similarScrollContent}
          >
            {similarProducts.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.similarCard}
                onPress={() => openProduct(item)}
              >
                <Image source={{ uri: item.imageUrl }} style={styles.similarImage} />
                <View style={styles.similarInfo}>
                  <Text style={styles.similarName} numberOfLines={2}>
                    {item.name}
                  </Text>
                  <Text style={styles.similarPrice}>
                    {formatPrice(item.price, item.currency)}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
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

  // Header
  header: {
    backgroundColor: '#FFF',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerRow: {
    flexDirection: 'row',
    gap: 12,
  },
  headerImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  analysisContainer: {
    flex: 1,
  },
  analysisTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#888',
    marginBottom: 6,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 6,
  },
  tag: {
    backgroundColor: '#F0F4FF',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 11,
    color: '#4A6FA5',
    fontWeight: '500',
  },
  description: {
    fontSize: 13,
    color: '#666',
    fontStyle: 'italic',
  },

  // Confidence
  confidenceBar: {
    marginTop: 10,
    height: 20,
    backgroundColor: '#F0F0F0',
    borderRadius: 10,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  confidenceFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: '#10B981',
    borderRadius: 10,
  },
  confidenceText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },

  // Filter
  filterContainer: {
    backgroundColor: '#FFF',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  searchAgainText: {
    fontSize: 13,
    color: '#1A5F5A',
    fontWeight: '500',
  },
  filterRow: {
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  filterChip: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: '#F0F0F0',
    marginHorizontal: 4,
  },
  filterChipActive: {
    backgroundColor: '#1A5F5A',
  },
  filterChipText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: '#FFF',
  },

  // Sort
  sortBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
  },
  sortButton: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#F8F8F8',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  sortButtonActive: {
    backgroundColor: '#E8F4FD',
    borderColor: '#1A5F5A',
  },
  sortButtonText: {
    fontSize: 12,
    color: '#888',
    fontWeight: '500',
  },
  sortButtonTextActive: {
    color: '#1A5F5A',
  },
  priceFilterToggle: {
    marginLeft: 'auto',
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  priceFilterToggleText: {
    fontSize: 12,
    color: '#1A5F5A',
    fontWeight: '500',
  },
  priceFilterPanel: {
    backgroundColor: '#F8F8F8',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 8,
    marginHorizontal: 16,
    borderRadius: 8,
  },
  priceInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  priceInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingHorizontal: 10,
  },
  priceInputLabel: {
    fontSize: 12,
    color: '#666',
    marginRight: 6,
  },
  priceInput: {
    width: 60,
    paddingVertical: 8,
    fontSize: 14,
    color: '#333',
  },
  priceInputSuffix: {
    fontSize: 14,
    color: '#666',
  },
  priceInputSeparator: {
    fontSize: 16,
    color: '#999',
  },
  priceFilterButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
    gap: 10,
  },
  priceFilterButton: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 6,
    backgroundColor: '#E0E0E0',
  },
  priceFilterButtonText: {
    fontSize: 12,
    color: '#666',
  },
  priceRangeHint: {
    fontSize: 11,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
  },

  // Product list
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
  favoriteIcon: {
    fontSize: 16,
  },
  actionButtons: {
    position: 'absolute',
    top: 6,
    left: 6,
    flexDirection: 'row',
    gap: 4,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareIcon: {
    fontSize: 14,
  },
  trackIcon: {
    fontSize: 14,
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

  // Empty state
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#1A5F5A',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  
  // Similar Products
  similarSection: {
    backgroundColor: '#FFF',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  similarTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A5F5A',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  similarScrollContent: {
    paddingHorizontal: 12,
  },
  similarCard: {
    width: 140,
    marginHorizontal: 4,
    backgroundColor: '#FFF',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  similarImage: {
    width: '100%',
    height: 100,
    backgroundColor: '#F0F0F0',
  },
  similarInfo: {
    padding: 10,
  },
  similarName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
    height: 32,
  },
  similarPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1A5F5A',
  },
});
