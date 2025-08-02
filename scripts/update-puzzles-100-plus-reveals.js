#!/usr/bin/env node

/**
 * LADDER Database Letter Reveal Update Script - Puzzles 100+
 * 
 * Updates puzzles from #100 onwards to use the correct difficulty-based
 * letter revelation algorithm per the theme strategy guidelines.
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Supabase configuration
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Need service role for updates
const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Generate difficulty-based reveal pattern following theme strategy
 * @param {string} word - The word to generate pattern for
 * @param {number} seed - Seeded randomization value
 * @param {number} difficultyLevel - 1=Monday, 7=Sunday
 * @returns {number[]} Array of revealed letter positions (0-indexed)
 */
function generateRevealPattern(word, seed, difficultyLevel) {
    console.log(`  Generating pattern for "${word}" (${word.length} letters, Level ${difficultyLevel})`);
    
    // Calculate base letters to show (length-based)
    let baseLettersToShow = 1;
    if (word.length >= 6) baseLettersToShow = 2;
    if (word.length >= 9) baseLettersToShow = 3;
    
    // Target total letter percentages by difficulty - more generous for longer words
    const targetPercentages = {
        1: 0.40, 2: 0.40,  // Mon-Tue: 40% (was too low at 30%)
        3: 0.30,           // Wed: 30%
        4: 0.25,           // Thu: 25%
        5: 0.20,           // Fri: 20%
        6: 0.15,           // Sat: 15%
        7: 0.12            // Sun: 12%
    };
    
    const targetPercentage = targetPercentages[difficultyLevel];
    const targetCount = Math.max(1, Math.round(word.length * targetPercentage));
    let lettersToShow = Math.min(baseLettersToShow, targetCount);
    
    // First letter frequency based on difficulty level
    const firstLetterFrequencies = {
        1: 0.80, 2: 0.80,  // Mon-Tue: 80%
        3: 0.60,           // Wed: 60% 
        4: 0.40,           // Thu: 40%
        5: 0.30,           // Fri: 30%
        6: 0.20,           // Sat: 20%
        7: 0.10            // Sun: 10%
    };
    
    const firstLetterChance = firstLetterFrequencies[difficultyLevel];
    
    // Use seed to determine if first letter should be shown - fix the randomization
    const firstLetterSeed = Math.floor(Math.abs(Math.sin(seed * 7.31 + word.length * 2.17) * 10000)) % 100;
    const showFirstLetter = (firstLetterSeed / 100) < firstLetterChance;
    
    const selectedPositions = [];
    
    // Add first letter if selected
    if (showFirstLetter) {
        selectedPositions.push(0);
        lettersToShow--;
    }
    
    // Create remaining available positions
    const availablePositions = [];
    for (let i = showFirstLetter ? 1 : 0; i < word.length; i++) {
        availablePositions.push(i);
    }
    
    // Seeded shuffle of available positions
    for (let i = availablePositions.length - 1; i > 0; i--) {
        const seedVariation = seed + i * 11 + word.length * 5;
        const j = Math.floor(Math.abs(Math.sin(seedVariation) * 10000)) % (i + 1);
        [availablePositions[i], availablePositions[j]] = [availablePositions[j], availablePositions[i]];
    }
    
    // Select additional positions with anti-adjacency rules
    const minSpacing = word.length <= 4 ? 1 : 2; // Closer spacing for very short words
    
    for (const pos of availablePositions) {
        if (lettersToShow <= 0) break;
        
        // Check if position meets spacing requirements
        const isValidPosition = selectedPositions.every(selectedPos => 
            Math.abs(pos - selectedPos) >= minSpacing
        );
        
        if (isValidPosition) {
            selectedPositions.push(pos);
            lettersToShow--;
        }
    }
    
    // Emergency fallback - respect the first letter decision
    if (selectedPositions.length === 0) {
        if (showFirstLetter) {
            selectedPositions.push(0);
        } else {
            selectedPositions.push(word.length > 2 ? 1 : word.length - 1);
        }
    }
    
    // Sort positions for consistent output
    selectedPositions.sort((a, b) => a - b);
    
    const percentage = (selectedPositions.length / word.length * 100).toFixed(1);
    console.log(`    Result: positions [${selectedPositions.join(', ')}] = ${selectedPositions.length}/${word.length} letters (${percentage}%), first=${showFirstLetter ? 'YES' : 'NO'}`);
    
    return selectedPositions;
}

