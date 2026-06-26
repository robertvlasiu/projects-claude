import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import IncidentLogScreen from '../screens/IncidentLogScreen';
import CommunicationLogScreen from '../screens/CommunicationLogScreen';
import MoodJournalScreen from '../screens/MoodJournalScreen';
import LogMenuScreen from '../screens/LogMenuScreen';

const Stack = createNativeStackNavigator();

export default function LogStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="LogMenu" component={LogMenuScreen} />
      <Stack.Screen name="IncidentLog" component={IncidentLogScreen} />
      <Stack.Screen name="CommunicationLog" component={CommunicationLogScreen} />
      <Stack.Screen name="MoodJournal" component={MoodJournalScreen} />
    </Stack.Navigator>
  );
}
