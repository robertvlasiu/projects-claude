import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Platform } from 'react-native';

import DashboardScreen from '../screens/DashboardScreen';
import LogStackScreen from './LogStack';
import LegalStackScreen from './LegalStack';
import FinanceStackScreen from './FinanceStack';
import MoreStackScreen from './MoreStack';

const Tab = createBottomTabNavigator();

// Each section tab resets to its feature menu when tapped, so tabs always show
// the list of features — never a deep sub-screen left over from a shortcut.
const ROOT_SCREEN: Record<string, string> = {
  Log: 'LogMenu',
  Legal: 'LegalMenu',
  Finance: 'FinanceMenu',
  More: 'MoreMenu',
};

const resetToMenu = ({ navigation, route }: any) => ({
  tabPress: () => {
    const root = ROOT_SCREEN[route.name];
    if (root) navigation.navigate(route.name, { screen: root });
  },
});

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#4f46e5',
        tabBarInactiveTintColor: '#94a3b8',
        tabBarStyle: {
          height: Platform.OS === 'ios' ? 88 : 64,
          paddingBottom: Platform.OS === 'ios' ? 28 : 10,
          paddingTop: 8,
          borderTopColor: '#f1f5f9',
          backgroundColor: '#fff',
          shadowColor: '#94a3b8',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.06,
          shadowRadius: 12,
          elevation: 8,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarIcon: ({ color, size, focused }) => {
          const icons: Record<string, { active: keyof typeof Ionicons.glyphMap; inactive: keyof typeof Ionicons.glyphMap }> = {
            Dashboard: { active: 'home', inactive: 'home-outline' },
            Log: { active: 'journal', inactive: 'journal-outline' },
            Legal: { active: 'briefcase', inactive: 'briefcase-outline' },
            Finance: { active: 'cash', inactive: 'cash-outline' },
            More: { active: 'grid', inactive: 'grid-outline' },
          };
          const icon = icons[route.name];
          return <Ionicons name={focused ? icon.active : icon.inactive} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Log" component={LogStackScreen} listeners={resetToMenu} />
      <Tab.Screen name="Legal" component={LegalStackScreen} listeners={resetToMenu} />
      <Tab.Screen name="Finance" component={FinanceStackScreen} listeners={resetToMenu} />
      <Tab.Screen name="More" component={MoreStackScreen} listeners={resetToMenu} />
    </Tab.Navigator>
  );
}
