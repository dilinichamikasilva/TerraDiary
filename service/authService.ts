import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile, 
  signOut,
  User
} from "firebase/auth";
import { auth, db } from "./firebaseConfig";
import { doc, setDoc, getDoc } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Email Login
export const loginUser = async (email: string, password: string) => {
    return await signInWithEmailAndPassword(auth, email.trim(), password);
};


export const syncUserToFirestore = async (user: User) => {
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
        await setDoc(userRef, {
            name: user.displayName || "Explorer",
            email: user.email,
            role: "User",
            createdAt: new Date(),
            photoURL: user.photoURL || null
        });
    }
};

export const logoutUser = async () => {
    await signOut(auth);
    await AsyncStorage.clear();
};

