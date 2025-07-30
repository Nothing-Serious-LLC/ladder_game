# LADDER PWA Setup Guide

## 📱 **What We've Added**

Your LADDER game is now a **Progressive Web App (PWA)** that can be installed on iPhone home screens!

### ✅ **PWA Features Added:**
- **Web App Manifest** (`manifest.json`) - Enables "Add to Home Screen"
- **Service Worker** (`sw.js`) - Offline support and fast loading
- **Mobile-Optimized CSS** - Perfect for phone, tablet, and desktop
- **iOS-Specific Meta Tags** - Native app-like experience on iPhone
- **Dynamic Viewport Height** - Handles iOS Safari's changing address bar

## 🖼️ **Icons Needed**

Convert the included `icon.svg` to these PNG sizes:

```bash
# Required icon sizes
icon-180.png  # iOS home screen
icon-192.png  # Android/PWA standard
icon-512.png  # High-res PWA icon

# Quick conversion with online tools:
# 1. Upload icon.svg to https://realfavicongenerator.net/
# 2. Generate all sizes automatically
# 3. Download and place in your root directory
```

## 📲 **Testing iPhone Installation**

### **Safari on iPhone:**
1. Open your website in Safari
2. Tap the **Share** button (square with arrow)
3. Scroll down and tap **"Add to Home Screen"**
4. Confirm the name and tap **"Add"**
5. App appears on home screen with your icon!

### **What Users Will See:**
- ✅ Custom LADDER icon on home screen
- ✅ No Safari URL bar when opened from home screen
- ✅ Splash screen with your app colors
- ✅ Native-like app experience
- ✅ Works offline after first visit

## 🎨 **Mobile Optimizations**

### **Phone (≤768px):**
- Larger touch targets
- Vertical button layout
- Optimized font sizes
- Better spacing for thumbs

### **Tablet (769-1024px):**
- Balanced layout
- Medium touch targets
- Responsive grid

### **Desktop (≥1025px):**
- Original design preserved
- Horizontal button layout
- Optimal reading sizes

## 🔧 **Development Testing**

### **Local Testing:**
```bash
# Serve with HTTPS (required for PWA)
python3 -m http.server 8000 --bind 127.0.0.1

# Or use a simple server with SSL
npx http-server -S -C cert.pem -K key.pem
```

### **PWA Audit:**
1. Open Chrome DevTools
2. Go to **Lighthouse** tab
3. Check **"Progressive Web App"**
4. Run audit to verify PWA compliance

## 🚀 **Deployment Checklist**

- [ ] Upload all files to your web server
- [ ] Generate and upload icon PNG files
- [ ] Test "Add to Home Screen" on iPhone
- [ ] Verify offline functionality works
- [ ] Check responsive design on different screen sizes
- [ ] Run Lighthouse PWA audit (should score 90+)

## 📱 **Future Native App Path**

If you later want full App Store apps:

```bash
# Option 1: Capacitor (wraps current code)
npm install @capacitor/core @capacitor/cli
npx cap init LADDER com.yourname.ladder

# Option 2: React Native (complete rewrite)
npx create-expo-app --template blank-typescript
```

Your PWA is now ready for iPhone users to install as a native-feeling app! 🎯