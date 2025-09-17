/* archived: assets/js/modules/animations.js */

// Original file archived on 2025-09-17

/*
	assets/js/modules/animations.js

	AnimationController module (Phase 2):
		- Controls scroll/hover animations and page transitions.
		- Placeholder code for Phase 2. Disabled in Phase 1 by leaving HTML
			script includes commented; enable when moving to Phase 2.
*/

// ===================================================================
// Animation Controller Module
// ===================================================================

export const AnimationController = {
  // Configuration
  config: {
    observerOptions: {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px",
    },
  },

  // Initialize animations
  init() {
    this.setupScrollAnimations();
    this.setupHoverEffects();
    this.setupPageTransitions();
    console.log("Animation controller initialized");
  },

  // Setup scroll-triggered animations
  setupScrollAnimations() {
    // Only run if user doesn't prefer reduced motion
    if (this.prefersReducedMotion()) {
      return;
    }

    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(
        this.handleIntersection.bind(this),
        this.config.observerOptions
      );

      // Elements to animate on scroll
      const animatedElements = document.querySelectorAll(
        ".fade-in, .slide-up, .slide-left, .slide-right, .scale-in"
      );

      animatedElements.forEach((el) => {
        // Add initial state
        this.setInitialState(el);
        observer.observe(el);
      });
    }
  },

  // Handle intersection observer
  handleIntersection(entries) {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        this.animateElement(entry.target);
      }
    });
  },

  // Set initial state for animations
  setInitialState(element) {
    const animationType = this.getAnimationType(element);

    switch (animationType) {
      case "fade-in":
        element.style.opacity = "0";
        element.style.transition = "opacity 0.6s ease";
        break;

      case "slide-up":
        element.style.transform = "translateY(30px)";
        element.style.opacity = "0";
        element.style.transition = "transform 0.6s ease, opacity 0.6s ease";
        break;

      case "slide-left":
        element.style.transform = "translateX(-30px)";
        element.style.opacity = "0";
        element.style.transition = "transform 0.6s ease, opacity 0.6s ease";
        break;

      case "slide-right":
        element.style.transform = "translateX(30px)";
        element.style.opacity = "0";
        element.style.transition = "transform 0.6s ease, opacity 0.6s ease";
        break;

      case "scale-in":
        element.style.transform = "scale(0.8)";
        element.style.opacity = "0";
        element.style.transition = "transform 0.6s ease, opacity 0.6s ease";
        break;
    }
  },

  // Animate element
  animateElement(element) {
    const animationType = this.getAnimationType(element);

    switch (animationType) {
      case "fade-in":
        element.style.opacity = "1";
        break;

      case "slide-up":
      case "slide-left":
      case "slide-right":
        element.style.transform = "translate(0, 0)";
        element.style.opacity = "1";
        break;

      case "scale-in":
        element.style.transform = "scale(1)";
        element.style.opacity = "1";
        break;
    }

    // Add completed class
    element.classList.add("animation-completed");
  },

  // Get animation type from element classes
  getAnimationType(element) {
    if (element.classList.contains("fade-in")) return "fade-in";
    if (element.classList.contains("slide-up")) return "slide-up";
    if (element.classList.contains("slide-left")) return "slide-left";
    if (element.classList.contains("slide-right")) return "slide-right";
    if (element.classList.contains("scale-in")) return "scale-in";
    return "fade-in"; // default
  },

  // Setup hover effects
  setupHoverEffects() {
    if (this.prefersReducedMotion()) {
      return;
    }

    // Card hover effects
    const cards = document.querySelectorAll(".card");
    cards.forEach((card) => {
      card.addEventListener("mouseenter", () => {
        if (!this.prefersReducedMotion()) {
          card.style.transform = "translateY(-5px)";
          card.style.transition = "transform 0.3s ease";
        }
      });

      card.addEventListener("mouseleave", () => {
        card.style.transform = "translateY(0)";
      });
    });

    // Button hover effects
    const buttons = document.querySelectorAll(".btn");
    buttons.forEach((button) => {
      button.addEventListener("mouseenter", () => {
        if (!this.prefersReducedMotion()) {
          button.style.transform = "translateY(-1px)";
          button.style.transition = "transform 0.2s ease";
        }
      });

      button.addEventListener("mouseleave", () => {
        button.style.transform = "translateY(0)";
      });
    });
  },

  // Setup page transitions
  setupPageTransitions() {
    if (this.prefersReducedMotion()) {
      return;
    }

    // Add page load animation
    document.body.style.opacity = "0";
    document.body.style.transition = "opacity 0.3s ease";

    window.addEventListener("load", () => {
      document.body.style.opacity = "1";
    });

    // Add link transitions
    const internalLinks = document.querySelectorAll(
      'a[href^="/"], a[href^="./"], a[href^="../"]'
    );
    internalLinks.forEach((link) => {
      link.addEventListener("click", (e) => {
        if (!this.prefersReducedMotion()) {
          e.preventDefault();
          const href = link.getAttribute("href");

          document.body.style.opacity = "0";
          setTimeout(() => {
            window.location.href = href;
          }, 200);
        }
      });
    });
  },

  // Check if user prefers reduced motion
  prefersReducedMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  },

  // Animate on scroll utility
  animateOnScroll(selector, animationType = "fade-in") {
    const elements = document.querySelectorAll(selector);
    elements.forEach((el) => {
      el.classList.add(animationType);
      this.setInitialState(el);

      if ("IntersectionObserver" in window) {
        const observer = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              this.animateElement(entry.target);
              observer.unobserve(entry.target);
            }
          });
        }, this.config.observerOptions);
        observer.observe(el);
      }
    });
  },

  // Stagger animations
  staggerAnimation(selector, delay = 100) {
    const elements = document.querySelectorAll(selector);
    elements.forEach((el, index) => {
      setTimeout(() => {
        this.animateElement(el);
      }, index * delay);
    });
  },

  // Pulse animation
  pulse(element, duration = 1000) {
    if (this.prefersReducedMotion()) {
      return;
    }

    element.style.animation = `pulse ${duration}ms ease-in-out`;
    setTimeout(() => {
      element.style.animation = "";
    }, duration);
  },

  // Shake animation
  shake(element, duration = 500) {
    if (this.prefersReducedMotion()) {
      return;
    }

    element.style.animation = `shake ${duration}ms ease-in-out`;
    setTimeout(() => {
      element.style.animation = "";
    }, duration);
  },

  // Add CSS keyframes if not already present
  addKeyframes() {
    if (document.getElementById("animation-keyframes")) {
      return;
    }

    const style = document.createElement("style");
    style.id = "animation-keyframes";
    style.textContent = `
						@keyframes pulse {
								0% { transform: scale(1); }
								50% { transform: scale(1.05); }
								100% { transform: scale(1); }
						}
            
						@keyframes shake {
								0%, 100% { transform: translateX(0); }
								10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
								20%, 40%, 60%, 80% { transform: translateX(5px); }
						}
            
						@keyframes bounce {
								0%, 20%, 53%, 80%, 100% { transform: translateY(0); }
								40%, 43% { transform: translateY(-15px); }
								70% { transform: translateY(-5px); }
								90% { transform: translateY(-2px); }
						}
				`;
    document.head.appendChild(style);
  },
};
