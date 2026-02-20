// Product Detail Screen - Shop-like product page
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Share,
  Platform,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import * as WebBrowser from 'expo-web-browser';
import { getProductById, getSimilarProducts, FurnitureItem } from '../data/catalog';

type RootStackParamList = {
  MainTabs: undefined;
  ProductDetail: { productId: string };
  Discover: undefined;
};

const { width } = Dimensions.get('window');

export default function ProductDetailScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const route = useRoute<RouteProp<RootStackParamList, 'ProductDetail'>>();
  
  // Handle case where params might be undefined
  const productId = route.params?.productId;
  
  if (!productId) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Keine Produkt-ID gefunden</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ color: '#1A5F5A', marginTop: 10 }}>Zurück</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const [product, setProduct] = useState<FurnitureItem | null>(null);
  const [similarProducts, setSimilarProducts] = useState<FurnitureItem[]>([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [priceAlert, setPriceAlert] = useState(false);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);

  useEffect(() => {
    const found = getProductById(productId);
    if (found) {
      setProduct(found);
      setSimilarProducts(getSimilarProducts(found, 6));
    }
  }, [productId]);

  const handleOpenShop = async () => {
    if (product?.affiliateUrl) {
      await WebBrowser.openBrowserAsync(product.affiliateUrl);
    } else {
      // Fallback: open search for the product
      const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(product?.name || '')}+${encodeURIComponent(product?.shop || '')}`;
      await WebBrowser.openBrowserAsync(searchUrl);
    }
  };

  const handleShare = async () => {
    if (product) {
      try {
        await Share.share({
          message: `Schau dir ${product.name} bei ${product.shop} an! ${product.price} ${product.currency}`,
          title: product.name,
        });
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
      <View style={styles.loadingContainer}>
        <Text>Produkt wird geladen...</Text>
      </View>
    );
  }

  const shopColors: Record<string, string> = {
    'IKEA': '#FFDA1C',
    'home24': '#FF6B6B',
    'Otto': '#FF6600',
    'XXXLutz': '#FF0000',
    'Westwing': '#2D2D2D',
    'Mömax': '#00A651',
    'Etsy': '#F56400',
  };

  const shopColor = shopColors[product.shop] || '#666';

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleShare} style={styles.shareButton}>
          <Text style={styles.shareButtonText}>↗</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Hero Image */}
        <View style={styles.heroContainer}>
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
        <View style={styles.infoContainer}>
          {/* Shop Badge */}
          <View style={[styles.shopBadge, { backgroundColor: shopColor }]}>
            <Text style={[styles.shopBadgeText, { 
              color: product.shop === 'IKEA' ? '#000' : '#FFF' 
            }]}>
              {product.shop}
            </Text>
          </View>

          {/* Product Name */}
          <Text style={styles.productName}>{product.name}</Text>

          {/* Style & Category */}
          <View style={styles.tagsRow}>
            <View style={styles.tag}>
              <Text style={styles.tagText}>{product.style}</Text>
            </View>
            <View style={styles.tag}>
              <Text style={styles.tagText}>{product.category}</Text>
            </View>
          </View>

          {/* Price */}
          <View style={styles.priceContainer}>
            <Text style={styles.price}>
              {product.price.toLocaleString('de-DE')} {product.currency}
            </Text>
            <Text style={styles.priceSubtext}>inkl. MwSt.</Text>
          </View>

          {/* Description */}
          <View style={styles.descriptionSection}>
            <Text style={styles.sectionTitle}>Beschreibung</Text>
            <Text style={styles.description} numberOfLines={descriptionExpanded ? undefined : 3}>
              {product.description || `Hochwertiges ${product.name} im ${product.style} Stil. 
              Perfekt für dein Zuhause. Exklusiv bei ${product.shop} erhältlich.
              
              • Modernes Design
              • Hochwertige Verarbeitung
              • Schnelle Lieferung`}
            </Text>
            <TouchableOpacity onPress={() => setDescriptionExpanded(!descriptionExpanded)}>
              <Text style={styles.expandText}>
                {descriptionExpanded ? 'Weniger anzeigen' : 'Mehr anzeigen'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Similar Products */}
          {similarProducts.length > 0 && (
            <View style={styles.similarSection}>
              <Text style={styles.sectionTitle}>Ähnliche Produkte</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.similarScroll}
              >
                {similarProducts.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.similarCard}
                    onPress={() => handleSimilarPress(item.id)}
                  >
                    <View style={styles.similarImage}>
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
                    <Text style={styles.similarName} numberOfLines={1}>{item.name}</Text>
                    <Text style={styles.similarPrice}>
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
      </ScrollView>

      {/* Sticky Action Bar */}
      <View style={styles.actionBar}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => setIsFavorite(!isFavorite)}
        >
          <Text style={[styles.actionIcon, isFavorite && styles.actionIconActive]}>
            {isFavorite ? '❤️' : '♡'}
          </Text>
          <Text style={styles.actionLabel}>Merken</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionButton, priceAlert && styles.actionButtonActive]}
          onPress={() => setPriceAlert(!priceAlert)}
        >
          <Text style={styles.actionIcon}>{priceAlert ? '🔔' : '🔕'}</Text>
          <Text style={[styles.actionLabel, priceAlert && styles.actionLabelActive]}>
            {priceAlert ? 'Alarm an' : 'Preisalarm'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.ctaButton} onPress={handleOpenShop}>
          <Text style={styles.ctaButtonText}>🛒 Zum Shop</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
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
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.9)',
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
    color: '#333',
  },
  shareButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.9)',
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
    color: '#333',
  },
  scrollView: {
    flex: 1,
  },
  heroContainer: {
    width: width,
    height: width * 0.75,
    backgroundColor: '#F5F5F5',
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
    color: '#1A1A1A',
    marginBottom: 12,
  },
  tagsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  tag: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  tagText: {
    fontSize: 12,
    color: '#666',
  },
  priceContainer: {
    marginBottom: 24,
  },
  price: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A5F5A',
  },
  priceSubtext: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  descriptionSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    color: '#666',
    lineHeight: 22,
  },
  expandText: {
    fontSize: 14,
    color: '#1A5F5A',
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
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    overflow: 'hidden',
  },
  similarImage: {
    width: '100%',
    height: 100,
    backgroundColor: '#EEE',
  },
  similarPlaceholder: {
    fontSize: 32,
    textAlign: 'center',
    paddingTop: 32,
  },
  similarName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333',
    paddingHorizontal: 8,
    paddingTop: 8,
  },
  similarPrice: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1A5F5A',
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
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#EEE',
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
    color: '#666',
  },
  actionLabelActive: {
    color: '#1A5F5A',
    fontWeight: '500',
  },
  ctaButton: {
    flex: 1,
    backgroundColor: '#1A5F5A',
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
});
