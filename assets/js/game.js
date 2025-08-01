// LADDER - Core Game Logic Module
// Handles game mechanics, UI updates, and puzzle rendering

import { fetchTodaysPuzzle, getTodaysPuzzleInfo } from './database.js';
import { showOfflineNotice } from './pwa.js';

export class LadderGame {
    constructor() {
        // Initial setup that doesn't require the puzzle
        this.currentRungIndex = 0;
        this.wrongGuesses = 0;
        this.maxWrongGuesses = 5;
        this.hintsUsed = 0;
        this.maxHints = 3;
        this.hintedWords = new Set();
        this.wordRevealed = false;
        this.gameEnded = false;
        this.startTime = null;
        this.timerInterval = null;
        
        this.setupEventListeners();
        
        // Get today's puzzle (now async)
        this.initializeAsync();
    }
    
    async initializeAsync() {
        try {
            const { puzzle, puzzleNumber } = await fetchTodaysPuzzle();
            this.currentPuzzle = puzzle;
            this.puzzleNumber = puzzleNumber;
            
            // Complete setup after puzzle is loaded
            this.finishSetup();
        } catch (error) {
            console.error('Failed to initialize puzzle:', error);
            
            // Check if it's a network error
            if (!navigator.onLine || error.name === 'TypeError' || error.message.includes('fetch')) {
                // Network error - show offline notice
                showOfflineNotice();
                return;
            }
            
            // Other error - fallback to hardcoded puzzle
            console.log('Using fallback puzzle due to non-network error');
            // This shouldn't happen with the new database module, but keeping as safety
            this.currentPuzzle = {
                theme: "Fallback Puzzle",
                words: [
                    { word: "ERROR", clue: "Something went wrong", hint: "System issue", revealPattern: [true, false, false, false, false] },
                    { word: "RETRY", clue: "Try again", hint: "Second attempt", revealPattern: [true, false, false, false, false] },
                    { word: "WORKS", clue: "Functions properly", hint: "Success", revealPattern: [true, false, false, false, false] },
                    { word: "GREAT", clue: "Excellent result", hint: "Very good", revealPattern: [true, false, false, false, false] },
                    { word: "HAPPY", clue: "Positive feeling", hint: "Joy", revealPattern: [true, false, false, false, false] },
                    { word: "USER", clue: "Person playing", hint: "You", revealPattern: [true, false, false, false] }
                ]
            };
            this.puzzleNumber = 1;
            this.finishSetup();
        }
    }
    
    finishSetup() {
        // Complete the game setup now that puzzle is loaded
        this.setupGame();
    }
    
    setupGame() {
        document.getElementById('tries-left').textContent = this.maxWrongGuesses;
        
        // Update date display with puzzle number
        const dateDisplay = document.getElementById('date-display');
        const today = new Date();
        const options = { month: 'long', day: 'numeric', year: 'numeric' };
        const formattedDate = today.toLocaleDateString('en-US', options);
        dateDisplay.textContent = `Puzzle #${this.puzzleNumber} • ${formattedDate}`;
        
        // Also update landing page puzzle info
        const landingPuzzleInfo = document.getElementById('landing-puzzle-info');
        if (landingPuzzleInfo) {
            landingPuzzleInfo.textContent = `Puzzle #${this.puzzleNumber} • ${formattedDate}`;
        }
        
        this.renderLadder();
        this.startTimer();
    }
    
    renderLadder() {
        const ladder = document.getElementById('ladder');
        ladder.innerHTML = '';
        
        this.currentPuzzle.words.forEach((wordData, index) => {
            const rung = document.createElement('div');
            rung.className = 'rung';
            rung.id = `rung-${index}`;
            
            if (index === this.currentRungIndex && !this.gameEnded) {
                rung.classList.add('active');
            }
            
            if (index < this.currentRungIndex) {
                rung.classList.add('completed');
            }
            
            const wordDisplay = document.createElement('div');
            wordDisplay.className = 'word-display';
            
            const revealPattern = wordData.revealPattern || this.getMinimalRevealPattern(wordData.word, index);
            
            wordData.word.split('').forEach((letter, letterIndex) => {
                const letterBox = document.createElement('div');
                letterBox.className = 'letter-box';
                
                if (revealPattern[letterIndex] || index < this.currentRungIndex) {
                    letterBox.textContent = letter;
                    letterBox.classList.add('filled');
                }
                
                wordDisplay.appendChild(letterBox);
            });
            
            const hint = document.createElement('div');
            hint.className = 'word-hint';
            hint.textContent = wordData.clue || wordData.hint;
            
            rung.appendChild(wordDisplay);
            rung.appendChild(hint);
            ladder.appendChild(rung);
        });
    }
    
