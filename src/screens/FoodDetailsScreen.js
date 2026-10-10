import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  Image, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  SafeAreaView, 
  StatusBar 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ref, push, set } from 'firebase/database';
import { auth, db } from '../firebase/config';
import { customAlert } from '../utils/alert';
import { COLORS, SHADOWS } from '../constants/theme';
import { useCart } from '../context/CartContext';
import CustomButton from '../components/CustomButton';
import CustomHeader from '../components/CustomHeader';

import { useFavorites } from '../context/FavoritesContext';

export default function FoodDetailsScreen({ route, navigation }) {
  const { foodItem } = route.params;
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const { toggleFavorite, isFavorite } = useFavorites();

  const isFav = isFavorite(foodItem.idMeal || foodItem.id);

  // Generate a premium price based on meal ID to make it look professional
  const priceNum = ((parseInt(foodItem.idMeal || foodItem.id || 0) % 15) + 8);
  const price = `$${priceNum.toFixed(2)}`;

  const handleFavoriteToggle = async () => {
    const success = await toggleFavorite(foodItem);
    if (success) {
      const stateAfter = isFavorite(foodItem.idMeal || foodItem.id);
      const action = stateAfter ? 'Removed from' : 'Added to';
      customAlert('Favorites Updated', `"${foodItem.strMeal || foodItem.name}" has been ${action.toLowerCase()} favorites.`);
    }
  };

  const incrementQuantity = () => {
    if (quantity < 10) setQuantity(quantity + 1);
  };

  const decrementQuantity = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const handleAddToCart = () => {
    addToCart(foodItem, quantity);
    customAlert(
      'Added to Cart! 🛒',
      `Added ${quantity}x "${foodItem.strMeal || foodItem.name}" to your cart.`,
      [
        { 
          text: 'View Cart', 
          onPress: () => navigation.navigate('Cart')
        },
        { 
          text: 'Continue Browsing', 
          style: 'cancel'
        }
      ]
    );
  };



  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      <CustomHeader 
        title="Food Details" 
        showBackButton={true} 
        rightElement={
          <TouchableOpacity onPress={handleFavoriteToggle} style={styles.favHeaderButton}>
            <Ionicons 
              name={isFav ? "heart" : "heart-outline"} 
              size={24} 
              color={isFav ? COLORS.primary : COLORS.text} 
            />
          </TouchableOpacity>
        }
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Food Large Image */}
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: foodItem.strMealThumb || foodItem.image || 'https://via.placeholder.com/150' }} 
            style={styles.image} 
          />
          <View style={styles.tagBadge}>
            <Text style={styles.tagText}>{foodItem.strCategory || foodItem.category || 'Special'}</Text>
          </View>
        </View>

        {/* Content Container */}
        <View style={styles.infoWrapper}>
          <View style={styles.titleRow}>
            <Text style={styles.titleText}>{foodItem.strMeal || foodItem.name}</Text>
            <Text style={styles.priceText}>{price}</Text>
          </View>

          {/* Cooking Source / Origin Info */}
          {foodItem.strArea && (
            <View style={styles.originRow}>
              <Ionicons name="earth" size={16} color={COLORS.textSecondary} />
              <Text style={styles.originText}>{foodItem.strArea} Cuisine</Text>
            </View>
          )}

          <View style={styles.divider} />

          {/* Instructions / Details Section */}
          <Text style={styles.sectionTitle}>Preparation & Instructions</Text>
          <Text style={styles.instructionsText}>
            {foodItem.strInstructions || foodItem.instructions || "This delicious dish is prepared using fresh ingredients, carefully blended spices, and premium oils. Our master chefs prepare it hot and fresh directly for you. Cooking directions are kept standard to preserve taste and nutrition. Recommended to eat fresh!"}
          </Text>

          <View style={styles.divider} />

          {/* Quantity Selector Section */}
          <View style={styles.quantityContainer}>
            <Text style={styles.sectionTitle}>Choose Quantity</Text>
            <View style={styles.selectorRow}>
              <TouchableOpacity 
                style={styles.quantityBtn} 
                onPress={decrementQuantity}
                disabled={quantity <= 1}
              >
                <Ionicons name="remove" size={20} color={quantity <= 1 ? COLORS.textLight : COLORS.text} />
              </TouchableOpacity>
              <Text style={styles.quantityText}>{quantity}</Text>
              <TouchableOpacity 
                style={styles.quantityBtn} 
                onPress={incrementQuantity}
                disabled={quantity >= 10}
              >
                <Ionicons name="add" size={20} color={quantity >= 10 ? COLORS.textLight : COLORS.text} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Place Order Sticky Bottom Action */}
      <View style={styles.stickyFooter}>
        <View style={styles.footerPriceCol}>
          <Text style={styles.footerPriceLabel}>Total Price</Text>
          <Text style={styles.footerPriceValue}>${(priceNum * quantity).toFixed(2)}</Text>
        </View>
        <CustomButton
          title="Add to Cart 🛒"
          variant="primary"
          onPress={handleAddToCart}
          style={styles.placeOrderBtn}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingBottom: 110,
  },
  favHeaderButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    width: '100%',
    height: 250,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  tagBadge: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    ...SHADOWS.small,
  },
  tagText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 12,
    textTransform: 'uppercase',
  },
  infoWrapper: {
    padding: 20,
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -20,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: 8,
  },
  titleText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.text,
    flex: 1,
    marginRight: 12,
  },
  priceText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  originRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  originText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginLeft: 6,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 18,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  instructionsText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  quantityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    padding: 4,
    ...SHADOWS.small,
  },
  quantityBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    paddingHorizontal: 16,
  },
  stickyFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.large,
  },
  footerPriceCol: {
    marginRight: 12,
  },
  footerPriceLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  footerPriceValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  placeOrderBtn: {
    flex: 1,
    marginVertical: 0,
    height: 48,
  },
});
