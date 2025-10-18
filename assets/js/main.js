/**
 * main.js - Application Entry Point
 * Phase 2: Bootstrap 5.3.3 + Modern JavaScript (ES2024)
 *
 * Initializes all features and components based on the current page.
 */

import { MobileNav } from "./features/navigation/MobileNav.js";
import { SmoothScroll } from "./features/navigation/SmoothScroll.js";
import I18n from "./i18n.js";

/* Ensure Bootstrap Icons CSS is loaded globally (MK) */
(function ensureBootstrapIcons() {
  if (!document.querySelector('link[href*="bootstrap-icons"]')) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href =
      "https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css";
    document.head.appendChild(link);
    console.log("✅ Bootstrap Icons loaded dynamically");
  }
})();

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

    // Initialize i18n loader and language toggle
    this.i18n = new I18n();
    this.i18n.init();
    this.ensureLanguageToggle();

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

        // Build an absolute URL for the href so we can reason about
        // same-origin vs external links. We will defer navigation for
        // same-origin navigations (including hash anchors and internal
        // page paths) so that the offcanvas can finish hiding first.
        // Allow external links (different origin), target=_blank, or
        // downloads to proceed immediately.
        let targetUrl;
        try {
          targetUrl = new URL(href, window.location.href);
        } catch (err) {
          // Malformed URL - don't interfere
          return;
        }

        // Respect explicit target attributes like _blank and download links
        const targetAttr = anchor.getAttribute("target");
        const hasDownload = anchor.hasAttribute("download");
        if (targetAttr === "_blank" || hasDownload) return;

        const isSameOrigin = targetUrl.origin === window.location.origin;
        // Defer navigation only for same-origin navigations (including hashes)
        if (!isSameOrigin) return; // external link - allow default

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

        // Guard against duplicate navigation for the same click target.
        // We'll create a unique token on the anchor so subsequent clicks
        // or re-entrancy won't trigger the same navigation twice.
        if (anchor._deferredNavFired) {
          console.debug(
            "Offcanvas: deferred nav already fired for this anchor",
            href
          );
          return;
        }
        anchor._deferredNavFired = true;

        const doNavigate = () => {
          console.debug(
            "Offcanvas: performing deferred navigation to",
            targetUrl.href
          );
          // If navigation is a hash-only change on the same page, use pushState
          if (
            targetUrl.hash &&
            targetUrl.pathname === window.location.pathname
          ) {
            if (history.pushState)
              history.pushState(null, null, targetUrl.hash);
            else window.location.hash = targetUrl.hash;
          } else {
            // Navigate to the internal page URL
            window.location.href = targetUrl.href;
          }
        };

        // Use the once option to ensure the handler runs only once.
        const onHidden = () => doNavigate();
        offcanvasEl.addEventListener("hidden.bs.offcanvas", onHidden, {
          once: true,
        });

        // Ensure the offcanvas is hidden. Calling hide() explicitly is
        // necessary because we've prevented the default click action which
        // would normally trigger Bootstrap's dismissal when
        // data-bs-dismiss is present.
        try {
          const existing = bootstrap?.Offcanvas?.getInstance?.(offcanvasEl);
          const bsOff = existing || new bootstrap.Offcanvas(offcanvasEl);
          // Only call hide if it's currently shown to avoid re-entrant
          // behavior that could confuse the hidden event ordering.
          if (offcanvasEl.classList.contains("show")) bsOff.hide();
          else {
            // If it's not shown for some reason, trigger the deferred navigation now
            doNavigate();
          }
        } catch (err) {
          console.warn(
            "Offcanvas: error while trying to hide offcanvas, triggering navigation fallback",
            err
          );
          // Fallback: remove show and dispatch hidden event synchronously
          offcanvasEl.classList.remove("show");
          const ev = new Event("hidden.bs.offcanvas");
          offcanvasEl.dispatchEvent(ev);
        }
      });
    }

    // Log successful initialization
    console.log("✅ All features initialized successfully");
  }

  ensureLanguageToggle() {
    // Add an accessible language switch (form-switch) to header actions
    // If a page doesn't include the `.site-header__actions` container (some
    // legacy pages omitted it), create one so the language toggle can be
    // appended. This makes the toggle resilient across pages that load the
    // `assets/js/main.js` module.
    let headerActions = document.querySelector(".site-header__actions");
    if (!headerActions) {
      const header = document.querySelector(".site-header");
      if (header) {
        // Create a minimal actions container matching the header contract
        headerActions = document.createElement("div");
        headerActions.className =
          "d-flex align-items-center gap-2 site-header__actions";

        // Prefer appending into the navbar if present so layout is consistent
        const navbar = header.querySelector(".navbar") || header;
        navbar.appendChild(headerActions);
        console.log(
          "ℹ️ Created missing .site-header__actions container for language toggle"
        );
      } else {
        // No header found; nothing we can do
        return;
      }
    }

    if (document.getElementById("lang-toggle")) return; // already present

    const createSwitch = (idSuffix = "") => {
      const wrapper = document.createElement("div");
      wrapper.className =
        "form-check form-switch m-0 d-flex align-items-center gap-2";

      const input = document.createElement("input");
      input.className = "form-check-input";
      input.type = "checkbox";
      input.id = `lang-toggle${idSuffix}`;
      input.setAttribute("role", "switch");

      const label = document.createElement("label");
      label.className = "form-check-label mb-0";
      label.setAttribute("for", `lang-toggle${idSuffix}`);
      label.id = `lang-toggle-label${idSuffix}`;

      wrapper.appendChild(input);
      wrapper.appendChild(label);

      return { wrapper, input, label };
    };

    const { wrapper, input, label } = createSwitch();

    // Label shows the currently selected language.
    const setLabel = (lang) => {
      label.textContent = lang === "en" ? "English" : "日本語";
      input.setAttribute("aria-checked", String(lang !== "en"));
      input.checked = lang !== "en";
    };

    // Initialize state
    const current = this.i18n.getCurrentLanguage();
    setLabel(current);

    input.addEventListener("change", async () => {
      const newLang = input.checked ? "ja" : "en";
      if (newLang !== "en") {
        await this.i18n.loadLocale(newLang);
      }
      this.i18n.setLanguage(newLang);
      setLabel(newLang);
    });

    // Place the switch at the far right of the header actions.
    // Use Bootstrap spacing utilities to push it to the end on large screens.
    wrapper.classList.add("ms-3", "ms-lg-auto");

    // If there's a flex container that contains actions, append the switch
    // there so it visually sits at the far end. This ensures it's the last
    // element on the header row and aligned to the right on wide screens.
    const actionsContainer = headerActions.closest(".navbar") || headerActions;
    // Prefer appending to the actions container itself to guarantee right-most
    // placement. If that fails, fallback to the original insertion next to
    // the login button.
    try {
      actionsContainer
        .querySelector(".site-header__actions")
        ?.appendChild(wrapper);
    } catch (err) {
      const loginBtn = headerActions.querySelector(".site-header__login-btn");
      if (loginBtn) loginBtn.insertAdjacentElement("afterend", wrapper);
      else headerActions.appendChild(wrapper);
    }

    // Also add a copy of the switch to the mobile offcanvas actions if present
    const offcanvas = document.getElementById("siteOffcanvas");
    if (offcanvas) {
      // place inside the bottom action row if present
      const bottomRow =
        offcanvas.querySelector(".mt-auto.d-flex") ||
        offcanvas.querySelector(".offcanvas-body");
      if (bottomRow) {
        // create a separate switch element for offcanvas (do not reuse nodes)
        const {
          wrapper: wrapper2,
          input: input2,
          label: label2,
        } = createSwitch("-off");
        // Sync initial state
        const currentLang = this.i18n.getCurrentLanguage();
        setLabel(currentLang);
        input2.checked = input.checked;
        label2.textContent = label.textContent;
        input2.addEventListener("change", async () => {
          const newLang = input2.checked ? "ja" : "en";
          if (newLang !== "en") {
            await this.i18n.loadLocale(newLang);
          }
          this.i18n.setLanguage(newLang);
          // keep header switch in sync (label shows current language)
          const headerInput = document.getElementById("lang-toggle");
          const headerLabel = document.getElementById("lang-toggle-label");
          if (headerInput) {
            headerInput.checked = input2.checked;
            headerInput.setAttribute("aria-checked", String(input2.checked));
          }
          if (headerLabel)
            headerLabel.textContent = newLang === "en" ? "English" : "日本語";
        });

        // Insert before Login in offcanvas bottom row if buttons exist
        const offLogin = bottomRow.querySelector(".btn-danger");
        if (offLogin) offLogin.insertAdjacentElement("afterend", wrapper2);
        else bottomRow.appendChild(wrapper2);
      }
    }
  }
}

