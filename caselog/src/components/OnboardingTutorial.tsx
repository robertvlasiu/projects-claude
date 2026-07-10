import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Slide = {
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  title: string;
  body: string;
};

const SLIDES: Slide[] = [
  {
    icon: 'shield-checkmark',
    color: '#4f46e5',
    title: 'Welcome to Auris',
    body: 'Your private, encrypted space to document everything that matters in your case — incidents, communications, court dates, and more.',
  },
  {
    icon: 'warning',
    color: '#ef4444',
    title: 'Log what happened',
    body: 'Record incidents with dates, severity, witnesses, and photos. Attach evidence so you have it when you need it.',
  },
  {
    icon: 'calendar',
    color: '#6366f1',
    title: 'Stay on top of dates',
    body: 'Track court hearings, custody exchanges, and reminders. Get notified before important events.',
  },
  {
    icon: 'lock-closed',
    color: '#10b981',
    title: 'Encrypted on your device',
    body: 'Everything is encrypted before it leaves your phone. Your PIN stays on this device and is tied to your account.',
  },
  {
    icon: 'rocket',
    color: '#8b5cf6',
    title: 'Ready to begin',
    body: 'Start with your first incident or court date. You can revisit this guide anytime from the dashboard.',
  },
];

type Props = {
  onComplete: () => void;
};

const { width } = Dimensions.get('window');

export default function OnboardingTutorial({ onComplete }: Props) {
  const insets = useSafeAreaInsets();
  const listRef = useRef<FlatList<Slide>>(null);
  const [index, setIndex] = useState(0);

  function onScroll(e: NativeSyntheticEvent<NativeScrollEvent>) {
    const next = Math.round(e.nativeEvent.contentOffset.x / width);
    if (next !== index) setIndex(next);
  }

  function goNext() {
    if (index >= SLIDES.length - 1) {
      onComplete();
      return;
    }
    listRef.current?.scrollToIndex({ index: index + 1, animated: true });
  }

  const slide = SLIDES[index];
  const isLast = index === SLIDES.length - 1;

  return (
    <View style={styles.root}>
      <LinearGradient colors={['#ffffff', '#f0f4ff']} style={StyleSheet.absoluteFill} />

      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        {!isLast ? (
          <TouchableOpacity onPress={onComplete} hitSlop={12}>
            <Text style={styles.skip}>Skip</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.skip} />
        )}
      </View>

      <FlatList
        ref={listRef}
        data={SLIDES}
        keyExtractor={(_, i) => String(i)}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        style={styles.list}
        onScrollToIndexFailed={() => {}}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width }]}>
            <View style={[styles.iconWrap, { backgroundColor: item.color + '18' }]}>
              <Ionicons name={item.icon} size={42} color={item.color} />
            </View>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.body}>{item.body}</Text>
          </View>
        )}
      />

      <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View key={i} style={[styles.dot, i === index && styles.dotActive]} />
          ))}
        </View>

        <TouchableOpacity style={styles.primaryBtn} onPress={goNext} activeOpacity={0.85}>
          <LinearGradient
            colors={[slide.color, '#4f46e5']}
            style={styles.primaryGrad}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.primaryText}>{isLast ? 'Get started' : 'Next'}</Text>
            <Ionicons name={isLast ? 'checkmark' : 'arrow-forward'} size={18} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>

        <Text style={styles.stepLabel}>{index + 1} of {SLIDES.length}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  list: { flex: 1 },
  topBar: { paddingHorizontal: 20, alignItems: 'flex-end', minHeight: 44 },
  skip: { fontSize: 15, color: '#94a3b8', fontWeight: '600', minWidth: 40 },
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingBottom: 24,
  },
  iconWrap: {
    width: 96,
    height: 96,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1e1b4b',
    textAlign: 'center',
    letterSpacing: -0.5,
    marginBottom: 16,
  },
  body: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 320,
  },
  footer: { paddingHorizontal: 24, gap: 16 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#e2e8f0' },
  dotActive: { width: 24, backgroundColor: '#4f46e5' },
  primaryBtn: { borderRadius: 16, overflow: 'hidden' },
  primaryGrad: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  stepLabel: { textAlign: 'center', fontSize: 12, color: '#94a3b8', fontWeight: '600' },
});
