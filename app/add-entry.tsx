import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, ScrollView, 
  Image, ActivityIndicator, Switch, Alert 
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { db, auth } from '../firebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import "../global.css";

const MOODS = [
  { emoji: '☀️', label: 'Sunny' },
  { emoji: '🏔️', label: 'Adventurous' },
  { emoji: '🍜', label: 'Foodie' },
  { emoji: '🌊', label: 'Relaxed' },
  { emoji: '🌃', label: 'City' },
  { emoji: '🏖️', label: 'Beach' },
];

export default function AddEntryScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [selectedMood, setSelectedMood] = useState('☀️');
  
  // Form State
  const [title, setTitle] = useState('');
  const [locationName, setLocationName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);

  // --- Image Picking  ---
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert("Permission Denied", "We need access to your photos to upload memories.");
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.6,
    });

    if (!result.canceled) setImage(result.assets[0].uri);
  };

  // --- Cloudinary Upload  ---
  const uploadToCloudinary = async (imageUri: string) => {
    const cloudName = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
        console.error("Cloudinary credentials missing in .env");
        return null;
    }

    const data = new FormData();
    // @ts-ignore
    data.append('file', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'upload.jpg',
    });
    data.append('upload_preset', uploadPreset);

    try {
      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: data,
      });
      const result = await response.json();
      return result.secure_url;
    } catch (error) {
      console.error("Cloudinary Error:", error);
      return null;
    }
  };

  // --- Main Save Function ---
  const handleSave = async () => {
    if (!title || !locationName) {
      Alert.alert("Missing Info", "Please provide a title and location.");
      return;
    }
    setLoading(true);

    try {
      let finalImageUrl = null;
      let coords = { lat: 0, lng: 0 };

      // Get User Display Name 
      const travelerName = auth.currentUser?.displayName || 
                           auth.currentUser?.email?.split('@')[0] || 
                           "Explorer";

      // Get GPS Location
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({});
        coords = { lat: loc.coords.latitude, lng: loc.coords.longitude };
      }

      // Upload Image if exists
      if (image) {
        finalImageUrl = await uploadToCloudinary(image);
      }

      // Save Record to Firestore
      await addDoc(collection(db, "posts"), {
        userId: auth.currentUser?.uid,
        userName: travelerName, 
        title,
        locationName,
        description,
        isPublic,
        imageUrl: finalImageUrl,
        latitude: coords.lat,
        longitude: coords.lng,
        mood: selectedMood,
        createdAt: serverTimestamp(),
      });

      router.back();
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Could not save your memory. Check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-slate-950">
      {/* Header */}
      <View className="px-6 pt-16 flex-row justify-between items-center bg-slate-950/80 pb-4">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={28} color="white" />
        </TouchableOpacity>
        <Text className="text-white text-xl font-black italic">NEW ENTRY</Text>
        <TouchableOpacity onPress={handleSave} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#10b981" />
          ) : (
            <Text className="text-emerald-500 font-bold text-lg">Post</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView className="px-6 mt-4" showsVerticalScrollIndicator={false}>
        {/* Photo Upload Area */}
        <TouchableOpacity 
          onPress={pickImage}
          className="w-full h-64 bg-slate-900 rounded-[40px] border-2 border-dashed border-slate-800 items-center justify-center overflow-hidden mb-8"
        >
          {image ? (
            <Image source={{ uri: image }} className="w-full h-full" />
          ) : (
            <View className="items-center">
              <View className="bg-slate-800 p-4 rounded-full mb-3">
                <Ionicons name="camera" size={32} color="#10b981" />
              </View>
              <Text className="text-slate-400 font-bold">Snap or Pick a Photo</Text>
              <Text className="text-slate-600 text-xs mt-1">Recommended: 4:3 Aspect Ratio</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Text Inputs */}
        <TextInput 
          placeholder="Adventure Title..." 
          placeholderTextColor="#334155"
          className="text-white text-4xl font-black mb-6"
          value={title}
          onChangeText={setTitle}
        />

        <View className="bg-slate-900/80 p-5 rounded-3xl border border-white/5 mb-6 flex-row items-center">
          <Ionicons name="location" size={20} color="#10b981" />
          <TextInput 
            placeholder="City, Country" 
            placeholderTextColor="#475569"
            className="flex-1 ml-3 text-white font-bold text-lg"
            value={locationName}
            onChangeText={setLocationName}
          />
        </View>

        {/* Mood/Vibe Selector */}
        <Text className="text-slate-500 font-black uppercase text-[10px] tracking-[3px] mb-4 ml-1">Current Vibe</Text>
        <View className="flex-row justify-between mb-8">
          {MOODS.map((m) => (
            <TouchableOpacity 
              key={m.label}
              onPress={() => setSelectedMood(m.emoji)}
              className={`w-12 h-12 rounded-2xl items-center justify-center border-2 ${
                selectedMood === m.emoji ? 'bg-emerald-500/20 border-emerald-500' : 'bg-slate-900 border-transparent'
              }`}
            >
              <Text className="text-2xl">{m.emoji}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TextInput 
          placeholder="What happened on this trip? Write your heart out..." 
          placeholderTextColor="#475569"
          multiline
          className="text-slate-300 text-lg mb-10 min-h-[150px] bg-slate-900/30 p-6 rounded-[32px] border border-white/5"
          value={description}
          onChangeText={setDescription}
          textAlignVertical="top"
        />

        {/* Privacy Control */}
        <View className="flex-row justify-between items-center bg-slate-900/50 p-6 rounded-[32px] border border-white/5 mb-24">
          <View className="flex-1 pr-4">
            <Text className="text-white font-bold text-lg">Public Memory</Text>
            <Text className="text-slate-500 text-xs mt-1">
              Toggle this to share your journey with the Terra Diary community.
            </Text>
          </View>
          <Switch 
            value={isPublic} 
            onValueChange={setIsPublic}
            trackColor={{ false: "#1e293b", true: "#059669" }}
            thumbColor={isPublic ? "#10b981" : "#64748b"}
          />
        </View>
      </ScrollView>

      {/* Loading Overlay */}
      {loading && (
        <View className="absolute inset-0 bg-slate-950/80 items-center justify-center z-50">
          <ActivityIndicator size="large" color="#10b981" />
          <Text className="text-white mt-4 font-bold tracking-widest">UPLOADING MEMORY...</Text>
        </View>
      )}
    </View>
  );
}