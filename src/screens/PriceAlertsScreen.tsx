// Price Alerts Screen - Shows all active price alerts
import React, { useState, useEffect, useCallback } from 'react';
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
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { PriceTrackerService, PriceAlert } from '../services/priceTracker';
import * as WebBrowser from 'expo-web-browser';

export default function PriceAlertsScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<any>();
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadAlerts = async () => {
    const data = await PriceTrackerService.getAlerts();
    // Sort by creation date, newest first
    setAlerts(data.sort((a, b) => b.createdAt - a.createdAt));
  };

  // Reload on screen focus
  useFocusEffect(
    useCallback(() => {
      loadAlerts();
    }, [])
  );

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
          text: 'Löschen',
          style: 'destructive',
          onPress: async () => {
            await PriceTrackerService.deleteAlert(alert.id);
            loadAlerts();
          },
        },
      ]
    );
  };

  const handleOpenShop = async (alert: PriceAlert) => {
    if (alert.affiliateUrl) {
      await WebBrowser.openBrowserAsync(alert.affiliateUrl);
    } else {
      const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(alert.productName)}+${encodeURIComponent(alert.shop)}`;
      await WebBrowser.openBrowserAsync(searchUrl);
    }
  };

  const getStatusText = (alert: PriceAlert): { text: string; color: string } => {
    if (alert.triggered) {
      return { text: '🎉 Zielpreis erreicht!', color: theme.success };
    }
    const diff = alert.currentPrice - alert.targetPrice;
    return { text: `Noch ${diff.toFixed(2)}€ bis zum Ziel`, color: theme.textSecondary };
  };

  const renderAlertItem = ({ item }: { item: PriceAlert }) => {
    const status = getStatusText(item);
    const shopColor = theme.shopColors[item.shop] || '#666';

    return (
      <View style={[styles.alertCard, { backgroundColor: theme.card, borderColor: item.triggered ? theme.success : theme.border }]}>
        {/* Product Image */}
        <View style={[styles.alertImage, { backgroundColor: theme.surface }]}>
          {Platform.OS === 'web' ? (
            <img
              src={item.productImageUrl}
              alt={item.productName}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <Text style={styles.alertImagePlaceholder}>🛋️</Text>
          )}
        </View>

        {/* Alert Info */}
        <View style={styles.alertInfo}>
          <View style={[styles.shopBadge, { backgroundColor: shopColor }]}>
            <Text style={[styles.shopBadgeText, { 
              color: item.shop === 'IKEA' ? '#000' : '#FFF' 
            }]}>
              {item.shop}
            </Text>
          </View>
          
          <Text style={[styles.alertProductName, { color: theme.text }]} numberOfLines={2}>
            {item.productName}
          </Text>

          <View style={styles.priceRow}>
            <View>
              <Text style={[styles.priceLabel, { color: theme.textMuted }]}>Aktuell</Text>
              <Text style={[styles.currentPrice, { color: theme.text }]}>
                {item.currentPrice.toFixed(2)}€
              </Text>
            </View>
            <View style={styles.arrow}>
              <Text style={{ color: theme.textMuted }}>→</Text>
            </View>
            <View>
              <Text style={[styles.priceLabel, { color: theme.textMuted }]}>Ziel</Text>
              <Text style={[styles.targetPrice, { color: theme.primary }]}>
                {item.targetPrice.toFixed(2)}€
              </Text>
            </View>
          </View>

          <Text style={[styles.statusText, { color: status.color }]}>
            {status.text}
          </Text>
        </View>

        {/* Actions */}
        <View style={styles.alertActions}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.primary }]}
            onPress={() => handleOpenShop(item)}
          >
            <Text style={styles.actionButtonText}>🛒</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.deleteButton, { borderColor: theme.error }]}
            onPress={() => handleDeleteAlert(item)}
          >
            <Text style={[styles.deleteButtonText, { color: theme.error }]}>✕</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>🔔</Text>
      <Text style={[styles.emptyTitle, { color: theme.text }]}>
        Keine Preis-Alarme
      </Text>
      <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
        Setze einen Preis-Alarm auf der{'\n'}Produkt-Detailseite
      </Text>
      <TouchableOpacity
        style={[styles.emptyButton, { backgroundColor: theme.primary }]}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.emptyButtonText}>Produkte durchsuchen</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header Stats */}
      {alerts.length > 0 && (
        <View style={[styles.statsBar, { backgroundColor: theme.card }]}>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: theme.primary }]}>{alerts.length}</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Aktiv</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: theme.success }]}>
              {alerts.filter(a => a.triggered).length}
            </Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Ausgelöst</Text>
          </View>
        </View>
      )}

      <FlatList
        data={alerts}
        renderItem={renderAlertItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={alerts.length === 0 ? styles.emptyList : styles.list}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.primary}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  statsBar: {
    flexDirection: 'row',
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
  },
  list: {
    padding: 16,
    paddingTop: 8,
  },
  emptyList: {
    flex: 1,
  },
  alertCard: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  alertImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    overflow: 'hidden',
  },
  alertImagePlaceholder: {
    fontSize: 32,
    textAlign: 'center',
    paddingTop: 24,
  },
  alertInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  shopBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 4,
  },
  shopBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  alertProductName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  arrow: {
    marginHorizontal: 4,
  },
  priceLabel: {
    fontSize: 10,
  },
  currentPrice: {
    fontSize: 14,
    fontWeight: '600',
  },
  targetPrice: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  statusText: {
    fontSize: 11,
    marginTop: 4,
  },
  alertActions: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 18,
  },
  deleteButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  emptyButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
