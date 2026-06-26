import React from 'react';
import MenuScreen, { MenuItem } from '../components/MenuScreen';

const ITEMS: MenuItem[] = [
  { label: 'Incident Log', description: 'Record incidents with severity and attachments', icon: 'warning', color: '#ef4444', bg: '#fef2f2', screen: 'IncidentLog' },
  { label: 'Communication Log', description: 'Log calls, texts, and emails with the other party', icon: 'chatbubbles', color: '#0ea5e9', bg: '#f0f9ff', screen: 'CommunicationLog' },
  { label: 'Mood Journal', description: 'Private emotional check-ins and wellbeing tracking', icon: 'heart', color: '#f43f5e', bg: '#fff1f2', screen: 'MoodJournal' },
];

export default function LogMenuScreen({ navigation }: any) {
  return <MenuScreen title="Case Log" subtitle="Document everything that happens" items={ITEMS} navigation={navigation} />;
}
