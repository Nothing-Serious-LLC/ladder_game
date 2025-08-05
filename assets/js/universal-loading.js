/**
 * Universal Loading Screen Component
 * A reusable loading screen with the Ladder logo and spinner
 */

// Function to generate the universal loading HTML
function createUniversalLoadingHTML() {
    return `
        <!-- Universal Loading Screen -->
        <div class="universal-loading" id="universal-loading">
            <div class="loading-content">
                <img src="../assets/icons/ladder_transparent.png" alt="Ladder" class="loading-ladder-icon">
                <div class="loading-spinner"></div>
            </div>
        </div>
    `;
}

// Function to inject loading screen into a page
function injectUniversalLoading() {
    const loadingHTML = createUniversalLoadingHTML();
    document.body.insertAdjacentHTML('afterbegin', loadingHTML);
}

// Universal Loading Functions
function showUniversalLoading() {
    const loadingElement = document.getElementById('universal-loading');
    const mainContent = document.getElementById('main-content');
    
    if (loadingElement) {
        loadingElement.classList.remove('hidden');
    }
    if (mainContent) {
        mainContent.style.display = 'none';
    }
}

function hideUniversalLoading() {
    const loadingElement = document.getElementById('universal-loading');
    const mainContent = document.getElementById('main-content');
    
    if (loadingElement) {
        loadingElement.classList.add('hidden');
    }
    if (mainContent) {
        mainContent.style.display = 'flex';
    }
}

// Function to initialize loading screen with promise-based loading
async function initializeWithLoading(loadingFunctions, minDisplayTime = 500) {
    // Show loading screen immediately
    showUniversalLoading();
    
    try {
        // Wait for all loading functions to complete
        await Promise.all(loadingFunctions);
        
        // Ensure minimum display time for smooth UX
        setTimeout(() => {
            hideUniversalLoading();
        }, minDisplayTime);
    } catch (error) {
        console.error('Error during loading initialization:', error);
        // Still hide loading screen even if there are errors
        setTimeout(() => {
            hideUniversalLoading();
        }, minDisplayTime);
    }
}

// Export functions for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        createUniversalLoadingHTML,
        injectUniversalLoading,
        showUniversalLoading,
        hideUniversalLoading,
        initializeWithLoading
    };
}

// Make functions globally available
window.UniversalLoading = {
    createHTML: createUniversalLoadingHTML,
    inject: injectUniversalLoading,
    show: showUniversalLoading,
    hide: hideUniversalLoading,
    initializeWith: initializeWithLoading
};