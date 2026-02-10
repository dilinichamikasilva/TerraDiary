// import React, { useState } from 'react';
// import { 
//   View, 
//   Text, 
//   TextInput, 
//   TouchableOpacity, 
//   TouchableWithoutFeedback, 
//   Keyboard,
//   ActivityIndicator,
//   KeyboardAvoidingView,
//   Platform,
//   ScrollView
// } from 'react-native';
// import { useRouter } from 'expo-router';
// import Toast from 'react-native-toast-message'; 
// import { AntDesign, FontAwesome5, Ionicons } from '@expo/vector-icons'; 

// // Auth Service Imports
// import { 
//   loginUser, 
//   loginWithGoogle, 
//   resetPassword 
// } from '../../service/authService';


// import * as Facebook from 'expo-auth-session/providers/facebook'; 
// import { FacebookAuthProvider, signInWithCredential } from 'firebase/auth';
// import { auth } from '../../service/firebaseConfig';

// export default function LoginScreen() {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [loading, setLoading] = useState(false); 
//   const [showPassword, setShowPassword] = useState(false); 
//   const router = useRouter();

//   // Facebook Provider 
//   const [fbRequest, fbResponse, fbPromptAsync] = Facebook.useAuthRequest({
//     clientId: process.env.EXPO_PUBLIC_FACEBOOK_APP_ID,
//   });

//   // Handle Firebase Errors 
//   const handleAuthError = (error: any) => {
//     let message = "An unexpected error occurred.";
//     switch (error.code) {
//       case 'auth/invalid-credential':
//       case 'auth/user-not-found':
//       case 'auth/wrong-password':
//         message = "Invalid email or password.";
//         break;
//       case 'auth/too-many-requests':
//         message = "Too many attempts. Try again later.";
//         break;
//       default:
//         message = error.message || message;
//     }
//     Toast.show({ type: 'error', text1: 'Auth Error', text2: message });
//   };

//   // NATIVE GOOGLE LOGIN HANDLER 
//   const handleGoogleLogin = async () => {
//     setLoading(true);
//     try {
//       const result = await loginWithGoogle();
//       Toast.show({ 
//         type: 'success', 
//         text1: `Welcome, ${result.user.displayName || 'Explorer'}! 🎉` 
//       });
//       router.replace("/(tabs)/home");
//     } catch (error: any) {
      
//       if (error.code !== '-3') { 
//         handleAuthError(error);
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   // EMAIL LOGIN HANDLER
//   const handleEmailLogin = async () => {
//     if (!email.trim() || !password.trim()) {
//       Toast.show({ type: 'info', text1: 'Missing Fields', text2: 'Please enter credentials' });
//       return;
//     }
//     setLoading(true);
//     try {
//       await loginUser(email.trim(), password.trim());
//       Toast.show({ type: 'success', text1: 'Login Successful! 🎉' });
//       router.replace("/(tabs)/home");
//     } catch (error: any) {
//       handleAuthError(error);
//     } finally {
//       setLoading(false); 
//     }
//   };

//   // FORGOT PASSWORD HANDLER
//   const handleForgotPassword = async () => {
//     if (!email.trim()) {
//       Toast.show({ type: 'info', text1: 'Email Required', text2: 'Enter your email first' });
//       return;
//     }
//     setLoading(true);
//     try {
//       await resetPassword(email);
//       Toast.show({ type: 'success', text1: 'Reset Email Sent', text2: 'Check your spam folder!' });
//     } catch (error: any) {
//       handleAuthError(error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
//       <View className="flex-1 bg-slate-950">
//         <View className="absolute top-[-50] left-[-50] w-72 h-72 bg-emerald-500/10 rounded-full blur-[80px]" />
        
//         <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
//           <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }} keyboardShouldPersistTaps="handled">
//             <View className="px-6 items-center">
              
//               <View className="items-center mb-10">
//                 <View className="bg-emerald-500/10 p-4 rounded-3xl border border-emerald-500/20 mb-4">
//                   <Ionicons name="log-in-outline" size={48} color="#10b981" />
//                 </View>
//                 <Text className="text-white text-4xl font-black tracking-tight">Welcome Back</Text>
//               </View>

