# Universal Loading Component

A reusable loading screen component for the Ladder game application featuring the transparent ladder icon and a green spinning circle.

## Features

- **Transparent ladder icon** (80px size)
- **Green animated spinner** 
- **Smooth fade transitions** (0.5s)
- **Promise-based loading** coordination
- **Header preservation** (keeps header visible during loading)
- **Content-only loading** (covers content area, not header)
- **Responsive positioning** (adjusts for mobile/desktop header heights)
- **Modular design** for easy reuse across screens

## Setup

### 1. Include the CSS
Add to your HTML `<head>`:
```html
<link rel="stylesheet" href="../assets/css/universal-loading.css">
```

### 2. Include the JavaScript
Add before your main script:
```html
<script src="../assets/js/universal-loading.js"></script>
```

### 3. Add the HTML Structure
Add to your `<body>` (after header, before main content):
```html
<!-- Universal Loading Screen -->
<div class="universal-loading" id="universal-loading">
    <div class="loading-content">
        <img src="../assets/icons/ladder_transparent.png" alt="Ladder" class="loading-ladder-icon">
        <div class="loading-spinner"></div>
    </div>
</div>

<!-- Always visible header -->
<header class="header">
    <h1 class="title">LADDER</h1>
    <p class="date-info" id="date-display">Loading...</p>
</header>

<div class="container" id="main-content" style="display: none;">
    <!-- Your main content here -->
</div>
```

## Usage

### Simple Usage
```javascript
// Show loading
UniversalLoading.show();

// Hide loading
UniversalLoading.hide();
```

### Advanced Usage (Recommended)
Coordinate multiple async operations:
```javascript
document.addEventListener('DOMContentLoaded', function() {
    // Initialize with multiple loading functions
    UniversalLoading.initializeWith([
        loadUserData(),
        loadPageContent(),
        loadSettings(),
        // ... other async functions
    ]);
});
```

### Custom Implementation
```javascript
// Show loading immediately
UniversalLoading.show();

// Load your data
Promise.all([
    loadSomeData(),
    loadOtherData()
]).then(() => {
    UniversalLoading.hide();
}).catch(() => {
    UniversalLoading.hide(); // Hide even on error
});
```

## API Reference

### Methods

- `UniversalLoading.show()` - Show the loading screen
- `UniversalLoading.hide()` - Hide the loading screen  
- `UniversalLoading.initializeWith(promises, minDisplayTime)` - Show loading, wait for promises, then hide
- `UniversalLoading.inject()` - Dynamically inject loading HTML into page
- `UniversalLoading.createHTML()` - Generate loading HTML string

### Parameters

- `promises` (Array) - Array of promises to wait for
- `minDisplayTime` (Number, default: 500) - Minimum time to show loading screen in milliseconds

## CSS Variables

The component uses these CSS variables (with fallbacks):
- `--gray-50` - Background color (fallback: #fafafa)
- `--primary-green` - Spinner color (fallback: #6aaa64)

## Header Positioning

The loading screen is positioned to start below the fixed header including its border:
- **Desktop**: `top: 121px` (header height + padding + 1px border)
- **Mobile**: `top: 81px` (mobile header height + 1px border)

This preserves the header's bottom gray divider line. Ensure your page has a fixed header with `border-bottom: 1px solid var(--gray-200)` for proper alignment.

## Best Practices

1. **Keep header visible** - Move header outside main content container
2. **Use promise coordination** - Let the component handle timing automatically
3. **Set loading text** - Show "Loading..." in header subtitle during load
4. **Handle errors gracefully** - Loading screen will hide even if promises reject
5. **Minimum display time** - Default 500ms prevents flash for fast loads

## File Structure

```
assets/
├── css/
│   └── universal-loading.css    # Component styles
├── js/
│   ├── universal-loading.js     # Component logic
│   └── universal-loading-readme.md
└── icons/
    └── ladder_transparent.png   # Loading icon
```