# 🧪 Puzzle Testing & Override System - Complete Guide

## 🎯 Purpose

The override system allows you to:
1. **Test new puzzle difficulties** before adding them to the main sequence
2. **Deploy special event puzzles** that override the regular daily puzzle
3. **Quickly iterate on puzzle design** without affecting the main game
4. **Queue up multiple test puzzles** for sequential evaluation
5. **Compare difficulty levels** across different themes and complexity

## ⚡ Quick Start Summary

### **For Immediate Testing**
```sql
-- Replace today's puzzle with a test puzzle
INSERT INTO puzzle_overrides (puzzle_date, theme, words, complexity_level, notes) 
VALUES (CURRENT_DATE, 'Test Theme', '[word objects...]'::jsonb, 6, 'Testing notes')
ON CONFLICT (puzzle_date) DO UPDATE SET theme = EXCLUDED.theme, words = EXCLUDED.words, complexity_level = EXCLUDED.complexity_level;
```

### **For Sequential Testing** 
```sql
-- Queue up multiple days of testing
INSERT INTO puzzle_overrides VALUES 
    (CURRENT_DATE, 'Test A', '[...]'::jsonb, 6, 'Level 6 test A'),
    (CURRENT_DATE + 1, 'Test B', '[...]'::jsonb, 6, 'Level 6 test B'),
    (CURRENT_DATE + 2, 'Test C', '[...]'::jsonb, 5, 'Level 5 comparison');
```

### **Check Status**
```sql
-- See what's active and queued
SELECT puzzle_date, theme, complexity_level, notes FROM puzzle_overrides WHERE puzzle_date >= CURRENT_DATE ORDER BY puzzle_date;
```

## ⏰ Daily Reset Schedule

**Game resets at 3:00 AM Eastern Time every day**
- **Summer (EDT)**: 3:00 AM EDT = 7:00 AM UTC
- **Winter (EST)**: 3:00 AM EST = 8:00 AM UTC
- This ensures puzzles change at a reasonable hour for US players

## 🔄 How The System Works

### **Priority Order (Checked Every Game Load):**
1. **`puzzle_overrides` table** ✅ **HIGHEST PRIORITY**
   - Test puzzles and special events
   - Overrides any regular puzzle for that date
2. **`daily_puzzles` table** 
   - Regular daily puzzles (Level 1-7 progression)
3. **Hardcoded fallback puzzles**
   - Emergency backup if database is empty

### **Date-Based Logic:**
- Each override is tied to a specific date (YYYY-MM-DD format)
- Game calculates "today" using 3:00 AM Eastern reset time
- Override takes effect immediately when added to database

## 🗃️ Database Tables

### **`puzzle_overrides` - Test & Special Puzzles**
- **Purpose**: Override regular daily puzzles for testing or special events
- **Constraints**: Same as daily_puzzles (12-letter word limit, proper reveal patterns)
- **Key Fields**:
  - `puzzle_date`: The date this override should be active (YYYY-MM-DD)
  - `theme`: Puzzle theme name
  - `words`: JSON array of word objects with clues, hints, and revealed_letters
  - `complexity_level`: Difficulty level 1-7 (must match expected day level for testing)
  - `notes`: Why this override exists (testing, special event, etc.)

### **Override Priority Rules:**
- **One override per date** - New ones replace old ones automatically
- **Date format**: Use `CURRENT_DATE` for today, or `'2025-08-03'::DATE` for specific dates
- **Immediate effect**: Changes appear on next game refresh

## 🛠️ Quick Commands

### **Add Test Puzzle (Direct SQL)**
```sql
INSERT INTO puzzle_overrides (
    puzzle_date, 
    theme, 
    words, 
    complexity_level, 
    notes
) VALUES (
    CURRENT_DATE,  -- Today's date
    'Test Theme Name',
    '[
        {
            "word": "EXAMPLE",
            "clue": "Sample word for testing",
            "hint": "Test hint",
            "revealed_letters": [0, 3]
        }
        -- Add 4 more words...
    ]'::jsonb,
    6,  -- Level 6 difficulty
    'Testing Level 6 puzzle difficulty'
);
```

