import { Redirect } from "expo-router";
import { useAuth } from "../hooks/useAuth"; // Optional: if you make a hook later
import { auth } from "../firebaseConfig";

export default function Index() {
  // If user is already logged in, go to map. Otherwise, go to login.
  return auth.currentUser ? <Redirect href="/(tabs)/map" /> : <Redirect href="/(auth)/login" />;
}