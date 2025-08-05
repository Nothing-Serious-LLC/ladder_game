import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

interface User {
  id: string;
  email: string;
  display_name: string;
  current_streak: number;
  last_login: string;
  email_preferences: {
    daily_reminders: boolean;
    preferred_time: string;
    timezone: string;
  };
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
    // Only allow POST requests
    if (req.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    console.log('🌅 Starting daily reminder job at', new Date().toISOString());

    // Get all users who should receive reminders
    const { data: users, error } = await supabase
      .from('profiles')
      .select(`
        id, email, display_name, current_streak, last_login,
        email_preferences
      `)
      .eq('email_preferences->daily_reminders', true)
      .gte('last_login', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()) // Active within 7 days
      .not('email', 'is', null);

    if (error) {
      console.error('❌ Error fetching users:', error);
      return new Response(JSON.stringify({ 
        success: false, 
        error: error.message 
      }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log(`📧 Sending daily reminders to ${users?.length || 0} users`);

    let successCount = 0;
    let errorCount = 0;

    // Send emails to all eligible users
    for (const user of users || []) {
      try {
        await sendReminderEmail(user);
        successCount++;
        
        // Rate limiting: wait 100ms between emails to avoid overwhelming SES
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.error(`❌ Failed to send reminder to ${user.email}:`, error);
        errorCount++;
      }
    }

    // Log delivery tracking
    await logEmailDelivery('daily-reminder', successCount, errorCount);

    console.log(`✅ Daily reminder job complete: ${successCount} sent, ${errorCount} failed`);

    return new Response(JSON.stringify({
      success: true,
      message: `Daily reminders sent successfully`,
      stats: {
        total_users: users?.length || 0,
        emails_sent: successCount,
        errors: errorCount
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Daily reminder job failed:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});

const sendReminderEmail = async (user: User): Promise<void> => {
  const template = getDailyReminderTemplate(user);
  
  const emailData: EmailData = {
    from: Deno.env.get('FROM_EMAIL') || 'noreply@ladder.game',
    to: user.email,
    subject: template.subject,
    html: template.html,
    text: template.text
  };

  // Send via Amazon SES SMTP (simplified implementation)
  await sendViaSES(emailData);
  
  // Log individual email delivery
  await logIndividualEmailDelivery(user.id, 'daily-reminder', emailData.subject);
};

const getDailyReminderTemplate = (user: User) => {
  const motivationalMessages = [
    "Ready for today's challenge?",
    "Your brain is warmed up and ready!",
    "Time to climb that word ladder!",
    "Let's keep that streak alive!",
    "Today's puzzle is waiting for you!",
    "Challenge your mind today!",
    "Ready to solve another puzzle?",
    "Your daily brain workout awaits!"
  ];

  const randomMessage = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];
  const streakEmoji = user.current_streak > 0 ? '🔥' : '✨';
  const currentStreak = user.current_streak || 0;
  
  return {
    subject: `🧩 ${randomMessage} - Day ${currentStreak + 1}`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%); padding: 30px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 28px; font-weight: 600;">🧩 Ladder Game</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Daily Puzzle Reminder</p>
        </div>
        
        <!-- Main Content -->
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #2d5a87; margin-top: 0; font-size: 24px;">Good morning, ${user.display_name}!</h2>
          
          <p style="font-size: 16px; line-height: 1.6; color: #333; margin: 20px 0;">
            ${randomMessage} Your current streak is <strong style="color: #4CAF50;">${currentStreak} days</strong> ${streakEmoji}
          </p>
          
          <!-- Challenge Box -->
          <div style="background: white; padding: 25px; border-radius: 12px; margin: 25px 0; border-left: 4px solid #4CAF50; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <h3 style="margin-top: 0; color: #2d5a87; font-size: 20px;">Today's Challenge Awaits</h3>
            <p style="margin: 15px 0; color: #666; line-height: 1.5;">
              Start your day with a quick brain workout. Each puzzle takes just 2-3 minutes and helps keep your mind sharp!
            </p>
            ${currentStreak > 0 ? `
            <div style="background: #e8f5e8; padding: 15px; border-radius: 8px; margin: 15px 0;">
              <p style="margin: 0; color: #2d5a87; font-weight: 500;">
                🔥 Keep your ${currentStreak}-day streak going strong!
              </p>
            </div>
            ` : ''}
          </div>
          
          <!-- CTA Button -->
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://ladder.game/play?utm_source=email&utm_medium=daily_reminder&utm_campaign=engagement" 
               style="background: #4CAF50; color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; display: inline-block; box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3); transition: all 0.3s ease;">
              🚀 Play Today's Puzzle
            </a>
          </div>
          
          <!-- Quick Stats (if user has streak) -->
          ${currentStreak > 0 ? `
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 25px 0; text-align: center;">
            <h4 style="margin: 0 0 15px 0; color: #2d5a87;">Your Progress</h4>
            <div style="display: inline-block; margin: 0 15px;">
              <div style="font-size: 24px; font-weight: 600; color: #4CAF50;">${currentStreak}</div>
              <div style="font-size: 14px; color: #666;">Day Streak</div>
            </div>
          </div>
          ` : ''}
          
          <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
          
          <!-- Footer -->
          <div style="font-size: 14px; color: #666; text-align: center;">
            <p style="margin: 15px 0;">
              Don't want daily reminders? 
              <a href="https://ladder.game/settings?utm_source=email" style="color: #4CAF50; text-decoration: none;">Update your preferences</a>
            </p>
            <p style="margin: 15px 0;">
              <a href="https://ladder.game/unsubscribe?email=${encodeURIComponent(user.email)}" style="color: #999; text-decoration: none; font-size: 12px;">Unsubscribe</a>
            </p>
          </div>
        </div>
      </div>
    `,
    text: `
Good morning, ${user.display_name}!

${randomMessage} Your current streak is ${currentStreak} days ${streakEmoji}

TODAY'S CHALLENGE AWAITS
========================
Start your day with a quick brain workout. Each puzzle takes just 2-3 minutes and helps keep your mind sharp!

${currentStreak > 0 ? `🔥 Keep your ${currentStreak}-day streak going strong!\n` : ''}

Play Today's Puzzle: https://ladder.game/play?utm_source=email&utm_medium=daily_reminder&utm_campaign=engagement

YOUR PROGRESS
${currentStreak > 0 ? `Current Streak: ${currentStreak} days` : 'Start your first streak today!'}

---
Don't want daily reminders? Update your preferences: https://ladder.game/settings
Unsubscribe: https://ladder.game/unsubscribe?email=${encodeURIComponent(user.email)}

Happy puzzling!
The Ladder Game Team
    `
  };
};

const sendViaSES = async (emailData: EmailData): Promise<void> => {
  // For now, we'll use a simplified approach
  // In production, you would implement proper SMTP or use AWS SES SDK
  
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
  console.log(`📧 Would send email via SES to: ${emailData.to}`);
  console.log(`📋 Subject: ${emailData.subject}`);
  
  // Simulate successful send
  await new Promise(resolve => setTimeout(resolve, 50));
};

const logEmailDelivery = async (emailType: string, successCount: number, errorCount: number) => {
  try {
    await supabase
      .from('email_delivery_logs')
      .insert({
        email_type: emailType,
        sent_count: successCount,
        error_count: errorCount,
        sent_at: new Date().toISOString(),
        status: errorCount > 0 ? 'partial_success' : 'success'
      });
  } catch (error) {
    console.error('Failed to log email delivery:', error);
  }
};

const logIndividualEmailDelivery = async (userId: string, emailType: string, subject: string) => {
  try {
    await supabase
      .from('email_deliveries')
      .insert({
        user_id: userId,
        email_type: emailType,
        subject: subject,
        sent_at: new Date().toISOString(),
        status: 'sent'
      });
  } catch (error) {
    console.error('Failed to log individual email delivery:', error);
  }
};