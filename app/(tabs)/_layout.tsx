import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Platform, View } from 'react-native';

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
          height: Platform.OS === 'ios' ? 90 : 70,
          backgroundColor: '#020617', 
        },
        tabBarBackground: () => (
          Platform.OS === 'ios' ? (
            <BlurView intensity={80} tint="dark" style={{ flex: 1 }} />
          ) : null
        ),
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Timeline',
          tabBarIcon: ({ color, size }) => <Ionicons name="journal-outline" size={size} color={color} />,
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
          tabBarIcon: ({ color, size }) => <Ionicons name="map-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}