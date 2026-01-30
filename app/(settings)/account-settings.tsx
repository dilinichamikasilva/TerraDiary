import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { auth } from '../../service/firebaseConfig';
import { updateProfile } from 'firebase/auth';
import Toast from 'react-native-toast-message';
import { SettingsHeader } from '../../components/SettingsHeader';

export default function AccountSettings() {
  const [name, setName] = useState(auth.currentUser?.displayName || '');
  const [loading, setLoading] = useState(false);


  const handleUpdate = async () => {
    if (!auth.currentUser) {
      Toast.show({ type: 'error', text1: 'Not logged in' });
      return;
    }

    if (!name.trim()) {
      Toast.show({ type: 'info', text1: 'Name cannot be empty' });
      return;
    }

    setLoading(true);
    try {
     
      await updateProfile(auth.currentUser, { 
        displayName: name.trim() 
      });

      Toast.show({ 
        type: 'success', 
        text1: 'Success 🎉', 
        text2: 'Display name updated!' 
      });
    } catch (error: any) {
      Toast.show({ 
        type: 'error', 
        text1: 'Update failed', 
        text2: error.message 
      });
    } finally {
      setLoading(false);
    }
  };
 
  return (
    <View className="flex-1 bg-slate-950 p-6 pt-12">
      <SettingsHeader title="Account Settings" />
      
      <View className="space-y-4">
        <View>
          <Text className="text-slate-400 mb-2 ml-1 font-medium">Display Name</Text>
          <TextInput 
            value={name}
            onChangeText={setName}
            className="bg-slate-900 text-white p-4 rounded-2xl border border-slate-800 focus:border-emerald-500"
            placeholder="Explorer Name"
            placeholderTextColor="#475569"
          />
        </View>

        <TouchableOpacity 
          onPress={handleUpdate}
          disabled={loading}
          activeOpacity={0.7}
          className={`p-5 rounded-2xl items-center mt-4 ${
            loading ? 'bg-emerald-800/50' : 'bg-emerald-500'
          }`}
        >
          <Text className="text-slate-950 font-black uppercase tracking-wider">
            {loading ? "Updating..." : "Save Changes"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}