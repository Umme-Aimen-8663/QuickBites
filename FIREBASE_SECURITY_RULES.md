# Firebase Realtime Database Security Rules

## Rules for QuickBytes App

Paste these rules into your Firebase Console → Realtime Database → Rules tab.

```json
{
  "rules": {
    "orders": {
      "$uid": {
        ".read": "auth.uid == $uid",
        ".write": "auth.uid == $uid",
        "$orderId": {
          ".validate": "newData.hasChildren(['items', 'totalPrice', 'orderTime', 'status'])"
        }
      }
    },
    "favorites": {
      "$uid": {
        ".read": "auth.uid == $uid",
        ".write": "auth.uid == $uid",
        "$itemId": {
          ".validate": "newData.hasChildren(['idMeal', 'strMeal', 'strMealThumb'])"
        }
      }
    },
    ".read": false,
    ".write": false
  }
}
```

## Rules Explanation

### Orders Rules
- **Path**: `orders/{userId}/{orderId}`
- **Read**: Only authenticated users can read their own orders
- **Write**: Only authenticated users can create/update/delete their own orders
- **Validation**: Each order must have `items`, `totalPrice`, `orderTime`, and `status` fields

### Favorites Rules
- **Path**: `favorites/{userId}/{itemId}`
- **Read**: Only authenticated users can read their own favorites
- **Write**: Only authenticated users can add/remove their own favorites
- **Validation**: Each favorite must have `idMeal`, `strMeal`, and `strMealThumb` fields

### Default Rules
- All other paths are blocked by default for security

## How to Apply

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: `labterminal-8bd9b`
3. Navigate to **Realtime Database** → **Rules** tab
4. Replace all existing rules with the rules above
5. Click **Publish**

## Testing the Rules

After deploying, test with:
- ✅ Authenticated user can read/write only their own orders
- ✅ Authenticated user can read/write only their own favorites
- ❌ Unauthenticated user cannot read/write anything
- ❌ User cannot access another user's orders or favorites
