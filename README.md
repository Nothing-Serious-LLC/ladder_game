# LADDER - Daily Word Chain Puzzle

🎯 **A daily word puzzle where you climb through connected words**

LADDER is a daily word game inspired by Wordle and other New York Times games. Each day presents a new puzzle with 6 thematically connected words arranged like rungs on a ladder. Your goal is to guess each word as quickly as possible using hints and revealed letters.

## 🎮 How to Play

### The Challenge
- **6 words per puzzle** arranged like ladder rungs
- **Each word connects thematically** to the previous word
- **New puzzle every day** that gets progressively harder throughout the week
- **Race against time** as letter colors intensify (blue → purple → red)

### Your Tools
- **Revealed letters**: Some letters are shown to help you start
- **Subtle hints**: Each word has a thematic clue below it
- **5 total guesses** across all words
- **Connection clues**: Think about how each word relates to the previous one

### Gameplay Flow
1. **Start with the first word** - use revealed letters and hints
2. **Think connections** - how does each word relate to the previous?
3. **Watch the timer** - letter colors change over time creating natural urgency
4. **Climb the ladder** - complete all 6 words to finish the puzzle
5. **Share your time** - compare your completion time with friends

## 🌟 Features

### Visual Design
- **Clean, modern interface** inspired by popular word games
- **Color-coded feedback** with progressive urgency system
- **Responsive design** that works on mobile and desktop
- **Smooth animations** and transitions

### Daily Challenge System
- **Unique puzzle each day** with different themes
- **Difficulty progression** throughout the week
- **Consistent reveal patterns** - everyone gets the same hints
- **Shareable results** with completion times

### Smart Hint System  
- **Seeded randomization** ensures fair, consistent puzzles
- **Strategic letter reveals** that don't make it too easy
- **Thematic connections** between words guide your thinking
- **Progressive difficulty** as you climb higher

## 🎯 Game Examples

### Theme: "Fire & Home"
```
FIRE → SMOKE → CHIMNEY → HOUSE → FAMILY → REUNION
```

### Theme: "Ocean & Memory"  
```
OCEAN → WAVES → SURFING → BEACH → VACATION → MEMORIES  
```

### Theme: "Night & Discovery"
```
STAR → TELESCOPE → SCIENTIST → DISCOVERY → EXCITEMENT → CELEBRATION
```

## 📊 User Accounts (Optional)

While anyone can play without signing up, creating an account lets you:

- **Track your daily streak** and personal records
- **View completion statistics** and improvement over time  
- **Compare your times** with historical performance
- **Never lose progress** if you switch devices

**Email signup only required** if you want to track progress - most users can play anonymously.

## 🔧 Technical Details

### Built With
- **Pure HTML/CSS/JavaScript** - no frameworks needed
- **Supabase backend** for user accounts and statistics (optional)
- **Progressive Web App** features for mobile experience
- **Local storage** for anonymous players

### Daily Puzzle Generation
- **Seed-based randomization** ensures everyone gets the same puzzle
- **Multiple themed word chains** with varying difficulty
- **Smart letter reveal patterns** that maintain challenge balance
- **Timezone-aware** puzzle delivery (EST-based daily reset)

## 🚀 Getting Started

### Play Instantly
1. Open `index.html` in any modern web browser  
2. Click "Play Today's Puzzle"
3. Start guessing the first word using hints and revealed letters
4. Climb the ladder by solving all 6 connected words!

### Development Setup
1. **Clone this repository**
2. **Set up Supabase** (optional, for user accounts):
   - Create a new Supabase project
   - Configure authentication with email/password
   - Set up the database schema (SQL provided)
3. **Update configuration** in `supabase-config.js`
4. **Serve locally** or deploy to any static hosting

## 🎨 Game Design Philosophy

**Accessible but Challenging**: Anyone can start playing immediately, but mastery takes practice and strategic thinking.

**Social Sharing**: Built for sharing completion times and discussing the daily puzzle connections.

**Daily Ritual**: Designed to be a quick, satisfying daily mental exercise like other popular word games.

**Progressive Difficulty**: Monday puzzles are more approachable, building to Friday challenges that test vocabulary and lateral thinking.

---

**Ready to climb today's LADDER?** 🪜

*Each day brings a new word chain to discover. How fast can you make the connections?*