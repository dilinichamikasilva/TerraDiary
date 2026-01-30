import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { sendPasswordResetEmail, deleteUser } from 'firebase/auth';
import { auth } from '../../service/firebaseConfig';
import { SettingsHeader } from '../../components/SettingsHeader';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { useRouter } from 'expo-router';

export default function PrivacySecurity() {
  const router = useRouter();

  const handleResetPassword = async () => {
    if (auth.currentUser?.email) {
      try {
        await sendPasswordResetEmail(auth, auth.currentUser.email);
        Alert.alert("Email Sent", "Check your inbox (and spam) to reset your password.");
      } catch (error: any) {
        Toast.show({ type: 'error', text1: 'Error', text2: error.message });
      }
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "Are you absolutely sure? This will permanently remove all your travel memories and cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete My Data", 
          style: "destructive", 
          onPress: async () => {
            const user = auth.currentUser;
            if (user) {
              try {
                await deleteUser(user);
                Toast.show({ type: 'info', text1: 'Account Deleted', text2: 'We are sorry to see you go.' });
                router.replace("/login"); 
              } catch (error: any) {
                if (error.code === 'auth/requires-recent-login') {
                  Alert.alert("Security Check", "Please log out and log back in to verify your identity before deleting your account.");
                } else {
                  Toast.show({ type: 'error', text1: 'Deletion Failed', text2: error.message });
                }
              }
            }
          } 
        }
      ]
    );
  };

  return (
    <View className="flex-1 bg-slate-950 p-6 pt-12">
      <SettingsHeader title="Privacy & Security" />

      <View className="space-y-4">
        {/* Reset Password Card */}
        <TouchableOpacity 
          onPress={handleResetPassword} 
          className="flex-row items-center bg-slate-900/50 p-5 rounded-3xl border border-white/5"
        >
          <View className="bg-emerald-500/10 p-2 rounded-xl">
            <Ionicons name="key-outline" size={20} color="#10b981" />
          </View>
          <View className="ml-4">
            <Text className="text-white font-bold">Reset Password</Text>
            <Text className="text-slate-500 text-xs">Receive an email to change your password</Text>
          </View>
        </TouchableOpacity>

        {/* Delete Account Card */}
        <TouchableOpacity 
          onPress={handleDeleteAccount} 
          className="flex-row items-center bg-red-500/5 p-5 rounded-3xl border border-red-500/10 mt-6"
        >
          <View className="bg-red-500/10 p-2 rounded-xl">
            <Ionicons name="trash-outline" size={20} color="#ef4444" />
          </View>
          <View className="ml-4">
            <Text className="text-red-500 font-bold">Delete Account</Text>
            <Text className="text-slate-500 text-xs">Permanently remove all your data</Text>
          </View>
        </TouchableOpacity>
      </View>

      <View className="mt-auto items-center pb-6">
        <Text className="text-slate-700 text-[10px] uppercase font-bold tracking-widest">
          End-to-End Encryption Enabled
        </Text>
      </View>
    </View>
  );
}