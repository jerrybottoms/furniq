// Discover Screen - Feature 7
import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Dimensions,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { STYLES, CATEGORIES, getFilteredCatalog, FurnitureStyle, FurnitureCategory, FurnitureItem } from '../data/catalog';
import { StyleProfileService } from '../services/styleProfile';
import { PriceTrackerService } from '../services/priceTracker';

// Budget options
const BUDGET_OPTIONS = [
  { label: 'Alle', min: 0, max: undefined },
  { label: '€', min: 0, max: 200 },
  { label: '€€', min: 200, max: 500 },
  { label: '€€€', min: 500, max: 1000 },
  { label: '€€€€', min: 1000, max: 2000 },
  { label: '€€€€€', min: 2000, max: undefined },
] as const;

type BudgetOption = typeof BUDGET_OPTIONS[number];

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width - 48) / 2;

export default function DiscoverScreen({ navigation }: any) {
  const [selectedStyle, setSelectedStyle] = useState<FurnitureStyle | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<FurnitureCategory | null>(null);
  const [recommendedStyles, setRecommendedStyles] = useState<string[]>([]);
  const [quizStyle, setQuizStyle] = useState<FurnitureStyle | null>(null);
  const [selectedBudget, setSelectedBudget] = useState<BudgetOption | null>(null);
  const [customPriceRange, setCustomPriceRange] = useState({ min: '', max: '' });
  const [trackedIds, setTrackedIds] = useState<Set<string>>(new Set());

  // Load user preferences on mount
  useEffect(() => {
    const loadPreferences = async () => {
      const styles = await StyleProfileService.getTopStyles(3);
      setRecommendedStyles(styles);
      
      const quiz = await StyleProfileService.getQuizStyle();
      if (quiz) {
        setQuizStyle(quiz);
        setSelectedStyle(quiz);
      }
      
      // Load tracked products
      const tracked = await PriceTrackerService.getTrackedProducts();
      setTrackedIds(new Set(tracked.map(t => t.id)));
    };
    loadPreferences();
  }, []);

  // Filter products
  const filteredProducts = useMemo(() => {
    // Use selected budget OR custom price range
    let min: number | undefined;
    let max: number | undefined;
    
    if (selectedBudget) {
      min = selectedBudget.min;
      max = selectedBudget.max;
    } else if (customPriceRange.min || customPriceRange.max) {
      min = customPriceRange.min ? parseInt(customPriceRange.min, 10) : undefined;
      max = customPriceRange.max ? parseInt(customPriceRange.max, 10) : undefined;
    }
    
    return getFilteredCatalog(
      selectedStyle || undefined,
      selectedCategory || undefined,
      min,
      max
    );
  }, [selectedStyle, selectedCategory, selectedBudget, customPriceRange]);

  // Open product detail
  const openProduct = (item: FurnitureItem) => {
    navigation.navigate('ProductDetail' as any, { productId: item.id });
  };

  // Toggle filter
  const toggleStyle = (style: FurnitureStyle) => {
    setSelectedStyle(prev => prev === style ? null : style);
  };

  const toggleCategory = (category: FurnitureCategory) => {
    setSelectedCategory(prev => prev === category ? null : category);
  };

  const renderStyleChip = (style: string) => {
    const isSelected = selectedStyle === style;
    const isRecommended = recommendedStyles.includes(style);
    
    return (
      <TouchableOpacity
        key={style}
        style={[
          styles.chip,
          isSelected && styles.chipSelected,
          isRecommended && !isSelected && styles.chipRecommended,
        ]}
        onPress={() => toggleStyle(style as FurnitureStyle)}
      >
        <Text style={[
          styles.chipText,
          isSelected && styles.chipTextSelected,
        ]}>
          {isRecommended && '⭐ '}{style}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderCategoryChip = (category: string) => {
    const isSelected = selectedCategory === category;
    
    return (
      <TouchableOpacity
        key={category}
        style={[styles.chip, styles.chipCategory, isSelected && styles.chipSelected]}
        onPress={() => toggleCategory(category as FurnitureCategory)}
      >
        <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
          {category}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderProduct = ({ item }: { item: FurnitureItem }) => {
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
        
        {/* Track Button */}
        <TouchableOpacity
          style={styles.trackButton}
          onPress={async () => {
            if (isTracked) {
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
          }}
        >
          <Text style={styles.trackButtonIcon}>{isTracked ? '🔔' : '🔕'}</Text>
        </TouchableOpacity>
        
        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={2}>
            {item.name}
          </Text>
          <View style={styles.productMeta}>
            <Text style={styles.productPrice}>
              {item.price} {item.currency}
            </Text>
            <View style={styles.shopBadge}>
              <Text style={styles.shopBadgeText}>{item.shop}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.title}>Entdecken</Text>
            <Text style={styles.subtitle}>
              {filteredProducts.length} Produkte gefunden
            </Text>
          </View>
          
          {/* Style Quiz Button */}
          <TouchableOpacity
            style={styles.quizButton}
            onPress={() => navigation.navigate('StyleQuiz')}
          >
            <Text style={styles.quizButtonText}>
              {quizStyle ? '⭐' : '💡'} {quizStyle ? 'Stil' : 'Finden'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Quiz Result Banner */}
        {quizStyle && (
          <View style={styles.quizBanner}>
            <Text style={styles.quizBannerText}>
              ✓ Dein Stil: <Text style={styles.quizBannerStyle}>{quizStyle}</Text>
            </Text>
            <TouchableOpacity onPress={() => setSelectedStyle(null)}>
              <Text style={styles.quizBannerClear}>×</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <ScrollView 
        style={styles.filtersContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Recommended Styles */}
        {recommendedStyles.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>⭐ Für dich</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.chipRow}>
                {recommendedStyles.map(style => renderStyleChip(style))}
              </View>
            </ScrollView>
          </View>
        )}

        {/* Style Chips */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Stil</Text>
          <View style={styles.chipRow}>
            {STYLES.map(style => renderStyleChip(style))}
          </View>
        </View>

        {/* Category Chips */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Kategorie</Text>
          <View style={styles.chipRow}>
            {CATEGORIES.map(category => renderCategoryChip(category))}
          </View>
        </View>

        {/* Budget Chips */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💰 Budget</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.chipRow}>
              {BUDGET_OPTIONS.map((budget) => {
                const isSelected = selectedBudget?.label === budget.label;
                return (
                  <TouchableOpacity
                    key={budget.label}
                    style={[
                      styles.budgetChip,
                      isSelected && styles.budgetChipSelected,
                    ]}
                    onPress={() => {
                      setSelectedBudget(isSelected ? null : budget);
                      if (budget.label !== 'Alle') {
                        setCustomPriceRange({ min: '', max: '' });
                      }
                    }}
                  >
                    <Text style={[
                      styles.budgetChipText,
                      isSelected && styles.budgetChipTextSelected,
                    ]}>
                      {budget.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
          
          {/* Custom Price Input (show when "Alle" is selected or custom) */}
          {(!selectedBudget || selectedBudget.label === 'Alle') && (
            <View style={styles.customPriceRow}>
              <TextInput
                style={styles.priceInput}
                placeholder="Min €"
                placeholderTextColor="#999"
                keyboardType="numeric"
                value={customPriceRange.min}
                onChangeText={(text) => {
                  setCustomPriceRange(prev => ({ ...prev, min: text }));
                  setSelectedBudget(null);
                }}
              />
              <Text style={styles.priceSeparator}>—</Text>
              <TextInput
                style={styles.priceInput}
                placeholder="Max €"
                placeholderTextColor="#999"
                keyboardType="numeric"
                value={customPriceRange.max}
                onChangeText={(text) => {
                  setCustomPriceRange(prev => ({ ...prev, max: text }));
                  setSelectedBudget(null);
                }}
              />
            </View>
          )}
        </View>

        {/* Results Count */}
        <View style={styles.resultsBar}>
          <Text style={styles.resultsCount}>
            {filteredProducts.length} Produkte gefunden
          </Text>
          {(selectedStyle || selectedCategory || selectedBudget || customPriceRange.min || customPriceRange.max) && (
            <TouchableOpacity onPress={() => {
              setSelectedStyle(null);
              setSelectedCategory(null);
              setSelectedBudget(null);
              setCustomPriceRange({ min: '', max: '' });
            }}>
              <Text style={styles.clearFilter}>Filter löschen</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* Product Grid */}
      <FlatList
        data={filteredProducts}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.productList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Keine Produkte gefunden</Text>
            <Text style={styles.emptySubtext}>Versuche andere Filter</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    backgroundColor: '#1A5F5A',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  filtersContainer: {
    maxHeight: 280,
    backgroundColor: '#F8F8F8',
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#E8E8E8',
  },
  chipCategory: {
    backgroundColor: '#E0E0E0',
  },
  chipSelected: {
    backgroundColor: '#1A5F5A',
  },
  chipRecommended: {
    backgroundColor: '#FFF3E0',
    borderWidth: 1,
    borderColor: '#FFB74D',
  },
  chipText: {
    fontSize: 13,
    color: '#333',
  },
  chipTextSelected: {
    color: '#FFF',
    fontWeight: '600',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceInput: {
    flex: 1,
    height: 40,
    backgroundColor: '#FFF',
    borderRadius: 8,
    paddingHorizontal: 14,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  priceSeparator: {
    marginHorizontal: 12,
    color: '#999',
  },
  resultsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  resultsCount: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  clearFilter: {
    fontSize: 14,
    color: '#1A5F5A',
    fontWeight: '600',
  },
  productList: {
    padding: 16,
    paddingTop: 8,
  },
  productCard: {
    width: COLUMN_WIDTH,
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginRight: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: COLUMN_WIDTH,
    backgroundColor: '#F0F0F0',
  },
  productInfo: {
    padding: 10,
  },
  productName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
    height: 36,
  },
  productMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productPrice: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1A5F5A',
  },
  shopBadge: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  shopBadgeText: {
    fontSize: 10,
    color: '#666',
  },
  empty: {
    alignItems: 'center',
    paddingTop: 40,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
  },
  
  // Style Quiz
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  quizButton: {
    backgroundColor: '#1A5F5A',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  quizButtonText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '600',
  },
  quizBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#E8F5F4',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 12,
  },
  quizBannerText: {
    fontSize: 14,
    color: '#1A5F5A',
  },
  quizBannerStyle: {
    fontWeight: 'bold',
  },
  quizBannerClear: {
    fontSize: 20,
    color: '#1A5F5A',
    paddingHorizontal: 8,
  },
  
  // Budget Chips
  budgetChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    marginRight: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  budgetChipSelected: {
    backgroundColor: '#1A5F5A',
    borderColor: '#1A5F5A',
  },
  budgetChipText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  budgetChipTextSelected: {
    color: '#FFF',
  },
  customPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  trackButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  trackButtonIcon: {
    fontSize: 14,
  },
});
