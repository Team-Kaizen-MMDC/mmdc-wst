/**
 * MobileNav.js - Mobile Navigation Handler
 *
 * Manages the responsive mobile navigation menu behavior
 * including toggle animations and accessibility features.
 */

export class MobileNav {
  constructor() {
    this.navbar = document.querySelector(".navbar-collapse");
    this.toggler = document.querySelector(".navbar-toggler");

    if (!this.navbar || !this.toggler) {

      return;
    }

    this.init();
  }

  init() {
    // Add event listeners
    this.addEventListeners();

    // Close menu on link click (better UX on mobile)
    this.addLinkClickHandlers();


  }

  addEventListeners() {
    // Close menu when clicking outside
    document.addEventListener("click", (e) => {
      if (this.navbar.classList.contains("show")) {
        if (
          !this.navbar.contains(e.target) &&
          !this.toggler.contains(e.target)
        ) {
          this.closeMenu();
        }
      }
    });

    // Close menu on Escape key
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.navbar.classList.contains("show")) {
        this.closeMenu();
        this.toggler.focus(); // Return focus to toggle button
      }
    });
  }

  addLinkClickHandlers() {
    const navLinks = this.navbar.querySelectorAll(".nav-link");

    navLinks.forEach((link) => {
      link.addEventListener("click", () => {
        // Close menu on mobile after clicking a link
        if (window.innerWidth < 992) {
          // Bootstrap lg breakpoint
          this.closeMenu();
        }
      });
    });
  }

  closeMenu() {
    // Use Bootstrap's Collapse API
    const bsCollapse = bootstrap.Collapse.getInstance(this.navbar);
    if (bsCollapse) {
      bsCollapse.hide();
    }
  }
}
