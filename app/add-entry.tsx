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

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert("Permission Denied", "We need access to your photos.");
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
    });

    if (!result.canceled) setImage(result.assets[0].uri);
  };

  const uploadToCloudinary = async (imageUri: string) => {
    const cloudName = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
        console.error("Cloudinary credentials are missing in .env");
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

  const handleSave = async () => {
    if (!title || !locationName) {
      Alert.alert("Missing Info", "Title and Location are required.");
      return;
    }
    setLoading(true);

    try {
      let finalImageUrl = null;
      let coords = { lat: 0, lng: 0 };

      // Get Location
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({});
        coords = { lat: loc.coords.latitude, lng: loc.coords.longitude };
      }

      // Upload Image
      if (image) {
        finalImageUrl = await uploadToCloudinary(image);
      }

      // Save to Firestore
      await addDoc(collection(db, "posts"), {
        userId: auth.currentUser?.uid,
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
      Alert.alert("Error", "Could not save your memory.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-slate-950">
      {/* Header */}
      <View className="px-6 pt-16 flex-row justify-between items-center bg-slate-950/80 backdrop-blur-md pb-4">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={28} color="white" />
        </TouchableOpacity>
        <Text className="text-white text-xl font-black">New Memory</Text>
        <TouchableOpacity onPress={handleSave} disabled={loading}>
          {loading ? <ActivityIndicator color="#10b981" /> : <Text className="text-emerald-500 font-bold text-lg">Post</Text>}
        </TouchableOpacity>
      </View>

      <ScrollView className="px-6 mt-4" showsVerticalScrollIndicator={false}>
        {/* Image Picker */}
        <TouchableOpacity 
          onPress={pickImage}
          className="w-full h-64 bg-slate-900 rounded-[40px] border-2 border-dashed border-slate-800 items-center justify-center overflow-hidden mb-6"
        >
          {image ? (
            <Image source={{ uri: image }} className="w-full h-full" />
          ) : (
            <View className="items-center">
              <Ionicons name="camera-outline" size={48} color="#475569" />
              <Text className="text-slate-500 mt-2 font-medium">Add a cover photo</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Inputs */}
        <TextInput 
          placeholder="Where did you go?" 
          placeholderTextColor="#475569"
          className="text-white text-3xl font-black mb-6"
          value={title}
          onChangeText={setTitle}
        />

        <View className="bg-slate-900/50 p-4 rounded-3xl border border-white/5 mb-4 flex-row items-center">
          <Ionicons name="location-outline" size={20} color="#10b981" />
          <TextInput 
            placeholder="Location (City, Country)" 
            placeholderTextColor="#475569"
            className="flex-1 ml-3 text-white font-bold"
            value={locationName}
            onChangeText={setLocationName}
          />
        </View>

        {/* Mood Selector */}
        <Text className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mb-3 ml-1">Vibe Check</Text>
        <View className="flex-row justify-between mb-6">
          {MOODS.map((m) => (
            <TouchableOpacity 
              key={m.label}
              onPress={() => setSelectedMood(m.emoji)}
              className={`w-14 h-14 rounded-2xl items-center justify-center border ${selectedMood === m.emoji ? 'bg-emerald-500/20 border-emerald-500' : 'bg-slate-900 border-white/5'}`}
            >
              <Text className="text-2xl">{m.emoji}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TextInput 
          placeholder="Tell the story..." 
          placeholderTextColor="#475569"
          multiline
          className="text-slate-300 text-lg mb-8 min-h-[120px] bg-slate-900/30 p-5 rounded-3xl"
          value={description}
          onChangeText={setDescription}
        />

        {/* Public Toggle */}
        <View className="flex-row justify-between items-center bg-slate-900/50 p-6 rounded-[32px] border border-white/5 mb-20">
          <View>
            <Text className="text-white font-bold text-base">Make Public</Text>
            <Text className="text-slate-500 text-xs">Share this with the global feed</Text>
          </View>
          <Switch 
            value={isPublic} 
            onValueChange={setIsPublic}
            trackColor={{ false: "#1e293b", true: "#059669" }}
          />
        </View>
      </ScrollView>
    </View>
  );
}