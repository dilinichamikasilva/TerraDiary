import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { auth } from '../firebaseConfig'; 
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import "../global.css";

export default function AuthScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert("Required", "Please enter both email and password.");
      return;
    }

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
        Alert.alert("Success", "Account created successfully!");
      }
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-slate-950 justify-center px-8"
    >
      <View className="mb-10">
        <Text className="text-white text-5xl font-extrabold tracking-tighter">
          Terra<Text className="text-emerald-500">Diary</Text>
        </Text>
        <Text className="text-slate-400 text-lg mt-2 font-medium">
          {isLogin ? "Welcome back." : "Start your journey."}
        </Text>
      </View>

      <View className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-2xl">
        <TextInput
          className="bg-slate-800 p-4 rounded-2xl mb-4 text-white border border-slate-700 focus:border-emerald-500"
          placeholder="Email Address"
          placeholderTextColor="#94a3b8"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
        />

        <TextInput
          className="bg-slate-800 p-4 rounded-2xl mb-6 text-white border border-slate-700 focus:border-emerald-500"
          placeholder="Password"
          placeholderTextColor="#94a3b8"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity 
          onPress={handleAuth}
          className="bg-emerald-500 py-4 rounded-2xl shadow-lg active:bg-emerald-600"
        >
          <Text className="text-slate-950 text-center font-bold text-lg">
            {isLogin ? 'Sign In' : 'Create Account'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setIsLogin(!isLogin)} className="mt-6">
          <Text className="text-slate-400 text-center font-medium">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <Text className="text-emerald-500 font-bold">{isLogin ? "Register" : "Login"}</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}