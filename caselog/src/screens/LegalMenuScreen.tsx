import React from 'react';
import MenuScreen, { MenuItem } from '../components/MenuScreen';

const ITEMS: MenuItem[] = [
  { label: 'Document Vault', description: 'Securely store court orders, agreements, and legal files', icon: 'folder-open', color: '#4f46e5', bg: '#eef2ff', screen: 'DocumentVault' },
  { label: 'Court Timeline', description: 'Track hearings, deadlines, and filing dates', icon: 'calendar', color: '#ec4899', bg: '#fdf2f8', screen: 'CourtTimeline' },
  { label: 'Attorney Notes', description: 'Private notes per meeting with your lawyer', icon: 'briefcase', color: '#10b981', bg: '#ecfdf5', screen: 'AttorneyNotes' },
];

export default function LegalMenuScreen({ navigation }: any) {
  return <MenuScreen title="Legal" subtitle="Your legal case, organized" items={ITEMS} navigation={navigation} />;
}