### **Remove Override (Return to Regular Puzzle)**
```sql
DELETE FROM puzzle_overrides WHERE puzzle_date = CURRENT_DATE;
```

### **View Active Overrides**
```sql
SELECT puzzle_date, theme, complexity_level, notes 
FROM puzzle_overrides 
WHERE puzzle_date >= CURRENT_DATE 
ORDER BY puzzle_date;
```

### **Check What Puzzle Will Show**
```sql
SELECT 
    puzzle_date,
    CASE 
        WHEN EXISTS(SELECT 1 FROM puzzle_overrides WHERE puzzle_date = CURRENT_DATE) 
        THEN 'OVERRIDE: ' || (SELECT theme FROM puzzle_overrides WHERE puzzle_date = CURRENT_DATE)
        WHEN EXISTS(SELECT 1 FROM daily_puzzles WHERE puzzle_date = CURRENT_DATE)
        THEN 'DAILY: ' || (SELECT theme FROM daily_puzzles WHERE puzzle_date = CURRENT_DATE)
        ELSE 'FALLBACK: Hardcoded puzzle'
    END as active_puzzle_source
FROM (SELECT CURRENT_DATE as puzzle_date) d;
```

## 📋 Step-by-Step Guide for AI Assistant

### **When User Says: "Test a Level 6 puzzle"**

1. **Create a Level 6 puzzle** following theme strategy guidelines
2. **Add override for TODAY** using this exact pattern:

```sql
INSERT INTO puzzle_overrides (
    puzzle_date, 
    theme, 
    words, 
    complexity_level, 
    notes
) VALUES (
    (SELECT CURRENT_DATE),  -- Always use current date for immediate testing
    'Theme Name',
    '[
        {"word":"WORD1","clue":"Clear clue text","hint":"Helpful hint","revealed_letters":[0,3]},
        {"word":"WORD2","clue":"Clear clue text","hint":"Helpful hint","revealed_letters":[1,4]},
        {"word":"WORD3","clue":"Clear clue text","hint":"Helpful hint","revealed_letters":[0,2,5]},
        {"word":"WORD4","clue":"Clear clue text","hint":"Helpful hint","revealed_letters":[1,5]},
        {"word":"WORD5","clue":"Clear clue text","hint":"Helpful hint","revealed_letters":[0,3,6]}
    ]'::jsonb,
    6,
    'Level 6 difficulty test - [Theme] (describe specific difficulty focus)'
) 
ON CONFLICT (puzzle_date) 
DO UPDATE SET
    theme = EXCLUDED.theme,
    words = EXCLUDED.words,
    complexity_level = EXCLUDED.complexity_level,
    notes = EXCLUDED.notes;
```

3. **Confirm the override is active:**
```sql
SELECT 
    puzzle_date,
    theme, 
    complexity_level,
    JSON_EXTRACT_PATH_TEXT(words::json -> 0, 'word') as first_word,
    JSON_EXTRACT_PATH_TEXT(words::json -> 4, 'word') as last_word
FROM puzzle_overrides 
WHERE puzzle_date = CURRENT_DATE;
```

### **When User Says: "Queue up multiple Level 6 puzzles"**

**Strategy:** Set up overrides for consecutive days to test multiple variations

