import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  TouchableWithoutFeedback, 
  Keyboard,
  ActivityIndicator 
} from 'react-native';
import { auth } from '../../firebaseConfig';
import { 
  signInWithEmailAndPassword, 
  FacebookAuthProvider, 
  GoogleAuthProvider, 
  signInWithCredential 
} from 'firebase/auth';
import { useRouter } from 'expo-router';
import Toast from 'react-native-toast-message'; 
import { AntDesign, FontAwesome5 } from '@expo/vector-icons'; 
import * as Facebook from 'expo-auth-session/providers/facebook'; 
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import "../../global.css";

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false); 
  const router = useRouter();

  // --- Facebook Auth Hook ---
  const [fbRequest, fbResponse, fbPromptAsync] = Facebook.useAuthRequest({
    clientId: process.env.EXPO_PUBLIC_FACEBOOK_APP_ID, 
  });

  // --- Google Auth Hook  ---
  const [gRequest, gResponse, gPromptAsync] = Google.useAuthRequest({

    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    
    // Add these using the SAME Web ID to stop the crash
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  });

  useEffect(() => {
    if (fbResponse?.type === 'success') {
      const { access_token } = fbResponse.params;
      handleSocialLogin(FacebookAuthProvider.credential(access_token), 'Facebook');
    }
  }, [fbResponse]);

  useEffect(() => {
    if (gResponse?.type === 'success') {
      const { id_token } = gResponse.params;
      handleSocialLogin(GoogleAuthProvider.credential(id_token), 'Google');
    }
  }, [gResponse]);

  const handleSocialLogin = async (credential: any, providerName: string) => {
    setLoading(true);
    try {
      await signInWithCredential(auth, credential);
      Toast.show({ type: 'success', text1: `Logged in with ${providerName} 🎉` });
    } catch (error: any) {
      Toast.show({ type: 'error', text1: 'Login Failed', text2: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) return;
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (error: any) {
      Toast.show({ type: 'error', text1: 'Login Failed', text2: "Check your credentials." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View className="flex-1 bg-slate-950 justify-center px-8">
        <Text className="text-white text-4xl font-bold mb-2 text-emerald-500">TerraDiary</Text>
        
        <View className="bg-slate-900 p-6 rounded-3xl border border-slate-800">
          <TextInput
            className="bg-slate-800 p-4 rounded-xl mb-4 text-white border border-slate-700"
            placeholder="Email"
            placeholderTextColor="#64748b"
            onChangeText={setEmail}
            value={email}
          />
          <TextInput
            className="bg-slate-800 p-4 rounded-xl mb-6 text-white border border-slate-700"
            placeholder="Password"
            placeholderTextColor="#64748b"
            secureTextEntry
            onChangeText={setPassword}
            value={password}
          />

          <TouchableOpacity onPress={handleLogin} className="p-4 rounded-xl bg-emerald-500">
            {loading ? <ActivityIndicator color="#020617" /> : <Text className="text-slate-950 text-center font-bold">Login</Text>}
          </TouchableOpacity>

          <View className="flex-row items-center my-6">
            <View className="flex-1 h-[1px] bg-slate-800" />
            <Text className="text-slate-500 mx-4 text-xs font-bold uppercase">or</Text>
            <View className="flex-1 h-[1px] bg-slate-800" />
          </View>

          <View className="flex-row justify-between">
            <TouchableOpacity className="bg-slate-800 p-4 rounded-2xl w-[48%] items-center" onPress={() => gPromptAsync()}>
              <AntDesign name="google" size={24} color="#ea4335" />
            </TouchableOpacity>

            <TouchableOpacity className="bg-slate-800 p-4 rounded-2xl w-[48%] items-center" onPress={() => fbPromptAsync()}>
              <FontAwesome5 name="facebook" size={24} color="#1877f2" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={() => router.push("/(auth)/register")} className="mt-6">
            <Text className="text-slate-400 text-center">New traveler? <Text className="text-emerald-500 font-bold underline">Register</Text></Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}