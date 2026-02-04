import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  Image, 
  Dimensions, 
  TouchableOpacity, 
  Alert, 
  ActivityIndicator,
  AlertButton,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TravelPost } from '../types';
import { db, auth } from '../service/firebaseConfig';
import { doc, updateDoc, deleteDoc, onSnapshot } from 'firebase/firestore';

import * as FileSystem from 'expo-file-system/legacy';
import * as MediaLibrary from 'expo-media-library';

const { width } = Dimensions.get('window');

//  STAT CARD COMPONENT 
export function StatCard({ icon, count, label, color }: { icon: any, count: number, label: string, color: string }) {
  return (
    <View className="flex-1 bg-white/5 border border-white/10 rounded-[32px] p-5 items-center">
      <View style={{ backgroundColor: `${color}20` }} className="p-2 rounded-xl mb-2">
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <Text className="text-white text-2xl font-black">{count}</Text>
      <Text className="text-slate-500 text-[9px] uppercase font-bold tracking-[2px]">{label}</Text>
    </View>
  );
}

//  TIMELINE ITEM COMPONENT 
export function TimelineItem({ item, isLast }: { item: TravelPost, isLast: boolean }) {
  const isOwner = auth.currentUser?.uid === item.userId;
  const [downloading, setDownloading] = useState(false);
  
  // LIVE PROFILE STATE
  const [authorName, setAuthorName] = useState(item.userName || 'Explorer');
  const [authorPhoto, setAuthorPhoto] = useState<string | null>(item.userPhoto || null);

  
  useEffect(() => {
    if (!item.userId) return;

    const userRef = doc(db, "users", item.userId);
    const unsubscribe = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        const userData = docSnap.data();
        setAuthorName(userData.displayName || item.userName || 'Explorer');
        setAuthorPhoto(userData.photoURL || null);
      }
    }, (error) => {
      console.error("User sync error:", error);
    });

    return () => unsubscribe();
  }, [item.userId]);

  const dateString = item.createdAt?.seconds 
    ? new Date(item.createdAt.seconds * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : 'New';

  //  SAVE TO GALLERY 
  const saveImageToGallery = async (imageUrl: string) => {
    try {
      setDownloading(true);
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert("Permission Denied", "Need gallery access to save photos.");
        return;
      }

      const filename = `${item.title.replace(/\s+/g, '_')}_${Date.now()}.jpg`;
      const fileUri = `${FileSystem.cacheDirectory}${filename}`;

      const downloadResult = await FileSystem.downloadAsync(imageUrl, fileUri);
      await MediaLibrary.saveToLibraryAsync(downloadResult.uri);
      Alert.alert("Success", "Memory saved to gallery! 📸");
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to save image.");
    } finally {
      setDownloading(false);
    }
  };

  //  OPTIONS MENU 
  const handleOptionsPress = () => {
    const options: AlertButton[] = [
      { 
        text: "Save to Gallery 📥", 
        onPress: () => {
          const url = item.imageUrls?.[0];
          if (url) saveImageToGallery(url);
        }
      },
    ];

    if (isOwner) {
      options.push(
        { text: "Edit Description", onPress: () => handleEditDescription() },
        { 
          text: item.isPublic ? "Make Private 🔒" : "Make Public 🌎", 
          onPress: () => togglePrivacy() 
        },
        { text: "Delete Memory", style: "destructive", onPress: () => confirmDelete() }
      );
    }

    options.push({ text: "Cancel", style: "cancel" });
    Alert.alert("Memory Options", "Manage this memory", options);
  };

  const togglePrivacy = async () => {
    try {
      await updateDoc(doc(db, "posts", item.id), { isPublic: !item.isPublic });
    } catch (e) {
      Alert.alert("Error", "Update failed.");
    }
  };

  const confirmDelete = () => {
    Alert.alert("Delete", "This cannot be undone.", [
      { text: "Cancel" },
      { text: "Delete", style: "destructive", onPress: async () => await deleteDoc(doc(db, "posts", item.id)) }
    ]);
  };

  const handleEditDescription = () => {
    if (Platform.OS === 'ios') {
      Alert.prompt(
        "Edit Description",
        "Update your note:",
        [
          { text: "Cancel", style: "cancel" },
          { 
            text: "Update", 
            onPress: async (newDesc?: string) => {
              if (newDesc !== undefined) await updateDoc(doc(db, "posts", item.id), { description: newDesc });
            } 
          }
        ],
        'plain-text',
        item.description
      );
    } else {
      Alert.alert("Note", "Description editing is currently optimized for iOS. Android update coming soon!");
    }
  };

  return (
    <View className="flex-row">
      {/* TIMELINE LEFT LINE */}
      <View className="items-center mr-4">
        <View className="w-4 h-4 rounded-full border-2 border-slate-950 bg-emerald-500 z-10 mt-2 shadow-sm" />
        {!isLast && <View className="w-[2px] flex-1 bg-slate-800/50 my-1" />}
      </View>

      {/* CONTENT CARD */}
      <View className="flex-1 mb-10">
        
        {/* ENHANCED PROFILE HEADER */}
        <View className="flex-row justify-between items-center mb-4 px-1">
          <View className="flex-row items-center">
            <View className="mr-3 relative">
              {authorPhoto ? (
                <Image 
                  source={{ uri: authorPhoto }} 
                  className="w-12 h-12 rounded-full border-2 border-emerald-500/20" 
                />
              ) : (
                <View className="w-12 h-12 rounded-full bg-slate-800 items-center justify-center border-2 border-slate-700">
                  <Ionicons name="person" size={20} color="#475569" />
                </View>
              )}
              <View className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-slate-950" />
            </View>

            <View>
              <Text className="text-white font-bold text-base">
                {isOwner ? "You" : authorName}
              </Text>
              <Text className="text-slate-500 text-[10px] font-black uppercase tracking-widest">
                {dateString}
              </Text>
            </View>
          </View>

          <TouchableOpacity 
            onPress={handleOptionsPress} 
            className="bg-slate-900/80 w-10 h-10 rounded-full items-center justify-center border border-white/5"
          >
            <Ionicons name="ellipsis-horizontal" size={20} color="#94a3b8" />
          </TouchableOpacity>
        </View>

        {/* IMAGE & POST BODY */}
        <View className="bg-slate-900/40 rounded-[32px] p-2 border border-white/5 overflow-hidden">
          {item.imageUrls && item.imageUrls.length > 0 && (
            <View className="relative">
              <Image 
                source={{ uri: item.imageUrls[0].replace('/upload/', '/upload/f_auto,q_auto,w_800/') }} 
                className="w-full h-72 rounded-[28px]" 
                resizeMode="cover"
              />
              <TouchableOpacity 
                onPress={() => {
                  const url = item.imageUrls?.[0];
                  if (url) saveImageToGallery(url);
                }}
                className="absolute top-4 right-4 bg-slate-950/60 w-12 h-12 rounded-full items-center justify-center border border-white/10"
              >
                {downloading ? (
                  <ActivityIndicator size="small" color="#10b981" />
                ) : (
                  <Ionicons name="download-outline" size={24} color="white" />
                )}
              </TouchableOpacity>
            </View>
          )}

          <View className="p-4">
            <View className="flex-row justify-between items-center mb-3">
              <View className="flex-1 flex-row items-center bg-emerald-500/10 px-3 py-2 rounded-xl border border-emerald-500/20 mr-3">
                <Ionicons name="location-sharp" size={14} color="#10b981" />
                <Text className="text-emerald-400 font-bold text-[11px] uppercase flex-1 ml-2" numberOfLines={1}>
                  {item.locationName}
                </Text>
              </View>
              {item.mood && (
                <View className="bg-slate-800 w-11 h-11 rounded-full items-center justify-center border border-white/5">
                  <Text className="text-2xl">{item.mood}</Text>
                </View>
              )}
            </View>
            
            <Text className="text-white text-2xl font-black mb-2">{item.title}</Text>
            {item.description && (
              <Text className="text-slate-400 text-sm leading-6 mb-2" numberOfLines={3}>
                {item.description}
              </Text>
            )}
            
            {isOwner && (
              <View className="flex-row items-center mt-2">
                <Ionicons 
                  name={item.isPublic ? "earth" : "lock-closed"} 
                  size={12} 
                  color={item.isPublic ? "#10b981" : "#64748b"} 
                />
                <Text className={`text-[10px] ml-1 font-bold uppercase tracking-tighter ${item.isPublic ? 'text-emerald-500' : 'text-slate-500'}`}>
                  {item.isPublic ? "Visible in Feed" : "Private Vault Only"}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </View>
  );
}