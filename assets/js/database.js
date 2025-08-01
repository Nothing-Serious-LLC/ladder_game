// LADDER - Database Integration Module
// Handles all Supabase interactions and data fetching

// Import Supabase configuration
import { supabase } from '../../config/supabase-config.js';

// Validate supabase client is available
function getSupabaseClient() {
    if (!supabase) {
        throw new Error('Supabase client not initialized. Make sure index.html has set up the client.');
    }
    return supabase;
}

/**
 * Get today's puzzle information (puzzle number calculation)
 */
export function getTodaysPuzzleInfo() {
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const est = new Date(utc + (-5 * 3600000));
    
    // Launch date set so today is puzzle #4
    const launchDate = new Date('2025-07-28');
    const diffTime = est - launchDate;
    const puzzleNumber = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
    
    return { puzzleNumber };
}

/**
 * Fetch today's puzzle from database or fallback to hardcoded puzzles
 */
export async function fetchTodaysPuzzle() {
    // Get today's date in EST timezone
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const est = new Date(utc + (-5 * 3600000)); // EST is UTC-5
    
    // Format date for comparison
    const year = est.getFullYear();
    const month = String(est.getMonth() + 1).padStart(2, '0');
    const day = String(est.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    
    // Calculate puzzle number (days since launch)
    const launchDate = new Date('2025-07-28'); // Launch date for puzzle #4 today
    const diffTime = est - launchDate;
    const puzzleNumber = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
    
    // For July 29, 2024 and earlier - use hardcoded puzzles
    if (dateStr <= '2024-07-29') {
        const dateSeed = parseInt(dateStr.replace(/-/g, ''));
        const puzzleIndex = seededRandom(dateSeed) % getHardcodedPuzzles().length;
        const selectedPuzzle = getHardcodedPuzzles()[puzzleIndex];
        
        const puzzleWithReveals = {
            ...selectedPuzzle,
            words: selectedPuzzle.words.map((wordData, wordIndex) => ({
                ...wordData,
                revealPattern: getSeededRevealPattern(wordData.word, dateSeed + wordIndex)
            }))
        };
        
        return { puzzle: puzzleWithReveals, puzzleNumber };
    }
    
    // For July 30, 2024 and later - fetch from database
    try {
        const client = getSupabaseClient();
        
        // FIRST: Check for puzzle overrides (for testing)
        console.log('Checking for puzzle override for date:', dateStr);
        const { data: overrideData, error: overrideError } = await client
            .from('puzzle_overrides')
            .select('*')
            .eq('puzzle_date', dateStr)
            .single();
        
        if (overrideData && !overrideError) {
            console.log('🔧 Using puzzle override:', overrideData.theme, '(', overrideData.notes, ')');
            // Convert override puzzle to frontend format
            const puzzleWithReveals = {
                theme: overrideData.theme,
                words: overrideData.words.map((wordData, wordIndex) => ({
                    word: wordData.word,
                    clue: wordData.clue,
                    hint: wordData.hint,
                    revealPattern: Array.from({length: wordData.word.length}, (_, i) => 
                        wordData.revealed_letters.includes(i)
                    )
                }))
            };
            
            return { puzzle: puzzleWithReveals, puzzleNumber: puzzleNumber };
        }
        
        // SECOND: Check regular daily puzzles
        console.log('No override found, checking daily puzzles');
        const { data, error } = await client
            .from('daily_puzzles')
            .select('*')
            .eq('puzzle_date', dateStr)
            .single();
        
        if (error) {
            console.error('Database error fetching puzzle:', error);
            throw new Error(`Database error: ${error.message}`);
        }
        
        if (data) {
            console.log('Using daily puzzle:', data.theme);
            // Convert database format to frontend format
            const puzzleWithReveals = {
                theme: data.theme,
                words: data.words.map((wordData, wordIndex) => ({
                    word: wordData.word,
                    clue: wordData.clue,
                    hint: wordData.hint,
                    revealPattern: Array.from({length: wordData.word.length}, (_, i) => 
                        wordData.revealed_letters.includes(i)
                    )
                }))
            };
            
            return { puzzle: puzzleWithReveals, puzzleNumber: data.puzzle_number };
        }
    } catch (error) {
        console.error('Failed to fetch puzzle from database:', error);
        // Re-throw to let the caller handle network vs other errors
        throw error;
    }
    
    // Fallback to hardcoded puzzles if database fetch fails
    console.log('Using fallback puzzle system');
    const dateSeed = parseInt(dateStr.replace(/-/g, ''));
    const puzzleIndex = seededRandom(dateSeed) % getHardcodedPuzzles().length;
    const selectedPuzzle = getHardcodedPuzzles()[puzzleIndex];
    
    const puzzleWithReveals = {
        ...selectedPuzzle,
        words: selectedPuzzle.words.map((wordData, wordIndex) => ({
            ...wordData,
            revealPattern: getSeededRevealPattern(wordData.word, dateSeed + wordIndex)
        }))
    };
    
    return { puzzle: puzzleWithReveals, puzzleNumber };
}

/**
 * Simple seeded random number generator
 */
function seededRandom(seed) {
    const x = Math.sin(seed) * 10000;
    return Math.floor((x - Math.floor(x)) * getHardcodedPuzzles().length);
}

/**
 * Generate seeded reveal pattern for a word
 */
function getSeededRevealPattern(word, seed) {
    const pattern = new Array(word.length).fill(false);
    
    // Determine number of letters to reveal based on word length
    let lettersToShow = 1;
    if (word.length >= 6) lettersToShow = 2;
    if (word.length >= 9) lettersToShow = 3;
    
    // Create all possible positions
    const availablePositions = Array.from({length: word.length}, (_, i) => i);
    
    // Better seeded shuffle using multiple seed variations
    for (let i = availablePositions.length - 1; i > 0; i--) {
        const seedVariation = seed + i * 7 + word.length * 3;
        const j = Math.abs(Math.sin(seedVariation) * 10000) % (i + 1);
        [availablePositions[i], availablePositions[j]] = [availablePositions[j], availablePositions[i]];
    }
    
    // Select positions with improved spacing logic
    const selectedPositions = [];
    const minSpacing = word.length <= 6 ? 1 : 2; // Allow closer spacing for short words
    
    for (const pos of availablePositions) {
        // Check spacing requirement
        const isValidPosition = selectedPositions.every(selectedPos => 
            Math.abs(pos - selectedPos) >= minSpacing
        );
        
        if (isValidPosition) {
            selectedPositions.push(pos);
            
            // Stop once we have enough letters
            if (selectedPositions.length >= lettersToShow) {
                break;
            }
        }
    }
    
    // Improved fallback - use distributed positions instead of sequential
    if (selectedPositions.length < lettersToShow) {
        selectedPositions.length = 0;
        const stepSize = Math.max(2, Math.floor(word.length / (lettersToShow + 1)));
        
        for (let i = 0; i < lettersToShow; i++) {
            const pos = Math.min(i * stepSize + 1, word.length - 1);
            if (!selectedPositions.includes(pos)) {
                selectedPositions.push(pos);
            }
        }
    }
    
    // Mark selected positions
    selectedPositions.forEach(pos => {
        pattern[pos] = true;
    });
    
    return pattern;
}

/**
 * Hardcoded puzzles for fallback and pre-launch dates
 */
function getHardcodedPuzzles() {
    return [
        {
            theme: "Fire & Home",
            words: [
                { word: "FIRE", clue: "Burns bright and hot", hint: "Flame source" },
                { word: "SMOKE", clue: "Gray clouds from burning", hint: "Fire's breath" },
                { word: "CHIMNEY", clue: "Tall structure for smoke escape", hint: "Roof pipe" },
                { word: "HOUSE", clue: "Building with a chimney", hint: "Home structure" },
                { word: "FAMILY", clue: "Group that lives in a house", hint: "Related people" },
                { word: "REUNION", clue: "Family gathering event", hint: "Coming together" }
            ]
        },
        {
            theme: "Ocean & Memory",
            words: [
                { word: "OCEAN", clue: "Vast body of saltwater", hint: "Blue expanse" },
                { word: "WAVES", clue: "Ocean's rhythmic movements", hint: "Water rolls" },
                { word: "SURFING", clue: "Sport of riding waves", hint: "Board riding" },
                { word: "BEACH", clue: "Sandy place for surfing", hint: "Shore line" },
                { word: "VACATION", clue: "Time spent at the beach", hint: "Holiday break" },
                { word: "MEMORIES", clue: "What vacations create", hint: "Stored moments" }
            ]
        },
        {
            theme: "Night & Discovery", 
            words: [
                { word: "STAR", clue: "Bright point in night sky", hint: "Twinkle light" },
                { word: "TELESCOPE", clue: "Device for viewing stars", hint: "Sky viewer" },
                { word: "SCIENTIST", clue: "Person who uses telescopes", hint: "Lab researcher" },
                { word: "DISCOVERY", clue: "What scientists make", hint: "New finding" },
                { word: "EXCITEMENT", clue: "Feeling from discovery", hint: "Thrill emotion" },
                { word: "CELEBRATION", clue: "Response to excitement", hint: "Party time" }
            ]
        },
        {
            theme: "Reading & Peace",
            words: [
                { word: "BOOK", clue: "Bound pages with stories", hint: "Reading material" },
                { word: "LIBRARY", clue: "Building full of books", hint: "Quiet sanctuary" },
                { word: "SILENCE", clue: "Expected atmosphere in library", hint: "No sound" },
                { word: "MEDITATION", clue: "Practice done in silence", hint: "Mindful calm" },
                { word: "PEACE", clue: "Feeling from meditation", hint: "Inner calm" },
                { word: "DOVE", clue: "Bird symbolizing peace", hint: "White flyer" }
            ]
        },
        {
            theme: "Weather & Growth",
            words: [
                { word: "RAIN", clue: "Water falling from clouds", hint: "Sky drops" },
                { word: "PUDDLE", clue: "Small pool left by rain", hint: "Water spot" },
                { word: "REFLECTION", clue: "Image seen in puddle surface", hint: "Mirror effect" },
                { word: "MIRROR", clue: "Glass that shows reflections", hint: "Vanity piece" },
                { word: "MAKEUP", clue: "Applied using a mirror", hint: "Face paint" },
                { word: "ACTOR", clue: "Person who wears stage makeup", hint: "Drama performer" }
            ]
        },
        {
            theme: "Music & Emotion",
            words: [
                { word: "PIANO", clue: "Black and white keyed instrument", hint: "Keyboard music" },
                { word: "MELODY", clue: "Tune played on piano", hint: "Musical sequence" },
                { word: "SONG", clue: "Melody with words", hint: "Vocal music" },
                { word: "EMOTION", clue: "What songs evoke", hint: "Feeling response" },
                { word: "TEARS", clue: "Physical sign of emotion", hint: "Eye drops" },
                { word: "TISSUE", clue: "Used to wipe tears", hint: "Soft paper" }
            ]
        },
        {
            theme: "Garden & Life",
            words: [
                { word: "SEED", clue: "Start of plant life", hint: "Tiny beginning" },
                { word: "SPROUT", clue: "Seed's first growth", hint: "Green shoot" },
                { word: "FLOWER", clue: "Sprout's beautiful result", hint: "Colorful bloom" },
                { word: "BEE", clue: "Insect that visits flowers", hint: "Buzzing pollinator" },
                { word: "HONEY", clue: "Sweet product from bees", hint: "Golden syrup" },
                { word: "TEA", clue: "Drink sweetened with honey", hint: "Hot beverage" }
            ]
        },
        {
            theme: "Technology & Connection",
            words: [
                { word: "PHONE", clue: "Device for communication", hint: "Pocket caller" },
                { word: "MESSAGE", clue: "Text sent by phone", hint: "Digital note" },
                { word: "FRIEND", clue: "Person who receives messages", hint: "Close companion" },
                { word: "MEETING", clue: "Gathering of friends", hint: "Get together" },
                { word: "LAUGHTER", clue: "Sound of happy meetings", hint: "Joyful noise" },
                { word: "MEMORY", clue: "What laughter creates", hint: "Stored moment" }
            ]
        },
        {
            theme: "Travel & Adventure",
            words: [
                { word: "MAP", clue: "Guide for travelers", hint: "Route planner" },
                { word: "JOURNEY", clue: "Trip guided by map", hint: "Long travel" },
                { word: "MOUNTAIN", clue: "Destination of journey", hint: "High peak" },
                { word: "SUMMIT", clue: "Top of mountain", hint: "Highest point" },
                { word: "VIEW", clue: "What you see from summit", hint: "Scenic sight" },
                { word: "PHOTO", clue: "Captured view", hint: "Picture memory" }
            ]
        },
        {
            theme: "Food & Comfort",
            words: [
                { word: "FLOUR", clue: "Baking ingredient", hint: "White powder" },
                { word: "BREAD", clue: "Food made from flour", hint: "Baked loaf" },
                { word: "TOAST", clue: "Heated bread", hint: "Crispy slice" },
                { word: "BUTTER", clue: "Spread for toast", hint: "Yellow dairy" },
                { word: "COMFORT", clue: "Feeling from butter toast", hint: "Cozy warmth" },
                { word: "HOME", clue: "Place of comfort", hint: "Safe dwelling" }
            ]
        },
        {
            theme: "Morning & Energy",
            words: [
                { word: "ALARM", clue: "Morning wake-up device", hint: "Clock sound" },
                { word: "COFFEE", clue: "Morning energy drink", hint: "Brown brew" },
                { word: "ENERGY", clue: "What coffee provides", hint: "Power boost" },
                { word: "EXERCISE", clue: "Activity that builds energy", hint: "Workout routine" },
                { word: "STRENGTH", clue: "Result of exercise", hint: "Physical power" },
                { word: "CONFIDENCE", clue: "Feeling from strength", hint: "Self assurance" }
            ]
        }
    ];
}