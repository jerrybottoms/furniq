// Home Screen - Main camera/upload interface
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
import { AnalysisResult } from '../types';
import { ImageAnalysisService } from '../services/imageAnalysis';
import { ProductSearchService } from '../services/productSearch';
import { usePermissions } from '../hooks/usePermissions';
import { ImageUtils, ProcessedImage } from '../utils/imageUtils';
import { addToHistory, getHistory, formatRelativeTime, HistoryItem } from '../services/history';
import { getBudget } from '../services/budget';
import { useTheme } from '../context/ThemeContext';

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
  
  const { permissions, requestCameraPermission, requestMediaLibraryPermission } = usePermissions();

  // Load history and budget on mount
  useEffect(() => {
    loadHistory();
    loadBudget();
  }, []);

  const loadHistory = async () => {
    const items = await getHistory();
    setHistory(items.slice(0, 3)); // Show max 3
  };

  const loadBudget = async () => {
    const budget = await getBudget();
    if (budget.maxBudget !== null && budget.maxBudget > 0) {
      setBudgetMax(budget.maxBudget);
    }
  };

  // Pick image from camera with crop
  const pickFromCamera = async () => {
    try {
      const hasPermission = await requestCameraPermission();
      if (!hasPermission) return;

      setIsProcessing(true);
      const result = await ImageUtils.pickFromCamera(true); // allowCrop = true

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

  // Pick single image from gallery with crop
  const pickFromGallery = async () => {
    try {
      const hasPermission = await requestMediaLibraryPermission();
      if (!hasPermission) return;

      setIsProcessing(true);
      const result = await ImageUtils.pickFromGallery(true); // allowCrop = true

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

  // Pick multiple images from gallery (for future: multiple furniture items)
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
        setSelectedImages(prev => [...prev, ...newImages].slice(0, 5)); // Max 5 images
      }
    } catch (error) {
      console.error('Error picking multiple:', error);
      Alert.alert('Fehler', 'Bilder konnten nicht ausgewählt werden.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Remove image from selection
  const removeImage = (id: string) => {
    setSelectedImages(prev => prev.filter(img => img.id !== id));
  };

  // Analyze selected images
  const analyzeImages = async () => {
    if (selectedImages.length === 0) {
      Alert.alert('Kein Bild', 'Bitte wähle zuerst ein Bild aus.');
      return;
    }

    setIsLoading(true);
    setStatusText('Bilder werden analysiert...');

    try {
      // Process first image for MVP
      const primaryImage = selectedImages[0];
      
      setStatusText('Bild wird verarbeitet...');
      const processed = await ImageUtils.processForVisionAPI(primaryImage.uri);
      
      setStatusText('Möbel werden analysiert...');
      const analysis = await ImageAnalysisService.analyzeImage(processed.base64);
      
      setStatusText('Ähnliche Produkte werden gesucht...');
      const searchResult = await ProductSearchService.searchSimilarProducts(analysis);
      
      // Navigate to results
      navigation.navigate('Results', {
        image: primaryImage.uri,
        analysis,
        products: searchResult.items,
        analyzedImages: selectedImages.length,
      });

      // Save to history (local + Supabase if logged in)
      const query = searchResult.query || analysis.searchTerms?.[0] || `${analysis.category} ${analysis.style}`;
      await addToHistory(query, analysis, primaryImage.uri, searchResult.items.length);
      loadHistory(); // Refresh history list
    } catch (error: any) {
      console.error('Error analyzing images:', error);
      
      // Specific error messages
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

  // Render selected image thumbnail
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

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.surface }]} contentContainerStyle={styles.content}>
      <Text style={[styles.title, { color: theme.text }]}>🪑 Furniq</Text>
      <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
        Find similar furniture styles and shop the look
      </Text>

      {/* Budget Indicator */}
      {budgetMax !== null && budgetMax > 0 && (
        <TouchableOpacity
          style={[styles.budgetIndicator, { backgroundColor: theme.primary }]}
          onPress={() => navigation.navigate('Settings')}
        >
          <Text style={styles.budgetIndicatorIcon}>💰</Text>
          <Text style={styles.budgetIndicatorText}>
            Budget: max. {budgetMax}€ aktiv
          </Text>
        </TouchableOpacity>
      )}

      {/* Search History */}
      {history.length > 0 && (
        <View style={styles.historySection}>
          <View style={styles.historySectionHeader}>
            <Text style={[styles.historyTitle, { color: theme.text }]}>🕐 Letzte Suchen</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('SearchHistory')}
            >
              <Text style={[styles.showAllText, { color: theme.primary }]}>
                Alle anzeigen →
              </Text>
            </TouchableOpacity>
          </View>
          {history.slice(0, 3).map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.historyItem, { backgroundColor: theme.card, borderColor: theme.border }]}
              onPress={() => {
                // For now, just show alert - could navigate to saved results later
                Alert.alert('Erinnerung', 'Diese Funktion kommt bald!');
              }}
            >
              <View style={styles.historyItemContent}>
                <Text style={[styles.historyItemText, { color: theme.text }]}>
                  📷 {item.query || `${item.category} • ${item.style}`}
                </Text>
                <Text style={[styles.historyItemMeta, { color: theme.textSecondary }]}>
                  {item.productCount} Produkte • {formatRelativeTime(item.timestamp)}
                </Text>
              </View>
              <Text style={[styles.historyArrow, { color: theme.textSecondary }]}>→</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Selected Images Grid */}
      <View style={[styles.imageContainer, { backgroundColor: theme.border }]}>
        {selectedImages.length > 0 ? (
          <FlatList
            data={selectedImages}
            renderItem={renderImageThumbnail}
            keyExtractor={item => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.imageList}
          />
        ) : (
          <View style={styles.placeholder}>
            <Text style={[styles.placeholderText, { color: theme.textMuted }]}>
              📷 Take a photo or select an image
            </Text>
          </View>
        )}
      </View>

      {/* Status */}
      {statusText && (
        <View style={styles.statusContainer}>
          <ActivityIndicator size="small" color={theme.primary} />
          <Text style={[styles.statusText, { color: theme.textSecondary }]}>{statusText}</Text>
        </View>
      )}

      {/* Loading Overlay */}
      {isProcessing && (
        <View style={styles.processingOverlay}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.processingText, { color: theme.textSecondary }]}>Bild wird geladen...</Text>
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.cameraButton, { backgroundColor: theme.primary }]}
          onPress={pickFromCamera}
          disabled={isLoading || isProcessing}
        >
          <Text style={styles.buttonText}>📸 Take Photo</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.galleryButton, { backgroundColor: '#6B7280' }]}
          onPress={pickFromGallery}
          disabled={isLoading || isProcessing}
        >
          <Text style={styles.buttonText}>🖼️ Gallery</Text>
        </TouchableOpacity>
      </View>

      {/* Multi-select Button (for future use) */}
      <TouchableOpacity
        style={[styles.button, styles.multiButton, { backgroundColor: '#8B5CF6' }]}
        onPress={pickMultipleFromGallery}
        disabled={isLoading || isProcessing}
      >
        <Text style={styles.buttonText}>➕ Mehrere Bilder</Text>
      </TouchableOpacity>

      {/* Selected Images Count */}
      {selectedImages.length > 0 && (
        <Text style={[styles.imageCount, { color: theme.textSecondary }]}>
          {selectedImages.length} Bild(er) ausgewählt
        </Text>
      )}

      {/* Analyze Button */}
      {selectedImages.length > 0 && (
        <TouchableOpacity
          style={[styles.button, styles.analyzeButton, { backgroundColor: theme.success }]}
          onPress={analyzeImages}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <Text style={styles.buttonText}>🔍 Find Similar</Text>
          )}
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 40,
  },
  subtitle: {
    fontSize: 16,
    marginTop: 8,
    marginBottom: 24,
    textAlign: 'center',
  },
  budgetIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginBottom: 16,
    gap: 8,
  },
  budgetIndicatorIcon: {
    fontSize: 16,
  },
  budgetIndicatorText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1,
    maxWidth: 400,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
  },
  imageList: {
    padding: 10,
    alignItems: 'center',
  },
  thumbnailContainer: {
    marginHorizontal: 5,
    position: 'relative',
  },
  thumbnail: {
    width: 150,
    height: 150,
    borderRadius: 12,
  },
  removeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
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
  placeholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 16,
    textAlign: 'center',
    padding: 20,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusText: {
    marginLeft: 8,
    fontSize: 14,
  },
  processingOverlay: {
    padding: 20,
    alignItems: 'center',
  },
  processingText: {
    marginTop: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 140,
  },
  cameraButton: {},
  galleryButton: {},
  multiButton: {
    width: '100%',
    maxWidth: 292,
    marginBottom: 16,
  },
  analyzeButton: {
    width: '100%',
    maxWidth: 400,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  imageCount: {
    fontSize: 14,
    marginBottom: 12,
  },

  // History
  historySection: {
    marginTop: 16,
    marginBottom: 8,
  },
  historySectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  showAllText: {
    fontSize: 14,
    fontWeight: '500',
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
  },
  historyItemContent: {
    flex: 1,
  },
  historyItemText: {
    fontSize: 14,
    fontWeight: '500',
  },
  historyItemMeta: {
    fontSize: 12,
    marginTop: 2,
  },
  historyArrow: {
    fontSize: 16,
  },
});
