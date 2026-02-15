import React, { useMemo, useEffect, useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { auth, db } from '../../service/firebaseConfig';
import { TravelPost } from '../../types';
import { Ionicons } from '@expo/vector-icons';
import { calculateDistance } from '../../utils/geoMath';

import { StatCard, AchievementItem } from '../../components/PassportComponents';

export default function PassportScreen() {
  const [posts, setPosts] = useState<TravelPost[]>([]);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(collection(db, "posts"), where("userId", "==", user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedPosts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as TravelPost));
      setPosts(fetchedPosts);
    });

    return unsubscribe;
  }, []);

  const stats = useMemo(() => {
    if (posts.length === 0) return null;

    const validPosts = posts
      .filter(p => p.latitude !== undefined && p.longitude !== undefined)
      .sort((a, b) => (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0));

    let totalKm = 0;
    for (let i = 0; i < validPosts.length - 1; i++) {
      totalKm += calculateDistance(
        Number(validPosts[i].latitude),
        Number(validPosts[i].longitude),
        Number(validPosts[i+1].latitude),
        Number(validPosts[i+1].longitude)
      );
    }

    const moodCounts: { [key: string]: number } = {};
    posts.forEach(p => { if (p.mood) moodCounts[p.mood] = (moodCounts[p.mood] || 0) + 1; });

    const uniqueLocs = new Set(posts.map(p => p.locationName?.split(',').pop()?.trim())).size;

    return { totalKm, moodCounts, uniqueLocs, totalPosts: posts.length };
  }, [posts]);

  if (!stats) return (
    <View className="flex-1 bg-slate-950 items-center justify-center p-6">
      <Ionicons name="airplane-outline" size={80} color="#1e293b" />
      <Text className="text-white text-xl font-black italic uppercase mt-4">Empty Passport</Text>
    </View>
  );

  return (
    <ScrollView className="flex-1 bg-slate-950 px-6 pt-16">
      <View className="flex-row justify-between items-start mb-8">
        <View>
          <Text className="text-white text-4xl font-black italic uppercase tracking-tighter">Passport</Text>
          <Text className="text-emerald-500 font-bold tracking-[3px] text-[10px] uppercase mt-1">Global Travel Records</Text>
        </View>
        <View className="bg-emerald-500/10 p-3 rounded-2xl border border-emerald-500/20">
          <Ionicons name="ribbon" size={24} color="#10b981" />
        </View>
      </View>

      <View className="flex-row justify-between mb-8">
        <StatCard label="Total Distance" value={`${stats.totalKm.toFixed(0)} KM`} icon="trail-sign" />
        <StatCard label="Destinations" value={stats.uniqueLocs.toString()} icon="earth" />
      </View>

      {/* Mood Section */}
      <View className="bg-slate-900/40 p-6 rounded-[40px] border border-white/5 mb-8">
          <Text className="text-slate-400 font-black text-[10px] uppercase tracking-widest mb-6">Travel Vibrations</Text>
          {Object.entries(stats.moodCounts).map(([mood, count]) => (
            <View key={mood} className="flex-row items-center mb-5">
              <View className="bg-slate-800 w-10 h-10 rounded-xl items-center justify-center">
                <Text className="text-lg">{mood}</Text>
              </View>
              <View className="flex-1 h-2.5 bg-slate-800/50 rounded-full overflow-hidden mx-4">
                <View className="h-full bg-emerald-500 rounded-full" style={{ width: `${(count / stats.totalPosts) * 100}%` }} />
              </View>
              <Text className="text-white font-black text-xs w-6 text-right">{count}</Text>
            </View>
          ))}
      </View>

      <Text className="text-slate-500 font-black text-[10px] uppercase tracking-widest mb-4 ml-2">Unlocked Achievements</Text>
      
      <AchievementItem 
        icon="globe" color="#3b82f6" title="World Citizen" 
        subtitle="Visited 3 or more unique locations." active={stats.uniqueLocs >= 3}
      />
      <AchievementItem 
        icon="flame" color="#f97316" title="The Nomad" 
        subtitle="Traveled over 500 KM in total." active={stats.totalKm > 500}
      />
      <AchievementItem 
        icon="camera" color="#a855f7" title="Memory Maker" 
        subtitle="Created more than 10 travel logs." active={stats.totalPosts >= 10}
      />

      <View className="h-24" />
    </ScrollView>
  );
}