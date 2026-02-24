// Discover Screen - Redesigned mit Apple/Pinterest Style
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { STYLES, CATEGORIES, getFilteredCatalog, FurnitureStyle, FurnitureCategory, FurnitureItem } from '../data/catalog';
import { StyleProfileService } from '../services/styleProfile';
import { PriceTrackerService } from '../services/priceTracker';
import { getBudget } from '../services/budget';
import { useTheme } from '../context/ThemeContext';
import { typography, spacing, borderRadius, shadows } from '../theme';

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
const COLUMN_WIDTH = (width - spacing.md * 3) / 2;

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

  useEffect(() => {
    const loadPreferences = async () => {
      const styles = await StyleProfileService.getTopStyles(3);
      setRecommendedStyles(styles);
      
      const quiz = await StyleProfileService.getQuizStyle();
      if (quiz) {
        setQuizStyle(quiz);
        setSelectedStyle(quiz);
      }
      
      const tracked = await PriceTrackerService.getTrackedProducts();
      setTrackedIds(new Set(tracked.map(t => t.id)));
      
      const budget = await getBudget();
      if (budget.maxBudget !== null && budget.maxBudget > 0) {
        setGlobalBudgetMax(budget.maxBudget);
      }
    };
    loadPreferences();
  }, []);

  const filteredProducts = useMemo(() => {
    let min: number | undefined;
    let max: number | undefined;
    
    if (selectedBudget) {
      min = selectedBudget.min;
      max = selectedBudget.max;
    } else if (customPriceRange.min || customPriceRange.max) {
      min = customPriceRange.min ? parseInt(customPriceRange.min, 10) : undefined;
      max = customPriceRange.max ? parseInt(customPriceRange.max, 10) : undefined;
    } else if (globalBudgetMax !== null && globalBudgetMax > 0) {
      max = globalBudgetMax;
    }
    
    return getFilteredCatalog(
      selectedStyle || undefined,
      selectedCategory || undefined,
      min,
      max
    );
  }, [selectedStyle, selectedCategory, selectedBudget, customPriceRange, globalBudgetMax]);

  const openProduct = (item: FurnitureItem) => {
    navigation.navigate('ProductDetail' as any, { productId: item.id });
  };

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
          isSelected && { backgroundColor: theme.primary },
          !isSelected && isRecommended && { backgroundColor: isDark ? '#3D3426' : '#FFF3E0', borderWidth: 1, borderColor: isDark ? '#5D4E37' : '#FFB74D' },
          !isSelected && !isRecommended && { backgroundColor: theme.surface },
        ]}
        onPress={() => toggleStyle(style as FurnitureStyle)}
      >
        <Text style={[
          styles.chipText,
          isSelected && { color: '#FFFFFF' },
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
          isSelected && { backgroundColor: theme.primary },
          !isSelected && { backgroundColor: theme.surface },
        ]}
        onPress={() => toggleCategory(category as FurnitureCategory)}
      >
        <Text style={[
          styles.chipText,
          isSelected && { color: '#FFFFFF' },
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
        style={[styles.productCard, { backgroundColor: theme.card }, shadows.card]}
        onPress={() => openProduct(item)}
        activeOpacity={0.7}
      >
        <View style={[styles.imageContainer, { backgroundColor: theme.surface }]}>
          <Image
            source={{ uri: item.imageUrl }}
            style={styles.productImage}
          />
          
          {/* Track Button */}
          <TouchableOpacity
            style={[styles.trackButton, { backgroundColor: theme.background }]}
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
        </View>
        
        <View style={styles.productInfo}>
          <Text style={[styles.shopText, { color: theme.textTertiary }]}>
            {item.shop}
          </Text>
          <Text style={[styles.productName, { color: theme.text }]} numberOfLines={2}>
            {item.name}
          </Text>
          <Text style={[styles.productPrice, { color: theme.primary }]}>
            {item.price} {item.currency}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      {/* Header with Large Title */}
      <View style={styles.header}>
        <Text style={[styles.largeTitle, { color: theme.text }]}>Entdecken</Text>
        <Text style={[styles.resultCount, { color: theme.textSecondary }]}>
          {filteredProducts.length} Produkte
        </Text>
      </View>

      {/* Quiz Banner */}
      {quizStyle && (
        <TouchableOpacity
          style={[styles.quizBanner, { backgroundColor: theme.primaryLight }]}
          onPress={() => setSelectedStyle(null)}
        >
          <Text style={[styles.quizBannerText, { color: theme.primary }]}>
            ✓ Dein Stil: <Text style={styles.quizBannerStyle}>{quizStyle}</Text>
          </Text>
          <Text style={[styles.quizBannerClear, { color: theme.primary }]}>×</Text>
        </TouchableOpacity>
      )}

      {/* Filters ScrollView */}
      <ScrollView
        style={[styles.filtersContainer, { backgroundColor: theme.background }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Recommended Styles */}
        {recommendedStyles.length > 0 && (
          <View style={styles.filterSection}>
            <Text style={[styles.filterLabel, { color: theme.textSecondary }]}>
              ⭐ Für dich
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.chipRow}>
                {recommendedStyles.map(style => renderStyleChip(style))}
              </View>
            </ScrollView>
          </View>
        )}

        {/* Style Chips */}
        <View style={styles.filterSection}>
          <Text style={[styles.filterLabel, { color: theme.textSecondary }]}>Stil</Text>
          <View style={styles.chipRow}>
            {STYLES.map(style => renderStyleChip(style))}
          </View>
        </View>

        {/* Category Chips */}
        <View style={styles.filterSection}>
          <Text style={[styles.filterLabel, { color: theme.textSecondary }]}>Kategorie</Text>
          <View style={styles.chipRow}>
            {CATEGORIES.map(category => renderCategoryChip(category))}
          </View>
        </View>

        {/* Budget Chips */}
        <View style={styles.filterSection}>
          <Text style={[styles.filterLabel, { color: theme.textSecondary }]}>💰 Budget</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.chipRow}>
              {BUDGET_OPTIONS.map((budget) => {
                const isSelected = selectedBudget?.label === budget.label;
                return (
                  <TouchableOpacity
                    key={budget.label}
                    style={[
                      styles.budgetChip,
                      isSelected && { backgroundColor: theme.primary, borderColor: theme.primary },
                      !isSelected && { backgroundColor: theme.surface, borderColor: theme.separator },
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
                      isSelected && { color: '#FFFFFF' },
                      !isSelected && { color: theme.text },
                    ]}>
                      {budget.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
          
          {(!selectedBudget || selectedBudget.label === 'Alle') && (
            <View style={styles.customPriceRow}>
              <TextInput
                style={[styles.priceInput, { backgroundColor: theme.surface, borderColor: theme.separator, color: theme.text }]}
                placeholder="Min €"
                placeholderTextColor={theme.textTertiary}
                keyboardType="numeric"
                value={customPriceRange.min}
                onChangeText={(text) => {
                  setCustomPriceRange(prev => ({ ...prev, min: text }));
                  setSelectedBudget(null);
                }}
              />
              <Text style={[styles.priceSeparator, { color: theme.textSecondary }]}>—</Text>
              <TextInput
                style={[styles.priceInput, { backgroundColor: theme.surface, borderColor: theme.separator, color: theme.text }]}
                placeholder="Max €"
                placeholderTextColor={theme.textTertiary}
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

        {/* Global Budget Badge */}
        {globalBudgetMax !== null && globalBudgetMax > 0 && !selectedBudget && !customPriceRange.min && !customPriceRange.max && (
          <View style={[styles.globalBudgetBadge, { backgroundColor: theme.primary }]}>
            <Text style={styles.globalBudgetText}>💰 bis {globalBudgetMax}€</Text>
          </View>
        )}
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
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>🔍</Text>
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              Keine Produkte gefunden
            </Text>
            <Text style={[styles.emptySubtext, { color: theme.textTertiary }]}>
              Versuche andere Filter
            </Text>
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
  
  // Header
  header: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  largeTitle: {
    ...typography.largeTitle,
  },
  resultCount: {
    ...typography.subhead,
    marginTop: spacing.xxs,
  },
  
  // Quiz Banner
  quizBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginHorizontal: spacing.md,
    borderRadius: borderRadius.medium,
    marginBottom: spacing.sm,
  },
  quizBannerText: {
    ...typography.subhead,
  },
  quizBannerStyle: {
    fontWeight: '700',
  },
  quizBannerClear: {
    fontSize: 20,
    fontWeight: '600',
    paddingHorizontal: spacing.xs,
  },
  
  // Filters
  filtersContainer: {
    maxHeight: 260,
  },
  filterSection: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  filterLabel: {
    ...typography.footnote,
    fontWeight: '500',
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  chip: {
    paddingHorizontal: spacing.sm + 4,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.full,
  },
  chipCategory: {},
  chipSelected: {},
  chipText: {
    ...typography.subhead,
  },
  
  // Budget
  budgetChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.full,
    marginRight: spacing.xs,
    borderWidth: 1,
  },
  budgetChipText: {
    ...typography.subhead,
    fontWeight: '600',
  },
  customPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  priceInput: {
    flex: 1,
    height: 40,
    borderRadius: borderRadius.small,
    paddingHorizontal: spacing.sm,
    fontSize: 14,
    borderWidth: 1,
  },
  priceSeparator: {
    marginHorizontal: spacing.sm,
  },
  globalBudgetBadge: {
    alignSelf: 'flex-start',
    marginLeft: spacing.md,
    marginTop: spacing.xs,
    paddingVertical: spacing.xxs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.small,
  },
  globalBudgetText: {
    ...typography.caption1,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  
  // Product Grid
  productList: {
    padding: spacing.md,
    paddingTop: spacing.sm,
  },
  productCard: {
    width: COLUMN_WIDTH,
    borderRadius: borderRadius.medium,
    marginRight: spacing.sm,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: COLUMN_WIDTH * 0.7,
  },
  trackButton: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.card,
  },
  trackButtonIcon: {
    fontSize: 14,
  },
  productInfo: {
    padding: spacing.sm,
  },
  shopText: {
    ...typography.caption2,
    marginBottom: 2,
  },
  productName: {
    ...typography.subhead,
    fontWeight: '600',
    marginBottom: spacing.xxs,
    height: 36,
  },
  productPrice: {
    ...typography.body,
    fontWeight: '700',
  },
  
  // Empty
  emptyContainer: {
    alignItems: 'center',
    paddingTop: spacing.xxxl,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: spacing.sm,
  },
  emptyText: {
    ...typography.headline,
  },
  emptySubtext: {
    ...typography.subhead,
    marginTop: spacing.xxs,
  },
});
