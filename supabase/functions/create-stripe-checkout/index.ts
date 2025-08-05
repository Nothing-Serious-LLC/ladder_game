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

// CORS headers for frontend integration
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface CheckoutRequest {
  product_id: string;
  success_url: string;
  cancel_url: string;
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { 
      status: 405,
      headers: corsHeaders 
    });
  }

  try {
    // Get user from auth header
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const { product_id, success_url, cancel_url }: CheckoutRequest = await req.json();

    console.log('Creating Stripe checkout for user:', user.id, 'product:', product_id);

    // Get product details from database
    const { data: product, error: productError } = await supabase
      .from('puzzle_packs')
      .select('*')
      .eq('id', product_id)
      .single();

    if (productError || !product) {
      throw new Error(`Product not found: ${product_id}`);
    }

    // Don't create checkout for free products
    if (product.price_cents === 0) {
      throw new Error('Cannot create Stripe checkout for free products');
    }

    // Check if user already owns this product
    const { data: existingPurchase } = await supabase
      .from('user_purchases')
      .select('*')
      .eq('user_id', user.id)
      .eq('product_id', product_id)
      .eq('status', 'completed')
      .single();

    if (existingPurchase) {
      throw new Error('Product already owned');
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: product.name,
              description: product.description,
              images: [], // You can add product images here later
            },
            unit_amount: product.price_cents,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: success_url,
      cancel_url: cancel_url,
      metadata: {
        user_id: user.id,
        product_id: product_id,
        product_name: product.name,
      },
      customer_email: user.email,
      billing_address_collection: 'auto',
      // Enable automatic tax calculation if you have it set up
      // automatic_tax: { enabled: true },
    });

    console.log('Stripe checkout session created:', session.id);

    // Record the pending transaction
    const { error: transactionError } = await supabase
      .from('payment_transactions')
      .insert({
        user_id: user.id,
        stripe_checkout_session_id: session.id,
        amount_cents: product.price_cents,
        status: 'pending',
        product_id: product_id,
      });

    if (transactionError) {
      console.error('Error recording transaction:', transactionError);
      // Don't fail the checkout creation, but log the error
    }

    return new Response(JSON.stringify({
      checkout_url: session.url,
      session_id: session.id,
    }), {
      headers: { 
        'Content-Type': 'application/json',
        ...corsHeaders 
      },
    });

  } catch (error) {
    console.error('Stripe checkout error:', error);
    return new Response(JSON.stringify({
      error: error.message,
    }), {
      status: 400,
      headers: { 
        'Content-Type': 'application/json',
        ...corsHeaders 
      },
    });
  }
});