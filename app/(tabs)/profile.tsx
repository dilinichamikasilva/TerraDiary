import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { auth, db } from '../../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';

export default function ProfileScreen() {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        // Reference to the document in the "users" collection
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setUserData(docSnap.data());
        }
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      Toast.show({
        type: 'info',
        text1: 'Logged Out',
        text2: 'See you next time! 👋',
      });
      // Navigation is handled by RootLayout's auth listener
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Logout Failed' });
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-slate-950 justify-center items-center">
        <ActivityIndicator color="#10b981" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-slate-950 px-6 pt-20">
      <View className="items-center mb-8">
        <View className="w-24 h-24 bg-emerald-500 rounded-full items-center justify-center mb-4">
          <Text className="text-slate-950 text-3xl font-bold">
            {userData?.firstName?.charAt(0)}{userData?.lastName?.charAt(0)}
          </Text>
        </View>
        <Text className="text-white text-2xl font-bold">
          {userData?.firstName} {userData?.lastName}
        </Text>
        <Text className="text-slate-400 text-lg">{userData?.country} 📍</Text>
      </View>

      <View className="bg-slate-900 rounded-3xl p-6 border border-slate-800">
        <Text className="text-slate-500 uppercase text-xs font-bold mb-4 tracking-widest">Account Details</Text>
        
        <View className="mb-4">
          <Text className="text-slate-400 text-sm">Email Address</Text>
          <Text className="text-white text-base font-medium">{userData?.email}</Text>
        </View>

        <View className="mb-4">
          <Text className="text-slate-400 text-sm">Member Since</Text>
          <Text className="text-white text-base font-medium">
            {new Date(userData?.createdAt).toLocaleDateString()}
          </Text>
        </View>
      </View>

      <TouchableOpacity 
        onPress={handleLogout}
        className="mt-auto mb-10 bg-red-500/10 border border-red-500/20 p-4 rounded-2xl"
      >
        <Text className="text-red-500 text-center font-bold text-lg">Log Out</Text>
      </TouchableOpacity>
    </View>
  );
}