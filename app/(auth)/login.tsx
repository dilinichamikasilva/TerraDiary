import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  TouchableWithoutFeedback, 
  Keyboard,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView
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
import { AntDesign, FontAwesome5, Ionicons } from '@expo/vector-icons'; 
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

  // --- Google Auth Hook ---
  const [gRequest, gResponse, gPromptAsync] = Google.useAuthRequest({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
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
      <View className="flex-1 bg-slate-950">
        
        {/* Decorative Background Glows (Same as Register) */}
        <View className="absolute top-[-50] left-[-50] w-72 h-72 bg-emerald-500/10 rounded-full blur-[80px]" />
        <View className="absolute bottom-[-50] right-[-50] w-96 h-96 bg-blue-500/10 rounded-full blur-[100px]" />

        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
          className="flex-1"
        >
          <ScrollView 
            contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
            showsVerticalScrollIndicator={false}
          >
            <View className="px-6 items-center">
              
              {/* Header Section */}
              <View className="items-center mb-10">
                <View className="bg-emerald-500/10 p-4 rounded-3xl border border-emerald-500/20 mb-4">
                  <Ionicons name="log-in-outline" size={48} color="#10b981" />
                </View>
                <Text className="text-white text-4xl font-black tracking-tight">Welcome Back</Text>
                <Text className="text-slate-400 mt-2 text-center text-base font-medium">
                  Your adventures are waiting for you.
                </Text>
              </View>

              {/* Main Glassmorphic Card */}
              <View className="w-full bg-slate-900/60 p-6 rounded-[40px] border border-slate-800/50 shadow-2xl backdrop-blur-xl">
                
                <TextInput
                  className="bg-slate-800/50 p-4 rounded-2xl mb-4 text-white border border-slate-700/50 focus:border-emerald-500"
                  placeholder="Email Address"
                  placeholderTextColor="#64748b"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  onChangeText={setEmail}
                  value={email}
                />
                
                <TextInput
                  className="bg-slate-800/50 p-4 rounded-2xl mb-6 text-white border border-slate-700/50 focus:border-emerald-500"
                  placeholder="Password"
                  placeholderTextColor="#64748b"
                  secureTextEntry
                  onChangeText={setPassword}
                  value={password}
                />

                <TouchableOpacity 
                  onPress={handleLogin} 
                  activeOpacity={0.8}
                  className={`p-5 rounded-2xl shadow-xl items-center ${loading ? 'bg-emerald-800' : 'bg-emerald-500'}`}
                >
                  {loading ? (
                    <ActivityIndicator color="#020617" />
                  ) : (
                    <Text className="text-slate-950 text-center font-black text-lg uppercase tracking-wider">Login</Text>
                  )}
                </TouchableOpacity>

                {/* Divider */}
                <View className="flex-row items-center my-8">
                  <View className="flex-1 h-[1px] bg-slate-800" />
                  <Text className="text-slate-500 mx-4 text-xs font-bold uppercase tracking-widest">or continue with</Text>
                  <View className="flex-1 h-[1px] bg-slate-800" />
                </View>

                {/* Social Buttons */}
                <View className="flex-row justify-between mb-2">
                  <TouchableOpacity 
                    className="bg-slate-800/50 p-4 rounded-2xl w-[48%] items-center border border-slate-700/50" 
                    onPress={() => gPromptAsync()}
                  >
                    <AntDesign name="google" size={24} color="#ea4335" />
                  </TouchableOpacity>

                  <TouchableOpacity 
                    className="bg-slate-800/50 p-4 rounded-2xl w-[48%] items-center border border-slate-700/50" 
                    onPress={() => fbPromptAsync()}
                  >
                    <FontAwesome5 name="facebook" size={24} color="#1877f2" />
                  </TouchableOpacity>
                </View>

                {/* Footer Link */}
                <TouchableOpacity onPress={() => router.push("/(auth)/register")} className="mt-6">
                  <Text className="text-slate-400 text-center font-medium">
                    New traveler? <Text className="text-emerald-400 font-bold underline">Register</Text>
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </TouchableWithoutFeedback>
  );
}