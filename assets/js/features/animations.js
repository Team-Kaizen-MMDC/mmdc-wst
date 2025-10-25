/**
 * Bootstrap-Compatible Animation Controller
 * Handles scroll-triggered animations using Intersection Observer API
 */

(function () {
  "use strict";

  // Configuration
  const CONFIG = {
    threshold: 0.1, // Trigger when 10% of element is visible
    rootMargin: "0px 0px -50px 0px", // Trigger slightly before element enters viewport
  };

  /**
   * Initialize scroll animations using Intersection Observer
   */
  function initScrollAnimations() {
    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      // Make all elements visible immediately
      document.querySelectorAll(".animate-on-scroll").forEach((el) => {
        el.classList.add("animated");
        el.style.opacity = "1";
      });
      return;
    }

    // Create intersection observer
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Add animated class when element enters viewport
          entry.target.classList.add("animated");

          // Optionally unobserve after animation (one-time animation)
          observer.unobserve(entry.target);
        }
      });
    }, CONFIG);

    // Observe all elements with animate-on-scroll class
    document.querySelectorAll(".animate-on-scroll").forEach((el) => {
      observer.observe(el);
    });
  }

  /**
   * Add staggered animations to child elements
   * @param {string} containerSelector - CSS selector for container
   * @param {string} childSelector - CSS selector for children to animate
   * @param {number} delayIncrement - Delay increment in ms (default: 100)
   */
  function addStaggeredAnimation(
    containerSelector,
    childSelector,
    delayIncrement = 100
  ) {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    const children = container.querySelectorAll(childSelector);
    children.forEach((child, index) => {
      child.style.animationDelay = `${index * delayIncrement}ms`;
    });
  }

  /**
   * Initialize animations when DOM is ready
   */
  function init() {
    // Wait for DOM to be fully loaded
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", initScrollAnimations);
    } else {
      initScrollAnimations();
    }

    // Apply staggered animations to specific sections
    window.addEventListener("load", () => {
      // Stagger company cards
      addStaggeredAnimation("#companyGrid", ".col-12", 80);

      // Stagger job listings
      addStaggeredAnimation("#jobs .list-group", ".list-group-item", 100);
    });
  }

  // Initialize
  init();

  // Export for use in other scripts if needed
  window.AnimationController = {
    initScrollAnimations,
    addStaggeredAnimation,
  };
})();
