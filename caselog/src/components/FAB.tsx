import { Ionicons } from '@expo/vector-icons';
import React, { useRef } from 'react';
import { Animated, StyleSheet, TouchableOpacity } from 'react-native';

type Props = {
  onPress: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  color?: string;
};

export default function FAB({ onPress, icon = 'add', color = '#4f46e5' }: Props) {
  const scale = useRef(new Animated.Value(1)).current;
  function pressIn() { Animated.spring(scale, { toValue: 0.9, damping: 15, useNativeDriver: true }).start(); }
  function pressOut() { Animated.spring(scale, { toValue: 1, damping: 12, useNativeDriver: true }).start(); }

  return (
    <Animated.View style={[styles.wrap, { transform: [{ scale }] }]}>
      <TouchableOpacity
        style={[styles.btn, { backgroundColor: color }]}
        onPress={onPress}
        onPressIn={pressIn}
        onPressOut={pressOut}
        activeOpacity={1}
      >
        <Ionicons name={icon} size={28} color="#fff" />
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    bottom: 28,
    right: 20,
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 10,
  },
  btn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
