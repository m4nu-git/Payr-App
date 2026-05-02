import { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  FlatList,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useAccountStore } from '../../store/accountStore';
import { searchUsers, transferMoney } from '../../lib/api';
import { formatCurrency } from '../../lib/format';
import type { SearchUser, TransferResponse } from '../../types';

const QUICK_AMOUNTS = [100, 500, 1000, 5000];

export default function Send() {
  const params = useLocalSearchParams<{ to?: string; name?: string }>();
  const fetchBalance = useAccountStore((s) => s.fetchBalance);

  const [recipient, setRecipient] = useState<{ id: string; name: string } | null>(
    params.to && params.name ? { id: params.to, name: params.name } : null
  );
  const [recipientQuery, setRecipientQuery] = useState('');
  const [recipientResults, setRecipientResults] = useState<SearchUser[]>([]);
  const [searching, setSearching] = useState(false);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successData, setSuccessData] = useState<TransferResponse | null>(null);

  // Pre-fill from query params (navigated from dashboard)
  useEffect(() => {
    if (params.to && params.name) {
      setRecipient({ id: params.to, name: params.name });
    }
  }, [params.to, params.name]);

  const handleRecipientSearch = useCallback((text: string) => {
    setRecipientQuery(text);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(async () => {
      if (!text.trim()) {
        setRecipientResults([]);
        return;
      }
      setSearching(true);
      try {
        const users = await searchUsers(text.trim());
        setRecipientResults(users);
      } catch {
        setRecipientResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);
  }, []);

  const selectRecipient = (user: SearchUser) => {
    setRecipient({ id: user._id, name: `${user.firstName} ${user.lastName}` });
    setRecipientQuery('');
    setRecipientResults([]);
  };

  const clearRecipient = () => {
    setRecipient(null);
    setRecipientQuery('');
    setRecipientResults([]);
  };

  const handleSubmit = async () => {
    if (!recipient) { setError('Please select a recipient.'); return; }
    const numAmount = parseFloat(amount);
    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      setError('Enter a valid amount.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await transferMoney({
        to: recipient.id,
        amount: numAmount,
        note: note.trim() || undefined,
      });
      setSuccessData(res);
      fetchBalance();
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      if (message?.toLowerCase().includes('insufficient')) {
        setError('Insufficient balance.');
      } else if (message?.toLowerCase().includes('not found')) {
        setError('Recipient not found.');
      } else if (message?.toLowerCase().includes('self')) {
        setError("You can't send money to yourself.");
      } else {
        setError('Transfer failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setRecipient(null);
    setAmount('');
    setNote('');
    setError('');
    setSuccessData(null);
    setRecipientQuery('');
    setRecipientResults([]);
  };

  if (successData) {
    return (
      <View style={styles.successContainer}>
        <View style={styles.successIcon}>
          <Text style={{ fontSize: 48 }}>✅</Text>
        </View>
        <Text style={styles.successTitle}>Transfer Successful!</Text>
        <View style={styles.successCard}>
          <Row label="Amount" value={formatCurrency(successData.amount)} />
          <Row label="Sent to" value={recipient?.name ?? successData.transferredTo} />
          <Row label="New Balance" value={formatCurrency(successData.newBalance)} />
          <Row label="Txn ID" value={successData.transactionId} small />
        </View>
        <TouchableOpacity style={styles.primaryBtn} onPress={resetForm}>
          <Text style={styles.primaryBtnText}>Send Another</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryBtn} onPress={() => router.replace('/(tabs)')}>
          <Text style={styles.secondaryBtnText}>Go to Dashboard</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.screenTitle}>Send Money</Text>

        {/* Recipient */}
        <View style={styles.section}>
          <Text style={styles.label}>Recipient</Text>
          {recipient ? (
            <View style={styles.chip}>
              <Text style={styles.chipText}>{recipient.name}</Text>
              <TouchableOpacity onPress={clearRecipient}>
                <Text style={styles.chipX}>✕</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <TextInput
                style={styles.input}
                value={recipientQuery}
                onChangeText={handleRecipientSearch}
                placeholder="Search by name or username…"
                placeholderTextColor="#9CA3AF"
                autoCorrect={false}
              />
              {searching ? <Text style={styles.hint}>Searching…</Text> : null}
              {recipientResults.length > 0 ? (
                <View style={styles.dropdown}>
                  <FlatList
                    data={recipientResults}
                    keyExtractor={(item) => item._id}
                    scrollEnabled={false}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={styles.dropdownItem}
                        onPress={() => selectRecipient(item)}
                      >
                        <View style={styles.dropdownAvatar}>
                          <Text style={styles.dropdownInitials}>
                            {item.firstName[0]}{item.lastName[0]}
                          </Text>
                        </View>
                        <View>
                          <Text style={styles.dropdownName}>
                            {item.firstName} {item.lastName}
                          </Text>
                          <Text style={styles.dropdownUsername}>@{item.username}</Text>
                        </View>
                      </TouchableOpacity>
                    )}
                  />
                </View>
              ) : null}
            </>
          )}
        </View>

        {/* Amount */}
        <View style={styles.section}>
          <Text style={styles.label}>Amount</Text>
          <View style={styles.amountRow}>
            <Text style={styles.rupeesPrefix}>₹</Text>
            <TextInput
              style={styles.amountInput}
              value={amount}
              onChangeText={setAmount}
              placeholder="0.00"
              placeholderTextColor="#9CA3AF"
              keyboardType="decimal-pad"
            />
          </View>
          <View style={styles.chips}>
            {QUICK_AMOUNTS.map((a) => (
              <TouchableOpacity
                key={a}
                style={[styles.quickChip, amount === String(a) && styles.quickChipActive]}
                onPress={() => setAmount(String(a))}
              >
                <Text style={[styles.quickChipText, amount === String(a) && styles.quickChipTextActive]}>
                  ₹{a.toLocaleString('en-IN')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Note */}
        <View style={styles.section}>
          <Text style={styles.label}>Note (optional)</Text>
          <TextInput
            style={[styles.input, styles.noteInput]}
            value={note}
            onChangeText={(t) => setNote(t.slice(0, 100))}
            placeholder="What's it for?"
            placeholderTextColor="#9CA3AF"
            multiline
            maxLength={100}
          />
          <Text style={styles.charCount}>{note.length}/100</Text>
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <TouchableOpacity
          style={[styles.sendBtn, loading && styles.btnDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.sendBtnText}>Send Money</Text>
          )}
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Row({
  label,
  value,
  small,
}: {
  label: string;
  value: string;
  small?: boolean;
}) {
  return (
    <View style={rowStyles.row}>
      <Text style={rowStyles.label}>{label}</Text>
      <Text style={[rowStyles.value, small && rowStyles.small]} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

const rowStyles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  label: { fontSize: 14, color: '#6B7280' },
  value: { fontSize: 14, fontWeight: '600', color: '#111827', maxWidth: '60%', textAlign: 'right' },
  small: { fontSize: 11, color: '#9CA3AF' },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB', paddingHorizontal: 16 },
  screenTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
    marginTop: 56,
    marginBottom: 24,
  },
  section: { marginBottom: 24 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: '#111827',
    backgroundColor: '#fff',
  },
  noteInput: { minHeight: 72, textAlignVertical: 'top' },
  charCount: { fontSize: 11, color: '#9CA3AF', marginTop: 4, textAlign: 'right' },
  hint: { fontSize: 12, color: '#9CA3AF', marginTop: 6 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EDE9FE',
    borderRadius: 24,
    paddingHorizontal: 14,
    paddingVertical: 10,
    alignSelf: 'flex-start',
    gap: 10,
  },
  chipText: { fontSize: 15, fontWeight: '600', color: '#6C63FF' },
  chipX: { fontSize: 14, color: '#6C63FF' },
  dropdown: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    marginTop: 6,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  dropdownAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EDE9FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  dropdownInitials: { fontSize: 13, fontWeight: '700', color: '#6C63FF' },
  dropdownName: { fontSize: 14, fontWeight: '600', color: '#111827' },
  dropdownUsername: { fontSize: 12, color: '#9CA3AF' },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    backgroundColor: '#fff',
    paddingHorizontal: 14,
  },
  rupeesPrefix: { fontSize: 22, color: '#374151', fontWeight: '600', marginRight: 4 },
  amountInput: { flex: 1, fontSize: 24, fontWeight: '700', color: '#111827', padding: 14 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 12 },
  quickChip: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#fff',
  },
  quickChipActive: { borderColor: '#6C63FF', backgroundColor: '#EDE9FE' },
  quickChipText: { fontSize: 14, color: '#374151', fontWeight: '500' },
  quickChipTextActive: { color: '#6C63FF', fontWeight: '700' },
  errorText: { fontSize: 14, color: '#EF4444', marginBottom: 16, textAlign: 'center' },
  sendBtn: {
    backgroundColor: '#6C63FF',
    borderRadius: 14,
    padding: 18,
    alignItems: 'center',
    marginTop: 8,
  },
  btnDisabled: { opacity: 0.7 },
  sendBtnText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  // Success screen
  successContainer: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  successIcon: { marginBottom: 16 },
  successTitle: { fontSize: 24, fontWeight: '800', color: '#111827', marginBottom: 24 },
  successCard: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 24,
  },
  primaryBtn: {
    backgroundColor: '#6C63FF',
    borderRadius: 14,
    padding: 16,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  secondaryBtn: {
    borderWidth: 1,
    borderColor: '#6C63FF',
    borderRadius: 14,
    padding: 16,
    width: '100%',
    alignItems: 'center',
  },
  secondaryBtnText: { color: '#6C63FF', fontSize: 16, fontWeight: '700' },
});