//               <View className="w-full bg-slate-900/60 p-6 rounded-[40px] border border-slate-800/50 shadow-2xl backdrop-blur-xl">
//                 <TextInput
//                   className="bg-slate-800/50 p-4 rounded-2xl mb-4 text-white border border-slate-700/50"
//                   placeholder="Email Address"
//                   placeholderTextColor="#64748b"
//                   keyboardType="email-address"
//                   autoCapitalize="none"
//                   value={email}
//                   onChangeText={setEmail}
//                 />
                
//                 <View className="relative mb-2">
//                   <TextInput
//                     className="bg-slate-800/50 p-4 rounded-2xl text-white border border-slate-700/50 pr-12"
//                     placeholder="Password"
//                     placeholderTextColor="#64748b"
//                     secureTextEntry={!showPassword}
//                     value={password}
//                     onChangeText={setPassword}
//                   />
//                   <TouchableOpacity className="absolute right-4 top-4" onPress={() => setShowPassword(!showPassword)}>
//                     <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={24} color="#64748b" />
//                   </TouchableOpacity>
//                 </View>

//                 <TouchableOpacity onPress={handleForgotPassword} className="mb-6 self-end">
//                   <Text className="text-emerald-400 font-medium text-sm">Forgot Password?</Text>
//                 </TouchableOpacity>

//                 <TouchableOpacity 
//                   onPress={handleEmailLogin} 
//                   disabled={loading}
//                   className={`p-5 rounded-2xl items-center ${loading ? 'bg-emerald-800' : 'bg-emerald-500'}`}
//                 >
//                   {loading ? <ActivityIndicator color="#020617" /> : <Text className="text-slate-950 font-black text-lg uppercase">Login</Text>}
//                 </TouchableOpacity>

//                 <View className="flex-row items-center my-8">
//                   <View className="flex-1 h-[1px] bg-slate-800" />
//                   <Text className="text-slate-500 mx-4 text-xs font-bold uppercase">OR</Text>
//                   <View className="flex-1 h-[1px] bg-slate-800" />
//                 </View>

//                 <View className="flex-row justify-between mb-2">
//                   {/* GOOGLE BUTTON */}
//                   <TouchableOpacity 
//                     onPress={handleGoogleLogin}
//                     disabled={loading}
//                     className="bg-slate-800/50 p-4 rounded-2xl w-[48%] items-center border border-slate-700/50"
//                   >
//                     <AntDesign name="google" size={24} color="#ea4335" />
//                   </TouchableOpacity>

//                   {/* FACEBOOK BUTTON */}
//                   <TouchableOpacity 
//                     onPress={() => fbPromptAsync()}
//                     disabled={!fbRequest || loading}
//                     className="bg-slate-800/50 p-4 rounded-2xl w-[48%] items-center border border-slate-700/50"
//                   >
//                     <FontAwesome5 name="facebook" size={24} color="#1877f2" />
//                   </TouchableOpacity>
//                 </View>

//                 <TouchableOpacity onPress={() => router.push("/(auth)/register")} className="mt-6">
//                   <Text className="text-slate-400 text-center font-medium">
//                     New traveler? <Text className="text-emerald-400 font-bold underline">Register</Text>
//                   </Text>
//                 </TouchableOpacity>
//               </View>
//             </View>
//           </ScrollView>
//         </KeyboardAvoidingView>
//       </View>
//     </TouchableWithoutFeedback>
//   );
// }

import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  TouchableWithoutFeedback, 
  Keyboard,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { useRouter } from 'expo-router';
import Toast from 'react-native-toast-message'; 
import { AntDesign, Ionicons } from '@expo/vector-icons'; 

