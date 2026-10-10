import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../constants/theme';

export default function RestaurantCard({ item, onPress }) {
  // Extract values
  const name = item.company?.name || item.name || 'Gourmet Restaurant';
  const address = item.address ? `${item.address.street}, ${item.address.city}` : '123 Food Street, City';
  const rating = item.rating || (4.0 + (item.id % 10) / 10).toFixed(1);
  const hours = item.openingHours || (item.id % 2 === 0 ? "08:00 AM - 10:00 PM" : "11:00 AM - 11:00 PM");

  return (
    <TouchableOpacity 
      activeOpacity={0.95} 
      onPress={onPress} 
      style={styles.cardContainer}
    >
      <View style={styles.headerRow}>
        <View style={styles.nameContainer}>
          <Text style={styles.nameText}>{name}</Text>
          <Text style={styles.taglineText}>{item.company?.catchPhrase || 'Delicious food delivered fast'}</Text>
        </View>
        <View style={styles.ratingBadge}>
          <Ionicons name="star" size={14} color={COLORS.white} />
          <Text style={styles.ratingText}>{rating}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.infoRow}>
        <Ionicons name="location-outline" size={16} color={COLORS.primary} style={styles.icon} />
        <Text numberOfLines={1} style={styles.infoText}>{address}</Text>
      </View>

      <View style={styles.infoRow}>
        <Ionicons name="time-outline" size={16} color={COLORS.secondary} style={styles.icon} />
        <Text style={styles.infoText}>Opens: {hours}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.small,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  nameContainer: {
    flex: 1,
    marginRight: 12,
  },
  nameText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  taglineText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
    fontStyle: 'italic',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  ratingText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  icon: {
    marginRight: 8,
  },
  infoText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
});
