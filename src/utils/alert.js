import { Alert, Platform } from 'react-native';

/**
 * A platform-safe Alert helper that works on Android, iOS, and Web.
 */
export const customAlert = (title, message, buttons = []) => {
  if (Platform.OS === 'web') {
    // If buttons array is empty or has only one "OK" or basic style button
    if (!buttons || buttons.length === 0) {
      window.alert(`${title}\n\n${message}`);
      return;
    }

    // Check if there is a confirm/action style button
    const confirmBtn = buttons.find(
      btn => btn.style === 'destructive' || 
             ['Remove', 'Sign Out', 'Clear All', 'Delete', 'Log Out', 'Confirm & Place Order', 'Confirm', 'Place Order', 'Yes', 'OK'].includes(btn.text)
    );

    if (confirmBtn) {
      const confirmed = window.confirm(`${title}\n\n${message}`);
      if (confirmed && typeof confirmBtn.onPress === 'function') {
        confirmBtn.onPress();
      } else {
        // Find cancel button and run its onPress if user cancelled
        const cancelBtn = buttons.find(btn => btn.style === 'cancel');
        if (cancelBtn && typeof cancelBtn.onPress === 'function') {
          cancelBtn.onPress();
        }
      }
    } else {
      // Just a standard dialog with options
      window.alert(`${title}\n\n${message}`);
      // Run first non-cancel button onPress if exists
      const actionBtn = buttons.find(btn => btn.style !== 'cancel');
      if (actionBtn && typeof actionBtn.onPress === 'function') {
        actionBtn.onPress();
      }
    }
  } else {
    Alert.alert(title, message, buttons);
  }
};
