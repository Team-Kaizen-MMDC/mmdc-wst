// ===================================================================
// Cookie Check
// ===================================================================

import { getCookie } from "./storage.js";
import { clearUserProfile } from "./userProfile.js";

const PROTECTED_REDIRECT_PATH = "signin.html";

/**
 * Checks for the isLoggedIn cookie. If it doesnt exist,
 * redirects the user to the sign-in page.
 */
export function checkAuthAndRedirect() {
  console.log("Checking authentication status...");
  const isLoggedIn = getCookie("isLoggedIn") === "true";

  if (!isLoggedIn) {
    console.warn("User not authenticated. Redirecting to sign-in page.");
    // Ensure redirect happens only if we are not already on the sign-in page
    if (!window.location.href.includes(PROTECTED_REDIRECT_PATH)) {
      window.location.replace(PROTECTED_REDIRECT_PATH);
    }
  } else {
    console.log("User is authenticated.");
  }
}

/**
 * Logs the user out by deleting cookies, clearing profile, and redirecting.
 */
export function logoutAndRedirect(redirectPath = "signin.html") {
  // Clear auth cookies
  document.cookie = `isLoggedIn=; expires=Thu, 01 Jan 1970 00:00:01 GMT; path=/`;
  document.cookie = `email=; expires=Thu, 01 Jan 1970 00:00:01 GMT; path=/`;
  document.cookie = `password=; expires=Thu, 01 Jan 1970 00:00:01 GMT; path=/`;
  document.cookie = `token=; expires=Thu, 01 Jan 1970 00:00:01 GMT; path=/`;

  // Clear session storage
  sessionStorage.clear();

  // Clear user profile from localStorage
  clearUserProfile();

  console.log("User logged out. Cookies and profile cleared. Redirecting...");
  window.location.replace(redirectPath);
}

/**
 * Setup logout button handler
 * Call this to attach logout functionality to a button
 */
export function setupLogoutButton(buttonSelector) {
  const button = document.querySelector(buttonSelector);
  if (button) {
    button.addEventListener("click", (e) => {
      e.preventDefault();
      logoutAndRedirect();
    });
    console.log(`Logout handler attached to: ${buttonSelector}`);
  } else {
    console.warn(`Logout button not found: ${buttonSelector}`);
  }
}
