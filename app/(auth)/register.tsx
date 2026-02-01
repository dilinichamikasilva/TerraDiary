import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform, 
  TouchableWithoutFeedback, 
  Keyboard, 
  ActivityIndicator 
} from 'react-native';
import { useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';
import { Ionicons } from '@expo/vector-icons';
import { auth } from '../../service/firebaseConfig';
import { signOut } from 'firebase/auth';
import { registerUser } from '../../service/authService';

export default function RegisterScreen() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    country: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const router = useRouter();

  const validate = () => {
    const { firstName, lastName, country, email, password, confirmPassword } = formData;
    if (!firstName || !lastName || !country || !email || !password || !confirmPassword) {
      Toast.show({ type: 'error', text1: 'Missing Fields', text2: 'Please fill in all fields ✍️' });
      return false;
    }
    if (password !== confirmPassword) {
      Toast.show({ type: 'error', text1: 'Password Mismatch', text2: 'Passwords do not match ❌' });
      return false;
    }
    if (password.length < 6) {
      Toast.show({ type: 'error', text1: 'Weak Password', text2: 'Min. 6 characters required 🔒' });
      return false;
    }
    return true;
  };

  const handleRegister = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      
      await registerUser(formData);

      await signOut(auth);

      Toast.show({ 
        type: 'success', 
        text1: 'Welcome to TerraDiary! 🎉', 
        text2: 'Account created. Please login.' 
      });

      router.replace("/(auth)/login");

    } catch (error: any) {
      console.log("Reg Error:", error.code, error.message);
      
      let errorMessage = "Registration failed. Try again.";
      if (error.code === 'auth/email-already-in-use') errorMessage = "This email is already in use.";
      if (error.code === 'permission-denied') errorMessage = "Database error. Check your rules.";

      Toast.show({ type: 'error', text1: 'Error', text2: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View className="flex-1 bg-slate-950">
        <View className="absolute top-[-50] left-[-50] w-72 h-72 bg-emerald-500/10 rounded-full blur-[80px]" />
        <View className="absolute bottom-[-50] right-[-50] w-96 h-96 bg-blue-500/10 rounded-full blur-[100px]" />

        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
          <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }} showsVerticalScrollIndicator={false}>
            <View className="px-6 py-10 items-center">
              
              <View className="items-center mb-8">
                <View className="bg-emerald-500/10 p-4 rounded-3xl border border-emerald-500/20 mb-4">
                  <Ionicons name="planet-outline" size={48} color="#10b981" />
                </View>
                <Text className="text-white text-4xl font-black tracking-tight">TerraDiary</Text>
              </View>

              <View className="w-full bg-slate-900/60 p-6 rounded-[40px] border border-slate-800/50 shadow-2xl backdrop-blur-xl">
                <View className="flex-row justify-between mb-4">
                  <TextInput
                    className="bg-slate-800/50 p-4 rounded-2xl text-white border border-slate-700/50 w-[48%]"
                    placeholder="First Name" placeholderTextColor="#64748b"
                    onChangeText={(txt) => setFormData({...formData, firstName: txt})}
                    editable={!loading}
                  />
                  <TextInput
                    className="bg-slate-800/50 p-4 rounded-2xl text-white border border-slate-700/50 w-[48%]"
                    placeholder="Last Name" placeholderTextColor="#64748b"
                    onChangeText={(txt) => setFormData({...formData, lastName: txt})}
                    editable={!loading}
                  />
                </View>

                <TextInput
                  className="bg-slate-800/50 p-4 rounded-2xl mb-4 text-white border border-slate-700/50"
                  placeholder="Country" placeholderTextColor="#64748b"
                  onChangeText={(txt) => setFormData({...formData, country: txt})}
                  editable={!loading}
                />

                <TextInput
                  className="bg-slate-800/50 p-4 rounded-2xl mb-4 text-white border border-slate-700/50"
                  placeholder="Email" placeholderTextColor="#64748b"
                  autoCapitalize="none"
                  onChangeText={(txt) => setFormData({...formData, email: txt})}
                  editable={!loading}
                />

                <TextInput
                  className="bg-slate-800/50 p-4 rounded-2xl mb-4 text-white border border-slate-700/50"
                  placeholder="Password" placeholderTextColor="#64748b"
                  secureTextEntry
                  onChangeText={(txt) => setFormData({...formData, password: txt})}
                  editable={!loading}
                />

                <TextInput
                  className="bg-slate-800/50 p-4 rounded-2xl mb-8 text-white border border-slate-700/50"
                  placeholder="Confirm Password" placeholderTextColor="#64748b"
                  secureTextEntry
                  onChangeText={(txt) => setFormData({...formData, confirmPassword: txt})}
                  editable={!loading}
                />

                <TouchableOpacity 
                  onPress={handleRegister} 
                  disabled={loading}
                  className={`py-5 rounded-2xl items-center ${loading ? 'bg-emerald-800' : 'bg-emerald-500'}`}
                >
                  {loading ? (
                    <ActivityIndicator color="#020617" />
                  ) : (
                    <Text className="text-slate-950 font-black text-lg uppercase tracking-wider">Create Account</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity onPress={() => router.push("/(auth)/login")} className="mt-6" disabled={loading}>
                  <Text className="text-slate-400 text-center text-sm font-medium">
                    Already have an account? <Text className="text-emerald-400 font-bold underline">Login</Text>
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </TouchableWithoutFeedback>
  );
}