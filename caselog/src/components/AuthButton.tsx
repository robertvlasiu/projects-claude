import React, { useRef } from 'react';
import { ActivityIndicator, Animated, StyleSheet, Text, TouchableOpacity, ViewStyle } from 'react-native';

type Props = {
  label: string;
  onPress: () => void;
  loading?: boolean;
  variant?: 'primary' | 'outline';
  style?: ViewStyle;
  icon?: React.ReactNode;
};

export default function AuthButton({ label, onPress, loading, variant = 'primary', style, icon }: Props) {
  const scale = useRef(new Animated.Value(1)).current;

  function handlePressIn() {
    Animated.spring(scale, { toValue: 0.97, damping: 15, useNativeDriver: true }).start();
  }
  function handlePressOut() {
    Animated.spring(scale, { toValue: 1, damping: 15, useNativeDriver: true }).start();
  }

  return (
    <Animated.View style={[{ transform: [{ scale }] }, style]}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={loading}
        style={[styles.btn, variant === 'outline' ? styles.outline : styles.primary, style?.backgroundColor ? { backgroundColor: style.backgroundColor } : null]}
      >
        {icon}
        {loading ? (
          <ActivityIndicator color={variant === 'primary' ? '#fff' : '#4f46e5'} />
        ) : (
          <Text style={[styles.label, variant === 'outline' && styles.labelOutline]}>{label}</Text>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  btn: {
    height: 54,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  primary: {
    backgroundColor: '#4f46e5',
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  outline: {
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
  },
  label: { color: '#fff', fontSize: 16, fontWeight: '700' },
  labelOutline: { color: '#1e293b' },
});