```sql
-- Today: First Level 6 test
INSERT INTO puzzle_overrides (puzzle_date, theme, words, complexity_level, notes) 
VALUES (CURRENT_DATE, 'Theme A', '[...]'::jsonb, 6, 'Level 6 test A - Focus area 1');

-- Tomorrow: Second Level 6 test
INSERT INTO puzzle_overrides (puzzle_date, theme, words, complexity_level, notes)
VALUES (CURRENT_DATE + INTERVAL '1 day', 'Theme B', '[...]'::jsonb, 6, 'Level 6 test B - Focus area 2');

-- Day after: Third Level 6 test
INSERT INTO puzzle_overrides (puzzle_date, theme, words, complexity_level, notes)
VALUES (CURRENT_DATE + INTERVAL '2 days', 'Theme C', '[...]'::jsonb, 6, 'Level 6 test C - Focus area 3');
```

### **When User Says: "Create a special event puzzle"**

**Use Case:** Holiday, milestone, or special theme that overrides regular daily progression

```sql
INSERT INTO puzzle_overrides (
    puzzle_date, 
    theme, 
    words, 
    complexity_level, 
    notes
) VALUES (
    '2025-12-25',  -- Christmas Day
    'Winter Celebration',
    '[special holiday puzzle words...]'::jsonb,
    4,  -- Match the expected day-of-week difficulty or choose appropriate level
    'Special Event: Christmas Day puzzle'
);
```

### **When User Says: "Remove the override"**
```sql
DELETE FROM puzzle_overrides WHERE puzzle_date = CURRENT_DATE;
```

### **When User Says: "What puzzle is showing today?"**
```sql
SELECT 
    CASE 
        WHEN EXISTS(SELECT 1 FROM puzzle_overrides WHERE puzzle_date = CURRENT_DATE) 
        THEN 'OVERRIDE: ' || (SELECT theme FROM puzzle_overrides WHERE puzzle_date = CURRENT_DATE)
        ELSE 'DAILY/FALLBACK: Check daily_puzzles table or hardcoded'
    END as current_puzzle;
```

## 🚨 Troubleshooting Guide

### **Problem**: "I'm seeing a hardcoded puzzle instead of my override"

**Diagnosis Steps:**
1. **Check what date the game is calculating:**
   - Look for console log: `"Checking for puzzle override for date: YYYY-MM-DD"`
   - Game resets at 3:00 AM Eastern, so late night = next day

2. **Check override exists for that exact date:**
   ```sql
   SELECT * FROM puzzle_overrides WHERE puzzle_date = '2025-08-01';  -- Use the date from console
   ```

3. **Check for JavaScript errors** in browser console
   - Syntax errors prevent database queries
   - Look for "SyntaxError" or "Database error" messages

**Solutions:**
- ✅ **Override missing**: Add it for the correct date the game is looking for
- ✅ **Wrong date**: Update override to match what game is calculating
- ✅ **JavaScript error**: Check browser console, fix syntax issues
- ✅ **After 3:00 AM ET**: Game treats it as next day, adjust override date accordingly

**Working Example (Confirmed):**
```sql
-- This pattern works correctly
INSERT INTO puzzle_overrides (puzzle_date, theme, words, complexity_level, notes) 
VALUES ('2025-08-01', 'Hurricane Season', '[words array]'::jsonb, 6, 'Test notes');
```

### **Problem**: "Override isn't working"

**Common Causes:**
1. **Date mismatch** - Database uses 3:00 AM ET reset, your local time might be different
2. **JSON format error** - revealed_letters must be arrays of numbers: `[0, 3, 5]`
3. **Word length violation** - All words must be ≤ 12 letters
4. **Database connection issue** - Check browser console logs

### **Problem**: "Need to test multiple Level 6 puzzles"

**Strategy:**
```sql
-- Today: Level 6 Puzzle A
INSERT INTO puzzle_overrides (puzzle_date, theme, words, complexity_level, notes) 
VALUES (CURRENT_DATE, 'Theme A', '[...]'::jsonb, 6, 'Level 6 test A');

-- Tomorrow: Level 6 Puzzle B  
INSERT INTO puzzle_overrides (puzzle_date, theme, words, complexity_level, notes)
VALUES (CURRENT_DATE + INTERVAL '1 day', 'Theme B', '[...]'::jsonb, 6, 'Level 6 test B');
```