// Start the application
new App();

// This script handles client-side validation and the simulation of a form submission.

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("contactForm");
  const successMessage = document.getElementById("successMessage");

  /**
   * Performs client-side validation using Bootstrap's built-in validation feedback.
   * Note: We rely on the 'form-control' class in the HTML being present.
   * @param {HTMLFormElement} formElement - The form to validate.
   * @returns {boolean} - True if the form is valid, false otherwise.
   */
  function validateForm(formElement) {
    let isValid = true;

    // Clear all previous validation states
    formElement
      .querySelectorAll(".form-control, .form-select")
      .forEach((input) => {
        input.classList.remove("is-invalid");
        input.classList.remove("is-valid");
      });

    // Iterate through all required fields
    formElement.querySelectorAll("[required]").forEach((input) => {
      const value = input.value.trim();
      let fieldValid = true;

      if (!value) {
        fieldValid = false;
      } else if (
        input.type === "email" &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
      ) {
        // Basic email format validation
        fieldValid = false;
      }

      if (!fieldValid) {
        input.classList.add("is-invalid");
        isValid = false;
      } else {
        input.classList.add("is-valid");
      }
    });

    return isValid;
  }

  // Event listener for form submission
  form.addEventListener("submit", function (event) {
    event.preventDefault(); // Stop default form submission
    event.stopPropagation();

    if (validateForm(this)) {
      // Form is valid: Simulate successful submission

      // 1. Hide the form
      form.style.display = "none";

      // 2. Show the success message (with a nice fade effect)
      successMessage.style.opacity = "0";
      successMessage.style.display = "block";

      setTimeout(() => {
        successMessage.style.opacity = "1";
      }, 10); // Small delay to trigger transition

      console.log("Form submitted successfully (simulated)!");
    } else {
      // Form is invalid: Display error messages
      console.log(
        "Validation failed. Please fill out all required fields correctly."
      );
    }
  });

  // Add real-time validation feedback on input change (optional but good UX)
  form.querySelectorAll(".form-control, .form-select").forEach((input) => {
    input.addEventListener("blur", (e) => {
      const target = e.target;

      target.classList.remove("is-invalid");
      target.classList.remove("is-valid");

      if (target.value.trim()) {
        if (
          !target.checkValidity() ||
          (target.type === "email" &&
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(target.value))
        ) {
          target.classList.add("is-invalid");
        } else {
          target.classList.add("is-valid");
        }
      }
    });
  });
});

       // --- Profile Summary Inline Edit Logic ---
