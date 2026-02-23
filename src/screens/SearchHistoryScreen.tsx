// Search History Screen - Zeigt alle Suchanfragen
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { getHistory, clearHistory, deleteEntry, formatRelativeTime, HistoryItem } from '../services/history';

interface SearchHistoryScreenProps {
  navigation: any;
}

export default function SearchHistoryScreen({ navigation }: SearchHistoryScreenProps) {
  const { theme } = useTheme();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadHistory = async () => {
    try {
      const items = await getHistory();
      setHistory(items);
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  // Load on mount and when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadHistory();
  };

  // Handle delete single entry
  const handleDeleteEntry = (id: string) => {
    Alert.alert(
      'Eintrag löschen',
      'Möchtest du diesen Eintrag wirklich löschen?',
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Löschen',
          style: 'destructive',
          onPress: async () => {
            await deleteEntry(id);
            loadHistory();
          },
        },
      ]
    );
  };

  // Handle clear all history
  const handleClearAll = () => {
    Alert.alert(
      'Verlauf löschen',
      'Möchtest du den gesamten Suchverlauf löschen?',
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Alles löschen',
          style: 'destructive',
          onPress: async () => {
            await clearHistory();
            loadHistory();
          },
        },
      ]
    );
  };

  // Handle tap on entry - navigate to results (re-run search)
  const handleEntryPress = (item: HistoryItem) => {
    // For now, show alert - the ResultsScreen needs image/analysis data
    // which isn't stored in history. Could implement "saved results" later.
    Alert.alert(
      'Suche wiederholen',
      `Suche nach "${item.query || `${item.category} • ${item.style}`}" erneut ausführen?`,
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'OK',
          onPress: () => {
            // Navigate back to home - user can re-analyze the image
            navigation.goBack();
          },
        },
      ]
    );
  };

  // Render empty state
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>📭</Text>
      <Text style={[styles.emptyTitle, { color: theme.text }]}>Kein Suchverlauf</Text>
      <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
        Deine bisherigen Suchen werden hier angezeigt.
      </Text>
    </View>
  );

  // Render history item
  const renderHistoryItem = ({ item }: { item: HistoryItem }) => (
    <TouchableOpacity
      style={[styles.historyItem, { backgroundColor: theme.card, borderColor: theme.border }]}
      onPress={() => handleEntryPress(item)}
      onLongPress={() => handleDeleteEntry(item.id)}
    >
      <View style={styles.historyItemContent}>
        <Text style={[styles.historyItemText, { color: theme.text }]}>
          📷 {item.query || `${item.category} • ${item.style}`}
        </Text>
        <View style={styles.historyItemMeta}>
          <Text style={[styles.historyItemMetaText, { color: theme.textSecondary }]}>
            {item.productCount} Produkte
          </Text>
          <Text style={[styles.historyItemMetaDot, { color: theme.textMuted }]}>•</Text>
          <Text style={[styles.historyItemMetaText, { color: theme.textSecondary }]}>
            {formatRelativeTime(item.timestamp)}
          </Text>
        </View>
      </View>
      
      <View style={styles.historyItemActions}>
        <TouchableOpacity
          style={[styles.deleteButton, { backgroundColor: theme.error + '20' }]}
          onPress={() => handleDeleteEntry(item.id)}
        >
          <Text style={[styles.deleteButtonText, { color: theme.error }]}>🗑️</Text>
        </TouchableOpacity>
        <Text style={[styles.historyArrow, { color: theme.textSecondary }]}>→</Text>
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header Actions */}
      {history.length > 0 && (
        <View style={[styles.headerActions, { borderBottomColor: theme.border }]}>
          <Text style={[styles.historyCount, { color: theme.textSecondary }]}>
            {history.length} Suchen
          </Text>
          <TouchableOpacity
            style={[styles.clearAllButton, { backgroundColor: theme.error + '15' }]}
            onPress={handleClearAll}
          >
            <Text style={[styles.clearAllText, { color: theme.error }]}>
              Alles löschen
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* History List */}
      <FlatList
        data={history}
        renderItem={renderHistoryItem}
        keyExtractor={item => item.id}
        contentContainerStyle={history.length === 0 ? styles.emptyList : styles.list}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.primary}
            colors={[theme.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
      />

      {/* Info Text */}
      {history.length > 0 && (
        <View style={[styles.infoContainer, { backgroundColor: theme.surface }]}>
          <Text style={[styles.infoText, { color: theme.textMuted }]}>
            Tippe auf einen Eintrag um die Suche zu wiederholen.{'\n'}
            Lange drücken oder 🗑️ zum Löschen.
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  historyCount: {
    fontSize: 14,
  },
  clearAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  clearAllText: {
    fontSize: 14,
    fontWeight: '600',
  },
  list: {
    padding: 16,
  },
  emptyList: {
    flex: 1,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
  },
  historyItemContent: {
    flex: 1,
  },
  historyItemText: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 4,
  },
  historyItemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  historyItemMetaText: {
    fontSize: 12,
  },
  historyItemMetaDot: {
    fontSize: 12,
    marginHorizontal: 6,
  },
  historyItemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  deleteButton: {
    padding: 8,
    borderRadius: 8,
  },
  deleteButtonText: {
    fontSize: 16,
  },
  historyArrow: {
    fontSize: 18,
    marginLeft: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  infoContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  infoText: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
});