## 🎯 Complete Override Workflow

### **For Immediate Puzzle Testing (Today)**

**Use Case**: "Test this Level 6 puzzle right now"

```sql
-- Add override for immediate testing
INSERT INTO puzzle_overrides (
    puzzle_date, 
    theme, 
    words, 
    complexity_level, 
    notes
) VALUES (
    '2025-08-01',  -- Use specific date (today)
    'Hurricane Season',
    '[
        {"word": "PRESSURE", "clue": "Atmospheric condition driving storm formation", "hint": "Air force", "revealed_letters": [2, 6]},
        {"word": "CYCLONE", "clue": "Rotating system formed by atmospheric condition", "hint": "Spinning storm", "revealed_letters": [0]},
        {"word": "EYEWALL", "clue": "Intense inner ring of rotating system", "hint": "Storm center", "revealed_letters": [3, 7]},
        {"word": "LANDFALL", "clue": "Moment when storm center reaches shore", "hint": "Storm arrival", "revealed_letters": [0, 5, 7]},
        {"word": "SURGE", "clue": "Ocean flooding caused by storm arrival", "hint": "Water rise", "revealed_letters": [2, 4]}
    ]'::jsonb,
    6,
    'Level 6 difficulty test - Hurricane Season (meteorological vocabulary)'
)
ON CONFLICT (puzzle_date) 
DO UPDATE SET
    theme = EXCLUDED.theme,
    words = EXCLUDED.words,
    complexity_level = EXCLUDED.complexity_level,
    notes = EXCLUDED.notes;
```

### **For Queued Puzzle Testing (Sequential Days)**

**Use Case**: "Set up Level 6 puzzles for the next 3 days"

```sql
-- Today: Hurricane Season (Level 6)
INSERT INTO puzzle_overrides (puzzle_date, theme, words, complexity_level, notes) 
VALUES ('2025-08-01', 'Hurricane Season', '[hurricane words...]'::jsonb, 6, 'Level 6 test A - Meteorological');

-- Tomorrow: Blacksmith Forge (Level 6)  
INSERT INTO puzzle_overrides (puzzle_date, theme, words, complexity_level, notes)
VALUES ('2025-08-02', 'Blacksmith Forge', '[blacksmith words...]'::jsonb, 6, 'Level 6 test B - Traditional crafts');

-- Day after: Space Exploration (Level 5)
INSERT INTO puzzle_overrides (puzzle_date, theme, words, complexity_level, notes)
VALUES ('2025-08-03', 'Space Exploration', '[space words...]'::jsonb, 5, 'Level 5 comparison test');
```

### **Current Active Status** ✅
- **August 1st (Today)**: Hurricane Season (Level 6) - **ACTIVE NOW**
- **Purpose**: Testing meteorological vocabulary at Level 6 difficulty
- **Chain**: PRESSURE → CYCLONE → EYEWALL → LANDFALL → SURGE  
- **Validation**: Override system working correctly with 3:00 AM ET timezone reset

### Aug 4, 2025: "Digital Communication" ✅
- **Theme**: Digital Communication
- **Words**: PHONE → EMAIL → MESSAGE → RESPONSE → CONVERSATION
- **Complexity**: **Level 4** (proper Level 4 with minimal cultural barriers)
- **Word lengths**: 5-12 letters (avg 7.4)  
- **Features**: Accessible vocabulary, functional/process connections, everyone uses digital communication

## 🎯 **MASSIVE DATABASE OVERHAUL COMPLETED** ✅

**90 puzzles systematically updated using Nine-Dial Advanced Difficulty System:**

