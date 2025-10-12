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
      // Ensure links inside the offcanvas navigate after it finishes hiding.
      // This prevents Bootstrap's offcanvas backdrop/overflow from blocking
      // normal navigation (especially when using history or smooth scroll).
      offcanvasEl.addEventListener("click", (e) => {
        const anchor = e.target.closest && e.target.closest("a");
        if (!anchor) return;

        const href = anchor.getAttribute("href");
        if (!href || href.trim() === "") return;

        // Only defer navigation when it's an in-page anchor or the element
        // is intended to dismiss the offcanvas. Otherwise, let the browser
        // handle navigation immediately (avoid unnecessary preventDefault).
        const shouldDefer =
          href.startsWith("#") || anchor.hasAttribute("data-bs-dismiss");
        if (!shouldDefer) return; // allow default navigation

        // If offcanvas isn't actually visible, just navigate immediately.
        if (!offcanvasEl.classList.contains("show")) {
          if (href.startsWith("#")) {
            if (history.pushState) history.pushState(null, null, href);
            else window.location.hash = href;
          } else {
            window.location.href = href;
          }
          return;
        }

        // Prevent default navigation; navigate after offcanvas hides.
        e.preventDefault();

        const doNavigate = () => {
          if (href.startsWith("#")) {
            if (history.pushState) history.pushState(null, null, href);
            else window.location.hash = href;
          } else {
            window.location.href = href;
          }
        };

        const onHidden = () => {
          doNavigate();
          offcanvasEl.removeEventListener("hidden.bs.offcanvas", onHidden);
        };

        offcanvasEl.addEventListener("hidden.bs.offcanvas", onHidden);
        // If the link does not have data-bs-dismiss, trigger hide now.
        if (!anchor.hasAttribute("data-bs-dismiss")) {
          const bsOff = bootstrap.Offcanvas.getInstance(offcanvasEl);
          if (bsOff) bsOff.hide();
        }
      });
    }

    // Log successful initialization
    console.log("✅ All features initialized successfully");
  }
}

// Start the application
new App();
