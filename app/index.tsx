import { Redirect } from "expo-router";
import { auth } from "../firebaseConfig";
import { View, ActivityIndicator } from "react-native";
import { useEffect, useState } from "react";
import { onAuthStateChanged , User } from "firebase/auth";

export default function Index() {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setInitializing(false);
    });
    return unsubscribe;
  }, []);

  if (initializing) {
    return (
      <View className="flex-1 bg-slate-950 justify-center items-center">
        <ActivityIndicator size="large" color="#10b981" />
      </View>
    );
  }

  return user ? <Redirect href="/(tabs)/map" /> : <Redirect href="/(auth)/login" />;
}