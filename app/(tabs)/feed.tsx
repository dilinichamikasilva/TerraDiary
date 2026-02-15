import { collection, limit, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, Text, View, Dimensions } from 'react-native';
import { TimelineItem } from '../../components/HomeComponents';
import { db } from '../../service/firebaseConfig';
import { TravelPost } from '../../types';
import { LinearGradient } from 'expo-linear-gradient'; 

const { width } = Dimensions.get('window');

export default function FeedScreen() {
  const [posts, setPosts] = useState<TravelPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchFeed = () => {
    const q = query(
      collection(db, "posts"),
      where("isPublic", "==", true),
      orderBy("createdAt", "desc"),
      limit(50)
    );

    return onSnapshot(q, (snapshot) => {
      const feedItems = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      } as TravelPost));
      setPosts(feedItems);
      setLoading(false);
      setRefreshing(false);
    }, (error) => {
      console.error("Feed Fetch Error:", error);
      setLoading(false);
      setRefreshing(false);
    });
  };

  useEffect(() => {
    const unsubscribe = fetchFeed();
    return () => unsubscribe();
  }, []);

  return (
    <View className="flex-1 bg-slate-950">
      <View className="absolute top-[-20] left-[-20] w-80 h-80 bg-blue-600/10 rounded-full blur-[100px]" />
      <View className="absolute bottom-20 right-[-20] w-80 h-80 bg-emerald-500/10 rounded-full blur-[100px]" />

      <ScrollView 
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => {setRefreshing(true); fetchFeed();}} tintColor="#60a5fa" />
        }
      >
        {/* Header Section */}
        <View className="px-6 pt-24 pb-10">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-blue-400 text-sm font-bold tracking-[3px] uppercase">
                Discovery
              </Text>
              <Text className="text-white text-4xl font-black tracking-tight mt-1">
                Global Feed
              </Text>
            </View>
            <View className="h-12 w-12 rounded-2xl bg-slate-800/80 items-center justify-center border border-slate-700/50">
               <Text className="text-blue-400 font-bold">{posts.length}</Text>
            </View>
          </View>
          
          <View className="h-[2px] w-12 bg-blue-500 mt-4 rounded-full" />
        </View>

        {/* Content Section */}
        <View className="px-6">
          {loading && !refreshing ? (
            <View className="mt-32 items-center">
              <ActivityIndicator size="large" color="#3b82f6" />
              <Text className="text-slate-500 mt-4 font-medium italic">Finding new horizons...</Text>
            </View>
          ) : posts.length === 0 ? (
            <View className="items-center mt-20 bg-slate-900/40 p-12 rounded-[40px] border border-white/5 backdrop-blur-md">
               <Text className="text-white text-xl font-bold mb-2">No Stories Yet</Text>
               <Text className="text-slate-400 text-center leading-5">
                 The community is packing for their next trip. Check back later!
               </Text>
            </View>
          ) : (
            <View className="pb-40">
              {posts.map((post, index) => (
                <View key={post.id} className="mb-6">
                   <TimelineItem 
                    item={post} 
                    isLast={index === posts.length - 1} 
                  />
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      
      <LinearGradient
        colors={['transparent', '#020617']}
        style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 100 }}
      />
    </View>
  );
}