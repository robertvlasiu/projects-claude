import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export interface GuideStep {
  key: string;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  done: boolean;
  onPress: () => void;
}

type Props = {
  steps: GuideStep[];
  onDismiss: () => void;
};

export default function GettingStarted({ steps, onDismiss }: Props) {
  const doneCount = steps.filter(s => s.done).length;
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(progress, {
      toValue: steps.length === 0 ? 0 : doneCount / steps.length,
      useNativeDriver: false,
      friction: 8,
    }).start();
  }, [doneCount, steps.length]);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.title}>Set up your case</Text>
          <Text style={styles.subtitle}>
            {doneCount === 0
              ? 'A few steps to get your documentation started'
              : `${doneCount} of ${steps.length} done — keep going`}
          </Text>
        </View>
        <TouchableOpacity onPress={onDismiss} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="close" size={18} color="#94a3b8" />
        </TouchableOpacity>
      </View>

      <View style={styles.track}>
        <Animated.View
          style={[
            styles.fill,
            { width: progress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) },
          ]}
        />
      </View>

      {steps.map(step => (
        <TouchableOpacity
          key={step.key}
          style={styles.step}
          onPress={step.onPress}
          disabled={step.done}
          activeOpacity={0.7}
        >
          <View style={[styles.stepIcon, { backgroundColor: step.done ? '#ecfdf5' : step.color + '15' }]}>
            <Ionicons
              name={step.done ? 'checkmark' : step.icon}
              size={16}
              color={step.done ? '#10b981' : step.color}
            />
          </View>
          <View style={styles.stepBody}>
            <Text style={[styles.stepTitle, step.done && styles.stepTitleDone]}>{step.title}</Text>
            {!step.done && <Text style={styles.stepSub}>{step.subtitle}</Text>}
          </View>
          {!step.done && <Ionicons name="chevron-forward" size={16} color="#cbd5e1" />}
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16, marginTop: 14, backgroundColor: '#fff', borderRadius: 16,
    padding: 16, borderWidth: 1, borderColor: '#f1f5f9',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
  header: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  headerText: { flex: 1 },
  title: { fontSize: 16, fontWeight: '800', color: '#1e1b4b', letterSpacing: -0.3 },
  subtitle: { fontSize: 12, color: '#94a3b8', marginTop: 2 },
  track: { height: 6, borderRadius: 3, backgroundColor: '#f1f5f9', marginBottom: 14, overflow: 'hidden' },
  fill: { height: 6, borderRadius: 3, backgroundColor: '#10b981' },
  step: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 },
  stepIcon: { width: 32, height: 32, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  stepBody: { flex: 1 },
  stepTitle: { fontSize: 14, fontWeight: '700', color: '#1e293b' },
  stepTitleDone: { color: '#94a3b8', textDecorationLine: 'line-through', fontWeight: '600' },
  stepSub: { fontSize: 11, color: '#94a3b8', marginTop: 1 },
});
