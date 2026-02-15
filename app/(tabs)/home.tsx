import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { collection, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TextInput, TouchableOpacity, View, RefreshControl } from 'react-native';
import { StatCard, TimelineItem } from '../../components/HomeComponents';
import { auth, db } from '../../service/firebaseConfig';
import { TravelPost } from '../../types';
import { LinearGradient } from 'expo-linear-gradient';

export default function HomeScreen() {
  const router = useRouter();
  const [entries, setEntries] = useState<TravelPost[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<TravelPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({ countries: 0, memories: 0 });

  const currentUser = auth.currentUser;

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, "posts"),
      where("userId", "==", currentUser.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      } as TravelPost));
      
      setEntries(docs);
      setFilteredEntries(docs);
      
      const uniqueCountries = new Set(
        docs.map(d => d.locationName?.split(',').pop()?.trim().toLowerCase()).filter(Boolean)
      ).size;
      
      setStats({ countries: uniqueCountries, memories: docs.length });
      setLoading(false);
      setRefreshing(false);
    }, (error) => {
      console.error("Firestore Error:", error);
      setLoading(false);
      setRefreshing(false);
    });

    return () => unsubscribe();
  }, [currentUser]); 

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    if (text.trim() === '') {
      setFilteredEntries(entries);
    } else {
      const filtered = entries.filter(item => 
        item.title?.toLowerCase().includes(text.toLowerCase()) || 
        item.locationName?.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredEntries(filtered);
    }
  };

  return (
    <View className="flex-1 bg-slate-950">
      <View className="absolute top-[-100] right-[-50] w-[300px] h-[300px] bg-emerald-500/5 rounded-full blur-[120px]" />
      <View className="absolute top-[20%] left-[-100] w-[250px] h-[250px] bg-blue-500/5 rounded-full blur-[100px]" />

      <ScrollView 
        showsVerticalScrollIndicator={false}
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => setRefreshing(true)} tintColor="#10b981" />
        }
      >
        {/* Header Section */}
        <View className="px-6 pt-20 pb-6">
          <View className="flex-row items-center justify-between mb-8">
            <View>
              <Text className="text-emerald-400 text-sm font-bold tracking-[2px] uppercase">My Collection</Text>
              <Text className="text-white text-4xl font-black tracking-tight mt-1">Your Vault</Text>
            </View>

            <View className="flex-row items-center space-x-3">
              <TouchableOpacity 
                onPress={() => router.push("/add-entry")}
                activeOpacity={0.7}
                className="bg-emerald-500 h-12 w-12 rounded-2xl items-center justify-center shadow-lg shadow-emerald-500/20"
              >
                <Ionicons name="add" size={28} color="#020617" />
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={() => router.push("/profile")}
                className="h-12 w-12 rounded-2xl border border-white/10 overflow-hidden bg-slate-900/80 items-center justify-center"
              >
                 <Ionicons name="person" size={20} color="#10b981" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Stats Bar */}
          <View className="flex-row space-x-4">
            <StatCard icon="earth" count={stats.countries} label="Countries" color="#10b981" />
            <StatCard icon="bookmarks" count={stats.memories} label="Memories" color="#3b82f6" />
          </View>
        </View>

        {/* Search Bar */}
        <View className="px-6 mb-8">
          <View className="bg-slate-900/60 rounded-[24px] border border-white/10 px-4 flex-row items-center backdrop-blur-xl">
            <Ionicons name="search" size={20} color="#64748b" />
            <TextInput 
              placeholder="Search your journey..." 
              placeholderTextColor="#475569"
              className="flex-1 h-14 ml-3 text-white font-medium"
              value={searchQuery}
              onChangeText={handleSearch}
            />
          </View>
        </View>

        {/* List Content */}
        <View className="px-6 pb-32">
          <View className="flex-row items-center mb-6">
            <Text className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Timeline</Text>
            <View className="flex-1 h-[1px] bg-slate-800 ml-4" />
          </View>

          {loading ? (
            <View className="py-20"><ActivityIndicator size="large" color="#10b981" /></View>
          ) : filteredEntries.length === 0 ? (
            <View className="py-20 items-center bg-slate-900/30 rounded-[40px] border border-dashed border-slate-800">
              <Ionicons name="map-outline" size={32} color="#334155" className="mb-4" />
              <Text className="text-slate-500 text-center font-medium px-10">
                {searchQuery ? "No matching memories found." : "Your vault is empty. Start your adventure!"}
              </Text>
            </View>
          ) : (
            filteredEntries.map((item, index) => (
              <TimelineItem 
                key={item.id} 
                item={{
                  ...item,
                  userName: currentUser?.displayName || item.userName,
                  userPhoto: currentUser?.photoURL || item.userPhoto
                }} 
                isLast={index === filteredEntries.length - 1} 
              />
            ))
          )}
        </View>
      </ScrollView>

      {/* Bottom Fade */}
      <LinearGradient
        colors={['transparent', '#020617']}
        style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 100 }}
        pointerEvents="none"
      />
    </View>
  );
}