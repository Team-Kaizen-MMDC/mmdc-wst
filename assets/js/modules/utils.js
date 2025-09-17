/*
  assets/js/modules/utils.js

  Utilities module (Phase 2):
    - Helpers for lazy-loading, external links, tooltips, and misc utilities.
    - These scripts are placeholders for Phase 2. HTML files keep JS commented
      out for Phase 1 to deliver a CSS-only site.
*/

// ===================================================================
// Utilities Module
// ===================================================================

export const Utils = {
  // Initialize utilities
  init() {
    this.setupLazyLoading();
    this.setupExternalLinks();
    this.setupTooltips();
    this.setupBackToTop();
    console.log("Utils module initialized");
  },

  // Lazy loading for images
  setupLazyLoading() {
    if ("IntersectionObserver" in window) {
      const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.classList.remove("lazy");
            observer.unobserve(img);
          }
        });
      });

      const lazyImages = document.querySelectorAll("img[data-src]");
      lazyImages.forEach((img) => imageObserver.observe(img));
    }
  },

  // Setup external links
  setupExternalLinks() {
    const externalLinks = document.querySelectorAll(
      'a[href^="http"]:not([href*="' + window.location.hostname + '"])'
    );
    externalLinks.forEach((link) => {
      link.setAttribute("target", "_blank");
      link.setAttribute("rel", "noopener noreferrer");
    });
  },

  // Setup Bootstrap tooltips
  setupTooltips() {
    const tooltipTriggerList = [].slice.call(
      document.querySelectorAll('[data-bs-toggle="tooltip"]')
    );
    tooltipTriggerList.map(function (tooltipTriggerEl) {
      return new bootstrap.Tooltip(tooltipTriggerEl);
    });
  },

  // Setup back to top button
  setupBackToTop() {
    // Create back to top button if it doesn't exist
    let backToTopBtn = document.getElementById("backToTop");
    if (!backToTopBtn) {
      backToTopBtn = document.createElement("button");
      backToTopBtn.id = "backToTop";
      backToTopBtn.className = "btn btn-primary back-to-top";
      backToTopBtn.innerHTML = "↑";
      backToTopBtn.setAttribute("aria-label", "Back to top");
      backToTopBtn.style.cssText = `
                position: fixed;
                bottom: 20px;
                right: 20px;
                width: 50px;
                height: 50px;
                border-radius: 50%;
                display: none;
                z-index: 1000;
                border: none;
                font-size: 18px;
                font-weight: bold;
            `;
      document.body.appendChild(backToTopBtn);
    }

    // Show/hide button based on scroll position
    window.addEventListener("scroll", () => {
      if (window.scrollY > 300) {
        backToTopBtn.style.display = "block";
      } else {
        backToTopBtn.style.display = "none";
      }
    });

    // Scroll to top when clicked
    backToTopBtn.addEventListener("click", () => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    });
  },

  // Debounce function
  debounce(func, wait, immediate) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        timeout = null;
        if (!immediate) func(...args);
      };
      const callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func(...args);
    };
  },

  // Throttle function
  throttle(func, limit) {
    let inThrottle;
    return function () {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  },

  // Format date
  formatDate(date, options = {}) {
    const defaultOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return new Intl.DateTimeFormat("en-US", {
      ...defaultOptions,
      ...options,
    }).format(date);
  },

  // Format currency
  formatCurrency(amount, currency = "USD") {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(amount);
  },

  // Get query parameter
  getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
  },

  // Set query parameter
  setQueryParam(param, value) {
    const urlParams = new URLSearchParams(window.location.search);
    urlParams.set(param, value);
    window.history.replaceState(
      {},
      "",
      `${window.location.pathname}?${urlParams}`
    );
  },

  // Copy to clipboard
  async copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.error("Failed to copy text: ", err);
      return false;
    }
  },

  // Generate unique ID
  generateId(prefix = "id") {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  },

  // Check if element is in viewport
  isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <=
        (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  },

  // Get device type
  getDeviceType() {
    const width = window.innerWidth;
    if (width < 576) return "mobile";
    if (width < 768) return "tablet";
    if (width < 992) return "desktop-small";
    return "desktop";
  },

  // Check if user prefers reduced motion
  prefersReducedMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  },

  // Local storage helpers
  storage: {
    set(key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
      } catch (err) {
        console.error("Failed to save to localStorage:", err);
        return false;
      }
    },

    get(key) {
      try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
      } catch (err) {
        console.error("Failed to get from localStorage:", err);
        return null;
      }
    },

    remove(key) {
      try {
        localStorage.removeItem(key);
        return true;
      } catch (err) {
        console.error("Failed to remove from localStorage:", err);
        return false;
      }
    },

    clear() {
      try {
        localStorage.clear();
        return true;
      } catch (err) {
        console.error("Failed to clear localStorage:", err);
        return false;
      }
    },
  },
};
