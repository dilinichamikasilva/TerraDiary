import { View, Text, Image, ScrollView, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TravelPost } from '../types';

const { width } = Dimensions.get('window');


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
  //Format Firebase Timestamp
  const dateString = item.createdAt?.seconds 
    ? new Date(item.createdAt.seconds * 1000).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      })
    : 'New';

  return (
    <View className="flex-row">
      {/* Sidebar - The Dot and Line */}
      <View className="items-center mr-4">
        <View className="w-4 h-4 rounded-full border-2 border-slate-950 bg-emerald-500 z-10 mt-1 shadow-sm" />
        {!isLast && <View className="w-[2px] flex-1 bg-slate-800/50 my-1" />}
      </View>

      <View className="flex-1 mb-10">
        {/* Top Label*/}
        <View className="flex-row justify-between items-center mb-2 px-1">
          <Text className="text-slate-600 text-[10px] font-black uppercase tracking-widest">
            {dateString}
          </Text>
          <Text className="text-emerald-500/60 text-[10px] font-bold uppercase tracking-widest">
            By {item.userName || 'Explorer'}
          </Text>
        </View>

        {/* Main Memory Card */}
        <View className="bg-slate-900/40 rounded-[32px] p-2 border border-white/5 overflow-hidden">
          
          {/* Multi-Image  */}
          {item.imageUrls && item.imageUrls.length > 0 ? (
            <View>
              <ScrollView 
                horizontal 
                pagingEnabled 
                showsHorizontalScrollIndicator={false}
                className="rounded-[28px]"
              >
                {item.imageUrls.map((url, index) => (
                  <View key={index} style={{ width: width * 0.75 }}> 
                    <Image 
                      source={{ uri: url.replace('/upload/', '/upload/f_auto,q_auto,w_800/') }} 
                      className="w-full h-64 rounded-[28px]"
                      resizeMode="cover"
                    />
                    
                    {/* Image Counter Badge */}
                    {item.imageUrls!.length > 1 && (
                      <View className="absolute top-4 right-4 bg-black/50 px-3 py-1 rounded-full border border-white/10">
                        <Text className="text-white text-[10px] font-bold">
                          {index + 1} / {item.imageUrls!.length}
                        </Text>
                      </View>
                    )}
                  </View>
                ))}
              </ScrollView>
              
              {/* Swipe Indicator Tip */}
              {item.imageUrls.length > 1 && (
                <View className="absolute bottom-4 left-0 right-0 items-center">
                   <Ionicons name="ellipsis-horizontal" size={16} color="rgba(255,255,255,0.5)" />
                </View>
              )}
            </View>
          ) : null}

          <View className="p-4">
            {/* Location and Mood Tag */}
            <View className="flex-row justify-between items-center mb-3">
              <View className="flex-row items-center bg-emerald-500/10 px-2.5 py-1.5 rounded-xl border border-emerald-500/20">
                <Ionicons name="location-sharp" size={12} color="#10b981" />
                <Text className="text-emerald-400 font-bold text-[10px] uppercase tracking-widest ml-1.5">
                  {item.locationName}
                </Text>
              </View>
              {item.mood && (
                <View className="bg-slate-800 w-10 h-10 rounded-full items-center justify-center border border-white/5">
                  <Text className="text-xl">{item.mood}</Text>
                </View>
              )}
            </View>

            {/* Title and Description */}
            <Text className="text-white text-xl font-bold mb-2 leading-7">
              {item.title}
            </Text>
            
            {item.description ? (
              <Text className="text-slate-400 text-sm leading-6" numberOfLines={3}>
                {item.description}
              </Text>
            ) : null}

            {/* Social Indicator */}
            {item.isPublic && (
              <View className="mt-5 flex-row items-center border-t border-white/5 pt-4">
                <View className="bg-blue-500/10 p-1.5 rounded-lg mr-2">
                  <Ionicons name="globe-outline" size={12} color="#3b82f6" />
                </View>
                <Text className="text-blue-400 text-[9px] font-black uppercase tracking-[2px]">
                  Shared with community
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </View>
  );
}