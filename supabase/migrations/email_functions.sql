-- Create email functions for Ladder game
-- These functions will call our Edge Functions to send emails

-- Function to send daily reminder emails
CREATE OR REPLACE FUNCTION send_daily_reminder_email(
  user_email TEXT,
  user_display_name TEXT,
  current_streak INTEGER DEFAULT 0,
  puzzles_completed INTEGER DEFAULT 0
) RETURNS JSON AS $$
DECLARE
  result JSON;
  function_url TEXT;
BEGIN
  -- Get the function URL from environment or use default
  function_url := current_setting('app.settings.supabase_url', true) || '/functions/v1/send-daily-reminder';
  
  -- Call the Edge Function using pg_net
  SELECT INTO result
    net.http_post(
      url := function_url,
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
      ),
      body := jsonb_build_object(
        'to', user_email,
        'userDisplayName', user_display_name,
        'currentStreak', current_streak,
        'puzzlesCompleted', puzzles_completed
      )
    );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to send purchase confirmation emails
CREATE OR REPLACE FUNCTION send_purchase_confirmation_email(
  user_email TEXT,
  user_display_name TEXT,
  purchase_item TEXT,
  purchase_amount TEXT,
  purchase_date TEXT DEFAULT NULL,
  transaction_id TEXT DEFAULT NULL
) RETURNS JSON AS $$
DECLARE
  result JSON;
  function_url TEXT;
BEGIN
  -- Get the function URL from environment or use default
  function_url := current_setting('app.settings.supabase_url', true) || '/functions/v1/send-purchase-confirmation';
  
  -- Call the Edge Function using pg_net
  SELECT INTO result
    net.http_post(
      url := function_url,
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
      ),
      body := jsonb_build_object(
        'to', user_email,
        'userDisplayName', user_display_name,
        'purchaseItem', purchase_item,
        'purchaseAmount', purchase_amount,
        'purchaseDate', COALESCE(purchase_date, NOW()::TEXT),
        'transactionId', transaction_id
      )
    );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to queue daily reminders for all active users
CREATE OR REPLACE FUNCTION queue_daily_reminders() RETURNS INTEGER AS $$
DECLARE
  user_record RECORD;
  emails_queued INTEGER := 0;
  user_stats RECORD;
BEGIN
  -- Loop through all users who have email confirmation and want daily reminders
  FOR user_record IN
    SELECT 
      u.id,
      u.email,
      COALESCE(p.display_name, split_part(u.email, '@', 1)) as display_name
    FROM auth.users u
    LEFT JOIN profiles p ON p.id = u.id
    WHERE 
      u.email_confirmed_at IS NOT NULL
      AND u.email IS NOT NULL
      AND u.deleted_at IS NULL
      -- Add any additional conditions for users who want daily reminders
      -- For example: AND p.daily_reminders_enabled = true
  LOOP
    -- Get user stats
    SELECT 
      COALESCE(ds.current_streak, 0) as current_streak,
      COALESCE(ds.total_puzzles_completed, 0) as puzzles_completed
    INTO user_stats
    FROM daily_stats ds
    WHERE ds.user_id = user_record.id
    ORDER BY ds.date DESC
    LIMIT 1;
    
    -- Queue the daily reminder
    PERFORM send_daily_reminder_email(
      user_record.email,
      user_record.display_name,
      COALESCE(user_stats.current_streak, 0),
      COALESCE(user_stats.puzzles_completed, 0)
    );
    
    emails_queued := emails_queued + 1;
  END LOOP;
  
  RETURN emails_queued;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to send purchase confirmations automatically
CREATE OR REPLACE FUNCTION trigger_purchase_confirmation() RETURNS TRIGGER AS $$
DECLARE
  user_email TEXT;
  user_name TEXT;
BEGIN
  -- Get user email and name
  SELECT 
    u.email,
    COALESCE(p.display_name, split_part(u.email, '@', 1))
  INTO user_email, user_name
  FROM auth.users u
  LEFT JOIN profiles p ON p.id = u.id
  WHERE u.id = NEW.user_id;
  
  -- Send purchase confirmation if we have the user's email
  IF user_email IS NOT NULL THEN
    PERFORM send_purchase_confirmation_email(
      user_email,
      user_name,
      NEW.item_name,
      '$' || NEW.amount::TEXT,
      NEW.created_at::TEXT,
      NEW.id::TEXT
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply the trigger to user_purchases table (if it exists)
-- Uncomment and modify this based on your actual purchase table structure
/*
DROP TRIGGER IF EXISTS purchase_confirmation_trigger ON user_purchases;
CREATE TRIGGER purchase_confirmation_trigger
  AFTER INSERT ON user_purchases
  FOR EACH ROW EXECUTE FUNCTION trigger_purchase_confirmation();
*/

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION send_daily_reminder_email(TEXT, TEXT, INTEGER, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION send_purchase_confirmation_email(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION queue_daily_reminders() TO service_role;

-- Create a scheduled job to send daily reminders (using pg_cron if available)
-- Uncomment this if you have pg_cron enabled
/*
SELECT cron.schedule(
  'daily-reminders',
  '0 9 * * *', -- Every day at 9 AM
  $$SELECT queue_daily_reminders();$$
);
*/