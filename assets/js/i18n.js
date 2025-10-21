// assets/js/i18n.js
// Lightweight i18n loader for static sites (works with GitHub Pages)
// Usage: place data-i18n="key" on elements you want translated and
// generate /locales/{lang}.json files at build time (e.g., ja.json).

export class I18n {
  static STORAGE_KEY = "preferred_language";
  static DEFAULT_LANG = "en";

  constructor() {
    this.translations = Object.create(null);
    this.current = this.getCurrentLanguage();
    // Keep a copy of the original (default) English text for each key so
    // we can restore English without fetching a locale file.
    this.defaultTexts = Object.create(null);
  }

  getCurrentLanguage() {
    try {
      return localStorage.getItem(I18n.STORAGE_KEY) || I18n.DEFAULT_LANG;
    } catch (e) {
      return I18n.DEFAULT_LANG;
    }
  }

  async loadLocale(lang) {
    if (!lang || lang === I18n.DEFAULT_LANG) return;
    // Only load once
    if (this.translations[lang]) return this.translations[lang];

    try {
      // Try a few likely relative locations for locale files. Some pages
      // are nested under `pages/` and some locale files were placed under
      // `locales/` while others are under `i18n/` (historical). Try both.
      const candidates = [
        `../../locales/${lang}.json`,
        `../../i18n/${lang}.json`,
        `./locales/${lang}.json`,
        `./i18n/${lang}.json`,
      ];

      let res = null;
      for (const candidate of candidates) {
        try {
          const url = new URL(candidate, import.meta.url);
          res = await fetch(url.href);
          if (res && res.ok) break;
        } catch (e) {
          // ignore and try next
        }
      }

      // Last-resort: try absolute paths (project root). These will only work
      // if the site is served from the repository root (not a subpath).
      if ((!res || !res.ok) && typeof location !== "undefined") {
        const absCandidates = [`/locales/${lang}.json`, `/i18n/${lang}.json`];
        for (const c of absCandidates) {
          try {
            const r = await fetch(c);
            if (r && r.ok) {
              res = r;
              break;
            }
          } catch (e) {
            // ignore
          }
        }
      }

      if (!res || !res.ok) {
        console.warn(
          `i18n: locale ${lang} not found (tried multiple locations)`
        );
        return null;
      }

      const json = await res.json();
      this.translations[lang] = json;
      return json;
    } catch (err) {
      console.error("i18n: failed to load locale", err);
      return null;
    }
  }

  setLanguage(lang) {
    try {
      localStorage.setItem(I18n.STORAGE_KEY, lang);
    } catch (e) {
      /* ignore */
    }
    this.current = lang || I18n.DEFAULT_LANG;
    document.documentElement.lang = this.current;
    return this.updatePageContent();
  }

  translate(key) {
    // If we're on the default language and have stored default texts,
    // prefer those so switching back to English restores the original
    // content written in the HTML instead of replacing with keys.
    if (this.current === I18n.DEFAULT_LANG) {
      return this.defaultTexts[key] || key;
    }

    // Prefer the loaded translation for the current language. If the
    // translations are missing (locale failed to load) or the specific key
    // is not present, fall back to the captured default English text so the
    // page shows readable content instead of exposing the i18n key itself.
    const langMap = this.translations[this.current];
    if (langMap && typeof langMap[key] !== "undefined") {
      return langMap[key];
    }

    // fallback to original English text if available
    if (this.defaultTexts[key]) return this.defaultTexts[key];

    // last resort: return the key so callers still get a string
    return key;
  }

  updatePageContent() {
    // Translate elements that have data-i18n
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      if (!key) return;
      const text = this.translate(key);
      if (text != null) el.textContent = text;
    });

    // Translate placeholders or aria-labels when present
    document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
      const key = el.getAttribute("data-i18n-placeholder");
      if (!key) return;
      const text = this.translate(key);
      if (text != null && "placeholder" in el) el.placeholder = text;
    });

    document.querySelectorAll("[data-i18n-attr]").forEach((el) => {
      // Usage: data-i18n-attr="title:nav.home,aria-label:nav.home"
      const map = el.getAttribute("data-i18n-attr");
      if (!map) return;
      map.split(",").forEach((pair) => {
        const [attr, key] = pair.split(":").map((s) => s && s.trim());
        if (!attr || !key) return;
        const text = this.translate(key);
        if (text != null) el.setAttribute(attr, text);
      });
    });
  }

  async init() {
    // Load stored language if it's not the default
    // Capture the current DOM text for elements with data-i18n so we can
    // restore English without needing an extra fetch for en.json.
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      if (!key) return;
      // Preserve the initial text content as the default English string.
      this.defaultTexts[key] =
        el.textContent != null ? el.textContent.trim() : "";
    });

    const lang = this.getCurrentLanguage();
    if (lang && lang !== I18n.DEFAULT_LANG) {
      await this.loadLocale(lang);
      this.updatePageContent();
      document.documentElement.lang = lang;
    }
  }
}

export default I18n;
