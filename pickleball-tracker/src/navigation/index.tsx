import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Text } from 'react-native';

import { colors, font } from '../constants/theme';
import { RootTabParamList, RootStackParamList } from '../types';

import HomeScreen from '../screens/HomeScreen';
import MatchesScreen from '../screens/MatchesScreen';
import SkillsScreen from '../screens/SkillsScreen';
import DrillsScreen from '../screens/DrillsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import LogMatchScreen from '../screens/LogMatchScreen';

const Tab = createBottomTabNavigator<RootTabParamList>();
const Stack = createStackNavigator<RootStackParamList>();

const TAB_ICONS: Record<string, { active: string; inactive: string }> = {
  Home: { active: '🏠', inactive: '🏠' },
  Matches: { active: '📋', inactive: '📋' },
  Skills: { active: '📊', inactive: '📊' },
  Drills: { active: '⏱', inactive: '⏱' },
  Settings: { active: '👤', inactive: '👤' },
};

function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused }) => {
          const icons = TAB_ICONS[route.name];
          return (
            <Text style={{ fontSize: focused ? 22 : 20, opacity: focused ? 1 : 0.5 }}>
              {icons?.active ?? '●'}
            </Text>
          );
        },
        tabBarLabel: ({ focused }) => (
          <Text
            style={{
              fontSize: font.xs,
              fontWeight: focused ? '700' : '500',
              color: focused ? colors.primary : colors.textMuted,
              marginBottom: 2,
            }}
          >
            {route.name}
          </Text>
        ),
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: 60,
          paddingTop: 6,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Matches" component={MatchesScreen} />
      <Tab.Screen name="Skills" component={SkillsScreen} />
      <Tab.Screen name="Drills" component={DrillsScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Main" component={Tabs} />
        <Stack.Screen
          name="LogMatch"
          component={LogMatchScreen}
          options={{ presentation: 'modal' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
