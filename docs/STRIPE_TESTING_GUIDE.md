# Stripe Integration Testing Guide

## 🧪 Comprehensive Test Cases

### Pre-Testing Setup
- ✅ Database schema updated with Stripe fields
- ✅ Edge Functions deployed (`create-stripe-checkout`, `stripe-webhook`)
- ✅ Environment variables set in Supabase
- ✅ Webhook endpoint configured in Stripe Dashboard

## Test Scenarios

### 1. Free Product Flow (Should Work Unchanged)
**Test**: Claim Free Pack
- Navigate to Store → Free Pack → Claim Now
- **Expected**: Immediate confirmation, no Stripe involvement
- **Verify**: `user_purchases` table shows `payment_method: 'free_claim'`

### 2. Paid Product - Successful Payment
**Test**: Purchase Complete Pack ($4.99)
- Navigate to Store → Complete Pack → Purchase Now
- **Expected**: 
  - Button shows "Processing..." briefly
  - Redirects to Stripe Checkout
  - Complete payment with test card: `4242424242424242`
  - Returns to confirmation page with "Payment Successful!"
- **Verify**: 
  - `user_purchases` table shows `payment_method: 'stripe'`
  - `payment_transactions` table shows `status: 'succeeded'`
  - User can access purchased content

### 3. Payment Declined
**Test**: Purchase with declined card
- Start purchase flow
- Use declined test card: `4000000000000002`
- **Expected**: 
  - Stripe shows decline message
  - User can retry or cancel
  - No purchase recorded if cancelled
- **Verify**: No records in `user_purchases` for failed payment

### 4. Authentication Required (3D Secure)
**Test**: Test 3D Secure flow
- Use test card: `4000002500003155`
- **Expected**: 
  - Stripe prompts for authentication
  - Complete authentication flow
  - Payment succeeds after authentication
- **Verify**: Purchase recorded with completed status

### 5. Insufficient Funds
**Test**: Test insufficient funds scenario
- Use test card: `4000000000009995`
- **Expected**: 
  - Stripe shows insufficient funds error
  - User can update payment method
  - No purchase recorded
- **Verify**: No erroneous charges or records

### 6. Duplicate Purchase Prevention
**Test**: Try to buy same product twice
- Complete a purchase successfully
- Navigate back to same product
- Try to purchase again
- **Expected**: 
  - "You already own this product!" alert
  - No Stripe checkout initiated
- **Verify**: Only one purchase record exists

### 7. Unauthenticated User
**Test**: Purchase without login
- Sign out
- Try to purchase a paid product
- **Expected**: 
  - "Please sign in to make a purchase" alert
  - Redirected to signup page
  - No Stripe checkout initiated

### 8. Session Expiration
**Test**: Long checkout session
- Start checkout flow
- Wait 24 hours (or set shorter expiry in Stripe Dashboard)
- **Expected**: 
  - Expired session handled gracefully
  - `payment_transactions` marked as `canceled`

### 9. Webhook Failure Recovery
**Test**: Simulate webhook failure
- Temporarily disable webhook in Stripe Dashboard
- Complete a payment
- Re-enable webhook
- **Expected**: 
  - Payment succeeds in Stripe
  - Manual reconciliation may be needed
  - Edge Function logs show webhook attempt

### 10. Network/API Failures
**Test**: Poor network conditions
- Use browser dev tools to simulate slow network
- Start purchase flow
- **Expected**: 
  - Loading states work properly
  - Graceful error handling
  - Button state resets on failure

## Stripe Test Cards

### Basic Test Cards
```
✅ Success (Visa): 4242424242424242
❌ Decline: 4000000000000002
💳 Insufficient Funds: 4000000000009995
🔐 Requires Authentication: 4000002500003155
⚡ Processing Error: 4000000000000119
```

### International Cards
```
🇪🇺 European Card: 4000000000003220
🇬🇧 UK Card: 4000008260003178
🇨🇦 Canadian Card: 4000001240000000
```

### Payment Method Tests
```
💡 Apple Pay Test: 4000000000000077
💡 Google Pay Test: 4000000000000093
💡 SEPA Direct Debit: Use test IBAN: DE89370400440532013000
```

## Testing Checklist

### Before Each Test
- [ ] Clear browser cache/localStorage
- [ ] Start with fresh user session
- [ ] Check Supabase logs are accessible
- [ ] Verify test mode is enabled in Stripe

### During Testing
- [ ] Monitor browser console for errors
- [ ] Check network tab for failed requests
- [ ] Verify button states and loading indicators
- [ ] Test on different screen sizes/devices

### After Each Test
- [ ] Check database records
- [ ] Verify email notifications (if configured)
- [ ] Review Stripe Dashboard for transaction details
- [ ] Check Supabase Edge Function logs

## Debug Tools

### Browser Console Commands
```javascript
// Check current user
await window.supabaseClient.auth.getUser()

// Check user purchases
await window.supabaseClient
  .from('user_purchases')
  .select('*')
  .eq('user_id', 'user-id-here')

// Check payment transactions
await window.supabaseClient
  .from('payment_transactions')
  .select('*')
  .eq('user_id', 'user-id-here')
```

### Supabase Dashboard Checks
1. **Table Editor**: Check `user_purchases` and `payment_transactions`
2. **Logs**: Monitor Edge Function execution
3. **API**: Test function endpoints directly

### Stripe Dashboard Checks
1. **Payments**: See all test transactions
2. **Webhooks**: Check delivery status and retry attempts
3. **Events**: View detailed event logs

## Performance Testing

### Load Testing
- Use multiple browser tabs to simulate concurrent purchases
- Test webhook delivery under load
- Monitor Edge Function response times

### Mobile Testing
- Test on iOS Safari and Chrome
- Verify touch interactions work smoothly
- Check payment flows on small screens

## Error Scenarios

### Expected Error Messages
```
"Please sign in to make a purchase" - Unauthenticated user
"You already own this product!" - Duplicate purchase
"Failed to start checkout process" - API failure
"Product not available for purchase" - Invalid product
```

### Unexpected Errors to Watch For
- White screen after Stripe redirect
- Multiple purchase records for single transaction  
- Purchase recorded but webhook failed
- Button stuck in loading state

## Production Testing

### Pre-Launch Checklist
- [ ] Switch to live Stripe keys
- [ ] Update webhook URL for live mode
- [ ] Test with real card (small amount)
- [ ] Verify live webhook delivery
- [ ] Test refund process (if implemented)

### Go-Live Testing
1. **Small Test Purchase**: $0.01 test with real card
2. **Full Purchase Flow**: Complete $4.99 purchase
3. **Immediate Verification**: Check all systems record purchase
4. **Content Access**: Verify purchased content is accessible

## Monitoring & Alerts

### Key Metrics to Track
- **Payment Success Rate**: >95% expected
- **Webhook Delivery Rate**: >99% expected  
- **Average Checkout Time**: <60 seconds expected
- **Error Rate**: <1% expected

### Alert Conditions
- Payment success rate drops below 90%
- Webhook failures exceed 5 per hour
- Edge Function response time >5 seconds
- Multiple duplicate purchase attempts

---

## 🎯 Success Criteria

**Your Stripe integration is working correctly when:**
- ✅ Free products work exactly as before
- ✅ Paid products redirect to Stripe smoothly
- ✅ All test cards behave as expected
- ✅ Purchases are recorded correctly in database
- ✅ Users get immediate access to purchased content
- ✅ Error states are handled gracefully
- ✅ Duplicate purchases are prevented
- ✅ Webhooks deliver consistently

**Ready for production when all test cases pass! 🚀**