function initializeApp() {
    console.log("main.js script loaded successfully from assets/js/ - Initializing Dashboard Logic.");

    // --- DOM Element References ---
    const readDisplay = document.getElementById('read-display');
    const textContent = document.getElementById('text-content');
    const editInput = document.getElementById('edit-input'); // This is the textarea element
    const charCount = document.getElementById('char-count');
    const editBtn = document.getElementById('edit-btn');
    const saveBtn = document.getElementById('save-btn');

    // Ensure all required elements exist before proceeding
    if (!readDisplay || !textContent || !editInput || !charCount || !editBtn || !saveBtn) {
        console.error("One or more required profile dashboard elements are missing. Aborting initialization.");
        return;
    }

    // Get max length property
    const maxLength = editInput.getAttribute('maxlength'); 

    /**
     * Updates the character count display.
     */
    const updateCount = () => {
        const currentLength = editInput.value.length;
        charCount.textContent = `${currentLength} / ${maxLength} characters`;
    };

    // Attach listener and perform initial count update
    editInput.addEventListener('input', updateCount);
    updateCount();

    /**
     * Toggles the editor between read mode and edit mode.
     * This function is attached to the window object so it can be called 
     * directly from the HTML 'onclick' attributes.
     * @param {boolean} isEditing - True to enter edit mode, false to enter read mode (save).
     */
    window.toggleEditMode = function(isEditing) {
        if (isEditing) {
            // --- SWITCH TO EDIT MODE ---

            // 1. Transfer current text from read-only display to the textarea input
            editInput.value = textContent.textContent.trim();

            // 2. Toggle Visibility (Hide read, Show edit & character count)
            readDisplay.classList.add('d-none');
            editInput.classList.remove('d-none');
            charCount.classList.remove('d-none');
            
            // Re-update the count to reflect the text we just loaded into the input
            updateCount(); 

            // 3. Toggle Buttons (Hide edit button, Show save button)
            editBtn.classList.add('d-none');
            saveBtn.classList.remove('d-none'); 

            // 4. Focus on the textarea and move the cursor to the end
            editInput.focus();
            editInput.setSelectionRange(
                editInput.value.length,
                editInput.value.length
            );
        } else {
            // --- SWITCH TO READ/SAVE MODE ---

            // 1. Get the new content from the textarea
            const newContent = editInput.value.trim();

            // 2. Update the read-only display with the new content
            textContent.textContent = newContent;

            // 3. Toggle Visibility (Show read, Hide edit & character count)
            editInput.classList.add('d-none');
            readDisplay.classList.remove('d-none');
            charCount.classList.add('d-none');

            // 4. Toggle Buttons (Show edit button, Hide save button)
            saveBtn.classList.add('d-none');
            editBtn.classList.remove('d-none');

            console.log('Content Saved:', newContent);
            // NOTE: Add your Firestore update logic here in a real app.
        }
    }
}

