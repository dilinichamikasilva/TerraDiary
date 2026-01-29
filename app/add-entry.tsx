import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, ScrollView, 
  Image, ActivityIndicator, Switch, Alert, KeyboardAvoidingView, Platform, Modal, FlatList
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
  
  // State Management
  const [images, setImages] = useState<string[]>([]); 
  const [selectedMood, setSelectedMood] = useState('☀️');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);

  //  Location State 
  const [locationName, setLocationName] = useState('');
  const [geoCoords, setGeoCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isSearchModalVisible, setSearchModalVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

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

  //   SEARCH  
  const fetchSuggestions = async (text: string) => {
    setSearchText(text);
    if (text.length < 3) {
      setSuggestions([]);
      return;
    }
    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(text)}&limit=5&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'MyTravelApp/1.0', 
          }
        }
      );
      
      const textResponse = await response.text(); 
      try {
        const data = JSON.parse(textResponse);
        setSuggestions(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error("JSON Parse Error", textResponse);
      }
    } catch (error) {
      console.error("Fetch Error:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectLocation = (item: any) => {
    setLocationName(item.display_name);
    setGeoCoords({ lat: parseFloat(item.lat), lng: parseFloat(item.lon) });
    setSearchModalVisible(false);
    setSearchText('');
    setSuggestions([]);
  };

  // Auto-Detect Current Location 
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

  //  Cloudinary & Saving 
  const uploadToCloudinary = async (imageUri: string) => {
    const cloudName = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
    if (!cloudName || !uploadPreset) return null;
    const data = new FormData();

    // @ts-ignore
    data.append('file', { uri: imageUri, type: 'image/jpeg', name: 'upload.jpg' });
    data.append('upload_preset', uploadPreset);
    try {
      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: 'POST', body: data });
      const result = await response.json();
      return result.secure_url;
    } catch { return null; }
  };

  const handleSave = async () => {
    if (!title || !locationName) return Alert.alert("Missing Info", "Title and location are required.");
    setLoading(true);

    
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
        latitude: geoCoords?.lat || 0,
        longitude: geoCoords?.lng || 0,
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
      <View className="px-6 pt-16 flex-row justify-between items-center bg-slate-950/80 pb-4 z-10">
        <TouchableOpacity onPress={() => router.back()}><Ionicons name="close" size={28} color="white" /></TouchableOpacity>
        <Text className="text-white text-xl font-black italic">NEW ENTRY</Text>
        <TouchableOpacity onPress={handleSave} disabled={loading}>
          {loading ? <ActivityIndicator color="#10b981" /> : <Text className="text-emerald-500 font-bold text-lg">Post</Text>}
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <ScrollView className="px-6 mt-4" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 60 }}>
          
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
                <TouchableOpacity onPress={() => setImages(images.filter((_, i) => i !== idx))} className="absolute top-2 right-2 bg-red-500 w-8 h-8 rounded-full items-center justify-center"><Ionicons name="trash" size={14} color="white" /></TouchableOpacity>
              </View>
            ))}
          </ScrollView>

          <TextInput placeholder="Adventure Title..." placeholderTextColor="#334155" className="text-white text-4xl font-black mb-6" value={title} onChangeText={setTitle} />

          {/* LOCATION SELECTOR */}
          <View className="mb-6">
            <View className="flex-row items-center mb-3 justify-between">
              <Text className="text-slate-500 font-black uppercase text-[10px] tracking-[3px]">
                Location
              </Text>
              <TouchableOpacity 
                onPress={handleDetectLocation} 
                className="flex-row items-center bg-emerald-500/10 px-3 py-1 rounded-full"
              >
                <Ionicons name="navigate" size={12} color="#10b981" />
                <Text className="text-emerald-500 text-[10px] font-black ml-1 uppercase tracking-widest">
                  Auto-Detect
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              onPress={() => setSearchModalVisible(true)}
              className="bg-slate-900/80 py-6 px-5 rounded-3xl border border-white/5 flex-row items-center"
            >
              <Ionicons name="location" size={22} color="#10b981" />
              <View className="flex-1 ml-3"> 
                <Text 
                  className={`text-lg font-bold ${locationName ? 'text-white' : 'text-slate-500'}`} 
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {locationName || "Search places, cities..."}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#334155" />
            </TouchableOpacity>
          </View>

          {/* Moods */}
          <Text className="text-slate-500 font-black uppercase text-[10px] tracking-[3px] mb-4 ml-1">Current Vibe</Text>
          <View className="flex-row justify-between mb-8">
            {MOODS.map((m) => (
              <TouchableOpacity key={m.label} onPress={() => setSelectedMood(m.emoji)} className={`w-12 h-12 rounded-2xl items-center justify-center border-2 ${selectedMood === m.emoji ? 'bg-emerald-500/20 border-emerald-500' : 'bg-slate-900 border-transparent'}`}>
                <Text className="text-2xl">{m.emoji}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TextInput 
            placeholder="Write your story..." placeholderTextColor="#475569" multiline 
            className="text-slate-300 text-lg mb-6 min-h-[250px] bg-slate-900/30 p-6 rounded-[32px] border border-white/5"
            value={description} onChangeText={setDescription} textAlignVertical="top"
          />

          <View className="flex-row justify-between items-center bg-slate-900/50 p-6 rounded-[32px] border border-white/5 mb-10">
            <Text className="text-white font-bold text-lg">Public Memory</Text>
            <Switch value={isPublic} onValueChange={setIsPublic} trackColor={{ false: "#1e293b", true: "#059669" }} thumbColor={isPublic ? "#10b981" : "#64748b"} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* SEARCH MODAL */}
      <Modal visible={isSearchModalVisible} animationType="slide" transparent={false}>
        <View className="flex-1 bg-slate-950 pt-14">
          <View className="flex-row items-center px-6 mb-6">
            <TouchableOpacity onPress={() => setSearchModalVisible(false)} className="bg-slate-900 p-2 rounded-full">
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
            <Text className="text-white text-xl font-black ml-4 italic">SEARCH LOCATION</Text>
          </View>
          
          <View className="px-6">
            <View className="bg-slate-900 rounded-2xl flex-row items-center px-4 py-1 border border-white/10">
              <Ionicons name="search" size={20} color="#10b981" />
              <TextInput 
                autoFocus
                placeholder="Where did you go?"
                placeholderTextColor="#475569"
                className="flex-1 h-12 ml-3 text-white font-bold"
                value={searchText}
                onChangeText={fetchSuggestions}
              />
              {isSearching && <ActivityIndicator size="small" color="#10b981" />}
            </View>
          </View>

          <FlatList 
            data={suggestions}
            keyExtractor={(item, index) => index.toString()}
            className="mt-4 px-6"
            renderItem={({ item }) => (
              <TouchableOpacity 
                onPress={() => handleSelectLocation(item)}
                className="py-4 border-b border-white/5 flex-row items-center"
              >
                <View className="bg-emerald-500/10 p-2 rounded-full mr-4">
                    <Ionicons name="location" size={18} color="#10b981" />
                </View>
                <View className="flex-1">
                  <Text className="text-slate-300 font-bold" numberOfLines={1}>
                    {item.display_name.split(',')[0]}
                  </Text>
                  <Text className="text-slate-500 text-xs" numberOfLines={1}>
                    {item.display_name}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          />
        </View>
      </Modal>

      {loading && (
        <View className="absolute inset-0 bg-slate-950/90 items-center justify-center z-50">
          <ActivityIndicator size="large" color="#10b981" />
          <Text className="text-white mt-4 font-black tracking-widest uppercase">Saving Journey...</Text>
        </View>
      )}
    </View>
  );
}