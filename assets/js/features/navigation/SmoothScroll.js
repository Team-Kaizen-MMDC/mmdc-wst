/**
 * SmoothScroll.js - Smooth Scrolling for Anchor Links
 *
 * Provides smooth scrolling behavior for internal anchor links
 * with proper offset for fixed header.
 */

export class SmoothScroll {
  constructor() {
    this.headerHeight = this.getHeaderHeight();
    this.init();
  }

  init() {
    // Add smooth scroll behavior to anchor links
    const anchorLinks = document.querySelectorAll('a[href^="#"]');

    anchorLinks.forEach((link) => {
      link.addEventListener("click", (e) => this.handleClick(e));
    });

    console.log("✅ SmoothScroll initialized");
  }

  handleClick(e) {
    const href = e.currentTarget.getAttribute("href");

    // Ignore empty anchors or just '#'
    if (!href || href === "#") {
      e.preventDefault();
      return;
    }

    const targetId = href.substring(1);
    const targetElement = document.getElementById(targetId);

    if (targetElement) {
      e.preventDefault();

      const doScroll = () => {
        // Calculate scroll position with header offset
        const targetPosition =
          targetElement.getBoundingClientRect().top + window.pageYOffset;
        const offsetPosition = targetPosition - this.headerHeight - 20; // 20px extra padding

        // Smooth scroll to position
        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        });

        // Update URL hash without jumping
        if (history.pushState) {
          history.pushState(null, null, `#${targetId}`);
        }

        // Set focus to target element for accessibility
        targetElement.setAttribute("tabindex", "-1");
        targetElement.focus({ preventScroll: true });
      };

      // If an offcanvas is currently open, wait until it is hidden
      // before attempting to scroll (Bootstrap hides offcanvas with animation
      // and sets body overflow which can block scroll attempts).
      const openOffcanvas =
        document.querySelector(".offcanvas.show") ||
        e.currentTarget.closest(".offcanvas");
      if (openOffcanvas && openOffcanvas.classList.contains("show")) {
        const handler = () => {
          doScroll();
          openOffcanvas.removeEventListener("hidden.bs.offcanvas", handler);
        };
        openOffcanvas.addEventListener("hidden.bs.offcanvas", handler);
        // allow Bootstrap to handle the closing (data-bs-dismiss on the link)
      } else {
        doScroll();
      }
    }
  }

  getHeaderHeight() {
    const header = document.querySelector(".site-header");
    return header ? header.offsetHeight : 0;
  }
}
