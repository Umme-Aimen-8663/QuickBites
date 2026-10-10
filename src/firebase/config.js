import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics, isSupported } from "firebase/analytics";
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const firebaseConfig = {
  apiKey: 'AIzaSyBaoLcS1KDhEtk327ixnLINcZTd39ON7Gk',
  authDomain: 'labterminal-8bd9b.firebaseapp.com',
  projectId: 'labterminal-8bd9b',
  storageBucket: 'labterminal-8bd9b.appspot.com',
  messagingSenderId: '844222428833',
  appId: '1:844222428833:web:95ff69e2709e07607d62e0',
  measurementId: 'G-S34J7YDGJ4'
};

let app;
let auth;

if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
  if (Platform.OS === 'web') {
    auth = getAuth(app);
  } else {
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(ReactNativeAsyncStorage)
    });
  }
} else {
  app = getApp();
  if (Platform.OS === 'web') {
    auth = getAuth(app);
  } else {
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(ReactNativeAsyncStorage)
    });
  }
}

isSupported().then(supported => {
  if (supported) {
    getAnalytics(app);
  }
});

export { auth };
export const db = getFirestore(app);
export default app;
