/*
Record a profile-page demo with Playwright.

Usage (from repo root):
  node demo-videos/record-profile-demo.js

Requirements:
- A local static server serving the site (example used below: http://127.0.0.1:5500)
- Playwright installed (npm i -D playwright)
- This script will create a timestamped .webm file in demo-videos/ without touching any existing videos

What it does:
- Launches Chromium (headed) with a small slowMo so actions are visible
- Creates a context that records video at 1920x1080 into demo-videos/
- Injects a visible cursor overlay and click ripple so the recording shows pointer & clicks
- Performs a small walkthrough of the profile dashboard (edit summary, open experience modal, add entry, save)
- Closes the page and moves the produced video to demo-videos/profile-demo-<timestamp>.webm
*/

const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

(async () => {
  const OUT_DIR = path.resolve(__dirname);
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const friendlyName = `profile-demo-${timestamp}.webm`;
  const friendlyPath = path.join(OUT_DIR, friendlyName);

  // Launch headed so the cursor is visible and interactions render as expected
  const browser = await chromium.launch({ headless: false, slowMo: 60 });

  // Create a context that records video at 1080p into demo-videos
  const context = await browser.newContext({
    recordVideo: { dir: OUT_DIR, size: { width: 1920, height: 1080 } },
    viewport: { width: 1920, height: 1080 },
  });

  const page = await context.newPage();

  // Helper: click a selector when visible. Falls back to DOM click if necessary.
  async function clickWhenReady(selector, options = {}) {
    try {
      const loc = page.locator(selector);
      await loc.waitFor({ state: "visible", timeout: options.timeout || 5000 });
      try {
        await loc.click({ force: !!options.force });
        return true;
      } catch (clickErr) {
        // Try force-click as a secondary attempt (covers overlay/pointer interception)
        try {
          await loc.click({ force: true });
          return true;
        } catch (forceErr) {
          // fall through to evaluate fallback
        }
      }
    } catch (e) {
      // Wait/locator failed; fall through to evaluate fallback
    }

    // Fallback: robust page.evaluate click by text or safe DOM search (avoid passing
    // Playwright-only pseudo-selectors directly to querySelector)
    try {
      const clicked = await page.evaluate((s) => {
        // If the selector contains Playwright-only pseudo-selectors (:has-text, :right-of, etc.)
        // avoid using querySelector with the raw string. Instead try text-matching logic.
        if (
          s.includes(":has-text") ||
          s.includes(":right-of") ||
          s.includes(":left-of") ||
          s.includes(":visible")
        ) {
          const hasTextMatch = /:has-text\((?:"|')(.*?)(?:"|')\)/.exec(s);
          if (hasTextMatch) {
            const text = hasTextMatch[1].trim();
            const candidates = Array.from(
              document.querySelectorAll(
                'a, button, [role=button], input[type="button"]'
              )
            );
            const el = candidates.find(
              (e) => e.textContent && e.textContent.trim().includes(text)
            );
            if (el) {
              el.click();
              return true;
            }
          }

          // As a last resort, try to find by exact common labels
          const commonTexts = [
            "Edit",
            "Add",
            "Save",
            "Sign in",
            "Upload",
            "Close",
          ];
          for (const t of commonTexts) {
            const list = Array.from(document.querySelectorAll("a,button"));
            const found = list.find(
              (e) => e.textContent && e.textContent.trim() === t
            );
            if (found) {
              found.click();
              return true;
            }
          }

          return false;
        }

        // If selector looks like a normal CSS selector (no Playwright pseudo-selectors), try querySelector
        try {
          const el = document.querySelector(s);
          if (el) {
            el.click();
            return true;
          }
        } catch (qsErr) {
          // invalid selector for querySelector — fall through to text-matching
        }

        // Generic fallback: try to click a button or link containing the selector string as visible text
        try {
          const list = Array.from(document.querySelectorAll("a,button"));
          const found = list.find(
            (e) => e.textContent && e.textContent.trim().includes(s)
          );
          if (found) {
            found.click();
            return true;
          }
        } catch (e) {
          // ignore
        }

        return false;
      }, selector);

      if (!clicked) {
        console.warn(
          "clickWhenReady fallback could not find clickable element for selector:",
          selector
        );
        return false;
      }
      return true;
    } catch (ee) {
      console.warn(
        "clickWhenReady failed for",
        selector,
        ee && (ee.message || ee)
      );
      return false;
    }
  }

  // Helper: wait for a bootstrap modal element (by selector) to be fully shown
  async function waitForModal(modalSelector, timeout = 4000) {
    try {
      // Wait for the modal's content to be visible (more reliable than relying on .show class)
      await page.waitForSelector(`${modalSelector} .modal-content`, {
        state: "visible",
        timeout,
      });
      // small delay to allow transition to settle
      await page.waitForTimeout(160);
      return true;
    } catch (e) {
      return false;
    }
  }

  // Helper: open modal programmatically using Bootstrap or page-exposed functions
  async function openModalById(modalId) {
    // modalId should be like '#basicInfoModal' or 'basicInfoModal'
    const id = modalId.replace(/^#/, "");
    // Prefer calling any page-exposed function if available (for experience/education there are helpers)
    if (id === "experienceModal") {
      try {
        await page.evaluate(() => {
          if (typeof window.openExperienceModal === "function")
            window.openExperienceModal(-1);
        });
      } catch (e) {}
    }
    if (id === "educationModal") {
      try {
        await page.evaluate(() => {
          if (typeof window.openEducationModal === "function")
            window.openEducationModal(-1);
        });
      } catch (e) {}
    }

    // Always ensure modal is shown using Bootstrap's Modal API as a fallback
    try {
      await page.evaluate((modalIdInner) => {
        const el = document.getElementById(modalIdInner);
        if (el && window.bootstrap && window.bootstrap.Modal) {
          window.bootstrap.Modal.getOrCreateInstance(el).show();
        } else {
          // Try to click a trigger if present
          const trigger = document.querySelector(
            `[data-bs-target="#${modalIdInner}"]`
          );
          if (trigger) trigger.click();
        }
      }, id);
    } catch (e) {
      // ignore
    }
    // Finally wait for it to appear
    await waitForModal("#" + id, 5000);
  }

  // Helpful: expose a small helper to the page that draws a large, high-contrast cursor and click ripple
  await page.addInitScript(() => {
    // Avoid double injection
    if (window.__playwrightCursorInjected) return;
    window.__playwrightCursorInjected = true;

    const css = `
      #pw-cursor { position: fixed; z-index: 9999999; width: 36px; height: 36px; border-radius: 50%; background: rgba(2,6,23,0.8); border: 3px solid rgba(255,255,255,0.95); pointer-events: none; transform: translate(-50%,-50%); mix-blend-mode: normal; }
      .pw-click-ripple { position: fixed; z-index: 9999998; width: 80px; height: 80px; border-radius: 50%; border: 4px solid rgba(255,255,255,0.9); pointer-events: none; transform: translate(-50%,-50%) scale(0.2); animation: pwRipple 600ms ease-out forwards; }
      @keyframes pwRipple { to { transform: translate(-50%,-50%) scale(1.4); opacity: 0; } }
    `;

    const style = document.createElement("style");
    style.textContent = css;
    document.head.appendChild(style);

    const cursor = document.createElement("div");
    cursor.id = "pw-cursor";
    document.documentElement.appendChild(cursor);

    document.addEventListener(
      "mousemove",
      (e) => {
        cursor.style.left = e.clientX + "px";
        cursor.style.top = e.clientY + "px";
      },
      { passive: true }
    );

    document.addEventListener(
      "click",
      (e) => {
        const ripple = document.createElement("div");
        ripple.className = "pw-click-ripple";
        ripple.style.left = e.clientX + "px";
        ripple.style.top = e.clientY + "px";
        document.documentElement.appendChild(ripple);
        setTimeout(() => ripple.remove(), 800);
      },
      { passive: true }
    );
  });

  try {
    // Base URL and pages
    const BASE = process.env.DEMO_BASE_URL || "http://127.0.0.1:5500";
    const signinUrl = `${BASE}/pages/signin.html`;
    const profileUrl = `${BASE}/pages/profileDashboard.html`;

    // Credentials (override with env vars for CI or different test accounts)
    const DEMO_EMAIL = process.env.DEMO_EMAIL || "juandlc@mail.com";
    const DEMO_PASSWORD = process.env.DEMO_PASSWORD || "Password123!";

    // 1) Go to signin and perform a login (the form on signin.html navigates to profileDashboard.html)
    console.log("Opening signin page:", signinUrl);
    await page.goto(signinUrl, {
      waitUntil: "domcontentloaded",
      timeout: 60000,
    });
    await page.waitForTimeout(600);

    // Fill login form (best-effort, resilient if fields are missing)
    try {
      if (await page.$("#email"))
        await page.fill("#email", DEMO_EMAIL).catch(() => {});
      if (await page.$("#password"))
        await page.fill("#password", DEMO_PASSWORD).catch(() => {});

      // Submit the form and wait for navigation to profile page
      console.log("Submitting login form...");
      await Promise.all([
        page
          .waitForNavigation({ waitUntil: "domcontentloaded", timeout: 60000 })
          .catch(() => {}),
        page
          .click(
            'form#loginForm button[type="submit"], form#loginForm button:has-text("Sign in"), button:has-text("Sign in")'
          )
          .catch(() => {}),
      ]);
    } catch (e) {
      console.warn("Login attempt failed (best-effort):", e.message || e);
    }

    // Ensure we're on the profile page (fallback if navigation didn't happen)
    try {
      await page.waitForURL(/profileDashboard.html/, { timeout: 5000 });
      console.log("Arrived at profile dashboard");
    } catch (e) {
      console.log(
        "Profile page not detected automatically — navigating directly to profileDashboard.html"
      );
      await page.goto(profileUrl, {
        waitUntil: "domcontentloaded",
        timeout: 60000,
      });
    }

    // Wait a moment for animations and to let the cursor show up
    await page.waitForTimeout(1000);

    // Smooth scroll to top of main content
    await page.evaluate(() =>
      document.querySelector("main")?.scrollIntoView({ behavior: "smooth" })
    );
    await page.waitForTimeout(700);

    // 1) Toggle profile edit summary if available — try the modal or a simple edit button
    try {
      // If the page defines a toggleEditMode function, prefer calling it
      await page.evaluate(() => {
        if (typeof toggleEditMode === "function") toggleEditMode(true);
      });
      await page.waitForTimeout(700);
    } catch (e) {
      // Fallback: click an explicit #edit-btn if present
      try {
        const btn = await page.$("#edit-btn");
        if (btn) {
          await btn.click();
          await page.waitForTimeout(700);
        }
      } catch (e) {}
    }

    // ------------------------------------------------------------------
    // Showcasing key profile interactions
    // ------------------------------------------------------------------

    // Edit Basic Info (open modal, change name & location, save)
    try {
      await openModalById("#basicInfoModal");
      const ready = await waitForModal("#basicInfoModal", 4000);
      if (ready) {
        // If modal fields exist, update them
        if (await page.$("#basicInfoModal #modal-name")) {
          await page
            .fill("#basicInfoModal #modal-name", "Demo Profile User")
            .catch(() => {});
        }
        if (await page.$("#basicInfoModal #modal-location")) {
          await page
            .fill("#basicInfoModal #modal-location", "Tokyo, Japan")
            .catch(() => {});
        }

        // Click Save inside modal (modal-scoped selector)
        try {
          await page
            .locator("#basicInfoModal")
            .locator('button[type="submit"], button.btn-primary')
            .first()
            .click({ force: false });
        } catch (e) {
          // Best-effort fallback
          await clickWhenReady('#basicInfoModal button[type="submit"]');
        }
        await page.waitForTimeout(700);
      }
    } catch (e) {
      console.warn("Basic info flow:", e && (e.message || e));
    }

    // Upload resume (if file input present). This is a best-effort demo; it won't fail if no sample file exists.
    try {
      const fileInput = await page.$('input[type="file"]');
      if (fileInput) {
        // If there is a small sample file in repo, use it; otherwise skip.
        const sample = path.resolve(
          process.cwd(),
          "demo-videos",
          "registration-excerpt-thumb.png"
        );
        if (fs.existsSync(sample)) {
          await fileInput.setInputFiles(sample).catch(() => {});
          await page.waitForTimeout(700);
        } else {
          console.log(
            "No sample file available for resume upload demo — skipping file upload step"
          );
        }
      }
    } catch (e) {
      /* ignore upload errors */
    }

    // Add a new Experience entry (target Experience section specifically)
    try {
      // Prefer calling the page helper to open the experience modal
      await page.evaluate(() => {
        if (typeof window.openExperienceModal === "function")
          window.openExperienceModal(-1);
      });
      await waitForModal("#experienceModal", 4000);
      if (await page.$("#experienceModal")) {
        await page
          .fill("#experienceModal #job", "Demo Sushi Chef")
          .catch(() => {});
        await page
          .fill("#experienceModal #company", "Tokyo Demos")
          .catch(() => {});
        await page
          .selectOption("#experienceModal #expStartMonth", {
            label: "February",
          })
          .catch(() => {});
        await page
          .selectOption("#experienceModal #expStartYear", {
            label: (new Date().getFullYear() - 2).toString(),
          })
          .catch(() => {});
        try {
          await page
            .locator("#experienceModal")
            .locator('button[type="submit"], button.btn-primary')
            .first()
            .click();
        } catch (e) {
          await clickWhenReady('#experienceModal button[type="submit"]');
        }
        await page.waitForTimeout(800);
      }
    } catch (e) {
      console.warn("Add experience:", e && (e.message || e));
    }

    // Open Skills modal to show skills management
    try {
      await openModalById("#skillsModal");
      const ready = await waitForModal("#skillsModal", 3000);
      if (ready) {
        try {
          await page
            .locator("#skillsModal")
            .locator('button[type="submit"], button.btn-primary')
            .first()
            .click();
        } catch (e) {
          await clickWhenReady('#skillsModal button[type="submit"]');
        }
        await page.waitForTimeout(500);
      }
    } catch (e) {
      /* ignore */
    }

    // Open Availability modal (if present)
    try {
      await openModalById("#availabilityModal");
      const ready = await waitForModal("#availabilityModal", 3000);
      if (ready) {
        try {
          await page
            .locator("#availabilityModal")
            .locator('button[type="submit"], button.btn-primary')
            .first()
            .click();
        } catch (e) {
          await clickWhenReady('#availabilityModal button[type="submit"]');
        }
        await page.waitForTimeout(500);
      }
    } catch (e) {
      /* ignore */
    }

    // Scroll through the page so the recording captures the layout
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "smooth" }));
    await page.waitForTimeout(600);
    await page.evaluate(() =>
      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" })
    );
    await page.waitForTimeout(900);

    // 2) Open Experience modal and add a short entry
    try {
      const addExp = await page.$("a:has-text('Add')");
      if (addExp) {
        await addExp.click();
        await page.waitForTimeout(800);
      }
      // If modal form exists, try filling in a few fields (best-effort)
      if (await page.$("#experienceModal")) {
        await page.fill("#job", "Demo Cook");
        await page.fill("#company", "Demo Kitchen");
        await page
          .selectOption("#expStartMonth", { label: "January" })
          .catch(() => {});
        await page
          .selectOption("#expStartYear", {
            label: new Date().getFullYear().toString(),
          })
          .catch(() => {});
        // Submit
        const saveBtn = await page.$(
          "#experienceModal button:has-text('Save')"
        );
        if (saveBtn) await saveBtn.click();
        await page.waitForTimeout(900);
      }
    } catch (e) {
      console.warn("Experience flow: ", e.message);
    }

    // 3) Open Education modal (if present) and add a short entry
    try {
      const addEdu = await page.$(
        "a:has-text('Add'):right-of(h4:has-text('Education'))"
      );
      // fallback: button opening #educationModal
      const eduTrigger = await page.$(
        '[data-bs-target="#educationModal"], a:has-text("Education")'
      );
      if (eduTrigger) {
        await eduTrigger.click();
        await page.waitForTimeout(800);
      }
      if (await page.$("#educationModal")) {
        await page.fill("#school", "Demo University");
        await page.fill("#degree", "Certificate in Demo");
        await page
          .selectOption("#eduStartMonth", { label: "April" })
          .catch(() => {});
        await page
          .selectOption("#eduStartYear", {
            label: (new Date().getFullYear() - 1).toString(),
          })
          .catch(() => {});
        const saveEdu = await page.$("#educationModal button:has-text('Save')");
        if (saveEdu) await saveEdu.click();
        await page.waitForTimeout(900);
      }
    } catch (e) {
      console.warn("Education flow: ", e.message);
    }

    // 4) Interact with availability / preferences and scroll through the page
    try {
      await page.evaluate(() =>
        window.scrollTo({
          top: document.body.scrollHeight / 2,
          behavior: "smooth",
        })
      );
      await page.waitForTimeout(900);
      // click first Edit-like control we can find in availability area
      const availEdit = await page.$("#availabilityModal, a:has-text('Edit')");
      if (availEdit) {
        await availEdit.click();
        await page.waitForTimeout(700);
      }
    } catch (e) {
      /* ignore */
    }

    // Let the recording capture a few seconds of the resulting UI
    await page.waitForTimeout(2200);

    // Close page to finalize video file
    const video = page.video();
    await page.close();

    // The recorded video will be available at video.path() (Playwright temporary file)
    const recordedPath = await video.path();
    console.log("Recorded video temporary path:", recordedPath);

    // Move/rename the temporary file to a friendly name inside demo-videos
    await fs.promises.copyFile(recordedPath, friendlyPath);
    console.log("Saved profile demo to:", friendlyPath);

    // Optionally remove the Playwright temporary file (best-effort)
    try {
      await fs.promises.unlink(recordedPath);
    } catch (e) {
      /* ignore */
    }

    // --- Attempt to create a friendly MP4 copy using ffmpeg ---
    const friendlyMp4 = friendlyPath.replace(/\.webm$/i, ".mp4");

    async function ffmpegAvailable() {
      return new Promise((resolve) => {
        const p = spawn("ffmpeg", ["-version"]);
        p.on("error", () => resolve(false));
        p.on("exit", (code) => resolve(code === 0));
      });
    }

    async function runFfmpeg(inFile, outFile) {
      return new Promise((resolve, reject) => {
        // Use conservative encode settings suitable for GitHub/web delivery
        const args = [
          "-y",
          "-i",
          inFile,
          "-c:v",
          "libx264",
          "-preset",
          "slow",
          "-crf",
          "18",
          "-c:a",
          "aac",
          "-b:a",
          "128k",
          "-movflags",
          "+faststart",
          outFile,
        ];

        const proc = spawn("ffmpeg", args, {
          stdio: ["ignore", "pipe", "pipe"],
        });

        proc.stdout.on("data", (d) => {});
        proc.stderr.on("data", (d) => {});

        proc.on("error", (err) => reject(err));
        proc.on("close", (code) => {
          if (code === 0) resolve();
          else reject(new Error("ffmpeg exited with code " + code));
        });
      });
    }

    try {
      const hasFfmpeg = await ffmpegAvailable();
      if (!hasFfmpeg) {
        console.warn(
          "ffmpeg not found on PATH — skipping MP4 conversion. Install ffmpeg to enable automatic conversion."
        );
      } else {
        console.log("Converting WebM -> MP4:", friendlyPath, "->", friendlyMp4);
        try {
          await runFfmpeg(friendlyPath, friendlyMp4);
          console.log("Created MP4 copy at:", friendlyMp4);
        } catch (convErr) {
          console.error(
            "ffmpeg conversion failed:",
            convErr.message || convErr
          );
        }
      }
    } catch (e) {
      console.error("Error while attempting ffmpeg conversion:", e);
    }
  } catch (err) {
    console.error("Error recording demo:", err);
  } finally {
    try {
      await context.close();
    } catch (e) {}
    try {
      await browser.close();
    } catch (e) {}
  }
})();
