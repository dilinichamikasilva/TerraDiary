import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { auth } from '../../firebaseConfig';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'expo-router';
import "../../global.css";

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      Alert.alert("Login Failed", error.message);
    }
  };

  return (
    <View className="flex-1 bg-slate-950 justify-center px-8">
      <Text className="text-white text-4xl font-bold mb-2 text-emerald-500">TerraDiary</Text>
      <Text className="text-slate-400 mb-8 text-lg">Sign in to continue.</Text>

      <View className="bg-slate-900 p-6 rounded-3xl border border-slate-800">
        <TextInput
          className="bg-slate-800 p-4 rounded-xl mb-4 text-white border border-slate-700 focus:border-emerald-500"
          placeholder="Email"
          placeholderTextColor="#64748b"
          onChangeText={setEmail}
        />
        <TextInput
          className="bg-slate-800 p-4 rounded-xl mb-6 text-white border border-slate-700 focus:border-emerald-500"
          placeholder="Password"
          placeholderTextColor="#64748b"
          secureTextEntry
          onChangeText={setPassword}
        />

        <TouchableOpacity onPress={handleLogin} className="bg-emerald-500 p-4 rounded-xl">
          <Text className="text-slate-950 text-center font-bold text-lg">Login</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("/(auth)/register")} className="mt-6">
          <Text className="text-slate-400 text-center font-medium">New traveler? <Text className="text-emerald-500 font-bold">Register</Text></Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}