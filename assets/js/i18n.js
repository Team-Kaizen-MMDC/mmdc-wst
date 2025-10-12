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
      // Resolve locale path relative to this module so the loader works when
      // the site is hosted from a subpath (GitHub Pages project pages).
      // Example: if the site is served at /mmdc-wst/, an absolute '/locales'
      // would incorrectly request '/locales/...'. Using import.meta.url keeps
      // the request relative to the bundled JS location.
      let res = null;
      try {
        const url = new URL(`../../locales/${lang}.json`, import.meta.url);
        res = await fetch(url.href);
      } catch (e) {
        // If import.meta.url isn't available or the URL failed, fall back to
        // the absolute `/locales/...` path as a last resort.
        try {
          res = await fetch(`/locales/${lang}.json`);
        } catch (err) {
          console.warn("i18n: fallback locale fetch also failed", err);
          return null;
        }
      }
      if (!res.ok) {
        console.warn(`i18n: locale ${lang} not found (HTTP ${res.status})`);
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

    return (
      (this.translations[this.current] &&
        this.translations[this.current][key]) ||
      key
    );
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
