# Amazon SES Setup Guide for Ladder Game

## 📧 AWS SES Configuration Steps

### 1. Create AWS Account and Access SES
1. Go to [AWS Console](https://console.aws.amazon.com/)
2. Navigate to **Simple Email Service (SES)**
3. Select your preferred region (us-east-1 recommended)

### 2. Verify Your Domain/Email
```bash
# Option A: Verify your domain (recommended)
Domain: ladder.game (or your actual domain)

# Option B: Verify individual email address
Email: no-reply@yourdomain.com
```

### 3. Create SMTP Credentials
1. In SES Console → **SMTP Settings**
2. Click **Create SMTP Credentials**
3. Enter IAM User Name: `ladder-game-smtp`
4. **SAVE THESE CREDENTIALS SECURELY:**
   - SMTP Username: `AKIAXXXXXXXXXXXXXX`
   - SMTP Password: `BxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxXXXX`
   - SMTP Endpoint: `email-smtp.us-east-1.amazonaws.com`
   - Port: `587` (TLS) or `465` (SSL)

### 4. Move Out of Sandbox Mode
```bash
# In SES Console → Account Dashboard
# Click "Request production access"
# Provide use case: "Transactional emails for puzzle game including daily reminders and purchase confirmations"
```

### 5. Cost Calculation for Your Game
```
Estimated Monthly Usage for Ladder Game:
- 1,000 users × 30 daily reminders = 30,000 emails
- 100 purchase confirmations = 100 emails
- Total: ~30,100 emails/month

Cost: $0.10 per 1,000 emails = ~$3.01/month
```

## 🔐 Security Best Practices

### IAM Policy for SES (Minimal Permissions)
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "ses:SendEmail",
                "ses:SendRawEmail"
            ],
            "Resource": "*"
        }
    ]
}
```

### Environment Variables
```bash
# Add these to Supabase Edge Function Secrets
AWS_SES_SMTP_USER=your-smtp-username
AWS_SES_SMTP_PASS=your-smtp-password  
AWS_SES_REGION=us-east-1
FROM_EMAIL=no-reply@yourdomain.com
FROM_NAME=Ladder Game
```

## 📝 Next Steps
1. Complete SES setup following this guide
2. Get production access approved (24-48 hours)
3. Configure Edge Functions with these credentials
4. Test email sending

## 🚨 Important Notes
- Keep SMTP credentials secure in Supabase Secrets
- Start in sandbox mode for testing
- Request production access early (takes 1-2 days)
- Use your verified domain for `from` addresses