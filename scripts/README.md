# LADDER Database Letter Reveal Update Scripts

These scripts update your Supabase database to use the correct difficulty-based letter revelation algorithm as defined in your theme strategy.

## Problem

Your current database puzzles were created with an old algorithm that reveals too many first letters, making puzzles too easy and not following the proper weekly difficulty progression.

## Solution

These scripts implement the proper algorithm with:
- **Friday (Level 5)**: Only 30% of words show first letter, 15% total letters
- **Monday-Tuesday**: 80% first letters, 30% total  
- **Wednesday**: 60% first letters, 22.5% total
- **Thursday**: 40% first letters, 17.5% total
- **Saturday**: 20% first letters, 12.5% total
- **Sunday**: 10% first letters, 10% total

## Setup

1. **Install dependencies:**
   ```bash
   cd scripts
   npm install
   ```

2. **Create .env file with your Supabase credentials:**
   ```bash
   # .env
   VITE_SUPABASE_URL=your-supabase-url-here
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
   ```
   
   ⚠️ **Important**: You need your **SERVICE ROLE key** (not the anon key) to update database records.

## Usage

### Step 1: Test the Algorithm
First, verify the new algorithm works correctly:

```bash
npm run test-pattern
```

This will show you exactly what letter patterns would be generated for different difficulty levels.

### Step 2: Update Database
Once you're satisfied with the test results, update all your database puzzles:

```bash
npm run update-reveals
```

This will:
- Update all puzzles in `daily_puzzles` table
- Update all puzzles in `puzzle_overrides` table  
- Show progress and success/failure counts
- Preserve all other puzzle data (themes, words, clues, hints)

## What It Does

The script calculates the correct difficulty level for each puzzle based on its date, then generates new `revealed_letters` arrays that follow your theme strategy guidelines.

### Key Features:
- ✅ **Proper first letter frequency** by difficulty level
- ✅ **Anti-adjacency spacing** (minimum 2-space gaps)
- ✅ **Seeded randomization** (same puzzle always has same reveals)
- ✅ **Length-based scaling** (longer words get more letters)
- ✅ **Difficulty-based total percentage** control

## After Running

1. **Refresh your game** - the client will now load the corrected patterns from the database
2. **Verify Friday puzzles** show ~30% first letters instead of most/all
3. **Test different days** to confirm the weekly progression works

## Reverting Client-Side Override

After updating the database, you should also revert the client-side override in `assets/js/database.js` to use the database patterns instead of generating them client-side:

```javascript
// Change this back to use database stored patterns:
revealPattern: Array.from({length: wordData.word.length}, (_, i) => 
    wordData.revealed_letters.includes(i)
)
```

This ensures patterns are loaded from your corrected database instead of being recalculated.