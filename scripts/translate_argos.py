#!/usr/bin/env python3
"""
scripts/translate_argos.py
Simple build-time translator using Argos Translate to convert en.json -> ja.json
Usage: python scripts/translate_argos.py i18n/en.json locales/ja.json

Note: Argos Translate models must be installed. This script will attempt to
install the en->ja package automatically if missing.
"""
import sys
import json
import os

try:
    import argostranslate.package
    import argostranslate.translate
except Exception as e:
    print("Argos Translate not installed. Please pip install argostranslate")
    raise


def ensure_model_installed():
    # Search for en->ja package; if not present, attempt to download known package
    installed = argostranslate.translate.get_installed_languages()
    pairs = [(l.code, r.code) for l in installed for r in installed]
    if ("en", "ja") in pairs:
        return True
    print("No en->ja model installed. Attempting to install a package (requires internet)...")
    # Note: Proper way is to download a .argosmodel file and install it.
    # Argos provides packages, but we can't guarantee the precise URL here.
    # We'll prompt the user to install manually.
    print("Please install a model manually. Example:")
    print("  pip install argostranslate")
    print("  python -m argostranslate.download --from-lang en --to-lang ja")
    return False


def translate_file(src_path, dst_path):
    with open(src_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    entries = list(data.items())
    translated = {}

    installed_languages = argostranslate.translate.get_installed_languages()
    from_lang = next((l for l in installed_languages if l.code == "en"), None)
    to_lang = next((l for l in installed_languages if l.code == "ja"), None)
    if not from_lang or not to_lang:
        raise RuntimeError("en->ja model not installed. See script comments.")

    for key, text in entries:
        # skip empty strings
        if not isinstance(text, str) or text.strip() == "":
            translated[key] = text
            continue
        try:
            translated_text = from_lang.translate(text, to_lang)
            translated[key] = translated_text
            print(f"Translated: {key}")
        except Exception as e:
            print(f"Failed to translate key {key}: {e}")
            translated[key] = text

    os.makedirs(os.path.dirname(dst_path), exist_ok=True)
    with open(dst_path, "w", encoding="utf-8") as f:
        json.dump(translated, f, ensure_ascii=False, indent=2)


if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python scripts/translate_argos.py i18n/en.json locales/ja.json")
        sys.exit(2)
    src, dst = sys.argv[1], sys.argv[2]
    if not ensure_model_installed():
        print("Model not installed. Exiting.")
        sys.exit(1)
    translate_file(src, dst)
    print("Done. Wrote", dst)
