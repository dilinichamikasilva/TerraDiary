import React, { useState } from 'react';
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
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'expo-router';
import Toast from 'react-native-toast-message'; 
import "../../global.css";

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false); 
  const router = useRouter();

  const handleLogin = async () => {
    
    if (!email || !password) {
      Toast.show({
        type: 'error',
        text1: 'Oops!',
        text2: 'Please fill in all fields ✍️',
      });
      return;
    }

    setLoading(true);

    try {
      //Attempt Login
      await signInWithEmailAndPassword(auth, email, password);
      
      Toast.show({
        type: 'success',
        text1: 'Welcome Back!',
        text2: 'Redirecting to your diary... 🗺️',
      });

    } catch (error: any) {
      
      let errorMessage = "Check your credentials and try again.";
      
      if (error.code === 'auth/invalid-credential') {
        errorMessage = "Invalid email or password.";
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = "Too many attempts. Try again later.";
      }

      Toast.show({
        type: 'error',
        text1: 'Login Failed',
        text2: errorMessage,
      });
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
            {loading ? (
              <ActivityIndicator color="#020617" />
            ) : (
              <Text className="text-slate-950 text-center font-bold text-lg">Login</Text>
            )}
          </TouchableOpacity>

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