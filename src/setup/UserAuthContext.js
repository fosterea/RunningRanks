import { createContext, useContext, useEffect, useState, useRef } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  sendEmailVerification,
  setPersistence,
  inMemoryPersistence,
  sendPasswordResetEmail,
} from "firebase/auth";
import { appAuth, db } from "./firebase";
import { onSnapshot, doc } from "firebase/firestore";
import { createUserData } from "./firebase";

const userAuthContext = createContext();


export function UserAuthContextProvider({ children }) {
  const [user, setUser] = useState({loading: true});

  // Store user document data
  const [userDoc, setUserDoc] = useState({});
  const [userDocRef, setUserDocRef] = useState(null);

  function logIn(email, password) {
    setPersistence(appAuth, inMemoryPersistence)
      .then(() => {
        // Existing and future Auth states are now persisted in the current
        // session only. Closing the window would clear any existing state even
        // if a user forgets to sign out.
        // ...
        // New sign-in will be persisted with session persistence.
        return signInWithEmailAndPassword(appAuth, email, password);
      })
      .catch((error) => {
        // Handle Errors here.
        const errorCode = error.code;
        const errorMessage = error.message;
      });
    return signInWithEmailAndPassword(appAuth, email, password);
  }

  function signUp(email, password) {
    return createUserWithEmailAndPassword(appAuth, email, password);
  }
  function logOut() {
    return signOut(appAuth);
  }

  function forgotPassword(email) {
    return sendPasswordResetEmail(appAuth, email, {
      url: "http://localhost:3000/login",
    });
  }
  function verifyEmail() {
    console.log(`${window.location.origin}/landing-page/dashboard`)
    return sendEmailVerification(appAuth.currentUser, {
      url: `${window.location.origin}/landing-page/dashboard`
    })
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(appAuth, (currentuser) => {
      console.log("Auth", currentuser);
      setUser(currentuser);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (user == null || !("uid" in user)) {
      setUserDoc({});
      setUserDocRef(null);
      return;
    }

    const unsub = onSnapshot(doc(db, "users", user.uid), (doc) => {
        setUserDoc(doc.data()|| {});
        setUserDocRef(doc.ref);
        console.log("Global user data");
        console.log(doc.data());

        // Create user data if no doc exists
        if (!doc.exists()) {
          createUserData(user)
        }
    });
    return unsub;
  }, [user]);

  return (
    <userAuthContext.Provider
      value={{
        user,
        logIn,
        signUp,
        logOut,
        forgotPassword,
        userDoc,
        userDocRef,
        verifyEmail,
      }}
    >
      {children}
    </userAuthContext.Provider>
  );
}

export function useUserAuth() {
  return useContext(userAuthContext);
}

export default userAuthContext
