import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, Dimensions, Image } from 'react-native';
import MapView, { Marker, Callout, PROVIDER_GOOGLE } from 'react-native-maps';
import { db, auth } from '../../firebaseConfig';
import { collection, query, onSnapshot, where } from 'firebase/firestore';
import { TravelPost } from '../../types';
import { mapStyle } from '../../constants/mapstyle'; 
import { Ionicons } from '@expo/vector-icons';

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

          return hasCoords ? (
            <Marker
              key={post.id}
              coordinate={{ 
                latitude: Number(post.latitude), 
                longitude: Number(post.longitude) 
              }}
              
              anchor={{ x: 0.5, y: 1 }}
            >
              
              <View className="items-center justify-center">
                <Ionicons 
                  name="location" 
                  size={36} 
                  color={post.isPublic ? '#10b981' : '#3b82f6'} 
                />
                <View className="w-1.5 h-1.5 bg-black/20 rounded-full mt-[-4]" />
              </View>

              <Callout tooltip>
                <View className="bg-slate-900 p-3 rounded-3xl border border-white/10 w-56 shadow-2xl">
                  {displayImage && (
                    <Image 
                      source={{ uri: displayImage }} 
                      style={styles.calloutImage}
                      resizeMode="cover"
                    />
                  )}
                  
                  <View className="px-1">
                    <Text className="text-white font-bold text-base mb-1" numberOfLines={1}>
                      {post.title || "My Memory"}
                    </Text>
                    
                    <Text className="text-slate-400 text-xs mb-2" numberOfLines={2}>
                      {post.description}
                    </Text>

                    <View className="flex-row items-center py-1 border-t border-white/5">
                      <Ionicons 
                        name={post.isPublic ? "globe-outline" : "lock-closed-outline"} 
                        size={12} 
                        color="#94a3b8" 
                      />
                      <Text className="text-slate-400 text-[10px] ml-1 uppercase font-bold tracking-widest">
                        {post.isPublic ? 'Public Entry' : 'Private Entry'}
                      </Text>
                    </View>
                  </View>
                </View>
              </Callout>
            </Marker>
          ) : null;
        })}
      </MapView>
      
      {/* Floating Header */}
      <View className="absolute top-16 left-6 right-6">
        <View className="bg-slate-900/90 p-5 rounded-[32px] border border-white/10 shadow-2xl backdrop-blur-md">
          <Text className="text-white font-black text-xl tracking-tight">My Travel Map</Text>
          <Text className="text-emerald-400/80 text-xs font-medium">
            Reliving {posts.length} of your personal journeys
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
    height: 120,
    borderRadius: 20,
    marginBottom: 10,
  }
});