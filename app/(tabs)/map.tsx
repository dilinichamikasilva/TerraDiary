import { Ionicons } from '@expo/vector-icons';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Dimensions, Image, StyleSheet, Text, View, Platform } from 'react-native';
import MapView, { Callout, Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { mapStyle } from '../../constants/mapstyle';
import { auth, db } from '../../service/firebaseConfig';
import { TravelPost } from '../../types';

export default function MapScreen() {
  const [posts, setPosts] = useState<TravelPost[]>([]);
  const currentUser = auth.currentUser;

  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, "posts"),
      where("userId", "==", currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const myItems = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      } as TravelPost));
      setPosts(myItems);
    });

    return unsubscribe;
  }, [currentUser]);

  return (
    <View className="flex-1 bg-slate-950">
      <MapView
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
        {posts.map((post) => {
          const hasCoords = post.latitude && post.longitude;
          const displayImage = post.imageUrls && post.imageUrls.length > 0 
            ? post.imageUrls[0] 
            : null;

          if (!hasCoords) return null;

          return (
            <Marker
              key={post.id}
              coordinate={{ 
                latitude: Number(post.latitude), 
                longitude: Number(post.longitude) 
              }}
              anchor={{ x: 0.5, y: 1 }}
            >
              {/*  CUSTOM PHOTO PIN  */}
              <View className="items-center">
                <View className="bg-white p-1 rounded-2xl shadow-xl border-2 border-emerald-500">
                  {displayImage ? (
                    <Image 
                      source={{ uri: displayImage }} 
                      className="w-12 h-12 rounded-xl"
                    />
                  ) : (
                    <View className="w-12 h-12 bg-slate-800 rounded-xl items-center justify-center">
                      <Ionicons name="image-outline" size={20} color="white" />
                    </View>
                  )}
                  {/* Title Badge over the photo */}
                  <View className="absolute -top-2 -right-2 bg-emerald-500 px-2 py-0.5 rounded-full">
                    <Text className="text-white text-[8px] font-black uppercase">
                       {post.mood || '📍'}
                    </Text>
                  </View>
                </View>
                {/* Pointer Triangle */}
                <View style={styles.triangle} />
              </View>

              
              <Callout tooltip>
                <View className="bg-slate-900 p-0 rounded-[30px] border border-white/10 w-64 shadow-2xl overflow-hidden">
                  {displayImage && (
                    <Image 
                      source={{ uri: displayImage }} 
                      style={styles.calloutImage}
                    />
                  )}
                  
                  <View className="p-4">
                    <Text className="text-white font-black text-lg mb-1">
                      {post.title || "Untitled Adventure"}
                    </Text>
                    
                    <View className="flex-row items-center mb-2">
                      <Ionicons name="location" size={12} color="#10b981" />
                      <Text className="text-emerald-500 text-[10px] font-bold ml-1 uppercase tracking-tighter" numberOfLines={1}>
                        {post.locationName || "Unknown Location"}
                      </Text>
                    </View>

                    <Text className="text-slate-400 text-xs leading-4 mb-3" numberOfLines={3}>
                      {post.description}
                    </Text>

                    <View className="flex-row items-center pt-3 border-t border-white/5">
                      <View className="bg-slate-800 px-3 py-1 rounded-full flex-row items-center">
                        <Ionicons name="time-outline" size={10} color="#94a3b8" />
                        <Text className="text-slate-400 text-[9px] ml-1 font-bold">
                          {post.createdAt?.toDate().toLocaleDateString() || 'Recently'}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              </Callout>
            </Marker>
          );
        })}
      </MapView>
      
     
      <View className="absolute top-16 left-6 right-6">
        <View className="bg-slate-900/90 p-5 rounded-[32px] border border-white/10 shadow-2xl backdrop-blur-md">
          <Text className="text-white font-black text-xl tracking-tight italic">EXPLORER MAP</Text>
          <Text className="text-emerald-400/80 text-xs font-medium uppercase tracking-widest">
            {posts.length} MEMORIES PINNED
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  calloutImage: {
    width: '100%',
    height: 150,
  },
  triangle: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderBottomWidth: 12,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#10b981', 
    transform: [{ rotate: '180deg' }],
    marginTop: -1,
  },
});