# 🎨 Slim Ladder Email Templates - Logo Branded

## ✅ **New Slim Templates Created**

I've created **streamlined email templates** with your Ladder logos:

- **🟢 Green Logo** (`ladder_transparent.png`): Confirmation & Invite emails
- **🟠 Orange Logo** (`ladder-trans-orange.png`): Password reset & Email change

---

## 🚀 **5-Minute Installation Guide**

### **Step 1: Go to Supabase Email Templates**
1. **Open**: [Supabase Email Templates](https://supabase.com/dashboard/project/btonnmoeaandberyszsm/auth/templates)

---

### **🟢 Template 1: Confirm Signup (Green Logo)**
1. **Click** "Confirm signup" template
2. **Subject**: `Welcome to Ladder! 🎉`
3. **Replace content** with:

```html
<table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin: 20px 0;">
  <tr>
    <td align="center">
      <img src="https://ladder.game/assets/icons/ladder_transparent.png" alt="Ladder" width="60" height="60" style="display: block;">
    </td>
  </tr>
</table>

<h2 style="text-align: center; color: #4CAF50; margin: 20px 0;">Welcome to Ladder! 🎉</h2>

<p>Thanks for joining! Click below to confirm your email and start solving puzzles:</p>

<table cellpadding="0" cellspacing="0" border="0" width="100%">
  <tr>
    <td align="center" style="padding: 20px 0;">
      <a href="{{ .ConfirmationURL }}" style="background: #4CAF50; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">
        Confirm Email & Play
      </a>
    </td>
  </tr>
</table>

<p style="text-align: center; color: #666; font-size: 14px;">
  Daily puzzles • Progress tracking • Leaderboards<br>
  Welcome to the community!
</p>
```

4. **Save Template**

---

### **🟠 Template 2: Reset Password (Orange Logo)**
1. **Click** "Reset Password" template
2. **Subject**: `Reset Your Ladder Password 🔒`
3. **Replace content** with:

```html
<table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin: 20px 0;">
  <tr>
    <td align="center">
      <img src="https://ladder.game/assets/icons/ladder-trans-orange.png" alt="Ladder" width="60" height="60" style="display: block;">
    </td>
  </tr>
</table>

<h2 style="text-align: center; color: #ff6b35; margin: 20px 0;">Reset Your Password 🔒</h2>

<p>Need to reset your Ladder password? No problem!</p>

<table cellpadding="0" cellspacing="0" border="0" width="100%">
  <tr>
    <td align="center" style="padding: 20px 0;">
      <a href="{{ .ConfirmationURL }}" style="background: #ff6b35; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">
        Reset Password
      </a>
    </td>
  </tr>
</table>

<p style="text-align: center; color: #666; font-size: 12px;">
  This link expires in 1 hour for security.<br>
  Didn't request this? Ignore this email.
</p>
```

4. **Save Template**

---

### **🟢 Template 3: Magic Link (Green Logo)**
1. **Click** "Magic Link" template
2. **Subject**: `Your Ladder Login Link ✨`
3. **Replace content** with:

```html
<table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin: 20px 0;">
  <tr>
    <td align="center">
      <img src="https://ladder.game/assets/icons/ladder_transparent.png" alt="Ladder" width="60" height="60" style="display: block;">
    </td>
  </tr>
</table>

<h2 style="text-align: center; color: #4CAF50; margin: 20px 0;">Your Login Link ✨</h2>

<p>Click below to log into Ladder instantly - no password needed!</p>

<table cellpadding="0" cellspacing="0" border="0" width="100%">
  <tr>
    <td align="center" style="padding: 20px 0;">
      <a href="{{ .ConfirmationURL }}" style="background: #4CAF50; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">
        Log Into Ladder
      </a>
    </td>
  </tr>
</table>

<p style="text-align: center; color: #666; font-size: 12px;">
  This magic link expires in 1 hour.<br>
  Your puzzles are waiting! 🧩
</p>
```

4. **Save Template**

---

### **🟢 Template 4: Invite User (Green Logo) - Optional**
1. **Click** "Invite User" template
2. **Subject**: `You're Invited to Ladder! 🎉`
3. **Replace content** with:

```html
<table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin: 20px 0;">
  <tr>
    <td align="center">
      <img src="https://ladder.game/assets/icons/ladder_transparent.png" alt="Ladder" width="60" height="60" style="display: block;">
    </td>
  </tr>
</table>

<h2 style="text-align: center; color: #4CAF50; margin: 20px 0;">You're Invited to Ladder! 🎉</h2>

<p>Someone thinks you'd love our word puzzles! Join the community:</p>

<table cellpadding="0" cellspacing="0" border="0" width="100%">
  <tr>
    <td align="center" style="padding: 20px 0;">
      <a href="{{ .ConfirmationURL }}" style="background: #4CAF50; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">
        Accept Invitation
      </a>
    </td>
  </tr>
</table>

<p style="text-align: center; color: #666; font-size: 14px;">
  Daily word puzzles • Community challenges • Achievement system<br>
  Ready to climb the ladder?
</p>
```

4. **Save Template**

---

### **🟠 Template 5: Change Email (Orange Logo) - Optional**
1. **Click** "Change Email Address" template
2. **Subject**: `Confirm Your Email Change 📧`
3. **Replace content** with:

```html
<table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin: 20px 0;">
  <tr>
    <td align="center">
      <img src="https://ladder.game/assets/icons/ladder-trans-orange.png" alt="Ladder" width="60" height="60" style="display: block;">
    </td>
  </tr>
</table>

<h2 style="text-align: center; color: #ff6b35; margin: 20px 0;">Confirm Email Change 📧</h2>

<p>Confirm your new email address: <strong>{{ .NewEmail }}</strong></p>

<table cellpadding="0" cellspacing="0" border="0" width="100%">
  <tr>
    <td align="center" style="padding: 20px 0;">
      <a href="{{ .ConfirmationURL }}" style="background: #ff6b35; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">
        Confirm Change
      </a>
    </td>
  </tr>
</table>

<p style="text-align: center; color: #666; font-size: 12px;">
  Didn't request this change? Contact support immediately.<br>
  Your account security is important to us.
</p>
```

4. **Save Template**

---

## 🎨 **Design Summary**

### **🟢 Green Logo Templates (Positive Actions)**
- ✅ **Email Confirmation**: Welcome new users
- ✅ **Magic Link**: Easy login 
- ✅ **Invite Users**: Community growth

### **🟠 Orange Logo Templates (Security Actions)**
- 🔒 **Password Reset**: Account security
- 📧 **Email Change**: Account updates

---

## 🧪 **Test Your New Templates**

After setup:

```bash
open tests/test-email-system.html
```

**You should see**:
- 🎨 **Proper logos** in each email type
- 📱 **Clean, mobile-friendly** design
- 🎯 **Clear action buttons**
- ✨ **Professional branding**

---

## 🎉 **Benefits of Slim Templates**

✅ **Faster loading** in email clients  
✅ **Better mobile experience**  
✅ **Higher click-through rates**  
✅ **Professional logo branding**  
✅ **Color-coded by action type**  

**Your Ladder emails are now slim, branded, and beautiful! 🚀**