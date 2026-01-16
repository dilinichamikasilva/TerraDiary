import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { auth, db } from '../../firebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useRouter } from 'expo-router';
import "../../global.css";

export default function RegisterScreen() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    country: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const router = useRouter();

  const handleRegister = async () => {
    const { firstName, lastName, country, email, password, confirmPassword } = formData;

    
    if (!firstName || !lastName || !country || !email || !password) {
      Alert.alert("Error", "All fields are required");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    try {
      //  Create User in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Store Extra Data in Firestore (CRUD: Create)
      await setDoc(doc(db, "users", user.uid), {
        firstName,
        lastName,
        country,
        email,
        uid: user.uid,
        createdAt: new Date().toISOString(),
      });

      Alert.alert("Success", "Welcome to TerraDiary!");
    } catch (error: any) {
      Alert.alert("Registration Error", error.message);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      className="flex-1 bg-slate-950"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 32 }}>
        <Text className="text-white text-4xl font-bold mb-2">Create Account</Text>
        <Text className="text-slate-400 mb-8 text-lg">Join the TerraDiary community.</Text>

        <View className="bg-slate-900 p-6 rounded-3xl border border-slate-800">
          <View className="flex-row justify-between mb-4">
            <TextInput
              className="bg-slate-800 p-4 rounded-xl text-white border border-slate-700 w-[48%]"
              placeholder="First Name"
              placeholderTextColor="#64748b"
              onChangeText={(txt) => setFormData({...formData, firstName: txt})}
            />
            <TextInput
              className="bg-slate-800 p-4 rounded-xl text-white border border-slate-700 w-[48%]"
              placeholder="Last Name"
              placeholderTextColor="#64748b"
              onChangeText={(txt) => setFormData({...formData, lastName: txt})}
            />
          </View>

          <TextInput
            className="bg-slate-800 p-4 rounded-xl mb-4 text-white border border-slate-700"
            placeholder="Country"
            placeholderTextColor="#64748b"
            onChangeText={(txt) => setFormData({...formData, country: txt})}
          />

          <TextInput
            className="bg-slate-800 p-4 rounded-xl mb-4 text-white border border-slate-700"
            placeholder="Email"
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor="#64748b"
            onChangeText={(txt) => setFormData({...formData, email: txt})}
          />

          <TextInput
            className="bg-slate-800 p-4 rounded-xl mb-4 text-white border border-slate-700"
            placeholder="Password"
            secureTextEntry
            placeholderTextColor="#64748b"
            onChangeText={(txt) => setFormData({...formData, password: txt})}
          />

          <TextInput
            className="bg-slate-800 p-4 rounded-xl mb-6 text-white border border-slate-700"
            placeholder="Confirm Password"
            secureTextEntry
            placeholderTextColor="#64748b"
            onChangeText={(txt) => setFormData({...formData, confirmPassword: txt})}
          />

          <TouchableOpacity onPress={handleRegister} className="bg-emerald-500 p-4 rounded-xl active:bg-emerald-600">
            <Text className="text-slate-950 text-center font-bold text-lg">Sign Up</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push("/(auth)/login")} className="mt-6">
            <Text className="text-slate-400 text-center font-medium">
              Already have an account? <Text className="text-emerald-500 font-bold">Login</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}