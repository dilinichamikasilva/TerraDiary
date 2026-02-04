import React from 'react';
import { View, Text, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ARMarkerProps {
  title: string;
  image: string;
  mood: string;
  distance: number;
}

export const ARMarker = ({ title, image, mood, distance }: ARMarkerProps) => {
  return (
    <View className="items-center w-32">
      <View className="bg-slate-900/95 p-2 rounded-[24px] border border-white/20 shadow-2xl">
        <Image 
          source={{ uri: image }} 
          className="w-28 h-20 rounded-2xl bg-slate-800" 
          resizeMode="cover"
        />
        <View className="p-2">
          <Text className="text-white font-black text-[10px]" numberOfLines={1}>
            {title.toUpperCase()}
          </Text>
          <View className="flex-row justify-between items-center mt-1">
            <Text className="text-emerald-400 text-[8px] font-bold">{mood}</Text>
            <Text className="text-slate-400 text-[8px] font-medium">
              {distance.toFixed(1)}km
            </Text>
          </View>
        </View>
      </View>
      {/* Pointer */}
      <Ionicons name="caret-down" size={20} color="rgba(15, 23, 42, 0.95)" style={{ marginTop: -5 }} />
    </View>
  );
};