import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  TouchableOpacity, 
  TextInput, 
  SafeAreaView, 
  StatusBar,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { customAlert } from '../utils/alert';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { signOut, updateProfile, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/config';
import { COLORS, SHADOWS } from '../constants/theme';
import CustomButton from '../components/CustomButton';
import CustomHeader from '../components/CustomHeader';

export default function ProfileScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [name, setName] = useState('');
  const [photoUri, setPhotoUri] = useState(null);
  const [loading, setLoading] = useState(false);

  // Set up auth state listener and load profile on mount
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setName(currentUser.displayName || '');
        loadLocalPhoto(currentUser);
      } else {
        setUser(null);
        setName('');
        setPhotoUri(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const loadLocalPhoto = async (currentUser) => {
    try {
      if (currentUser) {
        const savedPhoto = await AsyncStorage.getItem(`user_photo_${currentUser.uid}`);
        if (savedPhoto) {
          setPhotoUri(savedPhoto);
        } else if (currentUser.photoURL) {
          setPhotoUri(currentUser.photoURL);
        }
      }
    } catch (e) {
      console.log('Error loading local profile photo:', e);
    }
  };

  const handlePickImage = async () => {
    if (!user) {
      customAlert('Authentication Required', 'Please log in to update your profile picture.');
      return;
    }

    try {
      // Ask for permission first
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        customAlert('Permission Denied', 'We need camera roll permissions to change your profile picture.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedUri = result.assets[0].uri;
        setPhotoUri(selectedUri);
        
        // Save to AsyncStorage immediately
        await AsyncStorage.setItem(`user_photo_${user.uid}`, selectedUri);
        
        // Also sync to Firebase Auth URL (may fail if local URI is stored, but works as fallback)
        try {
          await updateProfile(user, {
            photoURL: selectedUri
          });
        } catch (firebaseErr) {
          console.log('Firebase Profile photoURL update failed:', firebaseErr);
        }
        customAlert('Success', 'Profile photo updated locally!');
      }
    } catch (error) {
      console.log('Error picking image:', error);
      customAlert('Error', 'Failed to pick image.');
    }
  };

  const handleUpdateProfile = async () => {
    if (!user) {
      customAlert('Authentication Required', 'Please log in to update your profile.');
      return;
    }

    if (!name.trim()) {
      customAlert('Validation Error', 'Profile name cannot be empty.');
      return;
    }

    setLoading(true);
    try {
      await updateProfile(user, {
        displayName: name.trim(),
        photoURL: photoUri
      });
      
      // Save photoUri to AsyncStorage as well
      if (photoUri) {
        await AsyncStorage.setItem(`user_photo_${user.uid}`, photoUri);
      }

      customAlert('Success', 'Profile updated successfully!');
    } catch (error) {
      console.log('Profile update error:', error);
      customAlert('Error', 'Failed to update profile info.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    customAlert(
      'Sign Out',
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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      <CustomHeader title="My Profile" />

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Profile Photo Upload Panel */}
          <View style={styles.avatarSection}>
            <View style={styles.imageFrame}>
              {photoUri ? (
                <Image source={{ uri: photoUri }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.placeholderChar}>
                    {user?.displayName ? user.displayName.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
              
              <TouchableOpacity onPress={handlePickImage} style={styles.editBadge}>
                <Ionicons name="camera" size={16} color={COLORS.white} />
              </TouchableOpacity>
            </View>
            <Text style={styles.uploadText}>Tap the camera to change photo</Text>
          </View>

          {/* User Account Info Details */}
          <View style={styles.formSection}>
            <Text style={styles.inputLabel}>Full Name</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="person-outline" size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                value={name}
                onChangeText={setName}
                placeholder="Enter display name"
                placeholderTextColor={COLORS.textLight}
              />
            </View>

            <Text style={styles.inputLabel}>Email Address (Read-Only)</Text>
            <View style={[styles.inputWrapper, styles.disabledWrapper]}>
              <Ionicons name="mail-outline" size={20} color={COLORS.textLight} style={styles.inputIcon} />
              <Text style={styles.disabledText}>{user?.email || 'N/A'}</Text>
            </View>

            <CustomButton
              title="Update Profile"
              variant="primary"
              loading={loading}
              onPress={handleUpdateProfile}
              style={styles.updateBtn}
            />

            <View style={styles.divider} />

            <CustomButton
              title="Logout Account"
              variant="danger"
              onPress={handleLogout}
              style={styles.logoutBtn}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
    alignItems: 'center',
  },
  avatarSection: {
    alignItems: 'center',
    marginVertical: 24,
  },
  imageFrame: {
    width: 120,
    height: 120,
    borderRadius: 60,
    position: 'relative',
    ...SHADOWS.medium,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    resizeMode: 'cover',
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderChar: {
    color: COLORS.white,
    fontSize: 48,
    fontWeight: 'bold',
  },
  editBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: COLORS.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 3,
    borderColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.small,
  },
  uploadText: {
    marginTop: 10,
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  formSection: {
    width: '100%',
    paddingHorizontal: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
    marginTop: 14,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 16,
    height: 52,
    ...SHADOWS.small,
  },
  disabledWrapper: {
    backgroundColor: COLORS.border,
    borderColor: COLORS.border,
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    color: COLORS.text,
    fontSize: 15,
    height: '100%',
  },
  disabledText: {
    color: COLORS.textLight,
    fontSize: 15,
  },
  updateBtn: {
    marginTop: 24,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 24,
  },
  logoutBtn: {
    marginVertical: 0,
  },
});
