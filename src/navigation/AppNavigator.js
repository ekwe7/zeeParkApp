import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import * as Linking from 'expo-linking';

import LandingScreen from '../screens/auth/LandingScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import AdminLoginScreen from '../screens/auth/AdminLoginScreen';

import HomeScreen from '../screens/customer/HomeScreen';
import VehicleScreen from '../screens/customer/VehicleScreen';
import ParkingScreen from '../screens/customer/ParkingScreen';
import PaymentScreen from '../screens/customer/PaymentScreen';
import ProfileScreen from '../screens/customer/ProfileScreen';
import TicketScreen from '../screens/customer/TicketScreen';
import AllSpotsScreen from '../screens/customer/AllSpotsScreen';
import MyTicketsScreen from '../screens/customer/MyTicketsScreen';

import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import AdminZonesScreen from '../screens/admin/AdminZonesScreen';
import AdminSpotsScreen from '../screens/admin/AdminSpotsScreen';
import AdminRevenueScreen from '../screens/admin/AdminRevenueScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const linking = {
  prefixes: [Linking.createURL('/')],
  config: { screens: { Main: { screens: { Payment: 'payment' } } } },
};

function CustomerTabs() {
  const { theme } = useTheme();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.subtext,
        tabBarStyle: {
          backgroundColor: theme.background,
          borderTopColor: theme.border,
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarIcon: ({ color, focused }) => {
          const icons = {
            Home: focused ? 'map' : 'map-outline',
            Vehicles: focused ? 'car' : 'car-outline',
            Tickets: focused ? 'navigate-circle' : 'navigate-circle-outline',
            Profile: focused ? 'person' : 'person-outline',
          };
          return <Ionicons name={icons[route.name]} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Vehicles" component={VehicleScreen} />
      <Tab.Screen name="Tickets" component={ParkingScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function AdminTabs() {
  const { theme } = useTheme();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#B00020',
        tabBarInactiveTintColor: theme.subtext,
        tabBarStyle: {
          backgroundColor: theme.background,
          borderTopColor: theme.border,
          height: 60,
          paddingBottom: 8,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarIcon: ({ color, focused }) => {
          const icons = {
            Dashboard: focused ? 'grid' : 'grid-outline',
            Zones: focused ? 'layers' : 'layers-outline',
            Spots: focused ? 'location' : 'location-outline',
            Revenue: focused ? 'bar-chart' : 'bar-chart-outline',
          };
          return <Ionicons name={icons[route.name]} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={AdminDashboardScreen} />
      <Tab.Screen name="Zones" component={AdminZonesScreen} />
      <Tab.Screen name="Spots" component={AdminSpotsScreen} />
      <Tab.Screen name="Revenue" component={AdminRevenueScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { isLoggedIn, isLoading, user } = useAuth();
  const { theme } = useTheme();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.background }}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  const isAdmin = user?.role === 'ADMIN';

  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isLoggedIn ? (
          isAdmin ? (
            <Stack.Screen name="AdminMain" component={AdminTabs} />
          ) : (
            <>
              <Stack.Screen name="Main" component={CustomerTabs} />
              <Stack.Screen name="Payment" component={PaymentScreen} />
              <Stack.Screen name="Ticket" component={TicketScreen} />
              <Stack.Screen name="AllSpots" component={AllSpotsScreen} />
              <Stack.Screen name="MyTickets" component={MyTicketsScreen} />
            </>
          )
        ) : (
          <>
            <Stack.Screen name="Landing" component={LandingScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="AdminLogin" component={AdminLoginScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
