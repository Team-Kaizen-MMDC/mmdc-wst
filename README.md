# MMDC WST

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)

**Documentation Policy:**

- Do NOT use emojis in any documentation files, including README, STRUCTURE, and Copilot instructions.

# MMDC WST

A modern, responsive website built with HTML, CSS, JavaScript, and Bootstrap.

## Project Structure

```text
mmdc-wst/
├── index.html                 # Main homepage
├── pages/                     # Additional pages
│   ├── about.html
│   ├── services.html
│   └── contact.html
├── assets/                    # Static assets
│   ├── css/                   # Stylesheets
│   │   ├── main.css          # Main styles
│   │   ├── components.css    # Component-specific styles
│   │   └── utilities.css     # Utility classes
│   ├── js/                   # JavaScript files
│   │   ├── main.js          # Main JS entry point
│   │   └── modules/         # JS modules
│   │       ├── navigation.js
│   │       ├── forms.js
│   │       ├── utils.js
│   │       └── animations.js
│   ├── images/              # Image assets
│   ├── icons/               # Icons and favicons
│   └── fonts/               # Custom fonts
├── components/              # Reusable HTML components
├── .github/                 # GitHub configuration
│   └── copilot_instructions.md
└── README.md
```

## Features

- **Responsive Design**: Mobile-first approach with Bootstrap 5
- **Modern JavaScript**: ES6+ modules and best practices
- **Accessibility**: ARIA labels, semantic HTML, keyboard navigation
- **Performance**: Optimized images, lazy loading, minimal dependencies
- **SEO Friendly**: Proper meta tags and semantic structure
- **Form Handling**: Client-side validation and submission
- **Smooth Animations**: CSS and JavaScript animations with reduced motion support
- **Cross-browser Support**: Modern browser compatibility

## Technologies Used

- **HTML5**: Semantic markup and accessibility features
- **CSS3**: Custom properties, Grid, Flexbox, animations
- **JavaScript (ES6+)**: Modules, async/await, modern syntax
- **Bootstrap 5**: Responsive grid system and components
- **CDN Delivery**: Bootstrap and dependencies served via CDN

## Getting Started

### Prerequisites

- A modern web browser
- Local web server (for development)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/Team-Kaizen-MMDC/mmdc-wst.git
   cd mmdc-wst
   ```

2. Serve the files using a local web server:

   ```bash
   # Using Python 3
   python -m http.server 8000

   # Using Node.js (if you have http-server installed)
   npx http-server

   # Using PHP
   php -S localhost:8000
   ```

3. Open your browser and navigate to `http://localhost:8000`

### Development

The project follows a modular structure:

- **HTML Files**: Located in root and `pages/` directory
- **CSS**: Organized into main styles, components, and utilities
- **JavaScript**: Modular ES6+ code with separate concerns
- **Assets**: Images, icons, and fonts in respective directories

## File Organization

### CSS Architecture

- `main.css`: Core styles, variables, and base components
- `components.css`: Reusable component styles
- `utilities.css`: Utility classes and helper styles

### JavaScript Architecture

- `main.js`: Entry point and initialization
- `modules/navigation.js`: Navigation and scroll behavior
- `modules/forms.js`: Form validation and submission
- `modules/utils.js`: Utility functions and helpers
- `modules/animations.js`: Animation controls and effects

## Best Practices

This project follows modern frontend development best practices:

### HTML

- Semantic HTML5 elements
- Proper document structure
- Accessibility attributes (ARIA, alt text)
- SEO-friendly meta tags

### CSS

- Mobile-first responsive design
- CSS custom properties (variables)
- BEM naming convention
- Organized stylesheet structure
- Performance optimizations

### JavaScript

- ES6+ modern syntax
- Modular architecture
- Error handling
- Performance considerations
- Accessibility support

### Performance

- Optimized images
- Minimal HTTP requests
- CDN usage for external libraries
- Lazy loading implementation
- Efficient CSS and JavaScript

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Accessibility

This website is built with accessibility in mind:

- Semantic HTML structure
- ARIA labels and attributes
- Keyboard navigation support
- Color contrast compliance
- Screen reader compatibility
- Reduced motion preferences

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -m 'Add new feature'`)
4. Push to the branch (`git push origin feature/new-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Team

Built by **Team Kaizen MMDC**

## Support

For support and questions, please contact the development team or open an issue in the repository.

---

**Note**: This project uses CDN links for Bootstrap and other dependencies. For production use, consider downloading and hosting these files locally for better performance and reliability.

## CODEOWNERS

This repository uses a CODEOWNERS file to define code ownership and review responsibilities. See `.github/CODEOWNERS` for details. All changes to protected branches require review and approval from code owners.

## Branching Strategy & Workflow

For this project, we use only the `main` branch for all development and releases, as we are a small team of 4 developers. All feature, bugfix, hotfix, and release branches should be merged directly into `main` via pull requests.

- **Main Branch:**
  - `main`: Stable production-ready code and all development
- **Feature Branches:**
  - Prefix with `feature/` (e.g., `feature/website_scaffolding`)
- **Bugfix Branches:**
  - Prefix with `bugfix/` (e.g., `bugfix/navbar-responsive`)
- **Hotfix Branches:**
  - Prefix with `hotfix/` (e.g., `hotfix/critical-issue`)
- **Release Branches:**
  - Prefix with `release/` (e.g., `release/v1.0.0`)

### Branch Naming Best Practices

- Use lowercase and hyphens for readability (e.g., `feature/user-authentication`)
- Be descriptive and concise
- Avoid using personal names or ambiguous terms
- Use prefixes: `feature/`, `bugfix/`, `hotfix/`, `release/`

### Pull Request (PR) Review Guidelines

- Always submit PRs against `main`
- Provide a clear, descriptive title and summary
- Reference related issues (e.g., `Fixes #123`)
- Request review from code owners
- Address all review comments before merging
- Use squash and merge for a clean history
- Ensure all tests and checks pass before merging
