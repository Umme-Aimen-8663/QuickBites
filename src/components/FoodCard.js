import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../constants/theme';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.44; // Perfect for two-column grid

export default function FoodCard({ item, onPress, isFavorite, onFavoriteToggle }) {
  // If price is not provided, generate a mock price
  const price = item.price || `$${((parseInt(item.idMeal || item.id || 0) % 15) + 8).toFixed(2)}`;

  return (
    <TouchableOpacity 
      activeOpacity={0.95} 
      onPress={onPress} 
      style={styles.cardContainer}
    >
      {/* Food Image */}
      <Image 
        source={{ uri: item.strMealThumb || item.image || 'https://via.placeholder.com/150' }} 
        style={styles.image} 
      />

      {/* Favorite Button Overlay */}
      <TouchableOpacity 
        activeOpacity={0.8}
        onPress={onFavoriteToggle} 
        style={styles.favoriteBadge}
      >
        <Ionicons 
          name={isFavorite ? "heart" : "heart-outline"} 
          size={20} 
          color={isFavorite ? COLORS.primary : COLORS.textSecondary} 
        />
      </TouchableOpacity>

      {/* Category Badge Overlay */}
      <View style={styles.categoryBadge}>
        <Text style={styles.categoryText}>{item.strCategory || item.category || 'Food'}</Text>
      </View>

      {/* Info Container */}
      <View style={styles.infoContainer}>
        <Text numberOfLines={1} style={styles.nameText}>
          {item.strMeal || item.name}
        </Text>
        
        <View style={styles.priceRow}>
          <Text style={styles.priceText}>{price}</Text>
          <View style={styles.addButton}>
            <Ionicons name="add" size={18} color={COLORS.white} />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    width: CARD_WIDTH,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    margin: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.small,
  },
  image: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  favoriteBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    padding: 6,
    ...SHADOWS.small,
  },
  categoryBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  categoryText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
  infoContainer: {
    padding: 12,
  },
  nameText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 6,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.primary,
  },
  addButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    padding: 3,
  },
});
