/**
 * main.js - Application Entry Point
 * Phase 2: Bootstrap 5.3.3 + Modern JavaScript (ES2024)
 *
 * Initializes all features and components based on the current page.
 */

import { MobileNav } from "./features/navigation/MobileNav.js";
import { SmoothScroll } from "./features/navigation/SmoothScroll.js";

/**
 * Initialize application
 */
class App {
  constructor() {
    this.init();
  }

  init() {
    // Wait for DOM to be ready
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => this.initFeatures());
    } else {
      this.initFeatures();
    }
  }

  initFeatures() {
    console.log("🚀 Japan SSW Phase 2 - Initializing...");

    // Initialize mobile navigation
    new MobileNav();

    // Initialize smooth scrolling for anchor links
    new SmoothScroll();

    // Accessibility: return focus to toggler after offcanvas closes (if present)
    const offcanvasEl = document.getElementById("siteOffcanvas");
    if (offcanvasEl) {
      const toggler = document.querySelector(
        '[data-bs-toggle="offcanvas"][data-bs-target="#siteOffcanvas"]'
      );
      offcanvasEl.addEventListener("hidden.bs.offcanvas", () => {
        if (toggler) toggler.focus();
      });
    }

    // Log successful initialization
    console.log("✅ All features initialized successfully");
  }
}

// Start the application
new App();
