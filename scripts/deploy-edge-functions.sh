#!/bin/bash

# Deploy Edge Functions for Email System - Ladder Game
# This script deploys the daily reminder and purchase confirmation Edge Functions

echo "🚀 Deploying Edge Functions for Email System..."

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Please install it first:"
    echo "npm install -g supabase"
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "supabase/functions/send-daily-reminders/index.ts" ]; then
    echo "❌ Edge Function files not found. Make sure you're in the project root directory."
    exit 1
fi

echo "📧 Deploying send-daily-reminders function..."
supabase functions deploy send-daily-reminders --project-ref btonnmoeaandberyszsm

if [ $? -eq 0 ]; then
    echo "✅ send-daily-reminders deployed successfully"
else
    echo "❌ Failed to deploy send-daily-reminders"
    exit 1
fi

echo "📧 Deploying send-purchase-confirmation function..."
supabase functions deploy send-purchase-confirmation --project-ref btonnmoeaandberyszsm

if [ $? -eq 0 ]; then
    echo "✅ send-purchase-confirmation deployed successfully"
else
    echo "❌ Failed to deploy send-purchase-confirmation"
    exit 1
fi

echo ""
echo "🎉 All Edge Functions deployed successfully!"
echo ""
echo "📋 Next Steps:"
echo "1. Set environment variables in Supabase Dashboard:"
echo "   - SES_SMTP_USERNAME"
echo "   - SES_SMTP_PASSWORD"
echo "   - SES_SMTP_HOST"
echo "   - FROM_EMAIL"
echo "   - SUPPORT_EMAIL"
echo ""
echo "2. Test the functions:"
echo "   curl -X POST 'https://btonnmoeaandberyszsm.supabase.co/functions/v1/send-daily-reminders' \\"
echo "        -H 'Authorization: Bearer YOUR_SERVICE_ROLE_KEY' \\"
echo "        -H 'Content-Type: application/json' \\"
echo "        -d '{}'"
echo ""
echo "3. Monitor the daily cron job in Supabase logs"