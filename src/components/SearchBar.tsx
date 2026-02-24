// SearchBar - Apple-Style Suchfeld
import React from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { borderRadius, spacing, typography } from '../theme';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onSubmit?: () => void;
  onClear?: () => void;
  autoFocus?: boolean;
  editable?: boolean;
}

export default function SearchBar({
  value,
  onChangeText,
  placeholder = 'Suchen...',
  onSubmit,
  onClear,
  autoFocus = false,
  editable = true,
}: SearchBarProps) {
  const { theme } = useTheme();

  const handleClear = () => {
    onChangeText('');
    onClear?.();
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.surface }]}>
      {/* Search Icon */}
      <Text style={styles.searchIcon}>🔍</Text>
      
      {/* Input */}
      <TextInput
        style={[styles.input, { color: theme.text }]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.textTertiary}
        returnKeyType="search"
        onSubmitEditing={onSubmit}
        autoFocus={autoFocus}
        editable={editable}
        autoCapitalize="none"
        autoCorrect={false}
      />
      
      {/* Clear Button */}
      {value.length > 0 && editable && (
        <TouchableOpacity
          style={styles.clearButton}
          onPress={handleClear}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <View style={[styles.clearIcon, { backgroundColor: theme.textTertiary }]}>
            <Text style={styles.clearIconText}>×</Text>
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.medium,
    marginHorizontal: spacing.md,
    marginVertical: spacing.xs,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: spacing.xs,
  },
  input: {
    flex: 1,
    ...typography.body,
    paddingVertical: spacing.xs,
  },
  clearButton: {
    marginLeft: spacing.xs,
  },
  clearIcon: {
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearIconText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginTop: -1,
  },
});
