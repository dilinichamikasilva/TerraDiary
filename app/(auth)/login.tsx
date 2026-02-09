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
import { loginUser, syncUserToFirestore, resetPassword } from '../../service/authService';
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
  const [showPassword, setShowPassword] = useState(false); 
  const router = useRouter();

  const REDIRECT_URI = 'https://auth.expo.io/@dilini713/terra-diary';

  const [fbRequest, fbResponse, fbPromptAsync] = Facebook.useAuthRequest({
    clientId: process.env.EXPO_PUBLIC_FACEBOOK_APP_ID,
  });

  const [gRequest, gResponse, gPromptAsync] = Google.useAuthRequest({
    clientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    redirectUri: REDIRECT_URI,
  });

  // Handle Firebase Errors 
  const handleAuthError = (error: any) => {
    let message = "An unexpected error occurred.";

    switch (error.code) {
      case 'auth/invalid-credential':
      case 'auth/user-not-found':
      case 'auth/wrong-password':
        message = "Invalid email or password. Please try again.";
        break;
      case 'auth/invalid-email':
        message = "Please enter a valid email address.";
        break;
      case 'auth/user-disabled':
        message = "This account has been disabled.";
        break;
      case 'auth/too-many-requests':
        message = "Too many failed attempts. Please try again later.";
        break;
      case 'auth/network-request-failed':
        message = "Network error. Check your internet connection.";
        break;
      default:
        message = error.message || message;
    }

    Toast.show({ type: 'error', text1: 'Auth Error', text2: message });
  };

  // SOCIAL LOGIN HANDLER
  const handleSocialLogin = async (credential: any, providerName: string) => {
    setLoading(true);
    try {
      const result = await signInWithCredential(auth, credential);
      await syncUserToFirestore(result.user); 
      Toast.show({ type: 'success', text1: `Welcome, ${result.user.displayName}! 🎉` });
      router.replace("/(tabs)/home");
    } catch (error: any) {
      handleAuthError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (fbResponse?.type === 'success') {
      const { access_token } = fbResponse.params;
      handleSocialLogin(FacebookAuthProvider.credential(access_token), 'Facebook');
    }
    if (gResponse?.type === 'success') {
      const idToken = gResponse.authentication?.idToken;
      if (idToken) {
        handleSocialLogin(GoogleAuthProvider.credential(idToken), 'Google');
      }
    }
    
    if (fbResponse?.type === 'cancel' || gResponse?.type === 'cancel' || fbResponse?.type === 'error' || gResponse?.type === 'error') {
        setLoading(false);
    }
  }, [fbResponse, gResponse]);

  // EMAIL LOGIN HANDLER
  const handleEmailLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Toast.show({ type: 'info', text1: 'Missing Fields', text2: 'Please enter both email and password' });
      return;
    }
    
    setLoading(true);
    try {
      await loginUser(email.trim(), password.trim());
      Toast.show({ type: 'success', text1: 'Login Successful! 🎉' });
      router.replace("/(tabs)/home");
    } catch (error: any) {
      handleAuthError(error);
    } finally {
      setLoading(false); 
    }
  };

  // FORGOT PASSWORD HANDLER
  const handleForgotPassword = async () => {
    if (!email.trim()) {
      Toast.show({ type: 'info', text1: 'Email Required', text2: 'Enter your email to reset password' });
      return;
    }

    setLoading(true);
    try {
      await resetPassword(email);
      Toast.show({ 
        type: 'success', 
        text1: 'Reset Email Sent', 
        text2: 'Check your inbox for instructions.' 
      });
    } catch (error: any) {
      handleAuthError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View className="flex-1 bg-slate-950">
        {/* Background Decorative Blurs */}
        <View className="absolute top-[-50] left-[-50] w-72 h-72 bg-emerald-500/10 rounded-full blur-[80px]" />
        <View className="absolute bottom-[-50] right-[-50] w-96 h-96 bg-blue-500/10 rounded-full blur-[100px]" />

        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
          <ScrollView 
            contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }} 
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View className="px-6 items-center">
              
              <View className="items-center mb-10">
                <View className="bg-emerald-500/10 p-4 rounded-3xl border border-emerald-500/20 mb-4">
                  <Ionicons name="log-in-outline" size={48} color="#10b981" />
                </View>
                <Text className="text-white text-4xl font-black tracking-tight">Welcome Back</Text>
                <Text className="text-slate-400 mt-2 text-center text-base font-medium">Your adventures are waiting.</Text>
              </View>

              <View className="w-full bg-slate-900/60 p-6 rounded-[40px] border border-slate-800/50 shadow-2xl backdrop-blur-xl">
                {/* Email Input */}
                <TextInput
                  className="bg-slate-800/50 p-4 rounded-2xl mb-4 text-white border border-slate-700/50"
                  placeholder="Email Address"
                  placeholderTextColor="#64748b"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                  editable={!loading}
                />
                
                {/* Password Input with Visibility Toggle */}
                <View className="relative mb-2">
                  <TextInput
                    className="bg-slate-800/50 p-4 rounded-2xl text-white border border-slate-700/50 pr-12"
                    placeholder="Password"
                    placeholderTextColor="#64748b"
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={setPassword}
                    editable={!loading}
                  />
                  <TouchableOpacity 
                    className="absolute right-4 top-4" 
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Ionicons 
                      name={showPassword ? "eye-off-outline" : "eye-outline"} 
                      size={24} 
                      color="#64748b" 
                    />
                  </TouchableOpacity>
                </View>

                {/* Forgot Password Link */}
                <TouchableOpacity 
                  onPress={handleForgotPassword} 
                  className="mb-6 self-end"
                  disabled={loading}
                >
                  <Text className="text-emerald-400 font-medium text-sm">Forgot Password?</Text>
                </TouchableOpacity>

                {/* Login Button */}
                <TouchableOpacity 
                  onPress={handleEmailLogin} 
                  disabled={loading}
                  className={`p-5 rounded-2xl items-center ${loading ? 'bg-emerald-800' : 'bg-emerald-500'}`}
                  activeOpacity={0.8}
                >
                  {loading ? (
                    <ActivityIndicator color="#020617" />
                  ) : (
                    <Text className="text-slate-950 font-black text-lg uppercase tracking-wider">Login</Text>
                  )}
                </TouchableOpacity>

                <View className="flex-row items-center my-8">
                  <View className="flex-1 h-[1px] bg-slate-800" />
                  <Text className="text-slate-500 mx-4 text-xs font-bold uppercase tracking-widest">OR</Text>
                  <View className="flex-1 h-[1px] bg-slate-800" />
                </View>

                {/* Social Login Row */}
                <View className="flex-row justify-between mb-2">
                  <TouchableOpacity 
                    disabled={!gRequest || loading}
                    onPress={() => { setLoading(true); gPromptAsync(); }}
                    className={`bg-slate-800/50 p-4 rounded-2xl w-[48%] items-center border border-slate-700/50 ${(!gRequest || loading) ? 'opacity-50' : ''}`}
                  >
                    <AntDesign name="google" size={24} color="#ea4335" />
                  </TouchableOpacity>

                  <TouchableOpacity 
                    disabled={!fbRequest || loading}
                    onPress={() => { setLoading(true); fbPromptAsync(); }}
                    className={`bg-slate-800/50 p-4 rounded-2xl w-[48%] items-center border border-slate-700/50 ${(!fbRequest || loading) ? 'opacity-50' : ''}`}
                  >
                    <FontAwesome5 name="facebook" size={24} color="#1877f2" />
                  </TouchableOpacity>
                </View>

                {/* Register Link */}
                <TouchableOpacity onPress={() => router.push("/(auth)/register")} className="mt-6" disabled={loading}>
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