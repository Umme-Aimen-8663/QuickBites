import React, { useState, useEffect } from 'react';
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
import { ref, onValue, remove } from 'firebase/database';
import { auth, db } from '../firebase/config';
import { COLORS, SHADOWS } from '../constants/theme';
import CustomHeader from '../components/CustomHeader';
import LoadingIndicator from '../components/LoadingIndicator';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function OrdersScreen({ navigation }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth.currentUser;
    console.log('[OrdersScreen] mounted. Current User:', user ? user.uid : 'No User');
    
    // Reference path to user orders
    let ordersRef = null;
    if (user) {
      ordersRef = ref(db, `orders/${user.uid}`);
      console.log('[OrdersScreen] Setting up onValue listener for path:', `orders/${user.uid}`);
    }

    let firebaseOrders = [];
    let localOrders = [];

    // Helper to merge and sort lists
    const mergeAndSetOrders = (fbList, locList) => {
      const merged = [...fbList, ...locList];
      merged.sort((a, b) => new Date(b.orderTime) - new Date(a.orderTime));
      setOrders(merged);
    };

    // Load local orders from AsyncStorage
    const loadLocalOrders = async () => {
      try {
        const localOrdersData = await AsyncStorage.getItem('local_orders');
        console.log('[OrdersScreen] Read local_orders data:', localOrdersData);
        if (localOrdersData) {
          localOrders = JSON.parse(localOrdersData);
        } else {
          localOrders = [];
        }
      } catch (err) {
        console.error('[OrdersScreen] Error loading local orders:', err);
      }
      mergeAndSetOrders(firebaseOrders, localOrders);
    };

    // Initial load
    loadLocalOrders();

    // Set up Realtime DB listener if authenticated
    let unsubscribe = () => {};
    if (ordersRef) {
      unsubscribe = onValue(ordersRef, (snapshot) => {
        const data = snapshot.val();
        console.log('[OrdersScreen] onValue listener received data:', data);
        if (data) {
          firebaseOrders = Object.keys(data).map(key => ({
            ...data[key],
            dbKey: key
          }));
        } else {
          firebaseOrders = [];
        }
        mergeAndSetOrders(firebaseOrders, localOrders);
        setLoading(false);
      }, (error) => {
        console.error('[OrdersScreen] Realtime DB read error:', error);
        mergeAndSetOrders([], localOrders);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }

    // Refresh local orders whenever the screen gains focus
    const focusUnsubscribe = navigation ? navigation.addListener('focus', () => {
      console.log('[OrdersScreen] Screen focused. Re-loading local orders...');
      loadLocalOrders();
    }) : () => {};

    return () => {
      console.log('[OrdersScreen] Unsubscribing listeners');
      unsubscribe();
      focusUnsubscribe();
    };
  }, [navigation]);

  const handleDeleteOrder = (dbKey, foodName, isLocal, itemId) => {
    const title = isLocal ? 'Remove Order Record' : 'Cancel Order';
    const message = isLocal 
      ? `Are you sure you want to remove the local record of your order for "${foodName}"?`
      : `Are you sure you want to cancel and remove your order for "${foodName}"?`;

    customAlert(
      title,
      message,
      [
        { text: 'No', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: async () => {
            if (isLocal) {
              try {
                const localOrdersData = await AsyncStorage.getItem('local_orders');
                if (localOrdersData) {
                  const localList = JSON.parse(localOrdersData);
                  const updated = localList.filter(item => item.id !== itemId);
                  await AsyncStorage.setItem('local_orders', JSON.stringify(updated));
                  
                  // Reload and update state
                  setOrders(prev => prev.filter(item => item.id !== itemId));
                  customAlert('Success', 'Local order record removed successfully!');
                }
              } catch (e) {
                console.error('Error removing local order:', e);
              }
            } else {
              const user = auth.currentUser;
              if (!user) return;

              try {
                const orderRef = ref(db, `orders/${user.uid}/${dbKey}`);
                await remove(orderRef);
                customAlert('Success', 'Order cancelled successfully!');
              } catch (error) {
                console.log('Error deleting order:', error);
                customAlert('Error', 'Failed to cancel the order. Please try again.');
              }
            }
          }
        }
      ]
    );
  };

  const formatDate = (isoString) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return 'Recent Order';
    }
  };

  const renderOrderItem = ({ item }) => {
    const isMultiItem = Array.isArray(item.items) && item.items.length > 0;
    
    // Extract info based on order format
    const firstItem = isMultiItem ? item.items[0] : null;
    const foodImage = isMultiItem 
      ? (firstItem.image || 'https://via.placeholder.com/150')
      : (item.foodImage || 'https://via.placeholder.com/150');
      
    const foodName = isMultiItem 
      ? (item.items.length > 1 
          ? `${firstItem.name} + ${item.items.length - 1} more`
          : firstItem.name)
      : (item.foodName || 'Meal Order');

    const orderTotal = isMultiItem 
      ? item.totalPrice 
      : ((item.price || 0) * (item.quantity || 1));

    const subtitleText = isMultiItem 
      ? `${item.items.length} items total`
      : `Qty: ${item.quantity || 1} • Price: $${(item.price || 0).toFixed(2)}`;

    return (
      <View style={styles.orderCard}>
        <Image source={{ uri: foodImage }} style={styles.foodImage} />
        
        <View style={styles.orderInfo}>
          <View style={styles.titleRow}>
            <Text numberOfLines={1} style={styles.foodNameText}>{foodName}</Text>
            <TouchableOpacity 
              onPress={() => handleDeleteOrder(item.dbKey, foodName, item.isLocal, item.id)}
              style={styles.deleteButton}
            >
              <Ionicons name="trash-outline" size={18} color={COLORS.error} />
            </TouchableOpacity>
          </View>

          <Text style={styles.detailsText}>
            {subtitleText} • Total: <Text style={styles.highlightText}>${orderTotal.toFixed(2)}</Text>
          </Text>

          {isMultiItem && (
            <View style={styles.itemsSummary}>
              <Text numberOfLines={1} style={styles.itemsSummaryText}>
                {item.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
              </Text>
            </View>
          )}

          <View style={styles.footerRow}>
            <Text style={styles.timeText}>{formatDate(item.orderTime)}</Text>
            <View style={[
              styles.statusBadge,
              item.status === 'Pending' && styles.pendingBadge
            ]}>
              <Text style={styles.statusText}>
                {item.isLocal ? 'Offline Saved' : (item.status || 'Pending')}
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  };



  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      <CustomHeader title="My Orders" />

      {loading ? (
        <LoadingIndicator message="Retrieving your orders..." />
      ) : orders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconContainer}>
            <Ionicons name="receipt-outline" size={60} color={COLORS.textLight} />
          </View>
          <Text style={styles.emptyTitle}>No Orders Yet</Text>
          <Text style={styles.emptySubtitle}>
            Browse our online meals in the Explore tab and place your first food order today!
          </Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          renderItem={renderOrderItem}
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
    padding: 16,
    paddingBottom: 24,
  },
  orderCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.small,
  },
  foodImage: {
    width: 80,
    height: 80,
    borderRadius: 14,
    backgroundColor: COLORS.background,
  },
  orderInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  foodNameText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    flex: 1,
    marginRight: 8,
  },
  deleteButton: {
    padding: 4,
  },
  detailsText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  highlightText: {
    fontWeight: '600',
    color: COLORS.text,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  timeText: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  pendingBadge: {
    backgroundColor: 'rgba(255, 179, 0, 0.1)',
  },
  statusText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: COLORS.secondary,
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
  },
  itemsSummary: {
    backgroundColor: COLORS.background,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginTop: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  itemsSummaryText: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
});
