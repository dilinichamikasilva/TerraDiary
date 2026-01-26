import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { db, auth } from '../../firebaseConfig';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { TravelPost } from '../../types';
import { StatCard, TimelineItem } from '../../components/HomeComponents';
import "../../global.css";

export default function HomeScreen() {
  const router = useRouter();
  const [entries, setEntries] = useState<TravelPost[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<TravelPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({ countries: 0, memories: 0 });

  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, "posts"),
      where("userId", "==", auth.currentUser.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      } as TravelPost));
      
      setEntries(docs);
      setFilteredEntries(docs);
      
      const uniqueCountries = new Set(docs.map(d => d.locationName?.trim().toLowerCase())).size;
      setStats({ countries: uniqueCountries, memories: docs.length });
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    if (text.trim() === '') {
      setFilteredEntries(entries);
    } else {
      const filtered = entries.filter(item => 
        item.title.toLowerCase().includes(text.toLowerCase()) || 
        item.locationName.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredEntries(filtered);
    }
  };

  return (
    <View className="flex-1 bg-slate-950">
      <View className="absolute top-20 left-[-50] w-80 h-80 bg-emerald-500/10 rounded-full blur-[100px]" />

      <ScrollView contentContainerStyle={{ paddingBottom: 140 }} className="px-6 pt-16">
        <View className="mb-6">
          <Text className="text-white text-3xl font-black mb-4">Your Vault</Text>
          <View className="flex-row space-x-3">
            <StatCard icon="earth" count={stats.countries} label="Countries" color="#10b981" />
            <StatCard icon="bookmarks" count={stats.memories} label="Memories" color="#3b82f6" />
          </View>
        </View>

        <View className="bg-slate-900/50 rounded-2xl border border-white/5 px-4 py-1 flex-row items-center mb-8">
          <Ionicons name="search" size={18} color="#64748b" />
          <TextInput 
            placeholder="Search memories..." 
            placeholderTextColor="#64748b"
            className="flex-1 h-12 ml-2 text-white"
            value={searchQuery}
            onChangeText={handleSearch}
          />
        </View>

        {loading ? (
          <ActivityIndicator color="#10b981" />
        ) : filteredEntries.length === 0 ? (
          <Text className="text-slate-500 text-center mt-10">No memories found.</Text>
        ) : (
          filteredEntries.map((item, index) => (
            <TimelineItem key={item.id} item={item} isLast={index === filteredEntries.length - 1} />
          ))
        )}
      </ScrollView>

      <TouchableOpacity 
        onPress={() => router.push("/add-entry")}
        className="absolute right-6 bottom-28 bg-emerald-500 w-16 h-16 rounded-full items-center justify-center shadow-2xl shadow-emerald-500/50"
      >
        <Ionicons name="add" size={32} color="#020617" />
      </TouchableOpacity>
    </View>
  );
}