import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined);
  const [role, setRole] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser ?? null);
      if (firebaseUser) {
        getDoc(doc(db, "usuarios", firebaseUser.uid)).then((snap) => {
          setRole(snap.exists() ? (snap.data().role ?? "user") : "user");
        });
      } else {
        setRole(null);
      }
    });
    return unsubscribe;
  }, []);

  function logout() {
    return signOut(auth);
  }

  return (
    <AuthContext.Provider value={{ user, role, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
