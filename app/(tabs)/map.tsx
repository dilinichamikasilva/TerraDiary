import React from 'react';
import { View, Text } from 'react-native';
import { BlurView } from 'expo-blur';

export default function MapScreen() {
  return (
    <View className="flex-1 bg-slate-950 items-center justify-center">
      <View className="absolute top-40 right-[-50] w-80 h-80 bg-blue-500/10 rounded-full blur-[100px]" />
      
      <View className="overflow-hidden rounded-3xl border border-white/10">
        <BlurView intensity={30} tint="dark" className="p-10">
          <Text className="text-white text-xl font-bold">Map Coming Soon</Text>
          <Text className="text-slate-400 mt-2">Interactive globetrotter view.</Text>
        </BlurView>
      </View>
    </View>
  );
}