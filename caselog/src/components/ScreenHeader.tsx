import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  title: string;
  right?: React.ReactNode;
};

export default function ScreenHeader({ title, right }: Props) {
  return (
    <View style={styles.header}>
      <Text style={styles.title}>{title}</Text>
      {right ?? null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1, borderBottomColor: '#f1f5f9',
  },
  title: { fontSize: 26, fontWeight: '800', color: '#1e1b4b', letterSpacing: -0.5 },
  addBtn: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: '#4f46e5',
    justifyContent: 'center', alignItems: 'center',
  },
});
