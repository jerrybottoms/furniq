// ActionButton - Primary, Secondary, Text-only variants
import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { borderRadius, spacing, typography } from '../theme';

type ButtonVariant = 'primary' | 'secondary' | 'text' | 'destructive';

interface ActionButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: string;
  style?: ViewStyle;
}

export default function ActionButton({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  fullWidth = false,
  icon,
  style,
}: ActionButtonProps) {
  const { theme } = useTheme();

  const getContainerStyle = (): ViewStyle => {
    const base: ViewStyle = {
      ...styles.container,
    };

    if (fullWidth) {
      base.width = '100%';
    }

    switch (variant) {
      case 'primary':
        return {
          ...base,
          backgroundColor: disabled ? theme.textTertiary : theme.primary,
        };
      case 'secondary':
        return {
          ...base,
          backgroundColor: 'transparent',
          borderWidth: 2,
          borderColor: disabled ? theme.textTertiary : theme.primary,
        };
      case 'destructive':
        return {
          ...base,
          backgroundColor: disabled ? theme.textTertiary : theme.error,
        };
      case 'text':
        return {
          ...base,
          backgroundColor: 'transparent',
          paddingVertical: spacing.xs,
        };
      default:
        return base;
    }
  };

  const getTextStyle = (): TextStyle => {
    switch (variant) {
      case 'primary':
      case 'destructive':
        return {
          color: '#FFFFFF',
        };
      case 'secondary':
        return {
          color: disabled ? theme.textTertiary : theme.primary,
        };
      case 'text':
        return {
          color: disabled ? theme.textTertiary : theme.primary,
        };
      default:
        return {};
    }
  };

  return (
    <TouchableOpacity
      style={[getContainerStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'secondary' || variant === 'text' ? theme.primary : '#FFFFFF'}
        />
      ) : (
        <Text style={[styles.text, getTextStyle()]}>
          {icon ? `${icon} ${title}` : title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.medium,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  text: {
    ...typography.headline,
    textAlign: 'center',
  },
});
