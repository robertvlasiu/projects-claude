import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import MoreMenuScreen from '../screens/MoreMenuScreen';
import CustodyCalendarScreen from '../screens/CustodyCalendarScreen';
import ContactsScreen from '../screens/ContactsScreen';
import ExportScreen from '../screens/ExportScreen';
import NotificationsScreen from '../screens/NotificationsScreen';

const Stack = createNativeStackNavigator();

export default function MoreStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MoreMenu" component={MoreMenuScreen} />
      <Stack.Screen name="CustodyCalendar" component={CustodyCalendarScreen} />
      <Stack.Screen name="Contacts" component={ContactsScreen} />
      <Stack.Screen name="Export" component={ExportScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
    </Stack.Navigator>
  );
}
