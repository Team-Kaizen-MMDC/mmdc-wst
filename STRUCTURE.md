# Folder Structure Documentation

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)

**Documentation Policy:**

- Do NOT use emojis in any documentation files, including README, STRUCTURE, and Copilot instructions.

# Folder Structure Documentation

This document outlines the folder structure and organization of the Japan SSW project.

## Root Directory

- `index.html` - Main homepage entry point
- `README.md` - Project documentation
- `.gitignore` - Git ignore configuration

## Folders

### `/pages/`

Contains all additional HTML pages:

- `about.html` - About page
- `services.html` - Services page
- `contact.html` - Contact page with form

### `/assets/`

Static assets organized by type:

#### `/assets/css/`

- `main.css` - Primary stylesheet with variables and base styles
- `components.css` - Reusable component styles
- `utilities.css` - Utility classes and helpers

#### `/assets/js/`

- `main.js` - JavaScript entry point and initialization
- `/modules/` - Modular JavaScript files
  - `navigation.js` - Navigation and scroll behavior
  - `forms.js` - Form validation and submission
  - `utils.js` - Utility functions and helpers
  - `animations.js` - Animation controls and effects

#### `/assets/images/`

Image assets (empty - ready for project images)

#### `/assets/icons/`

Icons and favicons (empty - ready for project icons)

#### `/assets/fonts/`

Custom fonts (empty - ready for custom fonts)

### `/components/`

Reusable HTML components (empty - ready for component templates)

### `/.github/`

GitHub configuration:

- `copilot_instructions.md` - Development guidelines and best practices

## File Naming Conventions

- HTML files: lowercase with hyphens (e.g., `contact-form.html`)
- CSS files: lowercase with hyphens (e.g., `main.css`)
- JavaScript files: camelCase for modules (e.g., `navigationController.js`)
- Image files: lowercase with hyphens (e.g., `hero-image.jpg`)
- Component files: PascalCase (e.g., `ContactForm.html`)

## Asset Organization Guidelines

1. Keep related assets grouped together
2. Use descriptive file names
3. Maintain consistent naming conventions
4. Organize by feature or page when the project grows
5. Keep the root directory clean with only essential files
