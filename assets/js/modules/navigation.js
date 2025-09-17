// ===================================================================
// Navigation Module
// ===================================================================

export const Navigation = {
  // Configuration
  config: {
    scrollThreshold: 100,
    activeClass: "active",
    scrolledClass: "navbar-scroll",
  },

  // Initialize navigation
  init() {
    this.bindEvents();
    this.setupScrollBehavior();
    this.setupMobileToggle();
    console.log("Navigation module initialized");
  },

  // Bind navigation events
  bindEvents() {
    // Smooth scrolling for anchor links
    const navLinks = document.querySelectorAll('a[href^="#"]');
    navLinks.forEach((link) => {
      link.addEventListener("click", this.handleSmoothScroll.bind(this));
    });

    // Window scroll event
    window.addEventListener("scroll", this.handleScroll.bind(this));

    // Window resize event
    window.addEventListener("resize", this.handleResize.bind(this));
  },

  // Handle smooth scrolling
  handleSmoothScroll(event) {
    const href = event.currentTarget.getAttribute("href");

    // Only handle internal anchor links
    if (href.startsWith("#") && href.length > 1) {
      event.preventDefault();

      const target = document.querySelector(href);
      if (target) {
        const offsetTop = target.offsetTop - this.getNavbarHeight();

        window.scrollTo({
          top: offsetTop,
          behavior: "smooth",
        });

        // Update active state
        this.updateActiveState(href);
      }
    }
  },

  // Handle scroll events
  handleScroll() {
    const navbar = document.querySelector(".navbar");
    if (!navbar) return;

    if (window.scrollY > this.config.scrollThreshold) {
      navbar.classList.add(this.config.scrolledClass);
    } else {
      navbar.classList.remove(this.config.scrolledClass);
    }

    // Update active navigation based on scroll position
    this.updateActiveOnScroll();
  },

  // Handle window resize
  handleResize() {
    // Close mobile menu on resize to desktop
    if (window.innerWidth >= 992) {
      const navbarCollapse = document.querySelector(".navbar-collapse");
      if (navbarCollapse && navbarCollapse.classList.contains("show")) {
        const bsCollapse = bootstrap.Collapse.getInstance(navbarCollapse);
        if (bsCollapse) {
          bsCollapse.hide();
        }
      }
    }
  },

  // Setup scroll behavior
  setupScrollBehavior() {
    // Add scroll behavior to all pages
    document.documentElement.style.scrollBehavior = "smooth";
  },

  // Setup mobile toggle
  setupMobileToggle() {
    const navbarToggler = document.querySelector(".navbar-toggler");
    const navbarCollapse = document.querySelector(".navbar-collapse");

    if (navbarToggler && navbarCollapse) {
      // Close menu when clicking on nav links (mobile)
      const navLinks = navbarCollapse.querySelectorAll(".nav-link");
      navLinks.forEach((link) => {
        link.addEventListener("click", () => {
          if (window.innerWidth < 992) {
            const bsCollapse = bootstrap.Collapse.getInstance(navbarCollapse);
            if (bsCollapse) {
              bsCollapse.hide();
            }
          }
        });
      });
    }
  },

  // Update active state
  updateActiveState(activeHref) {
    const navLinks = document.querySelectorAll(".nav-link");
    navLinks.forEach((link) => {
      link.classList.remove(this.config.activeClass);
      if (link.getAttribute("href") === activeHref) {
        link.classList.add(this.config.activeClass);
      }
    });
  },

  // Update active navigation based on scroll position
  updateActiveOnScroll() {
    const sections = document.querySelectorAll("section[id]");
    const navLinks = document.querySelectorAll('.nav-link[href^="#"]');

    let current = "";
    const navbarHeight = this.getNavbarHeight();

    sections.forEach((section) => {
      const sectionTop = section.offsetTop - navbarHeight - 50;
      const sectionHeight = section.offsetHeight;

      if (
        window.scrollY >= sectionTop &&
        window.scrollY < sectionTop + sectionHeight
      ) {
        current = section.getAttribute("id");
      }
    });

    navLinks.forEach((link) => {
      link.classList.remove(this.config.activeClass);
      if (link.getAttribute("href") === `#${current}`) {
        link.classList.add(this.config.activeClass);
      }
    });
  },

  // Get navbar height
  getNavbarHeight() {
    const navbar = document.querySelector(".navbar");
    return navbar ? navbar.offsetHeight : 0;
  },

  // Public method to scroll to section
  scrollToSection(sectionId) {
    const target = document.getElementById(sectionId);
    if (target) {
      const offsetTop = target.offsetTop - this.getNavbarHeight();
      window.scrollTo({
        top: offsetTop,
        behavior: "smooth",
      });
    }
  },
};
