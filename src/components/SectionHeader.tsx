// SectionHeader - Konsistente Sektions-Überschriften
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { spacing, typography } from '../theme';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  actionText?: string;
  onActionPress?: () => void;
  variant?: 'default' | 'large';
}

export default function SectionHeader({
  title,
  subtitle,
  actionText,
  onActionPress,
  variant = 'default',
}: SectionHeaderProps) {
  const { theme } = useTheme();

  if (variant === 'large') {
    return (
      <View style={styles.largeContainer}>
        <Text style={[styles.largeTitle, { color: theme.text }]}>
          {title}
        </Text>
        {subtitle && (
          <Text style={[styles.largeSubtitle, { color: theme.textSecondary }]}>
            {subtitle}
          </Text>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Text style={[styles.title, { color: theme.text }]}>
          {title}
        </Text>
        {subtitle && (
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            {subtitle}
          </Text>
        )}
      </View>
      
      {actionText && onActionPress && (
        <TouchableOpacity onPress={onActionPress} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={[styles.actionText, { color: theme.primary }]}>
            {actionText}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    ...typography.headline,
    fontWeight: '600',
  },
  subtitle: {
    ...typography.footnote,
    marginTop: 2,
  },
  actionText: {
    ...typography.subhead,
    fontWeight: '500',
  },
  largeContainer: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  largeTitle: {
    ...typography.title1,
  },
  largeSubtitle: {
    ...typography.subhead,
    marginTop: spacing.xxs,
  },
});
