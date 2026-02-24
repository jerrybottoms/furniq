// Home Screen - Redesigned mit Apple/Pinterest Style
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { typography, spacing, borderRadius, shadows } from '../theme';
import { ImageUtils } from '../utils/imageUtils';
import { usePermissions } from '../hooks/usePermissions';
import { addToHistory, getHistory, formatRelativeTime, HistoryItem } from '../services/history';
import { getBudget } from '../services/budget';
import { ImageAnalysisService } from '../services/imageAnalysis';
import { ProductSearchService } from '../services/productSearch';

interface HomeScreenProps {
  navigation: any;
}

interface SelectedImage {
  id: string;
  uri: string;
}

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const { theme } = useTheme();
  const [selectedImages, setSelectedImages] = useState<SelectedImage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [budgetMax, setBudgetMax] = useState<number | null>(null);
  
  const { requestCameraPermission, requestMediaLibraryPermission } = usePermissions();

  useEffect(() => {
    loadHistory();
    loadBudget();
  }, []);

  const loadHistory = async () => {
    const items = await getHistory();
    setHistory(items.slice(0, 3));
  };

  const loadBudget = async () => {
    const budget = await getBudget();
    if (budget.maxBudget !== null && budget.maxBudget > 0) {
      setBudgetMax(budget.maxBudget);
    }
  };

  const pickFromCamera = async () => {
    try {
      const hasPermission = await requestCameraPermission();
      if (!hasPermission) return;

      setIsProcessing(true);
      const result = await ImageUtils.pickFromCamera(true);

      if (!result.canceled && result.assets[0]) {
        const newImage: SelectedImage = {
          id: Date.now().toString(),
          uri: result.assets[0].uri,
        };
        setSelectedImages(prev => [...prev, newImage]);
      }
    } catch (error) {
      console.error('Error picking from camera:', error);
      Alert.alert('Fehler', 'Kamera konnte nicht geöffnet werden.');
    } finally {
      setIsProcessing(false);
    }
  };

  const pickFromGallery = async () => {
    try {
      const hasPermission = await requestMediaLibraryPermission();
      if (!hasPermission) return;

      setIsProcessing(true);
      const result = await ImageUtils.pickFromGallery(true);

      if (!result.canceled && result.assets[0]) {
        const newImage: SelectedImage = {
          id: Date.now().toString(),
          uri: result.assets[0].uri,
        };
        setSelectedImages(prev => [...prev, newImage]);
      }
    } catch (error) {
      console.error('Error picking from gallery:', error);
      Alert.alert('Fehler', 'Bild konnte nicht ausgewählt werden.');
    } finally {
      setIsProcessing(false);
    }
  };

  const pickMultipleFromGallery = async () => {
    try {
      const hasPermission = await requestMediaLibraryPermission();
      if (!hasPermission) return;

      setIsProcessing(true);
      const result = await ImageUtils.pickMultipleFromGallery();

      if (!result.canceled && result.assets.length > 0) {
        const newImages: SelectedImage[] = result.assets.map((asset, index) => ({
          id: (Date.now() + index).toString(),
          uri: asset.uri,
        }));
        setSelectedImages(prev => [...prev, ...newImages].slice(0, 5));
      }
    } catch (error) {
      console.error('Error picking multiple:', error);
      Alert.alert('Fehler', 'Bilder konnten nicht ausgewählt werden.');
    } finally {
      setIsProcessing(false);
    }
  };

  const removeImage = (id: string) => {
    setSelectedImages(prev => prev.filter(img => img.id !== id));
  };

  const analyzeImages = async () => {
    if (selectedImages.length === 0) {
      Alert.alert('Kein Bild', 'Bitte wähle zuerst ein Bild aus.');
      return;
    }

    setIsLoading(true);
    setStatusText('Bilder werden analysiert...');

    try {
      const primaryImage = selectedImages[0];
      
      setStatusText('Bild wird verarbeitet...');
      const processed = await ImageUtils.processForVisionAPI(primaryImage.uri);
      
      setStatusText('Möbel werden analysiert...');
      const analysis = await ImageAnalysisService.analyzeImage(processed.base64);
      
      setStatusText('Ähnliche Produkte werden gesucht...');
      const searchResult = await ProductSearchService.searchSimilarProducts(analysis);
      
      navigation.navigate('Results', {
        image: primaryImage.uri,
        analysis,
        products: searchResult.items,
        analyzedImages: selectedImages.length,
      });

      const query = searchResult.query || analysis.searchTerms?.[0] || `${analysis.category} ${analysis.style}`;
      await addToHistory(query, analysis, primaryImage.uri, searchResult.items.length);
      loadHistory();
    } catch (error: any) {
      console.error('Error analyzing images:', error);
      
      let errorMessage = 'Bild konnte nicht analysiert werden. Bitte erneut versuchen.';
      
      if (error?.message?.includes('network') || error?.message?.includes('fetch')) {
        errorMessage = 'Keine Internetverbindung. Bitte WLAN prüfen.';
      } else if (error?.message?.includes('API key') || error?.message?.includes('Unauthorized')) {
        errorMessage = 'API Fehler. Bitte später erneut versuchen.';
      } else if (error?.message?.includes('rate limit')) {
        errorMessage = 'Zu viele Anfragen. Bitte kurz warten.';
      }
      
      Alert.alert('Fehler', errorMessage, [
        { text: 'OK' },
        { text: 'Erneut versuchen', onPress: analyzeImages }
      ]);
    } finally {
      setIsLoading(false);
      setStatusText('');
    }
  };

  const renderImageThumbnail = ({ item }: { item: SelectedImage }) => (
    <View style={styles.thumbnailContainer}>
      <Image source={{ uri: item.uri }} style={styles.thumbnail} />
      <TouchableOpacity
        style={[styles.removeButton, { backgroundColor: theme.error }]}
        onPress={() => removeImage(item.id)}
      >
        <Text style={styles.removeButtonText}>×</Text>
      </TouchableOpacity>
    </View>
  );

  const renderHistoryItem = ({ item }: { item: HistoryItem }) => (
    <TouchableOpacity
      style={[styles.historyCard, { backgroundColor: theme.card }]}
      onPress={() => Alert.alert('Erinnerung', 'Diese Funktion kommt bald!')}
    >
      <View style={[styles.historyImage, { backgroundColor: theme.surface }]}>
        <Text style={styles.historyImageText}>📷</Text>
      </View>
      <View style={styles.historyContent}>
        <Text style={[styles.historyTitle, { color: theme.text }]} numberOfLines={1}>
          {item.query || `${item.category} • ${item.style}`}
        </Text>
        <Text style={[styles.historyMeta, { color: theme.textSecondary }]}>
          {item.productCount} Produkte • {formatRelativeTime(item.timestamp)}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <ScrollView 
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Text style={[styles.greeting, { color: theme.text }]}>
            Guten Morgen 👋
          </Text>
          <Text style={[styles.heroSubtitle, { color: theme.textSecondary }]}>
            Was suchst du heute?
          </Text>
        </View>

        {/* Action Tiles */}
        <View style={styles.actionTiles}>
          <TouchableOpacity
            style={[styles.actionTile, { backgroundColor: theme.primaryLight }]}
            onPress={pickFromCamera}
            disabled={isLoading || isProcessing}
          >
            <Text style={styles.actionTileIcon}>📸</Text>
            <Text style={[styles.actionTileLabel, { color: theme.primary }]}>Foto</Text>
            <Text style={[styles.actionTileSublabel, { color: theme.primaryPressed }]}>aufnehmen</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionTile, { backgroundColor: theme.surface }]}
            onPress={pickFromGallery}
            disabled={isLoading || isProcessing}
          >
            <Text style={styles.actionTileIcon}>🖼️</Text>
            <Text style={[styles.actionTileLabel, { color: theme.text }]}>Galerie</Text>
            <Text style={[styles.actionTileSublabel, { color: theme.textSecondary }]}>wählen</Text>
          </TouchableOpacity>
        </View>

        {/* Budget Indicator */}
        {budgetMax !== null && budgetMax > 0 && (
          <TouchableOpacity
            style={[styles.budgetBanner, { backgroundColor: theme.primary }]}
            onPress={() => navigation.navigate('Settings')}
          >
            <Text style={styles.budgetBannerIcon}>💰</Text>
            <Text style={styles.budgetBannerText}>
              Budget: max. {budgetMax}€ aktiv
            </Text>
          </TouchableOpacity>
        )}

        {/* Selected Images */}
        {selectedImages.length > 0 && (
          <View style={styles.selectedSection}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                Ausgewählt
              </Text>
              <TouchableOpacity onPress={() => setSelectedImages([])}>
                <Text style={[styles.clearText, { color: theme.error }]}>
                  Löschen
                </Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={selectedImages}
              renderItem={renderImageThumbnail}
              keyExtractor={item => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.imageList}
            />
            <Text style={[styles.imageCount, { color: theme.textSecondary }]}>
              {selectedImages.length} Bild(er) ausgewählt
            </Text>
          </View>
        )}

        {/* Status */}
        {statusText && (
          <View style={styles.statusContainer}>
            <ActivityIndicator size="small" color={theme.primary} />
            <Text style={[styles.statusText, { color: theme.textSecondary }]}>
              {statusText}
            </Text>
          </View>
        )}

        {/* Analyze Button */}
        {selectedImages.length > 0 && (
          <TouchableOpacity
            style={[styles.analyzeButton, { backgroundColor: theme.primary }]}
            onPress={analyzeImages}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <>
                <Text style={styles.analyzeButtonIcon}>🔍</Text>
                <Text style={styles.analyzeButtonText}>Ähnliche finden</Text>
              </>
            )}
          </TouchableOpacity>
        )}

        {/* Multi-select Button */}
        <TouchableOpacity
          style={[styles.multiButton, { backgroundColor: theme.surface }]}
          onPress={pickMultipleFromGallery}
          disabled={isLoading || isProcessing}
        >
          <Text style={[styles.multiButtonText, { color: theme.textSecondary }]}>
            ➕ Mehrere Bilder auswählen
          </Text>
        </TouchableOpacity>

        {/* Search History */}
        {history.length > 0 && (
          <View style={styles.historySection}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                Letzte Suchen
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate('SearchHistory')}>
                <Text style={[styles.seeAllText, { color: theme.primary }]}>
                  Alle →
                </Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={history}
              renderItem={renderHistoryItem}
              keyExtractor={item => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.historyList}
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingBottom: spacing.xxxl,
  },
  
  // Hero
  heroSection: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  greeting: {
    ...typography.title2,
  },
  heroSubtitle: {
    ...typography.body,
    marginTop: spacing.xxs,
  },
  
  // Action Tiles
  actionTiles: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  actionTile: {
    flex: 1,
    padding: spacing.lg,
    borderRadius: borderRadius.large,
    alignItems: 'center',
    ...shadows.card,
  },
  actionTileIcon: {
    fontSize: 32,
    marginBottom: spacing.xs,
  },
  actionTileLabel: {
    ...typography.headline,
    fontWeight: '600',
  },
  actionTileSubtitle: {
    ...typography.footnote,
  },
  
  // Budget
  budgetBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginHorizontal: spacing.md,
    borderRadius: borderRadius.medium,
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
  budgetBannerIcon: {
    fontSize: 16,
  },
  budgetBannerText: {
    ...typography.subhead,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  
  // Selected Images
  selectedSection: {
    marginBottom: spacing.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.xs,
  },
  sectionTitle: {
    ...typography.headline,
    fontWeight: '600',
  },
  clearText: {
    ...typography.subhead,
    fontWeight: '500',
  },
  seeAllText: {
    ...typography.subhead,
    fontWeight: '500',
  },
  imageList: {
    paddingHorizontal: spacing.md,
  },
  thumbnailContainer: {
    marginRight: spacing.xs,
    position: 'relative',
  },
  thumbnail: {
    width: 100,
    height: 100,
    borderRadius: borderRadius.medium,
  },
  removeButton: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: -2,
  },
  imageCount: {
    ...typography.footnote,
    paddingHorizontal: spacing.md,
    marginTop: spacing.xs,
  },
  
  // Status
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    gap: spacing.xs,
  },
  statusText: {
    ...typography.footnote,
  },
  
  // Analyze Button
  analyzeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    marginHorizontal: spacing.md,
    borderRadius: borderRadius.medium,
    gap: spacing.xs,
    ...shadows.elevated,
  },
  analyzeButtonIcon: {
    fontSize: 20,
  },
  analyzeButtonText: {
    ...typography.headline,
    color: '#FFFFFF',
  },
  
  // Multi Button
  multiButton: {
    paddingVertical: spacing.md,
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    borderRadius: borderRadius.medium,
    alignItems: 'center',
  },
  multiButtonText: {
    ...typography.subhead,
  },
  
  // History
  historySection: {
    marginTop: spacing.lg,
  },
  historyList: {
    paddingHorizontal: spacing.md,
  },
  historyCard: {
    width: 160,
    borderRadius: borderRadius.medium,
    overflow: 'hidden',
    marginRight: spacing.sm,
    ...shadows.card,
  },
  historyImage: {
    width: '100%',
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  historyImageText: {
    fontSize: 32,
  },
  historyContent: {
    padding: spacing.xs,
  },
  historyTitle: {
    ...typography.subhead,
    fontWeight: '600',
  },
  historyMeta: {
    ...typography.caption1,
    marginTop: 2,
  },
});
