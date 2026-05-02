import { View, Text, StyleSheet } from 'react-native';
import { Transaction } from '../types';
import { formatDate } from '../lib/dateUtils';
import { formatCurrency } from '../lib/format';


interface Props {
  transaction: Transaction;
}

export function TransactionRow({ transaction }: Props) {
  const { type, amount, counterparty, note, status, createdAt } = transaction;
  const isSent = type === 'sent';
  const initials =
    `${counterparty.firstName[0]}${counterparty.lastName[0]}`.toUpperCase();

  return (
    <View style={styles.row}>
      <View style={[styles.avatar, isSent ? styles.avatarSent : styles.avatarReceived]}>
        <Text style={[styles.initials, isSent ? styles.initialsColorSent : styles.initialsColorReceived]}>
          {initials}
        </Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.name}>
          {counterparty.firstName} {counterparty.lastName}
        </Text>
        <Text style={styles.username}>@{counterparty.username}</Text>
        {note ? <Text style={styles.note}>{note}</Text> : null}
        <Text style={styles.date}>{formatDate(createdAt)}</Text>
      </View>
      <View style={styles.right}>
        <Text style={[styles.amount, isSent ? styles.amountSent : styles.amountReceived]}>
          {isSent ? '−' : '+'}{formatCurrency(amount)}
        </Text>
        {status === 'failed' ? (
          <View style={styles.failedBadge}>
            <Text style={styles.failedText}>Failed</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarSent: { backgroundColor: '#FEF3C7' },
  avatarReceived: { backgroundColor: '#D1FAE5' },
  initials: { fontSize: 15, fontWeight: '700' },
  initialsColorSent: { color: '#D97706' },
  initialsColorReceived: { color: '#059669' },
  info: { flex: 1, marginLeft: 12 },
  name: { fontSize: 14, fontWeight: '600', color: '#111827' },
  username: { fontSize: 12, color: '#9CA3AF', marginTop: 1 },
  note: { fontSize: 12, color: '#6B7280', marginTop: 2, fontStyle: 'italic' },
  date: { fontSize: 11, color: '#9CA3AF', marginTop: 2 },
  right: { alignItems: 'flex-end' },
  amount: { fontSize: 15, fontWeight: '700' },
  amountSent: { color: '#374151' },
  amountReceived: { color: '#059669' },
  failedBadge: {
    marginTop: 4,
    backgroundColor: '#FEE2E2',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  failedText: { fontSize: 11, color: '#DC2626', fontWeight: '600' },
});
