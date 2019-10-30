import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';
import 'firebase/analytics';

firebase.initializeApp({
  apiKey: process.env.VUE_APP_FIREBASE_API_KEY,
  authDomain: process.env.VUE_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VUE_APP_FIREBASE_PROJECT_ID,
  measurementId: process.env.VUE_APP_MEASUREMENT_ID
});

export const db = firebase.firestore();
export const firestore = firebase.firestore;
export const auth = firebase.auth();

// Export types that exists in Firestore
// export { TimeStamp, GeoPoint } = firebase.firestore;
