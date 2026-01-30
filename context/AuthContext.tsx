import { onAuthStateChanged, User } from "firebase/auth"
import { useLoader } from "@/hooks/useLoader"
import { auth } from "@/service/firebaseConfig"
import { createContext, ReactNode, useEffect, useState } from "react"


interface AuthContextType {
    user : User | null,
    loading : boolean
}

export const AuthContext = createContext<AuthContextType>({
    user:null,
    loading : false
})

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { showLoader, hideLoader, isLoading } = useLoader();
  const [user, setUser] = useState<User | null>(null);
  const [isInitialAuthCheck, setIsInitialAuthCheck] = useState(true);

  useEffect(() => {
    showLoader(); 
    const unsubscribe = onAuthStateChanged(auth, (usr) => {
      setUser(usr);
      setIsInitialAuthCheck(false);
      hideLoader();
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading: isInitialAuthCheck }}>
      {children}
    </AuthContext.Provider>
  );
};
