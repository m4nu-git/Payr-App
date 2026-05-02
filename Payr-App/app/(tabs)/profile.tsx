import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useAuthStore } from '../../store/authStore';
import { updateUser } from '../../lib/api';
import type { UpdateUserPayload } from '../../types';

export default function Profile() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const login = useAuthStore((s) => s.login);
  const token = useAuthStore((s) => s.token);

  const [firstName, setFirstName] = useState(user?.firstName ?? '');
  const [lastName, setLastName] = useState(user?.lastName ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const initials = user
    ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
    : '?';

  const handleUpdate = async () => {
    const payload: UpdateUserPayload = {};
    if (firstName.trim() !== user?.firstName) payload.firstName = firstName.trim();
    if (lastName.trim() !== user?.lastName) payload.lastName = lastName.trim();
    if (email.trim() !== user?.email) payload.email = email.trim().toLowerCase();
    if (password) payload.password = password;

    if (Object.keys(payload).length === 0) {
      setError('No changes to save.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await updateUser(payload);
      if (token) {
        login(token, res.user);
      }
      setPassword('');
      setSuccess('Profile updated successfully.');
    } catch {
      setError('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.screenTitle}>Profile</Text>

        {/* Avatar */}
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.fullName}>
            {user?.firstName} {user?.lastName}
          </Text>
          <Text style={styles.username}>@{user?.username}</Text>
        </View>

        {/* Edit Form */}
        <View style={styles.form}>
          <View style={styles.row}>
            <View style={[styles.field, styles.half]}>
              <Text style={styles.label}>First Name</Text>
              <TextInput
                style={styles.input}
                value={firstName}
                onChangeText={setFirstName}
                placeholder="First name"
                placeholderTextColor="#9CA3AF"
              />
            </View>
            <View style={[styles.field, styles.half]}>
              <Text style={styles.label}>Last Name</Text>
              <TextInput
                style={styles.input}
                value={lastName}
                onChangeText={setLastName}
                placeholder="Last name"
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Email address"
              placeholderTextColor="#9CA3AF"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>New Password</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Leave blank to keep unchanged"
              placeholderTextColor="#9CA3AF"
              secureTextEntry
            />
          </View>

          {success ? <Text style={styles.successText}>{success}</Text> : null}
          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <TouchableOpacity
            style={[styles.saveBtn, loading && styles.btnDisabled]}
            onPress={handleUpdate}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveBtnText}>Save Changes</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        <View style={{ height: 48 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB', paddingHorizontal: 16 },
  screenTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
    marginTop: 56,
    marginBottom: 24,
  },
  avatarSection: { alignItems: 'center', marginBottom: 32 },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#6C63FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: { fontSize: 28, fontWeight: '800', color: '#fff' },
  fullName: { fontSize: 20, fontWeight: '700', color: '#111827' },
  username: { fontSize: 14, color: '#9CA3AF', marginTop: 4 },
  form: { gap: 16 },
  row: { flexDirection: 'row', gap: 12 },
  half: { flex: 1 },
  field: { gap: 6 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151' },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: '#111827',
    backgroundColor: '#fff',
  },
  successText: { fontSize: 14, color: '#059669', textAlign: 'center' },
  errorText: { fontSize: 14, color: '#EF4444', textAlign: 'center' },
  saveBtn: {
    backgroundColor: '#6C63FF',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  btnDisabled: { opacity: 0.7 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  logoutBtn: {
    marginTop: 24,
    borderWidth: 1,
    borderColor: '#EF4444',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
  },
  logoutText: { color: '#EF4444', fontSize: 16, fontWeight: '700' },
});
