import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator, 
  SafeAreaView, 
  StatusBar 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SHADOWS } from '../constants/theme';
import SearchBar from '../components/SearchBar';
import FoodCard from '../components/FoodCard';
import RestaurantCard from '../components/RestaurantCard';
import LoadingIndicator from '../components/LoadingIndicator';
import CustomHeader from '../components/CustomHeader';
import { useFavorites } from '../context/FavoritesContext';
import { customAlert } from '../utils/alert';

export default function ExploreScreen({ route, navigation }) {
  const initialSearch = route.params?.search || '';
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [activeTab, setActiveTab] = useState('foods'); // 'foods' or 'restaurants'
  const { toggleFavorite, isFavorite } = useFavorites();
  
  // Food state
  const [foods, setFoods] = useState([]);
  const [foodsLoading, setFoodsLoading] = useState(false);
  const [foodsError, setFoodsError] = useState(null);
  
  // Restaurant state
  const [restaurants, setRestaurants] = useState([]);
  const [restaurantsLoading, setRestaurantsLoading] = useState(false);
  const [restaurantsError, setRestaurantsError] = useState(null);

  // Fetch data on load and when active tab/search changes
  useEffect(() => {
    if (activeTab === 'foods') {
      fetchFoods(searchQuery);
    } else {
      fetchRestaurants(searchQuery);
    }
  }, [activeTab]);

  const fetchFoods = async (query = '') => {
    setFoodsLoading(true);
    setFoodsError(null);
    try {
      // If there is a query, search for it; otherwise fetch a default set
      const searchTerm = query.trim() || 'beef';
      const response = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${searchTerm}`);
      const data = await response.json();
      if (data.meals) {
        setFoods(data.meals);
      } else {
        setFoods([]); // No results found
      }
    } catch (error) {
      console.log('Error fetching foods:', error);
      setFoodsError('Could not retrieve food data. Please try again.');
    } finally {
      setFoodsLoading(false);
    }
  };

  const fetchRestaurants = async (query = '') => {
    setRestaurantsLoading(true);
    setRestaurantsError(null);
    try {
      // Fetch users from JSONPlaceholder to act as restaurant listings
      const response = await fetch('https://jsonplaceholder.typicode.com/users');
      const data = await response.json();
      
      // Filter restaurants if query is provided
      if (query.trim()) {
        const filtered = data.filter(item => 
          item.name.toLowerCase().includes(query.toLowerCase()) || 
          item.company?.name?.toLowerCase().includes(query.toLowerCase())
        );
        setRestaurants(filtered);
      } else {
        setRestaurants(data);
      }
    } catch (error) {
      console.log('Error fetching restaurants:', error);
      setRestaurantsError('Could not retrieve restaurant list. Please try again.');
    } finally {
      setRestaurantsLoading(false);
    }
  };

  const handleSearchSubmit = () => {
    if (activeTab === 'foods') {
      fetchFoods(searchQuery);
    } else {
      fetchRestaurants(searchQuery);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    if (activeTab === 'foods') {
      fetchFoods('');
    } else {
      fetchRestaurants('');
    }
  };

  const handleFavoriteToggle = async (item) => {
    await toggleFavorite(item);
  };

  const renderTabButtons = () => (
    <View style={styles.tabContainer}>
      <TouchableOpacity 
        style={[styles.tabButton, activeTab === 'foods' && styles.activeTabButton]}
        onPress={() => setActiveTab('foods')}
      >
        <Text style={[styles.tabText, activeTab === 'foods' && styles.activeTabText]}>Foods</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={[styles.tabButton, activeTab === 'restaurants' && styles.activeTabButton]}
        onPress={() => setActiveTab('restaurants')}
      >
        <Text style={[styles.tabText, activeTab === 'restaurants' && styles.activeTabText]}>Restaurants</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      <CustomHeader title="Explore QuickBites" />

      {/* Tab Selectors */}
      {renderTabButtons()}

      {/* Custom Search Bar */}
      <SearchBar
        value={searchQuery}
        onChangeText={(text) => {
          setSearchQuery(text);
          // Optional: real-time search filtering for restaurants, search on submit for foods to save bandwidth
          if (activeTab === 'restaurants') {
            fetchRestaurants(text);
          }
        }}
        placeholder={activeTab === 'foods' ? 'Search meals (e.g. Chicken, Beef, Pizza)...' : 'Search restaurants...'}
        onClear={handleClearSearch}
      />
      {activeTab === 'foods' && (
        <TouchableOpacity style={styles.searchSubmitButton} onPress={handleSearchSubmit}>
          <Text style={styles.searchSubmitText}>Search Food</Text>
        </TouchableOpacity>
      )}

      {/* Main Content Area */}
      <View style={styles.contentArea}>
        {activeTab === 'foods' ? (
          foodsLoading ? (
            <LoadingIndicator message="Finding delicious meals..." />
          ) : foodsError ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{foodsError}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={() => fetchFoods(searchQuery)}>
                <Text style={styles.retryText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : foods.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No food items found matching "{searchQuery}"</Text>
              <Text style={styles.emptySubtext}>Try searching for 'chicken', 'pizza', 'cake' or 'beef'.</Text>
            </View>
          ) : (
            <FlatList
              data={foods}
              keyExtractor={(item) => item.idMeal?.toString() ?? Math.random().toString()}
              numColumns={2}
              renderItem={({ item }) => (
                <FoodCard
                  item={item}
                  isFavorite={isFavorite(item.idMeal)}
                  onFavoriteToggle={() => handleFavoriteToggle(item)}
                  onPress={() => navigation.navigate('FoodDetails', { foodItem: item })}
                />
              )}
              columnWrapperStyle={styles.gridRow}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            />
          )
        ) : (
          restaurantsLoading ? (
            <LoadingIndicator message="Finding nearby restaurants..." />
          ) : restaurantsError ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{restaurantsError}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={() => fetchRestaurants(searchQuery)}>
                <Text style={styles.retryText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : restaurants.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No restaurants found matching "{searchQuery}"</Text>
            </View>
          ) : (
            <FlatList
              data={restaurants}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <RestaurantCard
                  item={item}
                  onPress={() => customAlert(item.name, `Welcome to ${item.name}! Located at ${item.address?.city || '123 Food Street'}.`)}
                />
              )}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            />
          )
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 14,
    padding: 4,
    ...SHADOWS.small,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 10,
  },
  activeTabButton: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.textSecondary,
  },
  activeTabText: {
    color: COLORS.white,
  },
  searchSubmitButton: {
    backgroundColor: COLORS.primary,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 14,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.small,
  },
  searchSubmitText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 15,
  },
  contentArea: {
    flex: 1,
    marginTop: 8,
  },
  listContent: {
    paddingHorizontal: 8,
    paddingBottom: 24,
  },
  gridRow: {
    justifyContent: 'space-between',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: '600',
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 10,
  },
  retryText: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 40,
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontSize: 15,
    textAlign: 'center',
    fontWeight: '600',
  },
  emptySubtext: {
    color: COLORS.textLight,
    fontSize: 13,
    textAlign: 'center',
    marginTop: 8,
  },
});
