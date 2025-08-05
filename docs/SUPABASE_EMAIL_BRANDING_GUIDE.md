# Supabase Email Branding Guide for Ladder Game

## 🎯 **Current Issue**
The password reset email shows:
- **Sender**: "Supabase Auth <noreply@mail.app.supabase.io>"
- **Design**: Very basic, no Ladder branding
- **Content**: Generic Supabase template

## 🎨 **Branding Options Available**

### **Option 1: Supabase Dashboard Customization (Quick Fix)**

#### **What You Can Customize:**
1. ✅ **Sender Name**: Change from "Supabase Auth" to "Ladder Game"
2. ✅ **Email Templates**: Full HTML customization
3. ✅ **Subject Lines**: Custom subjects for each email type
4. ❌ **From Domain**: Still uses `mail.app.supabase.io` (Supabase's domain)

#### **Steps to Customize:**
1. Go to [Supabase Dashboard → Auth → Email Templates](https://supabase.com/dashboard/project/btonnmoeaandberyszsm/auth/templates)
2. Configure SMTP settings:
   - **Sender Name**: `Ladder Game`
   - **From Email**: `noreply@mail.app.supabase.io` (can't change this without custom SMTP)
3. Customize each template with Ladder branding

---

### **Option 2: Amazon SES Custom SMTP (Full Branding)**

#### **What You Get:**
1. ✅ **Custom Sender Name**: "Ladder Game"
2. ✅ **Custom Domain**: `noreply@ladder.game` (your domain)
3. ✅ **Full Template Control**: Complete HTML/CSS customization
4. ✅ **Professional Appearance**: No Supabase branding
5. ✅ **Better Deliverability**: Your own domain reputation

#### **Requirements:**
- Set up Amazon SES (we already have the guide)
- Configure custom SMTP in Supabase
- Verify your domain with Amazon

---

## 🚀 **RECOMMENDED APPROACH: Two-Phase Implementation**

### **Phase 1: Quick Dashboard Fix (5 minutes)**
1. **Update Sender Name** to "Ladder Game"
2. **Customize Email Templates** with Ladder branding
3. **Keep Supabase domain** for now

### **Phase 2: Full Amazon SES Setup (Later)**
1. **Set up Amazon SES** when you're ready
2. **Configure custom domain** 
3. **Switch to professional emails**

---

## 📧 **Template Customization Examples**

### **Password Reset Template (Ladder Branded)**
```html
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background-color: #f8f9fa; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; padding: 40px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .logo { color: #4CAF50; font-size: 28px; font-weight: bold; margin-bottom: 10px; }
        .tagline { color: #666; font-size: 14px; }
        .content { color: #333; line-height: 1.6; }
        .button { display: inline-block; background: #4CAF50; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #999; font-size: 12px; text-align: center; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">🪜 LADDER</div>
            <div class="tagline">Word Puzzle Game</div>
        </div>
        
        <div class="content">
            <h2 style="color: #333; margin-bottom: 20px;">Reset Your Password</h2>
            <p>Hello there!</p>
            <p>We received a request to reset your password for your Ladder account. Click the button below to set a new password:</p>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="{{ .ConfirmationURL }}" class="button">Reset My Password</a>
            </div>
            
            <p>If you didn't request this password reset, you can safely ignore this email. Your password will remain unchanged.</p>
            
            <p>This link will expire in 1 hour for security reasons.</p>
        </div>
        
        <div class="footer">
            <p>This email was sent from Ladder Game<br>
            If you have questions, contact us at support@ladder.game</p>
        </div>
    </div>
</body>
</html>
```

### **Email Confirmation Template (Ladder Branded)**
```html
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background-color: #f8f9fa; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; padding: 40px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .logo { color: #4CAF50; font-size: 28px; font-weight: bold; margin-bottom: 10px; }
        .tagline { color: #666; font-size: 14px; }
        .content { color: #333; line-height: 1.6; }
        .button { display: inline-block; background: #4CAF50; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #999; font-size: 12px; text-align: center; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">🪜 LADDER</div>
            <div class="tagline">Word Puzzle Game</div>
        </div>
        
        <div class="content">
            <h2 style="color: #333; margin-bottom: 20px;">Welcome to Ladder! 🎉</h2>
            <p>Thanks for signing up! You're just one step away from climbing the word puzzle ladder.</p>
            <p>Click the button below to confirm your email address and start playing:</p>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="{{ .ConfirmationURL }}" class="button">Confirm My Email</a>
            </div>
            
            <p>Once confirmed, you'll be able to:</p>
            <ul style="color: #666;">
                <li>🧩 Solve daily puzzles</li>
                <li>📊 Track your progress</li>
                <li>🏆 Compete on leaderboards</li>
                <li>⭐ Unlock achievements</li>
            </ul>
            
            <p>Ready to climb the ladder?</p>
        </div>
        
        <div class="footer">
            <p>This email was sent from Ladder Game<br>
            If you have questions, contact us at support@ladder.game</p>
        </div>
    </div>
</body>
</html>
```

---

## 🎯 **IMMEDIATE ACTION PLAN**

### **Step 1: Update Supabase Email Settings (Now)**
1. Go to: [Auth Settings](https://supabase.com/dashboard/project/btonnmoeaandberyszsm/settings/auth)
2. **Scroll to "SMTP Settings"**
3. **Update Sender Name**: Change to "Ladder Game"
4. **Save Changes**

### **Step 2: Customize Email Templates (Now)**
1. Go to: [Email Templates](https://supabase.com/dashboard/project/btonnmoeaandberyszsm/auth/templates)
2. **Select "Reset Password" template**
3. **Paste the Ladder-branded HTML** (above)
4. **Update subject**: "Reset Your Ladder Password 🪜"
5. **Repeat for other templates**

### **Step 3: Test the Changes**
1. **Use your test suite**: `tests/test-email-system.html`
2. **Send test password reset** to see new branding
3. **Check email appearance**

---

## 💰 **Cost Comparison**

| Option | Setup Time | Monthly Cost | Professional Level |
|--------|------------|--------------|-------------------|
| **Supabase Dashboard** | 5 minutes | FREE | ⭐⭐⭐ Good |
| **Amazon SES** | 1 hour | $1-10/month | ⭐⭐⭐⭐⭐ Professional |

---

## 🎉 **RECOMMENDATION**

**Start with Option 1** (Supabase Dashboard customization) **RIGHT NOW** for immediate improvement, then upgrade to Amazon SES later when you need professional domain emails.

This gives you:
✅ **Immediate branding improvement**  
✅ **Professional-looking emails**  
✅ **Zero additional cost**  
✅ **5-minute setup**  

Would you like me to walk you through updating the Supabase dashboard settings now?