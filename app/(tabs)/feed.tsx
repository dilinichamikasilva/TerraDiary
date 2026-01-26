import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import "../../global.css";

export default function FeedScreen() {
  return (
    <View className="flex-1 bg-slate-950">
      {/* Background Glow - Different color for Feed */}
      <View className="absolute top-10 right-[-50] w-80 h-80 bg-blue-500/10 rounded-full blur-[100px]" />

      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="px-6 pt-20">
        <View className="mb-8">
          <Text className="text-slate-400 text-lg font-medium">Global</Text>
          <Text className="text-white text-3xl font-black">Travel Feed</Text>
        </View>

        {/* Placeholder for Feed Items */}
        <View className="space-y-4">
          <View className="overflow-hidden rounded-3xl border border-white/5 bg-white/5 mb-4">
            <BlurView intensity={10} tint="dark" className="p-6">
              <View className="flex-row items-center mb-4">
                <View className="w-10 h-10 rounded-full bg-emerald-500/20 items-center justify-center">
                  <Ionicons name="person" size={20} color="#10b981" />
                </View>
                <View className="ml-3">
                  <Text className="text-white font-bold">Explorer_01</Text>
                  <Text className="text-slate-500 text-xs">2 hours ago</Text>
                </View>
              </View>
              <Text className="text-slate-300 leading-6">
                Just touched down in Tokyo! The neon lights are even more incredible in person. 🇯🇵
              </Text>
            </BlurView>
          </View>

          {/* Empty State if no posts */}
          <View className="items-center justify-center py-10">
            <Ionicons name="earth-outline" size={40} color="#334155" />
            <Text className="text-slate-500 mt-4 text-center">
              New adventures from the community will appear here.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}