### **Cultural Prerequisites Violations FIXED:**
- **Monday**: Replaced ALL specialized themes (Sacred Ritual, Cathedral Architecture, Buddhist Meditation, etc.) with universal daily activities (Making Breakfast, Cleaning House, Getting Dressed, etc.)
- **Tuesday**: Replaced advanced physics themes (Quantum Entanglement, Nuclear Fusion, Einstein Relativity, etc.) with accessible technology (Phone Call, Taking Photos, Sending Email, etc.)
- **Saturday**: Upgraded from avg 3.17 to 6.17 with proper specialized themes (Educational Psychology, Medical Diagnosis, Technical Climbing, etc.)

### **Perfect Weekly Progression Achieved:**
- **Monday**: 1.00 avg (universal themes, no specialization)
- **Tuesday**: 2.15 avg (accessible education)  
- **Wednesday**: 3.00 avg (moderate complexity)
- **Thursday**: 3.77 avg (challenging but accessible)
- **Friday**: 5.00 avg (moderate specialization)
- **Saturday**: 6.17 avg (high specialization)
- **Sunday**: 7.00 avg (expert level)

## Usage Examples

## 🔍 Verification Commands

### **Quick Status Check**
```sql
-- What's active today?
SELECT 
    CURRENT_DATE as today,
    CASE 
        WHEN EXISTS(SELECT 1 FROM puzzle_overrides WHERE puzzle_date = CURRENT_DATE) 
        THEN 'OVERRIDE: ' || (SELECT theme FROM puzzle_overrides WHERE puzzle_date = CURRENT_DATE)
        ELSE 'NO OVERRIDE - Using daily puzzle or fallback'
    END as active_status;
```

### **Detailed Override Info**
```sql
SELECT 
    puzzle_date,
    theme,
    complexity_level,
    notes,
    JSON_EXTRACT_PATH_TEXT(words::json -> 0, 'word') as first_word,
    JSON_EXTRACT_PATH_TEXT(words::json -> 4, 'word') as last_word
FROM puzzle_overrides 
WHERE puzzle_date >= CURRENT_DATE - INTERVAL '1 day'
ORDER BY puzzle_date;
```

### **Proven Working Templates**

#### **Immediate Test Puzzle (Replace Current)**
```sql
-- Use this exact template - confirmed working
INSERT INTO puzzle_overrides (
    puzzle_date, 
    theme, 
    words, 
    complexity_level, 
    notes
) VALUES (
    CURRENT_DATE,
    'Coffee Shop',  -- Change theme
    '[
        {"word": "BEAN", "clue": "Coffee seed", "hint": "Brown seed", "revealed_letters": [0, 2]},
        {"word": "GRIND", "clue": "Process beans", "hint": "Crush up", "revealed_letters": [0, 3]},
        {"word": "BREW", "clue": "Make coffee", "hint": "Hot process", "revealed_letters": [0, 2]},
        {"word": "CUP", "clue": "Coffee container", "hint": "Vessel", "revealed_letters": [0]},
        {"word": "ENERGY", "clue": "Coffee result", "hint": "Power boost", "revealed_letters": [0, 3]}
    ]'::jsonb,
    2,  -- Change complexity level (1-7)
    'Level 2 test - Coffee theme'  -- Change notes
)
ON CONFLICT (puzzle_date) 
DO UPDATE SET
    theme = EXCLUDED.theme,
    words = EXCLUDED.words,
    complexity_level = EXCLUDED.complexity_level,
    notes = EXCLUDED.notes;
```

#### **Queue Multiple Puzzles (Sequential Testing)**
```sql
-- Set up 3 consecutive days of Level 6 testing
INSERT INTO puzzle_overrides VALUES 
    (CURRENT_DATE, 'Hurricane Season', '[meteorological words...]'::jsonb, 6, 'Level 6A - Weather'),
    (CURRENT_DATE + 1, 'Blacksmith Forge', '[crafting words...]'::jsonb, 6, 'Level 6B - Traditional'),
    (CURRENT_DATE + 2, 'Space Exploration', '[space words...]'::jsonb, 6, 'Level 6C - Scientific')
ON CONFLICT (puzzle_date) 
DO UPDATE SET theme = EXCLUDED.theme, words = EXCLUDED.words, complexity_level = EXCLUDED.complexity_level, notes = EXCLUDED.notes;
```

