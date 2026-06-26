import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import FinanceMenuScreen from '../screens/FinanceMenuScreen';
import ExpenseTrackerScreen from '../screens/ExpenseTrackerScreen';
import AssetInventoryScreen from '../screens/AssetInventoryScreen';

const Stack = createNativeStackNavigator();

export default function FinanceStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="FinanceMenu" component={FinanceMenuScreen} />
      <Stack.Screen name="ExpenseTracker" component={ExpenseTrackerScreen} />
      <Stack.Screen name="AssetInventory" component={AssetInventoryScreen} />
    </Stack.Navigator>
  );
}
