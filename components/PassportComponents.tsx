import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface StatCardProps {
  label: string;
  value: string;
  icon: any;
}

export function StatCard({ label, value, icon }: StatCardProps) {
  return (
    <View className="bg-slate-900/60 p-6 rounded-[38px] w-[48%] border border-white/5 shadow-sm">
      <View className="bg-emerald-500/10 w-10 h-10 rounded-xl items-center justify-center mb-4">
        <Ionicons name={icon} size={20} color="#10b981" />
      </View>
      <Text className="text-white text-2xl font-black tracking-tighter">{value}</Text>
      <Text className="text-slate-500 text-[10px] font-bold uppercase mt-1 tracking-wider">
        {label}
      </Text>
    </View>
  );
}

interface AchievementProps {
  icon: any;
  color: string;
  title: string;
  subtitle: string;
  active: boolean;
}

export function AchievementItem({ icon, color, title, subtitle, active }: AchievementProps) {
  return (
    <View 
      className={`flex-row items-center p-5 rounded-[32px] border mb-4 ${
        active ? 'bg-slate-900/80 border-white/10 shadow-lg' : 'bg-slate-950 border-white/5 opacity-30'
      }`}
    >
      <View 
        style={{ backgroundColor: active ? `${color}20` : '#1e293b' }} 
        className="w-14 h-14 rounded-2xl items-center justify-center"
      >
        <Ionicons name={icon} size={26} color={active ? color : '#475569'} />
      </View>
      
      <View className="flex-1 ml-5">
        <Text className={`font-black text-sm ${active ? 'text-white' : 'text-slate-500'}`}>
          {title.toUpperCase()}
        </Text>
        <Text className="text-slate-500 text-[10px] font-medium mt-0.5 leading-3">
          {subtitle}
        </Text>
      </View>
      
      {active && (
        <View className="bg-emerald-500/20 rounded-full p-1">
          <Ionicons name="checkmark-circle" size={22} color="#10b981" />
        </View>
      )}
    </View>
  );
}