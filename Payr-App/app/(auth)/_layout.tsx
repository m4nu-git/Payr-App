import { Redirect, Stack } from 'expo-router';
import { useAuthStore } from '../../store/authStore';

export default function AuthLayout() {
  const token = useAuthStore((s) => s.token);

  if (token) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="sign-in" />
      <Stack.Screen name="sign-up" />
    </Stack>
  );
}
