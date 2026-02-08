import React, { useState, useEffect } from 'react';
import { View, Text, Switch, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SettingsHeader } from '../../components/SettingsHeader';
import { Ionicons } from '@expo/vector-icons';
import { db, auth } from '../../service/firebaseConfig';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';

export default function TravelPreferences() {
  const [isMetric, setIsMetric] = useState(true);
  const [isPrivateMode, setIsPrivateMode] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserPreferences();
  }, []);

  const fetchUserPreferences = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setIsPrivateMode(data.privateByDefault ?? false);
        setIsMetric(data.isMetric ?? true);
      }
    } catch (error) {
      console.error("Error fetching preferences:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePrivate = async (value: boolean) => {
    setIsPrivateMode(value);
    const user = auth.currentUser;
    if (!user) return;

    try {
      const userRef = doc(db, "users", user.uid);
      
      await setDoc(userRef, { privateByDefault: value }, { merge: true });
    } catch (error) {
      console.error("Error saving privacy preference:", error);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-slate-950 justify-center items-center">
        <ActivityIndicator color="#10b981" />
      </View>
    );
  }

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
              Currently using {isMetric ? 'Kilometers (km)' : 'Miles (mi)'}.
            </Text>
          </View>
          <Switch 
            value={isMetric} 
            onValueChange={setIsMetric}
            trackColor={{ false: "#1e293b", true: "#065f46" }}
            thumbColor={isMetric ? "#10b981" : "#64748b"}
          />
        </View>

        {/* Private by Default Toggle */}
        <View className="flex-row justify-between items-center bg-slate-900/50 p-5 rounded-3xl border border-white/5">
          <View className="flex-1 pr-4">
            <View className="flex-row items-center space-x-2">
              <Ionicons name="lock-closed-outline" size={20} color="#3b82f6" />
              <Text className="text-white font-bold text-lg ml-2">Private by Default</Text>
            </View>
            <Text className="text-slate-500 text-xs mt-1">
              New memories will be locked to 'Private' automatically.
            </Text>
          </View>
          <Switch 
            value={isPrivateMode} 
            onValueChange={handleTogglePrivate}
            trackColor={{ false: "#1e293b", true: "#1e3a8a" }}
            thumbColor={isPrivateMode ? "#3b82f6" : "#64748b"}
          />
        </View>
      </View>
    </View>
  );
}