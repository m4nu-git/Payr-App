import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { formatCurrency } from '../lib/format';


interface Props {
  balance: number | null;
  loading: boolean;
  onRefresh: () => void;
}

export function BalanceCard({ balance, loading, onRefresh }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>Total Balance</Text>
      {loading && balance === null ? (
        <ActivityIndicator color="#fff" style={styles.loader} />
      ) : (
        <Text style={styles.amount}>
          {balance !== null ? formatCurrency(balance) : '—'}
        </Text>
      )}
      <TouchableOpacity onPress={onRefresh} style={styles.refreshBtn}>
        <Text style={styles.refreshText}>↻ Refresh</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#6C63FF',
    borderRadius: 20,
    padding: 24,
    marginHorizontal: 16,
    marginTop: 16,
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  label: { color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: '500' },
  amount: { color: '#fff', fontSize: 36, fontWeight: '800', marginTop: 8, letterSpacing: -1 },
  loader: { marginTop: 8 },
  refreshBtn: { marginTop: 12, alignSelf: 'flex-start' },
  refreshText: { color: 'rgba(255,255,255,0.75)', fontSize: 13 },
});
