// Product Detail Screen - Redesigned mit Full-bleed Image
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Platform,
  Animated,
  StatusBar,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import * as WebBrowser from 'expo-web-browser';
import { Linking } from 'react-native';
import { getProductById, getSimilarProducts, FurnitureItem } from '../data/catalog';
import { useTheme } from '../context/ThemeContext';
import { PriceTrackerService, PriceAlert } from '../services/priceTracker';
import { shareProduct } from '../utils/share';
import { typography, spacing, borderRadius, shadows } from '../theme';

type RootStackParamList = {
  MainTabs: undefined;
  ProductDetail: { productId: string };
  Discover: undefined;
};

const { width } = Dimensions.get('window');

export default function ProductDetailScreen() {
  const { theme, isDark } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const route = useRoute<RouteProp<RootStackParamList, 'ProductDetail'>>();
  
  const productId = route.params?.productId;

  const [product, setProduct] = useState<FurnitureItem | null>(null);
  const [similarProducts, setSimilarProducts] = useState<FurnitureItem[]>([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [priceAlertActive, setPriceAlertActive] = useState(false);
  const [currentAlert, setCurrentAlert] = useState<PriceAlert | null>(null);
  const [targetPrice, setTargetPrice] = useState('');
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  
  const scrollY = useRef(new Animated.Value(0)).current;
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 200],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  useEffect(() => {
    if (!productId) return;
    const found = getProductById(productId);
    if (found) {
      setProduct(found);
      setSimilarProducts(getSimilarProducts(found, 6));
    }
  }, [productId]);

  useEffect(() => {
    if (productId) {
      checkExistingAlert();
    }
  }, [productId]);

  const checkExistingAlert = async () => {
    if (!productId) return;
    const alert = await PriceTrackerService.getAlertForProduct(productId);
    if (alert) {
      setCurrentAlert(alert);
      setPriceAlertActive(true);
      setTargetPrice(alert.targetPrice.toString());
    } else {
      setCurrentAlert(null);
      setPriceAlertActive(false);
      setTargetPrice('');
    }
  };

  const handleSaveAlert = async () => {
    if (!product || !targetPrice) return;
    const target = parseFloat(targetPrice.replace(',', '.'));
    if (isNaN(target) || target <= 0) return;
    
    try {
      const alert = await PriceTrackerService.addAlert(product, target);
      setCurrentAlert(alert);
      setPriceAlertActive(true);
      setShowAlertModal(false);
    } catch (error) {
      console.error('Error saving alert:', error);
    }
  };

  const handleDeleteAlert = async () => {
    if (!productId) return;
    try {
      await PriceTrackerService.deleteAlertForProduct(productId);
      setCurrentAlert(null);
      setPriceAlertActive(false);
      setTargetPrice('');
      setShowAlertModal(false);
    } catch (error) {
      console.error('Error deleting alert:', error);
    }
  };

  const openAlertModal = () => {
    if (priceAlertActive && currentAlert) {
      setTargetPrice(currentAlert.targetPrice.toString());
    } else if (product) {
      setTargetPrice(Math.floor(product.price * 0.8).toString());
    }
    setShowAlertModal(true);
  };

  if (!productId) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={{ color: theme.text }}>Keine Produkt-ID gefunden</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ color: theme.primary, marginTop: 10 }}>Zurück</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const handleOpenShop = async () => {
    if (product?.affiliateUrl) {
      await WebBrowser.openBrowserAsync(product.affiliateUrl);
    } else {
      const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(product?.name || '')}+${encodeURIComponent(product?.shop || '')}`;
      await WebBrowser.openBrowserAsync(searchUrl);
    }
  };

  const handleAmazonSearch = async () => {
    if (!product) return;
    const searchUrl = `https://www.amazon.de/s?k=${encodeURIComponent(product.name)}&tag=max0c62-21`;
    await Linking.openURL(searchUrl);
  };

  const handleShare = async () => {
    if (product) {
      try {
        await shareProduct(product);
      } catch (error) {
        console.log('Share error:', error);
      }
    }
  };

  const handleSimilarPress = (similarId: string) => {
    navigation.push('ProductDetail', { productId: similarId });
  };

  if (!product) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={{ color: theme.text }}>Produkt wird geladen...</Text>
      </SafeAreaView>
    );
  }

  const shopColor = theme.shopColors[product.shop] || '#666';

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} translucent backgroundColor="transparent" />
      
      {/* Animated Header */}
      <Animated.View style={[styles.header, { opacity: headerOpacity, backgroundColor: theme.card }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
          <Text style={[styles.headerIcon, { color: theme.text }]}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]} numberOfLines={1}>{product?.name}</Text>
        <TouchableOpacity onPress={handleShare} style={styles.headerButton}>
          <Text style={[styles.headerIcon, { color: theme.text }]}>↗</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Static Header */}
      <View style={styles.headerStatic}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.headerButton, { backgroundColor: theme.background }]}>
          <Text style={[styles.headerIconSolid, { color: theme.text }]}>←</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleShare} style={[styles.headerButton, { backgroundColor: theme.background }]}>
          <Text style={[styles.headerIconSolid, { color: theme.text }]}>↗</Text>
        </TouchableOpacity>
      </View>

      <Animated.ScrollView 
        style={[styles.scrollView, { backgroundColor: theme.background }]} 
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}>
        {/* Hero Image - Full Width */}
        <View style={[styles.heroContainer, { backgroundColor: theme.surface }]}>
          {Platform.OS === 'web' ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <View style={[styles.heroImagePlaceholder, { backgroundColor: shopColor }]}>
              <Text style={styles.heroPlaceholderText}>🛋️</Text>
            </View>
          )}
        </View>

        {/* Product Info */}
        <View style={[styles.infoContainer, { backgroundColor: theme.background }]}>
          {/* Shop Badge */}
          <View style={[styles.shopBadge, { backgroundColor: shopColor }]}>
            <Text style={[styles.shopBadgeText, { 
              color: product.shop === 'IKEA' ? '#000' : '#FFF' 
            }]}>
              {product.shop}
            </Text>
          </View>

          {/* Product Name */}
          <Text style={[styles.productName, { color: theme.text }]}>{product.name}</Text>

          {/* Style & Category */}
          <View style={styles.tagsRow}>
            <View style={[styles.tag, { backgroundColor: theme.surface }]}>
              <Text style={[styles.tagText, { color: theme.textSecondary }]}>{product.style}</Text>
            </View>
            <View style={[styles.tag, { backgroundColor: theme.surface }]}>
              <Text style={[styles.tagText, { color: theme.textSecondary }]}>{product.category}</Text>
            </View>
          </View>

          {/* Price */}
          <View style={styles.priceContainer}>
            <Text style={[styles.price, { color: theme.primary }]}>
              {product.price.toLocaleString('de-DE')} {product.currency}
            </Text>
            <Text style={[styles.priceSubtext, { color: theme.textTertiary }]}>inkl. MwSt.</Text>
          </View>

          {/* Description */}
          <View style={styles.descriptionSection}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Beschreibung</Text>
            <Text style={[styles.description, { color: theme.textSecondary }]} numberOfLines={descriptionExpanded ? undefined : 3}>
              {product.description || `Hochwertiges ${product.name} im ${product.style} Stil. 
              Perfekt für dein Zuhause. Exklusiv bei ${product.shop} erhältlich.
              
              • Modernes Design
              • Hochwertige Verarbeitung
              • Schnelle Lieferung`}
            </Text>
            <TouchableOpacity onPress={() => setDescriptionExpanded(!descriptionExpanded)}>
              <Text style={[styles.expandText, { color: theme.primary }]}>
                {descriptionExpanded ? 'Weniger anzeigen' : 'Mehr anzeigen'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Similar Products */}
          {similarProducts.length > 0 && (
            <View style={styles.similarSection}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Ähnliche Produkte</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.similarScroll}
              >
                {similarProducts.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.similarCard, { backgroundColor: theme.card }, shadows.card]}
                    onPress={() => handleSimilarPress(item.id)}
                  >
                    <View style={[styles.similarImage, { backgroundColor: theme.surface }]}>
                      {Platform.OS === 'web' ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <Text style={styles.similarPlaceholder}>📷</Text>
                      )}
                    </View>
                    <Text style={[styles.similarName, { color: theme.text }]} numberOfLines={1}>{item.name}</Text>
                    <Text style={[styles.similarPrice, { color: theme.primary }]}>
                      {item.price} {item.currency}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>

        <View style={{ height: 120 }} />
      </Animated.ScrollView>

      {/* Sticky Action Bar */}
      <View style={[styles.actionBar, { backgroundColor: theme.card, borderTopColor: theme.separator }]}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => setIsFavorite(!isFavorite)}
        >
          <Text style={[styles.actionIcon, isFavorite && { color: theme.error }]}>
            {isFavorite ? '❤️' : '♡'}
          </Text>
          <Text style={[styles.actionLabel, { color: theme.textSecondary }]}>Merken</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionButton, priceAlertActive && { opacity: 1 }]}
          onPress={openAlertModal}
        >
          <Text style={styles.actionIcon}>{priceAlertActive ? '🔔' : '🔕'}</Text>
          <Text style={[styles.actionLabel, { color: priceAlertActive ? theme.primary : theme.textSecondary }]}>
            {priceAlertActive ? 'Alarm an' : 'Preisalarm'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.ctaButton, { backgroundColor: theme.primary }]} onPress={handleOpenShop}>
          <Text style={styles.ctaButtonText}>🛒 Zum Shop</Text>
        </TouchableOpacity>

        {product.shop === 'Amazon' && (
          <TouchableOpacity style={[styles.amazonButton, { backgroundColor: '#FF9900' }]} onPress={handleAmazonSearch}>
            <Text style={styles.amazonButtonText}>🔍</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Price Alert Modal */}
      <Modal
        visible={showAlertModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAlertModal(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowAlertModal(false)}>
          <KeyboardAvoidingView behavior="padding" style={styles.modalContainer}>
            <Pressable style={[styles.modalContent, { backgroundColor: theme.card }]} onPress={() => {}}>
              <View style={styles.modalHandle} />
              
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                {priceAlertActive ? 'Preis-Alarm bearbeiten' : 'Preis-Alarm setzen'}
              </Text>
              
              {product && (
                <View style={[styles.modalProductInfo, { backgroundColor: theme.surface }]}>
                  <Text style={[styles.modalProductName, { color: theme.text }]} numberOfLines={2}>
                    {product.name}
                  </Text>
                  <Text style={[styles.modalProductPrice, { color: theme.primary }]}>
                    Aktuell: {product.price} {product.currency}
                  </Text>
                </View>
              )}

              {priceAlertActive && currentAlert && (
                <View style={[styles.alertInfoBox, { backgroundColor: theme.primaryLight, borderColor: theme.primary }]}>
                  <Text style={[styles.alertInfoText, { color: theme.primary }]}>
                    🔔 Alarm aktiv für {currentAlert.targetPrice}€
                  </Text>
                  {currentAlert.triggered && (
                    <Text style={[styles.alertTriggeredText, { color: theme.error }]}>
                      ⚠️ Zielpreis erreicht!
                    </Text>
                  )}
                </View>
              )}

              <Text style={[styles.modalLabel, { color: theme.textSecondary }]}>
                Wunschpreis
              </Text>
              
              <View style={styles.modalInputRow}>
                <TextInput
                  style={[styles.modalInput, { backgroundColor: theme.surface, borderColor: theme.separator, color: theme.text }]}
                  value={targetPrice}
                  onChangeText={setTargetPrice}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor={theme.textTertiary}
                />
                <Text style={[styles.modalInputSuffix, { color: theme.textSecondary }]}>€</Text>
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonSecondary, { borderColor: theme.separator }]}
                  onPress={() => setShowAlertModal(false)}
                >
                  <Text style={[styles.modalButtonText, { color: theme.text }]}>Abbrechen</Text>
                </TouchableOpacity>
                
                {priceAlertActive ? (
                  <TouchableOpacity
                    style={[styles.modalButton, styles.modalButtonDanger, { backgroundColor: theme.error }]}
                    onPress={handleDeleteAlert}
                  >
                    <Text style={[styles.modalButtonText, { color: '#FFF' }]}>Löschen</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={[styles.modalButton, styles.modalButtonPrimary, { backgroundColor: theme.primary }]}
                    onPress={handleSaveAlert}
                  >
                    <Text style={[styles.modalButtonText, { color: '#FFF' }]}>Alarm setzen</Text>
                  </TouchableOpacity>
                )}
              </View>
            </Pressable>
          </KeyboardAvoidingView>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: 48,
    paddingBottom: spacing.sm,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  headerStatic: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: 48,
    paddingBottom: spacing.sm,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 5,
  },
  headerTitle: {
    flex: 1,
    ...typography.headline,
    textAlign: 'center',
    marginHorizontal: spacing.sm,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerIcon: {
    fontSize: 24,
  },
  headerIconSolid: {
    fontSize: 22,
  },
  
  scrollView: { flex: 1 },
  
  // Hero
  heroContainer: {
    width: width,
    height: width * 0.8,
  },
  heroImagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroPlaceholderText: {
    fontSize: 80,
  },
  
  // Info
  infoContainer: {
    padding: spacing.lg,
    paddingTop: spacing.lg,
  },
  shopBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: borderRadius.small,
    marginBottom: spacing.sm,
  },
  shopBadgeText: {
    ...typography.caption1,
    fontWeight: '600',
  },
  productName: {
    ...typography.title1,
    marginBottom: spacing.sm,
  },
  tagsRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  tag: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: borderRadius.small,
  },
  tagText: {
    ...typography.caption1,
  },
  priceContainer: {
    marginBottom: spacing.lg,
  },
  price: {
    ...typography.title1,
    color: '#1A5F5A',
  },
  priceSubtext: {
    ...typography.footnote,
    marginTop: 2,
  },
  
  // Description
  descriptionSection: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.title3,
    marginBottom: spacing.sm,
  },
  description: {
    ...typography.body,
    lineHeight: 24,
  },
  expandText: {
    ...typography.subhead,
    fontWeight: '500',
    marginTop: spacing.xs,
  },
  
  // Similar
  similarSection: {
    marginBottom: spacing.md,
  },
  similarScroll: {
    paddingRight: spacing.lg,
  },
  similarCard: {
    width: 130,
    marginRight: spacing.sm,
    borderRadius: borderRadius.medium,
    overflow: 'hidden',
  },
  similarImage: {
    width: '100%',
    height: 100,
  },
  similarPlaceholder: {
    fontSize: 32,
    textAlign: 'center',
    paddingTop: 32,
  },
  similarName: {
    ...typography.caption1,
    fontWeight: '500',
    paddingHorizontal: spacing.xs,
    paddingTop: spacing.xs,
  },
  similarPrice: {
    ...typography.caption1,
    fontWeight: '700',
    paddingHorizontal: spacing.xs,
    paddingBottom: spacing.xs,
  },
  
  // Action Bar
  actionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    paddingBottom: 28,
    borderTopWidth: 1,
    ...shadows.modal,
  },
  actionButton: {
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  actionIcon: {
    fontSize: 20,
    marginBottom: 2,
  },
  actionLabel: {
    ...typography.caption2,
  },
  ctaButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.medium,
    alignItems: 'center',
    marginLeft: spacing.sm,
    ...shadows.elevated,
  },
  ctaButtonText: {
    ...typography.headline,
    color: '#FFFFFF',
  },
  amazonButton: {
    width: 48,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.medium,
    alignItems: 'center',
    marginLeft: spacing.xs,
  },
  amazonButtonText: {
    fontSize: 20,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: borderRadius.large,
    borderTopRightRadius: borderRadius.large,
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#888',
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },
  modalTitle: {
    ...typography.title2,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  modalProductInfo: {
    padding: spacing.sm,
    borderRadius: borderRadius.medium,
    marginBottom: spacing.md,
  },
  modalProductName: {
    ...typography.subhead,
    fontWeight: '600',
    marginBottom: spacing.xxs,
  },
  modalProductPrice: {
    ...typography.headline,
    color: '#1A5F5A',
  },
  alertInfoBox: {
    padding: spacing.sm,
    borderRadius: borderRadius.small,
    borderWidth: 1,
    marginBottom: spacing.md,
    alignItems: 'center',
  },
  alertInfoText: {
    ...typography.subhead,
    fontWeight: '600',
  },
  alertTriggeredText: {
    ...typography.caption1,
    fontWeight: '500',
    marginTop: spacing.xxs,
  },
  modalLabel: {
    ...typography.subhead,
    marginBottom: spacing.xs,
  },
  modalInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  modalInput: {
    flex: 1,
    height: 52,
    borderRadius: borderRadius.medium,
    paddingHorizontal: spacing.md,
    ...typography.title2,
    borderWidth: 1,
  },
  modalInputSuffix: {
    ...typography.title2,
    marginLeft: spacing.sm,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  modalButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.medium,
    alignItems: 'center',
  },
  modalButtonPrimary: {},
  modalButtonSecondary: {
    borderWidth: 1,
  },
  modalButtonDanger: {},
  modalButtonText: {
    ...typography.headline,
  },
});
