import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur'; 
import "../../global.css";

export default function HomeScreen() {
  return (
    <View className="flex-1 bg-slate-950">
      {/* Background Glow */}
      <View className="absolute top-20 left-[-50] w-80 h-80 bg-emerald-500/10 rounded-full blur-[100px]" />

      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="px-6 pt-20">
        <View className="flex-row justify-between items-center mb-10">
          <View>
            <Text className="text-slate-400 text-lg font-medium">Welcome back,</Text>
            <Text className="text-white text-3xl font-black">Your Timeline</Text>
          </View>
        </View>

        {/* Empty State with BlurView */}
        <View className="flex-1 justify-center items-center pb-20">
          <View className="w-full overflow-hidden rounded-[40px] border border-white/10">
            <BlurView intensity={20} tint="dark" className="p-10 items-center">
              <View className="bg-emerald-500/20 p-6 rounded-full mb-6">
                <Ionicons name="airplane-outline" size={60} color="#10b981" />
              </View>
              <Text className="text-white text-2xl font-bold text-center">No adventures yet</Text>
              <Text className="text-slate-400 text-center mt-3 leading-6">
                Your world map is waiting to be filled. Start your first diary entry today!
              </Text>
              
              <TouchableOpacity className="bg-emerald-500 mt-8 px-10 py-4 rounded-2xl shadow-lg shadow-emerald-500/20">
                <Text className="text-slate-950 font-black uppercase tracking-widest">Add First Entry</Text>
              </TouchableOpacity>
            </BlurView>
          </View>
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity 
        style={{ bottom: 100 }}
        className="absolute right-6 bg-emerald-500 w-16 h-16 rounded-full items-center justify-center shadow-2xl shadow-emerald-500/50"
      >
        <Ionicons name="add" size={32} color="#020617" />
      </TouchableOpacity>
    </View>
  );
}