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
import { signInWithEmailAndPassword, FacebookAuthProvider, signInWithCredential } from 'firebase/auth';
import { useRouter } from 'expo-router';
import Toast from 'react-native-toast-message'; 
import { AntDesign, FontAwesome5 } from '@expo/vector-icons'; 
import * as Facebook from 'expo-auth-session/providers/facebook'; 
import * as WebBrowser from 'expo-web-browser';
import "../../global.css";

// Required for web-based auth sessions
WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false); 
  const router = useRouter();

  // --- Facebook Auth Hook ---
  const [request, response, promptAsync] = Facebook.useAuthRequest({
    clientId: process.env.EXPO_PUBLIC_FACEBOOK_APP_ID, 
  });

  // Handle Facebook Response
  useEffect(() => {
    if (response?.type === 'success') {
      const { access_token } = response.params;
      handleFacebookLogin(access_token);
    }
  }, [response]);

  const handleFacebookLogin = async (token: string) => {
    setLoading(true);
    try {
      const credential = FacebookAuthProvider.credential(token);
      await signInWithCredential(auth, credential);
      Toast.show({
        type: 'success',
        text1: 'Welcome!',
        text2: 'Logged in with Facebook 🌊',
      });
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Facebook Login Failed',
        text2: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  // --- Email/Password Login ---
  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Toast.show({ type: 'error', text1: 'Required', text2: 'Please fill in all fields ✍️' });
      return;
    }

    if (!validateEmail(email.trim())) {
      Toast.show({ type: 'error', text1: 'Invalid Email', text2: 'Please enter a valid email address 📧' });
      return;
    }

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      Toast.show({
        type: 'success',
        text1: 'Welcome Back!',
        text2: 'Redirecting to your diary... 🗺️',
      });
    } catch (error: any) {
      let errorMessage = "Check your credentials and try again.";
      if (error.code === 'auth/invalid-credential') errorMessage = "Invalid email or password.";
      else if (error.code === 'auth/too-many-requests') errorMessage = "Too many attempts. Try again later.";
      
      Toast.show({ type: 'error', text1: 'Login Failed', text2: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View className="flex-1 bg-slate-950 justify-center px-8">
        <Text className="text-white text-4xl font-bold mb-2 text-emerald-500 tracking-tighter">
          TerraDiary
        </Text>
        <Text className="text-slate-400 mb-8 text-lg font-medium">Sign in to continue.</Text>

        <View className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-2xl">
          <TextInput
            className="bg-slate-800 p-4 rounded-xl mb-4 text-white border border-slate-700 focus:border-emerald-500"
            placeholder="Email"
            placeholderTextColor="#64748b"
            autoCapitalize="none"
            keyboardType="email-address"
            autoCorrect={false}
            onChangeText={setEmail}
            value={email}
            editable={!loading}
          />
          <TextInput
            className="bg-slate-800 p-4 rounded-xl mb-6 text-white border border-slate-700 focus:border-emerald-500"
            placeholder="Password"
            placeholderTextColor="#64748b"
            secureTextEntry
            onChangeText={setPassword}
            value={password}
            editable={!loading}
          />

          <TouchableOpacity 
            onPress={handleLogin} 
            activeOpacity={0.7}
            disabled={loading}
            className={`p-4 rounded-xl shadow-lg ${loading ? 'bg-emerald-800' : 'bg-emerald-500'}`}
          >
            {loading ? <ActivityIndicator color="#020617" /> : <Text className="text-slate-950 text-center font-bold text-lg">Login</Text>}
          </TouchableOpacity>

          {/* Divider */}
          <View className="flex-row items-center my-6">
            <View className="flex-1 h-[1px] bg-slate-800" />
            <Text className="text-slate-500 mx-4">or continue with</Text>
            <View className="flex-1 h-[1px] bg-slate-800" />
          </View>

          {/* Social Buttons Row */}
          <View className="flex-row justify-between">
            <TouchableOpacity 
              className="bg-slate-800 p-4 rounded-2xl border border-slate-700 w-[48%] items-center"
              onPress={() => {/* Add Google prompt here later */}}
            >
              <AntDesign name="google" size={24} color="#ea4335" />
            </TouchableOpacity>

            <TouchableOpacity 
              className="bg-slate-800 p-4 rounded-2xl border border-slate-700 w-[48%] items-center"
              disabled={!request || loading}
              onPress={() => promptAsync()}
            >
              <FontAwesome5 name="facebook" size={24} color="#1877f2" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            onPress={() => router.push("/(auth)/register")} 
            className="mt-6"
            disabled={loading}
          >
            <Text className="text-slate-400 text-center font-medium">
              New traveler? <Text className="text-emerald-500 font-bold underline">Register</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}