import { Ionicons } from '@expo/vector-icons';
import { collection, onSnapshot, query, where, orderBy } from 'firebase/firestore';
import React, { useEffect, useState, useMemo, useRef } from 'react';
import { Dimensions, Image, StyleSheet, Text, View, TouchableOpacity, Platform } from 'react-native';
import MapView, { Callout, Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useRouter } from 'expo-router'; 
import { mapStyle } from '../../constants/mapstyle';
import { auth, db } from '../../service/firebaseConfig';
import { TravelPost } from '../../types';

export default function MapScreen() {
  const router = useRouter();
  const mapRef = useRef<MapView>(null);
  const [posts, setPosts] = useState<TravelPost[]>([]);
  const currentUser = auth.currentUser;

  //  Firebase Data Sync 
  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, "posts"),
      where("userId", "==", currentUser.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const myItems = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      } as TravelPost));
      setPosts(myItems);
    }, (error) => {
      console.error("Firestore Error:", error);
    });

    return unsubscribe;
  }, [currentUser]);

  //  Combine posts by location 
  const groupedPosts = useMemo(() => {
    const groups: { [key: string]: TravelPost[] } = {};
    posts.forEach(post => {
      if (post.latitude && post.longitude) {
        const key = `${Number(post.latitude).toFixed(4)}_${Number(post.longitude).toFixed(4)}`;
        if (!groups[key]) groups[key] = [];
        groups[key].push(post);
      }
    });
    return Object.values(groups);
  }, [posts]);

  return (
    <View className="flex-1 bg-slate-950">
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        customMapStyle={mapStyle} 
        initialRegion={{
          latitude: 7.8731, 
          longitude: 80.7718,
          latitudeDelta: 5,
          longitudeDelta: 5,
        }}
      >
        {groupedPosts.map((locationGroup) => {
          const latestPost = locationGroup[0];
          const count = locationGroup.length;
          const displayImage = latestPost.imageUrls?.[0];

          return (
            <Marker
              key={latestPost.id}
              coordinate={{ 
                latitude: Number(latestPost.latitude), 
                longitude: Number(latestPost.longitude) 
              }}
              anchor={{ x: 0.5, y: 1 }}
            >
             
              <View className="items-center">
                <View className="bg-white p-1 rounded-2xl shadow-xl border-2 border-emerald-500">
                  {displayImage ? (
                    <Image source={{ uri: displayImage }} className="w-14 h-14 rounded-xl" />
                  ) : (
                    <View className="w-14 h-14 bg-slate-800 rounded-xl items-center justify-center">
                      <Ionicons name="image" size={20} color="white" />
                    </View>
                  )}
                  
                  {count > 1 && (
                    <View className="absolute -top-3 -left-3 bg-blue-600 w-6 h-6 rounded-full items-center justify-center border-2 border-white shadow-lg">
                      <Text className="text-white text-[10px] font-black">{count}</Text>
                    </View>
                  )}
                  
                  <View className="absolute -top-3 -right-3 bg-emerald-500 w-7 h-7 rounded-full items-center justify-center border-2 border-white shadow-lg">
                    <Text className="text-[12px]">{latestPost.mood || '📍'}</Text>
                  </View>
                </View>
                <View style={styles.triangle} />
              </View>

              {/*  HISTORY CALLOUT  */}
              <Callout tooltip>
                <View className="bg-slate-900 rounded-[32px] border border-white/10 w-72 shadow-2xl overflow-hidden p-4">
                  <Text className="text-white font-black text-lg mb-1" numberOfLines={1}>
                    {latestPost.locationName || "Travel History"}
                  </Text>
                  <Text className="text-emerald-500 text-[10px] font-black uppercase tracking-widest mb-4">
                    {count} {count === 1 ? 'Visit' : 'Visits'} Recorded
                  </Text>

                  <View>
                    {locationGroup.slice(0, 5).map((item, index) => (
                      <View key={item.id} className={`flex-row items-center py-2 ${index !== locationGroup.length - 1 ? 'border-b border-white/5' : ''}`}>
                        <Image source={{ uri: item.imageUrls?.[0] }} className="w-10 h-10 rounded-lg bg-slate-800" />
                        <View className="flex-1 ml-3">
                          <Text className="text-white font-bold text-xs" numberOfLines={1}>{item.title}</Text>
                          <Text className="text-slate-500 text-[9px] uppercase font-bold">
                            {item.createdAt?.toDate ? 
                              item.createdAt.toDate().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : 
                              'Just now'}
                          </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={12} color="#334155" />
                      </View>
                    ))}
                  </View>
                </View>
              </Callout>
            </Marker>
          );
        })}
      </MapView>
      
      {/*  TOP HEADER  */}
      <View className="absolute top-16 left-6 right-6">
        <View className="bg-slate-900/95 p-5 rounded-[32px] border border-white/10 shadow-2xl backdrop-blur-xl">
          <View className="flex-row justify-between items-center">
            <View>
              <Text className="text-white font-black text-xl italic tracking-tight">TERRA DIARY</Text>
              <Text className="text-emerald-400 text-[10px] font-bold uppercase tracking-widest">
                {posts.length} Check-ins • {groupedPosts.length} Locations
              </Text>
            </View>
            <View className="bg-emerald-500/20 p-3 rounded-2xl">
               <Ionicons name="map" size={20} color="#10b981" />
            </View>
          </View>
        </View>
      </View>

      {/*  RIGHT SIDE ACTIONS  */}
      <View className="absolute bottom-32 right-6 space-y-4">
        <TouchableOpacity 
          onPress={() => router.push('/ar-finder')}
          activeOpacity={0.8}
          className="bg-emerald-500 w-16 h-16 rounded-full items-center justify-center shadow-2xl border-4 border-slate-950"
        >
          <Ionicons name="scan-outline" size={28} color="white" />
          <View className="absolute -bottom-2 bg-slate-900 px-2 py-0.5 rounded-full border border-emerald-500">
            <Text className="text-[8px] text-white font-black tracking-widest">AR MODE</Text>
          </View>
        </TouchableOpacity>

        {/* RECENTER BUTTON */}
        <TouchableOpacity 
          onPress={() => mapRef.current?.animateToRegion({
            latitude: 7.8731, longitude: 80.7718, latitudeDelta: 5, longitudeDelta: 5
          })}
          className="bg-slate-900/90 w-12 h-12 rounded-2xl items-center justify-center border border-white/10 mt-4 ml-2"
        >
          <Ionicons name="locate" size={20} color="#10b981" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  triangle: {
    width: 0, height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 9,
    borderRightWidth: 9,
    borderBottomWidth: 12,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#10b981', 
    transform: [{ rotate: '180deg' }],
    marginTop: -1,
  },
});