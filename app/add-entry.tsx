import React, { useState, useRef, useEffect } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, ScrollView, 
  Image, ActivityIndicator, Switch, Alert, KeyboardAvoidingView, Platform, Linking 
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { db, auth } from '../service/firebaseConfig';
import { collection, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import "../global.css";

const MOODS = [
  { emoji: '☀️', label: 'Sunny' }, { emoji: '🌃', label: 'City' },
  { emoji: '✨', label: 'Magical' }, { emoji: '🕯️', label: 'Cozy' },
  { emoji: '🌧️', label: 'Moody' }, { emoji: '☁️', label: 'Chilled' },
  { emoji: '🏔️', label: 'Adventurous' }, { emoji: '🏖️', label: 'Beach' },
  { emoji: '🌲', label: 'Nature' }, { emoji: '🚲', label: 'Active' },
  { emoji: '🧘', label: 'Zen' }, { emoji: '📸', label: 'Sightseeing' },
  { emoji: '🍜', label: 'Foodie' }, { emoji: '☕', label: 'Caffeine' },
  { emoji: '🍹', label: 'Party' }, { emoji: '🎭', label: 'Cultural' },
  { emoji: '🛍️', label: 'Shopping' }, { emoji: '🐾', label: 'Pet Friendly' },
];

export default function AddEntryScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Form State
  const [images, setImages] = useState<string[]>([]); 
  const [selectedMood, setSelectedMood] = useState('☀️');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  
  // Privacy Logic States
  const [isPublic, setIsPublic] = useState(false);
  const [isForcedPrivate, setIsForcedPrivate] = useState(false);

  // Location State
  const [locationName, setLocationName] = useState('');
  const [geoCoords, setGeoCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [predictions, setPredictions] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  //  permission handler
  const requestPermission = async (
    type: 'camera' | 'location' | 'gallery',
    requestFn: () => Promise<any>
  ) => {
    const { status } = await requestFn();
    
    if (status !== 'granted') {
      const messages = {
        camera: "We need your camera to capture this moment for your diary.",
        location: "Terra Diary needs your location to pin this memory to your map.",
        gallery: "Access your gallery to pick the best shots from your trip."
      };

      Alert.alert(
        "📸 Permission Needed",
        messages[type],
        [
          { text: "Not Now", style: "cancel" },
          { text: "Settings", onPress: () => Linking.openSettings() }
        ],
        { cancelable: true }
      );
      return false;
    }
    return true;
  };

  // init context
  useEffect(() => {
    const initialize = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists() && userDoc.data().privateByDefault) {
            setIsForcedPrivate(true);
            setIsPublic(false); 
          }
        } catch (e) { console.error(e); }
      }
    };
    initialize();
  }, []);

  // location logic
  const fetchPredictions = (text: string) => {
    setLocationName(text);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    if (text.length < 3) { setPredictions([]); return; }

    setIsSearching(true);
    typingTimeoutRef.current = setTimeout(async () => {
      try {
        let url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(text)}&format=json&addressdetails=1&limit=5&accept-language=en`;
        const response = await fetch(url, { headers: { 'User-Agent': 'TerraDiary_App' } });
        const json = await response.json();
        setPredictions(json);
      } catch (error) {
        console.error("OSM Search error:", error);
      } finally {
        setIsSearching(false);
      }
    }, 600); 
  };

  const handleSelectLocation = (item: any) => {
    setLocationName(item.display_name);
    setGeoCoords({ lat: parseFloat(item.lat), lng: parseFloat(item.lon) });
    setPredictions([]); 
  };

  const handleDetectLocation = async () => {
    const hasPermission = await requestPermission('location', Location.requestForegroundPermissionsAsync);
    if (!hasPermission) return;

    setLoading(true);
    try {
      let loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setGeoCoords({ lat: loc.coords.latitude, lng: loc.coords.longitude });
      
      let url = `https://nominatim.openstreetmap.org/reverse?lat=${loc.coords.latitude}&lon=${loc.coords.longitude}&format=json&accept-language=en`;
      const response = await fetch(url, { headers: { 'User-Agent': 'TerraDiary_App' } });
      const p = await response.json();
      
      if (p.display_name) {
        setLocationName(p.display_name);
      }
    } catch (e) {
      Alert.alert("GPS Timeout", "We couldn't get a clear signal. Try searching manually.");
    } finally {
      setLoading(false);
    }
  };

  // image logic
  const takePhoto = async () => {
    const hasPermission = await requestPermission('camera', ImagePicker.requestCameraPermissionsAsync);
    if (!hasPermission) return;
    
    let result = await ImagePicker.launchCameraAsync({ 
      quality: 0.7, 
      allowsEditing: Platform.OS === 'ios',
      aspect: [4, 5],
    });

    if (!result.canceled && result.assets) {
      setImages(prev => [...prev, result.assets[0].uri]);
    }
  };

  const pickImages = async () => {
    const hasPermission = await requestPermission('gallery', ImagePicker.requestMediaLibraryPermissionsAsync);
    if (!hasPermission) return;
    
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      selectionLimit: 5 - images.length, 
      quality: 0.7,
    });
    
    if (!result.canceled && result.assets) {
      const newUris = result.assets.map(a => a.uri);
      setImages(prev => [...prev, ...newUris]);
    }
  };

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
    } catch (e) { 
      return null; 
    }
  };

  const handleSave = async () => {
    const user = auth.currentUser;
    if (!user) return Alert.alert("Hold on", "You need to be logged in to save memories.");
    if (!title || !locationName || !geoCoords) {
      return Alert.alert("Wait a second", "Every memory needs a title and a place on the map.");
    }
    
    setLoading(true);
    const currentUserName = user.displayName || user.email?.split('@')[0] || "Traveler";
    
    try {
      const uploadPromises = images.map(uri => uploadToCloudinary(uri));
      const finalImageUrls = (await Promise.all(uploadPromises)).filter(url => url !== null);

      await addDoc(collection(db, "posts"), {
        userId: user.uid,
        userName: currentUserName, 
        title,
        locationName,
        description,
        isPublic,
        imageUrls: finalImageUrls, 
        latitude: geoCoords.lat,
        longitude: geoCoords.lng,
        mood: selectedMood,
        createdAt: serverTimestamp(),
      });
      router.back();
    } catch (error) {
      Alert.alert("Connection Error", "We couldn't save your journey. Check your internet?");
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
        <TouchableOpacity onPress={handleSave} disabled={loading} className="bg-emerald-500/10 px-4 py-2 rounded-full">
          {loading ? <ActivityIndicator size="small" color="#10b981" /> : <Text className="text-emerald-500 font-black text-sm uppercase tracking-widest">Post</Text>}
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <ScrollView 
          className="px-6 mt-4" 
          showsVerticalScrollIndicator={false} 
          contentContainerStyle={{ paddingBottom: 60 }} 
          keyboardShouldPersistTaps="always"
        >
          
          {/* Location Search Bar */}
          <View className="mb-6 z-50"> 
            <View className="flex-row items-center mb-3 justify-between px-1">
              <Text className="text-slate-500 font-black uppercase text-[10px] tracking-[3px]">Pin the location</Text>
              <TouchableOpacity onPress={handleDetectLocation} className="flex-row items-center bg-emerald-500/10 px-3 py-1.5 rounded-full">
                <Ionicons name="navigate" size={12} color="#10b981" />
                <Text className="text-emerald-500 text-[9px] font-black ml-1 uppercase tracking-tighter">Current GPS</Text>
              </TouchableOpacity>
            </View>
            <View className="bg-slate-900 rounded-3xl border border-white/5 flex-row items-center px-5">
              <Ionicons name="location" size={22} color={geoCoords ? "#10b981" : "#475569"} />
              <TextInput 
                className="flex-1 py-6 ml-3 text-white text-lg font-bold" 
                placeholder="Where did this happen?" 
                placeholderTextColor="#475569" 
                value={locationName} 
                onChangeText={fetchPredictions}
              />
              {isSearching && <ActivityIndicator size="small" color="#10b981" className="mr-2" />}
            </View>

            {predictions.length > 0 && (
              <View className="absolute top-[100px] left-0 right-0 bg-slate-900 rounded-2xl border border-white/10 z-[100] shadow-2xl overflow-hidden">
                {predictions.map((p, index) => (
                  <TouchableOpacity 
                    key={index} 
                    className="p-4 border-b border-white/5 flex-row items-center active:bg-slate-800" 
                    onPress={() => handleSelectLocation(p)}
                  >
                    <Ionicons name="pin" size={18} color="#10b981" />
                    <Text className="text-slate-300 ml-3 flex-1 font-medium" numberOfLines={1}>{p.display_name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Title */}
          <TextInput 
            placeholder="Give it a name..." 
            placeholderTextColor="#334155" 
            className="text-white text-4xl font-black mb-6" 
            value={title} 
            onChangeText={setTitle} 
          />

          {/* Photo Section */}
          <Text className="text-slate-500 font-black uppercase text-[10px] tracking-[3px] mb-4 ml-1">Visuals</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row mb-8">
            <TouchableOpacity onPress={takePhoto} className="w-40 h-56 bg-emerald-500/10 rounded-[30px] border-2 border-dashed border-emerald-500/30 items-center justify-center mr-4">
              <Ionicons name="camera" size={30} color="#10b981" />
              <Text className="text-emerald-500 text-[10px] font-black mt-2">SNAP</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={pickImages} className="w-40 h-56 bg-slate-900 rounded-[30px] border-2 border-dashed border-slate-800 items-center justify-center mr-4">
              <Ionicons name="images" size={30} color="#64748b" />
              <Text className="text-slate-500 text-[10px] font-black mt-2">GALLERY</Text>
            </TouchableOpacity>
            {images.map((uri, idx) => (
              <View key={idx} className="relative mr-4">
                <Image source={{ uri }} className="w-40 h-56 rounded-[30px]" />
                <TouchableOpacity 
                  onPress={() => setImages(images.filter((_, i) => i !== idx))} 
                  className="absolute top-3 right-3 bg-slate-950/80 w-8 h-8 rounded-full items-center justify-center border border-white/10"
                >
                  <Ionicons name="close" size={16} color="white" />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>

          {/* Mood Section */}
          <Text className="text-slate-500 font-black uppercase text-[10px] tracking-[3px] mb-4 ml-1">The Vibe</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row mb-8">
            {MOODS.map((m) => (
              <TouchableOpacity 
                key={m.label} 
                onPress={() => setSelectedMood(m.emoji)} 
                className={`w-16 h-20 mr-3 rounded-2xl items-center justify-center border-2 ${selectedMood === m.emoji ? 'bg-emerald-500/20 border-emerald-500' : 'bg-slate-900 border-transparent'}`}
              >
                <Text className="text-2xl">{m.emoji}</Text>
                <Text className={`text-[8px] font-bold uppercase mt-1 ${selectedMood === m.emoji ? 'text-emerald-500' : 'text-slate-500'}`}>{m.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Description */}
          <TextInput 
            placeholder="What made this special?" 
            placeholderTextColor="#475569" 
            multiline 
            className="text-slate-300 text-lg mb-6 min-h-[180px] bg-slate-900/40 p-6 rounded-[32px] border border-white/5" 
            value={description} 
            onChangeText={setDescription} 
            textAlignVertical="top" 
          />

          {/* Privacy Toggle */}
          <View className="flex-row justify-between items-center bg-slate-900/50 p-6 rounded-[32px] border border-white/5 mb-10">
            <View className="flex-1 pr-4">
              <Text className="text-white font-bold text-lg">Share with the World</Text>
              <Text className="text-slate-500 text-xs">{isForcedPrivate ? "Privacy locked by profile settings" : "Toggle to show on global explorer feed"}</Text>
            </View>
            <Switch 
              value={isPublic} 
              onValueChange={setIsPublic} 
              disabled={isForcedPrivate} 
              trackColor={{ false: "#1e293b", true: "#059669" }} 
              thumbColor={isPublic ? "#10b981" : "#64748b"} 
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Loading Overlay */}
      {loading && (
        <View className="absolute inset-0 bg-slate-950/90 items-center justify-center z-[200]">
          <ActivityIndicator size="large" color="#10b981" />
          <Text className="text-white mt-6 font-black tracking-widest uppercase text-xs">Architecting your memory...</Text>
        </View>
      )}
    </View>
  );
}