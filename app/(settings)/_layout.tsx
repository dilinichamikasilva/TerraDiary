import { Stack } from 'expo-router';

export default function SettingsLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#020617' }, 
        headerTintColor: '#10b981',                  
        headerTitleStyle: { fontWeight: 'bold' },
        headerShadowVisible: false,
        animation: 'slide_from_right',              
      }}
    >
      <Stack.Screen name="account-settings" options={{ title: 'Account' }} />
      <Stack.Screen name="notifications" options={{ title: 'Notifications' }} />
      <Stack.Screen name="privacy-security" options={{ title: 'Privacy & Security' }} />
    </Stack>
  );
}