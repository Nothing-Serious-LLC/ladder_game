# Purchase Confirmation Process Documentation

## Overview
The LADDER game implements a complete purchase/claim flow with celebratory confirmation screen and database tracking for both free and paid puzzle packs.

## Purchase Flow Architecture

### 1. **Product Discovery**
Users can discover and purchase packs from multiple entry points:
- **Home Screen**: Store section showing featured packs
- **Store Page**: Full catalog of available packs
- **My Puzzles**: Shows locked packs that can be purchased

### 2. **Product Overview**
When a user clicks on a product, they're taken to `product-overview.html`:
- Displays product details, features, and price
- Shows "Claim" button for free packs, "Purchase" for paid packs
- Checks if user already owns the product

### 3. **Purchase/Claim Process**

#### **Authentication Check**
```javascript
// In product-overview.html
const { data: { user } } = await window.supabaseClient.auth.getUser();
if (!user) {
    alert('Please sign in to make a purchase');
    window.location.href = './signup.html';
    return;
}
```

#### **Duplicate Purchase Prevention**
```javascript
// Check if already owned
const { data: existingPurchase } = await window.supabaseClient
    .from('user_purchases')
    .select('*')
    .eq('user_id', user.id)
    .eq('product_id', productId)
    .single();

if (existingPurchase) {
    alert('You already own this product!');
    return;
}
```

#### **Database Recording**
```javascript
// Record the purchase
const { error: purchaseError } = await window.supabaseClient
    .from('user_purchases')
    .insert({
        user_id: user.id,
        product_id: productId,
        purchase_date: new Date().toISOString(),
        price_paid: product.price === 'Free' ? 0 : parseFloat(product.price.replace('$', ''))
    });
```

### 4. **Navigation to Confirmation**
After successful database recording:
1. Page fades out with animation
2. Navigates to `purchase-confirmation.html` with parameters:
   - `item`: Product name
   - `price`: Product price
   - `description`: Product description
   - `product`: Product ID (for navigation)
   - `from`: Source page (optional)

### 5. **Confirmation Screen Features**

#### **Visual Elements**
- Animated SVG checkmark icon
- Confetti animation (50 colored pieces)
- Clean, celebratory design
- Responsive layout

#### **Dynamic Content**
The confirmation screen adapts based on the purchased product:
```javascript
// Infers product type from item name if product ID missing
if (itemName.toLowerCase().includes('free pack')) {
    productId = 'free-pack';
}

// Sets appropriate navigation
if (productId === 'free-pack' || productId === 'complete-pack' || productId === 'puzzle-pack') {
    startPlayingBtn.href = `./pack-puzzles.html?pack=${productId}`;
}
```

#### **User Actions**
- **"Start Playing"**: Takes user directly to their puzzle pack
- **"Back to Home"**: Returns to home screen

## Database Schema

### `user_purchases` Table
```sql
- user_id (UUID): References auth.users
- product_id (TEXT): Product identifier (e.g., 'free-pack')
- purchase_date (TIMESTAMP): When purchased
- price_paid (DECIMAL): Amount paid (0 for free items)
```

### `puzzle_packs` Table
```sql
- id (TEXT): Unique identifier
- name (TEXT): Display name
- description (TEXT): Pack description
- total_puzzles (INTEGER): Number of puzzles
- price_cents (INTEGER): Price in cents
```

## UI Updates After Purchase

### 1. **Home Screen**
- "My Puzzles" section shows purchased packs
- Progress bars display completion status
- Store items show as "Owned"

### 2. **My Puzzles Screen**
- Pack cards change from locked to unlocked
- Shows completion progress
- Enables navigation to pack puzzles

### 3. **Store Screen**
- Purchased items show "Owned" button
- Button is disabled and styled differently
- Items sorted with owned at bottom

## Error Handling

### **Network Errors**
- Alert shown to user
- Purchase not processed
- User remains on product overview

### **Authentication Errors**
- Redirect to signup page
- Clear messaging about sign-in requirement

### **Duplicate Purchase**
- Alert: "You already own this product!"
- No database transaction
- User remains on current page

## Future Payment Integration

The system is designed to easily integrate with payment providers:

### **Stripe Integration Point**
```javascript
// Future enhancement in purchaseProduct()
if (product.price !== 'Free') {
    const paymentResult = await processStripePayment({
        amount: product.price,
        productId: productId,
        userId: user.id
    });
    
    if (!paymentResult.success) {
        return; // Don't record purchase
    }
}
```

### **Apple/Google In-App Purchases**
```javascript
// For mobile app versions
if (window.cordova && product.price !== 'Free') {
    const iapResult = await processInAppPurchase(productId);
    // Similar flow
}
```

## Testing the Flow

### **Free Pack Test**
1. Navigate to Store
2. Click "Free Pack"
3. Click "Claim"
4. See confirmation with confetti
5. Click "Start Playing"
6. Arrives at pack puzzles screen

### **URL Parameters**
Test confirmation screen directly:
```
/screens/purchase-confirmation.html?item=Free+Pack&price=Free&description=10+starter+puzzles
```

## Security Considerations

1. **Server-side validation** needed for production
2. **Payment webhook handlers** for Stripe/PayPal
3. **Receipt validation** for mobile IAP
4. **Row Level Security** on user_purchases table

## Styling Guidelines

### **Button Styles**
- Primary (green): Main actions like "Start Playing"
- Secondary (white): Alternative actions like "Back to Home"
- Consistent padding and border radius
- Subtle hover effects without complex animations

### **Color Palette**
- Success: `#6aaa64` (green)
- Hover: `#538d4e` (darker green)
- Text: `#1a1a1b` (near black)
- Borders: `#d3d6da` (light gray)

## Performance Optimizations

1. **Fade animations**: 300ms for smooth transitions
2. **Confetti cleanup**: Auto-removes after 5 seconds
3. **Service Worker caching**: All screens cached for offline shell
4. **Lazy loading**: Sounds only load if available

This purchase confirmation system provides a delightful user experience while maintaining data integrity and preparing for future monetization features.