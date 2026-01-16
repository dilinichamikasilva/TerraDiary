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
import { auth, db } from '../../firebaseConfig';
import { createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';
import "../../global.css";

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

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleRegister = async () => {
    const { firstName, lastName, country, email, password, confirmPassword } = formData;

    // 1. Validation: Empty fields
    if (!firstName || !lastName || !country || !email || !password || !confirmPassword) {
      Toast.show({ type: 'error', text1: 'Missing Fields', text2: 'Please fill in all fields ✍️' });
      return;
    }

    // 2. Validation: Email format
    if (!validateEmail(email.trim())) {
      Toast.show({ type: 'error', text1: 'Invalid Email', text2: 'Please enter a valid email address 📧' });
      return;
    }

    // 3. Validation: Password Match
    if (password !== confirmPassword) {
      Toast.show({ type: 'error', text1: 'Password Mismatch', text2: 'Passwords do not match ❌' });
      return;
    }

    // 4. Validation: Password Length
    if (password.length < 6) {
      Toast.show({ type: 'error', text1: 'Weak Password', text2: 'Password must be at least 6 characters 🔒' });
      return;
    }

    setLoading(true);

    try {
      // 5. Create User in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const user = userCredential.user;

      // 6. Store Profile Data in Firestore
      await setDoc(doc(db, "users", user.uid), {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        country: country.trim(),
        email: email.trim().toLowerCase(),
        uid: user.uid,
        createdAt: new Date().toISOString(),
      });

      // 7. SIGN OUT IMMEDIATELY
      // Firebase signs users in automatically after registration. 
      // We sign them out so they are forced to see the Login screen.
      await signOut(auth);

      Toast.show({
        type: 'success',
        text1: 'Welcome!',
        text2: 'Account created! Please login to continue. 🎉'
      });

      // 8. Redirect to Login
      router.replace("/(auth)/login");

    } catch (error: any) {
      let errorMessage = error.message;
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = "This email is already in use.";
      }
      
      Toast.show({ type: 'error', text1: 'Registration Error', text2: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        className="flex-1 bg-slate-950"
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}>
          
          <View className="mb-8">
            <Text className="text-white text-4xl font-bold tracking-tight">Create Account</Text>
            <Text className="text-slate-400 mt-2 text-lg">Join the TerraDiary community.</Text>
          </View>

          <View className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-2xl">
            
            <View className="flex-row justify-between mb-4">
              <TextInput
                className="bg-slate-800 p-4 rounded-xl text-white border border-slate-700 w-[48%] focus:border-emerald-500"
                placeholder="First Name"
                placeholderTextColor="#64748b"
                onChangeText={(txt) => setFormData({...formData, firstName: txt})}
                editable={!loading}
              />
              <TextInput
                className="bg-slate-800 p-4 rounded-xl text-white border border-slate-700 w-[48%] focus:border-emerald-500"
                placeholder="Last Name"
                placeholderTextColor="#64748b"
                onChangeText={(txt) => setFormData({...formData, lastName: txt})}
                editable={!loading}
              />
            </View>

            <TextInput
              className="bg-slate-800 p-4 rounded-xl mb-4 text-white border border-slate-700 focus:border-emerald-500"
              placeholder="Country"
              placeholderTextColor="#64748b"
              onChangeText={(txt) => setFormData({...formData, country: txt})}
              editable={!loading}
            />

            <TextInput
              className="bg-slate-800 p-4 rounded-xl mb-4 text-white border border-slate-700 focus:border-emerald-500"
              placeholder="Email"
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor="#64748b"
              onChangeText={(txt) => setFormData({...formData, email: txt})}
              editable={!loading}
            />

            <TextInput
              className="bg-slate-800 p-4 rounded-xl mb-4 text-white border border-slate-700 focus:border-emerald-500"
              placeholder="Password"
              secureTextEntry
              placeholderTextColor="#64748b"
              onChangeText={(txt) => setFormData({...formData, password: txt})}
              editable={!loading}
            />

            <TextInput
              className="bg-slate-800 p-4 rounded-xl mb-8 text-white border border-slate-700 focus:border-emerald-500"
              placeholder="Confirm Password"
              secureTextEntry
              placeholderTextColor="#64748b"
              onChangeText={(txt) => setFormData({...formData, confirmPassword: txt})}
              editable={!loading}
            />

            <TouchableOpacity 
              onPress={handleRegister} 
              disabled={loading}
              className={`p-4 rounded-xl shadow-lg ${loading ? 'bg-emerald-800' : 'bg-emerald-500'}`}
            >
              {loading ? (
                <ActivityIndicator color="#020617" />
              ) : (
                <Text className="text-slate-950 text-center font-bold text-lg">Sign Up</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => router.push("/(auth)/login")} 
              className="mt-6"
              disabled={loading}
            >
              <Text className="text-slate-400 text-center font-medium">
                Already have an account? <Text className="text-emerald-500 font-bold underline">Login</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}