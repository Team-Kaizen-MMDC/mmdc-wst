// ===================================================================
// Header Authentication State Manager
// Updates header navigation based on user login status
// ===================================================================

import { getCookie, getRoleFromToken } from "./storage.js";
import { getUserProfile, getFirstName, saveUserProfile } from "./userProfile.js";

const _API =
  window.location.port === "8000" ? "http://localhost:3000/api/v1" : "/api/v1";

/**
 * Updates the header to show logged-in user state
 * - Shows user's first name instead of "Login" button
 * - Adds link to profile dashboard
 * - Updates both desktop and mobile navigation
 */
export async function updateHeaderAuthState() {

  const isLoggedIn = getCookie("isLoggedIn") === "true";
  const token = document.cookie
    .split("; ")
    .find((r) => r.startsWith("token="))
    ?.split("=")[1];

  if (!isLoggedIn && !token) {
    return;
  }

  // If firstName not in localStorage, fetch from API and cache it
  if (!getFirstName() || getFirstName() === "User") {
    if (token) {
      try {
        const res = await fetch(`${_API}/profile`, {
          headers: { Authorization: `Bearer ${decodeURIComponent(token)}` },
        });
        if (res.ok) {
          const data = await res.json();
          const p = data?.data?.profile;
          if (p?.firstName) {
            saveUserProfile({
              firstName: p.firstName,
              lastName: p.lastName || "",
              email: p.user?.email || getCookie("email") || "",
            });
          }
        }
      } catch (_) {
        // non-critical — fall through to render with what we have
      }
    }
  }

  const profile = getUserProfile();
  const userName = getFirstName() || profile.email?.split("@")[0] || "-";



  // Update Desktop Navigation
  updateDesktopNav(userName);

  // Update Mobile Navigation (Offcanvas)
  updateMobileNav(userName);
}

/**
 * Updates desktop navigation header
 */
function updateDesktopNav(userName) {
  // Be resilient: some legacy pages do not include the `.site-header__actions` container.
  // Prefer selecting the canonical actions container, but fall back to locating the
  // Signup/Login links anywhere inside the header and replace them in-place.
  const header = document.querySelector('.site-header') || document.querySelector('header');
  if (!header) return;

  // Avoid re-running
  if (header.querySelector('.user-auth-section')) return;

  // Try common selectors first
  let desktopActions = header.querySelector('.site-header__actions');
  // fallback: look for a flex container that typically holds the signup/login
  if (!desktopActions) desktopActions = header.querySelector('.d-flex.align-items-center.gap-2') || header.querySelector('.d-flex.align-items-center') || null;

  // Locate signup and login elements anywhere under header (robust)
  const signupLink = header.querySelector('.site-header__signup') || header.querySelector('a[href*="createAccount"]');
  const loginBtn = header.querySelector('.site-header__login-btn') || header.querySelector('a[href*="signin"]');

  // If neither found, nothing to do
  if (!signupLink && !loginBtn) {
    console.warn('HeaderAuth: Signup/Login links not found in header');
    return;
  }

  // Determine insertion container: prefer the found actions container, else use the parent of signup/login
  const insertContainer = desktopActions || (signupLink ? signupLink.parentElement : (loginBtn ? loginBtn.parentElement : header));

  // Create user section
  const userSection = document.createElement('div');
  userSection.className = 'd-flex align-items-center gap-2 user-auth-section';
  userSection.innerHTML = `
    <span class="text-muted">Hello, <strong>${userName}</strong></span>
    <a
      class="btn btn-outline-primary"
      href="${getProfileDashboardPath()}"
      aria-label="Go to profile dashboard"
    >My Profile</a>
  `;

  // If signupLink exists, replace it with the user section. Otherwise append it into the container.
  if (signupLink) {
    signupLink.replaceWith(userSection);
  } else if (insertContainer) {
    insertContainer.appendChild(userSection);
  }

  // Remove login button if present
  if (loginBtn) loginBtn.remove();
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
