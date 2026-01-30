import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { signOut } from 'firebase/auth';
import { collection, getDocs, query, where } from 'firebase/firestore';
import React, { useEffect, useState, useCallback } from 'react';
import { 
  Alert, 
  ScrollView, 
  Text, 
  TouchableOpacity, 
  View, 
  Image, 
  RefreshControl 
} from 'react-native';
import "../../global.css";
import { auth, db } from '../../service/firebaseConfig';

export default function ProfileScreen() {
  const router = useRouter();
  const [stats, setStats] = useState({ memories: 0, countries: 0 });
  const [refreshing, setRefreshing] = useState(false);
  
  
  const [currentUser, setCurrentUser] = useState(auth.currentUser);

  const fetchStats = async () => {
    if (!currentUser) return;
    try {
      const q = query(collection(db, "posts"), where("userId", "==", currentUser.uid));
      const querySnapshot = await getDocs(q);
      const docs = querySnapshot.docs.map(doc => doc.data());
      const uniqueCountries = new Set(docs.map(d => d.locationName?.toLowerCase())).size;
      
      setStats({
        memories: querySnapshot.size,
        countries: uniqueCountries
      });
    } catch (error) {
      console.error("Stats fetch error:", error);
    }
  };

  
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
     
      await auth.currentUser?.reload(); 
      
      setCurrentUser(auth.currentUser);
      
      await fetchStats();
    } catch (error) {
      console.error("Refresh error:", error);
    } finally {
      setRefreshing(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchStats();
  }, [currentUser]);

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to leave?", [
      { text: "Cancel", style: "cancel" },
      { 
        text: "Logout", 
        style: "destructive", 
        onPress: () => signOut(auth).then(() => router.replace("/login")) 
      }
    ]);
  };

  return (
    <View className="flex-1 bg-slate-950 px-6 pt-20">
      <View className="absolute -top-10 -right-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px]" />

      <ScrollView 
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
        
        <View className="items-center mb-10">
          <View className="w-24 h-24 bg-slate-800 rounded-full items-center justify-center border-2 border-emerald-500/50 overflow-hidden shadow-2xl shadow-emerald-500/20">
            {currentUser?.photoURL ? (
              <Image 
                
                key={currentUser.photoURL}
                source={{ uri: currentUser.photoURL }} 
                className="w-full h-full" 
              />
            ) : (
              <Ionicons name="person" size={40} color="#10b981" />
            )}
          </View>
          <Text className="text-white text-2xl font-black mt-4">
            {currentUser?.displayName || "Global Explorer"}
          </Text>
          <Text className="text-slate-500 text-sm mt-1">{currentUser?.email}</Text>
        </View>

        {/* Stats Row */}
        <View className="flex-row space-x-4 mb-8">
          <View className="flex-1 bg-slate-900/50 p-6 rounded-[32px] border border-white/5 items-center">
            <Text className="text-emerald-500 text-3xl font-black">{stats.countries}</Text>
            <Text className="text-slate-400 text-[10px] uppercase font-bold tracking-widest mt-1">Locations</Text>
          </View>
          <View className="flex-1 bg-slate-900/50 p-6 rounded-[32px] border border-white/5 items-center">
            <Text className="text-blue-400 text-3xl font-black">{stats.memories}</Text>
            <Text className="text-slate-400 text-[10px] uppercase font-bold tracking-widest mt-1">Memories</Text>
          </View>
        </View>

        {/* Menu Options */}
        <View className="space-y-3">
          <ProfileMenuBtn 
            icon="settings-outline" 
            label="Account Settings" 
            onPress={() => router.push("/account-settings")} 
          />
          <ProfileMenuBtn 
            icon="compass-outline" 
            label="Travel Preferences" 
            onPress={() => router.push("/travel-preferences")} 
          />
          <ProfileMenuBtn 
            icon="shield-checkmark-outline" 
            label="Privacy & Security" 
            onPress={() => router.push("/privacy-security")} 
          />
          
          <TouchableOpacity 
            onPress={handleLogout}
            className="flex-row items-center bg-red-500/10 p-5 rounded-3xl border border-red-500/20 mt-6"
          >
            <Ionicons name="log-out-outline" size={22} color="#ef4444" />
            <Text className="text-red-500 font-bold ml-4">Sign Out</Text>
          </TouchableOpacity>
        </View>

        <Text className="text-slate-700 text-center text-xs mt-10">Terra Diary v1.0.0</Text>
      </ScrollView>
    </View>
  );
}

function ProfileMenuBtn({ icon, label, onPress }: { icon: any, label: string, onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} className="flex-row items-center bg-slate-900/30 p-5 rounded-3xl border border-white/5 mb-3">
      <Ionicons name={icon} size={22} color="#10b981" />
      <Text className="text-slate-300 font-medium ml-4">{label}</Text>
      <View className="flex-1" />
      <Ionicons name="chevron-forward" size={18} color="#475569" />
    </TouchableOpacity>
  );
}