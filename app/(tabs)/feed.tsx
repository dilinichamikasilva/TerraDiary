import { collection, limit, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, Text, View } from 'react-native';
import { TimelineItem } from '../../components/HomeComponents';
import "../../global.css";
import { db } from '../../service/firebaseConfig';
import { TravelPost } from '../../types';

export default function FeedScreen() {
  const [posts, setPosts] = useState<TravelPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchFeed = () => {
    setLoading(true);
    
    // Fetch only public posts, ordered by newest first
    const q = query(
      collection(db, "posts"),
      where("isPublic", "==", true),
      orderBy("createdAt", "desc"),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const feedItems = snapshot.docs.map(doc => ({ 
          id: doc.id, 
          ...doc.data() 
        } as TravelPost));
        
        setPosts(feedItems);
        setLoading(false);
        setRefreshing(false);
      },
      (error) => {
        console.error("Feed Fetch Error:", error);
        setLoading(false);
        setRefreshing(false);
      }
    );

    return unsubscribe;
  };

  useEffect(() => {
    const unsubscribe = fetchFeed();
    return () => unsubscribe();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchFeed();
  };

  return (
    <View className="flex-1 bg-slate-950">
      {/* Visual Accent */}
      <View className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px]" />

      <ScrollView 
        className="px-6 pt-20"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            tintColor="#3b82f6" 
          />
        }
      >
        <View className="mb-8">
          <Text className="text-blue-400 text-lg font-medium tracking-tight">Discovery</Text>
          <Text className="text-white text-3xl font-black">Global Feed</Text>
          <Text className="text-slate-500 text-xs mt-1 uppercase tracking-widest font-bold">
            Latest Memories from the Community
          </Text>
        </View>

        {loading && !refreshing ? (
          <View className="mt-20">
            <ActivityIndicator size="large" color="#3b82f6" />
          </View>
        ) : posts.length === 0 ? (
          <View className="items-center mt-20 bg-slate-900/40 p-10 rounded-3xl border border-white/5">
             <Text className="text-slate-400 font-medium text-center">
               The world is quiet right now. Check back later for new stories!
             </Text>
          </View>
        ) : (
          <View className="pb-32">
            {posts.map((post, index) => (
              <TimelineItem 
                key={post.id} 
                item={post} 
                isLast={index === posts.length - 1} 
              />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}