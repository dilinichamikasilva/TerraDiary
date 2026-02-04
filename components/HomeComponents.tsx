import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  Image, 
  Dimensions, 
  TouchableOpacity, 
  Alert, 
  ActivityIndicator,
  AlertButton
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
  const [authorPhoto, setAuthorPhoto] = useState<string | null>(null);

  //  EFFECT: Sync Live User Data (Name/Photo)
  useEffect(() => {
    if (!item.userId) return;

  
    const userRef = doc(db, "users", item.userId);
    const unsubscribe = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        const userData = docSnap.data();
        setAuthorName(userData.displayName || item.userName || 'Explorer');
        setAuthorPhoto(userData.photoURL || null);
      }
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

      const filename = `${item.title.replace(/\s+/g, '_')}.jpg`;
      const fileUri = FileSystem.cacheDirectory + filename;

      const downloadResult = await FileSystem.downloadAsync(imageUrl, fileUri);
      await MediaLibrary.saveToLibraryAsync(downloadResult.uri);
      Alert.alert("Success", "Memory saved to gallery! 📸");
    } catch (error) {
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
        onPress: () => item.imageUrls?.[0] && saveImageToGallery(item.imageUrls[0]) 
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
    Alert.prompt(
      "Edit Description",
      "Update your note:",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Update", 
          onPress: async (newDesc: string | undefined) => {
  if (newDesc) {
    await updateDoc(doc(db, "posts", item.id), { description: newDesc });
  }
}
        }
      ],
      'plain-text',
      item.description
    );
  };

  return (
    <View className="flex-row">
      {/* TIMELINE LEFT LINE */}
      <View className="items-center mr-4">
        <View className="w-4 h-4 rounded-full border-2 border-slate-950 bg-emerald-500 z-10 mt-1 shadow-sm" />
        {!isLast && <View className="w-[2px] flex-1 bg-slate-800/50 my-1" />}
      </View>

      {/* CONTENT CARD */}
      <View className="flex-1 mb-10">
        <View className="flex-row justify-between items-center mb-2 px-1">
          <Text className="text-slate-600 text-[10px] font-black uppercase tracking-widest">{dateString}</Text>
          
          <View className="flex-row items-center">
            {/* LIVE AUTHOR NAME & PHOTO */}
            <View className="flex-row items-center mr-3">
              {authorPhoto && (
                <Image source={{ uri: authorPhoto }} className="w-4 h-4 rounded-full mr-1.5 border border-emerald-500/30" />
              )}
              <Text className="text-emerald-500/60 text-[10px] font-bold">By {authorName}</Text>
            </View>

            <TouchableOpacity onPress={handleOptionsPress} className="p-1">
              <Ionicons name="ellipsis-horizontal" size={18} color="#475569" />
            </TouchableOpacity>
          </View>
        </View>

        <View className="bg-slate-900/40 rounded-[32px] p-2 border border-white/5 overflow-hidden">
          {item.imageUrls && item.imageUrls.length > 0 && (
            <View className="relative">
              <Image 
                source={{ uri: item.imageUrls[0].replace('/upload/', '/upload/f_auto,q_auto,w_800/') }} 
                className="w-full h-64 rounded-[28px]" 
                resizeMode="cover"
              />
              <TouchableOpacity 
                onPress={() => {
                  const firstUrl = item.imageUrls?.[0];
                  if (firstUrl) saveImageToGallery(firstUrl);
                }}
                className="absolute top-4 right-4 bg-slate-950/60 w-10 h-10 rounded-full items-center justify-center border border-white/10"
              >
                {downloading ? (
                  <ActivityIndicator size="small" color="#10b981" />
                ) : (
                  <Ionicons name="download-outline" size={20} color="white" />
                )}
              </TouchableOpacity>
            </View>
          )}

          <View className="p-4">
            <View className="flex-row justify-between items-center mb-3">
              <View className="flex-1 flex-row items-center bg-emerald-500/10 px-2.5 py-1.5 rounded-xl border border-emerald-500/20 mr-3">
                <Ionicons name="location-sharp" size={12} color="#10b981" />
                <Text className="text-emerald-400 font-bold text-[10px] uppercase flex-1 ml-1.5" numberOfLines={1}>
                  {item.locationName}
                </Text>
              </View>
              {item.mood && (
                <View className="bg-slate-800 w-10 h-10 rounded-full items-center justify-center">
                  <Text className="text-xl">{item.mood}</Text>
                </View>
              )}
            </View>
            <Text className="text-white text-xl font-bold mb-2">{item.title}</Text>
            {item.description && <Text className="text-slate-400 text-sm leading-6" numberOfLines={3}>{item.description}</Text>}
          </View>
        </View>
      </View>
    </View>
  );
}