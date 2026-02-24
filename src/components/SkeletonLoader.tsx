// SkeletonLoader - Shimmer-Platzhalter für Loading States
import React, { useEffect, useRef } from 'react';
import {
  View,
  Animated,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { borderRadius, spacing } from '../theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - spacing.md * 3) / 2;

interface SkeletonLoaderProps {
  type?: 'card' | 'list' | 'detail';
  count?: number;
}

export default function SkeletonLoader({
  type = 'card',
  count = 4,
}: SkeletonLoaderProps) {
  const { theme } = useTheme();
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shimmer = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    shimmer.start();
    return () => shimmer.stop();
  }, [shimmerAnim]);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  const baseColor = theme.isDark ? '#3C3C3E' : '#E5E5EA';
  const highlightColor = theme.isDark ? '#4A4A4C' : '#F2F2F7';

  if (type === 'list') {
    return (
      <View style={styles.listContainer}>
        {Array.from({ length: count }).map((_, index) => (
          <Animated.View
            key={index}
            style={[
              styles.listItem,
              { backgroundColor: baseColor },
              { opacity },
            ]}
          >
            <Animated.View
              style={[
                styles.listThumbnail,
                { backgroundColor: highlightColor },
                { opacity },
              ]}
            />
            <View style={styles.listContent}>
              <Animated.View
                style={[
                  styles.listTitle,
                  { backgroundColor: highlightColor },
                  { opacity },
                ]}
              />
              <Animated.View
                style={[
                  styles.listSubtitle,
                  { backgroundColor: highlightColor },
                  { opacity },
                ]}
              />
            </View>
          </Animated.View>
        ))}
      </View>
    );
  }

  if (type === 'detail') {
    return (
      <View style={styles.detailContainer}>
        <Animated.View
          style={[
            styles.detailImage,
            { backgroundColor: baseColor },
            { opacity },
          ]}
        />
        <View style={styles.detailContent}>
          <Animated.View
            style={[
              styles.detailTitle,
              { backgroundColor: baseColor },
              { opacity },
            ]}
          />
          <Animated.View
            style={[
              styles.detailSubtitle,
              { backgroundColor: baseColor },
              { opacity },
            ]}
          />
          <Animated.View
            style={[
              styles.detailPrice,
              { backgroundColor: baseColor },
              { opacity },
            ]}
          />
        </View>
      </View>
    );
  }

  // Default: Card grid
  return (
    <View style={styles.gridContainer}>
      {Array.from({ length: count }).map((_, index) => (
        <Animated.View
          key={index}
          style={[
            styles.card,
            { backgroundColor: theme.card },
            { opacity },
          ]}
        >
          <Animated.View
            style={[
              styles.cardImage,
              { backgroundColor: baseColor },
              { opacity },
            ]}
          />
          <View style={styles.cardContent}>
            <Animated.View
              style={[
                styles.cardShop,
                { backgroundColor: baseColor },
                { opacity },
              ]}
            />
            <Animated.View
              style={[
                styles.cardTitle,
                { backgroundColor: baseColor },
                { opacity },
              ]}
            />
            <Animated.View
              style={[
                styles.cardPrice,
                { backgroundColor: baseColor },
                { opacity },
              ]}
            />
          </View>
        </Animated.View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  // Grid (Card)
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
  },
  card: {
    width: CARD_WIDTH,
    borderRadius: borderRadius.medium,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  cardImage: {
    width: '100%',
    height: CARD_WIDTH * 0.7,
  },
  cardContent: {
    padding: spacing.sm,
  },
  cardShop: {
    width: 40,
    height: 10,
    borderRadius: 4,
    marginBottom: spacing.xxs,
  },
  cardTitle: {
    width: '80%',
    height: 14,
    borderRadius: 4,
    marginBottom: spacing.xxs,
  },
  cardPrice: {
    width: 50,
    height: 16,
    borderRadius: 4,
  },

  // List
  listContainer: {
    padding: spacing.md,
  },
  listItem: {
    flexDirection: 'row',
    borderRadius: borderRadius.medium,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  listThumbnail: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.small,
  },
  listContent: {
    flex: 1,
    marginLeft: spacing.sm,
    justifyContent: 'center',
  },
  listTitle: {
    width: '70%',
    height: 14,
    borderRadius: 4,
    marginBottom: spacing.xs,
  },
  listSubtitle: {
    width: '40%',
    height: 12,
    borderRadius: 4,
  },

  // Detail
  detailContainer: {
    flex: 1,
  },
  detailImage: {
    width: '100%',
    height: 300,
  },
  detailContent: {
    padding: spacing.lg,
  },
  detailTitle: {
    width: '80%',
    height: 24,
    borderRadius: 4,
    marginBottom: spacing.sm,
  },
  detailSubtitle: {
    width: '60%',
    height: 16,
    borderRadius: 4,
    marginBottom: spacing.lg,
  },
  detailPrice: {
    width: 100,
    height: 28,
    borderRadius: 4,
  },
});
