import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  Image, 
  TouchableOpacity, 
  ScrollView, 
  StatusBar,
  SafeAreaView
} from 'react-native';
import { customAlert } from '../utils/alert';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { signOut } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth, db } from '../firebase/config';
import { collection, doc, setDoc } from 'firebase/firestore';
import { COLORS, SHADOWS } from '../constants/theme';
import { useCart } from '../context/CartContext';
import { useFavorites } from '../context/FavoritesContext';
import FoodCard from '../components/FoodCard';
import LoadingIndicator from '../components/LoadingIndicator';

// Fetch real category listings supported by TheMealDB API
const CATEGORIES = [
  { id: '1', name: 'Chicken', icon: 'fast-food-outline' },
  { id: '2', name: 'Beef', icon: 'restaurant-outline' },
  { id: '3', name: 'Dessert', icon: 'ice-cream-outline' },
  { id: '4', name: 'Pasta', icon: 'nutrition-outline' },
  { id: '5', name: 'Seafood', icon: 'fish-outline' },
];

export default function DashboardScreen({ navigation }) {
  const { cartCount } = useCart();
  const { toggleFavorite, isFavorite } = useFavorites();
  const [popularMeals, setPopularMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState('Chicken');
  const [photoUri, setPhotoUri] = useState(null);

  const user = auth.currentUser;
  const userName = user?.displayName || user?.email?.split('@')[0] || 'Foodie';

  // Load category meals on active category change
  useEffect(() => {
    fetchMealsByCategory(activeCategory);
  }, [activeCategory]);

  // Load profile photo on screen focus
  useFocusEffect(
    useCallback(() => {
      loadProfilePhoto();
    }, [])
  );

  const fetchMealsByCategory = async (categoryName) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${categoryName}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.meals && Array.isArray(data.meals)) {
        const mealsToStore = data.meals.slice(0, 6);
        setPopularMeals(mealsToStore);
        setError(null);

        // Store meals in Firestore
        try {
          const mealsCollectionRef = collection(db, 'meals');
          for (const meal of mealsToStore) {
            await setDoc(doc(mealsCollectionRef, meal.idMeal), {
              ...meal,
              category: categoryName,
            });
          }
        } catch (firestoreError) {
          console.error('Error writing to Firestore:', firestoreError);
          // Optionally, you can show an alert to the user
          // customAlert('Database Error', 'Could not save meal data.');
        }
      } else {
        setPopularMeals([]);
        setError('No meals found for this category');
      }
    } catch (error) {
      console.error('Error fetching meals by category:', error);
      setError('Failed to load meals. Please try again.');
      setPopularMeals([]);
    } finally {
      setLoading(false);
    }
  };

  const loadProfilePhoto = async () => {
    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        const savedPhoto = await AsyncStorage.getItem(`user_photo_${currentUser.uid}`);
        if (savedPhoto) {
          setPhotoUri(savedPhoto);
        } else {
          setPhotoUri(currentUser.photoURL);
        }
      }
    } catch (e) {
      console.log('Error loading dashboard profile photo:', e);
    }
  };

  const handleFavoriteToggle = async (item) => {
    const success = await toggleFavorite(item);
    if (success) {
      const isFav = isFavorite(item.idMeal);
      const action = isFav ? 'Removed from' : 'Added to';
      customAlert('Favorites Updated', `"${item.strMeal}" has been ${action.toLowerCase()} favorites.`);
    }
  };

  const handleLogout = () => {
    customAlert(
      'Logout',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut(auth);
              customAlert('Success', 'Logged out successfully!');
            } catch (error) {
              customAlert('Error', 'Failed to log out.');
            }
          }
        }
      ]
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity 
        activeOpacity={0.8}
        onPress={() => navigation.navigate('Profile')}
        style={styles.userProfile}
      >
        <View style={styles.avatar}>
          {photoUri ? (
            <Image source={{ uri: photoUri }} style={styles.avatarImage} />
          ) : (
            <Text style={styles.avatarText}>{userName.charAt(0).toUpperCase()}</Text>
          )}
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.welcomeText}>Hello, Welcome 👋</Text>
          <Text style={styles.userNameText}>{userName}</Text>
        </View>
      </TouchableOpacity>
      
      <View style={styles.rightActions}>
        <TouchableOpacity 
          onPress={() => navigation.navigate('Cart')} 
          style={styles.cartButton}
        >
          <Ionicons name="cart-outline" size={24} color={COLORS.primary} />
          {cartCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{cartCount}</Text>
            </View>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={22} color={COLORS.error} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderPromoBanner = () => (
    <View style={styles.promoContainer}>
      <Image 
        source={{ uri: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=1000' }} 
        style={styles.promoImage} 
      />
      <View style={styles.promoOverlay}>
        <Text style={styles.promoTag}>Special Promo</Text>
        <Text style={styles.promoTitle}>Free Delivery</Text>
        <Text style={styles.promoSubtitle}>On orders above $30. Use code BITEFREE.</Text>
      </View>
    </View>
  );

  const renderCategories = () => (
    <View style={styles.categoriesSection}>
      <Text style={styles.sectionTitle}>Categories</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesContainer}
      >
        {CATEGORIES.map(category => {
          const isActive = activeCategory === category.name;
          return (
            <TouchableOpacity 
              key={category.id} 
              activeOpacity={0.9}
              onPress={() => {
                setActiveCategory(category.name);
              }}
              style={[
                styles.categoryCard,
                isActive && styles.activeCategoryCard
              ]}
            >
              <View style={[
                styles.categoryIconContainer,
                isActive && styles.activeCategoryIconContainer
              ]}>
                <Ionicons 
                  name={category.icon} 
                  size={20} 
                  color={isActive ? COLORS.primary : COLORS.textSecondary} 
                />
              </View>
              <Text style={[
                styles.categoryName,
                isActive && styles.activeCategoryName
              ]}>
                {category.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      
      {/* Header */}
      {renderHeader()}

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Promotional Banner */}
        {renderPromoBanner()}

        {/* Quick Search trigger */}
        <TouchableOpacity 
          activeOpacity={0.9} 
          onPress={() => navigation.navigate('Explore')}
          style={styles.searchBarTrigger}
        >
          <Ionicons name="search-outline" size={20} color={COLORS.textSecondary} style={styles.searchIcon} />
          <Text style={styles.searchPlaceholder}>Search food items or restaurants...</Text>
        </TouchableOpacity>

        {/* Categories */}
        {renderCategories()}

        {/* Popular Foods */}
        <View style={styles.popularSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{activeCategory} Choices</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Explore')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loaderContainer}>
              <LoadingIndicator message={`Fetching ${activeCategory} list...`} />
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : popularMeals.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No meals found</Text>
            </View>
          ) : (
            <FlatList
              data={popularMeals}
              scrollEnabled={false}
              numColumns={2}
              keyExtractor={(item) => item.idMeal?.toString() ?? Math.random().toString()}
              renderItem={({ item }) => (
                <FoodCard
                  item={item}
                  isFavorite={isFavorite(item.idMeal)}
                  onFavoriteToggle={() => handleFavoriteToggle(item)}
                  onPress={() => navigation.navigate('FoodDetails', { foodItem: item })}
                />
              )}
              columnWrapperStyle={styles.gridRow}
              contentContainerStyle={styles.popularGrid}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.small,
  },
  userProfile: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },
  avatarImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  avatarText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  userInfo: {
    justifyContent: 'center',
  },
  welcomeText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  userNameText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cartButton: {
    padding: 8,
    backgroundColor: COLORS.background,
    borderRadius: 12,
    marginRight: 8,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.white,
  },
  badgeText: {
    color: COLORS.white,
    fontSize: 9,
    fontWeight: 'bold',
  },
  logoutButton: {
    padding: 8,
    backgroundColor: COLORS.background,
    borderRadius: 12,
  },
  promoContainer: {
    height: 150,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 20,
    overflow: 'hidden',
    ...SHADOWS.medium,
  },
  promoImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  promoOverlay: {
    flex: 1,
    backgroundColor: 'rgba(40, 54, 24, 0.4)',
    padding: 16,
    justifyContent: 'flex-end',
  },
  promoTag: {
    backgroundColor: COLORS.accent,
    color: COLORS.text,
    fontSize: 10,
    fontWeight: '800',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  promoTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  promoSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 4,
  },
  searchBarTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 52,
    marginHorizontal: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.small,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchPlaceholder: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  categoriesSection: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  categoriesContainer: {
    paddingLeft: 16,
    paddingRight: 8,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.small,
  },
  activeCategoryCard: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(96, 108, 56, 0.05)',
  },
  categoryIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  activeCategoryIconContainer: {
    backgroundColor: 'rgba(96, 108, 56, 0.1)',
  },
  categoryName: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  activeCategoryName: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  popularSection: {
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 8,
  },
  seeAllText: {
    color: COLORS.primary,
    fontWeight: 'bold',
    fontSize: 14,
  },
  loaderContainer: {
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
  },
  popularGrid: {
    paddingHorizontal: 8,
  },
  gridRow: {
    justifyContent: 'space-between',
  },
});
