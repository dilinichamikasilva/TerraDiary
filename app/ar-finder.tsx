import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Dimensions, Platform } from 'react-native';
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
    let motionSub: any;
    let locationSub: any;

    (async () => {
      const { status: camStatus } = await requestPermission();
      const { status: locStatus } = await Location.requestForegroundPermissionsAsync();
      
      if (camStatus !== 'granted' || locStatus !== 'granted') return;

      // Track Device Heading (Compass Orientation)
      DeviceMotion.setUpdateInterval(40);
      motionSub = DeviceMotion.addListener((data) => {
        if (data.rotation) {
          // alpha is the rotation around the z-axis (compass heading)
          let h = data.rotation.alpha * (180 / Math.PI);
          setHeading((h + 360) % 360);
        }
      });

      // Real-time Location Tracking (Distance updates as you walk)
      locationSub = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          distanceInterval: 2, // Update every 2 meters
        },
        (location) => {
          setUserLoc(location.coords);
          if (nearbyPosts.length === 0) {
            fetchNearbyPosts(location.coords);
          }
        }
      );
    })();

    return () => {
      motionSub?.remove();
      locationSub?.remove();
    };
  }, []);

  const fetchNearbyPosts = async (coords: any) => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(collection(db, "posts"), where("userId", "==", user.uid));
    const snapshot = await getDocs(q);
    const posts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Filter posts within 50km
    const filtered = posts.filter((p: any) => 
      calculateDistance(coords.latitude, coords.longitude, p.latitude, p.longitude) < 50
    );
    setNearbyPosts(filtered);
  };

  if (!permission?.granted) return <View className="flex-1 bg-black" />;

  return (
    <View className="flex-1 bg-black">
      <CameraView style={{ flex: 1 }} facing="back">
        
        {/* AR LAYER: Floating Markers */}
        {userLoc && nearbyPosts.map((post) => {
          const postBearing = calculateBearing(
            userLoc.latitude, userLoc.longitude,
            Number(post.latitude), Number(post.longitude)
          );

          // Calculate the relative angle between device heading and post bearing
          let diff = postBearing - heading;
          if (diff > 180) diff -= 360;
          if (diff < -180) diff += 360;

          // Render only if marker is within the camera's visual cone
          if (Math.abs(diff) < FIELD_OF_VIEW / 2) {
            const xPos = (width / 2) + (diff * (width / FIELD_OF_VIEW));
            const dist = calculateDistance(userLoc.latitude, userLoc.longitude, post.latitude, post.longitude);

            return (
              <View 
                key={post.id} 
                className="absolute" 
                style={{ left: xPos - 64, top: height / 3 }}
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

        {/* UI Overlay: Back Button */}
        <View className="absolute top-16 left-6">
          <TouchableOpacity 
            onPress={() => router.back()} 
            className="bg-slate-900/80 p-4 rounded-full border border-white/20"
          >
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* COMPASS RADAR (Visual aid to find markers) */}
        <View className="absolute bottom-32 self-center items-center justify-center">
             <View className="w-16 h-16 rounded-full border border-white/20 bg-black/20 items-center justify-center">
                <View 
                    style={{ transform: [{ rotate: `${-heading}deg` }] }}
                    className="items-center justify-center"
                >
                    <Ionicons name="compass-outline" size={40} color="rgba(255,255,255,0.5)" />
                    {nearbyPosts.map(p => {
                        const b = calculateBearing(userLoc?.latitude || 0, userLoc?.longitude || 0, p.latitude, p.longitude);
                        return (
                            <View 
                                key={p.id}
                                className="absolute w-2 h-2 bg-emerald-500 rounded-full"
                                style={{ 
                                    transform: [
                                        { rotate: `${b}deg` }, 
                                        { translateY: -25 }
                                    ] 
                                }}
                            />
                        )
                    })}
                </View>
             </View>
        </View>

        {/* HUD FOOTER */}
        <View className="absolute bottom-12 self-center bg-slate-950/90 px-8 py-5 rounded-[40px] border border-emerald-500/40 w-[85%]">
          <View className="flex-row items-center justify-between">
            <View>
                <Text className="text-white font-black italic tracking-widest text-[10px] uppercase">
                    AR MEMORY SCANNER
                </Text>
                <Text className="text-emerald-400 text-[10px] font-bold mt-0.5">
                    {nearbyPosts.length} PERSPECTIVES FOUND
                </Text>
            </View>
            <View className="items-end">
                 <Text className="text-slate-500 text-[9px] font-bold">HEADING</Text>
                 <Text className="text-white font-black text-xs">{heading.toFixed(0)}°</Text>
            </View>
          </View>
        </View>

      </CameraView>
    </View>
  );
}