// Listen for the DOMContentLoaded event to safely run the initialization function
document.addEventListener('DOMContentLoaded', initializeApp);

//userMenu dropdown
document.addEventListener('DOMContentLoaded', () => {
            const userMenuBtn = document.getElementById('user-menu-btn');
            const userMenuDropdown = document.getElementById('user-menu-dropdown');

            // Function to toggle the menu's visibility
            function toggleMenu() {
                userMenuDropdown.classList.toggle('is-active');
            }

            // Event listener to open/close the menu when the button is clicked
            userMenuBtn.addEventListener('click', (e) => {
                e.preventDefault(); // Prevents the link from navigating
                e.stopPropagation(); // Prevents the click from bubbling up to the document
                toggleMenu();
            });

            // Event listener to close the menu when clicking anywhere else on the page
            document.addEventListener('click', (e) => {
                if (!userMenuDropdown.contains(e.target) && e.target !== userMenuBtn) {
                    userMenuDropdown.classList.remove('is-active');
                }
            });
        });

// Inject and handle Dark/Light Mode Toggle (Desktop + Mobile)
// Author: MK
document.addEventListener("DOMContentLoaded", function () {
  const html = document.documentElement;
  const savedTheme = localStorage.getItem("theme") || "light";
  html.setAttribute("data-bs-theme", savedTheme);

  const updateTheme = (isDark) => {
    const newTheme = isDark ? "dark" : "light";
    html.setAttribute("data-bs-theme", newTheme);
    localStorage.setItem("theme", newTheme);

    // Sync both toggles
    const headerIcon = document.querySelector("#theme-toggle-label i");
    const offIcon = document.querySelector("#theme-toggle-label-off i");
    if (headerIcon) headerIcon.className = isDark ? "bi bi-moon" : "bi bi-sun";
    if (offIcon) offIcon.className = isDark ? "bi bi-moon" : "bi bi-sun";

    const headerInput = document.getElementById("theme-toggle");
    const offInput = document.getElementById("theme-toggle-off");
    if (headerInput) headerInput.checked = isDark;
    if (offInput) offInput.checked = isDark;

    // Update navbar classes for consistent theme contrast
    const navbar = document.querySelector(".navbar");
    if (navbar) {
      navbar.classList.toggle("navbar-dark", isDark);
      navbar.classList.toggle("navbar-light", !isDark);
    }
  };

  const createToggle = (idSuffix = "") => {
    const wrapper = document.createElement("div");
    wrapper.className =
      "form-check form-switch m-0 d-flex align-items-center gap-2 theme-toggle-switch";
    wrapper.style.marginLeft = "0.75rem";

    const input = document.createElement("input");
    input.type = "checkbox";
    input.className = "form-check-input";
    input.id = `theme-toggle${idSuffix}`;
    input.checked = savedTheme === "dark";

    const label = document.createElement("label");
    label.className = "form-check-label mb-0";
    label.setAttribute("for", `theme-toggle${idSuffix}`);
    label.id = `theme-toggle-label${idSuffix}`;
    label.innerHTML = `<i class="bi ${savedTheme === "dark" ? "bi-moon" : "bi-sun"}"></i>`;

    wrapper.appendChild(input);
    wrapper.appendChild(label);
    return { wrapper, input };
  };

  // ----- Show toggle only if logged in -----
  const isLoggedIn =
    localStorage.getItem("isLoggedIn") === "true" ||
    sessionStorage.getItem("isLoggedIn") === "true";

  if (!isLoggedIn) {
    console.log("Dark/Light toggle hidden — user not logged in");
    return; // exit early, skip toggle injection entirely
  }

  // ----- Desktop toggle -----
  const headerActions = document.querySelector(".site-header__actions");
  if (headerActions && !document.getElementById("theme-toggle")) {
    const { wrapper, input } = createToggle();
    const langToggle = document.getElementById("lang-toggle");
    if (langToggle) {
      langToggle.closest(".form-check")?.insertAdjacentElement("afterend", wrapper);
    } else {
      headerActions.appendChild(wrapper);
    }
    input.addEventListener("change", () => updateTheme(input.checked));
  }

  // ----- Mobile toggle -----
  const offcanvas = document.getElementById("siteOffcanvas");
  if (offcanvas && !document.getElementById("theme-toggle-off")) {
    const bottomRow =
      offcanvas.querySelector(".mt-auto.d-flex") ||
      offcanvas.querySelector(".offcanvas-body");
    if (bottomRow) {
      const { wrapper, input } = createToggle("-off");
      const offLogin = bottomRow.querySelector(".btn-danger");
      if (offLogin) offLogin.insertAdjacentElement("afterend", wrapper);
      else bottomRow.appendChild(wrapper);
      input.addEventListener("change", () => updateTheme(input.checked));
    }
  }
});
// Logout Button Handler (Global) | Author: MK
document.addEventListener("DOMContentLoaded", function () {
  const logoutBtn = document.querySelector(".logout-btn");

  if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault(); // prevent accidental navigation

      // Remove login-related data
      localStorage.removeItem("isLoggedIn");
      sessionStorage.removeItem("isLoggedIn");
      localStorage.removeItem("userEmail");

      console.log("User logged out — clearing session and redirecting.");

      // Optional: Add a small delay for a smoother UX
      setTimeout(() => {
        window.location.href = "login.html";
      }, 300);
    });
  }
});                                                                                                                                                                                      
      // --- FilterData (normalized) Job listed ---
      const jobData = [
        { id: 1, title: "Mechanic Ground Support", company: "Japan Airline", location: "tokyo", industry: "aviation", salary: 220000, japaneseLevel: "n4", support: "yes" },
        { id: 2, title: "Construction Worker", company: "Mitsubishi Heavy Industries", location: "kyoto", salary: 200000, industry: "construction", japaneseLevel: "n5", support: "yes" },
        { id: 3, title: "Food Service Staff", company: "Local Ramen Shop", location: "osaka", salary: 200000, industry: "food service", japaneseLevel: "n5", support: "yes" },
        { id: 4, title: "Nursing Care Assistant", company: "Harmony Home", location: "kanagawa", salary: 220000, industry: "nursing care", japaneseLevel: "n3", support: "yes" }
      ];

      // --- State (use lowercase tokens consistently) ---
      const state = {
        search: '',
        support: ['all'],
        japaneseLevel: ['any'],
        location: ['all'],
        industry: ['all'],
        minSalary: [0]
      };

      // DOM refs
      const jobListings = document.getElementById('jobListings');
      const noResults = document.getElementById('noResults');
      const resultCountEl = document.getElementById('resultCount');
      const filters = document.querySelectorAll('[data-filter-group]');
      const searchInput = document.getElementById('searchInput');
      const clearBtn = document.getElementById('clearFilters');

      // helper: render jobs
      function renderJobs(jobs) {
        jobListings.innerHTML = '';
        resultCountEl.textContent = jobs.length;

        if (!jobs.length) {
          noResults.classList.remove('d-none');
          return;
        }
        noResults.classList.add('d-none');

        jobs.forEach(job => {
          const col = document.createElement('div');
          col.className = 'col-md-6 col-lg-6';
          col.innerHTML = `
            <div class="card h-100 shadow-sm border-0 job-card">
              <div class="card-body">
                <div class="d-flex justify-content-between">
                  <h5 class="fw-bold mb-1">${escapeHtml(job.title)}</h5>
           
                </div>
                <p class="text-muted mb-2">${escapeHtml(job.company)} · ${capitalize(job.location)}</p>
                <p class="small mb-1"><strong>Industry:</strong> ${capitalize(job.industry)}</p>
                <p class="small mb-1"><strong>Salary:</strong> ¥${job.salary.toLocaleString()}</p>
                     <p class="small mb-1"><strong>Industry:</strong> ${capitalize(job.japaneseLevel)}</p>
                <p class="small mb-1"><strong>Visa Support:</strong> ${capitalize(job.support)}</p>
              </div>
              <div class="card-footer bg-transparent border-0">
                <button class="btn btn-primary w-100">View Details</button>
              </div>
            </div>
          `;
          jobListings.appendChild(col);
        });
      }

      // helpers
      function capitalize(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1);
      }
      function escapeHtml(unsafe) {
        return unsafe.replace(/[&<"'>]/g, function(m) { return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"}[m]); });
      }

      // update button styles for a group
      function updateButtons(groupKey) {
        const container = document.querySelector(`[data-filter-group="${groupKey}"]`);
        if (!container) return;
        container.querySelectorAll('button[data-value]').forEach(btn => {
          const val = String(btn.dataset.value).toLowerCase();
          const salary = parseInt(btn.dataset.salary || '0', 10);
          const active = groupKey === 'minSalary'
            ? state[groupKey].includes(salary)
            : state[groupKey].includes(val);
          if (active) {
            btn.classList.remove('btn-outline-secondary');
            btn.classList.add('btn-outline-secondary', 'active');
       
          } else {
            btn.classList.remove('btn-primary', 'btn-outline-primary', 'active');
            btn.classList.add('btn-outline-secondary');
            btn.classList.remove('btn-secondary');
          }
        });
      }

      // main filter function
      function filterJobs() {
        const search = state.search;
        const isSupportAll = state.support.includes('all');
        const isJapaneseAny = state.japaneseLevel.includes('any');
        const isLocationAll = state.location.includes('all');
        const isIndustryAll = state.industry.includes('all');
        const minSalaryValue = Math.max(...state.minSalary);

        const filtered = jobData.filter(job => {
          // search (title, company, location, japaneseLevel)
          if (search) {
            const hay = (job.title + ' ' + job.company + ' ' + job.location + ' ' + job.japaneseLevel).toLowerCase();
            if (!hay.includes(search)) return false;
          }

          // support
          if (!isSupportAll && !state.support.includes(job.support)) return false;

          // japanese level
          if (!isJapaneseAny && !state.japaneseLevel.includes(job.japaneseLevel)) return false;

          // location
          if (!isLocationAll && !state.location.includes(job.location)) return false;

          // industry
          if (!isIndustryAll && !state.industry.includes(job.industry)) return false;

          // salary
          if (job.salary < minSalaryValue) return false;

          return true;
        });

        renderJobs(filtered);
      }

      // wire up filter buttons (delegated per group)
      filters.forEach(groupEl => {
        const groupKey = groupEl.dataset.filterGroup;
        groupEl.addEventListener('click', e => {
          const btn = e.target.closest('button[data-value]');
          if (!btn) return;

          const rawVal = btn.dataset.value;
          const val = String(rawVal).toLowerCase();
          const salary = parseInt(btn.dataset.salary || '0', 10);

          // determine key and whether clicked is reset/all option
          const isMinSalary = groupKey === 'minSalary';
          const isReset = (
            val === 'all' || val === 'any' || (!isMinSalary && val === '') || (isMinSalary && salary === 0)
          );

          const key = isMinSalary ? salary : val;

          // toggle selection
          if (state[groupKey].includes(key)) {
            // if more than 1 selected, remove; else keep (prevent empty)
            if (state[groupKey].length > 1) {
              state[groupKey] = state[groupKey].filter(v => v !== key);
            }
          } else {
            // add new selection
            state[groupKey].push(key);
          }

          // if reset/all clicked and is now selected -> set alone
          if (isReset && state[groupKey].includes(key)) {
            state[groupKey] = [key];
          }

          // when non-reset selected, remove any 'all' default
          if (!isReset && state[groupKey].length > 1) {
            state[groupKey] = state[groupKey].filter(v => {
              return !(v === 'all' || v === 'any' || v === 0);
            });
          }

          // ensure at least one default remains
          if (state[groupKey].length === 0) {
            if (groupKey === 'support') state[groupKey] = ['all'];
            if (groupKey === 'japaneseLevel') state[groupKey] = ['any'];
            if (groupKey === 'location') state[groupKey] = ['all'];
            if (groupKey === 'industry') state[groupKey] = ['all'];
            if (groupKey === 'minSalary') state[groupKey] = [0];
          }

          updateButtons(groupKey);
          filterJobs();
        });
      });

      // search input
      searchInput.addEventListener('input', () => {
        state.search = searchInput.value.toLowerCase().trim();
        filterJobs();
      });

      // clear filters
      clearBtn.addEventListener('click', (e) => {
        e.preventDefault();
        state.support = ['all'];
        state.japaneseLevel = ['any'];
        state.location = ['all'];
        state.industry = ['all'];
        state.minSalary = [0];

        // update all button groups visually
        ['support','japaneseLevel','location','industry','minSalary'].forEach(k => updateButtons(k));
        searchInput.value = '';
        state.search = '';
        filterJobs();
      });

      // initial render
      window.addEventListener('DOMContentLoaded', () => {
        // ensure all groups reflect initial active button styles
        ['support','japaneseLevel','location','industry','minSalary'].forEach(k => updateButtons(k));
        filterJobs();
      });
    //  JOB ALERT 
    document.addEventListener('DOMContentLoaded', () => {
        // 1. Get references to the elements
        const emailInput = document.getElementById('newsletter-email');
        const signupButton = document.getElementById('signup-button');
        const jobAlertToastEl = document.getElementById('jobAlertToast');

        // 2. Initialize the Bootstrap Toast component
        // Note: bootstrap is available globally since the bundle script is loaded above
        const jobAlertToast = new bootstrap.Toast(jobAlertToastEl, {
            autohide: true,
            delay: 5000 // Toast will hide after 5 seconds
        });

        // 3. Function to update the button state
        const updateButtonState = () => {
            // Check for a non-empty value and basic email format (containing '@')
            const isValid = emailInput.value.trim() !== '' && emailInput.value.includes('@');
       
        };

        // 4. Enable/Disable the button based on input
        emailInput.addEventListener('input', updateButtonState);

        // Run once on load in case the browser pre-fills the input
        updateButtonState();

        // 5. Show the Toast on button click (Demo action)
        signupButton.addEventListener('click', (event) => {
            event.preventDefault(); // Prevent default form submission behavior (though this isn't a form, it's good practice)

            if (!signupButton.disabled) {
                //DEMO ACTION: Show the success Toast
                jobAlertToast.show();

                //DEMO ACTION: Clear the input field and disable the button after "signing up"
                emailInput.value = '';
                updateButtonState();
            }
        });
    });
