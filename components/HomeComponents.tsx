import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  Image, 
  ScrollView, 
  Dimensions, 
  TouchableOpacity, 
  Alert, 
  RefreshControl, 
  Platform,
  StatusBar,
  ActivityIndicator,
  AlertButton
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { TravelPost } from '../types';
import { db, auth } from '../service/firebaseConfig';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';

import * as FileSystem from 'expo-file-system/legacy';
import * as MediaLibrary from 'expo-media-library';

const { width } = Dimensions.get('window');

// STAT CARD 
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

//  TIMELINE ITEM 
export function TimelineItem({ item, isLast }: { item: TravelPost, isLast: boolean }) {
  const isOwner = auth.currentUser?.uid === item.userId;
  const [downloading, setDownloading] = useState(false);

  const dateString = item.createdAt?.seconds 
    ? new Date(item.createdAt.seconds * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : 'New';

  //  SAVE TO GALLERY LOGIC 
  const saveImageToGallery = async (imageUrl: string) => {
    try {
      setDownloading(true);
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert("Permission Denied", "We need access to your gallery to save photos.");
        return;
      }

      const filename = `${item.title.replace(/\s+/g, '_')}_${Date.now()}.jpg`;
      const fileUri = (FileSystem.cacheDirectory || '') + filename;

      const downloadResult = await FileSystem.downloadAsync(imageUrl, fileUri);
      await MediaLibrary.saveToLibraryAsync(downloadResult.uri);
      
      Alert.alert("Saved!", "Memory saved to your photo gallery! 📸");
    } catch (error) {
      console.error(error);
      Alert.alert("Download Error", "Failed to save the image.");
    } finally {
      setDownloading(false);
    }
  };

  const handleOptionsPress = () => {
    const options: AlertButton[] = [
      { 
        text: "Save to Gallery 📥", 
        onPress: () => {
          if (item.imageUrls?.[0]) saveImageToGallery(item.imageUrls[0]);
        } 
      },
    ];

    if (isOwner) {
      options.push(
        { text: "Edit Description", onPress: () => handleFullEdit() },
        { 
          text: item.isPublic ? "Make Private 🔒" : "Make Public 🌎", 
          onPress: () => { togglePrivacy(); } 
        },
        { text: "Delete", style: "destructive", onPress: () => confirmDelete() }
      );
    }

    options.push({ text: "Cancel", style: "cancel" });
    Alert.alert("Memory Options", "What would you like to do?", options);
  };

  const togglePrivacy = async () => {
    try { await updateDoc(doc(db, "posts", item.id), { isPublic: !item.isPublic }); } 
    catch (e) { Alert.alert("Error", "Update failed."); }
  };

  const confirmDelete = () => {
    Alert.alert("Delete", "Are you sure?", [
      { text: "Cancel" },
      { text: "Delete", style: "destructive", onPress: async () => await deleteDoc(doc(db, "posts", item.id)) }
    ]);
  };

  const handleFullEdit = () => {
    Alert.prompt(
      "Edit Description",
      "Update your note for this trip:",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Update", 
          onPress: async (newDesc: string | undefined) => {
            if (newDesc !== undefined) {
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
      <View className="items-center mr-4">
        <View className="w-4 h-4 rounded-full border-2 border-slate-950 bg-emerald-500 z-10 mt-1 shadow-sm" />
        {!isLast && <View className="w-[2px] flex-1 bg-slate-800/50 my-1" />}
      </View>

      <View className="flex-1 mb-10">
        <View className="flex-row justify-between items-center mb-2 px-1">
          <Text className="text-slate-600 text-[10px] font-black uppercase tracking-widest">{dateString}</Text>
          
          <View className="flex-row items-center">
            <Text className="text-emerald-500/60 text-[10px] font-bold mr-3">By {item.userName || 'Explorer'}</Text>
            <TouchableOpacity onPress={handleOptionsPress} className="p-1">
              <Ionicons name="ellipsis-horizontal" size={18} color="#475569" />
            </TouchableOpacity>
          </View>
        </View>

        <View className="bg-slate-900/40 rounded-[32px] p-2 border border-white/5 overflow-hidden">
          {item.imageUrls && item.imageUrls.length > 0 && (
            <View>
              <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} className="rounded-[28px]">
                {item.imageUrls.map((url, index) => (
                  <View key={index} style={{ width: width * 0.72 }}> 
                    <Image 
                      source={{ uri: url.replace('/upload/', '/upload/f_auto,q_auto,w_800/') }} 
                      className="w-full h-64 rounded-[28px]" 
                      resizeMode="cover"
                    />
                  </View>
                ))}
              </ScrollView>

              <TouchableOpacity 
                onPress={() => item.imageUrls?.[0] && saveImageToGallery(item.imageUrls[0])}
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
                <Text className="text-emerald-400 font-bold text-[10px] uppercase flex-1 ml-1.5" numberOfLines={1} ellipsizeMode="tail">
                  {item.locationName}
                </Text>
              </View>
              {item.mood && (
                <View className="bg-slate-800 w-10 h-10 rounded-full items-center justify-center flex-shrink-0">
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

//  MAIN SCREEN COMPONENT 
export default function TravelJournalScreen({ posts, fetchPosts }: { posts: TravelPost[], fetchPosts: () => Promise<void> }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try { await fetchPosts(); } 
    catch (error) { console.error(error); } 
    finally { setRefreshing(false); }
  }, [fetchPosts]);

  return (
    <View className="flex-1 bg-slate-950">
      <StatusBar barStyle="light-content" />
      
      <View 
        style={{ paddingTop: insets.top }} 
        className="bg-slate-950 border-b border-white/5"
      >
        <View className="px-6 h-16 flex-row justify-between items-center">
          <TouchableOpacity 
            onPress={() => router.back()}
            activeOpacity={0.7}
            className="bg-slate-900 w-10 h-10 rounded-xl border border-white/10 items-center justify-center"
          >
            <Ionicons name="chevron-back" size={22} color="white" />
          </TouchableOpacity>

          <Text className="text-white text-base font-black italic tracking-[3px]">
            MY JOURNEY
          </Text>

          <View className="w-10" /> 
        </View>
      </View>

      <ScrollView 
        className="flex-1 px-6 pt-6"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            tintColor="#10b981" 
            colors={["#10b981"]}
          />
        }
      >
        {posts.map((post, index) => (
          <TimelineItem key={post.id} item={post} isLast={index === posts.length - 1} />
        ))}
        <View style={{ height: insets.bottom + 40 }} />
      </ScrollView>
    </View>
  );
}