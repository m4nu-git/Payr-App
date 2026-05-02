import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '../../store/authStore';
import { signup } from '../../lib/api';

interface FieldErrors {
  firstName?: string;
  lastName?: string;
  username?: string;
  email?: string;
  password?: string;
}

export default function SignUp() {
  const login = useAuthStore((s) => s.login);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = (): boolean => {
    const errors: FieldErrors = {};
    if (!firstName.trim()) errors.firstName = 'First name is required.';
    if (!lastName.trim()) errors.lastName = 'Last name is required.';
    if (!username.trim()) errors.username = 'Username is required.';
    else if (username.trim().length < 3) errors.username = 'Username must be at least 3 characters.';
    if (!email.trim()) errors.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Enter a valid email.';
    if (!password) errors.password = 'Password is required.';
    else if (password.length < 6) errors.password = 'Password must be at least 6 characters.';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSignUp = async () => {
    if (!validate()) return;
    setServerError('');
    setLoading(true);
    try {
      const data = await signup({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        username: username.trim(),
        email: email.trim().toLowerCase(),
        password,
      });
      login(data.token, data.user);
      router.replace('/(tabs)');
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 409) {
        setServerError('Username or email is already taken.');
      } else {
        setServerError('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.logo}>Payr</Text>
          <Text style={styles.subtitle}>Create your account</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.row}>
            <View style={[styles.field, styles.half]}>
              <Text style={styles.label}>First Name</Text>
              <TextInput
                style={[styles.input, fieldErrors.firstName ? styles.inputError : null]}
                value={firstName}
                onChangeText={setFirstName}
                placeholder="John"
                placeholderTextColor="#9CA3AF"
              />
              {fieldErrors.firstName ? (
                <Text style={styles.errorText}>{fieldErrors.firstName}</Text>
              ) : null}
            </View>
            <View style={[styles.field, styles.half]}>
              <Text style={styles.label}>Last Name</Text>
              <TextInput
                style={[styles.input, fieldErrors.lastName ? styles.inputError : null]}
                value={lastName}
                onChangeText={setLastName}
                placeholder="Doe"
                placeholderTextColor="#9CA3AF"
              />
              {fieldErrors.lastName ? (
                <Text style={styles.errorText}>{fieldErrors.lastName}</Text>
              ) : null}
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Username</Text>
            <TextInput
              style={[styles.input, fieldErrors.username ? styles.inputError : null]}
              value={username}
              onChangeText={setUsername}
              placeholder="johndoe"
              placeholderTextColor="#9CA3AF"
              autoCapitalize="none"
              autoCorrect={false}
            />
            {fieldErrors.username ? (
              <Text style={styles.errorText}>{fieldErrors.username}</Text>
            ) : null}
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.input, fieldErrors.email ? styles.inputError : null]}
              value={email}
              onChangeText={setEmail}
              placeholder="john@example.com"
              placeholderTextColor="#9CA3AF"
              autoCapitalize="none"
              keyboardType="email-address"
            />
            {fieldErrors.email ? (
              <Text style={styles.errorText}>{fieldErrors.email}</Text>
            ) : null}
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={[styles.input, fieldErrors.password ? styles.inputError : null]}
              value={password}
              onChangeText={setPassword}
              placeholder="Minimum 6 characters"
              placeholderTextColor="#9CA3AF"
              secureTextEntry
            />
            {fieldErrors.password ? (
              <Text style={styles.errorText}>{fieldErrors.password}</Text>
            ) : null}
          </View>

          {serverError ? <Text style={styles.serverError}>{serverError}</Text> : null}

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSignUp}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Create Account</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/(auth)/sign-in')} style={styles.link}>
            <Text style={styles.linkText}>
              Already have an account? <Text style={styles.linkBold}>Sign In</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  header: { alignItems: 'center', marginBottom: 32 },
  logo: { fontSize: 42, fontWeight: '800', color: '#6C63FF', letterSpacing: -1 },
  subtitle: { fontSize: 16, color: '#6B7280', marginTop: 4 },
  form: { gap: 14 },
  row: { flexDirection: 'row', gap: 12 },
  half: { flex: 1 },
  field: { gap: 4 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151' },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#fff',
  },
  inputError: { borderColor: '#EF4444' },
  errorText: { fontSize: 12, color: '#EF4444' },
  serverError: { fontSize: 14, color: '#EF4444', textAlign: 'center' },
  button: {
    backgroundColor: '#6C63FF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  link: { alignItems: 'center', marginTop: 8 },
  linkText: { fontSize: 14, color: '#6B7280' },
  linkBold: { color: '#6C63FF', fontWeight: '700' },
});
