# Stripe Integration Setup Instructions

## 🚀 Quick Setup Guide (2 Hours Total)

### Step 1: Stripe Account Setup (30 minutes)

1. **Create Stripe Account**
   - Go to [stripe.com](https://stripe.com) and create an account
   - Complete business verification
   - Navigate to **Dashboard → Developers → API keys**

2. **Get Your API Keys**
   ```
   Test Keys (for development):
   - Publishable key: pk_test_...
   - Secret key: sk_test_...
   
   Live Keys (for production):
   - Publishable key: pk_live_...
   - Secret key: sk_live_...
   ```

3. **Set Up Webhooks**
   - Go to **Dashboard → Developers → Webhooks**
   - Click **Add endpoint**
   - URL: `https://your-project-id.supabase.co/functions/v1/stripe-webhook`
   - Events to send:
     - `checkout.session.completed`
     - `payment_intent.succeeded`
     - `payment_intent.payment_failed`
     - `checkout.session.expired`
   - Save the **Webhook signing secret** (starts with `whsec_`)

### Step 2: Supabase Environment Variables (5 minutes)

1. **Open Supabase Dashboard**
   - Go to your project → **Settings → Edge Functions**

2. **Add Environment Variables**
   ```bash
   # Add these environment variables:
   STRIPE_SECRET_KEY=sk_test_your_secret_key_here
   STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
   STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
   ```

3. **Save and Deploy**
   - Click **Save** to apply the environment variables

### Step 3: Deploy Edge Functions (10 minutes)

1. **Install Supabase CLI** (if not already installed)
   ```bash
   npm install -g supabase
   ```

2. **Login and Link Project**
   ```bash
   supabase login
   supabase link --project-ref your-project-id
   ```

3. **Deploy Functions**
   ```bash
   # Deploy the Stripe checkout function
   supabase functions deploy create-stripe-checkout
   
   # Deploy the webhook handler
   supabase functions deploy stripe-webhook
   ```

4. **Verify Deployment**
   - Check **Supabase Dashboard → Edge Functions**
   - Both functions should show as deployed

### Step 4: Update Webhook URL (5 minutes)

1. **Get Function URL**
   - In Supabase Dashboard → Edge Functions
   - Copy the URL for `stripe-webhook` function
   - Format: `https://your-project-id.supabase.co/functions/v1/stripe-webhook`

2. **Update Stripe Webhook**
   - Go back to **Stripe Dashboard → Developers → Webhooks**
   - Edit your webhook endpoint
   - Update the URL to your Supabase function URL
   - Save changes

### Step 5: Test the Integration (30 minutes)

1. **Test with Free Products First**
   - Go to your store and claim a free pack
   - Verify it still works as before

2. **Test Stripe Checkout**
   - Try to purchase a paid product
   - Should redirect to Stripe Checkout
   - Use test card: `4242424242424242`
   - Complete the purchase

3. **Verify Purchase Recording**
   - Check Supabase Dashboard → Table Editor → `user_purchases`
   - Should see new purchase with `payment_method: 'stripe'`
   - Check `payment_transactions` table for transaction details

## Test Cards for Development

```
Success: 4242424242424242
Decline: 4000000000000002
Insufficient Funds: 4000000000009995
Requires Authentication: 4000002500003155
```

## Production Setup

### When Ready to Go Live:

1. **Switch to Live Keys**
   ```bash
   # In Supabase Dashboard → Settings → Edge Functions
   STRIPE_SECRET_KEY=sk_live_your_live_secret_key
   STRIPE_PUBLISHABLE_KEY=pk_live_your_live_publishable_key
   ```

2. **Update Webhook for Live Mode**
   - Create new webhook in Stripe for live mode
   - Use same function URL
   - Update `STRIPE_WEBHOOK_SECRET` with live webhook secret

3. **Test with Small Real Transaction**
   - Use a real card with small amount
   - Verify everything works end-to-end

## Troubleshooting

### Common Issues:

1. **"Function not found" error**
   - Check Edge Functions are deployed in Supabase Dashboard
   - Verify function names match exactly

2. **"Unauthorized" error**
   - Check environment variables are set correctly
   - Verify Stripe API keys are valid

3. **Webhook not receiving events**
   - Check webhook URL is correct
   - Verify webhook secret is set properly
   - Check Supabase logs in Dashboard → Logs

4. **Purchase not recorded**
   - Check webhook is receiving events
   - Look at Edge Function logs for errors
   - Verify database permissions

### Debug Commands:

```bash
# View function logs
supabase functions logs stripe-webhook

# Test function locally
supabase functions serve

# Check Edge Function status
supabase status
```

## Security Checklist

- ✅ Never commit API keys to code
- ✅ Use test keys for development
- ✅ Webhook signature verification enabled
- ✅ Row Level Security enabled on tables
- ✅ User authentication required for purchases

## Support

- **Stripe Documentation**: [stripe.com/docs](https://stripe.com/docs)
- **Supabase Edge Functions**: [supabase.com/docs/guides/functions](https://supabase.com/docs/guides/functions)
- **Test in Stripe Dashboard**: Use "Test mode" toggle

---

🎉 **You're all set!** Your LADDER game now accepts real payments through Stripe while maintaining the same smooth user experience for both free and paid content.