import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  Image, 
  Dimensions, 
  TouchableOpacity, 
  Alert, 
  ActivityIndicator,
  AlertButton,
  Platform,
  Modal,
  StyleSheet,
  FlatList
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { TravelPost } from '../types';
import { db, auth } from '../service/firebaseConfig';
import { doc, updateDoc, deleteDoc, onSnapshot } from 'firebase/firestore';

import * as FileSystem from 'expo-file-system/legacy';
import * as MediaLibrary from 'expo-media-library';

const { width, height } = Dimensions.get('window');

//  STAT CARD 
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
  const [fullScreenVisible, setFullScreenVisible] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  
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
    }, (error) => console.error("User sync error:", error));
    return () => unsubscribe();
  }, [item.userId]);

  const dateString = item.createdAt?.seconds 
    ? new Date(item.createdAt.seconds * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : 'New';

  //  DOWNLOAD LOGIC (Multi-Image Support) 
  const saveImages = async (uris: string[], isAll = false) => {
    try {
      setDownloading(true);
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert("Permission Denied", "Gallery access is needed to save photos.");
        return;
      }

      for (let i = 0; i < uris.length; i++) {
        const filename = `${item.title.replace(/\s+/g, '_')}_${Date.now()}_${i}.jpg`;
        const fileUri = `${FileSystem.cacheDirectory}${filename}`;
        const downloadResult = await FileSystem.downloadAsync(uris[i], fileUri);
        await MediaLibrary.saveToLibraryAsync(downloadResult.uri);
      }

      Alert.alert("Success", isAll ? `Saved all ${uris.length} images! 📸` : "Photo saved! 📸");
    } catch (error) {
      Alert.alert("Error", "Failed to save to gallery.");
    } finally {
      setDownloading(false);
    }
  };

  const scrollToIndex = (index: number) => {
    if (index < 0 || index >= (item.imageUrls?.length || 0)) return;
    flatListRef.current?.scrollToIndex({ index, animated: true });
    setActiveIndex(index);
  };

  const handleScroll = (event: any) => {
    const xPos = event.nativeEvent.contentOffset.x;
    setActiveIndex(Math.round(xPos / width));
  };

  const handleOptionsPress = () => {
    const options: AlertButton[] = [
      { 
        text: "Save Current Photo 📥", 
        onPress: () => item.imageUrls?.[activeIndex] && saveImages([item.imageUrls[activeIndex]]) 
      },
    ];

    if (item.imageUrls && item.imageUrls.length > 1) {
      options.push({ 
        text: `Save All (${item.imageUrls.length}) 📂`, 
        onPress: () => saveImages(item.imageUrls!, true) 
      });
    }

    if (isOwner) {
      options.push(
        { text: "Edit Description", onPress: () => handleEditDescription() },
        { text: item.isPublic ? "Make Private 🔒" : "Make Public 🌎", onPress: () => togglePrivacy() },
        { text: "Delete Memory", style: "destructive", onPress: () => confirmDelete() }
      );
    }
    options.push({ text: "Cancel", style: "cancel" });
    Alert.alert("Memory Options", "Manage this memory", options);
  };

  const togglePrivacy = async () => {
    try { await updateDoc(doc(db, "posts", item.id), { isPublic: !item.isPublic }); } 
    catch (e) { Alert.alert("Error", "Update failed."); }
  };

  const confirmDelete = () => {
    Alert.alert("Delete", "This cannot be undone.", [
      { text: "Cancel" },
      { text: "Delete", style: "destructive", onPress: async () => await deleteDoc(doc(db, "posts", item.id)) }
    ]);
  };

  const handleEditDescription = () => {
    if (Platform.OS === 'ios') {
      Alert.prompt("Edit Description", "Update your note:", [
        { text: "Cancel", style: "cancel" },
        { text: "Update", onPress: async (newDesc?: string) => {
          if (newDesc !== undefined) await updateDoc(doc(db, "posts", item.id), { description: newDesc });
        }}
      ], 'plain-text', item.description);
    } else {
      Alert.alert("Note", "Editing optimized for iOS.");
    }
  };

  return (
    <View className="flex-row">
      <View className="items-center mr-4">
        <View className="w-4 h-4 rounded-full border-2 border-slate-950 bg-emerald-500 z-10 mt-2 shadow-sm" />
        {!isLast && <View className="w-[2px] flex-1 bg-slate-800/50 my-1" />}
      </View>

      <View className="flex-1 mb-10">
        {/* HEADER */}
        <View className="flex-row justify-between items-center mb-4 px-1">
          <View className="flex-row items-center">
            <View className="mr-3 relative">
              {authorPhoto ? (
                <Image source={{ uri: authorPhoto }} className="w-12 h-12 rounded-full border-2 border-emerald-500/20" />
              ) : (
                <View className="w-12 h-12 rounded-full bg-slate-800 items-center justify-center border-2 border-slate-700">
                  <Ionicons name="person" size={20} color="#475569" />
                </View>
              )}
              <View className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-slate-950" />
            </View>
            <View>
              <Text className="text-white font-bold text-base">{isOwner ? "You" : authorName}</Text>
              <Text className="text-slate-500 text-[10px] font-black uppercase tracking-widest">{dateString}</Text>
            </View>
          </View>
          <TouchableOpacity onPress={handleOptionsPress} className="bg-slate-900/80 w-10 h-10 rounded-full items-center justify-center border border-white/5">
            <Ionicons name="ellipsis-horizontal" size={20} color="#94a3b8" />
          </TouchableOpacity>
        </View>

        {/* CARD BODY */}
        <View className="bg-slate-900/40 rounded-[32px] p-2 border border-white/5 overflow-hidden">
          {item.imageUrls && item.imageUrls.length > 0 && (
            <View className="relative">
              <TouchableOpacity activeOpacity={0.9} onPress={() => setFullScreenVisible(true)}>
                <Image 
                  source={{ uri: item.imageUrls[0].replace('/upload/', '/upload/f_auto,q_auto,w_800/') }} 
                  className="w-full h-72 rounded-[28px]" 
                  resizeMode="cover"
                />
                {item.imageUrls.length > 1 && (
                    <View className="absolute top-4 left-4 bg-black/60 px-3 py-1 rounded-full border border-white/10">
                        <Text className="text-white text-[10px] font-bold">{item.imageUrls.length} Photos</Text>
                    </View>
                )}
                <View className="absolute bottom-4 right-4 bg-black/40 p-2 rounded-full backdrop-blur-md">
                   <Ionicons name="expand" size={18} color="white" />
                </View>
              </TouchableOpacity>
            </View>
          )}

          <View className="p-4">
            <View className="flex-row justify-between items-center mb-3">
              <View className="flex-1 flex-row items-center bg-emerald-500/10 px-3 py-2 rounded-xl border border-emerald-500/20 mr-3">
                <Ionicons name="location-sharp" size={14} color="#10b981" />
                <Text className="text-emerald-400 font-bold text-[11px] uppercase flex-1 ml-2" numberOfLines={1}>{item.locationName}</Text>
              </View>
              {item.mood && (
                <View className="bg-slate-800 w-11 h-11 rounded-full items-center justify-center border border-white/5">
                  <Text className="text-2xl">{item.mood}</Text>
                </View>
              )}
            </View>
            <Text className="text-white text-2xl font-black mb-2">{item.title}</Text>
            {item.description && <Text className="text-slate-400 text-sm leading-6 mb-2" numberOfLines={3}>{item.description}</Text>}
          </View>
        </View>
      </View>

      {/*  MULTI-IMAGE FULLSCREEN MODAL  */}
      <Modal visible={fullScreenVisible} transparent animationType="fade" statusBarTranslucent>
        <View style={styles.modalContainer}>
          <TouchableOpacity activeOpacity={1} style={StyleSheet.absoluteFill} onPress={() => setFullScreenVisible(false)}>
            <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
          </TouchableOpacity>
          
          {/* HEADER BUTTONS */}
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setFullScreenVisible(false)} style={styles.headerBtn}>
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => item.imageUrls?.[activeIndex] && saveImages([item.imageUrls[activeIndex]])}
              style={[styles.headerBtn, { backgroundColor: '#10b981' }]}
            >
              {downloading ? <ActivityIndicator size="small" color="white" /> : <Ionicons name="download-outline" size={24} color="white" />}
            </TouchableOpacity>
          </View>

          {/* SLIDER */}
          <FlatList
            ref={flatListRef}
            data={item.imageUrls}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            keyExtractor={(_, index) => index.toString()}
            renderItem={({ item: imgUri }) => (
              <View style={{ width, justifyContent: 'center', alignItems: 'center' }}>
                <Image source={{ uri: imgUri }} style={styles.fullImg} resizeMode="contain" />
              </View>
            )}
          />

          {/* SWAP CONTROLS */}
          {item.imageUrls && item.imageUrls.length > 1 && (
            <>
              <TouchableOpacity 
                style={[styles.navBtn, { left: 20 }]} 
                onPress={() => scrollToIndex(activeIndex - 1)}
                className={activeIndex === 0 ? "opacity-20" : "opacity-100"}
              >
                <Ionicons name="chevron-back" size={24} color="white" />
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.navBtn, { right: 20 }]} 
                onPress={() => scrollToIndex(activeIndex + 1)}
                className={activeIndex === item.imageUrls.length - 1 ? "opacity-20" : "opacity-100"}
              >
                <Ionicons name="chevron-forward" size={24} color="white" />
              </TouchableOpacity>

              <View style={styles.pagination}>
                {item.imageUrls.map((_, i) => (
                  <View 
                    key={i} 
                    style={[styles.dot, { backgroundColor: i === activeIndex ? '#10b981' : 'rgba(255,255,255,0.3)' }]} 
                  />
                ))}
              </View>
            </>
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  modalContainer: { flex: 1, backgroundColor: 'rgba(2, 6, 23, 0.98)', justifyContent: 'center', alignItems: 'center' },
  modalHeader: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 25,
    zIndex: 100,
  },
  headerBtn: { 
    width: 48, 
    height: 48, 
    borderRadius: 24, 
    backgroundColor: 'rgba(255,255,255,0.15)', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  fullImg: { width: width, height: height * 0.85 },
  navBtn: { 
    position: 'absolute', 
    top: height / 2 - 25, 
    zIndex: 50, 
    backgroundColor: 'rgba(255,255,255,0.1)', 
    width: 50, 
    height: 50, 
    borderRadius: 25, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  pagination: { position: 'absolute', bottom: 60, flexDirection: 'row', zIndex: 50 },
  dot: { width: 8, height: 8, borderRadius: 4, marginHorizontal: 4 }
});