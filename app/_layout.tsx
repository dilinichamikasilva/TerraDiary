import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "../service/firebaseConfig";
import { View, ActivityIndicator } from "react-native";
import Toast from "react-native-toast-message";
import "../global.css";

export default function RootLayout() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return unsub;
  }, []);

 
  if (loading) {
    return (
      <View className="flex-1 bg-slate-950 items-center justify-center">
        <ActivityIndicator size="large" color="#10b981" />
      </View>
    );
  }

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        {user ? (
          
          <Stack.Screen name="(tabs)" />
        ) : (
         
          <Stack.Screen name="(auth)" />
        )}

        {/* Shared screens */}
        <Stack.Screen
          name="add-entry"
          options={{ presentation: "modal" }}
        />
      </Stack>

      <Toast />
    </>
  );
}

