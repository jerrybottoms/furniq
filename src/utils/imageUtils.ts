// Image Utilities - compression, base64 conversion, size checking
import * as ImagePicker from 'expo-image-picker';
import { Dimensions } from 'react-native';

// Max dimensions for Vision API (2048px is safe)
const MAX_DIMENSION = 2048;

export interface ProcessedImage {
  uri: string;
  base64: string;
  width: number;
  height: number;
  fileSize: number;
}

export class ImageUtils {
  /**
   * Pick single image from camera with crop support
   */
  static async pickFromCamera(allowCrop: boolean = true): Promise<ImagePicker.ImagePickerResult> {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: allowCrop,
      aspect: undefined, // Free crop (user can choose)
      quality: 1, // High quality first, compress later
    });
    return result;
  }

  /**
   * Pick single image from gallery with crop support
   */
  static async pickFromGallery(allowCrop: boolean = true): Promise<ImagePicker.ImagePickerResult> {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: allowCrop,
      aspect: undefined, // Free crop
      quality: 1,
      selectionLimit: 1,
    });
    return result;
  }

  /**
   * Pick multiple images from gallery (for future: multiple furniture items)
   */
  static async pickMultipleFromGallery(): Promise<ImagePicker.ImagePickerResult> {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false, // No crop for multi-select
      quality: 0.8,
      selectionLimit: 5, // Max 5 images
    });
    return result;
  }

  /**
   * Process image for Vision API - compress if needed
   */
  static async processForVisionAPI(imageUri: string): Promise<ProcessedImage> {
    // For now, we'll skip the resize check and directly convert
    // In production, you'd use expo-file-system to get image info
    
    const width = 0;
    const height = 0;
    const fileSize = 0;

    // Convert to base64
    const base64 = await this.uriToBase64(imageUri);

    return {
      uri: imageUri,
      base64,
      width,
      height,
      fileSize,
    };
  }

  /**
   * Convert URI to base64 string
   */
  static async uriToBase64(uri: string): Promise<string> {
    const response = await fetch(uri);
    const blob = await response.blob();
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = (reader.result as string).split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  /**
   * Get image dimensions - placeholder for future implementation
   */
  static getDimensions(uri: string): Promise<{ width: number; height: number }> {
    return new Promise((resolve) => {
      const { width, height } = Dimensions.get('window');
      resolve({ width, height });
    });
  }

  /**
   * Format file size for display
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}
