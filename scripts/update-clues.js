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

// Helper: map puzzle date to 1-7 difficulty level (1=Mon … 7=Sun)
function getLevelFromDate(dateStr) {
  const d = new Date(dateStr);
  const w = d.getUTCDay(); // 0=Sun
  return w === 0 ? 7 : w;  // Sunday treated as level 7
}

// Helper: generate a mid-strength clue from an existing hint
function generateClue(hint, level) {
  if (!hint) return null;
  // Very naive approach: shorten the hint for harder days
  const words = hint.split(/\s+/);
  const keep = Math.max(2, Math.ceil(words.length * (level <= 3 ? 1 : level <= 5 ? 0.7 : 0.5)));
  return words.slice(0, keep).join(' ');
}

async function run() {
  console.log('Fetching puzzles…');
  const { data: puzzles, error } = await supabase.from('daily_puzzles').select('*');
  if (error) throw error;

  for (const puzzle of puzzles) {
    const level = getLevelFromDate(puzzle.date || puzzle.puzzle_date || puzzle.created_at);
    let wordsArr = puzzle.words || [];

    if (wordsArr.length > 5) {
      console.log(`Puzzle #${puzzle.id || puzzle.puzzle_number}: trimming from ${wordsArr.length} to 5 words`);
      wordsArr = wordsArr.slice(0, 5);
    }

    const updatedWords = wordsArr.map((w) => {
      // Ensure we don\'t mutate original object reference
      const wordObj = { ...w };
      wordObj.clue = generateClue(wordObj.hint, level) || wordObj.hint;
      return wordObj;
    });

    // Update row
    const { error: upErr } = await supabase
      .from('daily_puzzles')
      .update({ words: updatedWords })
      .eq('id', puzzle.id);

    if (upErr) {
      console.error('Update error for puzzle', puzzle.id, upErr.message);
    } else {
      console.log(`Updated puzzle ${puzzle.id}`);
    }
  }

  console.log('All puzzles processed.');
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});