#### **Remove Override (Return to Daily Puzzles)**
```sql
-- Remove today's override to return to regular daily puzzle
DELETE FROM puzzle_overrides WHERE puzzle_date = CURRENT_DATE;

-- Remove all future overrides (clean slate)
DELETE FROM puzzle_overrides WHERE puzzle_date >= CURRENT_DATE;
```

#### **Check Override Status**
```sql
-- See what's queued up
SELECT 
    puzzle_date,
    theme,
    complexity_level,
    notes,
    CASE puzzle_date
        WHEN CURRENT_DATE THEN '🔥 ACTIVE TODAY'
        WHEN CURRENT_DATE + 1 THEN '📅 TOMORROW'
        ELSE '📋 FUTURE'
    END as status
FROM puzzle_overrides 
WHERE puzzle_date >= CURRENT_DATE
ORDER BY puzzle_date;
```

## Guidelines for Test Puzzles

### Word Length Limits (Enforced by Database)
- **Maximum**: 12 letters per word
- **Recommended by Day**:
  - Monday-Tuesday: 4-8 letters (avg 5-6)
  - Wednesday-Thursday: 5-9 letters (avg 6-7)
  - Friday-Saturday: 6-10 letters (avg 7-8)  
  - Sunday: 7-12 letters (avg 8-9)

### Hint Clarity (20% More Direct)
- **Monday-Wednesday**: Very direct ("Music player" not "Audio device")
- **Thursday-Friday**: Clear but educational ("Night sky dots" not "Celestial objects")
- **Saturday-Sunday**: Sophisticated but accessible ("Classical dancing" not "Choreographed expression")

### Letter Reveals - Two-Dial System ⚡ **CRITICAL UPDATE**
Never reveal first letter for ALL words - this makes puzzles too easy!

#### **Dial 1: Total Letter Percentage**
- **Level 1-2**: 25-35% | **Level 3**: 20-25% | **Level 4**: 15-20% | **Level 5-6**: 10-15% | **Level 7**: 5-10%

#### **Dial 2: First Letter Distribution**  
- **Level 1-2**: 80% first letters | **Level 3**: 60% | **Level 4**: 40% | **Level 5**: 30% | **Level 6**: 20% | **Level 7**: 10%

#### **Examples by Level:**
```sql
-- Level 2: Mostly first letters, generous reveals
"KITCHEN": [0,3,6] = K__C_E_ (generous + first letter)

-- Level 4: Mixed positions, moderate reveals  
"DEMAND": [3] = ___A__ (no first letter, challenging)
"SUPPLY": [2,4] = __P_L_ (no first letter, moderate)

-- Level 6: Random positions, minimal reveals
"PHOTON": [2] = __O___ (no first letter, minimal)
```

#### **Anti-Pattern (DON'T DO THIS):**
```json
❌ BAD: All first letters
"DEMAND": [0], "SUPPLY": [0], "INFLATION": [0]
```

## Testing Workflow

1. **Create Test Puzzle**: Use `create_test_puzzle()` for today or future date
2. **Test in Game**: Refresh game to load new puzzle  
3. **Evaluate**: Check difficulty, hint clarity, progression
4. **Iterate**: Modify puzzle with another `create_test_puzzle()` call
5. **Clean Up**: Use `remove_test_puzzle()` when done testing

## Console Logs

The game will show these logs when loading puzzles:
- `🔧 Using puzzle override: [Theme] ([Notes])` - Override active
- `Using daily puzzle: [Theme]` - Regular daily puzzle
- `Using fallback puzzle system` - Hardcoded fallback

This makes it easy to see which puzzle system is active!

---

**Try the new "Making Breakfast" puzzle now! 🥞☕️**