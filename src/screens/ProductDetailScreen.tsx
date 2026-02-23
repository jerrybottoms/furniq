// Product Detail Screen - Shop-like product page
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
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import * as WebBrowser from 'expo-web-browser';
import { Linking } from 'react-native';
import { getProductById, getSimilarProducts, FurnitureItem } from '../data/catalog';
import { useTheme } from '../context/ThemeContext';
import { PriceTrackerService, PriceAlert } from '../services/priceTracker';
import { shareProduct } from '../utils/share';

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
  
  // Handle case where params might be undefined
  const productId = route.params?.productId;

  const [product, setProduct] = useState<FurnitureItem | null>(null);
  const [similarProducts, setSimilarProducts] = useState<FurnitureItem[]>([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [priceAlertActive, setPriceAlertActive] = useState(false);
  const [currentAlert, setCurrentAlert] = useState<PriceAlert | null>(null);
  const [targetPrice, setTargetPrice] = useState('');
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  
  // Animated header
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

  // Check for existing alert when product loads
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
      setTargetPrice(Math.floor(product.price * 0.8).toString()); // Default 20% less
    }
    setShowAlertModal(true);
  };

  if (!productId) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <Text style={{ color: theme.text }}>Keine Produkt-ID gefunden</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ color: theme.primary, marginTop: 10 }}>Zurück</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleOpenShop = async () => {
    if (product?.affiliateUrl) {
      await WebBrowser.openBrowserAsync(product.affiliateUrl);
    } else {
      // Fallback: open search for the product
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
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <Text style={{ color: theme.text }}>Produkt wird geladen...</Text>
      </View>
    );
  }

  const shopColor = theme.shopColors[product.shop] || '#666';

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} translucent backgroundColor="transparent" />
      
      {/* Animated Header */}
      <Animated.View style={[styles.header, { opacity: headerOpacity, backgroundColor: theme.card }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={[styles.backButtonTextSolid, { color: theme.text }]}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]} numberOfLines={1}>{product?.name}</Text>
        <TouchableOpacity onPress={handleShare} style={styles.shareButton}>
          <Text style={[styles.shareButtonTextSolid, { color: theme.text }]}>↗</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Static Header (visible at top) */}
      <View style={[styles.headerStatic, { backgroundColor: 'transparent' }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backButton, { backgroundColor: isDark ? 'rgba(30,30,30,0.9)' : 'rgba(255,255,255,0.9)' }]}>
          <Text style={[styles.backButtonText, { color: theme.text }]}>←</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleShare} style={[styles.shareButton, { backgroundColor: isDark ? 'rgba(30,30,30,0.9)' : 'rgba(255,255,255,0.9)' }]}>
          <Text style={[styles.shareButtonText, { color: theme.text }]}>↗</Text>
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
        {/* Hero Image */}
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
            <Text style={[styles.priceSubtext, { color: theme.textMuted }]}>inkl. MwSt.</Text>
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
                    style={[styles.similarCard, { backgroundColor: theme.card }]}
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

        {/* Bottom spacing for sticky button */}
        <View style={{ height: 100 }} />
      </Animated.ScrollView>

      {/* Sticky Action Bar */}
      <View style={[styles.actionBar, { backgroundColor: theme.card, borderTopColor: theme.border }]}>
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
            <Text style={styles.amazonButtonText}>🔍 Auf Amazon suchen</Text>
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
                <View style={[styles.alertInfoBox, { backgroundColor: theme.primary + '20', borderColor: theme.primary }]}>
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
                Wunschpreis (wird benachrichtigt wenn Preis sinkt)
              </Text>
              
              <View style={styles.modalInputRow}>
                <TextInput
                  style={[styles.modalInput, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }]}
                  value={targetPrice}
                  onChangeText={setTargetPrice}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor={theme.textMuted}
                />
                <Text style={[styles.modalInputSuffix, { color: theme.textSecondary }]}>€</Text>
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonSecondary, { borderColor: theme.border }]}
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
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 12,
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
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 12,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 5,
  },
  headerTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginHorizontal: 8,
  },
  backButtonTextSolid: {
    fontSize: 24,
  },
  shareButtonTextSolid: {
    fontSize: 24,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backButtonText: {
    fontSize: 24,
  },
  shareButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  shareButtonText: {
    fontSize: 20,
  },
  scrollView: {
    flex: 1,
  },
  heroContainer: {
    width: width,
    height: width * 0.75,
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
  infoContainer: {
    padding: 20,
    paddingTop: 24,
  },
  shopBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: 12,
  },
  shopBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  productName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  tagsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  tagText: {
    fontSize: 12,
  },
  priceContainer: {
    marginBottom: 24,
  },
  price: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  priceSubtext: {
    fontSize: 12,
    marginTop: 2,
  },
  descriptionSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
  },
  expandText: {
    fontSize: 14,
    marginTop: 8,
    fontWeight: '500',
  },
  similarSection: {
    marginBottom: 24,
  },
  similarScroll: {
    paddingRight: 20,
  },
  similarCard: {
    width: 130,
    marginRight: 12,
    borderRadius: 12,
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
    fontSize: 12,
    fontWeight: '500',
    paddingHorizontal: 8,
    paddingTop: 8,
  },
  similarPrice: {
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
  actionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 28,
    borderTopWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  actionButton: {
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  actionButtonActive: {
    // Active state
  },
  actionIcon: {
    fontSize: 20,
    marginBottom: 2,
  },
  actionIconActive: {
    // Active state
  },
  actionLabel: {
    fontSize: 11,
  },
  actionLabelActive: {
    fontWeight: '500',
  },
  ctaButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginLeft: 16,
  },
  ctaButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  amazonButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginLeft: 8,
  },
  amazonButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#888',
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalProductInfo: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  modalProductName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  modalProductPrice: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  alertInfoBox: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
    alignItems: 'center',
  },
  alertInfoText: {
    fontSize: 14,
    fontWeight: '600',
  },
  alertTriggeredText: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
  },
  modalLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  modalInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalInput: {
    flex: 1,
    height: 52,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 20,
    fontWeight: '600',
    borderWidth: 1,
  },
  modalInputSuffix: {
    fontSize: 20,
    marginLeft: 12,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalButtonPrimary: {
    // backgroundColor set dynamically
  },
  modalButtonSecondary: {
    borderWidth: 1,
  },
  modalButtonDanger: {
    // backgroundColor set dynamically
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
