import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  Image, 
  TouchableOpacity, 
  SafeAreaView, 
  StatusBar 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { customAlert } from '../utils/alert';
import { collection, addDoc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth, db } from '../firebase/config';
import { COLORS, SHADOWS } from '../constants/theme';
import { useCart } from '../context/CartContext';
import CustomButton from '../components/CustomButton';
import CustomHeader from '../components/CustomHeader';

export default function CartScreen({ navigation }) {
  const { cartItems, updateQuantity, removeFromCart, totalAmount, clearCart } = useCart();
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    const user = auth.currentUser;
    if (!user) {
      customAlert('Authentication Required', 'Please log in to place an order.');
      return;
    }

    if (cartItems.length === 0) {
      customAlert('Cart Empty', 'Please add some items to your cart first.');
      return;
    }

    setLoading(true);
    try {
      // 1. Create an order in Firestore
      const ordersCollectionRef = collection(db, 'orders');
      
      const orderPayload = {
        userId: user.uid,
        items: cartItems,
        totalPrice: parseFloat(totalAmount.toFixed(2)),
        orderTime: new Date().toISOString(),
        status: 'Pending',
      };

      await addDoc(ordersCollectionRef, orderPayload);
      
      clearCart();
      customAlert(
        'Order Placed Successfully! 🎉',
        `Your order for ${cartItems.length} items (Total: $${totalAmount.toFixed(2)}) has been placed!`,
        [
          { text: 'View Orders', onPress: () => navigation.navigate('Orders') },
          { text: 'Go Back', style: 'cancel', onPress: () => navigation.goBack() }
        ]
      );

    } catch (error) {
      console.error('Checkout error:', error);
      customAlert('Order Failed', 'Could not complete checkout. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderCartItem = ({ item }) => (
    <View style={styles.cartCard}>
      <Image source={{ uri: item.image }} style={styles.itemImage} />
      
      <View style={styles.itemInfo}>
        <View style={styles.titleRow}>
          <Text numberOfLines={1} style={styles.itemNameText}>{item.name}</Text>
          <TouchableOpacity onPress={() => removeFromCart(item.id)} style={styles.removeBtn}>
            <Ionicons name="close-circle-outline" size={20} color={COLORS.error} />
          </TouchableOpacity>
        </View>

        <Text style={styles.categoryText}>{item.category}</Text>

        <View style={styles.footerRow}>
          <Text style={styles.priceText}>${(item.price * item.quantity).toFixed(2)}</Text>
          
          <View style={styles.quantitySelector}>
            <TouchableOpacity 
              style={styles.quantityBtn} 
              onPress={() => updateQuantity(item.id, item.quantity - 1)}
            >
              <Ionicons name="remove" size={16} color={COLORS.text} />
            </TouchableOpacity>
            <Text style={styles.quantityText}>{item.quantity}</Text>
            <TouchableOpacity 
              style={styles.quantityBtn} 
              onPress={() => updateQuantity(item.id, item.quantity + 1)}
            >
              <Ionicons name="add" size={16} color={COLORS.text} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      <CustomHeader title="My Cart" showBackButton={true} />

      {cartItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconContainer}>
            <Ionicons name="cart-outline" size={60} color={COLORS.textLight} />
          </View>
          <Text style={styles.emptyTitle}>Your Cart is Empty</Text>
          <Text style={styles.emptySubtitle}>
            Go back to the Explore or Dashboard tabs and choose some delicious bites!
          </Text>
          <TouchableOpacity style={styles.browseBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.browseText}>Continue Browsing</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.contentContainer}>
          <FlatList
            data={cartItems}
            keyExtractor={(item) => item.id}
            renderItem={renderCartItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />

          <View style={styles.checkoutFooter}>
            <View style={styles.row}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>${totalAmount.toFixed(2)}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.summaryLabel}>Delivery Charge</Text>
              <Text style={styles.summaryValue}>$2.00</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.row}>
              <Text style={styles.totalLabel}>Grand Total</Text>
              <Text style={styles.totalValue}>${(totalAmount + 2.00).toFixed(2)}</Text>
            </View>

            <CustomButton
              title="Confirm & Place Order"
              variant="primary"
              loading={loading}
              onPress={handleCheckout}
              style={styles.checkoutBtn}
            />
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  contentContainer: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    paddingBottom: 24,
  },
  cartCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.small,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 14,
    backgroundColor: COLORS.background,
  },
  itemInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemNameText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    flex: 1,
    marginRight: 8,
  },
  removeBtn: {
    padding: 4,
  },
  categoryText: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 2,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  priceText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 10,
    padding: 2,
  },
  quantityBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.small,
  },
  quantityText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.text,
    paddingHorizontal: 12,
  },
  checkoutFooter: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    borderTopWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.large,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  summaryLabel: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 10,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  checkoutBtn: {
    marginTop: 14,
    marginVertical: 0,
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
    color: COLORS.textLight,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  browseBtn: {
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
