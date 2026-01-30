import { Stack } from "expo-router";
import Toast from "react-native-toast-message";
import { useContext } from "react";
import { View, ActivityIndicator } from "react-native";
import { LoaderProvider } from "../context/LoaderContext"; 
import { AuthProvider, AuthContext } from "../context/AuthContext";
import "../global.css";

function RootLayoutNav() {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <View className="flex-1 bg-slate-950 items-center justify-center">
        <ActivityIndicator size="large" color="#10b981" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {user ? (
        <Stack.Screen name="(tabs)" />
      ) : (
        <Stack.Screen name="(auth)" />
      )}
      <Stack.Screen
        name="add-entry"
        options={{ presentation: "modal" }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <LoaderProvider>
      <AuthProvider>
        <RootLayoutNav />
        <Toast />
      </AuthProvider>
    </LoaderProvider>
  );
}
