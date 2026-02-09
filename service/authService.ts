
import { 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    sendPasswordResetEmail, 
    GoogleAuthProvider,
    signInWithCredential,
    signOut,
    User
} from "firebase/auth";
import { auth, db } from "./firebaseConfig";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { GoogleSignin } from "@react-native-google-signin/google-signin";

//  Configure Native Google Sign-In
GoogleSignin.configure({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    offlineAccess: true,
});


// NATIVE GOOGLE LOGIN

export const loginWithGoogle = async () => {
    try {
        await GoogleSignin.hasPlayServices();
        const { data } = await GoogleSignin.signIn();
        const idToken = data?.idToken;

        if (!idToken) throw new Error("Google Sign-In failed: ID Token is missing.");

        const credential = GoogleAuthProvider.credential(idToken);
        const userCredential = await signInWithCredential(auth, credential);
        
        
        await syncUserToFirestore(userCredential.user);
        
        return userCredential;
    } catch (error: any) {
        console.error("Google Auth Error:", error);
        throw error;
    }
};


 //EMAIL & PASSWORD LOGIN
 
export const loginUser = async (email: string, password: string) => {
    return await signInWithEmailAndPassword(auth, email.trim(), password);
};

 //USER REGISTRATION (Email/Password)
 
export const registerUser = async (formData: any) => {
    const { email, password, firstName, lastName, country } = formData;
    
    const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
    const user = userCredential.user;

    const userRef = doc(db, "users", user.uid);
    await setDoc(userRef, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        country: country.trim() || "Unknown",
        email: email.trim().toLowerCase(),
        uid: user.uid,
        role: "User",
        createdAt: serverTimestamp(),
        photoURL: null,
    });

    return user;
};

 //FIRESTORE SYNC

export const syncUserToFirestore = async (user: User) => {
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
        
        const nameParts = user.displayName?.split(" ") || ["Explorer"];
        const firstName = nameParts[0];
        const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";

        await setDoc(userRef, {
            firstName: firstName,
            lastName: lastName,
            email: user.email,
            uid: user.uid,
            role: "User",
            createdAt: serverTimestamp(),
            photoURL: user.photoURL || null,
            provider: user.providerData[0]?.providerId || "google.com"
        });
    }
};
 
//PASSWORD RESET
 
export const resetPassword = async (email: string) => {
    if (!email) throw new Error("Email is required to reset password.");
    return await sendPasswordResetEmail(auth, email.trim());
};

 //LOGOUT

export const logoutUser = async () => {
    try {
        await GoogleSignin.signOut(); 
        await signOut(auth);
        await AsyncStorage.clear();
    } catch (error) {
        console.error("Logout Error:", error);
        throw error;
    }
};