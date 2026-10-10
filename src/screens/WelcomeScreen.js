import React from 'react';
import { View, Text, StyleSheet, ImageBackground, StatusBar, Dimensions } from 'react-native';
import { COLORS } from '../constants/theme';
import CustomButton from '../components/CustomButton';

const { height } = Dimensions.get('window');

export default function WelcomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <ImageBackground
        source={{ uri: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&q=80&w=1000' }}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={styles.overlay}>
          {/* Brand Logo and Title */}
          <View style={styles.brandContainer}>
            <Text style={styles.taglineAccent}>QUICKBITE</Text>
            <Text style={styles.titleText}>Fresh & Delicious Meals</Text>
            <Text style={styles.subtitleText}>
              Satisfy your cravings with fast food delivery from your favorite local restaurants.
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionContainer}>
            <CustomButton
              title="Get Started"
              variant="primary"
              onPress={() => navigation.navigate('Signup')}
              style={styles.btn}
            />
            <CustomButton
              title="I Already Have an Account"
              variant="outline"
              onPress={() => navigation.navigate('Login')}
              style={[styles.btn, styles.outlineBtn]}
              textStyle={styles.outlineBtnText}
            />
          </View>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    height: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: height * 0.15,
    paddingBottom: height * 0.08,
  },
  brandContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  taglineAccent: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 4,
    marginBottom: 10,
  },
  titleText: {
    color: COLORS.white,
    fontSize: 34,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 42,
  },
  subtitleText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 15,
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 22,
    paddingHorizontal: 12,
  },
  actionContainer: {
    width: '100%',
  },
  btn: {
    marginVertical: 6,
  },
  outlineBtn: {
    borderColor: COLORS.white,
    borderWidth: 1.5,
  },
  outlineBtnText: {
    color: COLORS.white,
  },
});
