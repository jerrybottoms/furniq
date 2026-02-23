// Quiz Option Component - Single option for Style Quiz
import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, View, Platform } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const OPTION_WIDTH = 160;
const IMAGE_HEIGHT = 100;

interface QuizOptionProps {
  imageUrl: string;
  label: string;
  isSelected: boolean;
  onPress: () => void;
}

export default function QuizOption({ imageUrl, label, isSelected, onPress }: QuizOptionProps) {
  const { theme } = useTheme();
  const [imageError, setImageError] = useState(false);

  if (Platform.OS === 'web') {
    return (
      <TouchableOpacity
        style={[
          styles.container,
          { backgroundColor: theme.surface, borderColor: isSelected ? theme.primary : 'transparent' },
        ]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        {imageError ? (
          <View style={[styles.imagePlaceholder, styles.image, { backgroundColor: theme.border }]}>
            <Text style={styles.placeholderText}>📷</Text>
          </View>
        ) : (
          <img
            src={imageUrl}
            alt={label}
            style={{ width: '100%', height: IMAGE_HEIGHT, objectFit: 'cover' as const }}
            onError={() => setImageError(true)}
          />
        )}
        <View style={[styles.labelContainer, isSelected && { backgroundColor: theme.primary }]}>
          <Text style={[styles.label, { color: isSelected ? '#FFF' : theme.text }]} numberOfLines={2}>
            {label}
          </Text>
        </View>
        {isSelected && (
          <View style={[styles.checkmark, { backgroundColor: theme.primary }]}>
            <Text style={styles.checkmarkText}>✓</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  }

  const { Image } = require('react-native');
  return (
    <TouchableOpacity
      style={[
        styles.container,
        { backgroundColor: theme.surface, borderColor: isSelected ? theme.primary : 'transparent' },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />
      <View style={[styles.labelContainer, isSelected && { backgroundColor: theme.primary }]}>
        <Text style={[styles.label, { color: isSelected ? '#FFF' : theme.text }]} numberOfLines={2}>
          {label}
        </Text>
      </View>
      {isSelected && (
        <View style={[styles.checkmark, { backgroundColor: theme.primary }]}>
          <Text style={styles.checkmarkText}>✓</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: OPTION_WIDTH,
    margin: 6,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
  },
  image: {
    width: '100%',
    height: IMAGE_HEIGHT,
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: { fontSize: 32 },
  labelContainer: { padding: 10, alignItems: 'center' },
  label: { fontSize: 13, fontWeight: '600', textAlign: 'center' },
  checkmark: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: { color: '#FFF', fontSize: 14, fontWeight: 'bold' },
});
