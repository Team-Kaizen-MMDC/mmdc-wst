# Website Demo Video

This directory contains the demo video for the Japan SSW website.

## Video Details

- **Resolution**: 1920x1080 (1080p)
- **Format**: WebM
- **Features**:
  - ✨ Slow motion interactions (500ms delay)
  - 🎯 Click highlights with pulse animations
  - 📱 Responsive design demonstration (desktop + mobile)
  - 🎬 Smooth scrolling animations

## Demo Walkthrough

The demo video showcases a complete end-to-end user journey:

### Homepage & Navigation

1. **Hero Section** - Landing page with video background
2. **Jobs Section** - Latest job listings with interactive cards
3. **Job Detail Page** - Navigation to a specific job posting
4. **Companies Section** - Grid of top hiring companies
5. **Company Detail Page** - Individual company profile
6. **RSO Section** - Registered Support Organization information
7. **About Section** - Company background and mission
8. **Newsletter Signup** - Interactive email subscription form with toast notification
9. **Footer** - Complete footer with links and information

### User Registration & Authentication

10. **Create Account Page** - Complete signup form with:
    - Email validation
    - Password entry with visibility toggle
    - Password confirmation
    - Privacy policy acceptance
11. **Sign In Page** - Login form demonstration with:
    - Email and password fields
    - Form submission

### Additional Pages

12. **Services Page** - Overview of available services
13. **About Page** - Detailed company information
14. **Contact Page** - Contact form with:
    - Name and email fields
    - Message textarea
    - Form submission

### Final Touch

15. **Return to Homepage** - Smooth navigation back to the landing page

## Recording Script

The video is generated using the `record-demo.js` script, which uses Playwright for browser automation and recording.

### Running the Script

```bash
# Install dependencies (if not already done)
npm install

# Install Playwright browsers
npx playwright install chromium

# Record a new demo video
node record-demo.js
```

### Customization

You can modify the `record-demo.js` file to:

- Adjust slow motion speed (change `slowMo` value)
- Change video resolution
- Add or remove sections to showcase
- Modify animation timing

## Video Location

The generated video will be saved in this directory with a timestamp-based filename, which can be renamed for easier identification.
