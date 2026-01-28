import { View, Text, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TravelPost } from '../types';

export function StatCard({ icon, count, label, color }: { icon: any, count: number, label: string, color: string }) {
  return (
    <View className="flex-1 bg-white/5 border border-white/10 rounded-[32px] p-5 items-center">
      <View style={{ backgroundColor: `${color}20` }} className="p-2 rounded-xl mb-2">
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <Text className="text-white text-2xl font-black">{count}</Text>
      <Text className="text-slate-500 text-[9px] uppercase font-bold tracking-[2px]">{label}</Text>
    </View>
  );
}

export function TimelineItem({ item, isLast }: { item: TravelPost, isLast: boolean }) {
  const dateString = item.createdAt?.seconds 
    ? new Date(item.createdAt.seconds * 1000).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      })
    : 'New';

  return (
    <View className="flex-row">
      {/* Sidebar */}
      <View className="items-center mr-4">
        <View className="w-4 h-4 rounded-full border-2 border-slate-950 bg-emerald-500 z-10 mt-1 shadow-sm" />
        {!isLast && <View className="w-[2px] flex-1 bg-slate-800/50 my-1" />}
      </View>

      <View className="flex-1 mb-10">
        {/* Date Label */}
        <Text className="text-slate-600 text-[10px] font-black uppercase tracking-widest mb-2 ml-1">
          {dateString}
        </Text>

        <View className="bg-slate-900/40 rounded-[32px] p-2 border border-white/5">
          {/* Main Photo with Cloudinary transformations  */}
          {item.imageUrl && (
            <Image 
              source={{ uri: item.imageUrl.replace('/upload/', '/upload/f_auto,q_auto,w_800/') }} 
              className="w-full h-56 rounded-[28px]"
              resizeMode="cover"
            />
          )}

          <View className="p-4">
            <View className="flex-row justify-between items-center mb-2">
              <View className="flex-row items-center bg-emerald-500/10 px-2 py-1 rounded-lg">
                <Ionicons name="location-sharp" size={10} color="#10b981" />
                <Text className="text-emerald-500 font-bold text-[9px] uppercase tracking-widest ml-1">
                  {item.locationName}
                </Text>
              </View>
              {item.mood && <Text className="text-xl">{item.mood}</Text>}
            </View>

            <Text className="text-white text-xl font-bold mb-1 leading-7">{item.title}</Text>
            {item.description ? (
              <Text className="text-slate-400 text-sm leading-6" numberOfLines={3}>
                {item.description}
              </Text>
            ) : null}

            {item.isPublic && (
              <View className="mt-4 flex-row items-center border-t border-white/5 pt-4">
                <Ionicons name="globe-outline" size={12} color="#3b82f6" />
                <Text className="text-blue-400 text-[9px] font-bold uppercase tracking-widest ml-2">Shared with World</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </View>
  );
}