# Puzzle Pack Infrastructure Documentation

## Overview
The Ladder game supports multiple types of puzzles through a flexible URL parameter system that can be easily extended for future puzzle packs.

## Supported Puzzle Types

### 1. Daily Puzzles
- **URL**: `play.html` or `play.html?type=daily`
- **Source**: Fetches from `daily_puzzles` table based on current date
- **Access**: Free for all users
- **Tracking**: Stored in `puzzle_completions` table

### 2. Free Puzzle Pack
- **URL**: `play.html?type=pack&pack_id=free-pack&puzzle_id={uuid}`
- **Source**: 10 puzzles with progressive difficulty:
  - 1 puzzle from each level 1-7
  - 3 additional puzzles from levels 3-6
- **Access**: Free for all authenticated users
- **Tracking**: Stored in `puzzle_pack_completions` table

### 3. Complete Pack (100 Puzzles)
- **URL**: `play.html?type=pack&pack_id=complete-pack&puzzle_id={uuid}`
- **Source**: All puzzles from `puzzle_pack` table
- **Access**: Requires purchase (tracked in `user_purchases`)
- **Tracking**: Stored in `puzzle_pack_completions` table

### 4. Historical/Archived Puzzles
- **URL**: `play.html?type=historical&date=YYYY-MM-DD`
- **Source**: `daily_puzzles` table for specified date
- **Access**: May require authentication or purchase
- **Tracking**: Stored in `puzzle_completions` table

## Database Schema

### Core Tables

#### `puzzle_packs`
Stores metadata about available puzzle packs:
```sql
- id (TEXT): Unique identifier (e.g., 'holiday-pack-2024')
- name (TEXT): Display name
- description (TEXT): Pack description
- total_puzzles (INTEGER): Number of puzzles in pack
- price_cents (INTEGER): Price in cents (0 for free)
- sort_order (INTEGER): Display order
- is_active (BOOLEAN): Whether pack is available
```

#### `puzzle_pack`
Stores actual puzzle content:
```sql
- id (UUID): Unique puzzle ID
- pack_id (TEXT): Reference to puzzle_packs.id (nullable)
- pack_level (INTEGER): Difficulty/sequence level
- theme (TEXT): Puzzle theme
- words (JSONB): Array of word objects with clues and hints
```

#### `puzzle_pack_completions`
Tracks user progress:
```sql
- user_id (UUID): User reference
- puzzle_id (UUID): Puzzle reference
- attempts (INTEGER): Number of attempts
- completed (BOOLEAN): Success status
- completion_time (INTERVAL): Time to complete
- hints_used (INTEGER): Hints consumed
- tries_used (INTEGER): Wrong guesses
```

## Adding New Puzzle Packs

### Step 1: Add Pack Metadata
```sql
INSERT INTO puzzle_packs (id, name, description, total_puzzles, price_cents, sort_order) 
VALUES ('holiday-pack-2024', 'Holiday Pack 2024', 'Festive puzzles for the season', 25, 299, 3);
```

### Step 2: Add Puzzles to Pack
```sql
INSERT INTO puzzle_pack (pack_id, theme, words, pack_level) VALUES
('holiday-pack-2024', 'Christmas Morning', '{...}', 1),
('holiday-pack-2024', 'New Years Eve', '{...}', 2);
```

### Step 3: Update UI (Optional)
The system automatically handles new packs, but you may want to:
- Add custom icons in the store
- Create promotional banners
- Add to featured packs

## URL Parameter System

The `play.html` screen accepts these parameters:

### Required Parameters
- `type`: 'daily' | 'pack' | 'historical'

### Pack-Specific Parameters
- `pack_id`: The pack identifier (e.g., 'free-pack')
- `puzzle_id`: The specific puzzle UUID

### Historical Parameters
- `date`: YYYY-MM-DD format

## Extensibility Features

### 1. Dynamic Pack Loading
The system automatically loads pack information from the database, so new packs appear without code changes.

### 2. Flexible Puzzle Sources
- Free packs can use subsets of existing puzzles (via views like `free_pack_puzzles`)
- Premium packs can have exclusive content
- Seasonal packs can be time-limited
- Custom difficulty curves (e.g., free pack uses levels 1-7 with extras from 3-6)

### 3. Access Control
- Purchase verification through `user_purchases` table
- Free pack exception handling
- Future support for subscription models

### 4. Progress Tracking
- Attempts counted for retry analysis
- Completion times for leaderboards
- Hints/tries for difficulty tuning

## Example: Adding a Themed Pack

```sql
-- 1. Create the pack
INSERT INTO puzzle_packs (id, name, description, total_puzzles, price_cents, sort_order) 
VALUES ('sports-pack', 'Sports Challenge', 'Test your sports knowledge', 50, 399, 4);

-- 2. Add puzzles
INSERT INTO puzzle_pack (pack_id, theme, words, pack_level) VALUES
('sports-pack', 'Baseball Game', '{
  "words": [
    {"word": "PITCH", "clue": "Throw to batter", "hint": "Fastball", "revealed_letters": [0,3]},
    {"word": "CATCH", "clue": "Receive the pitch", "hint": "Glove it", "revealed_letters": [0,3]},
    ...
  ]
}', 1);

-- 3. Pack is automatically available in store and playable!
```

## Testing Different Puzzle Types

### Daily Puzzle
```
https://yourdomain.com/screens/play.html
```

### Free Pack Puzzle
```
https://yourdomain.com/screens/play.html?type=pack&pack_id=free-pack&puzzle_id=bf9a9c50-e532-4654-bf1d-cd02c5c2926c
```

### Complete Pack Puzzle
```
https://yourdomain.com/screens/play.html?type=pack&pack_id=complete-pack&puzzle_id=any-puzzle-uuid
```

### Historical Puzzle
```
https://yourdomain.com/screens/play.html?type=historical&date=2024-07-15
```

## Future Enhancements

1. **Subscription Packs**: Monthly puzzle releases
2. **User-Generated Packs**: Community puzzles
3. **Difficulty-Based Packs**: Easy/Medium/Hard collections
4. **Language Packs**: Puzzles in different languages
5. **Educational Packs**: School curriculum aligned
6. **Corporate Packs**: Team building puzzles