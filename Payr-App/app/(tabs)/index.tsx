import { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TextInput,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '../../store/authStore';
import { useAccountStore } from '../../store/accountStore';
import { searchUsers } from '../../lib/api';
import { BalanceCard } from '../../components/BalanceCard';
import { UserCard } from '../../components/UserCard';
import type { SearchUser } from '../../types';

export default function Dashboard() {
  const user = useAuthStore((s) => s.user);
  const { balance, loading, fetchBalance } = useAccountStore();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchUser[]>([]);
  const [searching, setSearching] = useState(false);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  const handleSearch = useCallback(
    (text: string) => {
      setQuery(text);
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(async () => {
        setSearching(true);
        try {
          const users = await searchUsers(text.trim());
          // Exclude the current authenticated user
          setResults(users.filter((u) => u._id !== user?.id));
        } catch {
          setResults([]);
        } finally {
          setSearching(false);
        }
      }, 300);
    },
    [user?.id]
  );

  const handleUserPress = (selectedUser: SearchUser) => {
    const fullName = `${selectedUser.firstName} ${selectedUser.lastName}`;
    router.push({
      pathname: '/(tabs)/send',
      params: { to: selectedUser._id, name: fullName },
    });
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={loading && balance !== null} onRefresh={fetchBalance} />
      }
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.topBar}>
        <View>
          <Text style={styles.greeting}>Hello,</Text>
          <Text style={styles.name}>{user?.firstName} {user?.lastName} 👋</Text>
        </View>
      </View>

      <BalanceCard balance={balance} loading={loading} onRefresh={fetchBalance} />

      <View style={styles.quickActions}>
        <TouchableOpacity
          style={styles.sendBtn}
          onPress={() => router.push('/(tabs)/send')}
        >
          <Text style={styles.sendBtnText}>💸  Send Money</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchSection}>
        <Text style={styles.sectionTitle}>Find People</Text>
        <TextInput
          style={styles.searchInput}
          value={query}
          onChangeText={handleSearch}
          placeholder="Search by name or username…"
          placeholderTextColor="#9CA3AF"
          autoCorrect={false}
        />
        {searching ? (
          <Text style={styles.searchHint}>Searching…</Text>
        ) : null}
        {results.length > 0 ? (
          <View style={styles.results}>
            <FlatList
              data={results}
              keyExtractor={(item) => item._id}
              renderItem={({ item }) => (
                <UserCard user={item} onPress={handleUserPress} />
              )}
              scrollEnabled={false}
            />
          </View>
        ) : query.length > 0 && !searching ? (
          <Text style={styles.emptySearch}>No users found.</Text>
        ) : null}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  topBar: {
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  greeting: { fontSize: 14, color: '#9CA3AF' },
  name: { fontSize: 20, fontWeight: '700', color: '#111827', marginTop: 2 },
  quickActions: { paddingHorizontal: 16, marginTop: 20 },
  sendBtn: {
    backgroundColor: '#111827',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
  },
  sendBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  searchSection: { paddingHorizontal: 16, marginTop: 28, paddingBottom: 32 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 10 },
  searchInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    color: '#111827',
    backgroundColor: '#fff',
  },
  searchHint: { fontSize: 13, color: '#9CA3AF', marginTop: 8, paddingLeft: 4 },
  results: {
    marginTop: 10,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  emptySearch: { fontSize: 14, color: '#9CA3AF', marginTop: 12, textAlign: 'center' },
});
