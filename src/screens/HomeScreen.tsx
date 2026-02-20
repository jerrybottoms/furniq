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
  Modal,
} from 'react-native';
import { AnalysisResult } from '../types';
import { ImageAnalysisService } from '../services/imageAnalysis';
import { ProductSearchService } from '../services/productSearch';
import { usePermissions } from '../hooks/usePermissions';
import { ImageUtils, ProcessedImage } from '../utils/imageUtils';
import { addToHistory, getHistory, formatRelativeTime, HistoryItem } from '../services/history';

interface HomeScreenProps {
  navigation: any;
}

interface SelectedImage {
  id: string;
  uri: string;
}

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const [selectedImages, setSelectedImages] = useState<SelectedImage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  
  const { permissions, requestCameraPermission, requestMediaLibraryPermission } = usePermissions();

  // Load history on mount
  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    const items = await getHistory();
    setHistory(items.slice(0, 5)); // Show max 5
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
        style={styles.removeButton}
        onPress={() => removeImage(item.id)}
      >
        <Text style={styles.removeButtonText}>×</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>🪑 Furniq</Text>
      <Text style={styles.subtitle}>
        Find similar furniture styles and shop the look
      </Text>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity
          style={styles.quickActionButton}
          onPress={() => navigation.navigate('Favorites')}
        >
          <Text style={styles.quickActionIcon}>❤️</Text>
          <Text style={styles.quickActionText}>Favoriten</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.quickActionButton}
          onPress={() => navigation.navigate('Auth', { mode: 'signin' })}
        >
          <Text style={styles.quickActionIcon}>👤</Text>
          <Text style={styles.quickActionText}>Anmelden</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.quickActionButton}
          onPress={() => navigation.navigate('Settings')}
        >
          <Text style={styles.quickActionIcon}>⚙️</Text>
          <Text style={styles.quickActionText}>Einstellungen</Text>
        </TouchableOpacity>
      </View>

      {/* Search History */}
      {history.length > 0 && (
        <View style={styles.historySection}>
          <Text style={styles.historyTitle}>🕐 Letzte Suchen</Text>
          {history.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.historyItem}
              onPress={() => {
                // For now, just show alert - could navigate to saved results later
                Alert.alert('Erinnerung', 'Diese Funktion kommt bald!');
              }}
            >
              <View style={styles.historyItemContent}>
                <Text style={styles.historyItemText}>
                  📷 {item.query || `${item.category} • ${item.style}`}
                </Text>
                <Text style={styles.historyItemMeta}>
                  {item.productCount} Produkte • {formatRelativeTime(item.timestamp)}
                </Text>
              </View>
              <Text style={styles.historyArrow}>→</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Selected Images Grid */}
      <View style={styles.imageContainer}>
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
            <Text style={styles.placeholderText}>
              📷 Take a photo or select an image
            </Text>
          </View>
        )}
      </View>

      {/* Status */}
      {statusText && (
        <View style={styles.statusContainer}>
          <ActivityIndicator size="small" color="#1A5F5A" />
          <Text style={styles.statusText}>{statusText}</Text>
        </View>
      )}

      {/* Loading Overlay */}
      {isProcessing && (
        <View style={styles.processingOverlay}>
          <ActivityIndicator size="large" color="#1A5F5A" />
          <Text style={styles.processingText}>Bild wird geladen...</Text>
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.cameraButton]}
          onPress={pickFromCamera}
          disabled={isLoading || isProcessing}
        >
          <Text style={styles.buttonText}>📸 Take Photo</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.galleryButton]}
          onPress={pickFromGallery}
          disabled={isLoading || isProcessing}
        >
          <Text style={styles.buttonText}>🖼️ Gallery</Text>
        </TouchableOpacity>
      </View>

      {/* Multi-select Button (for future use) */}
      <TouchableOpacity
        style={[styles.button, styles.multiButton]}
        onPress={pickMultipleFromGallery}
        disabled={isLoading || isProcessing}
      >
        <Text style={styles.buttonText}>➕ Mehrere Bilder</Text>
      </TouchableOpacity>

      {/* Selected Images Count */}
      {selectedImages.length > 0 && (
        <Text style={styles.imageCount}>
          {selectedImages.length} Bild(er) ausgewählt
        </Text>
      )}

      {/* Analyze Button */}
      {selectedImages.length > 0 && (
        <TouchableOpacity
          style={[styles.button, styles.analyzeButton]}
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
    backgroundColor: '#F5F5F5',
  },
  content: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 40,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
    marginBottom: 24,
    textAlign: 'center',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 20,
  },
  quickActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    gap: 6,
  },
  quickActionIcon: {
    fontSize: 16,
  },
  quickActionText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1,
    maxWidth: 400,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
    backgroundColor: '#E0E0E0',
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
    backgroundColor: '#FF4444',
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
    color: '#999',
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
    color: '#666',
    fontSize: 14,
  },
  processingOverlay: {
    padding: 20,
    alignItems: 'center',
  },
  processingText: {
    marginTop: 10,
    color: '#666',
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
  cameraButton: {
    backgroundColor: '#1A5F5A',
  },
  galleryButton: {
    backgroundColor: '#6B7280',
  },
  multiButton: {
    backgroundColor: '#8B5CF6',
    width: '100%',
    maxWidth: 292,
    marginBottom: 16,
  },
  analyzeButton: {
    backgroundColor: '#10B981',
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
    color: '#666',
    marginBottom: 12,
  },

  // History
  historySection: {
    marginTop: 16,
    marginBottom: 8,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  historyItemContent: {
    flex: 1,
  },
  historyItemText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  historyItemMeta: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  historyArrow: {
    fontSize: 16,
    color: '#999',
  },
});
