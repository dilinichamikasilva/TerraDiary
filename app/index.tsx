import { View, Text } from 'react-native';
import React from 'react';
import { auth } from '../firebaseConfig';
import "../global.css";

const Index = () => {
  return (
    <View className="flex-1 justify-center items-center bg-slate-950">
      <Text className="text-white text-3xl font-bold tracking-tight">TerraDiary</Text>
      <View className="mt-4 px-4 py-2 bg-emerald-500/10 border border-emerald-500/50 rounded-full">
        <Text className="text-emerald-400 font-medium">
          Firebase: {auth.app.options.projectId ? "Connected ✅" : "Config Missing ❌"}
        </Text>
      </View>
    </View>
  );
};

export default Index;