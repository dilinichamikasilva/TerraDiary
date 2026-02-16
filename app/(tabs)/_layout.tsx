import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Platform, View, StyleSheet } from 'react-native';

interface TabIconProps {
  color: string;
  size: number;
  focused: boolean;
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#10b981',
        tabBarInactiveTintColor: '#64748b', 
        
        tabBarStyle: {
          position: 'absolute',
          borderTopWidth: 0,
          elevation: 0,
          backgroundColor: '#020617', 
          
      
          bottom: 20, 
          left: 20,
          right: 20,
          
          height: 64,
          borderRadius: 32,
          paddingBottom: 0, 
          
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.3,
          shadowRadius: 20,
        },


        tabBarBackground: () => (
          Platform.OS === 'ios' ? (
            <BlurView 
              intensity={80} 
              tint="dark" 
              style={[StyleSheet.absoluteFill, { borderRadius: 32, overflow: 'hidden' }]} 
            />
          ) : null
        ),
        

        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          marginBottom: 8,
        },
        tabBarIconStyle: {
          marginTop: 8,
        }
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Timeline',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="journal-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="feed"
        options={{
          title: 'Feed',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons 
              name={focused ? "list" : "list-outline"} 
              size={size} 
              color={color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: 'World Map',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="map-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="passport" 
        options={{
          title: 'Passport',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons 
              name={focused ? "ribbon" : "ribbon-outline"} 
              size={size} 
              color={color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}


