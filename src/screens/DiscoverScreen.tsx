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
import { getBudget, isWithinBudget } from '../services/budget';
import { useTheme } from '../context/ThemeContext';

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
  const { theme, isDark } = useTheme();
  const [selectedStyle, setSelectedStyle] = useState<FurnitureStyle | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<FurnitureCategory | null>(null);
  const [recommendedStyles, setRecommendedStyles] = useState<string[]>([]);
  const [quizStyle, setQuizStyle] = useState<FurnitureStyle | null>(null);
  const [selectedBudget, setSelectedBudget] = useState<BudgetOption | null>(null);
  const [customPriceRange, setCustomPriceRange] = useState({ min: '', max: '' });
  const [trackedIds, setTrackedIds] = useState<Set<string>>(new Set());
  const [globalBudgetMax, setGlobalBudgetMax] = useState<number | null>(null);

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
      
      // Load global budget from settings
      const budget = await getBudget();
      if (budget.maxBudget !== null && budget.maxBudget > 0) {
        setGlobalBudgetMax(budget.maxBudget);
      }
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
    } else if (globalBudgetMax !== null && globalBudgetMax > 0) {
      // Apply global budget from settings if no local filters are set
      max = globalBudgetMax;
    }
    
    return getFilteredCatalog(
      selectedStyle || undefined,
      selectedCategory || undefined,
      min,
      max
    );
  }, [selectedStyle, selectedCategory, selectedBudget, customPriceRange, globalBudgetMax]);

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
          isSelected && [styles.chipSelected, { backgroundColor: theme.primary }],
          !isSelected && isRecommended && { backgroundColor: isDark ? '#3D3426' : '#FFF3E0', borderWidth: 1, borderColor: isDark ? '#5D4E37' : '#FFB74D' },
          !isSelected && !isRecommended && { backgroundColor: theme.surface },
        ]}
        onPress={() => toggleStyle(style as FurnitureStyle)}
      >
        <Text style={[
          styles.chipText,
          isSelected && styles.chipTextSelected,
          !isSelected && { color: theme.text },
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
        style={[
          styles.chip, 
          styles.chipCategory, 
          isSelected && [styles.chipSelected, { backgroundColor: theme.primary }],
          !isSelected && { backgroundColor: theme.surface },
        ]}
        onPress={() => toggleCategory(category as FurnitureCategory)}
      >
        <Text style={[
          styles.chipText, 
          isSelected && styles.chipTextSelected,
          !isSelected && { color: theme.text },
        ]}>
          {category}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderProduct = ({ item }: { item: FurnitureItem }) => {
    const isTracked = trackedIds.has(item.id);
    
    return (
      <TouchableOpacity
        style={[styles.productCard, { backgroundColor: theme.card }]}
        onPress={() => openProduct(item)}
        activeOpacity={0.7}
      >
        <Image
          source={{ uri: item.imageUrl }}
          style={[styles.productImage, { backgroundColor: theme.surface }]}
        />
        
        {/* Track Button */}
        <TouchableOpacity
          style={[styles.trackButton, { backgroundColor: isDark ? 'rgba(30,30,30,0.9)' : 'rgba(255,255,255,0.9)' }]}
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
          <Text style={[styles.productName, { color: theme.text }]} numberOfLines={2}>
            {item.name}
          </Text>
          <View style={styles.productMeta}>
            <Text style={[styles.productPrice, { color: theme.primary }]}>
              {item.price} {item.currency}
            </Text>
            <View style={[styles.shopBadge, { backgroundColor: theme.surface }]}>
              <Text style={[styles.shopBadgeText, { color: theme.textSecondary }]}>{item.shop}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <View style={[styles.header, { backgroundColor: isDark ? theme.card : theme.primary }]}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.title}>Entdecken</Text>
            <Text style={[styles.subtitle, { color: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.8)' }]}>
              {filteredProducts.length} Produkte gefunden
            </Text>
          </View>
          
          {/* Style Quiz Button */}
          <TouchableOpacity
            style={[styles.quizButton, { backgroundColor: isDark ? theme.surface : theme.primary }]}
            onPress={() => navigation.navigate('StyleQuiz')}
          >
            <Text style={[styles.quizButtonText, { color: isDark ? theme.text : '#FFF' }]}>
              {quizStyle ? '⭐' : '💡'} {quizStyle ? 'Stil' : 'Finden'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Quiz Result Banner */}
        {quizStyle && (
          <View style={[styles.quizBanner, { backgroundColor: isDark ? '#2A3A35' : '#E8F5F4' }]}>
            <Text style={[styles.quizBannerText, { color: theme.primary }]}>
              ✓ Dein Stil: <Text style={styles.quizBannerStyle}>{quizStyle}</Text>
            </Text>
            <TouchableOpacity onPress={() => setSelectedStyle(null)}>
              <Text style={[styles.quizBannerClear, { color: theme.primary }]}>×</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <ScrollView 
        style={[styles.filtersContainer, { backgroundColor: theme.surface }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Recommended Styles */}
        {recommendedStyles.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>⭐ Für dich</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.chipRow}>
                {recommendedStyles.map(style => renderStyleChip(style))}
              </View>
            </ScrollView>
          </View>
        )}

        {/* Style Chips */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Stil</Text>
          <View style={styles.chipRow}>
            {STYLES.map(style => renderStyleChip(style))}
          </View>
        </View>

        {/* Category Chips */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Kategorie</Text>
          <View style={styles.chipRow}>
            {CATEGORIES.map(category => renderCategoryChip(category))}
          </View>
        </View>

        {/* Budget Chips */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>💰 Budget</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.chipRow}>
              {BUDGET_OPTIONS.map((budget) => {
                const isSelected = selectedBudget?.label === budget.label;
                return (
                  <TouchableOpacity
                    key={budget.label}
                    style={[
                      styles.budgetChip,
                      isSelected && [styles.budgetChipSelected, { backgroundColor: theme.primary, borderColor: theme.primary }],
                      !isSelected && { backgroundColor: theme.surface, borderColor: theme.border },
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
                      !isSelected && { color: theme.text },
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
                style={[styles.priceInput, { backgroundColor: theme.card, borderColor: theme.border, color: theme.text }]}
                placeholder="Min €"
                placeholderTextColor={theme.textMuted}
                keyboardType="numeric"
                value={customPriceRange.min}
                onChangeText={(text) => {
                  setCustomPriceRange(prev => ({ ...prev, min: text }));
                  setSelectedBudget(null);
                }}
              />
              <Text style={[styles.priceSeparator, { color: theme.textSecondary }]}>—</Text>
              <TextInput
                style={[styles.priceInput, { backgroundColor: theme.card, borderColor: theme.border, color: theme.text }]}
                placeholder="Max €"
                placeholderTextColor={theme.textMuted}
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
        <View style={[styles.resultsBar, { borderTopColor: theme.border }]}>
          <View style={styles.resultsLeft}>
            <Text style={[styles.resultsCount, { color: theme.textSecondary }]}>
              {filteredProducts.length} Produkte
            </Text>
            {globalBudgetMax !== null && globalBudgetMax > 0 && !selectedBudget && !customPriceRange.min && !customPriceRange.max && (
              <View style={[styles.globalBudgetBadge, { backgroundColor: theme.primary }]}>
                <Text style={styles.globalBudgetBadgeText}>💰 bis {globalBudgetMax}€</Text>
              </View>
            )}
          </View>
          {(selectedStyle || selectedCategory || selectedBudget || customPriceRange.min || customPriceRange.max) && (
            <TouchableOpacity onPress={() => {
              setSelectedStyle(null);
              setSelectedCategory(null);
              setSelectedBudget(null);
              setCustomPriceRange({ min: '', max: '' });
            }}>
              <Text style={[styles.clearFilter, { color: theme.primary }]}>Filter löschen</Text>
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
        contentContainerStyle={[styles.productList, { backgroundColor: theme.background }]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>Keine Produkte gefunden</Text>
            <Text style={[styles.emptySubtext, { color: theme.textMuted }]}>Versuche andere Filter</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  filtersContainer: {
    maxHeight: 280,
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
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
  },
  chipCategory: {},
  chipSelected: {},
  chipRecommended: {},
  chipText: {
    fontSize: 13,
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
    borderRadius: 8,
    paddingHorizontal: 14,
    fontSize: 14,
    borderWidth: 1,
  },
  priceSeparator: {
    marginHorizontal: 12,
  },
  resultsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
  },
  resultsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  resultsCount: {
    fontSize: 14,
    fontWeight: '500',
  },
  globalBudgetBadge: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  globalBudgetBadgeText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '600',
  },
  clearFilter: {
    fontSize: 14,
    fontWeight: '600',
  },
  productList: {
    padding: 16,
    paddingTop: 8,
  },
  productCard: {
    width: COLUMN_WIDTH,
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
  },
  productInfo: {
    padding: 10,
  },
  productName: {
    fontSize: 13,
    fontWeight: '600',
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
  },
  shopBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  shopBadgeText: {
    fontSize: 10,
  },
  empty: {
    alignItems: 'center',
    paddingTop: 40,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 4,
  },
  
  // Style Quiz
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  quizButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  quizButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  quizBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 12,
  },
  quizBannerText: {
    fontSize: 14,
  },
  quizBannerStyle: {
    fontWeight: 'bold',
  },
  quizBannerClear: {
    fontSize: 20,
    paddingHorizontal: 8,
  },
  
  // Budget Chips
  budgetChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 2,
  },
  budgetChipSelected: {},
  budgetChipText: {
    fontSize: 16,
    fontWeight: '600',
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
