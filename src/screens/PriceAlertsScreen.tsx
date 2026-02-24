// Price Alerts Screen — Grouped List Style wie Settings
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { PriceTrackerService, PriceAlert } from '../services/priceTracker';
import * as WebBrowser from 'expo-web-browser';
import { typography, spacing, borderRadius, shadows } from '../theme';

export default function PriceAlertsScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<any>();
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadAlerts = async () => {
    const data = await PriceTrackerService.getAlerts();
    setAlerts(data.sort((a, b) => b.createdAt - a.createdAt));
  };

  useFocusEffect(useCallback(() => { loadAlerts(); }, []));

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAlerts();
    setRefreshing(false);
  };

  const handleDeleteAlert = (alert: PriceAlert) => {
    Alert.alert(
      'Alarm löschen',
      `Möchtest du den Preis-Alarm für "${alert.productName}" löschen?`,
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Löschen', style: 'destructive',
          onPress: async () => { await PriceTrackerService.deleteAlert(alert.id); loadAlerts(); },
        },
      ]
    );
  };

  const handleOpenShop = async (alert: PriceAlert) => {
    const url = alert.affiliateUrl
      || `https://www.google.com/search?q=${encodeURIComponent(alert.productName)}+${encodeURIComponent(alert.shop)}`;
    await WebBrowser.openBrowserAsync(url);
  };

  const getStatus = (alert: PriceAlert) => {
    if (alert.triggered) return { text: '🎉 Zielpreis erreicht!', color: theme.success };
    const diff = alert.currentPrice - alert.targetPrice;
    return { text: `Noch ${diff.toFixed(2)}€ bis zum Ziel`, color: theme.textSecondary };
  };

  const renderAlertItem = ({ item }: { item: PriceAlert }) => {
    const status = getStatus(item);
    const shopColor = theme.shopColors[item.shop] || '#888';
    const isTriggered = item.triggered;

    return (
      <View
        style={[
          styles.alertCard,
          { backgroundColor: theme.card },
          shadows.card,
          isTriggered && { borderWidth: 1.5, borderColor: theme.success },
        ]}
      >
        {/* Thumbnail */}
        <View style={[styles.alertThumb, { backgroundColor: theme.surface }]}>
          {Platform.OS === 'web' ? (
            // @ts-ignore
            <img src={item.productImageUrl} alt={item.productName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <Text style={styles.alertThumbIcon}>🛋️</Text>
          )}
        </View>

        {/* Info */}
        <View style={styles.alertInfo}>
          {/* Shop badge */}
          <View style={[styles.shopBadge, { backgroundColor: shopColor }]}>
            <Text style={[styles.shopBadgeText, { color: item.shop === 'IKEA' ? '#000' : '#FFF' }]}>
              {item.shop}
            </Text>
          </View>

          <Text style={[styles.alertName, { color: theme.text }]} numberOfLines={2}>
            {item.productName}
          </Text>

          {/* Price comparison */}
          <View style={styles.priceRow}>
            <View style={styles.priceBlock}>
              <Text style={[styles.priceLabel, { color: theme.textTertiary }]}>Aktuell</Text>
              <Text style={[styles.priceValue, { color: theme.text }]}>{item.currentPrice.toFixed(2)}€</Text>
            </View>
            <Text style={[styles.priceArrow, { color: theme.textSecondary }]}>→</Text>
            <View style={styles.priceBlock}>
              <Text style={[styles.priceLabel, { color: theme.textTertiary }]}>Ziel</Text>
              <Text style={[styles.priceTarget, { color: theme.primary }]}>{item.targetPrice.toFixed(2)}€</Text>
            </View>
          </View>

          <Text style={[styles.statusText, { color: status.color }]}>{status.text}</Text>
        </View>

        {/* Actions column */}
        <View style={styles.alertActions}>
          <TouchableOpacity
            style={[styles.shopBtn, { backgroundColor: theme.primary }]}
            onPress={() => handleOpenShop(item)}
          >
            <Text style={styles.shopBtnIcon}>🛒</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.deleteBtn, { borderColor: theme.error }]}
            onPress={() => handleDeleteAlert(item)}
          >
            <Text style={[styles.deleteBtnText, { color: theme.error }]}>✕</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>🔔</Text>
      <Text style={[styles.emptyTitle, { color: theme.text }]}>Keine Preis-Alarme</Text>
      <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
        Setze einen Preis-Alarm auf der{'\n'}Produkt-Detailseite
      </Text>
      <TouchableOpacity
        style={[styles.emptyBtn, { backgroundColor: theme.primary }]}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.emptyBtnText}>Produkte durchsuchen</Text>
      </TouchableOpacity>
    </View>
  );

  const triggeredCount = alerts.filter(a => a.triggered).length;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      {/* Page header */}
      <View style={styles.pageHeader}>
        <Text style={[styles.largeTitle, { color: theme.text }]}>Preis-Alarme</Text>
        {alerts.length > 0 && (
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            {alerts.length} aktiv · {triggeredCount} ausgelöst
          </Text>
        )}
      </View>

      {/* Stats strip — only when there are triggered alerts */}
      {triggeredCount > 0 && (
        <View style={[styles.statsStrip, { backgroundColor: theme.success + '18' }]}>
          <Text style={styles.statsStripEmoji}>🎉</Text>
          <Text style={[styles.statsStripText, { color: theme.success }]}>
            {triggeredCount} {triggeredCount === 1 ? 'Alarm' : 'Alarme'} ausgelöst!
          </Text>
        </View>
      )}

      <FlatList
        data={alerts}
        renderItem={renderAlertItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={alerts.length === 0 ? styles.emptyList : styles.list}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  pageHeader: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  largeTitle: { fontSize: 34, fontWeight: '700', letterSpacing: 0.37 },
  subtitle: { fontSize: 15, marginTop: 2 },

  statsStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.md,
    marginBottom: spacing.xs,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.medium,
    gap: spacing.xs,
  },
  statsStripEmoji: { fontSize: 16 },
  statsStripText: { fontSize: 14, fontWeight: '600' },

  list: { paddingHorizontal: spacing.md, paddingBottom: spacing.xxl },
  emptyList: { flex: 1 },

  // Alert card
  alertCard: {
    flexDirection: 'row',
    borderRadius: borderRadius.large,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  alertThumb: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.medium,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertThumbIcon: { fontSize: 32 },
  alertInfo: { flex: 1, marginLeft: spacing.sm, justifyContent: 'center' },
  shopBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.small,
    marginBottom: spacing.xxs,
  },
  shopBadgeText: { fontSize: 10, fontWeight: '700' },
  alertName: { fontSize: 14, fontWeight: '600', lineHeight: 18, marginBottom: spacing.xs },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xxs,
  },
  priceBlock: {},
  priceLabel: { fontSize: 10, letterSpacing: 0.3 },
  priceValue: { fontSize: 14, fontWeight: '600' },
  priceTarget: { fontSize: 14, fontWeight: '700' },
  priceArrow: { fontSize: 14 },
  statusText: { fontSize: 11, fontWeight: '500' },

  alertActions: { justifyContent: 'center', alignItems: 'center', gap: spacing.xs, marginLeft: spacing.xs },
  shopBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shopBtnIcon: { fontSize: 18 },
  deleteBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteBtnText: { fontSize: 12, fontWeight: '700' },

  // Empty
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyIcon: { fontSize: 64, marginBottom: spacing.md },
  emptyTitle: { fontSize: 20, fontWeight: '700', marginBottom: spacing.xs },
  emptyText: { fontSize: 14, textAlign: 'center', lineHeight: 20, marginBottom: spacing.lg },
  emptyBtn: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.medium,
  },
  emptyBtnText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
});
