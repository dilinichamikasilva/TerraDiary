import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { db } from '../../firebaseConfig';
import { collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { TravelPost } from '../../types';
import { TimelineItem } from '../../components/HomeComponents'; 
import "../../global.css";

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

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const feedItems = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      } as TravelPost));
      
      setPosts(feedItems);
      setLoading(false);
      setRefreshing(false);
    });

    return unsubscribe;
  };

  useEffect(() => {
    const unsubscribe = fetchFeed();
    return () => unsubscribe();
  }, []);

  return (
    <View className="flex-1 bg-slate-950">
      {/* Top Glow Decor */}
      <View className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px]" />

      <ScrollView 
        className="px-6 pt-20"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={() => fetchFeed()} 
            tintColor="#10b981" 
          />
        }
      >
        <View className="mb-8">
          <Text className="text-blue-400 text-lg font-medium tracking-tight">Discovery</Text>
          <Text className="text-white text-3xl font-black">Global Feed</Text>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#3b82f6" className="mt-20" />
        ) : posts.length === 0 ? (
          <View className="items-center mt-20">
             <Text className="text-slate-500 font-medium">The world is quiet right now...</Text>
          </View>
        ) : (
          <View className="pb-20">
            {posts.map((post, index) => (
              <View key={post.id}>                
                <TimelineItem 
                  item={post} 
                  isLast={index === posts.length - 1} 
                />
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}