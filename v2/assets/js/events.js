// Base URL for API endpoints
const host = location.origin + location.pathname.replace("/v2/", "/api/");
const page = "";
// Global flag for NSFW content filtering
var isNsfw;


document.addEventListener("DOMContentLoaded", function () {
    setPageTitle();
    setIsNsfw();
    generateHeader(document.body);
    generateMain(document.body);
    
    checkNew();
    addNavigateSuccess(loadContent);
    addPopState(reloadPage);
    loadContent();
});

/**
 * Safely adds a navigation success handler to the window's Navigation API.
 * Ensures single instance of the handler by removing existing ones before adding.
 * 
 * @param {Function} f - Event handler function to execute on navigation success. 
 *                       Must be the same function reference for proper deduplication.
 *                       Receives a NavigateEvent object as parameter.
 * 
 * @example
 * addNavigateSuccess((event) => {
 *   console.log('Navigation succeeded to:', event.destination.url);
 * });
 * 
 * @see [Navigation API]{@link https://developer.mozilla.org/en-US/docs/Web/API/Navigation_API}
 * @see [navigatesuccess event]{@link https://developer.mozilla.org/en-US/docs/Web/API/Navigation/navigatesuccess_event}
 */
function addNavigateSuccess(f) {
    // First remove existing listener to prevent duplicate handlers
    window.navigation.removeEventListener("navigatesuccess", f);
    
    // Add fresh listener for navigation success events
    window.navigation.addEventListener("navigatesuccess", f);
}

/**
 * Safely adds a popstate event listener to the window, ensuring duplicate listeners are removed first.
 * 
 * This function guarantees a single instance of the listener function is attached to the window's
 * popstate event by first removing any existing identical listeners before adding the new one.
 * 
 * @param {Function} f - The callback function to execute on popstate events.
 *                       Receives a PopStateEvent object as parameter.
 * 
 * @example
 * // Add a popstate handler to the window
 * addPopState((event) => {
 *   console.log('Popstate event:', event.state);
 * });
 * 
 * @note Important considerations:
 * - Uses reference-based comparison for listener removal
 * - Requires same function reference for proper removal
 * - Preserves other popstate listeners on the window
 */
function addPopState(f){
    // First remove existing listener to prevent duplicate handlers
    window.removeEventListener("popstate", f);

    // Add fresh listener for popstate events
    window.addEventListener("popstate", f);
}

/**
 * Safely adds an input event listener to an element, ensuring duplicate listeners are removed first
 * 
 * This function guarantees a single instance of the listener function is attached to the element's
 * input event by first removing any existing identical listeners before adding the new one.
 * 
 * @param {HTMLElement} e - The DOM element to attach the listener to
 * @param {Function} f - The callback function to execute on input events
 * 
 * @example
 * // Add a search handler to an input field
 * const searchInput = document.querySelector('#search');
 * addInput(searchInput, debounce(handleSearch, 300));
 * 
 * @note Important considerations:
 * - Uses reference-based comparison for listener removal
 * - Requires same function reference for proper removal
 * - Preserves other input listeners on the element
 * - Works with both 'input' and 'change' events for text elements
 */
function addInput(e, f) {
    // First remove to prevent duplicate listeners
    e.removeEventListener("input", f);
    
    // Add fresh listener with modern options
    e.addEventListener("input", f);
}

/**
 * Ensures a single instance of a keydown event handler is attached to an element.
 * This safely replaces any existing keydown handler with the new one to prevent duplicates.
 * 
 * @param {HTMLElement} e - The target element for keydown events
 * @param {Function} f - The handler function to execute on keydown. 
 *                       Receives the KeyboardEvent as parameter.
 * 
 * @example
 * // Add arrow key navigation to a div
 * addKeyDown(myDiv, (event) => {
 *   if (event.key === 'ArrowRight') advanceSlide();
 * });
 * 
 * @note Uses the pattern:
 * 1. Remove existing handler first to avoid duplicate listeners
 * 2. Add fresh handler to ensure only one instance exists
 * 
 * @warning Handler function identity matters - anonymous functions
 * cannot be removed. Use named functions or constant references
 * for proper removal.
 */
function addKeyDown(e, f) {
    // First remove any existing handler to prevent duplicates
    e.removeEventListener("keydown", f);
    
    // Add the new handler with standard options (bubbles: true, capture: false)
    e.addEventListener("keydown", f);
}

/**
 * Safely adds a click event listener to an element by first removing any existing
 * identical listener to prevent duplicate event handlers.
 * 
 * @param {HTMLElement} e - The DOM element to attach/detach the click handler to
 * @param {Function} f - The callback function to be executed on click event
 * 
 * @example
 * // Add a click handler to a button
 * const myButton = document.getElementById('myBtn');
 * addClick(myButton, () => console.log('Clicked!'));
 * 
 * @remarks
 * - Uses removeEventListener() before addEventListener() to ensure single registration
 * - Both parameters are required for proper operation
 * - Function reference must be the same for removal to work
 * - Does not handle event propagation (bubbling/capturing) configuration
 */
function addClick(e, f) {
    // First remove existing listener to prevent duplicates
    e.removeEventListener("click", f);
    
    // Add fresh event listener with clean registration
    e.addEventListener("click", f);
}