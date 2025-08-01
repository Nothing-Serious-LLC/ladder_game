# 🧪 Puzzle Testing & Override System

## Overview

The game now includes a flexible puzzle override system that allows you to easily test new puzzles and difficulty levels without affecting the main daily puzzle sequence.

## How It Works

1. **Priority System**: The game checks for puzzles in this order:
   - `puzzle_overrides` table (test puzzles) ✅ **FIRST**
   - `daily_puzzles` table (regular puzzles)
   - Hardcoded fallback puzzles

2. **Date-based**: Override puzzles are tied to specific dates, so you can test puzzles for today, tomorrow, or any future date.

3. **Non-destructive**: Original daily puzzles remain unchanged - overrides just take priority.

## Database Tables

### `puzzle_overrides`
- **Purpose**: Test/override puzzles that take priority over daily puzzles
- **Constraints**: Same as daily_puzzles (12-letter word limit, minimum reveals)
- **Unique**: One override per date (new ones replace old ones)

### Helper Functions

#### `create_test_puzzle()` - Easy Puzzle Creation
```sql
SELECT create_test_puzzle(
    '2025-08-03'::DATE,           -- Date for puzzle
    'Theme Name',                 -- Puzzle theme
    '[{puzzle json}]'::jsonb,     -- Words array (same format as daily_puzzles)
    3,                           -- Complexity level (1-7)
    'Testing notes'              -- Optional notes
);
```

#### `remove_test_puzzle()` - Remove Override
```sql
SELECT remove_test_puzzle('2025-08-03'::DATE);
```

#### `active_puzzle_overrides` - View All Overrides
```sql
SELECT * FROM active_puzzle_overrides;
```

## Current Active Overrides

### Today (Aug 1, 2025): "Legal Precedent" ⚠️ 
- **Theme**: Legal Precedent
- **Words**: CASE → RULING → PRECEDENT → DOCTRINE → JUSTICE
- **Complexity**: **Level 6** (originally Level 4, reclassified)
- **Word lengths**: 4-9 letters (avg 7.2)
- **Key Learning**: Cultural Prerequisites dial has exponential impact - legal specialization jumped difficulty by 2 levels

### Tomorrow (Aug 2, 2025): "Medical Diagnosis"
- **Theme**: Medical Diagnosis  
- **Words**: SYMPTOM → DIAGNOSIS → TREATMENT → RECOVERY → WELLNESS
- **Complexity**: Level 5 (medical specialization)
- **Word lengths**: 6-9 letters (avg 8.0)
- **Features**: Professional domain knowledge, technical connections

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

### Quick Test Puzzle for Today
```sql
SELECT create_test_puzzle(
    CURRENT_DATE,
    'Coffee Shop',
    '[
        {"word": "BEAN", "clue": "Coffee starts with this", "hint": "Coffee seed", "revealed_letters": [0, 2]},
        {"word": "GRIND", "clue": "What you do to beans", "hint": "Crush up", "revealed_letters": [0, 2]},
        {"word": "BREW", "clue": "Make coffee from ground beans", "hint": "Hot water process", "revealed_letters": [0, 2]},
        {"word": "CUP", "clue": "Container for brewed coffee", "hint": "Drinking vessel", "revealed_letters": [0]},
        {"word": "DRINK", "clue": "What you do with cup of coffee", "hint": "Consume liquid", "revealed_letters": [0, 2]},
        {"word": "ENERGY", "clue": "What coffee drink gives you", "hint": "Power boost", "revealed_letters": [0, 3, 5]}
    ]'::jsonb,
    2,
    'Quick coffee theme test'
);
```

### Remove Override (Return to Regular Puzzle)
```sql
SELECT remove_test_puzzle(CURRENT_DATE);
```

### View What's Active
```sql
-- See all current overrides
SELECT * FROM active_puzzle_overrides;

-- See what puzzle will be used for specific date
SELECT 
    CASE 
        WHEN EXISTS(SELECT 1 FROM puzzle_overrides WHERE puzzle_date = '2025-08-01') 
        THEN 'OVERRIDE: ' || (SELECT theme FROM puzzle_overrides WHERE puzzle_date = '2025-08-01')
        ELSE 'DAILY: ' || (SELECT theme FROM daily_puzzles WHERE puzzle_date = '2025-08-01')
    END as active_puzzle;
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