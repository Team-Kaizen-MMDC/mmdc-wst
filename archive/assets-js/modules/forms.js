/* archived: assets/js/modules/forms.js */

// Original file archived on 2025-09-17

/*
	assets/js/modules/forms.js

	FormHandler module (Phase 2):
		- Handles client-side validation and submission flows.
		- Present as a Phase 2 placeholder. JS is disabled in Phase 1; enable
			with the commented script tags in HTML during Phase 2.
*/

// ===================================================================
// Form Handler Module
// ===================================================================

export const FormHandler = {
  // Configuration
  config: {
    submitClass: "form-submitted",
    loadingClass: "loading",
    errorClass: "is-invalid",
    successClass: "is-valid",
  },

  // Initialize form handlers
  init() {
    this.bindEvents();
    this.setupValidation();
    console.log("Form handler module initialized");
  },

  // Bind form events
  bindEvents() {
    // Handle all form submissions
    const forms = document.querySelectorAll("form");
    forms.forEach((form) => {
      form.addEventListener("submit", this.handleSubmit.bind(this));
    });

    // Real-time validation
    const inputs = document.querySelectorAll("input, textarea, select");
    inputs.forEach((input) => {
      input.addEventListener("blur", this.validateField.bind(this));
      input.addEventListener("input", this.clearValidation.bind(this));
    });
  },

  // Handle form submission
  async handleSubmit(event) {
    event.preventDefault();

    const form = event.target;
    const submitButton = form.querySelector('button[type="submit"]');

    // Validate form before submission
    if (!this.validateForm(form)) {
      this.showFormError(form, "Please correct the errors below.");
      return;
    }

    try {
      // Show loading state
      this.setLoadingState(submitButton, true);

      // Get form data
      const formData = new FormData(form);
      const data = Object.fromEntries(formData.entries());

      // Simulate API call (replace with actual endpoint)
      const response = await this.submitForm(data, form);

      if (response.success) {
        this.handleSuccess(form, response.message);
      } else {
        this.handleError(form, response.message);
      }
    } catch (error) {
      console.error("Form submission error:", error);
      this.handleError(form, "An error occurred. Please try again.");
    } finally {
      // Remove loading state
      this.setLoadingState(submitButton, false);
    }
  },

  // Validate entire form
  validateForm(form) {
    let isValid = true;
    const fields = form.querySelectorAll("input, textarea, select");

    fields.forEach((field) => {
      if (!this.validateField({ target: field })) {
        isValid = false;
      }
    });

    return isValid;
  },

  // Validate individual field
  validateField(event) {
    const field = event.target;
    const value = field.value.trim();
    const type = field.type;
    const required = field.required;

    // Clear previous validation
    this.clearValidation(event);

    let isValid = true;
    let errorMessage = "";

    // Required field validation
    if (required && !value) {
      isValid = false;
      errorMessage = "This field is required.";
    }

    // Type-specific validation
    if (value && isValid) {
      switch (type) {
        case "email":
          isValid = this.validateEmail(value);
          errorMessage = isValid ? "" : "Please enter a valid email address.";
          break;

        case "tel":
          isValid = this.validatePhone(value);
          errorMessage = isValid ? "" : "Please enter a valid phone number.";
          break;

        case "url":
          isValid = this.validateUrl(value);
          errorMessage = isValid ? "" : "Please enter a valid URL.";
          break;
      }
    }

    // Custom validation for specific fields
    if (field.id === "password") {
      isValid = this.validatePassword(value);
      errorMessage = isValid
        ? ""
        : "Password must be at least 8 characters long.";
    }

    // Apply validation result
    if (isValid) {
      field.classList.add(this.config.successClass);
      field.classList.remove(this.config.errorClass);
    } else {
      field.classList.add(this.config.errorClass);
      field.classList.remove(this.config.successClass);
      this.showFieldError(field, errorMessage);
    }

    return isValid;
  },

  // Clear field validation
  clearValidation(event) {
    const field = event.target;
    field.classList.remove(this.config.errorClass, this.config.successClass);
    this.hideFieldError(field);
  },

  // Email validation
  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Phone validation
  validatePhone(phone) {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/\s/g, ""));
  },

  // URL validation
  validateUrl(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },

  // Password validation
  validatePassword(password) {
    return password.length >= 8;
  },

  // Submit form (replace with actual API call)
  async submitForm(data, form) {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Simulate response based on form action or data
    return {
      success: true,
      message: "Thank you! Your message has been sent successfully.",
    };
  },

  // Set loading state
  setLoadingState(button, isLoading) {
    if (!button) return;

    if (isLoading) {
      button.disabled = true;
      button.innerHTML = '<span class="loading-spinner"></span> Sending...';
      button.classList.add(this.config.loadingClass);
    } else {
      button.disabled = false;
      button.innerHTML = "Send Message";
      button.classList.remove(this.config.loadingClass);
    }
  },

  // Handle successful submission
  handleSuccess(form, message) {
    form.classList.add(this.config.submitClass);
    form.reset();

    // Clear all validation classes
    const fields = form.querySelectorAll("input, textarea, select");
    fields.forEach((field) => {
      field.classList.remove(this.config.errorClass, this.config.successClass);
    });

    this.showFormSuccess(form, message);
  },

  // Handle submission error
  handleError(form, message) {
    this.showFormError(form, message);
  },

  // Show form success message
  showFormSuccess(form, message) {
    this.removeFormMessages(form);

    const successAlert = document.createElement("div");
    successAlert.className =
      "alert alert-success alert-dismissible fade show mt-3";
    successAlert.innerHTML = `
						${message}
						<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
				`;

    form.appendChild(successAlert);
  },

  // Show form error message
  showFormError(form, message) {
    this.removeFormMessages(form);

    const errorAlert = document.createElement("div");
    errorAlert.className =
      "alert alert-danger alert-dismissible fade show mt-3";
    errorAlert.innerHTML = `
						${message}
						<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
				`;

    form.appendChild(errorAlert);
  },

  // Show field error message
  showFieldError(field, message) {
    this.hideFieldError(field);

    const errorDiv = document.createElement("div");
    errorDiv.className = "invalid-feedback";
    errorDiv.textContent = message;

    field.parentNode.appendChild(errorDiv);
  },

  // Hide field error message
  hideFieldError(field) {
    const errorDiv = field.parentNode.querySelector(".invalid-feedback");
    if (errorDiv) {
      errorDiv.remove();
    }
  },

  // Remove all form messages
  removeFormMessages(form) {
    const alerts = form.querySelectorAll(".alert");
    alerts.forEach((alert) => alert.remove());
  },

  // Setup additional validation
  setupValidation() {
    // Add custom validation patterns if needed
    console.log("Form validation setup complete");
  },
};
