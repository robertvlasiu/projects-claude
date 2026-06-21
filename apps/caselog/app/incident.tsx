/**
 * Log an incident. Captures category, title, factual details, when it occurred,
 * and optional photo/screenshot attachments. createdAt is stamped at save and
 * never editable — that separation is the credibility anchor (see types.ts).
 *
 * Edit mode: pass an `id` route param to edit an existing incident. Editing
 * touches only editable fields and records an `editedAt` stamp; createdAt and
 * the hash-chain anchors are never mutated (see store.updateIncident).
 */
import { useCallback, useEffect, useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";
import { Body, Button, DateTimeField, Muted } from "@/components/ui";
import { colors, radius, spacing } from "@/theme";
import { store, uid } from "@/data/store";
import type { Attachment, IncidentCategory } from "@/data/types";

const CATEGORIES: { kind: IncidentCategory; label: string }[] = [
  { kind: "missed_exchange", label: "Missed exchange" },
  { kind: "late", label: "Late" },
  { kind: "denied_visit", label: "Denied visit" },
  { kind: "hostile_comm", label: "Hostile message" },
  { kind: "safety", label: "Safety concern" },
  { kind: "other", label: "Other" },
];

export default function LogIncident() {
  const params = useLocalSearchParams<{ id?: string }>();
  const editId = params.id;
  const isEdit = !!editId;

  const [category, setCategory] = useState<IncidentCategory>("missed_exchange");
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [occurredAt, setOccurredAt] = useState(new Date().toISOString());
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(!isEdit);

  useEffect(() => {
    if (!editId) return;
    (async () => {
      const c = await store.getCase();
      if (!c) return;
      const found = (await store.getIncidents(c.id)).find((i) => i.id === editId);
      if (found) {
        setCategory(found.category);
        setTitle(found.title);
        setDetails(found.details);
        setAttachments(found.attachments);
        setOccurredAt(found.occurredAt);
      }
      setLoaded(true);
    })();
  }, [editId]);

  async function pickImage() {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });
    if (!res.canceled && res.assets[0]) {
      setAttachments((a) => [...a, { id: uid(), uri: res.assets[0].uri }]);
    }
  }

  const removeAttachment = useCallback((id: string) => {
    setAttachments((a) => a.filter((x) => x.id !== id));
  }, []);

  async function save() {
    if (saving) return;
    setSaving(true);
    const c = await store.getCase();
    if (!c) return router.replace("/onboarding");
    const resolvedTitle =
      title.trim() || CATEGORIES.find((x) => x.kind === category)!.label;
    if (isEdit && editId) {
      await store.updateIncident(editId, {
        category,
        title: resolvedTitle,
        details: details.trim(),
        attachments,
        occurredAt,
      });
    } else {
      await store.addIncident({
        id: uid(),
        caseId: c.id,
        category,
        title: resolvedTitle,
        details: details.trim(),
        attachments,
        occurredAt,
        createdAt: new Date().toISOString(),
      });
    }
    router.back();
  }

  async function remove() {
    if (!editId) return;
    await store.deleteIncident(editId);
    router.back();
  }

  if (!loaded) return null;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Body>Category</Body>
      <View style={styles.chips}>
        {CATEGORIES.map((c) => {
          const on = category === c.kind;
          return (
            <Pressable
              key={c.kind}
              onPress={() => setCategory(c.kind)}
              style={[styles.chip, on && styles.chipOn]}
            >
              <Text style={[styles.chipText, on && styles.chipTextOn]}>
                {c.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={{ height: spacing.md }} />
      <Body>What happened (short title)</Body>
      <TextInput
        value={title}
        onChangeText={setTitle}
        placeholder="e.g. Did not show for 5pm pickup"
        placeholderTextColor={colors.textMuted}
        style={styles.input}
      />

      <View style={{ height: spacing.md }} />
      <Body>Details — facts, not feelings</Body>
      <TextInput
        value={details}
        onChangeText={setDetails}
        placeholder="Waited at agreed location 5:00–5:45pm. No contact. Returned home with child."
        placeholderTextColor={colors.textMuted}
        multiline
        style={[styles.input, { height: 120, textAlignVertical: "top" }]}
      />

      <View style={{ height: spacing.md }} />
      <DateTimeField
        label="When did it happen?"
        value={occurredAt}
        onChange={setOccurredAt}
      />

      <View style={{ height: spacing.md }} />
      <Button label="📎 Attach photo / screenshot" variant="secondary" onPress={pickImage} />
      <View style={styles.thumbs}>
        {attachments.map((a) => (
          <Pressable key={a.id} onLongPress={() => removeAttachment(a.id)}>
            <Image source={{ uri: a.uri }} style={styles.thumb} />
          </Pressable>
        ))}
      </View>
      {attachments.length > 0 ? (
        <Muted>Long-press an attachment to remove it.</Muted>
      ) : null}

      <View style={{ height: spacing.lg }} />
      <Button
        label={isEdit ? "Save changes" : "Save to record"}
        onPress={save}
        disabled={saving}
      />
      {isEdit ? (
        <>
          <View style={{ height: spacing.sm }} />
          <Button label="Delete entry" variant="danger" onPress={remove} />
          <Muted>
            Editing records an "edited at" stamp. The original logged time is
            never changed.
          </Muted>
        </>
      ) : (
        <Muted>
          The logged time is stamped now and cannot be backdated. Use "When did
          it happen?" above to record the actual event time.
        </Muted>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.lg },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginTop: spacing.sm },
  chip: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.text },
  chipTextOn: { color: "#fff", fontWeight: "600" },
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
  thumbs: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginTop: spacing.sm },
  thumb: { width: 72, height: 72, borderRadius: radius.sm },
});
