const { chromium } = require("playwright");
const path = require("path");

(async () => {
  console.log("Starting demo video recording...");

  // Launch browser with video recording enabled
  const browser = await chromium.launch({
    headless: false, // Show browser for better demo effect
    slowMo: 500, // Slow down actions by 500ms for better visibility
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }, // 1080p resolution
    recordVideo: {
      dir: path.join(__dirname, "demo-videos"),
      size: { width: 1920, height: 1080 },
    },
    // Enable highlighting
    locale: "en-US",
  });

  const page = await context.newPage();

  // Inject a visible on-screen cursor and click ripple so the recorded video shows pointer movements
  await page.evaluate(() => {
    if (document.getElementById("playwright-cursor")) return;
    const cursor = document.createElement("div");
    cursor.id = "playwright-cursor";
    cursor.style.position = "fixed";
    cursor.style.left = "0px";
    cursor.style.top = "0px";
    cursor.style.width = "64px";
    cursor.style.height = "64px";
    cursor.style.borderRadius = "50%";
    // High contrast yellow with dark border for visibility on any background
    cursor.style.background = "#FFEB3B";
    cursor.style.border = "3px solid #000";
    cursor.style.zIndex = "2147483647";
    cursor.style.pointerEvents = "none";
    cursor.style.transform = "translate(-50%, -50%) scale(1)";
    cursor.style.transition =
      "left 120ms linear, top 120ms linear, transform 120ms linear, opacity 120ms linear";
    cursor.style.boxShadow = "0 2px 8px rgba(0,0,0,0.4)";
    cursor.style.opacity = "0.98";
    document.body.appendChild(cursor);

    const style = document.createElement("style");
    style.id = "playwright-cursor-style";
    style.textContent = `
      .playwright-click-ripple {
        position: fixed;
        width: 96px;
        height: 96px;
        border-radius: 50%;
        background: rgba(255,235,59,0.98); /* yellow */
        border: 4px solid rgba(0,0,0,0.98);
        box-shadow: 0 0 0 14px rgba(0,0,0,0.45);
        transform: translate(-50%, -50%) scale(0.45);
        opacity: 1;
        z-index: 2147483646;
        pointer-events: none;
        transition: transform 420ms cubic-bezier(.22,.8,.3,1), opacity 420ms ease-out, box-shadow 420ms ease-out;
      }
      .playwright-click-label {
        position: fixed;
        background: rgba(0,0,0,0.85);
        color: #fff;
        font-size: 14px;
        padding: 6px 10px;
        border-radius: 999px;
        transform: translate(-50%, -100%) scale(0.9);
        opacity: 0.98;
        z-index: 2147483646;
        pointer-events: none;
        transition: transform 300ms ease, opacity 300ms ease;
        box-shadow: 0 6px 18px rgba(0,0,0,0.45);
      }
    `;
    document.head.appendChild(style);
  });

  // Add custom CSS for click highlights
  await page.addStyleTag({
    content: `
      @keyframes clickPulse {
        0% {
          box-shadow: 0 0 0 0 rgba(37, 99, 235, 0.7);
          transform: scale(1);
        }
        50% {
          box-shadow: 0 0 0 20px rgba(37, 99, 235, 0);
          transform: scale(1.05);
        }
        100% {
          box-shadow: 0 0 0 0 rgba(37, 99, 235, 0);
          transform: scale(1);
        }
      }
      .playwright-click-highlight {
        animation: clickPulse 0.6s ease-out;
        transition: all 0.3s ease;
      }
    `,
  });

  // Function to highlight element before clicking
  async function highlightAndClick(selector, options = {}) {
    // Find element and center coordinates (viewport-relative)
    const el = await page.$(selector);
    if (!el) {
      throw new Error(`Element not found for selector: ${selector}`);
    }

    const box = await el.boundingBox();
    if (!box) {
      throw new Error(
        `Could not determine bounding box for selector: ${selector}`
      );
    }

    const targetX = Math.round(box.x + box.width / 2);
    const targetY = Math.round(box.y + box.height / 2);

    // Move Playwright's virtual mouse (visible in headed mode) with steps
    await page.mouse.move(targetX, targetY, { steps: 12 });

    // Also animate the injected visual cursor so it appears in the video
    await page.evaluate(
      ({ x, y }) => {
        const c = document.getElementById("playwright-cursor");
        if (c) {
          c.style.left = `${x}px`;
          c.style.top = `${y}px`;
          c.style.opacity = "1";
        }
      },
      { x: targetX, y: targetY }
    );

    // Small hover pause
    await page.waitForTimeout(120);

    // Add highlight class to the element (visual focus)
    await page.evaluate((sel) => {
      const element = document.querySelector(sel);
      if (element) {
        element.classList.add("playwright-click-highlight");
        setTimeout(
          () => element.classList.remove("playwright-click-highlight"),
          700
        );
      }
    }, selector);

    // Create a visual click ripple at the target point then perform mouse click
    await page.evaluate(
      ({ x, y }) => {
        const ripple = document.createElement("div");
        ripple.className = "playwright-click-ripple";
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;
        document.body.appendChild(ripple);

        const label = document.createElement("div");
        label.className = "playwright-click-label";
        label.textContent = "Click";
        // place label slightly above the click point
        label.style.left = `${x}px`;
        label.style.top = `${y - 44}px`;
        document.body.appendChild(label);

        requestAnimationFrame(() => {
          ripple.style.transform = "translate(-50%, -50%) scale(3)";
          ripple.style.opacity = "0";
          ripple.style.boxShadow = "0 0 0 60px rgba(37,99,235,0)";
          label.style.transform = "translate(-50%, -120%) scale(1.15)";
          label.style.opacity = "0";
        });
        setTimeout(() => {
          ripple.remove();
          label.remove();
        }, 700);
      },
      { x: targetX, y: targetY }
    );

    // Perform the actual click via mouse so the movement and click are visible
    await page.mouse.click(targetX, targetY, { button: "left", ...options });

    // Small post-click pause
    await page.waitForTimeout(700);
  }

  // Helper: wait for a select to be populated (options > 1) up to timeout
  async function waitForSelectOptions(selectId, timeout = 3000) {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      const has = await page.evaluate(
        ({ id }) => {
          const el = document.getElementById(id);
          if (!el) return false;
          // Only waits for select elements that have options
          if (el.tagName && el.tagName.toLowerCase() === "select") {
            return el.options && el.options.length > 1;
          }
          return false;
        },
        { id: selectId }
      );
      if (has) return true;
      await page.waitForTimeout(120);
    }
    return false;
  }

  // Helper: set a select by desired value (prefers exact match), supports padded month strings
  async function setSelectValue(
    selectId,
    desiredValue,
    opts = { waitForOptions: true }
  ) {
    // If the target is not a select (e.g., an input), just fill it
    const isSelect = await page.evaluate(
      ({ id }) => {
        const el = document.getElementById(id);
        return !!(el && el.tagName && el.tagName.toLowerCase() === "select");
      },
      { id: selectId }
    );

    if (!isSelect) {
      // Try to fill input/textarea directly
      const selector = `#${selectId}`;
      if (await page.$(selector)) {
        await page
          .fill(selector, String(desiredValue), { timeout: 2000 })
          .catch(() => {});
        // Trigger change in case scripts listen to it
        await page
          .evaluate(
            ({ id, val }) => {
              const el = document.getElementById(id);
              if (el) el.dispatchEvent(new Event("change", { bubbles: true }));
            },
            { id: selectId, val: desiredValue }
          )
          .catch(() => {});
        return true;
      }
      return false;
    }

    if (opts.waitForOptions) {
      await waitForSelectOptions(selectId, 3000).catch(() => null);
    }

    // Try exact value first
    const setExact = await page.evaluate(
      ({ id, val }) => {
        const el = document.getElementById(id);
        if (!el) return false;
        const opt = Array.from(el.options).find((o) => o.value === val);
        if (opt) {
          el.value = val;
          el.dispatchEvent(new Event("change", { bubbles: true }));
          return true;
        }
        return false;
      },
      { id: selectId, val: desiredValue }
    );

    if (setExact) return true;

    // Fallback: try matching by visible text (case-insensitive)
    const setByText = await page.evaluate(
      ({ id, val }) => {
        const el = document.getElementById(id);
        if (!el) return false;
        const opt = Array.from(el.options).find(
          (o) =>
            o.textContent.trim().toLowerCase() ===
            val.toString().trim().toLowerCase()
        );
        if (opt) {
          el.value = opt.value;
          el.dispatchEvent(new Event("change", { bubbles: true }));
          return true;
        }
        return false;
      },
      { id: selectId, val: desiredValue }
    );

    if (setByText) return true;

    // Final fallback: if it's a month and desiredValue is numeric (e.g., 6), pad and try
    const padded =
      typeof desiredValue === "number" || /^[0-9]+$/.test(String(desiredValue))
        ? String(desiredValue).padStart(2, "0")
        : null;

    if (padded) {
      const setPadded = await page.evaluate(
        ({ id, val }) => {
          const el = document.getElementById(id);
          if (!el) return false;
          const opt = Array.from(el.options).find((o) => o.value === val);
          if (opt) {
            el.value = val;
            el.dispatchEvent(new Event("change", { bubbles: true }));
            return true;
          }
          return false;
        },
        { id: selectId, val: padded }
      );

      if (setPadded) return true;
    }

    // As last resort pick the first non-empty option
    await page.evaluate(
      ({ id }) => {
        const el = document.getElementById(id);
        if (!el) return false;
        for (let i = 0; i < el.options.length; i++) {
          const v = el.options[i].value;
          if (v && v !== "") {
            el.selectedIndex = i;
            el.dispatchEvent(new Event("change", { bubbles: true }));
            return true;
          }
        }
        return false;
      },
      { id: selectId }
    );

    return true;
  }

  // Function to scroll smoothly
  async function smoothScroll(distance, duration = 1000) {
    await page.evaluate(
      ({ dist, dur }) => {
        return new Promise((resolve) => {
          const start = window.scrollY;
          const startTime = Date.now();

          function scroll() {
            const now = Date.now();
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / dur, 1);

            // Easing function for smooth scroll
            const easeInOutCubic =
              progress < 0.5
                ? 4 * progress * progress * progress
                : 1 - Math.pow(-2 * progress + 2, 3) / 2;

            window.scrollTo(0, start + dist * easeInOutCubic);

            if (progress < 1) {
              requestAnimationFrame(scroll);
            } else {
              resolve();
            }
          }

          scroll();
        });
      },
      { dist: distance, dur: duration }
    );
  }

  try {
    console.log("Navigating to Create Account page on local server...");
    // Directly open the create account page to focus on registration
    await page.goto("http://127.0.0.1:5500/pages/createAccount.html", {
      waitUntil: "networkidle",
    });
    await page.waitForTimeout(1200);

    // 12. Fill out the signup form
    console.log("Filling out signup form...");
    await page.fill("#email", "john.doe+demo@example.com", { delay: 40 });
    await page.fill("#password", "SecurePass123!", { delay: 40 });
    await page.fill("#passwordConfirm", "SecurePass123!", { delay: 40 });
    // Accept privacy policy (checkbox)
    await highlightAndClick("#privacyPolicy");
    await page.waitForTimeout(400);
    // Submit signup
    console.log("Submitting signup form...");
    await Promise.all([
      page
        .waitForNavigation({ waitUntil: "networkidle", timeout: 5000 })
        .catch(() => null),
      highlightAndClick('button[type="submit"]'),
    ]);
    await page.waitForTimeout(1000);

    // 13. Fill out Profile form (Step 1 of registration)
    console.log("Filling out Profile form...");
    await page.fill("#firstName", "John", { delay: 50 });
    await page.waitForTimeout(400);

    await page.fill("#middleName", "Michael", { delay: 50 });
    await page.waitForTimeout(400);

    await page.fill("#lastName", "Doe", { delay: 50 });
    await page.waitForTimeout(400);

    // Wait for date dropdowns to be populated and fill date of birth
    await page.waitForTimeout(1000); // Wait for JS to populate dropdowns
    // Use helper to set padded month values and trigger change events
    await setSelectValue("dobDay", "15");
    await setSelectValue("dobMonth", "06");
    await setSelectValue("dobYear", "1995");
    await page.waitForTimeout(500);

    // Select gender and nationality
    await page.evaluate(() => {
      const g = document.getElementById("genderSelect");
      if (g) g.value = "Male";
      const nationalitySelect = document.getElementById("nationalitySelect");
      if (nationalitySelect && nationalitySelect.options.length > 1) {
        // Prefer "Filipino" if present
        const idx = Array.from(nationalitySelect.options).findIndex(
          (o) => o.value === "Filipino"
        );
        nationalitySelect.selectedIndex = idx > 0 ? idx : 1;
      }
    });
    await page.waitForTimeout(500);

    // Scroll to see more fields
    await smoothScroll(200, 800);
    await page.waitForTimeout(500);

    // Fill location details
    await page.fill("#location", "Japan", { delay: 50 });
    await page.waitForTimeout(400);

    await page.fill("#city", "Tokyo", { delay: 50 });
    await page.waitForTimeout(400);

    await page.fill("#address", "1-2-3 Shibuya, Shibuya-ku", { delay: 40 });
    await page.waitForTimeout(400);

    // Select field
    await page.evaluate(() => {
      document.getElementById("field").value = "Aviation";
    });
    await page.waitForTimeout(400);

    // Scroll to see Prometric test
    await smoothScroll(200, 800);
    await page.waitForTimeout(500);

    // Select Prometric test
    await page.evaluate(() => {
      const prometricSelect = document.getElementById("prometricTest");
      if (prometricSelect.options.length > 3) {
        prometricSelect.selectedIndex = 3; // Aviation test
      }
    });
    await page.waitForTimeout(500);

    // Scroll to submit button
    await smoothScroll(150, 800);
    await page.waitForTimeout(500);

    // Submit profile form and navigate to the contact step
    console.log("Submitting Profile form and navigating to Contact...");
    await Promise.all([
      page
        .waitForNavigation({ waitUntil: "networkidle", timeout: 5000 })
        .catch(() => null),
      highlightAndClick('button[type="submit"]'),
    ]);
    await page.waitForTimeout(800);

    // If the contact inputs are not present, load contact.html directly (some flows redirect)
    if (!(await page.$("#mobile1"))) {
      await page.goto("http://127.0.0.1:5500/pages/addEdit/contact.html", {
        waitUntil: "networkidle",
      });
      await page.waitForTimeout(600);
    }

    // 14. Fill out Contact form (Step 2 of registration)
    console.log("Filling out Contact form...");
    await page.fill("#mobile1", "09951234567", { delay: 50 });
    await page.waitForTimeout(400);

    await page.fill("#mobile2", "+81-90-1234-5678", { delay: 50 });
    await page.waitForTimeout(400);

    await page.fill("#email", "john.doe@example.com", { delay: 50 });
    await page.waitForTimeout(500);

    // Scroll and submit
    await smoothScroll(150, 800);
    await page.waitForTimeout(500);

    console.log("Submitting Contact form...");
    await Promise.all([
      page
        .waitForNavigation({ waitUntil: "networkidle", timeout: 5000 })
        .catch(() => null),
      highlightAndClick('button[type="submit"]'),
    ]);
    await page.waitForTimeout(1200);

    // 15. Complete subsequent multi-step registration pages by navigating and filling required fields
    const steps = [
      {
        path: "/pages/addEdit/education.html",
        filler: async () => {
          // Wait and fill education required fields
          await page.waitForTimeout(600);
          if (await page.$("#school"))
            await page.fill("#school", "Demo University", { delay: 40 });
          if (await page.$("#degree"))
            await setSelectValue("degree", "BSc Aviation");
          if (await page.$("#field"))
            await page.fill("#field", "Aviation", { delay: 40 });
          // Start date
          await setSelectValue("startMonth", "06");
          await setSelectValue("startYear", "2016");
          // Mark currently studying unchecked and provide end date
          if (await page.$("#CurrentlyStudying")) {
            // ensure it's unchecked
            await page.evaluate(() => {
              const cb = document.getElementById("CurrentlyStudying");
              if (cb) cb.checked = false;
            });
            await setSelectValue("endMonth", "06");
            await setSelectValue("endYear", "2020");
          }
        },
      },
      {
        path: "/pages/addEdit/experience.html",
        filler: async () => {
          await page.waitForTimeout(600);
          if (await page.$("#title"))
            await page.fill("#title", "Maintenance Technician", { delay: 40 });
          if (await page.$("#employmentType"))
            await setSelectValue("employmentType", "Full-time");
          if (await page.$("#company"))
            await page.fill("#company", "Demo Airlines", { delay: 40 });
          await setSelectValue("startMonth", "07");
          await setSelectValue("startYear", "2018");
          // set end date or mark currently working
          if (await page.$("#currentlyWorking")) {
            await page.evaluate(() => {
              const cb = document.getElementById("currentlyWorking");
              if (cb) cb.checked = false;
            });
            await setSelectValue("endMonth", "12");
            await setSelectValue("endYear", "2022");
          }
        },
      },
      {
        path: "/pages/addEdit/skill.html",
        filler: async () => {
          await page.waitForTimeout(400);
          if (await page.$("#skill"))
            await page.fill("#skill", "Aircraft Maintenance", { delay: 40 });
          if (await page.$("#certification"))
            await page.fill("#certification", "Basic Maintenance Cert", {
              delay: 40,
            });
        },
      },
      {
        path: "/pages/addEdit/availability.html",
        filler: async () => {
          await page.waitForTimeout(400);
          if (await page.$("#status"))
            await setSelectValue("status", "Available");
          if (await page.$("#location"))
            await page.fill("#location", "Tokyo", { delay: 40 });
          if (await page.$("#workPreferences"))
            await page.fill("#workPreferences", "Full relocation", {
              delay: 40,
            });
        },
      },
    ];

    for (const s of steps) {
      try {
        await page.goto(`http://127.0.0.1:5500${s.path}`, {
          waitUntil: "networkidle",
        });
        await page.waitForTimeout(700);
        // Run the filler to populate required fields
        await s.filler();
        await page.waitForTimeout(400);
        // Click submit if present
        if (await page.$('button[type="submit"]')) {
          await highlightAndClick('button[type="submit"]');
          await page.waitForTimeout(900);
        }
      } catch (err) {
        console.log(`Error filling step ${s.path}:`, err.message || err);
      }
    }

    // After finishing steps, go to signin and verify login works
    await page.goto("http://127.0.0.1:5500/pages/signin.html", {
      waitUntil: "networkidle",
    });
    await page.waitForTimeout(900);
    await page.fill("#email", "john.doe+demo@example.com", { delay: 40 });
    await page.fill("#password", "SecurePass123!", { delay: 40 });
    await highlightAndClick('button[type="submit"]');
    await page.waitForTimeout(1200);

    console.log("Demo complete! Closing browser...");
  } catch (error) {
    console.error("Error during demo recording:", error);
  } finally {
    // Close the browser (this will finalize the video)
    await context.close();
    await browser.close();

    console.log("Video saved to demo-videos/ directory");
    console.log("Demo video recording complete!");
  }
})();
