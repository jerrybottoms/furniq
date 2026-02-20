// Permissions Hook - manages camera and media library permissions
import { useState, useEffect } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { Alert, Linking, Platform } from 'react-native';

interface PermissionState {
  camera: boolean;
  mediaLibrary: boolean;
  isLoading: boolean;
}

export function usePermissions() {
  const [permissions, setPermissions] = useState<PermissionState>({
    camera: false,
    mediaLibrary: false,
    isLoading: true,
  });

  useEffect(() => {
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    const cameraPermission = await ImagePicker.getCameraPermissionsAsync();
    const mediaPermission = await ImagePicker.getMediaLibraryPermissionsAsync();

    setPermissions({
      camera: cameraPermission.granted,
      mediaLibrary: mediaPermission.granted,
      isLoading: false,
    });
  };

  const requestCameraPermission = async (): Promise<boolean> => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert(
        'Kamera Zugriff benötigt',
        'Bitte erlaube den Kamerazugriff in den Einstellungen.',
        [
          { text: 'Abbrechen', style: 'cancel' },
          { text: 'Einstellungen', onPress: () => Linking.openSettings() },
        ]
      );
      return false;
    }
    
    setPermissions(prev => ({ ...prev, camera: true }));
    return true;
  };

  const requestMediaLibraryPermission = async (): Promise<boolean> => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert(
        'Fotomediathek Zugriff benötigt',
        'Bitte erlaube den Zugriff in den Einstellungen.',
        [
          { text: 'Abbrechen', style: 'cancel' },
          { text: 'Einstellungen', onPress: () => Linking.openSettings() },
        ]
      );
      return false;
    }
    
    setPermissions(prev => ({ ...prev, mediaLibrary: true }));
    return true;
  };

  return {
    permissions,
    requestCameraPermission,
    requestMediaLibraryPermission,
    checkPermissions,
  };
}
