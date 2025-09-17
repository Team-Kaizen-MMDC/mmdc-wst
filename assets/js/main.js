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
