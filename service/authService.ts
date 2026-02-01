import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  User
} from "firebase/auth";
import { auth, db } from "./firebaseConfig";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Email Login
export const loginUser = async (email: string, password: string) => {
    return await signInWithEmailAndPassword(auth, email.trim(), password);
};


export const registerUser = async (formData: any) => {
    const { email, password, firstName, lastName, country } = formData;
    
    // Create the Auth User
    const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
    const user = userCredential.user;

    // Save to Firestore 
    const userRef = doc(db, "users", user.uid);
    await setDoc(userRef, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        country: country.trim(),
        email: email.trim().toLowerCase(),
        uid: user.uid,
        role: "User",
        createdAt: serverTimestamp(), 
    });

    return user;
};

export const syncUserToFirestore = async (user: User) => {
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
        await setDoc(userRef, {
            name: user.displayName || "Explorer",
            email: user.email,
            role: "User",
            createdAt: serverTimestamp(),
            photoURL: user.photoURL || null
        });
    }
};

export const logoutUser = async () => {
    await signOut(auth);
    await AsyncStorage.clear();
};
