import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, Dimensions } from 'react-native';
import MapView, { Marker, Callout, PROVIDER_GOOGLE } from 'react-native-maps';
import { db, auth } from '../../firebaseConfig';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { TravelPost } from '../../types';
import { mapStyle } from '../../constants/mapstyle'; 

export default function MapScreen() {
  const [posts, setPosts] = useState<TravelPost[]>([]);

  useEffect(() => {

    const q = query(collection(db, "posts"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const mapItems = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      } as TravelPost));
      setPosts(mapItems);
    });

    return unsubscribe;
  }, []);

  return (
    <View className="flex-1 bg-slate-950">
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        customMapStyle={mapStyle} 
        initialRegion={{
          latitude: 20,
          longitude: 0,
          latitudeDelta: 100,
          longitudeDelta: 100,
        }}
      >
        {posts.map((post) => (
          // Only render if coordinates exist
          post.latitude && post.longitude && (
            <Marker
              key={post.id}
              coordinate={{ latitude: post.latitude, longitude: post.longitude }}
              pinColor="#10b981"
            >
              <Callout tooltip>
                <View className="bg-slate-900 p-4 rounded-2xl border border-emerald-500/50 w-40">
                  <Text className="text-white font-bold">{post.title}</Text>
                  <Text className="text-slate-400 text-xs mt-1">{post.locationName}</Text>
                </View>
              </Callout>
            </Marker>
          )
        ))}
      </MapView>
      
      {/* Floating Header */}
      <View className="absolute top-16 left-6 right-6">
        <View className="bg-slate-900/80 p-4 rounded-3xl border border-white/10 backdrop-blur-md">
          <Text className="text-white text-center font-bold">World Exploration</Text>
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
});