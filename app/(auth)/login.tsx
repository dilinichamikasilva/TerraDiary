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
import { useRouter } from 'expo-router';
import Toast from 'react-native-toast-message'; 
import { AntDesign, FontAwesome5, Ionicons } from '@expo/vector-icons'; 

// Auth Imports
import { auth } from '../../service/firebaseConfig';
import { loginUser, syncUserToFirestore } from '../../service/authService';
import { 
  FacebookAuthProvider, 
  GoogleAuthProvider, 
  signInWithCredential 
} from 'firebase/auth';

// Expo Social Auth
import * as Facebook from 'expo-auth-session/providers/facebook'; 
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false); 
  const router = useRouter();

  // Facebook Config
  const [fbRequest, fbResponse, fbPromptAsync] = Facebook.useAuthRequest({
    clientId: process.env.EXPO_PUBLIC_FACEBOOK_APP_ID,
  });

  // Google Config
  const [gRequest, gResponse, gPromptAsync] = Google.useAuthRequest({
  
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
});

  // Handle Social Responses
  useEffect(() => {
    if (fbResponse?.type === 'success') {
      const { access_token } = fbResponse.params;
      handleSocialLogin(FacebookAuthProvider.credential(access_token), 'Facebook');
    }
    if (gResponse?.type === 'success') {
      const { id_token } = gResponse.params;
      handleSocialLogin(GoogleAuthProvider.credential(id_token), 'Google');
    }
  }, [fbResponse, gResponse]);

  const handleSocialLogin = async (credential: any, providerName: string) => {
    setLoading(true);
    try {
      const result = await signInWithCredential(auth, credential);
      await syncUserToFirestore(result.user); 
      
      Toast.show({ type: 'success', text1: `Logged in with ${providerName} 🎉` });
      router.replace("/(tabs)/home"); 
    } catch (error: any) {
      Toast.show({ type: 'error', text1: 'Social Login Failed', text2: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async () => {
    if (!email || !password) {
      Toast.show({ type: 'info', text1: 'Required', text2: 'Please fill in all fields' });
      return;
    }
    setLoading(true);
    try {
      await loginUser(email, password);
      router.replace("/(tabs)/home");
    } catch (error: any) {
      Toast.show({ 
        type: 'error', 
        text1: 'Login Failed', 
        text2: 'Invalid email or password.' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View className="flex-1 bg-slate-950">
        {/* Decorative Background Glows */}
        <View className="absolute top-[-50] left-[-50] w-72 h-72 bg-emerald-500/10 rounded-full blur-[80px]" />
        <View className="absolute bottom-[-50] right-[-50] w-96 h-96 bg-blue-500/10 rounded-full blur-[100px]" />

        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
          <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }} showsVerticalScrollIndicator={false}>
            <View className="px-6 items-center">
              
              {/* Logo/Header */}
              <View className="items-center mb-10">
                <View className="bg-emerald-500/10 p-4 rounded-3xl border border-emerald-500/20 mb-4">
                  <Ionicons name="log-in-outline" size={48} color="#10b981" />
                </View>
                <Text className="text-white text-4xl font-black tracking-tight">Welcome Back</Text>
                <Text className="text-slate-400 mt-2 text-center text-base font-medium">Your adventures are waiting.</Text>
              </View>

              {/* Form Container */}
              <View className="w-full bg-slate-900/60 p-6 rounded-[40px] border border-slate-800/50 shadow-2xl backdrop-blur-xl">
                <TextInput
                  className="bg-slate-800/50 p-4 rounded-2xl mb-4 text-white border border-slate-700/50"
                  placeholder="Email Address"
                  placeholderTextColor="#64748b"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
                
                <TextInput
                  className="bg-slate-800/50 p-4 rounded-2xl mb-6 text-white border border-slate-700/50"
                  placeholder="Password"
                  placeholderTextColor="#64748b"
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                />

                <TouchableOpacity 
                  onPress={handleEmailLogin} 
                  disabled={loading}
                  className={`p-5 rounded-2xl items-center ${loading ? 'bg-emerald-800' : 'bg-emerald-500'}`}
                >
                  {loading ? <ActivityIndicator color="#020617" /> : <Text className="text-slate-950 font-black text-lg uppercase tracking-wider">Login</Text>}
                </TouchableOpacity>

                {/* Divider */}
                <View className="flex-row items-center my-8">
                  <View className="flex-1 h-[1px] bg-slate-800" />
                  <Text className="text-slate-500 mx-4 text-xs font-bold uppercase tracking-widest">OR</Text>
                  <View className="flex-1 h-[1px] bg-slate-800" />
                </View>

                {/* Social Buttons */}
                <View className="flex-row justify-between mb-2">
                  <TouchableOpacity 
                    disabled={!gRequest}
                    onPress={() => gPromptAsync()}
                    className="bg-slate-800/50 p-4 rounded-2xl w-[48%] items-center border border-slate-700/50" 
                  >
                    <AntDesign name="google" size={24} color="#ea4335" />
                  </TouchableOpacity>

                  <TouchableOpacity 
                    disabled={!fbRequest}
                    onPress={() => fbPromptAsync()}
                    className="bg-slate-800/50 p-4 rounded-2xl w-[48%] items-center border border-slate-700/50" 
                  >
                    <FontAwesome5 name="facebook" size={24} color="#1877f2" />
                  </TouchableOpacity>
                </View>

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