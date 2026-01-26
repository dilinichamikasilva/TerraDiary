import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { db, auth } from '../firebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import "../global.css";

export default function AddEntry() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [locationName, setLocationName] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!title || !description || !locationName) {
      Toast.show({ type: 'error', text1: 'Fill everything! ✍️' });
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, "posts"), {
        userId: auth.currentUser?.uid,
        userEmail: auth.currentUser?.email,
        title,
        description,
        locationName,
        isPublic,
        createdAt: serverTimestamp(),
        // For the map, we'd eventually add lat/lng here
        coords: { latitude: 48.8566, longitude: 2.3522 } // Example: Paris
      });

      Toast.show({ type: 'success', text1: 'Adventure Saved! ✈️' });
      router.back();
    } catch (e:any) {
      Toast.show({ type: 'error', text1: 'Error saving', text2: e.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-slate-950 px-6 pt-16">
      <View className="flex-row justify-between items-center mb-8">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={30} color="#64748b" />
        </TouchableOpacity>
        <Text className="text-white text-xl font-bold">New Adventure</Text>
        <TouchableOpacity onPress={handleSave} disabled={loading}>
          <Text className={loading ? "text-emerald-800" : "text-emerald-500 font-bold text-lg"}>Post</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <TextInput
          placeholder="Where did you go?"
          placeholderTextColor="#64748b"
          className="text-white text-2xl font-bold mb-6"
          onChangeText={setLocationName}
        />

        <TextInput
          placeholder="Give your story a title..."
          placeholderTextColor="#475569"
          className="text-slate-200 text-lg mb-4 border-b border-slate-800 pb-2"
          onChangeText={setTitle}
        />

        <TextInput
          placeholder="Tell the story of your journey..."
          placeholderTextColor="#475569"
          multiline
          numberOfLines={6}
          className="text-slate-300 text-base leading-6 mb-8 h-40"
          textAlignVertical="top"
          onChangeText={setDescription}
        />

        <View className="bg-slate-900/50 p-4 rounded-3xl flex-row justify-between items-center border border-white/5">
          <View className="flex-row items-center">
            <Ionicons name="earth" size={24} color="#10b981" />
            <View className="ml-3">
              <Text className="text-white font-bold">Share with World</Text>
              <Text className="text-slate-500 text-xs">Visible in Global Feed</Text>
            </View>
          </View>
          <Switch 
            value={isPublic} 
            onValueChange={setIsPublic}
            trackColor={{ false: "#1e293b", true: "#059669" }}
            thumbColor={isPublic ? "#10b981" : "#64748b"}
          />
        </View>
      </ScrollView>
    </View>
  );
}