#!/usr/bin/env node

/**
 * LADDER Database Letter Reveal Update Script
 * 
 * Updates all database puzzles to use the correct difficulty-based
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
    
    // Theme Strategy Guidelines:
    // Level 1-2 (Mon-Tue): 25-35% total letters, 80% first letter frequency
    // Level 3 (Wed): 20-25% total letters, 60% first letter frequency  
    // Level 4 (Thu): 15-20% total letters, 40% first letter frequency
    // Level 5 (Fri): 12-18% total letters, 30% first letter frequency
    // Level 6 (Sat): 10-15% total letters, 20% first letter frequency
    // Level 7 (Sun): 8-12% total letters, 10% first letter frequency
    
    // Calculate base letters to show (length-based)
    let baseLettersToShow = 1;
    if (word.length >= 6) baseLettersToShow = 2;
    if (word.length >= 9) baseLettersToShow = 3;
    
    // Adjust based on difficulty level
    let lettersToShow = baseLettersToShow;
    
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
 * Calculate difficulty level from puzzle date
 */
function getDifficultyLevel(puzzleDate) {
    const date = new Date(puzzleDate + 'T00:00:00-05:00'); // EST timezone
    const dayOfWeek = date.getDay(); // 0=Sunday, 1=Monday, etc.
    return dayOfWeek === 0 ? 7 : dayOfWeek; // Convert Sunday from 0 to 7
}

/**
 * Generate date seed for consistent randomization
 */
function getDateSeed(puzzleDate) {
    return parseInt(puzzleDate.replace(/-/g, ''));
}

/**
 * Update a single puzzle's letter reveals
 */
async function updatePuzzleReveals(puzzle) {
    console.log(`\n📅 Processing puzzle: ${puzzle.puzzle_date} (${puzzle.theme})`);
    
    const difficultyLevel = getDifficultyLevel(puzzle.puzzle_date);
    const dateSeed = getDateSeed(puzzle.puzzle_date);
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
        .eq('id', puzzle.id);
    
    if (error) {
        console.error(`❌ Failed to update puzzle ${puzzle.puzzle_date}:`, error);
        return false;
    }
    
    console.log(`✅ Updated puzzle ${puzzle.puzzle_date}`);
    return true;
}

/**
 * Update puzzle overrides table as well
 */
async function updatePuzzleOverrides() {
    console.log('\n🔧 Updating puzzle overrides...');
    
    const { data: overrides, error: fetchError } = await supabase
        .from('puzzle_overrides')
        .select('*');
    
    if (fetchError) {
        console.error('❌ Failed to fetch puzzle overrides:', fetchError);
        return;
    }
    
    if (!overrides || overrides.length === 0) {
        console.log('ℹ️  No puzzle overrides found.');
        return;
    }
    
    for (const override of overrides) {
        console.log(`\n🔧 Processing override: ${override.puzzle_date} (${override.theme})`);
        
        const difficultyLevel = getDifficultyLevel(override.puzzle_date);
        const dateSeed = getDateSeed(override.puzzle_date);
        
        const updatedWords = override.words.map((wordData, wordIndex) => {
            const wordSeed = dateSeed + wordIndex * 17;
            const revealedPositions = generateRevealPattern(wordData.word, wordSeed, difficultyLevel);
            
            return {
                ...wordData,
                revealed_letters: revealedPositions
            };
        });
        
        const { error } = await supabase
            .from('puzzle_overrides')
            .update({ words: updatedWords })
            .eq('id', override.id);
        
        if (error) {
            console.error(`❌ Failed to update override ${override.puzzle_date}:`, error);
        } else {
            console.log(`✅ Updated override ${override.puzzle_date}`);
        }
    }
}

/**
 * Main execution function
 */
async function main() {
    console.log('🎯 LADDER Database Letter Reveal Update Script');
    console.log('================================================');
    console.log('Updating all puzzles to use difficulty-based letter revelation...\n');
    
    try {
        // Fetch all daily puzzles
        console.log('📥 Fetching all daily puzzles...');
        const { data: puzzles, error: fetchError } = await supabase
            .from('daily_puzzles')
            .select('*')
            .order('puzzle_date', { ascending: true });
        
        if (fetchError) {
            throw new Error(`Failed to fetch puzzles: ${fetchError.message}`);
        }
        
        if (!puzzles || puzzles.length === 0) {
            console.log('ℹ️  No daily puzzles found.');
            return;
        }
        
        console.log(`📊 Found ${puzzles.length} daily puzzles to update.`);
        
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
        
        // Also update puzzle overrides
        await updatePuzzleOverrides();
        
        console.log('\n📊 Update Summary:');
        console.log(`✅ Successfully updated: ${successCount} puzzles`);
        console.log(`❌ Failed to update: ${failureCount} puzzles`);
        
        if (failureCount === 0) {
            console.log('\n🎉 All database puzzles updated successfully!');
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