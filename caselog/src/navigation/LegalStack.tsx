import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import LegalMenuScreen from '../screens/LegalMenuScreen';
import DocumentVaultScreen from '../screens/DocumentVaultScreen';
import CourtTimelineScreen from '../screens/CourtTimelineScreen';
import AttorneyNotesScreen from '../screens/AttorneyNotesScreen';

const Stack = createNativeStackNavigator();

export default function LegalStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="LegalMenu" component={LegalMenuScreen} />
      <Stack.Screen name="DocumentVault" component={DocumentVaultScreen} />
      <Stack.Screen name="CourtTimeline" component={CourtTimelineScreen} />
      <Stack.Screen name="AttorneyNotes" component={AttorneyNotesScreen} />
    </Stack.Navigator>
  );
}
