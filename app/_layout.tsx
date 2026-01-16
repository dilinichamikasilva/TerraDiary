import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "../firebaseConfig";
import Toast from 'react-native-toast-message';
import "../global.css";

export default function RootLayout() {
  const [user, setUser] = useState<User | null>(null);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    // Listen for authentication state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const inTabsGroup = segments[0] === "(tabs)";

    if (!user && inTabsGroup) {
      
      router.replace("/");
    } else if (user && !inTabsGroup) {
      
      router.replace("/(tabs)/map");
    }
  }, [user, segments]);

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
      </Stack>
      
      <Toast />
    </>
    
  );
}