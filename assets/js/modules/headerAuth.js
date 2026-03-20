// ===================================================================
// Header Authentication State Manager
// Updates header navigation based on user login status
// ===================================================================

import { getCookie, getRoleFromToken } from "./storage.js";
import { getUserProfile, getFirstName } from "./userProfile.js";

/**
 * Updates the header to show logged-in user state
 * - Shows user's first name instead of "Login" button
 * - Adds link to profile dashboard
 * - Updates both desktop and mobile navigation
 */
export function updateHeaderAuthState() {

  const isLoggedIn = getCookie("isLoggedIn") === "true";


  if (!isLoggedIn) {
  
    return;
  }

  const profile = getUserProfile();

  const userName =
    getFirstName() || profile.email?.split("@")[0] || "-";



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

  // Check if already updated (user section exists)
  if (desktopActions.querySelector(".user-auth-section")) {

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


  } else {

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

  // Check if already updated (user section exists)
  if (mobileActions.querySelector(".user-auth-section")) {

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


  } else {

  }
}

/**
 * Returns the correct dashboard path based on the user's role and current page depth.
 * admin / employer → companyDashboard.html
 * everyone else    → profileDashboard.html
 */
function getProfileDashboardPath() {
  const role = getRoleFromToken();
  const dashboardFile =
    role === "admin" || role === "employer"
      ? "companyDashboard.html"
      : "profileDashboard.html";

  const currentPath = window.location.pathname;

  if (currentPath.includes("/pages/")) {
    const afterPages = currentPath.split("/pages/")[1];
    const slashCount = (afterPages.match(/\//g) || []).length;
    return slashCount > 0 ? `../${dashboardFile}` : dashboardFile;
  }

  return `pages/${dashboardFile}`;
}

/**
 * Initialize header auth state on page load
 */
export function initHeaderAuth() {



  // Check if DOM is already loaded
  if (document.readyState === "loading") {

    // DOM is still loading, wait for DOMContentLoaded
    window.addEventListener("DOMContentLoaded", () => {

      updateHeaderAuthState();
    });
  } else {

    // DOM is already loaded, update immediately
    updateHeaderAuthState();
  }
}
