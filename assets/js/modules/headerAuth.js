// ===================================================================
// Header Authentication State Manager
// Updates header navigation based on user login status
// ===================================================================

import { getCookie } from "./storage.js";
import { getUserProfile, getFirstName } from "./userProfile.js";

/**
 * Updates the header to show logged-in user state
 * - Shows user's first name instead of "Login" button
 * - Adds link to profile dashboard
 * - Updates both desktop and mobile navigation
 */
export function updateHeaderAuthState() {
  console.log("🔍 Checking user authentication status...");
  const isLoggedIn = getCookie("isLoggedIn") === "true";
  console.log("IsLoggedIn cookie:", isLoggedIn);

  if (!isLoggedIn) {
    console.log("User not logged in - showing default header");
    return;
  }

  const profile = getUserProfile();
  console.log("User profile:", profile);
  const userName = getFirstName() || profile.email?.split("@")[0] || "User";

  console.log("✅ Updating header for logged-in user:", userName);

  // Update Desktop Navigation
  updateDesktopNav(userName);

  // Update Mobile Navigation (Offcanvas)
  updateMobileNav(userName);
}

/**
 * Updates desktop navigation header
 */
function updateDesktopNav(userName) {
  const desktopActions = document.querySelector(".site-header__actions");

  if (!desktopActions) {
    console.warn("Desktop header actions not found");
    return;
  }

  // Find and replace only the Signup and Login links
  const signupLink = desktopActions.querySelector(".site-header__signup");
  const loginBtn = desktopActions.querySelector(".site-header__login-btn");

  if (signupLink && loginBtn) {
    // Create a wrapper for the user greeting and profile link
    const userSection = document.createElement("div");
    userSection.className = "d-flex align-items-center gap-2 user-auth-section";
    userSection.innerHTML = `
      <span class="text-muted">Hello, <strong>${userName}</strong></span>
      <a
        class="btn btn-outline-primary"
        href="${getProfileDashboardPath()}"
        aria-label="Go to profile dashboard"
      >My Profile</a>
    `;

    // Replace the signup link with the user section
    signupLink.replaceWith(userSection);
    // Remove the login button
    loginBtn.remove();

    console.log("✅ Desktop header updated with user greeting");
  } else {
    console.warn("Signup/Login buttons not found in desktop header");
  }
}

/**
 * Updates mobile navigation (offcanvas)
 */
function updateMobileNav(userName) {
  const mobileActions = document.querySelector(".offcanvas-body .mt-auto");

  if (!mobileActions) {
    console.warn("Mobile header actions not found");
    return;
  }

  // Find and replace only the Signup and Login buttons in mobile nav
  const signupBtn = mobileActions.querySelector('a[href*="createAccount"]');
  const loginBtn = mobileActions.querySelector('a[href*="signin"]');

  if (signupBtn && loginBtn) {
    // Create user section for mobile
    const userSection = document.createElement("div");
    userSection.className = "d-flex flex-column gap-2 user-auth-section";
    userSection.innerHTML = `
      <div class="text-center text-muted">
        Hello, <strong>${userName}</strong>
      </div>
      <a
        class="btn btn-danger w-100"
        href="${getProfileDashboardPath()}"
        data-bs-dismiss="offcanvas"
        aria-label="Go to profile dashboard"
      >My Profile</a>
    `;

    // Replace signup button with user section
    signupBtn.replaceWith(userSection);
    // Remove login button
    loginBtn.remove();

    console.log("✅ Mobile header updated with user greeting");
  } else {
    console.warn("Signup/Login buttons not found in mobile header");
  }
}

/**
 * Determines the correct path to profile dashboard based on current page location
 */
function getProfileDashboardPath() {
  const currentPath = window.location.pathname;

  // If we're in the pages directory or subdirectories
  if (currentPath.includes("/pages/")) {
    // Count how many slashes after /pages/ to determine depth
    const afterPages = currentPath.split("/pages/")[1];
    const slashCount = (afterPages.match(/\//g) || []).length;

    // If we're in a subdirectory (pages/addEdit/, pages/companies/, pages/jobs/, etc.)
    if (slashCount > 0) {
      return "../profileDashboard.html";
    }

    // If we're directly in pages/ (pages/about.html, pages/contact.html, etc.)
    return "profileDashboard.html";
  }

  // If we're at root level (index.html)
  return "pages/profileDashboard.html";
}

/**
 * Initialize header auth state on page load
 */
export function initHeaderAuth() {
  console.log("🚀 HeaderAuth module initializing...");
  console.log("Document ready state:", document.readyState);

  // Check if DOM is already loaded
  if (document.readyState === "loading") {
    console.log("DOM still loading, waiting for DOMContentLoaded...");
    // DOM is still loading, wait for DOMContentLoaded
    window.addEventListener("DOMContentLoaded", () => {
      console.log("DOMContentLoaded fired, updating header...");
      updateHeaderAuthState();
    });
  } else {
    console.log("DOM already loaded, updating header immediately...");
    // DOM is already loaded, update immediately
    updateHeaderAuthState();
  }
}
