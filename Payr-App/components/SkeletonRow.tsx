import { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';

export function SkeletonRow() {
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 600, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [opacity]);

  return (
    <Animated.View style={[styles.row, { opacity }]}>
      <View style={styles.avatar} />
      <View style={styles.info}>
        <View style={styles.line1} />
        <View style={styles.line2} />
      </View>
      <View style={styles.amount} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#E5E7EB' },
  info: { flex: 1, marginLeft: 12, gap: 6 },
  line1: { height: 14, width: '60%', borderRadius: 6, backgroundColor: '#E5E7EB' },
  line2: { height: 11, width: '40%', borderRadius: 6, backgroundColor: '#E5E7EB' },
  amount: { width: 64, height: 16, borderRadius: 6, backgroundColor: '#E5E7EB' },
});
