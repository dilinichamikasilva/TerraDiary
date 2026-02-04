import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { DeviceMotion } from 'expo-sensors';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db, auth } from '../service/firebaseConfig';
import { calculateBearing, calculateDistance } from '../utils/geoMath';
import { ARMarker } from '../components/ARMarker';

const { width, height } = Dimensions.get('window');
const FIELD_OF_VIEW = 40; 

export default function ARFinderScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [heading, setHeading] = useState(0);
  const [userLoc, setUserLoc] = useState<Location.LocationObjectCoords | null>(null);
  const [nearbyPosts, setNearbyPosts] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const { status: camStatus } = await requestPermission();
      const { status: locStatus } = await Location.requestForegroundPermissionsAsync();
      
      if (camStatus !== 'granted' || locStatus !== 'granted') return;

      // Track Heading (Rotation)
      DeviceMotion.setUpdateInterval(40);
      const motionSub = DeviceMotion.addListener((data) => {
        if (data.rotation) {
          let h = data.rotation.alpha * (180 / Math.PI);
          setHeading((h + 360) % 360);
        }
      });

      // Get Location and Fetch Posts
      const loc = await Location.getCurrentPositionAsync({});
      setUserLoc(loc.coords);
      fetchNearbyPosts(loc.coords);

      return () => motionSub.remove();
    })();
  }, []);

  const fetchNearbyPosts = async (coords: any) => {
    const q = query(collection(db, "posts"), where("userId", "==", auth.currentUser?.uid));
    const snapshot = await getDocs(q);
    const posts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Filter posts within 50km for AR visibility
    const filtered = posts.filter((p: any) => 
      calculateDistance(coords.latitude, coords.longitude, p.latitude, p.longitude) < 50
    );
    setNearbyPosts(filtered);
  };

  if (!permission?.granted) return <View className="flex-1 bg-black" />;

  return (
    <View className="flex-1 bg-black">
      <CameraView style={{ flex: 1 }} facing="back">
        {userLoc && nearbyPosts.map((post) => {
          const postBearing = calculateBearing(
            userLoc.latitude, userLoc.longitude,
            Number(post.latitude), Number(post.longitude)
          );

          let diff = postBearing - heading;
          if (diff > 180) diff -= 360;
          if (diff < -180) diff += 360;

          // Render only if within Field of View
          if (Math.abs(diff) < FIELD_OF_VIEW / 2) {
            const xPos = (width / 2) + (diff * (width / FIELD_OF_VIEW));
            const dist = calculateDistance(userLoc.latitude, userLoc.longitude, post.latitude, post.longitude);

            return (
              <View 
                key={post.id} 
                className="absolute" 
                style={{ left: xPos - 64, top: height / 2.5 }}
              >
                <ARMarker 
                  title={post.title} 
                  image={post.imageUrls?.[0]} 
                  mood={post.mood} 
                  distance={dist}
                />
              </View>
            );
          }
          return null;
        })}

        {/* HUD Elements */}
        <View className="absolute top-16 left-6">
          <TouchableOpacity onPress={() => router.back()} className="bg-slate-900/80 p-3 rounded-full border border-white/10">
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
        </View>

        <View className="absolute bottom-12 self-center bg-slate-900/90 px-8 py-4 rounded-[32px] border border-emerald-500/30">
          <Text className="text-white font-black italic tracking-widest text-xs uppercase text-center">
            Virtual Memory Finder
          </Text>
          <Text className="text-emerald-400 text-[9px] text-center mt-1 uppercase font-bold">
            Pointing: {heading.toFixed(0)}° • {nearbyPosts.length} Memories nearby
          </Text>
        </View>
      </CameraView>
    </View>
  );
}