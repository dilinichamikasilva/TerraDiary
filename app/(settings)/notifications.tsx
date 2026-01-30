import React, { useState } from 'react';
import { View, Text, Switch } from 'react-native';
import { SettingsHeader } from '../../components/SettingsHeader';

export default function NotificationSettings() {
  const [isMemoryReminders, setIsMemoryReminders] = useState(true);
  const [isNewFeeds, setIsNewFeeds] = useState(false);

  return (
    <View className="flex-1 bg-slate-950 p-6 pt-12">
     
      <SettingsHeader title="Notifications" />

      <View className="space-y-4 mt-2">
        
        
        <View className="flex-row justify-between items-center bg-slate-900/50 p-5 rounded-3xl border border-white/5">
          <View className="flex-1 pr-4">
            <Text className="text-white font-bold text-lg">Memory Reminders</Text>
            <Text className="text-slate-500 text-xs mt-1">
              Receive notifications about your past travel adventures.
            </Text>
          </View>
          <Switch 
            value={isMemoryReminders} 
            onValueChange={setIsMemoryReminders}
            trackColor={{ false: "#1e293b", true: "#065f46" }}
            thumbColor={isMemoryReminders ? "#10b981" : "#64748b"}
            
            ios_backgroundColor="#1e293b"
          />
        </View>

       
        <View className="flex-row justify-between items-center bg-slate-900/50 p-5 rounded-3xl border border-white/5">
          <View className="flex-1 pr-4">
            <Text className="text-white font-bold text-lg">Community Updates</Text>
            <Text className="text-slate-500 text-xs mt-1">
              Be the first to know when friends post new memories.
            </Text>
          </View>
          <Switch 
            value={isNewFeeds} 
            onValueChange={setIsNewFeeds}
            trackColor={{ false: "#1e293b", true: "#065f46" }}
            thumbColor={isNewFeeds ? "#10b981" : "#64748b"}
            ios_backgroundColor="#1e293b"
          />
        </View>

      </View>

      <Text className="text-slate-600 text-center text-[10px] uppercase font-bold tracking-widest mt-10">
        Notification Preferences are saved locally
      </Text>
    </View>
  );
}