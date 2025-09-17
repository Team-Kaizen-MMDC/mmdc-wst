/* archived: assets/js/main.js */

// Original file archived on 2025-09-17

/*
	assets/js/main.js

	Note: JavaScript is part of Phase 2. These modules exist as placeholders
	and documentation for future interactivity. In Phase 1 the site is
	intentionally delivered as HTML + CSS only — JS includes are commented
	out in HTML files. When enabling Phase 2, uncomment the script tags and
	ensure the site JS is loaded after the DOM.
*/

// ===================================================================
// Main JavaScript Entry Point
// ===================================================================

// Import modules
import { Navigation } from "./modules/navigation.js";
import { FormHandler } from "./modules/forms.js";
import { Utils } from "./modules/utils.js";
import { AnimationController } from "./modules/animations.js";

// ===================================================================
// DOM Content Loaded Event
// ===================================================================

document.addEventListener("DOMContentLoaded", function () {
  console.log("Japan SSW - Website Initialized");

  // Initialize components
  initializeWebsite();
});

// ===================================================================
// Main Initialization Function
// ===================================================================

function initializeWebsite() {
  try {
    // Initialize navigation
    Navigation.init();

    // Initialize form handlers
    FormHandler.init();

    // Initialize animations
    AnimationController.init();

    // Initialize utilities
    Utils.init();

    console.log("All components initialized successfully");
  } catch (error) {
    console.error("Error initializing website:", error);
  }
}

// ===================================================================
// Global Error Handler
// ===================================================================

window.addEventListener("error", function (event) {
  console.error("Global error:", event.error);
  // You can add error reporting here
});

// ===================================================================
// Performance Monitoring
// ===================================================================

window.addEventListener("load", function () {
  // Log performance metrics
  if ("performance" in window) {
    const loadTime =
      performance.timing.loadEventEnd - performance.timing.navigationStart;
    console.log(`Page load time: ${loadTime}ms`);
  }
});

// ===================================================================
// Export for module usage
// ===================================================================

export { initializeWebsite };
