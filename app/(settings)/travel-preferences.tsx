import React, { useState } from 'react';
import { View, Text, Switch, TouchableOpacity } from 'react-native';
import { SettingsHeader } from '../../components/SettingsHeader';
import { Ionicons } from '@expo/vector-icons';

export default function TravelPreferences() {
  const [isMetric, setIsMetric] = useState(true);
  const [isPrivateMode, setIsPrivateMode] = useState(false); 

  return (
    <View className="flex-1 bg-slate-950 p-6 pt-12">
      <SettingsHeader title="Preferences" />

      <View className="space-y-4 mt-6">
        
        {/* Unit Measurement Toggle */}
        <View className="flex-row justify-between items-center bg-slate-900/50 p-5 rounded-3xl border border-white/5">
          <View className="flex-1 pr-4">
            <View className="flex-row items-center space-x-2">
              <Ionicons name="speedometer-outline" size={20} color="#10b981" />
              <Text className="text-white font-bold text-lg ml-2">Distance Units</Text>
            </View>
            <Text className="text-slate-500 text-xs mt-1">
              Currently using {isMetric ? 'Kilometers (km)' : 'Miles (mi)'} for travel stats.
            </Text>
          </View>
          <Switch 
            value={isMetric} 
            onValueChange={setIsMetric}
            trackColor={{ false: "#1e293b", true: "#065f46" }}
            thumbColor={isMetric ? "#10b981" : "#64748b"}
            ios_backgroundColor="#1e293b"
          />
        </View>

        {/* Default Privacy Toggle */}
        <View className="flex-row justify-between items-center bg-slate-900/50 p-5 rounded-3xl border border-white/5">
          <View className="flex-1 pr-4">
            <View className="flex-row items-center space-x-2">
              <Ionicons name="lock-closed-outline" size={20} color="#3b82f6" />
              <Text className="text-white font-bold text-lg ml-2">Private by Default</Text>
            </View>
            <Text className="text-slate-500 text-xs mt-1">
              New memories will be set to 'Private' automatically.
            </Text>
          </View>
          <Switch 
            value={isPrivateMode} 
            onValueChange={setIsPrivateMode}
            trackColor={{ false: "#1e293b", true: "#1e3a8a" }}
            thumbColor={isPrivateMode ? "#3b82f6" : "#64748b"}
            ios_backgroundColor="#1e293b"
          />
        </View>

        {/* Language Selection */}
        <TouchableOpacity className="flex-row justify-between items-center bg-slate-900/50 p-5 rounded-3xl border border-white/5">
          <View className="flex-1 pr-4">
            <View className="flex-row items-center space-x-2">
              <Ionicons name="language-outline" size={20} color="#f59e0b" />
              <Text className="text-white font-bold text-lg ml-2">App Language</Text>
            </View>
            <Text className="text-slate-500 text-xs mt-1">English (US)</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#475569" />
        </TouchableOpacity>

      </View>

      <Text className="text-slate-600 text-center text-[10px] uppercase font-bold tracking-widest mt-10">
        Personalize your Terra Diary experience
      </Text>
    </View>
  );
}