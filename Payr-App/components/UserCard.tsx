import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SearchUser } from '../types';


interface Props {
  user: SearchUser;
  onPress: (user: SearchUser) => void;
}

export function UserCard({ user, onPress }: Props) {
  const initials = `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(user)} activeOpacity={0.7}>
      <View style={styles.avatar}>
        <Text style={styles.initials}>{initials}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.name}>
          {user.firstName} {user.lastName}
        </Text>
        <Text style={styles.username}>@{user.username}</Text>
      </View>
      <Text style={styles.arrow}>›</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EDE9FE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: { fontSize: 16, fontWeight: '700', color: '#6C63FF' },
  info: { flex: 1, marginLeft: 12 },
  name: { fontSize: 15, fontWeight: '600', color: '#111827' },
  username: { fontSize: 13, color: '#9CA3AF', marginTop: 2 },
  arrow: { fontSize: 22, color: '#D1D5DB' },
});
