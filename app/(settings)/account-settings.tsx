import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  Image, 
  ActivityIndicator,
  StyleSheet 
} from 'react-native';
import { auth, db } from '../../service/firebaseConfig';
import { updateProfile } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import * as ImagePicker from 'expo-image-picker';
import Toast from 'react-native-toast-message';
import { SettingsHeader } from '../../components/SettingsHeader';
import { Ionicons } from '@expo/vector-icons';


interface UserFormData {
  firstName: string;
  lastName: string;
  displayName: string;
  country: string;
}

export default function AccountSettings() {
  const user = auth.currentUser;
  
  // States
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [profilePic, setProfilePic] = useState<string | null>(user?.photoURL || null);
  
  const [formData, setFormData] = useState<UserFormData>({
    firstName: '',
    lastName: '',
    displayName: user?.displayName || '',
    country: '',
  });

  useEffect(() => {
    const loadUserData = async () => {
      if (!user) return;
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setFormData({
            firstName: data.firstName || '',
            lastName: data.lastName || '',
            displayName: user.displayName || '',
            country: data.country || '',
          });
         
          if (data.photoURL) setProfilePic(data.photoURL);
        }
      } catch (error) {
        console.error("Error loading user data:", error);
      } finally {
        setFetching(false);
      }
    };
    loadUserData();
  }, [user]);

  const pickImage = async () => {
    
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Toast.show({ type: 'error', text1: 'Permission Denied', text2: 'We need camera roll access.' });
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      setProfilePic(result.assets[0].uri);
    }
  };

  const handleUpdate = async () => {
    if (!user) return;
    setLoading(true);

    try {
      // Update Firebase Auth Profile
      await updateProfile(user, { 
        displayName: formData.displayName.trim(),
        photoURL: profilePic 
      });

      //Update Firestore User Document
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        displayName: formData.displayName.trim(),
        country: formData.country.trim(),
        photoURL: profilePic, 
        updatedAt: new Date(),
      });

      Toast.show({ type: 'success', text1: 'Profile Synchronized! 🌍' });
    } catch (error: any) {
      Toast.show({ type: 'error', text1: 'Update failed', text2: error.message });
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <View className="flex-1 bg-slate-950 justify-center items-center">
        <ActivityIndicator color="#10b981" size="large" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-slate-950 p-6 pt-12">
      <SettingsHeader title="Edit Profile" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        
        {/* Profile Picture Section */}
        <View className="items-center mb-8">
          <TouchableOpacity onPress={pickImage} className="relative">
            <View className="w-28 h-28 rounded-full bg-slate-800 border-2 border-emerald-500 overflow-hidden items-center justify-center">
              {profilePic ? (
                <Image source={{ uri: profilePic }} className="w-full h-full" />
              ) : (
                <Ionicons name="person" size={50} color="#10b981" />
              )}
            </View>
            <View className="absolute bottom-0 right-0 bg-emerald-500 p-2 rounded-full border-2 border-slate-950">
              <Ionicons name="camera" size={16} color="#020617" />
            </View>
          </TouchableOpacity>
          <Text className="text-slate-500 text-xs mt-3 uppercase font-bold tracking-widest">Change Photo</Text>
        </View>

        {/* Form Fields */}
        <View>
          <InputField 
            label="Display Name" 
            value={formData.displayName} 
            onChange={(val: string) => setFormData({...formData, displayName: val})} 
          />
          
          {/* Fixed the flex-row container */}
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ flex: 1 }}>
               <InputField 
                 label="First Name" 
                 value={formData.firstName} 
                 onChange={(val: string) => setFormData({...formData, firstName: val})} 
               />
            </View>
            <View style={{ flex: 1 }}>
               <InputField 
                 label="Last Name" 
                 value={formData.lastName} 
                 onChange={(val: string) => setFormData({...formData, lastName: val})} 
               />
            </View>
          </View>

          <InputField 
            label="Country" 
            value={formData.country} 
            placeholder="e.g. Sri Lanka"
            onChange={(val: string) => setFormData({...formData, country: val})} 
          />
        </View>

        <TouchableOpacity 
          onPress={handleUpdate}
          disabled={loading}
          className={`p-5 rounded-2xl items-center mt-10 ${loading ? 'bg-emerald-800' : 'bg-emerald-500'}`}
        >
          {loading ? (
            <ActivityIndicator color="#020617" />
          ) : (
            <Text className="text-slate-950 font-black uppercase">Save Global Profile</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

// Fixed props types for InputField
interface InputFieldProps {
  label: string;
  value: string;
  onChange: (text: string) => void;
  placeholder?: string;
}

function InputField({ label, value, onChange, placeholder }: InputFieldProps) {
  return (
    <View className="mb-4">
      <Text className="text-slate-400 mb-2 ml-1 text-xs font-bold uppercase tracking-widest">{label}</Text>
      <TextInput 
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor="#475569"
        className="bg-slate-900 text-white p-4 rounded-2xl border border-slate-800 focus:border-emerald-500"
      />
    </View>
  );
}