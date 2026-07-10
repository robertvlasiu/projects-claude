import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Alert, StyleSheet, TouchableOpacity, View } from 'react-native';

type Props = {
  onEdit: () => void;
  onDelete: () => void;
  deleteMessage?: string;
  iconSize?: number;
};

export default function RecordActions({ onEdit, onDelete, deleteMessage = 'Remove this entry?', iconSize = 16 }: Props) {
  function confirmDelete() {
    Alert.alert('Delete?', deleteMessage, [
      { text: 'Cancel' },
      { text: 'Delete', style: 'destructive', onPress: onDelete },
    ]);
  }

  return (
    <View style={styles.row}>
      <TouchableOpacity onPress={onEdit} hitSlop={8}>
        <Ionicons name="create-outline" size={iconSize} color="#94a3b8" />
      </TouchableOpacity>
      <TouchableOpacity onPress={confirmDelete} hitSlop={8}>
        <Ionicons name="trash-outline" size={iconSize} color="#cbd5e1" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
});
