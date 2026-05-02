import { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Slot } from 'expo-router';
import { useAuthStore } from '../store/authStore';

export default function RootLayout() {
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const hydrate = useAuthStore((s) => s.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  if (!isHydrated) {
    return (
      <View style={styles.splash}>
        <ActivityIndicator size="large" color="#6C63FF" />
      </View>
    );
  }

  return <Slot />;
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: '#6C63FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
