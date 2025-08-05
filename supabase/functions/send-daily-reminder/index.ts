import "jsr:@supabase/functions-js/edge-runtime.d.ts";

interface EmailRequest {
  to: string;
  userDisplayName: string;
  currentStreak: number;
  puzzlesCompleted: number;
}

Deno.serve(async (req: Request) => {
  try {
    // Only allow POST requests
    if (req.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    // Parse request body
    const { to, userDisplayName, currentStreak, puzzlesCompleted }: EmailRequest = await req.json();

    // Validate required fields
    if (!to || !userDisplayName) {
      return new Response('Missing required fields: to, userDisplayName', { status: 400 });
    }

    // Get SMTP credentials from environment (Amazon SES SMTP)
    const smtpHost = Deno.env.get('SMTP_HOST') || 'email-smtp.us-east-1.amazonaws.com';
    const smtpPort = Deno.env.get('SMTP_PORT') || '587';
    const smtpUser = Deno.env.get('SMTP_USER'); // AWS SES SMTP username
    const smtpPass = Deno.env.get('SMTP_PASS'); // AWS SES SMTP password
    const fromEmail = Deno.env.get('FROM_EMAIL') || 'no-reply@ladder.game';

    if (!smtpUser || !smtpPass) {
      console.error('Missing SMTP credentials');
      return new Response('Server configuration error', { status: 500 });
    }

    // Create email content
    const subject = `🧩 Your daily Ladder puzzle awaits! (${currentStreak} day streak)`;
    
    const htmlContent = `
      <html>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1a1a1b; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #6aaa64; margin: 0; font-size: 32px;">🧩 LADDER</h1>
          </div>
          
          <div style="background: linear-gradient(135deg, #6aaa64, #5d9556); color: white; padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 30px;">
            <h2 style="margin: 0 0 10px 0; font-size: 24px;">Ready for today's challenge, ${userDisplayName}?</h2>
            <p style="margin: 0; font-size: 16px; opacity: 0.9;">Your daily puzzle is waiting!</p>
          </div>

          <div style="background: #f8f9fa; padding: 25px; border-radius: 8px; margin-bottom: 30px;">
            <div style="display: flex; justify-content: space-around; text-align: center;">
              <div>
                <div style="font-size: 32px; font-weight: bold; color: #6aaa64; margin-bottom: 5px;">${currentStreak}</div>
                <div style="color: #666; font-size: 14px;">Day Streak</div>
              </div>
              <div>
                <div style="font-size: 32px; font-weight: bold; color: #ff8c42; margin-bottom: 5px;">${puzzlesCompleted}</div>
                <div style="color: #666; font-size: 14px;">Total Puzzles</div>
              </div>
            </div>
          </div>

          <div style="text-align: center; margin-bottom: 30px;">
            <a href="https://ladder.game/play" 
               style="background: #6aaa64; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 16px;">
              🚀 Play Today's Puzzle
            </a>
          </div>

          <div style="text-align: center; color: #666; font-size: 12px; border-top: 1px solid #eee; padding-top: 20px;">
            <p>Keep your streak alive! Daily puzzles reset at midnight.</p>
            <p><a href="https://ladder.game/settings" style="color: #6aaa64;">Manage email preferences</a></p>
          </div>
        </body>
      </html>
    `;

    const textContent = `
🧩 LADDER - Your daily puzzle awaits!

Hey ${userDisplayName}!

Ready for today's challenge? Your current streak is ${currentStreak} days and you've completed ${puzzlesCompleted} total puzzles.

Play today's puzzle: https://ladder.game/play

Keep your streak alive! Daily puzzles reset at midnight.

Manage your email preferences: https://ladder.game/settings
    `;

    // Send email using a third-party service (like Resend API for simplicity)
    // We'll use Resend since it's more straightforward for Edge Functions
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    
    if (resendApiKey) {
      // Use Resend API (much simpler)
      const emailResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [to],
          subject: subject,
          html: htmlContent,
          text: textContent
        })
      });

      if (!emailResponse.ok) {
        const errorText = await emailResponse.text();
        console.error('Resend API error:', emailResponse.status, errorText);
        return new Response(`Email API error: ${emailResponse.status}`, { status: 500 });
      }

      const result = await emailResponse.json();
      console.log('Email sent successfully via Resend:', result);

      return new Response(JSON.stringify({ 
        success: true, 
        messageId: result.id,
        message: 'Daily reminder sent successfully',
        provider: 'resend'
      }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Fallback: Log that we would send the email (for testing)
    console.log('Email would be sent to:', to);
    console.log('Subject:', subject);
    console.log('User data:', { userDisplayName, currentStreak, puzzlesCompleted });

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Daily reminder prepared (configure RESEND_API_KEY to send)',
      to,
      subject,
      provider: 'mock'
    }), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error sending daily reminder:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error.message 
      }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
});