import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Text } from 'react-native';

import { colors, font } from '../constants/theme';
import { RootTabParamList, RootStackParamList } from '../types';

import HomeScreen from '../screens/HomeScreen';
import FlockScreen from '../screens/FlockScreen';
import EggLogScreen from '../screens/EggLogScreen';
import FeedScreen from '../screens/FeedScreen';
import HatchScreen from '../screens/HatchScreen';
import AddBirdScreen from '../screens/AddBirdScreen';
import BirdDetailScreen from '../screens/BirdDetailScreen';
import AddHealthScreen from '../screens/AddHealthScreen';

const Tab = createBottomTabNavigator<RootTabParamList>();
const Stack = createStackNavigator<RootStackParamList>();

const TAB_ICONS: Record<string, string> = {
  Home: '🏠',
  Flock: '🐔',
  Eggs: '🥚',
  Feed: '🌾',
  Hatch: '🐣',
};

function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused }) => (
          <Text style={{ fontSize: focused ? 22 : 20, opacity: focused ? 1 : 0.5 }}>
            {TAB_ICONS[route.name] ?? '●'}
          </Text>
        ),
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
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Flock" component={FlockScreen} />
      <Tab.Screen name="Eggs" component={EggLogScreen} />
      <Tab.Screen name="Feed" component={FeedScreen} />
      <Tab.Screen name="Hatch" component={HatchScreen} />
    </Tab.Navigator>
  );
}

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Main" component={Tabs} />
        <Stack.Screen
          name="AddBird"
          component={AddBirdScreen}
          options={{ presentation: 'modal' }}
        />
        <Stack.Screen name="BirdDetail" component={BirdDetailScreen} />
        <Stack.Screen
          name="AddHealth"
          component={AddHealthScreen}
          options={{ presentation: 'modal' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