/**
 * Generate date seed for consistent randomization
 */
function getDateSeed(puzzleNumber) {
    // Use puzzle number for seeding to ensure consistency
    return puzzleNumber * 1000;
}

/**
 * Update a single puzzle's letter reveals
 */
async function updatePuzzleReveals(puzzle) {
    console.log(`\n📅 Processing puzzle #${puzzle.puzzle_number}: ${puzzle.theme} (Level ${puzzle.complexity_level})`);
    
    const difficultyLevel = puzzle.complexity_level;
    const dateSeed = getDateSeed(puzzle.puzzle_number);
    const dayNames = ['', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    console.log(`   Difficulty Level: ${difficultyLevel} (${dayNames[difficultyLevel]})`);
    
    // Update each word's revealed letters
    const updatedWords = puzzle.words.map((wordData, wordIndex) => {
        const wordSeed = dateSeed + wordIndex * 17; // Unique seed per word
        const revealedPositions = generateRevealPattern(wordData.word, wordSeed, difficultyLevel);
        
        return {
            ...wordData,
            revealed_letters: revealedPositions
        };
    });
    
    // Update database
    const { error } = await supabase
        .from('daily_puzzles')
        .update({ words: updatedWords })
        .eq('puzzle_number', puzzle.puzzle_number);
    
    if (error) {
        console.error(`❌ Failed to update puzzle #${puzzle.puzzle_number}:`, error);
        return false;
    }
    
    console.log(`✅ Updated puzzle #${puzzle.puzzle_number}`);
    return true;
}

/**
 * Main execution function
 */
async function main() {
    console.log('🎯 LADDER Database Letter Reveal Update Script - Puzzles 100+');
    console.log('============================================================');
    console.log('Updating puzzles from #100 onwards to use difficulty-based letter revelation...\n');
    
    try {
        // Fetch all daily puzzles from #100 onwards
        console.log('📥 Fetching all daily puzzles from #100 onwards...');
        const { data: puzzles, error: fetchError } = await supabase
            .from('daily_puzzles')
            .select('*')
            .gte('puzzle_number', 100)
            .order('puzzle_number', { ascending: true });
        
        if (fetchError) {
            throw new Error(`Failed to fetch puzzles: ${fetchError.message}`);
        }
        
        if (!puzzles || puzzles.length === 0) {
            console.log('ℹ️  No daily puzzles found from #100 onwards.');
            return;
        }
        
        console.log(`📊 Found ${puzzles.length} daily puzzles to update (starting from #100).`);
        
        // Update each puzzle
        let successCount = 0;
        let failureCount = 0;
        
        for (const puzzle of puzzles) {
            const success = await updatePuzzleReveals(puzzle);
            if (success) {
                successCount++;
            } else {
                failureCount++;
            }
            
            // Small delay to avoid overwhelming the database
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        console.log('\n📊 Update Summary:');
        console.log(`✅ Successfully updated: ${successCount} puzzles`);
        console.log(`❌ Failed to update: ${failureCount} puzzles`);
        
        if (failureCount === 0) {
            console.log('\n🎉 All puzzles from #100 onwards updated successfully!');
            console.log('🔄 Refresh your game to see the new difficulty-based letter patterns.');
        }
        
    } catch (error) {
        console.error('💥 Script failed:', error.message);
        process.exit(1);
    }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n\n⏹️  Script interrupted by user.');
    process.exit(0);
});

// Run the script
main().catch(error => {
    console.error('💥 Unhandled error:', error);
    process.exit(1);
});