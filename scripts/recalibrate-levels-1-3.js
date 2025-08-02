import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
});

/**
 * Map puzzle date to 1-7 difficulty level (1=Mon … 7=Sun)
 */
function getLevelFromDate(dateStr) {
  const d = new Date(dateStr);
  const w = d.getUTCDay(); // 0=Sun
  return w === 0 ? 7 : w;  // Sunday treated as level 7
}

/**
 * Generate date-seeded random number for consistency
 */
function getDateSeed(dateStr) {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    const char = dateStr.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

/**
 * RECALIBRATED letter reveal pattern generator
 * Level 1: 30-35% letters, 70-80% first letters, 4-5 letter words
 * Level 2: 25-30% letters, 60-70% first letters, 5-6 letter words  
 * Level 3: 20-25% letters, 50-60% first letters, 6-7 letter words
 */
function generateRevealPattern(word, seed, difficultyLevel) {
  console.log(`  Generating RECALIBRATED pattern for "${word}" (${word.length} letters, Level ${difficultyLevel})`);
  
  // Target percentages - RECALIBRATED from testing
  const targetPercentages = {
    1: 0.35,  // Level 1: 35% (very generous)
    2: 0.28,  // Level 2: 28% (generous) 
    3: 0.22,  // Level 3: 22% (moderate)
    4: 0.18,  // Level 4: 18% (challenging)
    5: 0.15,  // Level 5: 15% (difficult)
    6: 0.12,  // Level 6: 12% (very difficult)
    7: 0.10   // Level 7: 10% (expert)
  };

  // First letter frequency - RECALIBRATED  
  const firstLetterFreq = {
    1: 0.75,  // Level 1: 75% show first letter
    2: 0.65,  // Level 2: 65% show first letter
    3: 0.55,  // Level 3: 55% show first letter
    4: 0.40,  // Level 4: 40% show first letter
    5: 0.30,  // Level 5: 30% show first letter
    6: 0.20,  // Level 6: 20% show first letter
    7: 0.10   // Level 7: 10% show first letter
  };

  const targetPercentage = targetPercentages[difficultyLevel] || 0.25;
  const firstLetterChance = firstLetterFreq[difficultyLevel] || 0.50;
  
  // Calculate target number of letters to reveal
  const targetCount = Math.max(1, Math.round(word.length * targetPercentage));
  
  // Initialize pseudorandom with word+seed
  let random = seed + word.length * 31;
  function nextRandom() {
    random = (random * 1103515245 + 12345) & 0x7fffffff;
    return random / 0x7fffffff;
  }

  const revealed = [];
  
  // Decide if first letter should be revealed
  if (nextRandom() < firstLetterChance) {
    revealed.push(0);
  }
  
  // Add additional letters to reach target count
  const remaining = targetCount - revealed.length;
  if (remaining > 0) {
    const availablePositions = [];
    for (let i = 1; i < word.length; i++) {
      if (!revealed.includes(i)) {
        availablePositions.push(i);
      }
    }
    
    // Shuffle available positions
    for (let i = availablePositions.length - 1; i > 0; i--) {
      const j = Math.floor(nextRandom() * (i + 1));
      [availablePositions[i], availablePositions[j]] = [availablePositions[j], availablePositions[i]];
    }
    
    // Take first N positions
    for (let i = 0; i < Math.min(remaining, availablePositions.length); i++) {
      revealed.push(availablePositions[i]);
    }
  }
  
  revealed.sort((a, b) => a - b);
  console.log(`    → Revealed positions: [${revealed.join(', ')}] (${Math.round(revealed.length/word.length*100)}%)`);
  return revealed;
}

/**
 * Check for word contamination in clues and hints
 */
function checkWordContamination(puzzle) {
  const issues = [];
  const allWords = puzzle.words.map(w => w.word.toLowerCase());
  
  puzzle.words.forEach((wordData, idx) => {
    const clue = (wordData.clue || '').toLowerCase();
    const hint = (wordData.hint || '').toLowerCase();
    
    allWords.forEach(puzzleWord => {
      if (clue.includes(puzzleWord.toLowerCase())) {
        issues.push(`Word ${idx + 1} (${wordData.word}): clue contains "${puzzleWord}"`);
      }
      if (hint.includes(puzzleWord.toLowerCase())) {
        issues.push(`Word ${idx + 1} (${wordData.word}): hint contains "${puzzleWord}"`);
      }
    });
  });
  
  return issues;
}

/**
 * Update a single puzzle with recalibrated difficulty
 */
async function updatePuzzle(puzzle, tableName) {
  const level = getLevelFromDate(puzzle.puzzle_date);
  
  // Only update Levels 1-3
  if (level > 3) {
    console.log(`⏭️  Skipping ${puzzle.puzzle_date} (Level ${level} - only updating 1-3)`);
    return true;
  }
  
  console.log(`\n🔧 Recalibrating ${puzzle.puzzle_date} (${puzzle.theme}) - Level ${level}`);
  
  // Check for word contamination
  const contamination = checkWordContamination(puzzle);
  if (contamination.length > 0) {
    console.log(`⚠️  CONTAMINATION ISSUES FOUND:`);
    contamination.forEach(issue => console.log(`    ${issue}`));
  }
  
  // Update letter reveals with recalibrated patterns
  const dateSeed = getDateSeed(puzzle.puzzle_date);
  const updatedWords = puzzle.words.map((wordData, wordIndex) => {
    const wordSeed = dateSeed + wordIndex * 17;
    const revealedPositions = generateRevealPattern(wordData.word, wordSeed, level);
    
    return {
      ...wordData,
      revealed_letters: revealedPositions
    };
  });
  
  // Update database
  const { error } = await supabase
    .from(tableName)
    .update({ words: updatedWords })
    .eq('id', puzzle.id);
  
  if (error) {
    console.error(`❌ Failed to update ${puzzle.puzzle_date}:`, error);
    return false;
  } else {
    console.log(`✅ Updated ${puzzle.puzzle_date} with recalibrated Level ${level} difficulty`);
    return true;
  }
}

/**
 * Main recalibration function
 */
async function main() {
  console.log('🎯 LADDER Level 1-3 Recalibration Script');
  console.log('📋 New specifications:');
  console.log('   Level 1: 35% letters, 75% first letters, 4-5 letter words');
  console.log('   Level 2: 28% letters, 65% first letters, 5-6 letter words');
  console.log('   Level 3: 22% letters, 55% first letters, 6-7 letter words');
  console.log('   + No word contamination rule enforcement\n');

  // Update daily_puzzles
  console.log('📅 Fetching daily_puzzles...');
  const { data: dailyPuzzles, error: dailyError } = await supabase
    .from('daily_puzzles')
    .select('*')
    .order('puzzle_date');

  if (dailyError) {
    console.error('❌ Failed to fetch daily puzzles:', dailyError);
    return;
  }

  console.log(`Found ${dailyPuzzles.length} daily puzzles`);
  
  let dailyUpdated = 0;
  for (const puzzle of dailyPuzzles) {
    const success = await updatePuzzle(puzzle, 'daily_puzzles');
    if (success) dailyUpdated++;
  }

  // Update puzzle_overrides  
  console.log('\n🔧 Fetching puzzle_overrides...');
  const { data: overrides, error: overrideError } = await supabase
    .from('puzzle_overrides')
    .select('*')
    .order('puzzle_date');

  if (overrideError) {
    console.error('❌ Failed to fetch puzzle overrides:', overrideError);
    return;
  }

  console.log(`Found ${overrides.length} puzzle overrides`);
  
  let overridesUpdated = 0;
  for (const puzzle of overrides) {
    const success = await updatePuzzle(puzzle, 'puzzle_overrides'); 
    if (success) overridesUpdated++;
  }

  console.log('\n🎉 Recalibration Complete!');
  console.log(`✅ Updated ${dailyUpdated} daily puzzles`);
  console.log(`✅ Updated ${overridesUpdated} puzzle overrides`);
  console.log('\n📝 Next steps:');
  console.log('1. Review any contamination warnings above');
  console.log('2. Test Level 1-3 puzzles in game');
  console.log('3. Adjust individual puzzles if needed');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});