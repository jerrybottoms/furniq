// Quiz Option Component - Single option for Style Quiz
import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, View, Platform } from 'react-native';

// Fixed dimensions for web compatibility
const OPTION_WIDTH = 160;
const IMAGE_HEIGHT = 100;

interface QuizOptionProps {
  imageUrl: string;
  label: string;
  isSelected: boolean;
  onPress: () => void;
}

export default function QuizOption({ imageUrl, label, isSelected, onPress }: QuizOptionProps) {
  const [imageError, setImageError] = useState(false);

  // For web, use img tag directly
  if (Platform.OS === 'web') {
    return (
      <TouchableOpacity
        style={[styles.container, isSelected && styles.selected]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        {imageError ? (
          <View style={[styles.imagePlaceholder, styles.image]}>
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
        <View style={[styles.labelContainer, isSelected && styles.labelSelected]}>
          <Text style={[styles.label, isSelected && styles.labelTextSelected]} numberOfLines={2}>
            {label}
          </Text>
        </View>
        {isSelected && (
          <View style={styles.checkmark}>
            <Text style={styles.checkmarkText}>✓</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  }

  // For native, use Image component
  const { Image } = require('react-native');
  return (
    <TouchableOpacity
      style={[styles.container, isSelected && styles.selected]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Image
        source={{ uri: imageUrl }}
        style={styles.image}
        resizeMode="cover"
      />
      <View style={[styles.labelContainer, isSelected && styles.labelSelected]}>
        <Text style={[styles.label, isSelected && styles.labelTextSelected]} numberOfLines={2}>
          {label}
        </Text>
      </View>
      {isSelected && (
        <View style={styles.checkmark}>
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
    backgroundColor: '#F5F5F5',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selected: {
    borderColor: '#1A5F5A',
  },
  image: {
    width: '100%',
    height: IMAGE_HEIGHT,
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    backgroundColor: '#DDD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 32,
  },
  labelContainer: {
    padding: 10,
    alignItems: 'center',
  },
  labelSelected: {
    backgroundColor: '#1A5F5A',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  labelTextSelected: {
    color: '#FFF',
  },
  checkmark: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#1A5F5A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
