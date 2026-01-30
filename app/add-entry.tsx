import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, ScrollView, 
  Image, ActivityIndicator, Switch, Alert, KeyboardAvoidingView, Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { db, auth } from '../service/firebaseConfig';
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
  
  // Form State
  const [images, setImages] = useState<string[]>([]); 
  const [selectedMood, setSelectedMood] = useState('☀️');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);

  // Location State
  const [locationName, setLocationName] = useState('');
  const [geoCoords, setGeoCoords] = useState<{ lat: number; lng: number } | null>(null);

  //  Image Handling 
  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') return Alert.alert("Denied", "Camera access needed.");
    let result = await ImagePicker.launchCameraAsync({ quality: 0.6, allowsEditing: true });
    if (!result.canceled) setImages([...images, result.assets[0].uri]);
  };

  const pickImages = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return Alert.alert("Denied", "Gallery access needed.");
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      selectionLimit: 5 - images.length, 
      quality: 0.6,
    });
    if (!result.canceled) setImages([...images, ...result.assets.map(a => a.uri)]);
  };

  // Geocoding Logic
  const handleDetectLocation = async () => {
    setLoading(true);
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setLoading(false);
      return Alert.alert("Denied", "Location access required.");
    }

    let loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
    const { latitude, longitude } = loc.coords;
    setGeoCoords({ lat: latitude, lng: longitude });

    let reverse = await Location.reverseGeocodeAsync({ latitude, longitude });
    if (reverse.length > 0) {
      const p = reverse[0];
      setLocationName(`${p.name || p.city || p.region}, ${p.country}`);
    }
    setLoading(false);
  };

  //  Cloudinary Upload 
  const uploadToCloudinary = async (imageUri: string) => {
    const cloudName = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
    if (!cloudName || !uploadPreset) return null;
    
    const data = new FormData();
    // @ts-ignore
    data.append('file', { uri: imageUri, type: 'image/jpeg', name: 'upload.jpg' });
    data.append('upload_preset', uploadPreset);

    try {
      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { 
        method: 'POST', 
        body: data 
      });
      const result = await response.json();
      return result.secure_url;
    } catch { return null; }
  };

  //  Save Logic 
  const handleSave = async () => {
    if (!title || !locationName) {
      return Alert.alert("Missing Info", "Title and location are required.");
    }
    
    setLoading(true);
    let finalCoords = geoCoords;

    if (!finalCoords) {
      try {
        const results = await Location.geocodeAsync(locationName);
        if (results.length > 0) {
          finalCoords = { lat: results[0].latitude, lng: results[0].longitude };
        } else {
          setLoading(false);
          return Alert.alert("Location Not Found", "We couldn't locate that place. Try adding a city or country name.");
        }
      } catch (error) {
        setLoading(false);
        return Alert.alert("Error", "Geocoding failed. Check your internet connection.");
      }
    }

    const currentUserName = auth.currentUser?.displayName || auth.currentUser?.email?.split('@')[0] || "Traveler";

    try {
      const uploadPromises = images.map(uri => uploadToCloudinary(uri));
      const finalImageUrls = (await Promise.all(uploadPromises)).filter(url => url !== null);

      await addDoc(collection(db, "posts"), {
        userId: auth.currentUser?.uid,
        userName: currentUserName, 
        title,
        locationName,
        description,
        isPublic,
        imageUrls: finalImageUrls, 
        latitude: finalCoords.lat,
        longitude: finalCoords.lng,
        mood: selectedMood,
        createdAt: serverTimestamp(),
      });
      router.back();
    } catch (error) {
      console.error("Firestore Error:", error);
      Alert.alert("Error", "Could not save entry.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-slate-950">
      {/* Header */}
      <View className="px-6 pt-16 flex-row justify-between items-center bg-slate-950 pb-4 z-10 border-b border-white/5">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={28} color="white" />
        </TouchableOpacity>
        <Text className="text-white text-xl font-black italic">NEW ENTRY</Text>
        <TouchableOpacity onPress={handleSave} disabled={loading}>
          {loading ? <ActivityIndicator color="#10b981" /> : <Text className="text-emerald-500 font-bold text-lg">Post</Text>}
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <ScrollView className="px-6 mt-4" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 60 }}>
          
          {/* Photo Section */}
          <Text className="text-slate-500 font-black uppercase text-[10px] tracking-[3px] mb-4 ml-1">Photos</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row mb-8">
            <TouchableOpacity onPress={takePhoto} className="w-40 h-56 bg-emerald-500/10 rounded-[30px] border-2 border-dashed border-emerald-500/30 items-center justify-center mr-4">
              <Ionicons name="camera" size={30} color="#10b981" />
            </TouchableOpacity>
            <TouchableOpacity onPress={pickImages} className="w-40 h-56 bg-slate-900 rounded-[30px] border-2 border-dashed border-slate-800 items-center justify-center mr-4">
              <Ionicons name="images" size={30} color="#64748b" />
            </TouchableOpacity>
            {images.map((uri, idx) => (
              <View key={idx} className="relative mr-4">
                <Image source={{ uri }} className="w-40 h-56 rounded-[30px]" />
                <TouchableOpacity onPress={() => setImages(images.filter((_, i) => i !== idx))} className="absolute top-2 right-2 bg-red-500 w-8 h-8 rounded-full items-center justify-center">
                  <Ionicons name="trash" size={14} color="white" />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>

          {/* Title */}
          <TextInput 
            placeholder="Adventure Title..." 
            placeholderTextColor="#334155" 
            className="text-white text-4xl font-black mb-6" 
            value={title} 
            onChangeText={setTitle} 
          />

          {/* Location Input */}
          <View className="mb-6">
            <View className="flex-row items-center mb-3 justify-between">
              <Text className="text-slate-500 font-black uppercase text-[10px] tracking-[3px]">Location</Text>
              <TouchableOpacity onPress={handleDetectLocation} className="flex-row items-center bg-emerald-500/10 px-3 py-1 rounded-full">
                <Ionicons name="navigate" size={12} color="#10b981" />
                <Text className="text-emerald-500 text-[10px] font-black ml-1 uppercase tracking-widest">GPS</Text>
              </TouchableOpacity>
            </View>

            <View className="bg-slate-900 rounded-3xl border border-white/5 flex-row items-center px-5">
              <Ionicons name="location" size={22} color="#10b981" />
              <TextInput 
                className="flex-1 py-6 ml-3 text-white text-lg font-bold"
                placeholder="Where did you go?"
                placeholderTextColor="#475569"
                value={locationName}
                onChangeText={(text) => {
                  setLocationName(text);
                  setGeoCoords(null); 
                }}
              />
            </View>
          </View>

          {/* Mood Section */}
          <Text className="text-slate-500 font-black uppercase text-[10px] tracking-[3px] mb-4 ml-1">Current Vibe</Text>
          <View className="flex-row justify-between mb-8">
            {MOODS.map((m) => (
              <TouchableOpacity 
                key={m.label} 
                onPress={() => setSelectedMood(m.emoji)} 
                className={`w-12 h-12 rounded-2xl items-center justify-center border-2 ${selectedMood === m.emoji ? 'bg-emerald-500/20 border-emerald-500' : 'bg-slate-900 border-transparent'}`}
              >
                <Text className="text-2xl">{m.emoji}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Description */}
          <TextInput 
            placeholder="Write your story..." 
            placeholderTextColor="#475569" 
            multiline 
            className="text-slate-300 text-lg mb-6 min-h-[250px] bg-slate-900/30 p-6 rounded-[32px] border border-white/5"
            value={description} 
            onChangeText={setDescription} 
            textAlignVertical="top"
          />

          {/* Privacy Toggle */}
          <View className="flex-row justify-between items-center bg-slate-900/50 p-6 rounded-[32px] border border-white/5 mb-10">
            <Text className="text-white font-bold text-lg">Public Memory</Text>
            <Switch 
              value={isPublic} 
              onValueChange={setIsPublic} 
              trackColor={{ false: "#1e293b", true: "#059669" }} 
              thumbColor={isPublic ? "#10b981" : "#64748b"} 
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Loading Overlay */}
      {loading && (
        <View className="absolute inset-0 bg-slate-950/90 items-center justify-center z-50">
          <ActivityIndicator size="large" color="#10b981" />
          <Text className="text-white mt-4 font-black tracking-widest uppercase">Saving Journey...</Text>
        </View>
      )}
    </View>
  );
}