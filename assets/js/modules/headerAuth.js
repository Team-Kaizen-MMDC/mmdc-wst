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

  // Replace Signup/Login with user greeting and profile link
  desktopActions.innerHTML = `
        <span class="text-muted me-2">Hello, <strong>${userName}</strong></span>
        <a
            class="btn btn-outline-primary"
            href="${getProfileDashboardPath()}"
            aria-label="Go to profile dashboard"
        >My Profile</a>
    `;
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

  // Replace Signup/Login with user greeting and profile link
  mobileActions.innerHTML = `
        <div class="d-flex flex-column gap-2 w-100">
            <div class="text-center text-muted">
                Hello, <strong>${userName}</strong>
            </div>
            <a
                class="btn btn-danger w-100"
                href="${getProfileDashboardPath()}"
                data-bs-dismiss="offcanvas"
                aria-label="Go to profile dashboard"
            >My Profile</a>
        </div>
    `;
}

/**
 * Determines the correct path to profile dashboard based on current page location
 */
function getProfileDashboardPath() {
  const currentPath = window.location.pathname;

  // If we're in the pages directory or subdirectories
  if (currentPath.includes("/pages/")) {
    // Check if we're in a subdirectory like pages/addEdit/
    if (currentPath.includes("/addEdit/")) {
      return "../profileDashboard.html";
    }
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
