/**
 * Minimal shared UI primitives for Caselog. Keep new reusable bits here.
 */
import { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View, ViewStyle } from "react-native";
import { colors, font, radius, spacing } from "@/theme";

export function Button({
  label,
  onPress,
  variant = "primary",
  disabled,
}: {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.btn,
        variant === "primary" && { backgroundColor: colors.primary },
        variant === "secondary" && { backgroundColor: colors.accent },
        variant === "danger" && { backgroundColor: colors.danger },
        variant === "ghost" && { backgroundColor: "transparent" },
        (pressed || disabled) && { opacity: 0.6 },
      ]}
    >
      <Text
        style={[
          styles.btnLabel,
          variant === "ghost" && { color: colors.primary },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function Card({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function H1({ children }: { children: ReactNode }) {
  return <Text style={styles.h1}>{children}</Text>;
}
export function H2({ children }: { children: ReactNode }) {
  return <Text style={styles.h2}>{children}</Text>;
}
export function Body({ children }: { children: ReactNode }) {
  return <Text style={styles.body}>{children}</Text>;
}
export function Muted({ children }: { children: ReactNode }) {
  return <Text style={styles.muted}>{children}</Text>;
}

const styles = StyleSheet.create({
  btn: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    alignItems: "center",
  },
  btnLabel: { color: "#fff", fontSize: font.body, fontWeight: "600" },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  h1: { fontSize: font.h1, fontWeight: "700", color: colors.text },
  h2: { fontSize: font.h2, fontWeight: "700", color: colors.text },
  body: { fontSize: font.body, color: colors.text, lineHeight: 22 },
  muted: { fontSize: font.small, color: colors.textMuted },
});
