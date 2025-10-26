# Bootstrap-Compatible Animation Utilities

## Overview

A lightweight animation system that works seamlessly with Bootstrap 5, providing easy-to-use CSS classes for animations without requiring additional libraries.

## Installation

### 1. CSS is already included in `assets/css/main.css`

### 2. Add the JavaScript file to your HTML (before closing `</body>`):

```html
<script src="assets/js/features/animations.js"></script>
```

## Usage

### Basic Animations (Page Load)

Simply add animation classes to your Bootstrap elements:

```html
<!-- Fade in from bottom -->
<div class="card animate-fade-in-up">
  <div class="card-body">...</div>
</div>

<!-- Scale up entrance -->
<div class="btn btn-primary animate-scale-up">Click me</div>

<!-- Slide in from left -->
<div class="alert animate-slide-in-left">Important message</div>
```

### Scroll-Triggered Animations

Add both the animation class AND `animate-on-scroll`:

```html
<!-- Animate when scrolled into view -->
<div class="card animate-fade-in-up animate-on-scroll">
  <div class="card-body">...</div>
</div>
```

### Staggered Animations (Sequential)

Combine animations with delay classes:

```html
<!-- Cards that appear one after another -->
<div class="row">
  <div class="col-md-4 animate-fade-in-up animate-delay-1 animate-both">
    Card 1
  </div>
  <div class="col-md-4 animate-fade-in-up animate-delay-2 animate-both">
    Card 2
  </div>
  <div class="col-md-4 animate-fade-in-up animate-delay-3 animate-both">
    Card 3
  </div>
</div>
```

### Hover Animations

Add interactive hover effects:

```html
<!-- Lift on hover -->
<div class="card animate-hover-lift">
  <div class="card-body">Hover me</div>
</div>

<!-- Scale on hover -->
<button class="btn btn-primary animate-hover-scale">Hover to scale</button>
```

## Available Animation Classes

### Entry Animations

- `animate-fade-in` - Simple fade in
- `animate-fade-in-up` - Fade in while moving up
- `animate-fade-in-down` - Fade in while moving down
- `animate-fade-in-left` - Fade in from left
- `animate-fade-in-right` - Fade in from right
- `animate-scale-up` - Scale up with fade
- `animate-scale-in` - Scale in with fade
- `animate-slide-in-left` - Slide in from left
- `animate-slide-in-right` - Slide in from right
- `animate-slide-up` - Slide up from bottom

### Hover Effects

- `animate-hover-lift` - Lift and add shadow on hover
- `animate-hover-scale` - Scale up slightly on hover

### Timing Modifiers

- `animate-delay-1` through `animate-delay-9` - Delays (0.1s - 0.9s)
- `animate-fast` - 0.4s duration
- `animate-normal` - 0.8s duration
- `animate-slow` - 1.2s duration

### Fill Mode Modifiers

- `animate-both` - Maintains start and end states
- `animate-forwards` - Maintains end state
- `animate-backwards` - Maintains start state

## Recommended Usage for Each Section

### 1. Job Listings Section

```html
<section id="jobs" class="py-5">
  <div class="container">
    <h2 class="animate-fade-in-down animate-on-scroll">Latest Jobs</h2>
    <div class="card animate-fade-in-up animate-on-scroll">
      <ul class="list-group list-group-flush">
        <li class="list-group-item animate-hover-lift">Job 1</li>
        <li class="list-group-item animate-hover-lift">Job 2</li>
      </ul>
    </div>
  </div>
</section>
```

### 2. Company Grid

```html
<section id="companies" class="py-5">
  <div class="container">
    <h2 class="animate-fade-in-down animate-on-scroll">Top Companies</h2>
    <div class="row g-4" id="companyGrid">
      <div class="col-md-4 animate-fade-in-up animate-on-scroll animate-both">
        <div class="card animate-hover-lift">...</div>
      </div>
      <!-- Stagger delay automatically applied by animations.js -->
    </div>
  </div>
</section>
```

### 3. RSO Card (Horizontal Card)

```html
<section class="py-5">
  <div class="container">
    <h2 class="animate-fade-in-down animate-on-scroll">RSO</h2>
    <div class="card animate-slide-in-left animate-on-scroll">
      <div class="row g-0">...</div>
    </div>
  </div>
</section>
```

### 4. About Us Card

```html
<section class="py-5">
  <div class="container">
    <h2 class="animate-fade-in-down animate-on-scroll">About Us</h2>
    <div class="card animate-slide-in-right animate-on-scroll">
      <div class="row g-0">...</div>
    </div>
  </div>
</section>
```

### 5. Alerts Band

```html
<section class="alerts-band animate-slide-up animate-on-scroll">
  <div class="container">...</div>
</section>
```

### 6. CTA Section

```html
<section class="section-padding animate-scale-up animate-on-scroll">
  <div class="container">
    <div class="feature-card">...</div>
  </div>
</section>
```

## JavaScript API

### Manual Initialization

```javascript
// Reinitialize scroll animations (if content is dynamically added)
window.AnimationController.initScrollAnimations();
```

### Add Custom Staggered Animations

```javascript
// Add stagger to specific elements
window.AnimationController.addStaggeredAnimation(
  "#myContainer", // Container selector
  ".item", // Child selector
  150 // Delay increment in ms
);
```

## Accessibility

All animations automatically respect the user's `prefers-reduced-motion` setting:

- Users who prefer reduced motion will see content immediately without animations
- No JavaScript intervention needed - handled in CSS and JS automatically

## Performance

- Uses GPU-accelerated transforms for smooth animations
- Intersection Observer API for efficient scroll detection
- One-time animations unobserve elements after animating
- Minimal JavaScript footprint (~2KB)

## Browser Support

- All modern browsers (Chrome, Firefox, Safari, Edge)
- Gracefully degrades in older browsers (content appears immediately)
- IE11: Falls back to immediate display (no animations)

## Examples

See `index.html` for live examples of all animation types.
