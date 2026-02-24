// Search History Screen — Clean List mit Thumbnails
import React, { useState, useCallback } from 'react';
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
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { getHistory, clearHistory, deleteEntry, formatRelativeTime, HistoryItem } from '../services/history';
import { typography, spacing, borderRadius, shadows } from '../theme';

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

  useFocusEffect(
    useCallback(() => { loadHistory(); }, [])
  );

  const onRefresh = () => { setRefreshing(true); loadHistory(); };

  const handleDeleteEntry = (id: string) => {
    Alert.alert(
      'Eintrag löschen',
      'Möchtest du diesen Eintrag wirklich löschen?',
      [
        { text: 'Abbrechen', style: 'cancel' },
        { text: 'Löschen', style: 'destructive', onPress: async () => { await deleteEntry(id); loadHistory(); } },
      ]
    );
  };

  const handleClearAll = () => {
    Alert.alert(
      'Verlauf löschen',
      'Möchtest du den gesamten Suchverlauf löschen?',
      [
        { text: 'Abbrechen', style: 'cancel' },
        { text: 'Alles löschen', style: 'destructive', onPress: async () => { await clearHistory(); loadHistory(); } },
      ]
    );
  };

  const handleEntryPress = (item: HistoryItem) => {
    Alert.alert(
      'Suche wiederholen',
      `Suche nach "${item.query || `${item.category} • ${item.style}`}" erneut ausführen?`,
      [
        { text: 'Abbrechen', style: 'cancel' },
        { text: 'OK', onPress: () => navigation.goBack() },
      ]
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>📭</Text>
      <Text style={[styles.emptyTitle, { color: theme.text }]}>Kein Suchverlauf</Text>
      <Text style={[styles.emptySub, { color: theme.textSecondary }]}>
        Deine bisherigen Suchen werden hier angezeigt.
      </Text>
    </View>
  );

  const renderItem = ({ item }: { item: HistoryItem }) => (
    <TouchableOpacity
      style={[styles.item, { backgroundColor: theme.card }, shadows.card]}
      onPress={() => handleEntryPress(item)}
      onLongPress={() => handleDeleteEntry(item.id)}
      activeOpacity={0.75}
    >
      {/* Thumbnail placeholder */}
      <View style={[styles.thumb, { backgroundColor: theme.surface }]}>
        <Text style={styles.thumbIcon}>📷</Text>
      </View>

      {/* Content */}
      <View style={styles.itemContent}>
        <Text style={[styles.itemText, { color: theme.text }]} numberOfLines={1}>
          {item.query || `${item.category} • ${item.style}`}
        </Text>
        <Text style={[styles.itemMeta, { color: theme.textSecondary }]}>
          {item.productCount} Produkte · {formatRelativeTime(item.timestamp)}
        </Text>
      </View>

      {/* Actions */}
      <TouchableOpacity
        style={[styles.deleteBtn, { backgroundColor: theme.error + '18' }]}
        onPress={() => handleDeleteEntry(item.id)}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Text style={[styles.deleteBtnIcon, { color: theme.error }]}>🗑️</Text>
      </TouchableOpacity>
      <Text style={[styles.arrow, { color: theme.textSecondary }]}>›</Text>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
        <Text style={[styles.largeTitle, { color: theme.text }]}>Suchverlauf</Text>
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      {/* Page header */}
      <View style={styles.pageHeader}>
        <Text style={[styles.largeTitle, { color: theme.text }]}>Suchverlauf</Text>
        {history.length > 0 && (
          <TouchableOpacity
            style={[styles.clearAllBtn, { backgroundColor: theme.error + '18' }]}
            onPress={handleClearAll}
          >
            <Text style={[styles.clearAllText, { color: theme.error }]}>Alles löschen</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={history}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={history.length === 0 ? styles.emptyList : styles.list}
        ListEmptyComponent={renderEmpty}
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

      {history.length > 0 && (
        <View style={[styles.hint, { backgroundColor: theme.surface }]}>
          <Text style={[styles.hintText, { color: theme.textMuted }]}>
            Tippe zum Wiederholen · Lang drücken oder 🗑️ zum Löschen
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  pageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  largeTitle: {
    fontSize: 34,
    fontWeight: '700',
    letterSpacing: 0.37,
  },
  clearAllBtn: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  clearAllText: { fontSize: 13, fontWeight: '600' },

  list: { paddingHorizontal: spacing.md, paddingBottom: spacing.xl },
  emptyList: { flex: 1 },

  item: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.medium,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  thumb: {
    width: 52,
    height: 52,
    borderRadius: borderRadius.small,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  thumbIcon: { fontSize: 24 },
  itemContent: { flex: 1 },
  itemText: { fontSize: 15, fontWeight: '500', marginBottom: 3 },
  itemMeta: { fontSize: 12 },
  deleteBtn: {
    padding: spacing.xs,
    borderRadius: borderRadius.small,
    marginRight: spacing.xs,
  },
  deleteBtnIcon: { fontSize: 14 },
  arrow: { fontSize: 22, fontWeight: '300' },

  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  emptyIcon: { fontSize: 64, marginBottom: spacing.md },
  emptyTitle: { fontSize: 20, fontWeight: '700', marginBottom: spacing.xs },
  emptySub: { fontSize: 14, textAlign: 'center', lineHeight: 20 },

  hint: {
    padding: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0,0,0,0.06)',
  },
  hintText: { fontSize: 12, textAlign: 'center' },
});
