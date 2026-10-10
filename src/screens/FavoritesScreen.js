import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  SafeAreaView, 
  StatusBar 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { customAlert } from '../utils/alert';
import { COLORS, SHADOWS } from '../constants/theme';
import FoodCard from '../components/FoodCard';
import CustomHeader from '../components/CustomHeader';
import { useFavorites } from '../context/FavoritesContext';

export default function FavoritesScreen({ navigation }) {
  const { favorites, toggleFavorite, clearAllFavorites, isFavorite } = useFavorites();

  const handleFavoriteToggle = async (item) => {
    // Remove specific favorite item
    customAlert(
      'Remove Favorite',
      `Are you sure you want to remove "${item.strMeal || item.name}" from your favorites?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: async () => {
            await toggleFavorite(item);
            customAlert('Success', 'Removed from favorites.');
          }
        }
      ]
    );
  };

  const handleClearAll = () => {
    if (favorites.length === 0) return;

    customAlert(
      'Clear All Favorites',
      'Are you sure you want to delete all saved items from your favorites?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            await clearAllFavorites();
            customAlert('Success', 'All favorites cleared!');
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      <CustomHeader 
        title="My Favorites" 
        rightElement={
          favorites.length > 0 && (
            <TouchableOpacity onPress={handleClearAll} style={styles.clearAllBtn}>
              <Ionicons name="trash-bin-outline" size={20} color={COLORS.primary} />
              <Text style={styles.clearAllText}>Clear All</Text>
            </TouchableOpacity>
          )
        }
      />

      {favorites.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconContainer}>
            <Ionicons name="heart-dislike-outline" size={60} color={COLORS.textLight} />
          </View>
          <Text style={styles.emptyTitle}>No Favorites Yet</Text>
          <Text style={styles.emptySubtitle}>
            Save your favorite meals locally so you can easily access them anytime.
          </Text>
          <TouchableOpacity 
            style={styles.browseButton} 
            onPress={() => navigation.navigate('Explore')}
          >
            <Text style={styles.browseText}>Browse Delicious Foods</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item) => item.idMeal?.toString() ?? Math.random().toString()}
          numColumns={2}
          renderItem={({ item }) => (
            <FoodCard
              item={item}
              isFavorite={true}
              onFavoriteToggle={() => handleFavoriteToggle(item)}
              onPress={() => navigation.navigate('FoodDetails', { foodItem: item })}
            />
          )}
          columnWrapperStyle={styles.gridRow}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  listContent: {
    paddingHorizontal: 8,
    paddingTop: 16,
    paddingBottom: 24,
  },
  gridRow: {
    justifyContent: 'space-between',
  },
  clearAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(96, 108, 56, 0.08)',
  },
  clearAllText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    ...SHADOWS.small,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  browseButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 14,
    ...SHADOWS.small,
  },
  browseText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 14,
  },
});
