import React, { createContext, useState, useContext, useEffect } from 'react';
import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  deleteDoc,
  query,
  where
} from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth, db } from '../firebase/config';

const FavoritesContext = createContext();

export function FavoritesProvider({ children }) {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribe = () => {};

    const setupFavoritesListener = async (user) => {
      if (!user) {
        setFavorites([]);
        setLoading(false);
        return;
      }

      // Load from cache first
      try {
        const cached = await AsyncStorage.getItem(`favorites_${user.uid}`);
        if (cached) {
          setFavorites(JSON.parse(cached));
        }
      } catch (err) {
        console.log('Error reading cached favorites:', err);
      }

      // Firestore listener
      const q = query(collection(db, "favorites"), where("userId", "==", user.uid));
      
      unsubscribe = onSnapshot(q, async (querySnapshot) => {
        const favList = querySnapshot.docs.map(doc => doc.data());
        setFavorites(favList);
        setLoading(false);

        // Cache to AsyncStorage
        try {
          await AsyncStorage.setItem(`favorites_${user.uid}`, JSON.stringify(favList));
        } catch (err) {
          console.log('Error caching favorites:', err);
        }
      }, (error) => {
        console.log('Firestore favorites listener error:', error);
        setLoading(false);
      });
    };

    const authUnsubscribe = auth.onAuthStateChanged((user) => {
      unsubscribe(); // Unsubscribe from old listener
      if (user) {
        setupFavoritesListener(user);
      } else {
        setFavorites([]);
        setLoading(false);
      }
    });

    return () => {
      unsubscribe();
      authUnsubscribe();
    };
  }, []);

  const toggleFavorite = async (item) => {
    const user = auth.currentUser;
    if (!user) return false;

    const itemId = item.idMeal || item.id;
    const isFav = favorites.some(fav => (fav.idMeal || fav.id) === itemId);
    const itemRef = doc(db, `favorites`, `${user.uid}_${itemId}`);

    try {
      if (isFav) {
        await deleteDoc(itemRef);
      } else {
        const payload = {
          userId: user.uid,
          idMeal: itemId,
          strMeal: item.strMeal || item.name,
          strMealThumb: item.strMealThumb || item.image || 'https://via.placeholder.com/150',
          strCategory: item.strCategory || item.category || 'Food',
          strArea: item.strArea || '',
          strInstructions: item.strInstructions || item.instructions || ''
        };
        await setDoc(itemRef, payload);
      }
      return true;
    } catch (error) {
      console.log('Error toggling favorite in Firestore:', error);
      return false;
    }
  };

  const isFavorite = (itemId) => {
    return favorites.some(fav => (fav.idMeal || fav.id) === itemId);
  };

  return (
    <FavoritesContext.Provider value={{ favorites, loading, toggleFavorite, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export const useFavorites = () => useContext(FavoritesContext);
