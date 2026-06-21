import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  SafeAreaView,
  Platform,
} from 'react-native';
import { useStore } from '../store';
import { colors, font, spacing, radius } from '../constants/theme';

const SLIDES = [
  {
    emoji: '🏓',
    title: 'Your Pickleball Coach\nin Your Pocket',
    desc: 'Track every match, rate your shots, and drill your way to a stronger game — all for free.',
  },
  {
    emoji: '📋',
    title: 'Log a Match\nin Under a Minute',
    desc: 'Record the score, opponent, and rate all 6 shots (serve, return, dink, drop, drive, overhead) right after you play.',
  },
  {
    emoji: '📊',
    title: 'Know Exactly What\nto Practice',
    desc: 'Your Shot Skills report builds automatically. It shows your strongest and weakest shots, and picks the right drill for you.',
  },
];

export default function OnboardingModal() {
  const { hasSeenOnboarding, completeOnboarding } = useStore();
  const [slide, setSlide] = useState(0);

  if (hasSeenOnboarding) return null;

  const isLast = slide === SLIDES.length - 1;
  const current = SLIDES[slide];

  return (
    <Modal visible animationType="fade" statusBarTranslucent transparent={false}>
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <TouchableOpacity style={styles.skip} onPress={completeOnboarding}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>

          <View style={styles.content}>
            <View style={styles.emojiCircle}>
              <Text style={styles.emoji}>{current.emoji}</Text>
            </View>
            <Text style={styles.title}>{current.title}</Text>
            <Text style={styles.desc}>{current.desc}</Text>
          </View>

          <View style={styles.dots}>
            {SLIDES.map((_, i) => (
              <View key={i} style={[styles.dot, i === slide && styles.dotActive]} />
            ))}
          </View>

          <TouchableOpacity
            style={[styles.cta, isLast && styles.ctaLast]}
            onPress={() => {
              if (isLast) {
                completeOnboarding();
              } else {
                setSlide((s) => s + 1);
              }
            }}
            activeOpacity={0.85}
          >
            <Text style={styles.ctaText}>
              {isLast ? 'Get Started →' : 'Next →'}
            </Text>
          </TouchableOpacity>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.headerBg,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
  skip: {
    alignSelf: 'flex-end',
    paddingVertical: spacing.lg,
    paddingLeft: spacing.xl,
  },
  skipText: {
    fontSize: font.md,
    color: 'rgba(255,255,255,0.55)',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  emojiCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xxxl,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  emoji: { fontSize: 56 },
  title: {
    fontSize: font.xxxl - 4,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
    letterSpacing: -0.5,
    marginBottom: spacing.lg,
    lineHeight: 38,
  },
  desc: {
    fontSize: font.lg - 1,
    color: 'rgba(255,255,255,0.75)',
    textAlign: 'center',
    lineHeight: 26,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: spacing.xxl,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  dotActive: {
    backgroundColor: '#fff',
    width: 24,
  },
  cta: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: radius.full,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  ctaLast: {
    backgroundColor: '#fff',
    borderColor: '#fff',
  },
  ctaText: {
    fontSize: font.lg,
    fontWeight: '800',
    color: '#fff',
  },
});
