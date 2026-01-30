
import { Redirect } from "expo-router";
import { View, ActivityIndicator } from "react-native";
import { useAuth } from "../hooks/useAuth";

export default function Index() {
   const {user , loading} = useAuth()

    if(loading){
        return <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#1e40af" />
        </View>
    }

    if(user){
        return (<Redirect href="/home" />)
    }else{
        return (<Redirect href="/login" />)
    }
}
