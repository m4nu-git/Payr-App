import { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { useHistoryStore } from '../../store/historyStore';
import { TransactionRow } from '../../components/TransactionRow';
import { SkeletonRow } from '../../components/SkeletonRow';
import { getDateLabel } from '../../lib/dateUtils';
import type { Transaction } from '../../types';

type FilterType = 'all' | 'sent' | 'received';

const FILTERS: { label: string; value: FilterType }[] = [
  { label: 'All', value: 'all' },
  { label: 'Sent', value: 'sent' },
  { label: 'Received', value: 'received' },
];

function groupByDate(transactions: Transaction[]) {
  const map = new Map<string, Transaction[]>();
  for (const tx of transactions) {
    const label = getDateLabel(tx.createdAt);
    if (!map.has(label)) map.set(label, []);
    map.get(label)!.push(tx);
  }
  return Array.from(map.entries()).map(([title, data]) => ({ title, data }));
}

export default function History() {
  const { filter, setFilter, fetchHistory, loadMore, transactions, loading, loadingMore, pagination } =
    useHistoryStore();

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleLoadMore = useCallback(() => {
    if (pagination?.hasNext && !loadingMore && !loading) {
      loadMore();
    }
  }, [pagination?.hasNext, loadingMore, loading, loadMore]);

  const sections = groupByDate(transactions);

  return (
    <View style={styles.container}>
      <Text style={styles.screenTitle}>History</Text>

      {/* Filter tabs */}
      <View style={styles.filterRow}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f.value}
            style={[styles.filterTab, filter === f.value && styles.filterTabActive]}
            onPress={() => setFilter(f.value)}
          >
            <Text style={[styles.filterTabText, filter === f.value && styles.filterTabTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading && transactions.length === 0 ? (
        <View>
          {[1, 2, 3, 4, 5].map((i) => (
            <SkeletonRow key={i} />
          ))}
        </View>
      ) : transactions.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📭</Text>
          <Text style={styles.emptyTitle}>No transactions yet</Text>
          <Text style={styles.emptySubtitle}>Send your first payment to get started.</Text>
          <TouchableOpacity style={styles.emptyBtn} onPress={() => router.push('/(tabs)/send')}>
            <Text style={styles.emptyBtnText}>Send Money</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <TransactionRow transaction={item} />}
          renderSectionHeader={({ section: { title } }) => (
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionHeaderText}>{title}</Text>
            </View>
          )}
          refreshControl={
            <RefreshControl refreshing={loading && transactions.length > 0} onRefresh={fetchHistory} />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          ListFooterComponent={
            loadingMore ? (
              <ActivityIndicator style={styles.footerLoader} color="#6C63FF" />
            ) : null
          }
          stickySectionHeadersEnabled={false}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  screenTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
    marginTop: 56,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 12,
  },
  filterTab: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  filterTabActive: { backgroundColor: '#EDE9FE', borderColor: '#6C63FF' },
  filterTabText: { fontSize: 14, color: '#6B7280', fontWeight: '500' },
  filterTabTextActive: { color: '#6C63FF', fontWeight: '700' },
  sectionHeader: { paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#F3F4F6' },
  sectionHeaderText: { fontSize: 12, fontWeight: '600', color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5 },
  listContent: { paddingBottom: 32 },
  footerLoader: { paddingVertical: 16 },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 80,
    paddingHorizontal: 32,
  },
  emptyIcon: { fontSize: 56, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: '#111827', marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: '#9CA3AF', textAlign: 'center', marginBottom: 24 },
  emptyBtn: {
    backgroundColor: '#6C63FF',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  emptyBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
