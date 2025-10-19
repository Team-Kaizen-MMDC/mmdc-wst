

// ===================================================================
// Cookie Check
// ===================================================================



import { getCookie } from './storage.js';

const PROTECTED_REDIRECT_PATH = 'signin.html';

/**
 * Checks for the 'isLoggedIn' cookie. If it doesn't exist, 
 * redirects the user to the sign-in page.
 */
export function checkAuthAndRedirect() {
    console.log('Checking authentication status...');
    const isLoggedIn = getCookie('isLoggedIn') === 'true';

    if (!isLoggedIn) {
        console.warn('User not authenticated. Redirecting to sign-in page.');
        // Ensure redirect happens only if we are not already on the sign-in page
        if (!window.location.href.includes(PROTECTED_REDIRECT_PATH)) {
             window.location.replace(PROTECTED_REDIRECT_PATH);
        }
    } else {
        console.log('User is authenticated.');
    }
}

/**
 * Logs the user out by deleting the 'isLoggedIn' cookie and redirecting.
 */
export function logoutAndRedirect(redirectPath = 'signin.html') {
    document.cookie = `isLoggedIn=; expires=Thu, 01 Jan 1970 00:00:01 GMT; path=/`;
    console.log('User logged out. Deleting cookie and redirecting.');
    window.location.replace(redirectPath);
}