/**
 * Minimal shared UI primitives for Caselog. Keep new reusable bits here.
 */
import { ReactNode, useState } from "react";
import { Platform, Pressable, StyleSheet, Text, View, ViewStyle } from "react-native";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
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

/**
 * Cross-platform date+time picker field. Renders a tappable value; on Android
 * it opens the native date dialog then the time dialog, on iOS it reveals an
 * inline spinner. Calls `onChange` with the new ISO string. Used to set when an
 * event actually happened (occurredAt/scheduledAt) — never createdAt.
 */
export function DateTimeField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (iso: string) => void;
}) {
  const date = new Date(value);
  const [show, setShow] = useState(false);
  // Android needs a two-step flow: pick date, then pick time.
  const [androidMode, setAndroidMode] = useState<"date" | "time">("date");
  const [pendingDate, setPendingDate] = useState<Date | null>(null);

  function open() {
    if (Platform.OS === "android") {
      setAndroidMode("date");
      setPendingDate(null);
    }
    setShow(true);
  }

  function handleChange(event: DateTimePickerEvent, selected?: Date) {
    if (Platform.OS === "android") {
      if (event.type === "dismissed") {
        setShow(false);
        return;
      }
      if (androidMode === "date" && selected) {
        // Keep the chosen date, advance to time selection.
        setPendingDate(selected);
        setAndroidMode("time");
        return;
      }
      if (androidMode === "time" && selected) {
        const base = pendingDate ?? date;
        const merged = new Date(base);
        merged.setHours(selected.getHours(), selected.getMinutes(), 0, 0);
        onChange(merged.toISOString());
        setShow(false);
        return;
      }
      setShow(false);
      return;
    }
    // iOS / default: single datetime spinner.
    if (selected) onChange(selected.toISOString());
  }

  return (
    <View>
      <Body>{label}</Body>
      <Pressable onPress={open} style={styles.dateField}>
        <Text style={styles.dateText}>
          {date.toLocaleString("en-US", {
            weekday: "short",
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
          })}
        </Text>
        <Text style={styles.dateHint}>Tap to change</Text>
      </Pressable>
      {show && (
        <DateTimePicker
          value={
            Platform.OS === "android" && androidMode === "time" && pendingDate
              ? pendingDate
              : date
          }
          mode={Platform.OS === "android" ? androidMode : "datetime"}
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={handleChange}
        />
      )}
      {Platform.OS === "ios" && show && (
        <Pressable onPress={() => setShow(false)} style={styles.dateDone}>
          <Text style={styles.dateDoneText}>Done</Text>
        </Pressable>
      )}
    </View>
  );
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
  dateField: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    backgroundColor: colors.surface,
    marginTop: spacing.sm,
  },
  dateText: { fontSize: font.body, color: colors.text },
  dateHint: { fontSize: font.small, color: colors.textMuted },
  dateDone: { alignSelf: "flex-end", padding: spacing.sm },
  dateDoneText: { color: colors.primary, fontWeight: "600", fontSize: font.body },
});
