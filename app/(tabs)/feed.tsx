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

  useEffect(() => {
    setLoading(true);
    
    // Query
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
        //console.error("Feed Error:", error.code, error.message);
        setLoading(false);
        setRefreshing(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    
  };

  return (
    <View className="flex-1 bg-slate-950">
      <View className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px]" />

      <ScrollView 
        className="px-6 pt-20"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3b82f6" />
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