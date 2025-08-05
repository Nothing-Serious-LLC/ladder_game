import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@14.21.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
});

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');
    
    if (!signature) {
      throw new Error('No Stripe signature found');
    }

    // Verify webhook signature
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      Deno.env.get('STRIPE_WEBHOOK_SECRET') || ''
    );

    console.log('Stripe webhook event received:', event.type, 'ID:', event.id);

    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object);
        break;
      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;
      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;
      case 'checkout.session.expired':
        await handleCheckoutExpired(event.data.object);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response('OK', { status: 200 });

  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(`Webhook error: ${error.message}`, { status: 400 });
  }
});

async function handleCheckoutCompleted(session: any) {
  console.log('Processing checkout completion:', session.id);

  const { user_id, product_id, product_name } = session.metadata;

  if (!user_id || !product_id) {
    throw new Error('Missing required metadata in checkout session');
  }

  // Update payment transaction status
  const { error: transactionUpdateError } = await supabase
    .from('payment_transactions')
    .update({
      stripe_payment_intent_id: session.payment_intent,
      status: 'succeeded',
    })
    .eq('stripe_checkout_session_id', session.id);

  if (transactionUpdateError) {
    console.error('Error updating transaction:', transactionUpdateError);
  }

  // Check if purchase already exists (prevent duplicates)
  const { data: existingPurchase } = await supabase
    .from('user_purchases')
    .select('*')
    .eq('user_id', user_id)
    .eq('product_id', product_id)
    .eq('status', 'completed')
    .single();

  if (existingPurchase) {
    console.log('Purchase already exists, skipping duplicate');
    return;
  }

  // Record the purchase
  const { error: purchaseError } = await supabase
    .from('user_purchases')
    .insert({
      user_id,
      product_id,
      product_name: product_name || 'Unknown Product',
      price_cents: session.amount_total,
      payment_method: 'stripe',
      purchase_date: new Date().toISOString(),
      status: 'completed',
      stripe_payment_intent_id: session.payment_intent,
      stripe_checkout_session_id: session.id,
      transaction_id: session.payment_intent,
    });

  if (purchaseError) {
    console.error('Error recording purchase:', purchaseError);
    throw purchaseError;
  }

  console.log('Purchase recorded successfully for user:', user_id, 'product:', product_id);

  // Send purchase confirmation email (if the function exists)
  try {
    await supabase.functions.invoke('send-purchase-confirmation', {
      body: {
        user_email: session.customer_details?.email || session.customer_email,
        user_name: session.customer_details?.name || 'Valued Customer',
        product_name: product_name || 'Puzzle Pack',
        amount: session.amount_total / 100,
        transaction_id: session.payment_intent,
        is_free_pack: false,
      },
    });
    console.log('Purchase confirmation email sent');
  } catch (emailError) {
    console.error('Error sending confirmation email:', emailError);
    // Don't fail the webhook for email errors
  }
}

async function handlePaymentSucceeded(paymentIntent: any) {
  console.log('Payment succeeded:', paymentIntent.id);
  
  // Update transaction status if it exists
  await supabase
    .from('payment_transactions')
    .update({
      status: 'succeeded',
    })
    .eq('stripe_payment_intent_id', paymentIntent.id);
}

async function handlePaymentFailed(paymentIntent: any) {
  console.log('Payment failed:', paymentIntent.id);
  
  // Update transaction status
  await supabase
    .from('payment_transactions')
    .update({
      status: 'failed',
    })
    .eq('stripe_payment_intent_id', paymentIntent.id);
}

async function handleCheckoutExpired(session: any) {
  console.log('Checkout session expired:', session.id);
  
  // Update transaction status
  await supabase
    .from('payment_transactions')
    .update({
      status: 'canceled',
    })
    .eq('stripe_checkout_session_id', session.id);
}