import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from '../firebase/config';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);

  // Load cart from AsyncStorage on startup or user change
  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const storedCart = await AsyncStorage.getItem(`cart_${user.uid}`);
        if (storedCart) {
          setCartItems(JSON.parse(storedCart));
        } else {
          setCartItems([]);
        }
      } else {
        setCartItems([]);
      }
    } catch (error) {
      console.log('Error loading cart:', error);
    }
  };

  const saveCart = async (items) => {
    try {
      const user = auth.currentUser;
      if (user) {
        await AsyncStorage.setItem(`cart_${user.uid}`, JSON.stringify(items));
      }
    } catch (error) {
      console.log('Error saving cart:', error);
    }
  };

  const addToCart = (item, qty = 1) => {
    const itemId = item.idMeal || item.id;
    const name = item.strMeal || item.name;
    const image = item.strMealThumb || item.image || 'https://via.placeholder.com/150';
    const priceNum = item.price || ((parseInt(itemId || 0) % 15) + 8);

    setCartItems(prevItems => {
      const existingItem = prevItems.find(i => i.id === itemId);
      let updated;
      if (existingItem) {
        updated = prevItems.map(i => 
          i.id === itemId ? { ...i, quantity: i.quantity + qty } : i
        );
      } else {
        updated = [...prevItems, {
          id: itemId,
          name: name,
          image: image,
          price: priceNum,
          quantity: qty,
          category: item.strCategory || item.category || 'Food'
        }];
      }
      saveCart(updated);
      return updated;
    });
  };

  const removeFromCart = (itemId) => {
    setCartItems(prevItems => {
      const updated = prevItems.filter(i => i.id !== itemId);
      saveCart(updated);
      return updated;
    });
  };

  const updateQuantity = (itemId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCartItems(prevItems => {
      const updated = prevItems.map(i => 
        i.id === itemId ? { ...i, quantity } : i
      );
      saveCart(updated);
      return updated;
    });
  };

  const clearCart = () => {
    setCartItems([]);
    saveCart([]);
  };

  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const totalAmount = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      cartCount,
      totalAmount,
      loadCart
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
