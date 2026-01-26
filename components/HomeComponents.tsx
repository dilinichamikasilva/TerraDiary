import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TravelPost } from '../types';

export function StatCard({ icon, count, label, color }: { icon: any, count: number, label: string, color: string }) {
  return (
    <View className="flex-1 bg-white/5 border border-white/10 rounded-3xl p-4 items-center">
      <Ionicons name={icon} size={20} color={color} />
      <Text className="text-white text-xl font-black mt-1">{count}</Text>
      <Text className="text-slate-500 text-[10px] uppercase font-bold tracking-widest">{label}</Text>
    </View>
  );
}

export function TimelineItem({ item, isLast }: { item: TravelPost, isLast: boolean }) {
  return (
    <View className="flex-row">
      <View className="items-center mr-4">
        <View className="w-3 h-3 rounded-full bg-emerald-500 z-10" />
        {!isLast && <View className="w-[1px] flex-1 bg-slate-800 my-1" />}
      </View>
      <View className="flex-1 mb-8">
        <View className="bg-slate-900/40 rounded-3xl p-5 border border-white/5">
          <View className="flex-row justify-between mb-2">
            <Text className="text-emerald-400 font-bold text-[10px] uppercase tracking-widest">{item.locationName}</Text>
            {item.mood && <Text className="text-lg">{item.mood}</Text>}
          </View>
          <Text className="text-white text-lg font-bold mb-1">{item.title}</Text>
          <Text className="text-slate-400 text-sm leading-5">{item.description}</Text>
        </View>
      </View>
    </View>
  );
}