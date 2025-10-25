/**
 * Bootstrap-Compatible Animation Controller
 * Handles scroll-triggered animations using Intersection Observer API
 */

(function () {
  "use strict";

  // Configuration - Enhanced for more noticeable animations
  const CONFIG = {
    threshold: 0.15, // Trigger when 15% of element is visible
    rootMargin: "0px 0px -10% 0px", // Trigger slightly before element enters viewport
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
        el.classList.add("animate-active");
        el.style.opacity = "1";
        el.style.transform = "none";
      });
      return;
    }

    // Create intersection observer
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Add animate-active class when element enters viewport
          entry.target.classList.add("animate-active");

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
   * @param {number} delayIncrement - Delay increment in ms (default: 120)
   */
  function addStaggeredAnimation(
    containerSelector,
    childSelector,
    delayIncrement = 120
  ) {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    const children = container.querySelectorAll(childSelector);
    children.forEach((child, index) => {
      child.style.transitionDelay = `${index * delayIncrement}ms`;
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
      // Stagger company cards - increased delay for more noticeable effect
      addStaggeredAnimation("#companyGrid", ".col-12", 120);

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
