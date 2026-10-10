# QuickBytes Deployment & Setup Guide

## 🎯 Pre-Deployment Checklist

### 1. Firebase Project Configuration

Your Firebase project is already configured with:
- **Project ID**: `labterminal-8bd9b`
- **Region**: `asia-southeast1`
- **Auth Methods**: Email/Password authentication
- **Database**: Realtime Database

#### Apply Security Rules
1. Open [Firebase Console](https://console.firebase.google.com)
2. Go to **Realtime Database** → **Rules**
3. Copy the rules from [FIREBASE_SECURITY_RULES.md](FIREBASE_SECURITY_RULES.md)
4. Replace existing rules and click **Publish**

### 2. Dependencies Installation

All required packages are listed in `package.json`. To install:

```bash
npm install
# or
yarn install
```

Alternatively, Expo CLI handles this automatically when you start the project.

### 3. Environment Configuration

Your Firebase config is already embedded in [src/firebase/config.js](src/firebase/config.js) with:
- API Key
- Auth Domain  
- Database URL
- Project ID
- Storage Bucket
- App ID

**No environment file needed** - credentials are securely embedded and read-only from client.

---

## 🚀 Running the App

### Development Mode

#### Expo Web (Recommended for testing)
```bash
npm start
# Press 'w' for web, or open http://localhost:19006 in browser
```

#### Android (requires Android Studio/Emulator)
```bash
npm run android
# or
expo start --android
```

#### iOS (requires Xcode/Simulator, macOS only)
```bash
npm run ios
# or
expo start --ios
```

### Production Build

For production, use Expo's build service:

```bash
# Install Expo CLI if not already
npm install -g eas-cli

# Configure your Expo account
eas build:configure

# Build for production
eas build --platform android --release
eas build --platform ios --release

# Or both platforms
eas build --platform all --release
```

---

## 🧪 Testing Scenarios

### Test 1: User Registration & Login
```
1. Open app → Welcome screen
2. Click "Sign Up"
3. Enter: 
   - Full Name: "Test User"
   - Email: "test@example.com"
   - Password: "password123"
4. Click "Create Account"
5. ✅ Should see "Account Created Successfully!" alert
6. Auto-redirect to Login screen
7. Enter email & password and click "Log In"
8. ✅ Should redirect to Dashboard
```

### Test 2: Browse Food Items
```
1. From Dashboard, see food categories (Chicken, Beef, Dessert, etc.)
2. Click different categories
3. ✅ Food list should update
4. Click "See All" → Explore screen
5. Search for "pizza"
6. ✅ Results should appear
7. Click a food item → Details screen
```

### Test 3: Add to Favorites
```
1. On any food card, click heart icon
2. ✅ Should show "Added to Favorites!" alert
3. Go to Favorites tab
4. ✅ Item should appear in favorites list
5. Click heart again to remove
6. ✅ Should show "Removed from favorites" alert
```

### Test 4: Add to Cart & Checkout
```
1. Open Food Details
2. Click "+" to increase quantity
3. Click "Add to Cart"
4. ✅ Should show "Added to Cart! 🛒" alert
5. Click "View Cart"
6. ✅ See item in cart with total price
7. Click "Confirm & Place Order"
8. ✅ Should see success alert with order details
9. Click "View Orders" → Orders tab
10. ✅ Order should appear in list with status "Pending"
```

### Test 5: Profile Management
```
1. Go to Profile tab
2. Click camera icon to upload photo
3. Select an image from device
4. ✅ Photo should update
5. Edit "Full Name" field
6. Click "Update Profile"
7. ✅ Should show "Profile updated successfully!"
8. Logout and login again
9. ✅ Profile changes should persist
```

### Test 6: Logout
```
1. From Dashboard/Profile, click logout button
2. Confirm logout
3. ✅ Should redirect to Login screen
4. App state should reset
```

### Test 7: Offline Order Placement (Network Error)
```
1. Add items to cart
2. Disable network connection
3. Try to place order
4. ✅ Should save order locally with "Offline Saved" status
5. Enable network
6. Navigate to Orders tab
7. ✅ Order should remain visible with local backup indicator
```

---

## 🛠️ Troubleshooting

### Issue: "Firebase app not initialized"
**Solution**: Clear app cache/data and restart. The app auto-initializes Firebase on first run.

### Issue: "User can't log in"
**Solution**: 
- Verify user was registered in Firebase (check Firebase Console → Authentication)
- Ensure password is at least 6 characters
- Check internet connection

### Issue: "Orders not saving to Firebase"
**Solution**:
- Verify auth user is logged in (check `auth.currentUser`)
- Check Firebase Realtime Database rules are published
- Verify network connection
- Check browser console for error messages

### Issue: "Photos not uploading"
**Solution**:
- Grant camera/photo library permissions when prompted
- Ensure AsyncStorage is working (usually auto-configured with Expo)
- Try clearing app cache

### Issue: "App crashes on startup"
**Solution**:
- Run `npm install` to ensure all dependencies installed
- Clear node_modules: `rm -rf node_modules && npm install`
- Restart Expo: `Ctrl+C` and `npm start` again
- Check console for specific error messages

### Issue: "Favorites not persisting"
**Solution**:
- Favorites are stored in Firebase + AsyncStorage cache
- Ensure you're logged in (check auth state)
- Check Firebase Realtime Database rules for `favorites` path
- Clear AsyncStorage cache: `npx expo-sqlite-clean-database`

---

## 📱 Device Testing

### Android Physical Device
1. Install Expo Go app from Google Play
2. Run `npm start`
3. Scan QR code with phone camera
4. Opens in Expo Go
5. Test app on real device

### iOS Physical Device
1. Install Expo Go from App Store
2. Run `npm start`
3. Scan QR code with phone
4. Opens in Expo Go
5. Test app on real device

### Web Testing
1. Run `npm start`
2. Press 'w' for web
3. Opens in browser at `http://localhost:19006`
4. Test responsive design

---

## 📊 Monitoring & Analytics

### View Firebase Logs
```
Go to Firebase Console → Realtime Database → Data
View user orders, favorites, and data structure in real-time
```

### Check App Performance
```
Desktop: Open Chrome DevTools (F12) → Console tab for errors
Mobile: Use Expo DevTools overlay (shake device or Ctrl+D)
```

---

## 🔐 Security Notes

✅ **What's Secure:**
- Firebase credentials are app-specific API keys (not admin keys)
- Users can only access their own data (enforced by security rules)
- Passwords stored securely by Firebase Auth
- Session persists across app restarts using AsyncStorage

⚠️ **Important:**
- Never share Firebase API key with untrusted parties
- Always use HTTPS for production (Expo handles this)
- Keep npm dependencies updated
- Review Firebase security rules before production launch

---

## 🚨 Production Deployment Checklist

Before going live:

- [ ] Run `npm run build` to check for build errors
- [ ] Test on both Android and iOS devices
- [ ] Enable Firebase security rules
- [ ] Set up Firebase backup & disaster recovery
- [ ] Configure Firebase authentication to use production domain
- [ ] Test all critical user flows end-to-end
- [ ] Monitor Firebase usage (check quotas)
- [ ] Set up error tracking (Firebase Crashlytics optional)
- [ ] Test API calls from production domain
- [ ] Prepare user documentation

---

## 📞 Support Resources

- **Expo Docs**: https://docs.expo.dev/versions/v54.0.0/
- **React Native Docs**: https://reactnative.dev/
- **Firebase Docs**: https://firebase.google.com/docs/
- **Navigation**: https://reactnavigation.org/docs/

---

## 🎉 Launch Complete!

Your QuickBytes app is now ready for production deployment. Follow this guide to deploy, test, and monitor your application successfully.

**Questions or Issues?** Refer to the troubleshooting section or check individual feature documentation in the source code comments.

---

Generated: May 21, 2026
QuickBytes v1.0.0
