import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export function SettingsHeader({ title }: { title: string }) {
  const router = useRouter();
  return (
    <View className="flex-row items-center mb-8">
      <TouchableOpacity 
        onPress={() => router.back()}
        className="bg-slate-900 p-2 rounded-xl border border-slate-800"
      >
        <Ionicons name="arrow-back" size={24} color="#10b981" />
      </TouchableOpacity>
      <Text className="text-white text-2xl font-bold ml-4">{title}</Text>
    </View>
  );
}