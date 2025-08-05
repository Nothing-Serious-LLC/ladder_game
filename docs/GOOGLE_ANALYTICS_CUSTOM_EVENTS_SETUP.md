# Google Analytics Custom Events Setup Guide

## 📊 Overview

This guide helps you set up custom events in Google Analytics 4 (GA4) to track PWA installations, user engagement, and key conversion metrics for LADDER puzzle game.

## 🎯 Key Events We're Tracking

### PWA Funnel Events
- `pwa_prompt_available` - Browser offers PWA install prompt (Android)
- `pwa_prompt_shown` - User sees install guide/prompt (iOS & Android)
- `pwa_install_button_clicked` - User clicks install button
- `pwa_install_choice` - User's decision (accepted/dismissed)
- `pwa_installed` - Successful PWA installation
- `pwa_game_session` - Game played from installed PWA

### Notification Events
- `notification_permission_granted` - User allows notifications
- `notification_permission_denied` - User denies notifications
- `daily_reminder_opted_in` - User wants daily puzzle reminders
- `daily_reminder_opted_out` - User declines reminders
- `test_notification_sent` - Development testing

### Game Engagement
- `game_started` - User begins playing puzzle
- `pwa_install_attempt_failed` - PWA installation failed

## 🛠 Setup Instructions

### Step 1: Access Google Analytics Events
1. Go to [Google Analytics](https://analytics.google.com/)
2. Select your property: **LADDER (G-93EGC4CGNR)**
3. Navigate to **Admin** → **Data display** → **Events**

### Step 2: Create Custom Events (Without Code)

For each key event, follow these steps:

#### Example: PWA Installation Tracking
1. Click **+ Create event**
2. Enter event name: `pwa_installed`
3. Toggle **Mark as key event** ✅
4. Select **Create without code**
5. Choose existing event: `page_view`
6. Add condition: 
   - **Parameter**: `event_category`
   - **Operator**: `equals`
   - **Value**: `PWA_Funnel`
7. Click **Create**

#### Recommended Key Events to Create:

| Event Name | Purpose | Key Event? |
|------------|---------|------------|
| `pwa_installed` | Track PWA installations | ✅ YES |
| `daily_reminder_opted_in` | Track notification opt-ins | ✅ YES |
| `game_started` | Track engagement | ✅ YES |
| `pwa_game_session` | Track PWA usage | ✅ YES |

### Step 3: Set Conversion Values

For business metrics, assign values to key events:

1. In **Events** → **Key events** tab
2. Click **⋯** next to event → **Set default key event value**
3. Recommended values:
   - `pwa_installed`: **$1.00** (user acquisition value)
   - `daily_reminder_opted_in`: **$0.50** (engagement value)
   - `game_started`: **$0.25** (interaction value)

## 📈 Key Analytics Reports to Monitor

### PWA Installation Funnel
```
Prompt Available → Prompt Shown → Install Clicked → Installed
```

### Notification Opt-in Rate
```
Permission Requested → Permission Granted → Daily Reminders Enabled
```

### PWA vs Web Usage
```
Total Sessions → PWA Sessions → Engagement Comparison
```

## 🔍 Custom Reports Setup

### 1. PWA Installation Analysis
- **Primary Dimension**: `Device Category`
- **Metrics**: `pwa_prompt_shown`, `pwa_installed`
- **Filters**: `Event Category = PWA_Funnel`

### 2. Platform Comparison
- **Primary Dimension**: `Operating System`
- **Secondary Dimension**: `Device Category`
- **Metrics**: Custom events, Session duration

### 3. Engagement Funnel
- **Explore** → **Funnel exploration**
- **Steps**: 
  1. `page_view` (Landing)
  2. `pwa_prompt_shown` (Saw prompt)
  3. `pwa_installed` (Installed)
  4. `game_started` (Engaged)

## 🧪 Testing Your Setup

### Development Testing
1. Open browser console on your site
2. Run: `testNotification()` 
3. Check Analytics Real-time reports
4. Verify events appear in **Events** section

### Production Validation
1. Install PWA on test device
2. Grant notification permissions
3. Check **Real-time** → **Events** in GA4
4. Verify custom events are firing

## 📱 iOS vs Android Tracking

### iOS Limitations
- No native `beforeinstallprompt` event
- Manual installation process
- Estimated install rate: `iOS PWA Sessions / iOS Install Guide Views`

### Android Advantages
- Native browser install prompts
- Direct installation tracking
- Accurate conversion rates

## 🎯 Success Metrics to Watch

### PWA Adoption
- **PWA Install Rate**: `pwa_installed / pwa_prompt_shown`
- **Platform Performance**: iOS vs Android install rates
- **PWA User Retention**: PWA session frequency

### Engagement
- **PWA vs Web**: Session duration comparison
- **Notification Effectiveness**: Opt-in rates
- **Daily Active PWA Users**: PWA sessions per day

## 🔗 Advanced Integration

### Google Ads Conversions
1. **Admin** → **Conversions** → **New conversion event**
2. Select existing GA4 event: `pwa_installed`
3. Set as conversion for ad bidding

### Enhanced E-commerce (Future)
- Track puzzle pack purchases
- Monitor subscription conversions
- Analyze user lifetime value

## 💡 Pro Tips

1. **Real-time Testing**: Use GA4 Real-time reports for immediate validation
2. **Debug Mode**: Add `?debug_mode=true` to URLs for enhanced tracking
3. **Cross-Platform**: Monitor both iOS Safari and Android Chrome behaviors
4. **A/B Testing**: Test different PWA install prompts and track conversion rates

## 📋 Quick Checklist

- [ ] GA4 property configured with `G-93EGC4CGNR`
- [ ] Custom events created for PWA funnel
- [ ] Key events marked with conversion values
- [ ] Real-time testing completed
- [ ] Push notification events tracking
- [ ] Platform-specific reports configured
- [ ] Conversion goals set up for Google Ads

---

**Next Steps**: After setting up these events, monitor your GA4 dashboard for 24-48 hours to see data flow, then optimize your PWA install prompts based on conversion rates!