    setupEventListeners() {
        const guessInput = document.getElementById('guess-input');
        const guessButton = document.getElementById('guess-button');
        
        guessButton?.addEventListener('click', () => this.makeGuess());
        
        guessInput?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.makeGuess();
        });
        
        guessInput?.addEventListener('input', (e) => {
            e.target.value = e.target.value.toUpperCase();
        });
        
        guessInput?.focus();
    }
    
    makeGuess() {
        if (this.gameEnded) return;
        
        const guessInput = document.getElementById('guess-input');
        const guess = guessInput.value.trim().toUpperCase();
        const currentWord = this.currentPuzzle.words[this.currentRungIndex].word;
        
        if (!guess) return;
        
        if (guess === currentWord) {
            this.correctGuess();
        } else {
            this.wrongGuess();
        }
        
        guessInput.value = '';
    }
    
    correctGuess() {
        this.currentRungIndex++;
        this.renderLadder();
        this.updateTimerColors(); // Immediately restore current colors after rebuild
        
        document.getElementById('current-rung').textContent = this.currentRungIndex + 1;
        
        if (this.currentRungIndex >= this.currentPuzzle.words.length) {
            this.endGame(true);
        } else {
            this.showFeedback('Correct! Keep climbing!', 'hint');
            document.getElementById('guess-input').focus();
        }
    }
    
    wrongGuess() {
        this.wrongGuesses++;
        const triesLeft = this.maxWrongGuesses - this.wrongGuesses;
        document.getElementById('tries-left').textContent = triesLeft;
        
        if (triesLeft === 0) {
            this.endGame(false);
        } else {
            this.showFeedback(`Not quite right. ${triesLeft} tries remaining.`, 'error');
            document.getElementById('guess-input').focus();
        }
    }
    
    endGame(won) {
        this.gameEnded = true;
        clearInterval(this.timerInterval);
        
        const finalTime = Date.now() - this.startTime;
        const minutes = Math.floor(finalTime / 60000);
        const seconds = Math.floor((finalTime % 60000) / 1000);
        const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        if (won) {
            // Show results popup instead of feedback
            this.showResultsPopup(timeString);
        } else {
            this.showFeedback('💔 Game over! You ran out of tries.', 'error');
        }
        
        // Disable all buttons
        document.getElementById('guess-button').disabled = true;
        document.getElementById('guess-input').disabled = true;
    }
    
    showResultsPopup(timeString) {
        document.getElementById('results-time').textContent = timeString;
        document.getElementById('results-popup').classList.add('show');
        
        // Set up share functionality
        const shareText = `LADDER #${this.puzzleNumber}: ${timeString} ⏱️\n${window.location.origin}`;
        
        document.getElementById('share-text').onclick = async () => {
            const shareData = {
                title: 'LADDER - Daily Word Chain',
                text: `LADDER #${this.puzzleNumber}: ${timeString} ⏱️`,
                url: window.location.origin
            };
            
            if (navigator.share && navigator.canShare(shareData)) {
                try {
                    await navigator.share(shareData);
                } catch (err) {
                    console.log('Share cancelled');
                }
            } else {
                // Fallback: create SMS link for mobile
                const smsLink = `sms:?body=${encodeURIComponent(shareText)}`;
                window.open(smsLink);
            }
        };
        
        document.getElementById('share-copy').onclick = () => {
            navigator.clipboard.writeText(shareText).then(() => {
                const button = document.getElementById('share-copy');
                const originalText = button.textContent;
                button.textContent = 'Copied!';
                setTimeout(() => {
                    button.textContent = originalText;
                }, 2000);
            });
        };
    }
    
    startTimer() {
        this.startTime = Date.now();
        this.updateTimerColors(); // Initial color update
        this.timerInterval = setInterval(() => {
            const elapsed = Date.now() - this.startTime;
            const minutes = Math.floor(elapsed / 60000);
            const seconds = Math.floor((elapsed % 60000) / 1000);
            document.getElementById('timer').textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            
            // Update colors based on elapsed time
            this.updateTimerColors();
        }, 1000);
    }
    
    updateTimerColors() {
        if (this.gameEnded) return;
        
        const elapsed = Date.now() - this.startTime;
        const seconds = elapsed / 1000; // Convert to seconds
        
        if (seconds <= 30) {
            // 0-30 seconds: light blue to purple
            const intensity = Math.min(seconds / 30, 1);
            const hue = 220 - (intensity * 50); // Blue (220) to Purple (270)
            this.setLetterColors(`hsl(${hue}, 80%, 60%)`);
        } else if (seconds <= 60) {
            // 31-60 seconds: purple to bright red (going through magenta/pink)
            const intensity = (seconds - 30) / 30;
            const hue = 270 + (intensity * 90); // Purple (270) to Red (360/0) - goes through magenta
            const actualHue = hue >= 360 ? hue - 360 : hue; // Wrap around to 0-360
            this.setLetterColors(`hsl(${actualHue}, 80%, 65%)`);
        } else {
            // 60+ seconds: bright red
            this.setLetterColors(`hsl(0, 80%, 65%)`);
        }
    }
    
    setLetterColors(color) {
        const filledLetters = document.querySelectorAll('.letter-box.filled');
        filledLetters.forEach(letter => {
            // Don't change completed words (they stay green)
            if (!letter.closest('.rung.completed')) {
                letter.style.backgroundColor = color;
                letter.style.borderColor = color;
            }
        });
    }
    
    showFeedback(message, type) {
        const feedback = document.getElementById('feedback');
        feedback.textContent = message;
        feedback.className = `feedback ${type} show`;
        
        setTimeout(() => {
            feedback.classList.remove('show');
        }, 3000);
    }
    
    getMinimalRevealPattern(word, wordIndex) {
        const pattern = new Array(word.length).fill(false);
        const seed = wordIndex * 7 + word.length * 3;
        
                // Reveal more letters to reduce difficulty
        let lettersToShow = Math.max(2, Math.ceil(word.length * 0.35));
        
        const positions = Array.from({length: word.length}, (_, i) => i);
        
        for (let i = positions.length - 1; i > 0; i--) {
            const j = (seed + i * 17) % (i + 1);
            [positions[i], positions[j]] = [positions[j], positions[i]];
        }
        
        for (let i = 0; i < lettersToShow && i < positions.length; i++) {
            pattern[positions[i]] = true;
        }
        
        return pattern;
    }
}

// Game initialization and control functions
let game;

export function startGame() {
    // Hide offline notice when attempting to start
    document.getElementById('offline-notice').classList.remove('show');
    
    document.getElementById('landing-page').style.display = 'none';
    document.getElementById('game-page').style.display = 'flex';
    game = new LadderGame();
}

export function retryConnection() {
    const button = event.target;
    const originalText = button.textContent;
    
    // Show loading state
    button.innerHTML = '<span class="loading-spinner"></span>Trying...';
    button.disabled = true;
    
    // Hide offline notice and try to start game
    document.getElementById('offline-notice').classList.remove('show');
    
    // Attempt to start the game
    setTimeout(() => {
        startGame();
        // Reset button state
        button.textContent = originalText;
        button.disabled = false;
    }, 1000);
}

// Update landing page puzzle info on load
export function updateLandingInfo() {
    const { puzzleNumber } = getTodaysPuzzleInfo();
    const landingPuzzleInfo = document.getElementById('landing-puzzle-info');
    const today = new Date();
    const options = { month: 'long', day: 'numeric', year: 'numeric' };
    const formattedDate = today.toLocaleDateString('en-US', options);
    landingPuzzleInfo.textContent = `Puzzle #${puzzleNumber} • ${formattedDate}`;
}