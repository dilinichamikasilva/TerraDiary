import { 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    sendPasswordResetEmail, 
    signOut,
    User
} from "firebase/auth";
import { auth, db } from "./firebaseConfig";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";


//email login
export const loginUser = async (email: string, password: string) => {
    return await signInWithEmailAndPassword(auth, email.trim(), password);
};

//user register
export const registerUser = async (formData: any) => {
    const { email, password, firstName, lastName, country } = formData;
    
    
    const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
    const user = userCredential.user;

    
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

// forgot pw
export const resetPassword = async (email: string) => {
    if (!email) throw new Error("Email is required to reset password.");
    return await sendPasswordResetEmail(auth, email.trim());
};

//logout
export const logoutUser = async () => {
    try {
        await signOut(auth);
        await AsyncStorage.clear();
    } catch (error) {
        console.error("Logout Error:", error);
        throw error;
    }
};