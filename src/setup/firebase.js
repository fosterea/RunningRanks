// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, Timestamp } from "firebase/firestore";
import { getFunctions, httpsCallable } from "firebase/functions";
import {
  getAuth,
  GoogleAuthProvider,
  EmailAuthProvider,
  onAuthStateChanged,
  signOut,
  updateCurrentUser,
} from "firebase/auth";
import { auth as uiAuth} from 'firebaseui'
import { events } from "./consts";


// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCuQ-yy7LMsehauQprT2u8qX2K-Hupps98",
  authDomain: "runningranks.firebaseapp.com",
  projectId: "runningranks",
  storageBucket: "runningranks.appspot.com",
  messagingSenderId: "388685462350",
  appId: "1:388685462350:web:2713b35bb30205737f3c1f",
  measurementId: "G-SJPW6M1VDS"
};

// Initialize Firebase and Firestore
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Initialize Firebase Authentication and get a reference to the service
const appAuth = getAuth(app);

export { appAuth };


export const uiConfig = {
  callbacks: {
    signInSuccessWithAuthResult: function (authResult, redirectUrl) {
      // User successfully signed in.
      // Return type determines whether we continue the redirect automatically
      // or whether we leave that to developer to handle.
      return false;
    },
    uiShown: function () {

    }
  },
  // Will use popup for IDP Providers sign-in flow instead of the default, redirect.
  signInFlow: 'popup',
  signInSuccessUrl: '<url-to-redirect-to-on-success>',
  signInOptions: [
    // Leave the lines as is for the providers you want to offer your users.
    GoogleAuthProvider.PROVIDER_ID,
    EmailAuthProvider.PROVIDER_ID,
  ],
  // Terms of service url.
  tosUrl: '<your-tos-url>',
  // Privacy policy url.
  privacyPolicyUrl: '<your-privacy-policy-url>'
};
  
export const ui = new uiAuth.AuthUI(appAuth)


/**
 * Creates a user document with starter data.
 * @param {*} user 
 */
export function createUserData(user) {
  console.log("here")
  const user_ref = doc(db, 'users', user.uid)
  const event_submitions = {}
  for (let event of events) {
    event_submitions[event] = null // Timestamp.fromDate(new Date())
  }
  const data = {
    email: user.email,
    name: user.displayName,
    event_submitions: event_submitions,
  }
  setDoc(user_ref, data)
}

// Get functions
const functions = getFunctions(app);

const updateEventFunc = httpsCallable(functions, 'updateEvent')

/**
 * 
 * @param {*} event Event to update the rankings for
 */
function updateEvent(event) {
  updateEventFunc({event:event})
}

export { updateEvent }