/**
 * Onboarding — create the single Case. Deliberately fast and reassuring; this
 * audience is stressed. One screen, then straight into logging.
 */
import { useState } from "react";
import { ScrollView, StyleSheet, TextInput, View } from "react-native";
import { router } from "expo-router";
import { Body, Button, H1, Muted } from "@/components/ui";
import { colors, radius, spacing } from "@/theme";
import { store, uid } from "@/data/store";

export default function Onboarding() {
  const [label, setLabel] = useState("");
  const [children, setChildren] = useState("");
  const [otherParty, setOtherParty] = useState("");

  async function finish() {
    await store.saveCase({
      id: uid(),
      label: label.trim() || "My custody case",
      childrenFirstNames: children
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      otherPartyName: otherParty.trim() || undefined,
      createdAt: new Date().toISOString(),
    });
    router.replace("/");
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <H1>Start documenting</H1>
      <Muted>
        Private and on your device. Build an organized record to share with your
        attorney — starting today.
      </Muted>

      <View style={{ height: spacing.lg }} />
      <Body>Name this case</Body>
      <TextInput
        value={label}
        onChangeText={setLabel}
        placeholder="e.g. Custody — A.J."
        placeholderTextColor={colors.textMuted}
        style={styles.input}
      />

      <View style={{ height: spacing.md }} />
      <Body>Children's first names (comma separated)</Body>
      <TextInput
        value={children}
        onChangeText={setChildren}
        placeholder="e.g. Mia, Noah"
        placeholderTextColor={colors.textMuted}
        style={styles.input}
      />

      <View style={{ height: spacing.md }} />
      <Body>Other parent's name (optional)</Body>
      <TextInput
        value={otherParty}
        onChangeText={setOtherParty}
        placeholder="optional"
        placeholderTextColor={colors.textMuted}
        style={styles.input}
      />

      <View style={{ height: spacing.xl }} />
      <Button label="Create my case" onPress={finish} />
      <Muted>
        Caselog helps you organize personal documentation. It is not legal advice.
      </Muted>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.lg, paddingTop: spacing.xl * 2 },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    fontSize: 16,
    backgroundColor: colors.surface,
    marginTop: spacing.sm,
    color: colors.text,
  },
});
