#!/usr/bin/env node

/**
 * Test script to verify letter revelation patterns match theme strategy
 */

// Copy the reveal pattern function from the main script
function generateRevealPattern(word, seed, difficultyLevel) {
    console.log(`\n🔤 Testing "${word}" (${word.length} letters, Level ${difficultyLevel})`);
    
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
    
    console.log(`   DEBUG: baseLettersToShow=${baseLettersToShow}, targetCount=${targetCount}, lettersToShow=${lettersToShow}`);
    
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
    
    console.log(`   DEBUG: firstLetterSeed=${firstLetterSeed}, firstLetterChance=${firstLetterChance}, showFirstLetter=${showFirstLetter}`);
    
    const selectedPositions = [];
    
    // Add first letter if selected
    if (showFirstLetter) {
        selectedPositions.push(0);
        lettersToShow--;
    }
    
    console.log(`   DEBUG: After first letter decision: selectedPositions=[${selectedPositions.join(', ')}], lettersToShow=${lettersToShow}`);
    
    // Create remaining available positions
    const availablePositions = [];
    for (let i = showFirstLetter ? 1 : 0; i < word.length; i++) {
        availablePositions.push(i);
    }
    
    console.log(`   DEBUG: Before shuffle: availablePositions=[${availablePositions.join(', ')}]`);
    
    // Seeded shuffle of available positions
    for (let i = availablePositions.length - 1; i > 0; i--) {
        const seedVariation = seed + i * 11 + word.length * 5;
        const j = Math.floor(Math.abs(Math.sin(seedVariation) * 10000)) % (i + 1);
        console.log(`   DEBUG: Shuffle step ${i}: j=${j}, swapping positions ${i} and ${j}`);
        [availablePositions[i], availablePositions[j]] = [availablePositions[j], availablePositions[i]];
    }
    
    console.log(`   DEBUG: After shuffle: availablePositions=[${availablePositions.join(', ')}]`);
    
    // Select additional positions with anti-adjacency rules
    const minSpacing = word.length <= 4 ? 1 : 2;
    
    console.log(`   DEBUG: availablePositions=[${availablePositions.join(', ')}], minSpacing=${minSpacing}`);
    
    for (const pos of availablePositions) {
        if (lettersToShow <= 0) break;
        
        const isValidPosition = selectedPositions.every(selectedPos => 
            Math.abs(pos - selectedPos) >= minSpacing
        );
        
        console.log(`   DEBUG: Checking position ${pos}, isValid=${isValidPosition}, lettersToShow=${lettersToShow}`);
        
        if (isValidPosition) {
            selectedPositions.push(pos);
            lettersToShow--;
            console.log(`   DEBUG: Added position ${pos}, selectedPositions=[${selectedPositions.join(', ')}], lettersToShow=${lettersToShow}`);
        }
    }
    
    console.log(`   DEBUG: Before fallback: selectedPositions=[${selectedPositions.join(', ')}], length=${selectedPositions.length}`);
    
    // Emergency fallback - but don't override the first letter decision
    if (selectedPositions.length === 0) {
        const fallbackPos = showFirstLetter ? 0 : (word.length > 2 ? 1 : word.length - 1);
        console.log(`   DEBUG: EMERGENCY FALLBACK! Adding position ${fallbackPos}`);
        selectedPositions.push(fallbackPos);
    }
    
    selectedPositions.sort((a, b) => a - b);
    
    const percentage = (selectedPositions.length / word.length * 100).toFixed(1);
    const actuallyHasFirstLetter = selectedPositions.includes(0);
    const firstLetterText = actuallyHasFirstLetter ? '✅ YES' : '❌ NO';
    
    console.log(`   Positions: [${selectedPositions.join(', ')}]`);
    console.log(`   Letters: ${selectedPositions.length}/${word.length} (${percentage}%)`);
    console.log(`   First letter: ${firstLetterText}`);
    console.log(`   Expected first letter rate: ${(firstLetterChance * 100).toFixed(0)}%`);
    
    return selectedPositions;
}

// Test with diverse word lengths and many samples
console.log('🧪 TESTING LETTER REVELATION ALGORITHM');
console.log('=====================================');

// Test with longer words to see better distribution
const diverseWords = [
    'FIRE', 'SMOKE', 'CHIMNEY', 'HOUSE', 'FAMILY',
    'ELEPHANT', 'BEAUTIFUL', 'DANGEROUS', 'GOVERNMENT', 'STRENGTH',
    'UNDERSTANDING', 'REVOLUTIONARY', 'INTERNATIONAL', 'SOPHISTICATED', 'EXTRAORDINARY'
];

console.log('\n🔄 TESTING ALL DIFFICULTY LEVELS WITH DIVERSE WORDS');
console.log('===================================================');

const dayNames = ['', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

for (let level = 1; level <= 7; level++) {
    console.log(`\n📅 ${dayNames[level].toUpperCase()} (Level ${level})`);
    
    let levelTotalWords = 0;
    let levelWordsWithFirst = 0;
    let levelTotalLetters = 0;
    let levelRevealedLetters = 0;
    
    // Test with many different seeds to get good statistical sampling
    diverseWords.forEach((word, index) => {
        // Use varied seeds to ensure good randomization
        const baseSeed = 20250800 + level * 1000 + index * 73 + word.length * 19;
        const positions = generateRevealPattern(word, baseSeed, level);
        
        levelTotalWords++;
        levelTotalLetters += word.length;
        levelRevealedLetters += positions.length;
        
        if (positions.includes(0)) {
            levelWordsWithFirst++;
        }
    });
    
    const levelFirstRate = (levelWordsWithFirst / levelTotalWords * 100).toFixed(1);
    const levelTotalRate = (levelRevealedLetters / levelTotalLetters * 100).toFixed(1);
    
    // Expected targets for comparison
    const expectedFirst = [0, 80, 80, 60, 40, 30, 20, 10][level];
    const expectedTotal = [0, 40, 40, 30, 25, 20, 15, 12][level];
    
    console.log(`   First letters: ${levelWordsWithFirst}/${levelTotalWords} = ${levelFirstRate}% (target: ${expectedFirst}%)`);
    console.log(`   Total letters: ${levelRevealedLetters}/${levelTotalLetters} = ${levelTotalRate}% (target: ${expectedTotal}%)`);
    
    // Check if we're close to targets
    const firstDiff = Math.abs(parseFloat(levelFirstRate) - expectedFirst);
    const totalDiff = Math.abs(parseFloat(levelTotalRate) - expectedTotal);
    
    if (firstDiff <= 15) { // Within 15% tolerance
        console.log(`   ✅ First letter frequency is reasonable`);
    } else {
        console.log(`   ❌ First letter frequency is off by ${firstDiff.toFixed(1)}%`);
    }
}

console.log('\n✅ Test complete! Review the results above to verify the algorithm matches your theme strategy.');