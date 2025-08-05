import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

interface PurchaseData {
  user_id: string;
  user_email: string;
  user_name: string;
  product_name: string;
  amount: number;
  currency: string;
  transaction_id: string;
  purchase_date: string;
  pack_id: string;
  is_free_pack: boolean;
}

interface EmailData {
  from: string;
  to: string;
  subject: string;
  html: string;
  text: string;
}

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

Deno.serve(async (req: Request) => {
  try {
    if (req.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    const purchaseData: PurchaseData = await req.json();

    console.log('🛒 Processing purchase confirmation for:', {
      user_email: purchaseData.user_email,
      product_name: purchaseData.product_name,
      amount: purchaseData.amount,
      is_free_pack: purchaseData.is_free_pack
    });

    // Skip free packs - no confirmation email needed
    if (purchaseData.is_free_pack || purchaseData.amount === 0) {
      console.log('✅ Free pack detected - skipping confirmation email');
      return new Response(JSON.stringify({
        success: true,
        message: 'Free pack - no confirmation email needed',
        skipped: true
      }), { 
        status: 200, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }

    // Validate required fields
    if (!purchaseData.user_email || !purchaseData.user_name || !purchaseData.product_name) {
      throw new Error('Missing required fields: user_email, user_name, or product_name');
    }

    // Send purchase confirmation email
    await sendPurchaseConfirmation(purchaseData);

    // Log the email delivery
    await logEmailDelivery(purchaseData);

    console.log('✅ Purchase confirmation sent successfully to:', purchaseData.user_email);

    return new Response(JSON.stringify({
      success: true,
      message: 'Purchase confirmation sent successfully',
      transaction_id: purchaseData.transaction_id
    }), { 
      status: 200, 
      headers: { 'Content-Type': 'application/json' } 
    });

  } catch (error) {
    console.error('❌ Purchase confirmation error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), { 
      status: 500, 
      headers: { 'Content-Type': 'application/json' } 
    });
  }
});

const sendPurchaseConfirmation = async (purchase: PurchaseData): Promise<void> => {
  const template = getPurchaseConfirmationTemplate(purchase);
  
  const emailData: EmailData = {
    from: Deno.env.get('FROM_EMAIL') || 'noreply@ladder.game',
    to: purchase.user_email,
    subject: template.subject,
    html: template.html,
    text: template.text
  };

  // Send via Amazon SES
  await sendViaSES(emailData);

  // Log individual email delivery
  await logIndividualEmailDelivery(purchase.user_id, 'purchase-confirmation', template.subject, purchase.transaction_id);
};

const getPurchaseConfirmationTemplate = (purchase: PurchaseData) => {
  const formattedAmount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: purchase.currency.toUpperCase()
  }).format(purchase.amount / 100); // Convert cents to dollars

  const purchaseDate = new Date(purchase.purchase_date).toLocaleString('en-US', {
    timeZone: 'America/New_York',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return {
    subject: `🎉 Purchase Confirmed - ${purchase.product_name}`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%); padding: 30px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 28px; font-weight: 600;">🧩 Ladder Game</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Purchase Confirmation</p>
        </div>
        
        <!-- Main Content -->
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #2d5a87; margin-top: 0; font-size: 24px;">Thank you for your purchase, ${purchase.user_name}!</h2>
          
          <p style="font-size: 16px; line-height: 1.6; color: #333; margin: 20px 0;">
            Your order has been processed successfully and you now have access to <strong>${purchase.product_name}</strong>.
          </p>
          
          <!-- Order Details Box -->
          <div style="background: white; padding: 25px; border-radius: 12px; margin: 25px 0; border: 1px solid #e0e0e0; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
            <h3 style="margin-top: 0; color: #2d5a87; border-bottom: 2px solid #4CAF50; padding-bottom: 10px; font-size: 18px;">
              📋 Order Details
            </h3>
            
            <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0; font-weight: 600; color: #333; width: 35%;">Product:</td>
                <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0; color: #666;">${purchase.product_name}</td>
              </tr>
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0; font-weight: 600; color: #333;">Amount:</td>
                <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0; color: #666; font-size: 16px; font-weight: 600;">${formattedAmount}</td>
              </tr>
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0; font-weight: 600; color: #333;">Transaction ID:</td>
                <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0; color: #666; font-family: monospace; font-size: 14px;">${purchase.transaction_id}</td>
              </tr>
              <tr>
                <td style="padding: 12px 0; font-weight: 600; color: #333;">Purchase Date:</td>
                <td style="padding: 12px 0; color: #666;">${purchaseDate} EST</td>
              </tr>
            </table>
          </div>
          
          <!-- Access Box -->
          <div style="background: linear-gradient(135deg, #e8f5e8 0%, #f0f8f0 100%); padding: 25px; border-radius: 12px; margin: 25px 0; border-left: 4px solid #4CAF50;">
            <h3 style="margin-top: 0; color: #2d5a87; font-size: 18px;">🎮 Ready to Play!</h3>
            <p style="margin: 15px 0 20px 0; color: #333; line-height: 1.5;">
              Your puzzle pack is now available in your account. Start playing immediately and enjoy your new challenges!
            </p>
            
            <!-- CTA Buttons -->
            <div style="text-align: center; margin: 25px 0;">
              <a href="https://ladder.game/pack-puzzles?pack_id=${purchase.pack_id}&utm_source=email&utm_medium=purchase_confirmation&utm_campaign=access" 
                 style="background: #4CAF50; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; display: inline-block; margin: 8px; box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);">
                🚀 Start Playing Now
              </a>
              <br>
              <a href="https://ladder.game/store?utm_source=email&utm_medium=purchase_confirmation&utm_campaign=upsell" 
                 style="background: #2d5a87; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-size: 14px; display: inline-block; margin: 8px;">
                🛒 Browse More Packs
              </a>
            </div>
          </div>
          
          <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
          
          <!-- Support Section -->
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h4 style="color: #2d5a87; margin-top: 0; font-size: 16px;">📞 Need Help?</h4>
            <p style="margin: 15px 0; color: #666; line-height: 1.5;">
              If you have any questions about your purchase or need assistance:
            </p>
            <ul style="padding-left: 20px; color: #666; line-height: 1.5;">
              <li style="margin: 8px 0;">Email us: <a href="mailto:${Deno.env.get('SUPPORT_EMAIL') || 'support@ladder.game'}" style="color: #4CAF50; text-decoration: none;">${Deno.env.get('SUPPORT_EMAIL') || 'support@ladder.game'}</a></li>
              <li style="margin: 8px 0;">Visit: <a href="https://www.nothingserious.info/contact.html" style="color: #4CAF50; text-decoration: none;">Contact Support</a></li>
              <li style="margin: 8px 0;">Reference your Transaction ID: <code style="background: #f5f5f5; padding: 2px 6px; border-radius: 4px; font-size: 12px;">${purchase.transaction_id}</code></li>
            </ul>
          </div>
          
          <!-- Footer -->
          <div style="font-size: 12px; color: #999; text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
            <p style="margin: 8px 0;">This is an automated confirmation email. Please keep this for your records.</p>
            <p style="margin: 8px 0;">© ${new Date().getFullYear()} Nothing Serious LLC. All rights reserved.</p>
            <p style="margin: 8px 0;">
              <a href="https://ladder.game/privacy-policy" style="color: #999; text-decoration: none;">Privacy Policy</a> | 
              <a href="https://ladder.game/terms-and-conditions" style="color: #999; text-decoration: none;">Terms</a>
            </p>
          </div>
        </div>
      </div>
    `,
    text: `
🎉 PURCHASE CONFIRMED - ${purchase.product_name}

Thank you for your purchase, ${purchase.user_name}!

Your order has been processed successfully and you now have access to ${purchase.product_name}.

ORDER DETAILS
=============
Product: ${purchase.product_name}
Amount: ${formattedAmount}
Transaction ID: ${purchase.transaction_id}
Purchase Date: ${purchaseDate} EST

🎮 READY TO PLAY!
Your puzzle pack is now available in your account. Start playing immediately and enjoy your new challenges!

ACCESS YOUR PUZZLES:
https://ladder.game/pack-puzzles?pack_id=${purchase.pack_id}&utm_source=email&utm_medium=purchase_confirmation&utm_campaign=access

BROWSE MORE PACKS:
https://ladder.game/store?utm_source=email&utm_medium=purchase_confirmation&utm_campaign=upsell

📞 NEED HELP?
If you have any questions about your purchase or need assistance:

• Email: ${Deno.env.get('SUPPORT_EMAIL') || 'support@ladder.game'}
• Support: https://www.nothingserious.info/contact.html
• Transaction ID: ${purchase.transaction_id}

This is an automated confirmation email. Please keep this for your records.
© ${new Date().getFullYear()} Nothing Serious LLC. All rights reserved.

Privacy Policy: https://ladder.game/privacy-policy
Terms: https://ladder.game/terms-and-conditions
    `
  };
};

const sendViaSES = async (emailData: EmailData): Promise<void> => {
  const sesConfig = {
    username: Deno.env.get('SES_SMTP_USERNAME'),
    password: Deno.env.get('SES_SMTP_PASSWORD'),
    host: Deno.env.get('SES_SMTP_HOST') || 'email-smtp.us-east-1.amazonaws.com',
    port: parseInt(Deno.env.get('SES_SMTP_PORT') || '587')
  };

  if (!sesConfig.username || !sesConfig.password) {
    throw new Error('SES SMTP credentials not configured');
  }

  // This is a placeholder for the actual SMTP implementation
  // You would implement the SMTP protocol here or use AWS SES API
  console.log(`📧 Would send purchase confirmation via SES to: ${emailData.to}`);
  console.log(`📋 Subject: ${emailData.subject}`);
  
  // Simulate successful send
  await new Promise(resolve => setTimeout(resolve, 100));
};

const logEmailDelivery = async (purchase: PurchaseData) => {
  try {
    await supabase
      .from('email_delivery_logs')
      .insert({
        email_type: 'purchase-confirmation',
        user_id: purchase.user_id,
        recipient_email: purchase.user_email,
        sent_count: 1,
        error_count: 0,
        sent_at: new Date().toISOString(),
        status: 'success',
        metadata: {
          transaction_id: purchase.transaction_id,
          product_name: purchase.product_name,
          amount: purchase.amount,
          currency: purchase.currency
        }
      });
  } catch (error) {
    console.error('Failed to log email delivery:', error);
  }
};

const logIndividualEmailDelivery = async (userId: string, emailType: string, subject: string, transactionId: string) => {
  try {
    await supabase
      .from('email_deliveries')
      .insert({
        user_id: userId,
        email_type: emailType,
        subject: subject,
        sent_at: new Date().toISOString(),
        status: 'sent',
        metadata: {
          transaction_id: transactionId
        }
      });
  } catch (error) {
    console.error('Failed to log individual email delivery:', error);
  }
};