// Auth Service Imports
import { 
  loginUser, 
  loginWithGoogle, 
  resetPassword 
} from '../../service/authService';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false); 
  const [showPassword, setShowPassword] = useState(false); 
  const router = useRouter();

  // Handle Firebase Errors 
  const handleAuthError = (error: any) => {
    let message = "An unexpected error occurred.";
    switch (error.code) {
      case 'auth/invalid-credential':
      case 'auth/user-not-found':
      case 'auth/wrong-password':
        message = "Invalid email or password.";
        break;
      case 'auth/too-many-requests':
        message = "Too many attempts. Try again later.";
        break;
      default:
        message = error.message || message;
    }
    Toast.show({ type: 'error', text1: 'Auth Error', text2: message });
  };

  // NATIVE GOOGLE LOGIN HANDLER 
  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const result = await loginWithGoogle();
      Toast.show({ 
        type: 'success', 
        text1: `Welcome, ${result.user.displayName || 'Explorer'}! 🎉` 
      });
      router.replace("/(tabs)/home");
    } catch (error: any) {
      // Ignore user cancellation errors (usually code -3)
      if (error.code !== '-3' && error.code !== '7') { 
        handleAuthError(error);
      }
    } finally {
      setLoading(false);
    }
  };

  // EMAIL LOGIN HANDLER
  const handleEmailLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Toast.show({ type: 'info', text1: 'Missing Fields', text2: 'Please enter credentials' });
      return;
    }
    setLoading(true);
    try {
      await loginUser(email.trim(), password.trim());
      Toast.show({ type: 'success', text1: 'Login Successful! 🎉' });
      router.replace("/(tabs)/home");
    } catch (error: any) {
      handleAuthError(error);
    } finally {
      setLoading(false); 
    }
  };

  // FORGOT PASSWORD HANDLER
  const handleForgotPassword = async () => {
    if (!email.trim()) {
      Toast.show({ type: 'info', text1: 'Email Required', text2: 'Enter your email first' });
      return;
    }
    setLoading(true);
    try {
      await resetPassword(email);
      Toast.show({ type: 'success', text1: 'Reset Email Sent', text2: 'Check your spam folder!' });
    } catch (error: any) {
      handleAuthError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View className="flex-1 bg-slate-950">
        {/* Decorative Background Blob */}
        <View className="absolute top-[-50] left-[-50] w-72 h-72 bg-emerald-500/10 rounded-full blur-[80px]" />
        
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
          <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }} keyboardShouldPersistTaps="handled">
            <View className="px-6 items-center">
              
              {/* Header */}
              <View className="items-center mb-10">
                <View className="bg-emerald-500/10 p-4 rounded-3xl border border-emerald-500/20 mb-4">
                  <Ionicons name="log-in-outline" size={48} color="#10b981" />
                </View>
                <Text className="text-white text-4xl font-black tracking-tight">Welcome Back</Text>
              </View>

              {/* Form Card */}
              <View className="w-full bg-slate-900/60 p-6 rounded-[40px] border border-slate-800/50 shadow-2xl backdrop-blur-xl">
                <TextInput
                  className="bg-slate-800/50 p-4 rounded-2xl mb-4 text-white border border-slate-700/50"
                  placeholder="Email Address"
                  placeholderTextColor="#64748b"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
                
                <View className="relative mb-2">
                  <TextInput
                    className="bg-slate-800/50 p-4 rounded-2xl text-white border border-slate-700/50 pr-12"
                    placeholder="Password"
                    placeholderTextColor="#64748b"
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={setPassword}
                  />
                  <TouchableOpacity className="absolute right-4 top-4" onPress={() => setShowPassword(!showPassword)}>
                    <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={24} color="#64748b" />
                  </TouchableOpacity>
                </View>

                <TouchableOpacity onPress={handleForgotPassword} className="mb-6 self-end">
                  <Text className="text-emerald-400 font-medium text-sm">Forgot Password?</Text>
                </TouchableOpacity>

                {/* Login Button */}
                <TouchableOpacity 
                  onPress={handleEmailLogin} 
                  disabled={loading}
                  className={`p-5 rounded-2xl items-center ${loading ? 'bg-emerald-800' : 'bg-emerald-500'}`}
                >
                  {loading ? <ActivityIndicator color="#020617" /> : <Text className="text-slate-950 font-black text-lg uppercase">Login</Text>}
                </TouchableOpacity>

                <View className="flex-row items-center my-8">
                  <View className="flex-1 h-[1px] bg-slate-800" />
                  <Text className="text-slate-500 mx-4 text-xs font-bold uppercase">OR</Text>
                  <View className="flex-1 h-[1px] bg-slate-800" />
                </View>

                {/* Centered Google Button */}
                <TouchableOpacity 
                  onPress={handleGoogleLogin}
                  disabled={loading}
                  className="bg-slate-800/50 p-4 rounded-2xl w-full items-center border border-slate-700/50 flex-row justify-center space-x-3"
                >
                  <AntDesign name="google" size={24} color="#ea4335" />
                  <Text className="text-white font-bold ml-2">Continue with Google</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => router.push("/(auth)/register")} className="mt-6">
                  <Text className="text-slate-400 text-center font-medium">
                    New traveler? <Text className="text-emerald-400 font-bold underline">Register</Text>
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